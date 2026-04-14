import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
dotenv.config();

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
});

const db = admin.firestore();
const authAdmin = admin.auth();

async function seedAdmin() {
  const email = process.argv[2];
  const password = process.argv[3];

  if (!email || !password) {
    console.log('Usage: npx ts-node seed-admin.ts admin@heavyrent.com Admin@1234');
    process.exit(1);
  }

  let uid: string;

  try {
    // Try to get existing user
    const existing = await authAdmin.getUserByEmail(email);
    uid = existing.uid;
    console.log(`✅ Found existing Firebase user: ${uid}`);
  } catch {
    // Create new Firebase Auth user
    const newUser = await authAdmin.createUser({ email, password, displayName: 'Admin' });
    uid = newUser.uid;
    console.log(`✅ Created Firebase Auth user: ${uid}`);
  }

  // Create or update Firestore user doc
  const userRef = db.collection('users').doc(uid);
  const userDoc = await userRef.get();

  if (userDoc.exists) {
    await userRef.update({ role: 'admin', updatedAt: admin.firestore.Timestamp.now() });
    console.log(`✅ Updated existing user → role: admin`);
  } else {
    await userRef.set({
      uid,
      phone: '',
      name: 'Admin',
      email,
      role: 'admin',
      city: '',
      state: '',
      isActive: true,
      isOnline: false,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
    });
    console.log(`✅ Created admin user in Firestore`);
  }

  console.log(`\n🔑 Admin credentials:`);
  console.log(`   Email:    ${email}`);
  console.log(`   Password: ${password}`);
  console.log(`\nLogin at: http://localhost:5174`);
  process.exit(0);
}

seedAdmin().catch(e => { console.error(e.message); process.exit(1); });
