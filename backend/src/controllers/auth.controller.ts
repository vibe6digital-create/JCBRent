import { Request, Response } from 'express';
import { db, auth as adminAuth, Timestamp } from '../config/firebase';
import { AuthRequest } from '../middleware/auth';
import { UserRole } from '../types';

function generateReferralCode(uid: string): string {
  return uid.slice(0, 6).toUpperCase();
}

// ─── Phone OTP (web — bypasses browser reCAPTCHA) ──────────────────────────

export const sendOtp = async (req: Request, res: Response) => {
  try {
    const { phone } = req.body;
    if (!phone) { res.status(400).json({ error: 'Phone number required' }); return; }

    const digits = String(phone).replace(/\D/g, '');
    if (digits.length !== 10) {
      res.status(400).json({ error: 'Enter a valid 10-digit mobile number' });
      return;
    }

    // Rate limit: 10s in dev, 60s in production
    const rateLimitMs = process.env.NODE_ENV === 'development' ? 10_000 : 60_000;
    const existing = await db.collection('otps').doc(digits).get();
    if (existing.exists) {
      const elapsed = Date.now() - existing.data()!.createdAt.toDate().getTime();
      if (elapsed < rateLimitMs) {
        const wait = Math.ceil((rateLimitMs - elapsed) / 1000);
        res.status(429).json({ error: `Please wait ${wait} seconds before requesting a new OTP` });
        return;
      }
    }

    const otp = process.env.TEST_OTP || Math.floor(100_000 + Math.random() * 900_000).toString();
    await db.collection('otps').doc(digits).set({
      otp,
      phone: `+91${digits}`,
      expiresAt: Timestamp.fromDate(new Date(Date.now() + 5 * 60_000)),
      createdAt: Timestamp.now(),
      attempts: 0,
    });

    if (process.env.TEST_OTP) {
      console.log(`\n${'━'.repeat(40)}`);
      console.log(`  TEST MODE — OTP for +91${digits}  →  ${otp}`);
      console.log(`${'━'.repeat(40)}\n`);
    } else if (process.env.TWOFACTOR_API_KEY) {
      // 2factor.in — free 100 OTP/day, no DLT hassle
      const smsRes = await fetch(
        `https://2factor.in/API/V1/${process.env.TWOFACTOR_API_KEY}/SMS/${digits}/${otp}/OTP1`
      );
      const smsData = await smsRes.json() as any;
      console.log('[SMS] 2factor response:', JSON.stringify(smsData));
      if (smsData.Status !== 'Success') {
        res.status(500).json({ error: smsData.Details || 'SMS sending failed' });
        return;
      }
      console.log(`[OTP] SMS sent to +91${digits}`);
    } else if (process.env.FAST2SMS_API_KEY) {
      const smsRes = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          authorization: process.env.FAST2SMS_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          route: 'q',
          message: `Your HeavyRent OTP is ${otp}. Valid for 5 minutes. Do not share with anyone.`,
          numbers: digits,
          flash: '0',
        }),
      });
      const smsData = await smsRes.json() as any;
      console.log('[SMS] Fast2SMS response:', JSON.stringify(smsData));
      if (!smsData.return) {
        const errMsg = smsData.message?.[0] || smsData.message || 'SMS sending failed';
        res.status(500).json({ error: errMsg });
        return;
      }
      console.log(`[OTP] SMS sent to +91${digits}`);
    } else {
      console.log(`\n${'━'.repeat(40)}`);
      console.log(`  OTP for +91${digits}  →  ${otp}`);
      console.log(`  Add FAST2SMS_API_KEY to .env for real SMS`);
      console.log(`${'━'.repeat(40)}\n`);
    }

    res.json({ success: true });
  } catch (err) {
    console.error('sendOtp:', err);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { phone, otp, role } = req.body;
    if (!phone || !otp) { res.status(400).json({ error: 'Phone and OTP required' }); return; }

    const digits = String(phone).replace(/\D/g, '');
    const formatted = `+91${digits}`;

    const snap = await db.collection('otps').doc(digits).get();
    if (!snap.exists) {
      res.status(400).json({ error: 'OTP not found. Request a new one.' });
      return;
    }

    const data = snap.data()!;

    if (data.expiresAt.toDate() < new Date()) {
      await db.collection('otps').doc(digits).delete();
      res.status(400).json({ error: 'OTP expired. Request a new one.' });
      return;
    }

    if (data.attempts >= 3) {
      await db.collection('otps').doc(digits).delete();
      res.status(400).json({ error: 'Too many incorrect attempts. Request a new OTP.' });
      return;
    }

    if (data.otp !== String(otp)) {
      await db.collection('otps').doc(digits).update({ attempts: data.attempts + 1 });
      const left = 2 - data.attempts;
      res.status(400).json({ error: `Incorrect OTP. ${left} attempt${left !== 1 ? 's' : ''} left.` });
      return;
    }

    await db.collection('otps').doc(digits).delete();

    // Get or create Firebase Auth user by phone — same UID as Flutter apps
    let uid: string;
    try {
      const existing = await adminAuth.getUserByPhoneNumber(formatted);
      uid = existing.uid;
    } catch {
      const created = await adminAuth.createUser({ phoneNumber: formatted });
      uid = created.uid;
    }

    // Issue Firebase custom token — web signs in with signInWithCustomToken
    const customToken = await adminAuth.createCustomToken(uid, { role: role || 'customer' });

    res.json({ customToken, uid });
  } catch (err) {
    console.error('verifyOtp:', err);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
};

