import { Response } from 'express';
import { db, Timestamp, messaging } from '../config/firebase';
import { AuthRequest } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';

// ==================== DASHBOARD ====================
export const getDashboard = async (_req: AuthRequest, res: Response) => {
  try {
    const [users, machines, bookings, estimates] = await Promise.all([
      db.collection('users').get(),
      db.collection('machines').get(),
      db.collection('bookings').orderBy('createdAt', 'desc').limit(50).get(),
      db.collection('estimates').get(),
    ]);

    const bookingDocs = bookings.docs.map(d => d.data());
    const pendingBookings = bookingDocs.filter(b => b.status === 'pending').length;
    const completedBookings = bookingDocs.filter(b => b.status === 'completed').length;

    const userDocs = users.docs.map(d => d.data());
    const customers = userDocs.filter(u => u.role === 'customer').length;
    const vendors = userDocs.filter(u => u.role === 'vendor').length;

    const machineDocs = machines.docs.map(d => d.data());
    const pendingMachines = machineDocs.filter(m => m.approvalStatus === 'pending');
    const approvedMachines = machineDocs.filter(m => m.approvalStatus === 'approved').length;

    const revenue = bookingDocs
      .filter(b => b.status === 'completed')
      .reduce((sum, b) => sum + (b.estimatedCost || 0), 0);

    res.json({
      dashboard: {
        totalUsers: users.size,
        customers,
        vendors,
        totalMachines: machines.size,
        approvedMachines,
        pendingMachines: pendingMachines.length,
        totalBookings: bookings.size,
        pendingBookings,
        completedBookings,
        totalEstimates: estimates.size,
        revenue,
      },
      pendingMachines: pendingMachines.slice(0, 5),
      recentBookings: bookingDocs.slice(0, 5),
    });
  } catch {
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
};

// ==================== USER MANAGEMENT ====================
export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const { role } = req.query;
    let query: FirebaseFirestore.Query = db.collection('users');
    if (role) query = query.where('role', '==', role);

    const snapshot = await query.get();
    res.json({ users: snapshot.docs.map(d => ({ uid: d.id, ...d.data() })) });
  } catch {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

export const verifyVendor = async (req: AuthRequest, res: Response) => {
  try {
    const { uid } = req.params;
    const { status, rejectionReason } = req.body;
    if (status !== 'verified' && status !== 'rejected' && status !== 'pending') {
      res.status(400).json({ error: 'status must be verified, rejected, or pending' });
      return;
    }
    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    if (userDoc.data()?.role !== 'vendor') {
      res.status(400).json({ error: 'Target user is not a vendor' });
      return;
    }
    const update: Record<string, unknown> = {
      verificationStatus: status,
      updatedAt: Timestamp.now(),
    };
    if (status === 'verified') {
      update.verifiedAt = Timestamp.now();
      update.verifiedBy = req.user!.uid;
      update.rejectionReason = null;
    } else if (status === 'rejected') {
      update.rejectionReason = rejectionReason || 'Documents not accepted';
      update.verifiedAt = null;
      update.verifiedBy = null;
    } else {
      update.rejectionReason = null;
    }
    await userRef.update(update);
    res.json({ message: `Vendor ${status}`, uid });
  } catch {
    res.status(500).json({ error: 'Failed to update vendor verification' });
  }
};

export const toggleUserStatus = async (req: AuthRequest, res: Response) => {
  try {
    const userRef = db.collection('users').doc(req.params.uid);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const isActive = !userDoc.data()!.isActive;
    await userRef.update({ isActive, updatedAt: Timestamp.now() });
    res.json({ message: `User ${isActive ? 'activated' : 'deactivated'}`, uid: req.params.uid });
  } catch {
    res.status(500).json({ error: 'Failed to toggle user status' });
  }
};

// ==================== VENDOR APPROVAL ====================
export const updateVendorApproval = async (req: AuthRequest, res: Response) => {
  try {
    const { uid } = req.params;
    const { vendorApprovalStatus } = req.body; // 'approved' | 'rejected'
    if (!['approved', 'rejected'].includes(vendorApprovalStatus)) {
      res.status(400).json({ error: 'vendorApprovalStatus must be approved or rejected' });
      return;
    }
    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    if (userDoc.data()?.role !== 'vendor') {
      res.status(400).json({ error: 'User is not a vendor' });
      return;
    }
    await userRef.update({ vendorApprovalStatus, updatedAt: Timestamp.now() });
    res.json({ message: `Vendor ${vendorApprovalStatus}`, uid });
  } catch {
    res.status(500).json({ error: 'Failed to update vendor approval' });
  }
};

// ==================== MACHINE APPROVAL ====================
export const getAllMachinesAdmin = async (_req: AuthRequest, res: Response) => {
  try {
    const snapshot = await db.collection('machines').get();
    res.json({ machines: snapshot.docs.map(d => d.data()) });
  } catch {
    res.status(500).json({ error: 'Failed to fetch machines' });
  }
};

export const approveMachine = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { approvalStatus } = req.body; // 'approved' | 'rejected'
    await db.collection('machines').doc(id).update({ approvalStatus, updatedAt: Timestamp.now() });
    res.json({ message: `Machine ${approvalStatus}`, machineId: id });
  } catch {
    res.status(500).json({ error: 'Failed to update machine approval' });
  }
};

