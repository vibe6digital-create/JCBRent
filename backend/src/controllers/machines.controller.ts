import { Request, Response } from 'express';
import { db, storage, Timestamp } from '../config/firebase';
import { AuthRequest } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';

export const createMachine = async (req: AuthRequest, res: Response) => {
  try {
    const { uid } = req.user!;
    const { category, model, description, hourlyRate, dailyRate, location, serviceAreas } = req.body;

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
      isAvailable: true,
      approvalStatus: 'pending' as const,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    await db.collection('machines').doc(machineId).set(machine);
    res.status(201).json({ machine });
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

    res.json({ machines, count: machines.length });
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
    res.json({ machine: doc.data() });
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
    const machines = snapshot.docs.map(doc => doc.data());
    res.json({ machines, count: machines.length });
  } catch {
    res.status(500).json({ error: 'Failed to fetch vendor machines' });
  }
};
