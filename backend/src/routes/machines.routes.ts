import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { upload } from '../middleware/upload';
import {
  createMachine, getMachines, getMachineById,
  updateMachine, deleteMachine, getVendorMachines, toggleAvailability, getMachineReviews
} from '../controllers/machines.controller';
import { getCategories, getServiceAreas } from '../controllers/admin.controller';

const router = Router();

// Public
router.get('/', getMachines);
router.get('/meta/categories', getCategories as any);
router.get('/meta/service-areas', getServiceAreas as any);

// Vendor (must be before /:id)
router.get('/vendor/my-machines', authenticate, authorize('vendor'), getVendorMachines);
router.post('/', authenticate, authorize('vendor'), upload.array('images', 5), createMachine);
router.put('/:id', authenticate, authorize('vendor', 'admin'), updateMachine);
router.delete('/:id', authenticate, authorize('vendor', 'admin'), deleteMachine);
router.patch('/:id/availability', authenticate, authorize('vendor'), toggleAvailability);

router.get('/:id', getMachineById);
router.get('/:id/reviews', getMachineReviews);

export default router;
