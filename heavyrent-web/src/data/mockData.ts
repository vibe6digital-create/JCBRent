import type { Machine, Booking, Estimate, Notification } from '../types';

export const MACHINE_ICONS: Record<string, string> = {
  JCB: '🚜', Excavator: '⛏️', Pokelane: '🛣️', Crane: '🏗️', Bulldozer: '🚧', Roller: '🛞',
};

export const mockMachines: Machine[] = [
  {
    id: 'm1', vendorId: 'v1', vendorName: 'Suresh Patel', vendorPhone: '+91 87654 32109',
    category: 'JCB', model: 'JCB 3DX Plus', description: 'Well-maintained JCB backhoe loader with experienced operator. Perfect for excavation, trenching, and general construction work. Available with or without operator.',
    hourlyRate: 1200, dailyRate: 8000, images: [],
    location: { city: 'Pune', state: 'Maharashtra' },
    serviceAreas: ['Pune', 'Mumbai', 'Nashik', 'Aurangabad'],
    isAvailable: true, approvalStatus: 'approved', createdAt: '2024-11-20',
  },
  {
    id: 'm2', vendorId: 'v2', vendorName: 'Mohan Reddy', vendorPhone: '+91 65432 10987',
    category: 'Excavator', model: 'Caterpillar 320', description: 'Heavy-duty CAT excavator ideal for large-scale earthmoving, foundation digging, and site clearing. GPS-equipped for accurate operation.',
    hourlyRate: 1800, dailyRate: 12000, images: [],
    location: { city: 'Hyderabad', state: 'Telangana' },
    serviceAreas: ['Hyderabad', 'Secunderabad', 'Warangal', 'Vijayawada'],
    isAvailable: true, approvalStatus: 'approved', createdAt: '2024-12-01',
  },
  {
    id: 'm3', vendorId: 'v3', vendorName: 'Deepak Nair', vendorPhone: '+91 54321 09876',
    category: 'Bulldozer', model: 'Komatsu D65EX', description: 'Powerful bulldozer for land clearing, grading, and site preparation. Equipped with blade float for fine grading.',
    hourlyRate: 1600, dailyRate: 10500, images: [],
    location: { city: 'Kochi', state: 'Kerala' },
    serviceAreas: ['Kochi', 'Thrissur', 'Kozhikode', 'Thiruvananthapuram'],
    isAvailable: true, approvalStatus: 'approved', createdAt: '2025-01-05',
  },
  {
    id: 'm4', vendorId: 'v4', vendorName: 'Ravi Chandran', vendorPhone: '+91 43210 98765',
    category: 'Roller', model: 'DYNAPAC CA250D', description: 'Smooth drum vibratory roller perfect for road construction, soil compaction, and asphalt laying.',
    hourlyRate: 900, dailyRate: 6000, images: [],
    location: { city: 'Chennai', state: 'Tamil Nadu' },
    serviceAreas: ['Chennai', 'Coimbatore', 'Madurai', 'Salem'],
    isAvailable: true, approvalStatus: 'approved', createdAt: '2025-01-20',
  },
  {
    id: 'm5', vendorId: 'v1', vendorName: 'Suresh Patel', vendorPhone: '+91 87654 32109',
    category: 'Crane', model: 'Tadano 50T Mobile', description: '50-ton capacity all-terrain mobile crane for heavy lifting, bridge construction, and industrial projects.',
    hourlyRate: 2500, dailyRate: 18000, images: [],
    location: { city: 'Pune', state: 'Maharashtra' },
    serviceAreas: ['Pune', 'Mumbai', 'Navi Mumbai'],
    isAvailable: false, approvalStatus: 'approved', createdAt: '2024-12-15',
  },
  {
    id: 'm6', vendorId: 'v2', vendorName: 'Mohan Reddy', vendorPhone: '+91 65432 10987',
    category: 'JCB', model: 'JCB 2CX Compact', description: 'Compact backhoe loader ideal for urban construction, narrow lanes, and utility work. Easy to transport.',
    hourlyRate: 900, dailyRate: 6000, images: [],
    location: { city: 'Hyderabad', state: 'Telangana' },
    serviceAreas: ['Hyderabad', 'Secunderabad'],
    isAvailable: true, approvalStatus: 'approved', createdAt: '2024-12-20',
  },
  {
    id: 'm7', vendorId: 'v5', vendorName: 'Vijay Singh', vendorPhone: '+91 32109 87654',
    category: 'Excavator', model: 'Hitachi ZX200', description: 'Medium-class hydraulic excavator. Versatile for all terrains — soft soil to rocky ground. Well-maintained with logbook.',
    hourlyRate: 1500, dailyRate: 10000, images: [],
    location: { city: 'Delhi', state: 'Delhi' },
    serviceAreas: ['Delhi', 'Noida', 'Gurugram', 'Faridabad'],
    isAvailable: true, approvalStatus: 'approved', createdAt: '2025-01-10',
  },
  {
    id: 'm8', vendorId: 'v5', vendorName: 'Vijay Singh', vendorPhone: '+91 32109 87654',
    category: 'Pokelane', model: 'Wirtgen W220Fi', description: 'Cold milling machine for asphalt resurfacing and road renovation. High productivity with dust suppression system.',
    hourlyRate: 2200, dailyRate: 15000, images: [],
    location: { city: 'Delhi', state: 'Delhi' },
    serviceAreas: ['Delhi', 'Noida', 'Greater Noida'],
    isAvailable: true, approvalStatus: 'approved', createdAt: '2025-02-01',
  },
];

