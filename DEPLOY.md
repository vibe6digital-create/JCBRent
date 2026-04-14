# HeavyRent — Firebase Deployment Guide

## Prerequisites
- Firebase CLI installed (`npm install -g firebase-tools`)
- Logged in to Firebase (`firebase login`)
- Blaze (pay-as-you-go) plan on project `rentzoo-a39ea`

---

## One-Time Setup (First Deploy Only)

### 1. Install Firebase CLI
```bash
npm install -g firebase-tools
firebase login
```

### 2. Create the Admin Panel hosting site
Go to: https://console.firebase.google.com/project/rentzoo-a39ea/hosting
→ Click "Add another site"
→ Site ID: `rentzoo-a39ea-admin`
→ Click Create

### 3. Link hosting targets
Run from the project root (`JCB rent/` folder):
```bash
firebase target:apply hosting customer rentzoo-a39ea
firebase target:apply hosting admin rentzoo-a39ea-admin
```

---

## Deploy Everything (Full Stack)

Run from the project root (`JCB rent/` folder):

```bash
# Deploy Functions + Both Hosting sites + Firestore rules
firebase deploy
```

Or deploy individually:

```bash
# Only backend (Firebase Functions)
firebase deploy --only functions

# Only customer web app
firebase deploy --only hosting:customer

# Only admin panel
firebase deploy --only hosting:admin

# Only Firestore rules
firebase deploy --only firestore
```

---

## After First Deploy — Set Environment Variables

The backend reads env vars automatically from `backend/.env.production`.
Firebase Functions picks up `.env.production` automatically during deployment.

If you need to update secrets (e.g., SMS API key), just edit `backend/.env.production`
and redeploy functions:
```bash
firebase deploy --only functions
```

---

## Live URLs After Deployment

| Service | URL |
|---|---|
| Customer Web App | https://rentzoo-a39ea.web.app |
| Admin Panel | https://rentzoo-a39ea-admin.web.app |
| Backend API (via Hosting) | https://rentzoo-a39ea.web.app/api |
| Backend API (direct) | https://us-central1-rentzoo-a39ea.cloudfunctions.net/api |
| Health Check | https://rentzoo-a39ea.web.app/api/health |

---

## Flutter Apps
The Flutter apps already point to the production API URL (`https://rentzoo-a39ea.web.app/api`).
Build APKs normally:
```bash
cd customer_app
flutter build apk --release

cd vendor_app
flutter build apk --release
```

---

## Local Development (unchanged)
```bash
cd backend
npm run dev         # API on http://localhost:3000

cd heavyrent-web
npm run dev         # Customer web on http://localhost:5173

cd admin-panel
npm run dev         # Admin panel on http://localhost:5174
```
