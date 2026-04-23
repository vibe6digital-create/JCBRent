import { Response } from 'express';
import { db, Timestamp, messaging } from '../config/firebase';
import { AuthRequest } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';
import { lookupCentroid } from '../utils/cityCentroids';

async function sendPush(userId: string, title: string, body: string): Promise<void> {
  try {
    const userDoc = await db.collection('users').doc(userId).get();
    const fcmToken = userDoc.data()?.fcmToken;
    if (!fcmToken) return;
    await messaging.send({
      token: fcmToken,
      notification: { title, body },
      android: { priority: 'high', notification: { sound: 'default' } },
      apns: { payload: { aps: { sound: 'default', badge: 1 } } },
    });
  } catch (err) {
    console.warn('[FCM] Push send failed:', err);
  }
}

function serializeBooking(data: any): any {
  const result = { ...data };
  const dateFields = ['startDate', 'endDate', 'createdAt', 'updatedAt', 'workStartedAt'];
  for (const field of dateFields) {
    if (result[field] && typeof result[field] === 'object' && '_seconds' in result[field]) {
      result[field] = new Date(result[field]._seconds * 1000).toISOString().split('T')[0];
    } else if (result[field]?.toDate) {
      result[field] = result[field].toDate().toISOString().split('T')[0];
    }
  }
  return result;
}

function calculateCost(rate: number, rateType: string, startDate: string, endDate: string): number {
  const diffMs = new Date(endDate).getTime() - new Date(startDate).getTime();
  switch (rateType) {
    case 'hourly': return rate * Math.ceil(diffMs / (1000 * 60 * 60));
    case 'daily': return rate * Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    case 'weekly': return rate * Math.ceil(diffMs / (1000 * 60 * 60 * 24 * 7));
    case 'monthly': return rate * Math.ceil(diffMs / (1000 * 60 * 60 * 24 * 30));
    default: return rate;
  }
}

function generateOtp(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// ── Vendor broadcasts real-time GPS location ──────────────────────────────
export const updateVendorLocation = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { lat, lng } = req.body;
    const { uid } = req.user!;

    if (!lat || !lng) {
      res.status(400).json({ error: 'lat and lng are required' });
      return;
    }

    const bookingRef = db.collection('bookings').doc(id);
    const bookingDoc = await bookingRef.get();
    if (!bookingDoc.exists) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    const booking = bookingDoc.data()!;
    if (booking.vendorId !== uid) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    await bookingRef.update({
      vendorLat: parseFloat(lat),
      vendorLng: parseFloat(lng),
      vendorLocationUpdatedAt: Timestamp.now(),
    });

    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'Failed to update location' });
  }
};

