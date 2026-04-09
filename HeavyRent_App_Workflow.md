# HeavyRent - Complete App Workflow

**Prepared by:** Vibe6 Digital LLP
**Client:** Suryaprakash
**Date:** 9th March 2026
**Project:** HeavyRent - Heavy Equipment Rental Platform

---

## 1. Platform Overview

HeavyRent connects **heavy equipment owners (vendors)** with **customers** who need machines like JCB, Excavator, Crane, Bulldozer, Roller, and Pokelane on rent.

### Components

| Component | Technology | Platform |
|-----------|------------|----------|
| Customer Mobile App | Flutter | Android & iOS |
| Vendor/Driver Mobile App | Flutter | Android & iOS |
| Customer Website | React.js | Web Browser |
| Admin Panel | React.js | Web Browser |
| Backend API | Node.js + Express | Server |
| Database | Firebase Firestore | Cloud |
| Authentication | Firebase Phone Auth | OTP Based |
| File Storage | Firebase Cloud Storage | Cloud |

---

## 2. User Roles

| Role | Access | Description |
|------|--------|-------------|
| **Customer** | Mobile App + Website | Searches & books equipment |
| **Vendor** | Mobile App | Lists machines & manages bookings |
| **Admin** | Admin Panel (Web) | Manages entire platform |

---

## 3. Customer App Workflow

### 3.1 Onboarding & Authentication
```
App Open → Splash Screen → Login/Register Screen
    ↓
Enter Phone Number → Receive OTP → Verify OTP
    ↓
New User? → Enter Name, City → Profile Created
Existing User? → Redirect to Home
```

### 3.2 Home Screen
```
Home Screen
├── Search Bar (search by machine type / city)
├── Categories (JCB, Excavator, Crane, Bulldozer, Roller, Pokelane)
├── Featured Machines (nearby / top rated)
└── Recent Bookings (quick access)
```

### 3.3 Machine Search & Discovery
```
Customer enters search query / selects category
    ↓
Search Results Screen
├── Filter by: City, Category, Price Range
├── Sort by: Price (Low-High / High-Low)
└── Machine Cards (photo, name, price, location, rating)
    ↓
Tap on Machine → Machine Detail Screen
├── Machine Photos (gallery)
├── Machine Info (type, model, year, capacity)
├── Pricing (hourly / daily / monthly rates)
├── Vendor Info (name, rating)
├── Location / Service Area
└── "Book Now" Button
```

### 3.4 Smart Estimate Feature
```
Customer wants cost estimate before booking
    ↓
Smart Estimate Screen
├── Select Work Type (Digging, Loading, Leveling, etc.)
├── Enter Area (in sq ft / acres)
├── Select Soil Type (Normal, Rocky, Marshy)
    ↓
System calculates estimate using rule-based engine
    ↓
Estimate Result
├── Estimated Time (hours/days range)
├── Estimated Cost (₹ min - ₹ max)
└── "Proceed to Book" Button
```

### 3.5 Booking Flow
```
Customer taps "Book Now"
    ↓
Booking Form
├── Select Start Date & Time
├── Select Duration (hours/days)
├── Enter Work Location (address/pin)
├── Add Notes (optional)
    ↓
Review Booking Summary
├── Machine Details
├── Date & Duration
├── Estimated Cost
└── Confirm Booking
    ↓
Booking Created → Status: "PENDING"
    ↓
Notification sent to Vendor
```

### 3.6 Booking Status Tracking
```
PENDING → Waiting for vendor response
    ↓
ACCEPTED → Vendor accepted, machine assigned
    or
REJECTED → Vendor rejected (customer notified)
    ↓
IN_PROGRESS → Machine dispatched / work started
    ↓
COMPLETED → Work finished
    ↓
Customer can rate & review
```

### 3.7 Notifications
```
Customer receives notifications for:
├── Booking accepted / rejected by vendor
├── Machine dispatched
├── Booking status updates
├── Promotional offers (future)
└── Payment reminders (future)
```

### 3.8 Profile Management
```
Profile Screen
├── View/Edit Name, Phone, City
├── My Bookings (history)
├── My Estimates
├── Notifications
├── Help & Support
└── Logout
```

---

## 4. Vendor App Workflow

