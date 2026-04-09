import { Response } from 'express';
import { db, Timestamp } from '../config/firebase';
import { AuthRequest } from '../middleware/auth';
import { UserRole } from '../types';

function generateReferralCode(uid: string): string {
  return uid.slice(0, 6).toUpperCase();
}

export const createOrUpdateUser = async (req: AuthRequest, res: Response) => {
  try {
    const { uid } = req.user!;
    const { name, email, role, city, state, referralCode, profileType } = req.body;

    const userRole: UserRole = role === 'vendor' ? 'vendor' : 'customer';
    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();

    if (userDoc.exists) {
      const updateData: Record<string, unknown> = { updatedAt: Timestamp.now() };
      if (name) updateData.name = name;
      if (email) updateData.email = email;
      if (city) updateData.city = city;
      if (state) updateData.state = state;
      if (profileType) updateData.profileType = profileType;

      await userRef.update(updateData);
      const updated = await userRef.get();
      res.json({ user: { uid, ...updated.data() } });
    } else {
      // Validate referral code if provided
      let referredBy: string | null = null;
      if (referralCode) {
        const referrerSnap = await db.collection('users')
          .where('referralCode', '==', referralCode.toUpperCase())
          .limit(1)
          .get();
        if (!referrerSnap.empty) {
          referredBy = referrerSnap.docs[0].id;
        }
      }

      const newUser = {
        uid,
        phone: req.user!.phone,
        name: name || '',
        email: email || '',
        role: userRole,
        city: city || '',
        state: state || '',
        profileType: profileType || 'personal',
        referralCode: generateReferralCode(uid),
        ...(referredBy ? { referredBy } : {}),
        isActive: true,
        ...(userRole === 'vendor' ? { isOnline: false } : {}),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
      await userRef.set(newUser);
      res.status(201).json({ user: newUser });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to create/update user' });
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userDoc = await db.collection('users').doc(req.user!.uid).get();
    if (!userDoc.exists) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json({ user: { uid: userDoc.id, ...userDoc.data() } });
  } catch {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

export const updateOnlineStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { uid, role } = req.user!;
    if (role !== 'vendor') {
      res.status(403).json({ error: 'Only vendors can update online status' });
      return;
    }
    const { isOnline } = req.body;
    await db.collection('users').doc(uid).update({
      isOnline: !!isOnline,
      updatedAt: Timestamp.now(),
    });
    res.json({ isOnline: !!isOnline });
  } catch {
    res.status(500).json({ error: 'Failed to update online status' });
  }
};