// ── Customer cancels a booking ─────────────────────────────────────────────
export const cancelBooking = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const { uid, role } = req.user!;

    if (!reason || typeof reason !== 'string' || reason.trim().length === 0) {
      res.status(400).json({ error: 'Cancellation reason is required' });
      return;
    }

    const bookingRef = db.collection('bookings').doc(id);
    const bookingDoc = await bookingRef.get();

    if (!bookingDoc.exists) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    const booking = bookingDoc.data()!;

    // Only the customer who made the booking (or admin) can cancel
    if (booking.customerId !== uid && role !== 'admin') {
      res.status(403).json({ error: 'Not authorized to cancel this booking' });
      return;
    }

    // Can only cancel if pending or accepted — not once work has started
    const cancellableStatuses = ['pending', 'accepted'];
    if (!cancellableStatuses.includes(booking.status)) {
      res.status(400).json({
        error: `Cannot cancel a booking that is ${booking.status}. Only pending or accepted bookings can be cancelled.`,
      });
      return;
    }

    await bookingRef.update({
      status: 'cancelled',
      cancellationReason: reason.trim(),
      cancelledBy: role === 'admin' ? 'admin' : 'customer',
      cancelledAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    // Notify vendor
    const notifTitle = 'Booking Cancelled';
    const notifBody = `${booking.customerName} has cancelled their booking for ${booking.machineCategory} - ${booking.machineModel}.`;
    await db.collection('notifications').add({
      id: uuidv4(),
      userId: booking.vendorId,
      title: notifTitle,
      body: notifBody,
      type: 'booking_cancelled',
      referenceId: id,
      isRead: false,
      createdAt: Timestamp.now(),
    });
    sendPush(booking.vendorId, notifTitle, notifBody);

    res.json({ message: 'Booking cancelled successfully', bookingId: id });
  } catch {
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
};

// ── Validate coupon (pre-booking check) ────────────────────────────────────
export const validateCoupon = async (req: AuthRequest, res: Response) => {
  try {
    const { code, estimatedCost } = req.body;
    if (!code || typeof code !== 'string') {
      res.status(400).json({ error: 'Coupon code is required' });
      return;
    }

    const couponSnap = await db.collection('coupons')
      .where('code', '==', code.trim().toUpperCase())
      .where('isActive', '==', true)
      .limit(1)
      .get();

    if (couponSnap.empty) {
      res.status(404).json({ error: 'Invalid or expired coupon code' });
      return;
    }

    const coupon = couponSnap.docs[0].data();

    // Check expiry date
    if (coupon.expiryDate) {
      const expiry = coupon.expiryDate.toDate ? coupon.expiryDate.toDate() : new Date(coupon.expiryDate);
      if (expiry < new Date()) {
        res.status(400).json({ error: 'This coupon has expired' });
        return;
      }
    }

    // Check usage limit
    if (coupon.maxUses && (coupon.usedCount ?? 0) >= coupon.maxUses) {
      res.status(400).json({ error: 'This coupon has reached its usage limit' });
      return;
    }

    // Check minimum booking amount
    const cost = parseFloat(estimatedCost) || 0;
    if (coupon.minBookingAmount && cost < coupon.minBookingAmount) {
      res.status(400).json({
        error: `Minimum booking amount of ₹${coupon.minBookingAmount} required for this coupon`,
      });
      return;
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (coupon.discountType === 'percent') {
      discountAmount = Math.floor(cost * coupon.discountValue / 100);
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else {
      discountAmount = Math.min(coupon.discountValue, cost);
    }

    res.json({
      valid: true,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount,
      description: coupon.description || null,
      message: coupon.discountType === 'percent'
        ? `${coupon.discountValue}% off applied!`
        : `₹${discountAmount.toLocaleString('en-IN')} off applied!`,
    });
  } catch {
    res.status(500).json({ error: 'Failed to validate coupon' });
  }
};

export const createBooking = async (req: AuthRequest, res: Response) => {
  try {
    const { uid } = req.user!;
    const { machineId, startDate, endDate, rateType, workLocation, notes, estimateId, couponCode, bookingType } = req.body;

    const machineDoc = await db.collection('machines').doc(machineId).get();
    if (!machineDoc.exists) {
      res.status(404).json({ error: 'Machine not found' });
      return;
    }
    const machine = machineDoc.data()!;

    const userDoc = await db.collection('users').doc(uid).get();
    const user = userDoc.data()!;

    const vendorDoc = await db.collection('users').doc(machine.vendorId).get();
    const vendorPhone = vendorDoc.data()?.phone || '';
    const vendorName = machine.vendorName || vendorDoc.data()?.name || '';

    // Determine rate based on type
    let rate: number;
    switch (rateType) {
      case 'weekly': rate = (machine.weeklyRate ?? machine.dailyRate * 6); break;
      case 'monthly': rate = (machine.monthlyRate ?? machine.dailyRate * 25); break;
      case 'daily': rate = machine.dailyRate; break;
      default: rate = machine.hourlyRate;
    }

    let estimatedCost = calculateCost(rate, rateType, startDate, endDate);

    // Apply coupon if provided
    let discountAmount = 0;
    let appliedCouponId: string | null = null;
    if (couponCode) {
      const couponSnap = await db.collection('coupons')
        .where('code', '==', couponCode.toUpperCase())
        .where('isActive', '==', true)
        .limit(1)
        .get();
      if (!couponSnap.empty) {
        const couponDoc = couponSnap.docs[0];
        const coupon = couponDoc.data();
        appliedCouponId = couponDoc.id;
        if (coupon.discountType === 'percent') {
          discountAmount = Math.floor(estimatedCost * coupon.discountValue / 100);
          if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) discountAmount = coupon.maxDiscount;
        } else {
          discountAmount = Math.min(coupon.discountValue, estimatedCost);
        }
        estimatedCost = Math.max(0, estimatedCost - discountAmount);
        // Increment usedCount
        await db.collection('coupons').doc(appliedCouponId).update({
          usedCount: (coupon.usedCount ?? 0) + 1,
        });
      }
    }

    const bookingId = uuidv4();
    const booking = {
      id: bookingId,
      customerId: uid,
      customerName: user.name,
      customerPhone: user.phone,
      vendorId: machine.vendorId,
      vendorName,
      vendorPhone,
      machineId,
      machineCategory: machine.category,
      machineModel: machine.model,
      startDate: Timestamp.fromDate(new Date(startDate)),
      endDate: Timestamp.fromDate(new Date(endDate)),
      rateType,
      rate,
      estimatedCost,
      discountAmount,
      couponCode: couponCode || null,
      workLocation: workLocation || {},
      status: 'pending' as const,
      notes: notes || '',
      estimateId: estimateId || null,
      bookingType: bookingType || 'book_now',
      isOtpVerified: false,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    await db.collection('bookings').doc(bookingId).set(booking);

    // Create notification for vendor
    const vendorNotifTitle = 'New Booking Request';
    const vendorNotifBody = `${user.name} has requested to book your ${machine.category} - ${machine.model}`;
    await db.collection('notifications').add({
      id: uuidv4(),
      userId: machine.vendorId,
      title: vendorNotifTitle,
      body: vendorNotifBody,
      type: 'booking_request',
      referenceId: bookingId,
      isRead: false,
      createdAt: Timestamp.now(),
    });
    sendPush(machine.vendorId, vendorNotifTitle, vendorNotifBody);

    res.status(201).json({ booking: serializeBooking(booking) });
  } catch {
    res.status(500).json({ error: 'Failed to create booking' });
  }
};

export const updateBookingStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const { uid, role } = req.user!;

    const bookingRef = db.collection('bookings').doc(id);
    const bookingDoc = await bookingRef.get();

    if (!bookingDoc.exists) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    const booking = bookingDoc.data()!;

    if (booking.vendorId !== uid && role !== 'admin') {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    await bookingRef.update({ status, updatedAt: Timestamp.now() });

    // Notify customer
    const statusMessages: Record<string, string> = {
      approved: 'Your booking has been approved!',
      rejected: 'Your booking has been rejected.',
      completed: 'Your booking has been marked as completed.',
    };

    const notifTitle = `Booking ${status.charAt(0).toUpperCase() + status.slice(1)}`;
    const notifBody = statusMessages[status] || `Booking status updated to ${status}`;
    await db.collection('notifications').add({
      id: uuidv4(),
      userId: booking.customerId,
      title: notifTitle,
      body: notifBody,
      type: `booking_${status}`,
      referenceId: id,
      isRead: false,
      createdAt: Timestamp.now(),
    });
    sendPush(booking.customerId, notifTitle, notifBody);

    res.json({ message: `Booking ${status}`, bookingId: id });
  } catch {
    res.status(500).json({ error: 'Failed to update booking status' });
  }
};

export const getCustomerBookings = async (req: AuthRequest, res: Response) => {
  try {
    const snapshot = await db.collection('bookings')
      .where('customerId', '==', req.user!.uid)
      .get();
    const bookings = snapshot.docs.map(doc => doc.data())
      .sort((a, b) => (b.createdAt?._seconds ?? 0) - (a.createdAt?._seconds ?? 0))
      .map(serializeBooking);
    res.json({ bookings });
  } catch {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

export const getVendorBookings = async (req: AuthRequest, res: Response) => {
  try {
    const snapshot = await db.collection('bookings')
      .where('vendorId', '==', req.user!.uid)
      .get();
    const bookings = snapshot.docs.map(doc => doc.data())
      .sort((a, b) => (b.createdAt?._seconds ?? 0) - (a.createdAt?._seconds ?? 0))
      .map(serializeBooking);
    res.json({ bookings });
  } catch {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

export const getBookingById = async (req: AuthRequest, res: Response) => {
  try {
    const doc = await db.collection('bookings').doc(req.params.id).get();
    if (!doc.exists) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    const booking = doc.data()!;
    const { uid, role } = req.user!;
    if (booking.customerId !== uid && booking.vendorId !== uid && role !== 'admin') {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    res.json({ booking: serializeBooking(booking) });
  } catch {
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
};

// Vendor marks machine as arrived at site — generates OTP and notifies customer
export const markArrived = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { uid } = req.user!;

    const bookingRef = db.collection('bookings').doc(id);
    const bookingDoc = await bookingRef.get();

    if (!bookingDoc.exists) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    const booking = bookingDoc.data()!;
    if (booking.vendorId !== uid) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    if (booking.status !== 'accepted') {
      res.status(400).json({ error: 'Booking must be accepted before marking arrival' });
      return;
    }

    const otp = generateOtp();
    await bookingRef.update({
      status: 'arrived',
      startOtp: otp,
      isOtpVerified: false,
      updatedAt: Timestamp.now(),
    });

    // Notify customer with OTP
    const arrivedTitle = 'Machine Has Arrived!';
    const arrivedBody = `Your ${booking.machineCategory} has arrived. Start OTP: ${otp}. Share with the operator to begin work.`;
    await db.collection('notifications').add({
      id: uuidv4(),
      userId: booking.customerId,
      title: arrivedTitle,
      body: arrivedBody,
      type: 'booking_arrived',
      referenceId: id,
      isRead: false,
      createdAt: Timestamp.now(),
    });
    sendPush(booking.customerId, arrivedTitle, arrivedBody);

    res.json({ message: 'Arrival marked. OTP sent to customer.', otp });
  } catch {
    res.status(500).json({ error: 'Failed to mark arrival' });
  }
};

// Vendor enters OTP from customer to start work
export const verifyStartOtp = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { otp } = req.body;
    const { uid } = req.user!;

    const bookingRef = db.collection('bookings').doc(id);
    const bookingDoc = await bookingRef.get();

    if (!bookingDoc.exists) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    const booking = bookingDoc.data()!;
    if (booking.vendorId !== uid) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    if (booking.status !== 'arrived') {
      res.status(400).json({ error: 'Machine must have arrived before starting work' });
      return;
    }

    if (booking.startOtp !== otp) {
      res.status(400).json({ error: 'Invalid OTP' });
      return;
    }

    await bookingRef.update({
      status: 'in_progress',
      isOtpVerified: true,
      workStartedAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    // Notify customer that work has started
    const startedTitle = 'Work Has Started!';
    const startedBody = `Work on your ${booking.machineCategory} booking has started. OTP verified successfully.`;
    await db.collection('notifications').add({
      id: uuidv4(),
      userId: booking.customerId,
      title: startedTitle,
      body: startedBody,
      type: 'booking_started',
      referenceId: id,
      isRead: false,
      createdAt: Timestamp.now(),
    });
    sendPush(booking.customerId, startedTitle, startedBody);

    res.json({ message: 'Work started successfully' });
  } catch {
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
};

export const rateBooking = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { uid } = req.user!;
    const { rating, review } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      res.status(400).json({ error: 'Rating must be between 1 and 5' });
      return;
    }

    const bookingRef = db.collection('bookings').doc(id);
    const bookingDoc = await bookingRef.get();

    if (!bookingDoc.exists) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    const booking = bookingDoc.data()!;
    if (booking.customerId !== uid) {
      res.status(403).json({ error: 'Only the customer can rate this booking' });
      return;
    }
    if (booking.status !== 'completed') {
      res.status(400).json({ error: 'Can only rate completed bookings' });
      return;
    }

    await bookingRef.update({ rating, review: review || '', updatedAt: Timestamp.now() });

    // Aggregate machine rating stats
    try {
      const allRatedSnap = await db.collection('bookings')
        .where('machineId', '==', booking.machineId)
        .where('status', '==', 'completed')
        .get();
      const rated = allRatedSnap.docs.map(d => d.data()).filter(b => b.rating > 0);
      if (rated.length > 0) {
        const avg = Math.round((rated.reduce((s, b) => s + b.rating, 0) / rated.length) * 10) / 10;
        await db.collection('machines').doc(booking.machineId).update({
          avgRating: avg,
          reviewCount: rated.length,
          updatedAt: Timestamp.now(),
        });
      }
    } catch (e) {
      console.warn('[rating] machine aggregate update failed:', e);
    }

    // Notify vendor
    const ratingTitle = 'New Rating Received!';
    const ratingBody = `${booking.customerName} rated your ${booking.machineCategory} ${rating}/5 stars.`;
    await db.collection('notifications').add({
      id: uuidv4(),
      userId: booking.vendorId,
      title: ratingTitle,
      body: ratingBody,
      type: 'general',
      referenceId: id,
      isRead: false,
      createdAt: Timestamp.now(),
    });
    sendPush(booking.vendorId, ratingTitle, ratingBody);

    res.json({ message: 'Rating submitted' });
  } catch {
    res.status(500).json({ error: 'Failed to submit rating' });
  }
};

export const getVendorEarnings = async (req: AuthRequest, res: Response) => {
  try {
    const { uid } = req.user!;
    const snap = await db.collection('bookings')
      .where('vendorId', '==', uid)
      .where('status', '==', 'completed')
      .get();

    let total = 0;
    let month = 0;
    const now = new Date();
    snap.forEach(doc => {
      const b = doc.data();
      const cost = b.totalCost ?? b.estimatedCost ?? 0;
      total += cost;
      const completed = b.updatedAt?.toDate ? b.updatedAt.toDate() : new Date(b.updatedAt);
      if (completed.getFullYear() === now.getFullYear() && completed.getMonth() === now.getMonth()) {
        month += cost;
      }
    });

    res.json({ earnings: { total, month, thisMonth: month } });
  } catch {
    res.status(500).json({ error: 'Failed to fetch earnings' });
  }
};

// ── Traffic heatmap — aggregates recent bookings by work location ────────────
// Vendor-facing: shows which areas have the highest customer demand so
// vendors know where to expand their service coverage.
export const getTrafficHeatmap = async (req: AuthRequest, res: Response) => {
  try {
    const days = Math.max(1, Math.min(365, Number(req.query.days) || 90));
    const since = Timestamp.fromDate(new Date(Date.now() - days * 24 * 60 * 60 * 1000));

    const snap = await db.collection('bookings')
      .where('createdAt', '>=', since)
      .get();

    // Aggregate: key = rounded lat/lng cell (if explicit coords) OR city name.
    const buckets = new Map<string, { lat: number; lng: number; city: string; count: number }>();

    for (const doc of snap.docs) {
      const b = doc.data();
      const loc = b.workLocation || {};
      let lat: number | null = null;
      let lng: number | null = null;
      let city: string = (loc.city || '').toString().trim();

      // 1) Explicit lat/lng on workLocation
      if (typeof loc.lat === 'number' && typeof loc.lng === 'number') {
        lat = loc.lat;
        lng = loc.lng;
      } else if (typeof loc.latitude === 'number' && typeof loc.longitude === 'number') {
        lat = loc.latitude;
        lng = loc.longitude;
      }

      // 2) Fall back to city centroid
      if (lat === null || lng === null) {
        const centroid = lookupCentroid(city);
        if (centroid) { lat = centroid.lat; lng = centroid.lng; }
      }

      // Still nothing — skip this booking
      if (lat === null || lng === null) continue;

      // Use city name as bucket key if we have one, else a rounded lat/lng cell
      const key = city || `${lat.toFixed(2)},${lng.toFixed(2)}`;
      const existing = buckets.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        buckets.set(key, { lat, lng, city: city || 'Unknown', count: 1 });
      }
    }

    const points = Array.from(buckets.values()).sort((a, b) => b.count - a.count);
    res.json({ points, windowDays: days, totalBookings: snap.size });
  } catch (err) {
    console.error('getTrafficHeatmap:', err);
    res.status(500).json({ error: 'Failed to build traffic heatmap' });
  }
};
