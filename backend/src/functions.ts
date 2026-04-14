// Firebase Functions entry point (v2 API)
// This file is used ONLY for deployment — local dev uses src/index.ts
import './config/firebase'; // Initialize Firebase Admin SDK first
import { onRequest } from 'firebase-functions/v2/https';
import app from './app';

// Export the Express app as a Firebase Function named "api"
// URL: https://us-central1-rentzoo-a39ea.cloudfunctions.net/api
// Via Hosting rewrite: https://rentzoo-a39ea.web.app/api
export const api = onRequest(
  {
    timeoutSeconds: 60,
    memory: '512MiB',
    region: 'us-central1',
    cors: true,
  },
  app
);
