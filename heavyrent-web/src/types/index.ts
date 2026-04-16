export type UserRole = 'customer' | 'vendor';
export type MachineCategory = 'JCB' | 'Excavator' | 'Pokelane' | 'Crane' | 'Bulldozer' | 'Roller';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';
export type BookingStatus = 'pending' | 'accepted' | 'arrived' | 'in_progress' | 'completed' | 'rejected' | 'cancelled';
export type RateType = 'hourly' | 'daily' | 'weekly' | 'monthly';
export type ProfileType = 'corporate' | 'personal';
export type BookingType = 'instant' | 'scheduled';
export type WorkType = 'excavation' | 'leveling' | 'trenching' | 'foundation' | 'debris_removal';
export type AreaSize = 'small' | 'medium' | 'large';
export type SoilType = 'soft' | 'mixed' | 'hard_rocky' | 'not_sure';

export interface AuthUser {
  uid: string;
  phone: string;
  name: string;
  email?: string;
  role: UserRole;
  city?: string;
  state?: string;
  businessName?: string;
  rating?: number;
  totalMachines?: number;
  profileType?: ProfileType;
  referralCode?: string;
  isOnline?: boolean;
}

export interface Machine {
  id: string;
  vendorId: string;
  vendorName: string;
  vendorPhone: string;
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
  vendorPhone: string;
  machineId: string;
  machineCategory: MachineCategory;
  machineModel: string;
  startDate: string;
  endDate: string;
  startTime?: string;
  rateType: RateType;
  bookingType?: BookingType;
  rate: number;
  estimatedCost: number;
  couponCode?: string;
  discountAmount?: number;
  workLocation: string;
  workCity: string;
  vendorLat?: number;
  vendorLng?: number;
  vendorLocationUpdatedAt?: string;
  status: BookingStatus;
  notes?: string;
  rating?: number;
  review?: string;
  cancellationReason?: string;
  cancelledBy?: 'customer' | 'admin';
  createdAt: string;
}

export interface Estimate {
  id: string;
  workType: WorkType;
  areaSize: AreaSize;
  soilType: SoilType;
  machineCategory: MachineCategory;
  estimatedTimeHoursMin: number;
  estimatedTimeHoursMax: number;
  estimatedCostMin: number;
  estimatedCostMax: number;
  createdAt: string;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  type: 'booking_request' | 'booking_approved' | 'booking_rejected' | 'booking_completed' | 'dispatched' | 'general';
  isRead: boolean;
  createdAt: string;
}
