import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  createBooking, updateBookingStatus, getCustomerBookings,
  getVendorBookings, getBookingById, markArrived, verifyStartOtp, getVendorEarnings, rateBooking,
  validateCoupon, updateVendorLocation, cancelBooking,
} from '../controllers/bookings.controller';

const router = Router();

// Must be before /:id routes
router.post('/validate-coupon', authenticate, validateCoupon);

router.post('/', authenticate, authorize('customer'), createBooking);
router.get('/customer', authenticate, authorize('customer'), getCustomerBookings);
router.get('/vendor', authenticate, authorize('vendor'), getVendorBookings);
router.get('/vendor/earnings', authenticate, authorize('vendor'), getVendorEarnings);
router.get('/:id', authenticate, getBookingById);
router.patch('/:id/status', authenticate, authorize('vendor', 'admin'), updateBookingStatus);
router.patch('/:id/arrive', authenticate, authorize('vendor'), markArrived);
router.patch('/:id/location', authenticate, authorize('vendor'), updateVendorLocation);
router.patch('/:id/verify-otp', authenticate, authorize('vendor'), verifyStartOtp);
router.patch('/:id/rate', authenticate, authorize('customer'), rateBooking);
router.patch('/:id/cancel', authenticate, authorize('customer', 'admin'), cancelBooking);

export default router;