export const mockCustomerBookings: Booking[] = [
  {
    id: 'b1', customerId: 'cu1', customerName: 'Ramesh Kumar', customerPhone: '+91 98765 43210',
    vendorId: 'v1', vendorName: 'Suresh Patel', vendorPhone: '+91 87654 32109',
    machineId: 'm1', machineCategory: 'JCB', machineModel: 'JCB 3DX Plus',
    startDate: '2025-03-05', endDate: '2025-03-07', startTime: '08:00',
    rateType: 'daily', rate: 8000, estimatedCost: 16000,
    workLocation: 'Plot 45, Hadapsar Industrial Area', workCity: 'Pune',
    status: 'completed', rating: 5, review: 'Excellent service! Machine was in perfect condition.', createdAt: '2025-03-01',
  },
  {
    id: 'b2', customerId: 'cu1', customerName: 'Ramesh Kumar', customerPhone: '+91 98765 43210',
    vendorId: 'v2', vendorName: 'Mohan Reddy', vendorPhone: '+91 65432 10987',
    machineId: 'm2', machineCategory: 'Excavator', machineModel: 'Caterpillar 320',
    startDate: '2025-03-20', endDate: '2025-03-25', startTime: '09:00',
    rateType: 'daily', rate: 12000, estimatedCost: 60000,
    workLocation: 'NH44 Highway Project, Uppal', workCity: 'Hyderabad',
    status: 'in_progress', createdAt: '2025-03-15',
  },
  {
    id: 'b3', customerId: 'cu1', customerName: 'Ramesh Kumar', customerPhone: '+91 98765 43210',
    vendorId: 'v3', vendorName: 'Deepak Nair', vendorPhone: '+91 54321 09876',
    machineId: 'm3', machineCategory: 'Bulldozer', machineModel: 'Komatsu D65EX',
    startDate: '2025-04-01', endDate: '2025-04-03', startTime: '08:00',
    rateType: 'daily', rate: 10500, estimatedCost: 21000,
    workLocation: 'Kakkanad IT Park Phase 2', workCity: 'Kochi',
    status: 'accepted', createdAt: '2025-03-22',
  },
  {
    id: 'b4', customerId: 'cu1', customerName: 'Ramesh Kumar', customerPhone: '+91 98765 43210',
    vendorId: 'v4', vendorName: 'Ravi Chandran', vendorPhone: '+91 43210 98765',
    machineId: 'm4', machineCategory: 'Roller', machineModel: 'DYNAPAC CA250D',
    startDate: '2025-04-10', endDate: '2025-04-10', startTime: '07:00',
    rateType: 'hourly', rate: 900, estimatedCost: 7200,
    workLocation: 'Anna Salai Road Widening Project', workCity: 'Chennai',
    status: 'pending', notes: 'Need experienced operator', createdAt: '2025-03-25',
  },
  {
    id: 'b5', customerId: 'cu1', customerName: 'Ramesh Kumar', customerPhone: '+91 98765 43210',
    vendorId: 'v5', vendorName: 'Vijay Singh', vendorPhone: '+91 32109 87654',
    machineId: 'm7', machineCategory: 'Excavator', machineModel: 'Hitachi ZX200',
    startDate: '2025-02-10', endDate: '2025-02-12', startTime: '09:00',
    rateType: 'daily', rate: 10000, estimatedCost: 20000,
    workLocation: 'Sector 62 Commercial Plot', workCity: 'Noida',
    status: 'rejected', createdAt: '2025-02-05',
  },
];

