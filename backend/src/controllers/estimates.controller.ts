import { Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { db, storage, Timestamp } from '../config/firebase';
import { AuthRequest } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';
import { WorkType, AreaSize, SoilType } from '../types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

async function fetchImageAsBase64(url: string): Promise<{ data: string; mimeType: string } | null> {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!response.ok) return null;
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const mimeType = contentType.split(';')[0].trim();
    if (!mimeType.startsWith('image/')) return null;
    const buffer = await response.arrayBuffer();
    const data = Buffer.from(buffer).toString('base64');
    return { data, mimeType };
  } catch {
    return null;
  }
}

async function calculateEstimateWithGemini(
  workType: WorkType,
  areaSize: AreaSize,
  soilType: SoilType,
  machineCategory: string | null,
  photoUrls: string[]
): Promise<{ minHours: number; maxHours: number; minCost: number; maxCost: number; aiInsight: string }> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const realPhotos = photoUrls.filter(u => u.startsWith('http'));
    const hasPhotos = realPhotos.length > 0;

    const prompt = `You are an expert heavy equipment estimator in India.${hasPhotos ? ' Analyze the provided work site photo(s) along with the job details below to give a realistic estimate.' : ' Use the job details below to provide a realistic estimate.'}

Job Details:
- Work Type: ${workType} (excavation / leveling / trenching / foundation / debris_removal)
- Area Size: ${areaSize} (small = under 500 sqft, medium = 500-2000 sqft, large = over 2000 sqft)
- Soil Type: ${soilType} (soft / mixed / hard_rocky / not_sure)
- Machine Category: ${machineCategory || 'JCB (default)'}${hasPhotos ? `\n- Site photos attached: ${realPhotos.length} photo(s) — use visual cues from the photos to refine the estimate` : ''}

Indian market context:
- JCB/Backhoe loader: avg ₹1,200-1,500/hour
- Excavator: avg ₹1,800-2,500/hour
- Crane: avg ₹2,500-3,500/hour
- Bulldozer: avg ₹2,000-3,000/hour
- Roller: avg ₹1,000-1,500/hour

Respond ONLY with a valid JSON object, no markdown, no explanation:
{
  "minHours": <number>,
  "maxHours": <number>,
  "minCost": <number in INR>,
  "maxCost": <number in INR>,
  "aiInsight": "<one sentence explaining key factors from the site photos and inputs that affect this estimate>"
}`;

    // Build parts array: text first, then images
    type GeminiPart = { text: string } | { inlineData: { data: string; mimeType: string } };
    const parts: GeminiPart[] = [{ text: prompt }];

    // Attach up to 3 real photos for visual analysis
    for (const url of realPhotos.slice(0, 3)) {
      const img = await fetchImageAsBase64(url);
      if (img) parts.push({ inlineData: img });
    }

    const result = await model.generateContent(parts as Parameters<typeof model.generateContent>[0]);
    const text = result.response.text().trim();
    const cleaned = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    return {
      minHours: Math.round(parsed.minHours),
      maxHours: Math.round(parsed.maxHours),
      minCost: Math.round(parsed.minCost),
      maxCost: Math.round(parsed.maxCost),
      aiInsight: parsed.aiInsight || '',
    };
  } catch {
    // Fallback to rule-based if Gemini fails
    return calculateFallbackEstimate(workType, areaSize, soilType);
  }
}

function calculateFallbackEstimate(workType: WorkType, areaSize: AreaSize, soilType: SoilType) {
  const baseHours: Record<WorkType, [number, number]> = {
    excavation: [4, 8],
    leveling: [3, 6],
    trenching: [2, 5],
    foundation: [6, 12],
    debris_removal: [2, 4],
  };
  const areaMultiplier: Record<AreaSize, number> = { small: 1.0, medium: 1.8, large: 3.0 };
  const soilMultiplier: Record<SoilType, number> = { soft: 1.0, mixed: 1.3, hard_rocky: 1.8, not_sure: 1.4 };

  const [minBase, maxBase] = baseHours[workType];
  const minHours = Math.round(minBase * areaMultiplier[areaSize] * soilMultiplier[soilType]);
  const maxHours = Math.round(maxBase * areaMultiplier[areaSize] * soilMultiplier[soilType]);
  const avgHourlyRate = 1200;

  return { minHours, maxHours, minCost: minHours * avgHourlyRate, maxCost: maxHours * avgHourlyRate, aiInsight: '' };
}

export const createEstimate = async (req: AuthRequest, res: Response) => {
  try {
    const { uid } = req.user!;
    const { workType, areaSize, soilType, machineCategory } = req.body;

    // Upload photos
    const photoUrls: string[] = [];
    if (req.files && Array.isArray(req.files)) {
      const bucket = storage.bucket();
      for (const file of req.files) {
        const fileName = `estimates/${uid}/${uuidv4()}-${file.originalname}`;
        const blob = bucket.file(fileName);
        await blob.save(file.buffer, { contentType: file.mimetype, public: true });
        photoUrls.push(`https://storage.googleapis.com/${bucket.name}/${fileName}`);
      }
    }

    if (photoUrls.length === 0 && (!req.body.photoUrls || req.body.photoUrls.length === 0)) {
      res.status(400).json({ error: 'At least one work site photo is required' });
      return;
    }

    const allPhotos = [...photoUrls, ...(req.body.photoUrls || [])];
    const { minHours, maxHours, minCost, maxCost, aiInsight } = await calculateEstimateWithGemini(
      workType, areaSize, soilType, machineCategory || null, allPhotos
    );

    const estimateId = uuidv4();
    const estimate = {
      id: estimateId,
      customerId: uid,
      photoUrls: allPhotos,
      workType,
      areaSize,
      soilType,
      machineCategory: machineCategory || null,
      estimatedTimeHoursMin: minHours,
      estimatedTimeHoursMax: maxHours,
      estimatedCostMin: minCost,
      estimatedCostMax: maxCost,
      aiInsight: aiInsight || null,
      disclaimer: 'This is an AI-powered estimate. Actual time and cost may vary based on site conditions, machine availability, and other factors.',
      createdAt: Timestamp.now(),
    };

    await db.collection('estimates').doc(estimateId).set(estimate);
    res.status(201).json({ estimate });
  } catch {
    res.status(500).json({ error: 'Failed to create estimate' });
  }
};

export const getEstimate = async (req: AuthRequest, res: Response) => {
  try {
    const doc = await db.collection('estimates').doc(req.params.id).get();
    if (!doc.exists) {
      res.status(404).json({ error: 'Estimate not found' });
      return;
    }

    const estimate = doc.data()!;
    if (estimate.customerId !== req.user!.uid && req.user!.role !== 'admin') {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    res.json({ estimate });
  } catch {
    res.status(500).json({ error: 'Failed to fetch estimate' });
  }
};

export const getCustomerEstimates = async (req: AuthRequest, res: Response) => {
  try {
    const snapshot = await db.collection('estimates')
      .where('customerId', '==', req.user!.uid)
      .orderBy('createdAt', 'desc')
      .get();
    res.json({ estimates: snapshot.docs.map(doc => doc.data()) });
  } catch {
    res.status(500).json({ error: 'Failed to fetch estimates' });
  }
};
