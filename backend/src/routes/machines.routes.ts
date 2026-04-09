import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { upload } from '../middleware/upload';
import {
  createMachine, getMachines, getMachineById,
  updateMachine, deleteMachine, getVendorMachines
} from '../controllers/machines.controller';
import { getCategories, getServiceAreas } from '../controllers/admin.controller';

const router = Router();

// Public
router.get('/', getMachines);
router.get('/meta/categories', getCategories as any);
router.get('/meta/service-areas', getServiceAreas as any);
router.get('/:id', getMachineById);

// Vendor
router.post('/', authenticate, authorize('vendor'), upload.array('images', 5), createMachine);
router.put('/:id', authenticate, authorize('vendor', 'admin'), updateMachine);
router.delete('/:id', authenticate, authorize('vendor', 'admin'), deleteMachine);
router.get('/vendor/my-machines', authenticate, authorize('vendor'), getVendorMachines);

export default router;