export const mockVendorBookings: Booking[] = [
  {
    id: 'vb1', customerId: 'cu2', customerName: 'Anil Sharma', customerPhone: '+91 76543 21098',
    vendorId: 'v1', vendorName: 'Suresh Patel', vendorPhone: '+91 87654 32109',
    machineId: 'm1', machineCategory: 'JCB', machineModel: 'JCB 3DX Plus',
    startDate: '2025-03-28', endDate: '2025-03-30', startTime: '08:00',
    rateType: 'daily', rate: 8000, estimatedCost: 16000,
    workLocation: 'Wakad Residential Township', workCity: 'Pune',
    status: 'pending', notes: 'Please bring fuel for 2 days', createdAt: '2025-03-24',
  },
  {
    id: 'vb2', customerId: 'cu3', customerName: 'Priya Desai', customerPhone: '+91 54321 09876',
    vendorId: 'v1', vendorName: 'Suresh Patel', vendorPhone: '+91 87654 32109',
    machineId: 'm1', machineCategory: 'JCB', machineModel: 'JCB 3DX Plus',
    startDate: '2025-03-10', endDate: '2025-03-12', startTime: '09:00',
    rateType: 'daily', rate: 8000, estimatedCost: 16000,
    workLocation: 'Baner Road Foundation Work', workCity: 'Pune',
    status: 'in_progress', createdAt: '2025-03-05',
  },
  {
    id: 'vb3', customerId: 'cu4', customerName: 'Sanjay Gupta', customerPhone: '+91 10987 65432',
    vendorId: 'v1', vendorName: 'Suresh Patel', vendorPhone: '+91 87654 32109',
    machineId: 'm5', machineCategory: 'Crane', machineModel: 'Tadano 50T Mobile',
    startDate: '2025-02-20', endDate: '2025-02-22', startTime: '07:00',
    rateType: 'daily', rate: 18000, estimatedCost: 36000,
    workLocation: 'Hinjewadi IT Phase 3 Steel Structure', workCity: 'Pune',
    status: 'completed', rating: 4, review: 'Good service, timely delivery.', createdAt: '2025-02-15',
  },
  {
    id: 'vb4', customerId: 'cu5', customerName: 'Kavita Joshi', customerPhone: '+91 32109 87654',
    vendorId: 'v1', vendorName: 'Suresh Patel', vendorPhone: '+91 87654 32109',
    machineId: 'm1', machineCategory: 'JCB', machineModel: 'JCB 3DX Plus',
    startDate: '2025-01-15', endDate: '2025-01-15', startTime: '10:00',
    rateType: 'hourly', rate: 1200, estimatedCost: 9600,
    workLocation: 'Magarpatta City Plot Clearing', workCity: 'Pune',
    status: 'completed', rating: 5, review: 'Very professional. Will hire again!', createdAt: '2025-01-10',
  },
  {
    id: 'vb5', customerId: 'cu6', customerName: 'Deepak Rao', customerPhone: '+91 21098 76543',
    vendorId: 'v1', vendorName: 'Suresh Patel', vendorPhone: '+91 87654 32109',
    machineId: 'm5', machineCategory: 'Crane', machineModel: 'Tadano 50T Mobile',
    startDate: '2025-03-18', endDate: '2025-03-18', startTime: '08:00',
    rateType: 'hourly', rate: 2500, estimatedCost: 20000,
    workLocation: 'Sus Road Villa Project', workCity: 'Pune',
    status: 'accepted', createdAt: '2025-03-16',
  },
];