### 4.1 Onboarding & Authentication
```
App Open → Splash Screen → Login/Register
    ↓
Enter Phone Number → OTP Verification
    ↓
New Vendor? → Enter Details
├── Name, Business Name
├── City / Service Area
├── Aadhaar / Business Proof (future KYC)
    ↓
Profile Created → Awaiting Admin Approval (if needed)
```

### 4.2 Vendor Dashboard
```
Dashboard Screen
├── Total Earnings (today / week / month)
├── Active Bookings count
├── Pending Requests count
├── Machine Status Overview
└── Quick Actions (Add Machine, View Bookings)
```

### 4.3 Machine Management
```
My Machines Screen
├── List of all machines
├── Add New Machine
│   ├── Machine Type (JCB, Excavator, etc.)
│   ├── Model & Year
│   ├── Upload Photos
│   ├── Set Pricing (hourly / daily / monthly)
│   ├── Set Service Area (cities)
│   └── Submit → Pending Admin Approval
├── Edit Machine Details
├── Toggle Availability (Available / Unavailable)
└── Delete Machine
```

### 4.4 Booking Management
```
Booking Requests Screen
    ↓
New Request Notification → Tap to View
├── Customer Details
├── Machine Requested
├── Date, Duration, Location
├── Estimated Revenue
    ↓
Vendor can:
├── ACCEPT → Booking confirmed, customer notified
├── REJECT → Booking cancelled, customer notified
    ↓
After Accepting:
├── Mark as "IN_PROGRESS" (machine dispatched)
├── Mark as "COMPLETED" (work done)
```

### 4.5 Earnings & Reports
```
Earnings Screen
├── Today's Earnings
├── Weekly Summary
├── Monthly Summary
├── Booking-wise Breakdown
└── Export Report (future)
```

### 4.6 Vendor Profile
```
Profile Screen
├── Business Details
├── Service Areas
├── Documents (KYC - future)
├── Bank Details (for payouts - future)
├── Settings
└── Logout
```

---

## 5. Customer Website Workflow

### 5.1 Pages & Flow
```
Landing Page (Home)
├── Hero Section (search bar + tagline)
├── Categories Section
├── How It Works Section
├── Featured Machines
└── Footer (contact, links)
    ↓
Search Page → Browse & filter machines
    ↓
Machine Detail Page → View full details
    ↓
Login/Register (Phone OTP) → Book machine
    ↓
Smart Estimate Page → Get cost estimate
    ↓
Booking Page → Create booking
    ↓
Profile/Dashboard → Track bookings, notifications
```

---

## 6. Admin Panel Workflow

### 6.1 Admin Dashboard
```
Admin Login (email/password or phone OTP)
    ↓
Dashboard
├── Total Users (Customers + Vendors)
├── Total Machines Listed
├── Total Bookings (today / week / month)
├── Revenue Overview
├── Recent Activity Feed
└── Alerts (pending approvals, reported issues)
```

### 6.2 User Management
```
Users Section
├── All Customers List
│   ├── View Profile
│   ├── View Booking History
│   ├── Enable / Disable Account
│   └── Search & Filter
├── All Vendors List
│   ├── View Profile & Machines
│   ├── Approve / Reject Vendor
│   ├── View Earnings
│   ├── Enable / Disable Account
│   └── Search & Filter
```

### 6.3 Machine Management
```
Machines Section
├── All Machines List
├── Pending Approval Queue
│   ├── Review Machine Details & Photos
│   ├── Approve → Machine goes live
│   └── Reject → Vendor notified
├── Reported Machines
├── Categories Management
│   ├── Add / Edit / Delete Categories
│   └── Set Category Icons
└── Search & Filter
```

### 6.4 Booking Management
```
Bookings Section
├── All Bookings List
├── Filter by Status (Pending, Accepted, In-Progress, Completed, Rejected)
├── View Booking Details
├── Resolve Disputes (future)
└── Export Reports
```

### 6.5 Service Areas Management
```
Service Areas Section
├── Add New City / Area
├── Edit Area Details
├── Enable / Disable Areas
└── Map View (future)
```

### 6.6 Notifications Management
```
Notifications Section
├── Send Broadcast Notification (all users)
├── Send to Specific User Group
├── Notification History
└── Templates (future)
```

---

## 7. Complete Booking Lifecycle

