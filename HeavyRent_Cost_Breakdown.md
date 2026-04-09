# HeavyRent - Firebase & API Cost Breakdown

**Prepared by:** Vibe6 Digital LLP
**Client:** Suryaprakash
**Date:** 9th March 2026
**Project:** HeavyRent - Heavy Equipment Rental Platform

---

## 1. Firebase Services (Required)

### Plan: Blaze (Pay-as-you-go)
> Note: Blaze Plan requires a Visa/Mastercard credit or debit card. Charges apply ONLY when free tier limits are exceeded.

| Service | Free Tier (Monthly) | Cost After Free Tier | Expected Monthly Cost (MVP) |
|---------|---------------------|----------------------|-----------------------------|
| **Phone Auth (OTP SMS)** | 10,000 verifications/month | ~₹0.06 per SMS (India) | ₹0 (under 10K users) |
| **Firestore - Reads** | 50,000 reads/day | ₹5 per 100K reads | ₹0 |
| **Firestore - Writes** | 20,000 writes/day | ₹15 per 100K writes | ₹0 |
| **Firestore - Deletes** | 20,000 deletes/day | ₹1.5 per 100K deletes | ₹0 |
| **Firestore - Storage** | 1 GB total | ₹15 per GB/month | ₹0 |
| **Cloud Storage (Photos)** | 5 GB storage | ₹2.2 per GB/month | ₹0 |
| **Cloud Storage - Downloads** | 1 GB/day | ₹1 per GB | ₹0 |
| **Firebase Hosting** | 10 GB transfer/month | ₹12.5 per GB | ₹0 |

### **Estimated Monthly Cost (MVP Phase - up to 500 users): ₹0**
### **Estimated Monthly Cost (Growth Phase - 500-5,000 users): ₹200 - ₹1,000**
### **Estimated Monthly Cost (Scale Phase - 5,000-50,000 users): ₹1,000 - ₹5,000**

---

## 2. Gemini AI API (Optional - Future Feature)

> Currently Smart Estimate is rule-based (no AI cost). Gemini integration can be added in future for better estimates.

| Model | Free Tier | Paid Price | Use Case |
|-------|-----------|------------|----------|
| **Gemini 2.0 Flash** | 15 requests/min, 1M tokens/day | ~₹6 per 1M input tokens | Smart Estimate, Recommendations |
| **Gemini 2.0 Pro** | 2 requests/min | ~₹10 per 1M input tokens | Advanced AI features |

### **Estimated Monthly Cost (if enabled): ₹0 (Free tier sufficient for MVP)**
### **Estimated Monthly Cost (Growth Phase): ₹100 - ₹500**

---

## 3. Other Costs

| Item | Cost | Notes |
|------|------|-------|
| Firebase Custom Domain | ₹0 | Free with hosting |
| SSL Certificate | ₹0 | Free (auto by Firebase) |
| Google Play Store (App Publish) | ₹2,100 (one-time) | Developer account registration |
| Apple App Store (if needed) | ₹8,300/year | Developer program membership |

---

## 4. Total Cost Summary

| Phase | Monthly Cost | Duration |
|-------|-------------|----------|
| **MVP Launch (0-500 users)** | **₹0** | First 3-6 months |
| **Growth (500-5,000 users)** | **₹200 - ₹1,500** | 6-12 months |
| **Scale (5,000-50,000 users)** | **₹1,000 - ₹5,500** | 12+ months |

---

## 5. What Client Needs to Do

1. **Create a Firebase Project** at [console.firebase.google.com](https://console.firebase.google.com)
2. **Enable Blaze Plan** — Add a Visa/Mastercard Credit or Debit Card
3. **Set Budget Alert** at ₹500/month to avoid unexpected charges
4. **Share access** with development team (Owner/Editor role)

### Required from Client:
- [x] Firebase project creation
- [x] Blaze Plan activation (card required)
- [x] Budget alert setup
- [x] Share project access with dev team email

---

## 6. Safety & Billing Protection

- **Budget alerts** will be configured to notify at ₹500
- Firebase **does NOT auto-upgrade** — charges are only for usage beyond free tier
- Client can **monitor usage** anytime from Firebase Console
- Card will **NOT be charged** as long as usage stays within free limits

---

> **Bottom Line:** HeavyRent will cost **₹0/month** during MVP launch. Even at scale with thousands of users, monthly costs will stay under **₹5,000-6,000**. This is significantly cheaper than traditional server hosting.

---

*Document prepared by Vibe6 Digital LLP*
