export type UserRole = 'customer' | 'vendor' | 'admin';
export type MachineCategory = 'JCB' | 'Excavator' | 'Pokelane' | 'Crane' | 'Bulldozer' | 'Roller' | 'Other';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';
export type VendorApprovalStatus = 'pending' | 'approved' | 'rejected';
export type BookingStatus = 'pending' | 'approved' | 'accepted' | 'arrived' | 'in_progress' | 'rejected' | 'completed' | 'cancelled';
export type RateType = 'hourly' | 'daily' | 'weekly' | 'monthly';
export type ProfileType = 'corporate' | 'personal';
export type BookingType = 'instant' | 'scheduled';
export type WorkType = 'excavation' | 'leveling' | 'trenching' | 'foundation' | 'debris_removal';
export type AreaSize = 'small' | 'medium' | 'large';
export type SoilType = 'soft' | 'mixed' | 'hard_rocky' | 'not_sure';

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
  vendorApprovalStatus?: VendorApprovalStatus;
  createdAt: string;
}

export interface Machine {
  id: string;
  vendorId: string;
  vendorName: string;
  category: MachineCategory;
  model: string;
  description: string;
  hourlyRate: number;
  dailyRate: number;
  weeklyRate?: number;
  monthlyRate?: number;
  images: string[];
  location: { city: string; state: string };
  serviceAreas: string[];
  machineYear?: number;
  isAvailable: boolean;
  approvalStatus: ApprovalStatus;
  createdAt: string;
}

export interface Booking {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  vendorId: string;
  vendorName: string;
  machineId: string;
  machineCategory: MachineCategory;
  machineModel: string;
  startDate: string;
  endDate: string;
  rateType: RateType;
  bookingType?: BookingType;
  rate: number;
  estimatedCost: number;
  couponCode?: string;
  discountAmount?: number;
  workLocation: { address: string; city: string };
  status: BookingStatus;
  notes?: string;
  cancellationReason?: string;
  cancelledBy?: 'customer' | 'admin';
  createdAt: string;
}

export interface Estimate {
  id: string;
  customerId: string;
  customerName: string;
  workType: WorkType;
  areaSize: AreaSize;
  soilType: SoilType;
  machineCategory?: MachineCategory;
  estimatedTimeHoursMin: number;
  estimatedTimeHoursMax: number;
  estimatedCostMin: number;
  estimatedCostMax: number;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  isActive: boolean;
  createdAt: string;
}

export interface ServiceArea {
  id: string;
  city: string;
  state: string;
  isActive: boolean;
  createdAt: string;
}

export type DiscountType = 'percent' | 'flat';

export interface Coupon {
  id: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  description?: string;
  isActive: boolean;
  usedCount: number;
  maxUses?: number;
  minBookingAmount?: number;
  maxDiscount?: number;
  expiryDate?: any;
  createdAt: string;
}

export type ReportReason = 'misleading_info' | 'safety_concern' | 'unavailable' | 'overpricing' | 'other';
export type ReportStatus = 'pending' | 'resolved' | 'dismissed';

export interface MachineReport {
  id: string;
  machineId: string;
  machineModel: string;
  machineCategory: MachineCategory;
  vendorId: string;
  vendorName: string;
  reporterId: string;
  reporterName: string;
  reason: ReportReason;
  details: string;
  status: ReportStatus;
  actionTaken?: 'dismissed' | 'machine_rejected';
  resolvedAt?: string;
  createdAt: string;
}

export interface DashboardStats {
  totalUsers: number;
  customers: number;
  vendors: number;
  totalMachines: number;
  approvedMachines: number;
  pendingMachines: number;
  totalBookings: number;
  pendingBookings: number;
  completedBookings: number;
  totalEstimates: number;
  revenue: number;
}