```
┌──────────────────────────────────────────────────────────┐
│                    BOOKING LIFECYCLE                       │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  CUSTOMER                SYSTEM              VENDOR       │
│                                                           │
│  Search Machine ──────→                                   │
│  View Details ────────→                                   │
│  Smart Estimate ──────→  Calculate ───→  Show Result      │
│  Book Machine ────────→  Create Booking                   │
│                          Status: PENDING                  │
│                          ────────────→  Notification      │
│                                         View Request      │
│                                         Accept/Reject     │
│                          ←────────────                    │
│  Get Notification ←───  Status: ACCEPTED                  │
│                          or REJECTED                      │
│                                                           │
│                          Status: IN_PROGRESS              │
│  Track Status ←───────  ←────────────  Mark Started       │
│                                                           │
│                          Status: COMPLETED                │
│  Rate & Review ←──────  ←────────────  Mark Complete      │
│                                                           │
│  ─────────────── ADMIN MONITORS ALL ACTIVITY ──────────── │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

---

## 8. Data Flow Architecture

```
┌─────────────┐     ┌─────────────┐     ┌──────────────┐
│ Customer App│     │ Vendor App  │     │ Customer Web │
│  (Flutter)  │     │  (Flutter)  │     │   (React)    │
└──────┬──────┘     └──────┬──────┘     └──────┬───────┘
       │                   │                    │
       └───────────┬───────┴────────────┬───────┘
                   │                    │
                   ▼                    ▼
           ┌──────────────┐    ┌──────────────┐
           │  Backend API │    │  Admin Panel  │
           │ (Node + Express)  │   (React)    │
           └──────┬───────┘    └──────┬───────┘
                  │                    │
                  └────────┬───────────┘
                           │
                           ▼
                  ┌────────────────┐
                  │    Firebase     │
                  ├────────────────┤
                  │ • Firestore DB │
                  │ • Phone Auth   │
                  │ • Cloud Storage│
                  │ • Hosting      │
                  └────────────────┘
```

---

## 9. API Endpoints Overview

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user (customer/vendor) |
| GET | /api/auth/profile | Get user profile |
| PUT | /api/auth/profile | Update user profile |

### Machines
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/machines | List/search machines (public) |
| GET | /api/machines/:id | Get machine details |
| POST | /api/machines | Add new machine (vendor) |
| PUT | /api/machines/:id | Update machine (vendor) |
| DELETE | /api/machines/:id | Delete machine (vendor) |

### Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/bookings | Create booking (customer) |
| GET | /api/bookings/customer | List customer bookings |
| GET | /api/bookings/vendor | List vendor bookings |
| PUT | /api/bookings/:id/status | Update booking status |

### Estimates
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/estimates | Get smart estimate |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/notifications | List user notifications |
| PUT | /api/notifications/:id/read | Mark as read |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/admin/dashboard | Dashboard stats |
| GET | /api/admin/users | List all users |
| PUT | /api/admin/users/:id | Update user status |
| GET | /api/admin/machines | List all machines |
| PUT | /api/admin/machines/:id/approve | Approve/reject machine |
| GET | /api/admin/categories | List categories |
| POST | /api/admin/categories | Add category |
| GET | /api/admin/service-areas | List service areas |
| POST | /api/admin/service-areas | Add service area |

---

## 10. Security & Access Control

| Feature | Implementation |
|---------|---------------|
| Authentication | Firebase Phone OTP |
| Authorization | Role-based (customer, vendor, admin) |
| API Security | JWT Token verification on every request |
| Data Validation | Server-side input validation |
| Firestore Rules | Role-based read/write permissions |
| Storage Rules | Authenticated upload only |

---

## 11. Future Enhancements (Post-MVP)

| Feature | Description | Priority |
|---------|-------------|----------|
| Payment Gateway | Razorpay/PhonePe integration | High |
| Real-time Tracking | GPS tracking of machines | Medium |
| Chat System | In-app customer-vendor chat | Medium |
| KYC Verification | Aadhaar/PAN verification for vendors | High |
| Rating & Reviews | Post-booking review system | Medium |
| Referral System | Refer & earn for customers | Low |
| Multi-language | Hindi + Regional language support | Medium |
| Push Notifications | FCM push notifications | High |
| AI Smart Estimate | Gemini AI powered estimates | Low |
| Reports & Analytics | Advanced admin analytics | Medium |

---

*Document prepared by Vibe6 Digital LLP*
*© 2026 All Rights Reserved*