// ==================== ALL BOOKINGS ====================
export const getAllBookings = async (_req: AuthRequest, res: Response) => {
  try {
    const snapshot = await db.collection('bookings').orderBy('createdAt', 'desc').get();
    res.json({ bookings: snapshot.docs.map(d => d.data()) });
  } catch {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

// ==================== CATEGORY MANAGEMENT ====================
export const getCategories = async (_req: AuthRequest, res: Response) => {
  try {
    const snapshot = await db.collection('categories').get();
    res.json({ categories: snapshot.docs.map(d => d.data()) });
  } catch {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

export const createCategory = async (req: AuthRequest, res: Response) => {
  try {
    const { name, icon } = req.body;
    const id = uuidv4();
    const category = { id, name, icon: icon || '', isActive: true, createdAt: Timestamp.now() };
    await db.collection('categories').doc(id).set(category);
    res.status(201).json({ category });
  } catch {
    res.status(500).json({ error: 'Failed to create category' });
  }
};

export const updateCategory = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await db.collection('categories').doc(id).update(req.body);
    res.json({ message: 'Category updated' });
  } catch {
    res.status(500).json({ error: 'Failed to update category' });
  }
};

// ==================== SERVICE AREA MANAGEMENT ====================
export const getServiceAreas = async (_req: AuthRequest, res: Response) => {
  try {
    const snapshot = await db.collection('serviceAreas').get();
    res.json({ serviceAreas: snapshot.docs.map(d => d.data()) });
  } catch {
    res.status(500).json({ error: 'Failed to fetch service areas' });
  }
};

export const createServiceArea = async (req: AuthRequest, res: Response) => {
  try {
    const { city, state } = req.body;
    const id = uuidv4();
    const area = { id, city, state, isActive: true, createdAt: Timestamp.now() };
    await db.collection('serviceAreas').doc(id).set(area);
    res.status(201).json({ serviceArea: area });
  } catch {
    res.status(500).json({ error: 'Failed to create service area' });
  }
};

export const updateServiceArea = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await db.collection('serviceAreas').doc(id).update(req.body);
    res.json({ message: 'Service area updated' });
  } catch {
    res.status(500).json({ error: 'Failed to update service area' });
  }
};

// ==================== MACHINE MODEL MANAGEMENT ====================
export const getMachineModels = async (_req: AuthRequest, res: Response) => {
  try {
    const snapshot = await db.collection('machineModels').get();
    res.json({ models: snapshot.docs.map(d => d.data()) });
  } catch {
    res.status(500).json({ error: 'Failed to fetch machine models' });
  }
};

