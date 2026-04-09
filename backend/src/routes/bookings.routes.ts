import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  createBooking, updateBookingStatus, getCustomerBookings,
  getVendorBookings, getBookingById, markArrived, verifyStartOtp
} from '../controllers/bookings.controller';

const router = Router();

router.post('/', authenticate, authorize('customer'), createBooking);
router.get('/customer', authenticate, authorize('customer'), getCustomerBookings);
router.get('/vendor', authenticate, authorize('vendor'), getVendorBookings);
router.get('/:id', authenticate, getBookingById);
router.patch('/:id/status', authenticate, authorize('vendor', 'admin'), updateBookingStatus);
router.patch('/:id/arrive', authenticate, authorize('vendor'), markArrived);
router.patch('/:id/verify-otp', authenticate, authorize('vendor'), verifyStartOtp);

export default router;