export const mockEstimates: Estimate[] = [
  {
    id: 'e1', workType: 'excavation', areaSize: 'large', soilType: 'mixed',
    machineCategory: 'Excavator', estimatedTimeHoursMin: 16, estimatedTimeHoursMax: 24,
    estimatedCostMin: 28800, estimatedCostMax: 43200, createdAt: '2025-03-10',
  },
  {
    id: 'e2', workType: 'foundation', areaSize: 'medium', soilType: 'hard_rocky',
    machineCategory: 'JCB', estimatedTimeHoursMin: 10, estimatedTimeHoursMax: 14,
    estimatedCostMin: 12000, estimatedCostMax: 16800, createdAt: '2025-03-15',
  },
  {
    id: 'e3', workType: 'leveling', areaSize: 'small', soilType: 'soft',
    machineCategory: 'Bulldozer', estimatedTimeHoursMin: 4, estimatedTimeHoursMax: 6,
    estimatedCostMin: 6400, estimatedCostMax: 9600, createdAt: '2025-03-20',
  },
];

export const mockCustomerNotifications: Notification[] = [
  { id: 'n1', title: 'Booking Accepted!', body: 'Suresh Patel accepted your booking for JCB 3DX Plus. Work starts Apr 1.', type: 'booking_approved', isRead: false, createdAt: '2025-03-22' },
  { id: 'n2', title: 'Machine Dispatched', body: 'Your Caterpillar 320 is on the way to the work site. ETA: 45 minutes.', type: 'dispatched', isRead: false, createdAt: '2025-03-20' },
  { id: 'n3', title: 'Booking Completed', body: 'Your booking for JCB 3DX Plus has been completed. Rate your experience!', type: 'booking_completed', isRead: true, createdAt: '2025-03-07' },
  { id: 'n4', title: 'Booking Rejected', body: 'Vijay Singh declined your Excavator booking. Please try another vendor.', type: 'booking_rejected', isRead: true, createdAt: '2025-02-06' },
  { id: 'n5', title: 'Welcome to HeavyRent!', body: 'Find and book heavy equipment near you. Get your first Smart Estimate free!', type: 'general', isRead: true, createdAt: '2024-11-10' },
];

export const mockVendorNotifications: Notification[] = [
  { id: 'vn1', title: 'New Booking Request', body: 'Anil Sharma wants to book JCB 3DX Plus for Mar 28–30. Review and respond.', type: 'booking_request', isRead: false, createdAt: '2025-03-24' },
  { id: 'vn2', title: 'New Booking Request', body: 'Deepak Rao wants to book Tadano 50T for Mar 18. Review and respond.', type: 'booking_request', isRead: false, createdAt: '2025-03-16' },
  { id: 'vn3', title: 'Booking Completed', body: 'Sanjay Gupta\'s booking is marked complete. You earned ₹36,000!', type: 'booking_completed', isRead: true, createdAt: '2025-02-23' },
  { id: 'vn4', title: 'Payment Received', body: 'Payment of ₹9,600 received for Kavita Joshi\'s booking.', type: 'general', isRead: true, createdAt: '2025-01-16' },
];

export const VENDOR_EARNINGS = {
  total: 97600,
  thisMonth: 36000,
  thisWeek: 16000,
  today: 0,
  completedCount: 3,
};