// ─── User profile ──────────────────────────────────────────────────────────

export const createOrUpdateUser = async (req: AuthRequest, res: Response) => {
  try {
    const { uid } = req.user!;
    const {
      name, email, role, city, state, referralCode, profileType,
      signatureUrl, termsAccepted,
      licenseUrl, aadhaarUrl,
    } = req.body;

    const userRole: UserRole = role === 'vendor' ? 'vendor' : 'customer';
    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();

    // If vendor has just submitted KYC (license + aadhaar), flag them for admin review
    const kycJustSubmitted = Boolean(licenseUrl && aadhaarUrl);

    if (userDoc.exists) {
      const existingRole = userDoc.data()?.role;
      const existingStatus = userDoc.data()?.verificationStatus;
      const updateData: Record<string, unknown> = { updatedAt: Timestamp.now() };
      if (name) updateData.name = name;
      if (email) updateData.email = email;
      if (city) updateData.city = city;
      if (state) updateData.state = state;
      if (profileType) updateData.profileType = profileType;
      if (signatureUrl) updateData.signatureUrl = signatureUrl;
      if (licenseUrl) updateData.licenseUrl = licenseUrl;
      if (aadhaarUrl) updateData.aadhaarUrl = aadhaarUrl;
      if (termsAccepted === true) {
        updateData.termsAccepted = true;
        updateData.termsAcceptedAt = Timestamp.now();
      }
      // Reset verification to pending when fresh KYC docs are (re-)submitted,
      // unless the vendor is already verified (no-op in that case).
      if (kycJustSubmitted && existingStatus !== 'verified') {
        updateData.verificationStatus = 'pending';
        updateData.verificationSubmittedAt = Timestamp.now();
      }
      // Allow role upgrade: customer → vendor (never downgrade vendor → customer)
      if (role === 'vendor' && existingRole !== 'vendor') {
        updateData.role = 'vendor';
        updateData.isOnline = false;
      }
      await userRef.update(updateData);
      const updated = await userRef.get();
      res.json({ user: { uid, ...updated.data() } });
    } else {
      let referredBy: string | null = null;
      if (referralCode) {
        const snap = await db.collection('users')
          .where('referralCode', '==', referralCode.toUpperCase())
          .limit(1).get();
        if (!snap.empty) referredBy = snap.docs[0].id;
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
        referralCode: uid.slice(0, 6).toUpperCase(),
        ...(referredBy ? { referredBy } : {}),
        ...(signatureUrl ? { signatureUrl } : {}),
        ...(licenseUrl ? { licenseUrl } : {}),
        ...(aadhaarUrl ? { aadhaarUrl } : {}),
        ...(termsAccepted === true ? { termsAccepted: true, termsAcceptedAt: Timestamp.now() } : {}),
        ...(userRole === 'vendor' && kycJustSubmitted
          ? { verificationStatus: 'pending', verificationSubmittedAt: Timestamp.now() }
          : {}),
        isActive: true,
        ...(userRole === 'vendor' ? { isOnline: false } : {}),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
      await userRef.set(newUser);
      res.status(201).json({ user: newUser });
    }
  } catch {
    res.status(500).json({ error: 'Failed to create/update user' });
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userDoc = await db.collection('users').doc(req.user!.uid).get();
    if (!userDoc.exists) { res.status(404).json({ error: 'User not found' }); return; }
    res.json({ user: { uid: userDoc.id, ...userDoc.data() } });
  } catch {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

export const updateFcmToken = async (req: AuthRequest, res: Response) => {
  try {
    const { uid } = req.user!;
    const { fcmToken } = req.body;
    if (!fcmToken) { res.status(400).json({ error: 'fcmToken required' }); return; }
    await db.collection('users').doc(uid).update({ fcmToken, updatedAt: Timestamp.now() });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to update FCM token' });
  }
};

export const updateOnlineStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { uid, role } = req.user!;
    if (role !== 'vendor') { res.status(403).json({ error: 'Only vendors can update online status' }); return; }
    const { isOnline } = req.body;
    await db.collection('users').doc(uid).update({ isOnline: !!isOnline, updatedAt: Timestamp.now() });
    res.json({ isOnline: !!isOnline });
  } catch {
    res.status(500).json({ error: 'Failed to update online status' });
  }
};
