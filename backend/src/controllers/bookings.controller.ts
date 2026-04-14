import { Response } from 'express';
import { db, Timestamp } from '../config/firebase';
import { AuthRequest } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';

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
    if (couponCode) {
      const couponSnap = await db.collection('coupons')
        .where('code', '==', couponCode.toUpperCase())
        .where('isActive', '==', true)
        .limit(1)
        .get();
      if (!couponSnap.empty) {
        const coupon = couponSnap.docs[0].data();
        discountAmount = coupon.discountType === 'percent'
          ? Math.floor(estimatedCost * coupon.discountValue / 100)
          : coupon.discountValue;
        estimatedCost = Math.max(0, estimatedCost - discountAmount);
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
    await db.collection('notifications').add({
      id: uuidv4(),
      userId: machine.vendorId,
      title: 'New Booking Request',
      body: `${user.name} has requested to book your ${machine.category} - ${machine.model}`,
      type: 'booking_request',
      referenceId: bookingId,
      isRead: false,
      createdAt: Timestamp.now(),
    });

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

    await db.collection('notifications').add({
      id: uuidv4(),
      userId: booking.customerId,
      title: `Booking ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      body: statusMessages[status] || `Booking status updated to ${status}`,
      type: `booking_${status}`,
      referenceId: id,
      isRead: false,
      createdAt: Timestamp.now(),
    });

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
    await db.collection('notifications').add({
      id: uuidv4(),
      userId: booking.customerId,
      title: 'Machine Has Arrived!',
      body: `Your ${booking.machineCategory} has arrived at the site. Your start OTP is: ${otp}. Share this with the operator to begin work.`,
      type: 'booking_arrived',
      referenceId: id,
      isRead: false,
      createdAt: Timestamp.now(),
    });

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
    await db.collection('notifications').add({
      id: uuidv4(),
      userId: booking.customerId,
      title: 'Work Has Started!',
      body: `Work on your ${booking.machineCategory} booking has started. OTP verified successfully.`,
      type: 'booking_started',
      referenceId: id,
      isRead: false,
      createdAt: Timestamp.now(),
    });

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

    // Notify vendor
    await db.collection('notifications').add({
      id: uuidv4(),
      userId: booking.vendorId,
      title: 'New Rating Received!',
      body: `${booking.customerName} rated your ${booking.machineCategory} ${rating}/5 stars.`,
      type: 'general',
      referenceId: id,
      isRead: false,
      createdAt: Timestamp.now(),
    });

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
