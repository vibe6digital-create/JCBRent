import { Router, Request, Response } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { db } from '../config/firebase';
import {
  createMachine, getMachines, getMachineById,
  updateMachine, deleteMachine, getVendorMachines, toggleAvailability, getMachineReviews, reportMachine
} from '../controllers/machines.controller';
import { getCategories, getServiceAreas } from '../controllers/admin.controller';
import { findNearestCity } from '../utils/cityCentroids';

const router = Router();

// Public — returns only active models, filtered by ?category=<name> if provided
const getMachineModelsPublic = async (req: Request, res: Response) => {
  try {
    let query: FirebaseFirestore.Query = db.collection('machineModels').where('isActive', '==', true);
    if (req.query.category) {
      query = query.where('category', '==', String(req.query.category));
    }
    const snapshot = await query.get();
    res.json({ models: snapshot.docs.map(d => d.data()) });
  } catch {
    res.status(500).json({ error: 'Failed to fetch models' });
  }
};

// Returns the closest Indian city centroid to the given lat/lng.
// Used by the vendor app to auto-suggest a service area from device GPS.
const getNearestCityHandler = (req: Request, res: Response) => {
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    res.status(400).json({ error: 'lat and lng query params are required' });
    return;
  }
  const nearest = findNearestCity(lat, lng);
  if (!nearest) {
    res.status(404).json({ error: 'No city match' });
    return;
  }
  res.json({ nearest });
};

// Public
router.get('/', getMachines);
router.get('/meta/categories', getCategories as any);
router.get('/meta/service-areas', getServiceAreas as any);
router.get('/meta/models', getMachineModelsPublic);
router.get('/meta/nearest-city', getNearestCityHandler);

// Vendor (must be before /:id)
router.get('/vendor/my-machines', authenticate, authorize('vendor'), getVendorMachines);
router.post('/', authenticate, authorize('vendor'), upload.array('images', 5), createMachine);
router.put('/:id', authenticate, authorize('vendor', 'admin'), updateMachine);
router.delete('/:id', authenticate, authorize('vendor', 'admin'), deleteMachine);
router.patch('/:id/availability', authenticate, authorize('vendor'), toggleAvailability);

router.get('/:id', getMachineById);
router.get('/:id/reviews', getMachineReviews);
router.post('/:id/report', authenticate, reportMachine);

export default router;
