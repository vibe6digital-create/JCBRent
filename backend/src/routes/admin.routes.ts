import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  getDashboard, getAllUsers, toggleUserStatus, updateVendorApproval,
  getAllMachinesAdmin, approveMachine,
  getAllBookings,
  getCategories, createCategory, updateCategory,
  getServiceAreas, createServiceArea, updateServiceArea,
  getAllEstimates,
  broadcastNotification, getBroadcastHistory,
  getCoupons, createCoupon, updateCoupon, deleteCoupon,
} from '../controllers/admin.controller';

const router = Router();

// All admin routes require admin role
router.use(authenticate, authorize('admin'));

router.get('/dashboard', getDashboard);

router.get('/users', getAllUsers);
router.patch('/users/:uid/toggle-status', toggleUserStatus);
router.patch('/vendors/:uid/approval', updateVendorApproval);

router.get('/machines', getAllMachinesAdmin);
router.patch('/machines/:id/approve', approveMachine);

router.get('/bookings', getAllBookings);

router.get('/categories', getCategories);
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);

router.get('/service-areas', getServiceAreas);
router.post('/service-areas', createServiceArea);
router.put('/service-areas/:id', updateServiceArea);

router.get('/estimates', getAllEstimates);

router.get('/notifications', getBroadcastHistory);
router.post('/notifications/broadcast', broadcastNotification);

router.get('/coupons', getCoupons);
router.post('/coupons', createCoupon);
router.patch('/coupons/:id', updateCoupon);
router.delete('/coupons/:id', deleteCoupon);

export default router;
