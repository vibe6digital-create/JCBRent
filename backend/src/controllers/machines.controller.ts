import { Request, Response } from 'express';
import { db, storage, Timestamp } from '../config/firebase';
import { AuthRequest } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';

function serializeMachine(data: any): any {
  const result = { ...data };
  if (result.createdAt && typeof result.createdAt === 'object' && '_seconds' in result.createdAt) {
    result.createdAt = new Date(result.createdAt._seconds * 1000).toISOString().split('T')[0];
  } else if (result.createdAt?.toDate) {
    result.createdAt = result.createdAt.toDate().toISOString().split('T')[0];
  }
  if (result.updatedAt && typeof result.updatedAt === 'object' && '_seconds' in result.updatedAt) {
    result.updatedAt = new Date(result.updatedAt._seconds * 1000).toISOString().split('T')[0];
  } else if (result.updatedAt?.toDate) {
    result.updatedAt = result.updatedAt.toDate().toISOString().split('T')[0];
  }
  return result;
}

export const createMachine = async (req: AuthRequest, res: Response) => {
  try {
    const { uid } = req.user!;
    const { category, model, description, hourlyRate, dailyRate, weeklyRate, monthlyRate, machineYear, location, serviceAreas } = req.body;

    const userDoc = await db.collection('users').doc(uid).get();
    const vendorName = userDoc.data()?.name || '';

    const imageUrls: string[] = [];
    if (req.files && Array.isArray(req.files)) {
      const bucket = storage.bucket();
      for (const file of req.files) {
        const fileName = `machines/${uid}/${uuidv4()}-${file.originalname}`;
        const blob = bucket.file(fileName);
        await blob.save(file.buffer, { contentType: file.mimetype, public: true });
        imageUrls.push(`https://storage.googleapis.com/${bucket.name}/${fileName}`);
      }
    }

    const machineId = uuidv4();
    const machine = {
      id: machineId,
      vendorId: uid,
      vendorName,
      category,
      model,
      description: description || '',
      hourlyRate: Number(hourlyRate),
      dailyRate: Number(dailyRate),
      images: imageUrls,
      location: typeof location === 'string' ? JSON.parse(location) : location,
      serviceAreas: typeof serviceAreas === 'string' ? JSON.parse(serviceAreas) : serviceAreas || [],
      ...(machineYear ? { machineYear: Number(machineYear) } : {}),
      isAvailable: true,
      approvalStatus: 'pending' as const,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    await db.collection('machines').doc(machineId).set(machine);
    res.status(201).json({ machine: serializeMachine(machine) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create machine listing' });
  }
};

export const getMachines = async (req: Request, res: Response) => {
  try {
    const { city, category, minPrice, maxPrice, sortBy } = req.query;
    let query: FirebaseFirestore.Query = db.collection('machines')
      .where('approvalStatus', '==', 'approved')
      .where('isAvailable', '==', true);

    if (city) {
      query = query.where('location.city', '==', city);
    }
    if (category) {
      query = query.where('category', '==', category);
    }

    const snapshot = await query.get();
    let machines = snapshot.docs.map(doc => doc.data());

    if (minPrice) {
      machines = machines.filter(m => m.hourlyRate >= Number(minPrice));
    }
    if (maxPrice) {
      machines = machines.filter(m => m.hourlyRate <= Number(maxPrice));
    }

    if (sortBy === 'price_asc') {
      machines.sort((a, b) => a.hourlyRate - b.hourlyRate);
    } else if (sortBy === 'price_desc') {
      machines.sort((a, b) => b.hourlyRate - a.hourlyRate);
    }

    res.json({ machines: machines.map(serializeMachine), count: machines.length });
  } catch {
    res.status(500).json({ error: 'Failed to fetch machines' });
  }
};

export const getMachineById = async (req: Request, res: Response) => {
  try {
    const doc = await db.collection('machines').doc(req.params.id).get();
    if (!doc.exists) {
      res.status(404).json({ error: 'Machine not found' });
      return;
    }
    res.json({ machine: serializeMachine(doc.data()) });
  } catch {
    res.status(500).json({ error: 'Failed to fetch machine' });
  }
};

export const updateMachine = async (req: AuthRequest, res: Response) => {
  try {
    const machineRef = db.collection('machines').doc(req.params.id);
    const machineDoc = await machineRef.get();

    if (!machineDoc.exists) {
      res.status(404).json({ error: 'Machine not found' });
      return;
    }
    if (machineDoc.data()?.vendorId !== req.user!.uid && req.user!.role !== 'admin') {
      res.status(403).json({ error: 'Not authorized to update this machine' });
      return;
    }

    const updates = { ...req.body, updatedAt: Timestamp.now() };
    delete updates.id;
    delete updates.vendorId;

    await machineRef.update(updates);
    const updated = await machineRef.get();
    res.json({ machine: updated.data() });
  } catch {
    res.status(500).json({ error: 'Failed to update machine' });
  }
};

export const deleteMachine = async (req: AuthRequest, res: Response) => {
  try {
    const machineRef = db.collection('machines').doc(req.params.id);
    const machineDoc = await machineRef.get();

    if (!machineDoc.exists) {
      res.status(404).json({ error: 'Machine not found' });
      return;
    }
    if (machineDoc.data()?.vendorId !== req.user!.uid && req.user!.role !== 'admin') {
      res.status(403).json({ error: 'Not authorized to delete this machine' });
      return;
    }

    await machineRef.delete();
    res.json({ message: 'Machine deleted successfully' });
  } catch {
    res.status(500).json({ error: 'Failed to delete machine' });
  }
};

export const getVendorMachines = async (req: AuthRequest, res: Response) => {
  try {
    const snapshot = await db.collection('machines')
      .where('vendorId', '==', req.user!.uid)
      .get();
    const machines = snapshot.docs.map(doc => serializeMachine(doc.data()));
    res.json({ machines, count: machines.length });
  } catch {
    res.status(500).json({ error: 'Failed to fetch vendor machines' });
  }
};

export const reportMachine = async (req: AuthRequest, res: Response) => {
  try {
    const { uid } = req.user!;
    const { id } = req.params;
    const { reason, details } = req.body;

    const machineDoc = await db.collection('machines').doc(id).get();
    if (!machineDoc.exists) { res.status(404).json({ error: 'Machine not found' }); return; }
    const machine = machineDoc.data()!;

    const userDoc = await db.collection('users').doc(uid).get();
    const reporterName = userDoc.data()?.name || 'Unknown';

    const reportId = uuidv4();
    await db.collection('machineReports').doc(reportId).set({
      id: reportId,
      machineId: id,
      machineModel: machine.model,
      machineCategory: machine.category,
      vendorId: machine.vendorId,
      vendorName: machine.vendorName,
      reporterId: uid,
      reporterName,
      reason: reason || 'other',
      details: details || '',
      status: 'pending',
      createdAt: Timestamp.now(),
    });
    res.status(201).json({ message: 'Report submitted', reportId });
  } catch {
    res.status(500).json({ error: 'Failed to submit report' });
  }
};

export const getMachineReviews = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const snap = await db.collection('bookings')
      .where('machineId', '==', id)
      .where('status', '==', 'completed')
      .get();

    const reviews = snap.docs
      .map(d => d.data())
      .filter(b => b.rating != null && b.rating > 0)
      .map(b => ({
        id: b.id,
        customerName: b.customerName || 'Customer',
        rating: b.rating as number,
        review: b.review || '',
        createdAt: b.updatedAt
          ? (typeof b.updatedAt === 'object' && '_seconds' in b.updatedAt
              ? new Date(b.updatedAt._seconds * 1000).toISOString()
              : b.updatedAt?.toDate?.().toISOString() ?? '')
          : '',
      }))
      .sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));

    const avgRating = reviews.length
      ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
      : null;

    res.json({ reviews, avgRating, reviewCount: reviews.length });
  } catch {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
};

export const toggleAvailability = async (req: AuthRequest, res: Response) => {
  try {
    const machineRef = db.collection('machines').doc(req.params.id);
    const machineDoc = await machineRef.get();
    if (!machineDoc.exists) { res.status(404).json({ error: 'Machine not found' }); return; }
    if (machineDoc.data()?.vendorId !== req.user!.uid) { res.status(403).json({ error: 'Not authorized' }); return; }
    const { isAvailable } = req.body;
    await machineRef.update({ isAvailable: !!isAvailable, updatedAt: Timestamp.now() });
    res.json({ isAvailable: !!isAvailable });
  } catch {
    res.status(500).json({ error: 'Failed to update availability' });
  }
};