export const createMachineModel = async (req: AuthRequest, res: Response) => {
  try {
    const { name, category } = req.body;
    if (!name || !category) {
      res.status(400).json({ error: 'name and category are required' });
      return;
    }
    const trimmedName = String(name).trim();
    const trimmedCategory = String(category).trim();

    // Prevent duplicates within the same category
    const existing = await db.collection('machineModels')
      .where('category', '==', trimmedCategory)
      .where('name', '==', trimmedName)
      .limit(1).get();
    if (!existing.empty) {
      res.status(400).json({ error: 'This model already exists in this category' });
      return;
    }

    const id = uuidv4();
    const model = {
      id,
      name: trimmedName,
      category: trimmedCategory,
      isActive: true,
      createdAt: Timestamp.now(),
    };
    await db.collection('machineModels').doc(id).set(model);
    res.status(201).json({ model });
  } catch {
    res.status(500).json({ error: 'Failed to create machine model' });
  }
};

export const updateMachineModel = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const ref = db.collection('machineModels').doc(id);
    const snap = await ref.get();
    if (!snap.exists) {
      res.status(404).json({ error: 'Model not found' });
      return;
    }
    const updates: Record<string, unknown> = { updatedAt: Timestamp.now() };
    if (typeof req.body.name === 'string') updates.name = req.body.name.trim();
    if (typeof req.body.category === 'string') updates.category = req.body.category.trim();
    if (typeof req.body.isActive === 'boolean') updates.isActive = req.body.isActive;
    await ref.update(updates);
    res.json({ message: 'Model updated' });
  } catch {
    res.status(500).json({ error: 'Failed to update model' });
  }
};

export const deleteMachineModel = async (req: AuthRequest, res: Response) => {
  try {
    await db.collection('machineModels').doc(req.params.id).delete();
    res.json({ message: 'Model deleted' });
  } catch {
    res.status(500).json({ error: 'Failed to delete model' });
  }
};

// ==================== BROADCAST NOTIFICATIONS ====================
export const broadcastNotification = async (req: AuthRequest, res: Response) => {
  try {
    const { title, body, target, userId } = req.body;
    // target: 'all' | 'customers' | 'vendors' | 'user'
    if (!title || !body || !target) {
      res.status(400).json({ error: 'title, body and target are required' });
      return;
    }

    // Fetch target users
    let query: FirebaseFirestore.Query = db.collection('users');
    if (target === 'customers') query = query.where('role', '==', 'customer');
    else if (target === 'vendors') query = query.where('role', '==', 'vendor');
    else if (target === 'user') {
      if (!userId) { res.status(400).json({ error: 'userId required for target=user' }); return; }
      query = query.where('uid', '==', userId);
    }

    const usersSnap = await query.get();
    const users = usersSnap.docs.map(d => ({ uid: d.id, ...d.data() } as any));

    // Write notification doc per user + collect FCM tokens
    const batch = db.batch();
    const tokens: string[] = [];
    const notifId = uuidv4();

    for (const user of users) {
      const nid = uuidv4();
      const notifRef = db.collection('notifications').doc(nid);
      batch.set(notifRef, {
        id: nid,
        userId: user.uid,
        title,
        body,
        type: 'broadcast',
        broadcastId: notifId,
        isRead: false,
        createdAt: Timestamp.now(),
      });
      if (user.fcmToken) tokens.push(user.fcmToken);
    }
    await batch.commit();

    // Store broadcast record
    await db.collection('broadcastNotifications').doc(notifId).set({
      id: notifId,
      title,
      body,
      target,
      targetUserId: userId || null,
      recipientCount: users.length,
      createdAt: Timestamp.now(),
      sentBy: req.user!.uid,
    });

    // Send FCM multicast (up to 500 tokens per call)
    let fcmSuccess = 0;
    if (tokens.length > 0) {
      for (let i = 0; i < tokens.length; i += 500) {
        const chunk = tokens.slice(i, i + 500);
        try {
          const result = await messaging.sendEachForMulticast({
            tokens: chunk,
            notification: { title, body },
            android: { priority: 'high', notification: { sound: 'default' } },
            apns: { payload: { aps: { sound: 'default', badge: 1 } } },
          });
          fcmSuccess += result.successCount;
        } catch (fcmErr) {
          console.warn('[FCM] Multicast error:', fcmErr);
        }
      }
    }

    res.json({ message: 'Notification broadcast sent', recipientCount: users.length, fcmSuccess });
  } catch (err) {
    console.error('broadcastNotification:', err);
    res.status(500).json({ error: 'Failed to broadcast notification' });
  }
};

