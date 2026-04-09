// ==================== USER TYPES ====================
export type UserRole = 'customer' | 'vendor' | 'admin';

export interface User {
  uid: string;
  phone: string;
  name: string;
  email?: string;
  role: UserRole;
  profileImage?: string;
  city?: string;
  state?: string;
  isActive: boolean;
  profileType?: 'personal' | 'corporate';
  referralCode?: string;
  referredBy?: string;
  isOnline?: boolean; // vendor online/offline status
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}

// ==================== MACHINE TYPES ====================
export type MachineCategory = 'JCB' | 'Excavator' | 'Pokelane' | 'Crane' | 'Bulldozer' | 'Roller' | 'Other';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface Machine {
  id: string;
  vendorId: string;
  vendorName: string;
  category: MachineCategory;
  model: string;
  description: string;
  hourlyRate: number;
  dailyRate: number;
  images: string[];
  location: {
    city: string;
    state: string;
    latitude: number;
    longitude: number;
  };
  serviceAreas: string[];
  isAvailable: boolean;
  approvalStatus: ApprovalStatus;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}

// ==================== BOOKING TYPES ====================
export type BookingStatus = 'pending' | 'approved' | 'accepted' | 'rejected' | 'in_progress' | 'arrived' | 'completed';

export interface Booking {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  vendorId: string;
  machineId: string;
  machineCategory: MachineCategory;
  machineModel: string;
  startDate: FirebaseFirestore.Timestamp;
  endDate: FirebaseFirestore.Timestamp;
  rateType: 'hourly' | 'daily' | 'weekly' | 'monthly';
  rate: number;
  estimatedCost: number;
  workLocation: {
    address: string;
    city: string;
    latitude: number;
    longitude: number;
  };
  status: BookingStatus;
  notes?: string;
  estimateId?: string;
  couponCode?: string;
  discountAmount?: number;
  startOtp?: string;
  isOtpVerified?: boolean;
  bookingType?: 'book_now' | 'book_later';
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}

// ==================== ESTIMATE TYPES ====================
export type WorkType = 'excavation' | 'leveling' | 'trenching' | 'foundation' | 'debris_removal';
export type AreaSize = 'small' | 'medium' | 'large';
export type SoilType = 'soft' | 'mixed' | 'hard_rocky' | 'not_sure';

export interface Estimate {
  id: string;
  customerId: string;
  photoUrls: string[];
  workType: WorkType;
  areaSize: AreaSize;
  soilType: SoilType;
  machineCategory?: MachineCategory;
  estimatedTimeHoursMin: number;
  estimatedTimeHoursMax: number;
  estimatedCostMin: number;
  estimatedCostMax: number;
  disclaimer: string;
  createdAt: FirebaseFirestore.Timestamp;
}

// ==================== NOTIFICATION TYPES ====================
export type NotificationType = 'booking_request' | 'booking_approved' | 'booking_rejected' | 'booking_completed' | 'general';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: NotificationType;
  referenceId?: string;
  isRead: boolean;
  createdAt: FirebaseFirestore.Timestamp;
}

// ==================== ADMIN TYPES ====================
export interface Category {
  id: string;
  name: string;
  icon?: string;
  isActive: boolean;
  createdAt: FirebaseFirestore.Timestamp;
}

export interface ServiceArea {
  id: string;
  city: string;
  state: string;
  isActive: boolean;
  createdAt: FirebaseFirestore.Timestamp;
}
