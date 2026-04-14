import * as admin from 'firebase-admin';
import dotenv from 'dotenv';
import path from 'path';
// Load .env.local for local dev — Firebase Functions never deploys .env.local
// In production, Firebase Functions loads .env.production automatically
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

if (!admin.apps.length) {
  if (process.env.FIREBASE_PROJECT_ID) {
    // Local development — use service account credentials from .env
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });
  } else {
    // Firebase Functions — uses Application Default Credentials automatically
    // No credentials needed when running inside Firebase infrastructure
    admin.initializeApp({
      storageBucket: 'rentzoo-a39ea.firebasestorage.app',
    });
  }
}

export const db = admin.firestore();
export const auth = admin.auth();
export const storage = admin.storage();
export const messaging = admin.messaging();
export const FieldValue = admin.firestore.FieldValue;
export const Timestamp = admin.firestore.Timestamp;

export default admin;