export const getBroadcastHistory = async (_req: AuthRequest, res: Response) => {
  try {
    const snap = await db.collection('broadcastNotifications').orderBy('createdAt', 'desc').limit(50).get();
    const broadcasts = snap.docs.map(d => {
      const data = d.data();
      if (data.createdAt?.toDate) data.createdAt = data.createdAt.toDate().toISOString();
      return data;
    });
    res.json({ broadcasts });
  } catch {
    res.status(500).json({ error: 'Failed to fetch broadcast history' });
  }
};

// ==================== VENDOR EARNINGS DRILL-DOWN ====================
export const getVendorEarningsAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const { uid } = req.params;

    const vendorDoc = await db.collection('users').doc(uid).get();
    if (!vendorDoc.exists) { res.status(404).json({ error: 'Vendor not found' }); return; }
    const vendorData: any = { uid, ...vendorDoc.data() };
    if (vendorData.createdAt?.toDate) vendorData.createdAt = vendorData.createdAt.toDate().toISOString();

    const [bookingsSnap, machinesSnap] = await Promise.all([
      db.collection('bookings').where('vendorId', '==', uid).orderBy('createdAt', 'desc').get(),
      db.collection('machines').where('vendorId', '==', uid).get(),
    ]);

    const allBookings = bookingsSnap.docs.map(d => {
      const data = d.data();
      if (data.createdAt?.toDate) data.createdAt = data.createdAt.toDate().toISOString();
      if (data.startDate?.toDate) data.startDate = data.startDate.toDate().toISOString().split('T')[0];
      if (data.endDate?.toDate) data.endDate = data.endDate.toDate().toISOString().split('T')[0];
      return data;
    });
    const machines = machinesSnap.docs.map(d => d.data());

    const completed = allBookings.filter(b => b.status === 'completed');
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const sum = (arr: any[]) => arr.reduce((s, b) => s + (b.estimatedCost || 0), 0);
    const totalEarnings  = sum(completed);
    const todayEarnings  = sum(completed.filter(b => (b.endDate || '').startsWith(todayStr)));
    const weekEarnings   = sum(completed.filter(b => b.createdAt && new Date(b.createdAt) >= weekAgo));
    const monthEarnings  = sum(completed.filter(b => b.createdAt && new Date(b.createdAt) >= monthStart));

    const machineBreakdown = machines.map(m => {
      const mb = completed.filter(b => b.machineId === m.id);
      const ratings = mb.filter(b => b.rating).map(b => b.rating as number);
      const avgRating = ratings.length ? Math.round(ratings.reduce((s, r) => s + r, 0) / ratings.length * 10) / 10 : null;
      return { id: m.id, model: m.model, category: m.category, approvalStatus: m.approvalStatus, earnings: sum(mb), completedBookings: mb.length, avgRating };
    }).sort((a, b) => b.earnings - a.earnings);

    const allRatings = completed.filter(b => b.rating).map(b => b.rating as number);
    const avgRating = allRatings.length ? Math.round(allRatings.reduce((s, r) => s + r, 0) / allRatings.length * 10) / 10 : null;

    res.json({
      vendor: vendorData,
      stats: { totalEarnings, todayEarnings, weekEarnings, monthEarnings, totalBookings: allBookings.length, completedBookings: completed.length, machineCount: machines.length, avgRating },
      machineBreakdown,
      recentBookings: completed.slice(0, 20),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch vendor earnings' });
  }
};

// ==================== REPORTED MACHINES ====================
export const getReports = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.query;
    let query: FirebaseFirestore.Query = db.collection('machineReports').orderBy('createdAt', 'desc');
    if (status) query = query.where('status', '==', status);
    const snap = await query.get();
    const reports = snap.docs.map(d => {
      const data = d.data();
      if (data.createdAt?.toDate) data.createdAt = data.createdAt.toDate().toISOString();
      if (data.resolvedAt?.toDate) data.resolvedAt = data.resolvedAt.toDate().toISOString();
      return data;
    });
    res.json({ reports });
  } catch {
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
};

export const resolveReport = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'dismissed' | 'machine_rejected'
    if (!['dismissed', 'machine_rejected'].includes(action)) {
      res.status(400).json({ error: 'action must be dismissed or machine_rejected' }); return;
    }
    const reportRef = db.collection('machineReports').doc(id);
    const reportDoc = await reportRef.get();
    if (!reportDoc.exists) { res.status(404).json({ error: 'Report not found' }); return; }
    const report = reportDoc.data()!;

    await reportRef.update({
      status: action === 'machine_rejected' ? 'resolved' : 'dismissed',
      actionTaken: action,
      resolvedAt: Timestamp.now(),
      resolvedBy: req.user!.uid,
    });

    if (action === 'machine_rejected') {
      await db.collection('machines').doc(report.machineId).update({
        approvalStatus: 'rejected',
        updatedAt: Timestamp.now(),
      });
    }
    res.json({ message: action === 'machine_rejected' ? 'Report resolved — machine rejected' : 'Report dismissed' });
  } catch {
    res.status(500).json({ error: 'Failed to resolve report' });
  }
};

// ==================== ESTIMATES ====================
export const getAllEstimates = async (_req: AuthRequest, res: Response) => {
  try {
    const snapshot = await db.collection('estimates').orderBy('createdAt', 'desc').get();
    res.json({ estimates: snapshot.docs.map(d => d.data()) });
  } catch {
    res.status(500).json({ error: 'Failed to fetch estimates' });
  }
};

// ==================== COUPON MANAGEMENT ====================
export const getCoupons = async (_req: AuthRequest, res: Response) => {
  try {
    const snapshot = await db.collection('coupons').orderBy('createdAt', 'desc').get();
    res.json({ coupons: snapshot.docs.map(d => d.data()) });
  } catch {
    res.status(500).json({ error: 'Failed to fetch coupons' });
  }
};

export const createCoupon = async (req: AuthRequest, res: Response) => {
  try {
    const { code, discountType, discountValue, description, expiryDate, maxUses, minBookingAmount, maxDiscount } = req.body;

    if (!code || !discountType || discountValue === undefined) {
      res.status(400).json({ error: 'code, discountType, and discountValue are required' });
      return;
    }

    const upperCode = code.trim().toUpperCase();

    // Check for duplicate code
    const existing = await db.collection('coupons').where('code', '==', upperCode).limit(1).get();
    if (!existing.empty) {
      res.status(400).json({ error: 'A coupon with this code already exists' });
      return;
    }

    const id = uuidv4();
    const coupon: Record<string, any> = {
      id,
      code: upperCode,
      discountType,
      discountValue: Number(discountValue),
      description: description || '',
      isActive: true,
      usedCount: 0,
      createdAt: Timestamp.now(),
    };
    if (expiryDate) coupon.expiryDate = Timestamp.fromDate(new Date(expiryDate));
    if (maxUses) coupon.maxUses = Number(maxUses);
    if (minBookingAmount) coupon.minBookingAmount = Number(minBookingAmount);
    if (maxDiscount) coupon.maxDiscount = Number(maxDiscount);

    await db.collection('coupons').doc(id).set(coupon);
    res.status(201).json({ coupon });
  } catch {
    res.status(500).json({ error: 'Failed to create coupon' });
  }
};

export const updateCoupon = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const couponRef = db.collection('coupons').doc(id);
    const snap = await couponRef.get();
    if (!snap.exists) {
      res.status(404).json({ error: 'Coupon not found' });
      return;
    }
    await couponRef.update({ ...req.body, updatedAt: Timestamp.now() });
    res.json({ message: 'Coupon updated' });
  } catch {
    res.status(500).json({ error: 'Failed to update coupon' });
  }
};

export const deleteCoupon = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await db.collection('coupons').doc(id).delete();
    res.json({ message: 'Coupon deleted' });
  } catch {
    res.status(500).json({ error: 'Failed to delete coupon' });
  }
};
