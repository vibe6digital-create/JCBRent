import type {
  User, Machine, Booking, Estimate, Category, ServiceArea, DashboardStats
} from '../types';

export const mockUsers: User[] = [
  { uid: 'u1', phone: '+91 98765 43210', name: 'Ramesh Kumar', email: 'ramesh@gmail.com', role: 'customer', city: 'Mumbai', state: 'Maharashtra', isActive: true, createdAt: '2024-11-10' },
  { uid: 'u2', phone: '+91 87654 32109', name: 'Suresh Patel', email: 'suresh@gmail.com', role: 'vendor', city: 'Pune', state: 'Maharashtra', isActive: true, createdAt: '2024-11-15' },
  { uid: 'u3', phone: '+91 76543 21098', name: 'Anil Sharma', email: 'anil@gmail.com', role: 'customer', city: 'Delhi', state: 'Delhi', isActive: true, createdAt: '2024-12-01' },
  { uid: 'u4', phone: '+91 65432 10987', name: 'Vijay Singh', email: 'vijay@gmail.com', role: 'vendor', city: 'Nagpur', state: 'Maharashtra', isActive: false, createdAt: '2024-12-05' },
  { uid: 'u5', phone: '+91 54321 09876', name: 'Priya Desai', email: 'priya@gmail.com', role: 'customer', city: 'Ahmedabad', state: 'Gujarat', isActive: true, createdAt: '2024-12-10' },
  { uid: 'u6', phone: '+91 43210 98765', name: 'Mohan Reddy', email: 'mohan@gmail.com', role: 'vendor', city: 'Hyderabad', state: 'Telangana', isActive: true, createdAt: '2024-12-12' },
  { uid: 'u7', phone: '+91 32109 87654', name: 'Kavita Joshi', email: 'kavita@gmail.com', role: 'customer', city: 'Jaipur', state: 'Rajasthan', isActive: true, createdAt: '2024-12-18' },
  { uid: 'u8', phone: '+91 21098 76543', name: 'Deepak Nair', email: 'deepak@gmail.com', role: 'vendor', city: 'Kochi', state: 'Kerala', isActive: true, createdAt: '2025-01-02' },
  { uid: 'u9', phone: '+91 10987 65432', name: 'Sanjay Gupta', role: 'customer', city: 'Lucknow', state: 'Uttar Pradesh', isActive: false, createdAt: '2025-01-08' },
  { uid: 'u10', phone: '+91 09876 54321', name: 'Ravi Chandran', email: 'ravi@gmail.com', role: 'vendor', city: 'Chennai', state: 'Tamil Nadu', isActive: true, createdAt: '2025-01-15' },
  { uid: 'u11', phone: '+91 98765 11111', name: 'Suryaprakash', email: 'admin@heavyrent.in', role: 'admin', city: 'Mumbai', state: 'Maharashtra', isActive: true, createdAt: '2024-10-01' },
];

export const mockMachines: Machine[] = [
  {
    id: 'm1', vendorId: 'u2', vendorName: 'Suresh Patel',
    category: 'JCB', model: 'JCB 3DX Plus', description: 'Well-maintained JCB backhoe loader, ideal for excavation and construction.',
    hourlyRate: 1200, dailyRate: 8000, images: [],
    location: { city: 'Pune', state: 'Maharashtra' },
    serviceAreas: ['Pune', 'Mumbai', 'Nashik'],
    isAvailable: true, approvalStatus: 'approved', createdAt: '2024-11-20',
  },
  {
    id: 'm2', vendorId: 'u6', vendorName: 'Mohan Reddy',
    category: 'Excavator', model: 'Caterpillar 320', description: 'Heavy-duty CAT excavator, perfect for large-scale earthmoving.',
    hourlyRate: 1800, dailyRate: 12000, images: [],
    location: { city: 'Hyderabad', state: 'Telangana' },
    serviceAreas: ['Hyderabad', 'Secunderabad', 'Warangal'],
    isAvailable: true, approvalStatus: 'approved', createdAt: '2024-12-01',
  },
  {
    id: 'm3', vendorId: 'u4', vendorName: 'Vijay Singh',
    category: 'Crane', model: 'Tadano 50T', description: '50-ton capacity mobile crane for heavy lifting operations.',
    hourlyRate: 2500, dailyRate: 18000, images: [],
    location: { city: 'Nagpur', state: 'Maharashtra' },
    serviceAreas: ['Nagpur', 'Amravati'],
    isAvailable: false, approvalStatus: 'pending', createdAt: '2025-01-10',
  },
  {
    id: 'm4', vendorId: 'u8', vendorName: 'Deepak Nair',
    category: 'Bulldozer', model: 'Komatsu D65', description: 'Powerful bulldozer for land clearing and grading.',
    hourlyRate: 1600, dailyRate: 10500, images: [],
    location: { city: 'Kochi', state: 'Kerala' },
    serviceAreas: ['Kochi', 'Thrissur', 'Kozhikode'],
    isAvailable: true, approvalStatus: 'approved', createdAt: '2025-01-05',
  },
  {
    id: 'm5', vendorId: 'u10', vendorName: 'Ravi Chandran',
    category: 'Roller', model: 'DYNAPAC CA250', description: 'Smooth drum roller for road construction and compaction.',
    hourlyRate: 900, dailyRate: 6000, images: [],
    location: { city: 'Chennai', state: 'Tamil Nadu' },
    serviceAreas: ['Chennai', 'Coimbatore', 'Madurai'],
    isAvailable: true, approvalStatus: 'approved', createdAt: '2025-01-20',
  },
  {
    id: 'm6', vendorId: 'u2', vendorName: 'Suresh Patel',
    category: 'Pokelane', model: 'Wirtgen W220Fi', description: 'Cold milling machine for asphalt and road renovation.',
    hourlyRate: 2200, dailyRate: 15000, images: [],
    location: { city: 'Pune', state: 'Maharashtra' },
    serviceAreas: ['Pune', 'Kolhapur'],
    isAvailable: true, approvalStatus: 'pending', createdAt: '2025-02-01',
  },
  {
    id: 'm7', vendorId: 'u6', vendorName: 'Mohan Reddy',
    category: 'JCB', model: 'JCB 2CX', description: 'Compact backhoe for urban construction and utility work.',
    hourlyRate: 900, dailyRate: 6000, images: [],
    location: { city: 'Hyderabad', state: 'Telangana' },
    serviceAreas: ['Hyderabad'],
    isAvailable: true, approvalStatus: 'rejected', createdAt: '2024-12-20',
  },
  {
    id: 'm8', vendorId: 'u4', vendorName: 'Vijay Singh',
    category: 'Excavator', model: 'Hitachi ZX200', description: 'Medium-class hydraulic excavator, versatile for all terrains.',
    hourlyRate: 1500, dailyRate: 10000, images: [],
    location: { city: 'Nagpur', state: 'Maharashtra' },
    serviceAreas: ['Nagpur', 'Wardha', 'Chandrapur'],
    isAvailable: false, approvalStatus: 'pending', createdAt: '2025-02-10',
  },
];

export const mockBookings: Booking[] = [
  {
    id: 'b1', customerId: 'u1', customerName: 'Ramesh Kumar', customerPhone: '+91 98765 43210',
    vendorId: 'u2', vendorName: 'Suresh Patel', machineId: 'm1', machineCategory: 'JCB', machineModel: 'JCB 3DX Plus',
    startDate: '2025-03-05', endDate: '2025-03-07', rateType: 'daily', rate: 8000, estimatedCost: 16000,
    workLocation: { address: 'Plot 45, Hadapsar', city: 'Pune' }, status: 'completed', createdAt: '2025-03-01',
  },
  {
    id: 'b2', customerId: 'u3', customerName: 'Anil Sharma', customerPhone: '+91 76543 21098',
    vendorId: 'u6', vendorName: 'Mohan Reddy', machineId: 'm2', machineCategory: 'Excavator', machineModel: 'Caterpillar 320',
    startDate: '2025-03-10', endDate: '2025-03-15', rateType: 'daily', rate: 12000, estimatedCost: 60000,
    workLocation: { address: 'NH44 Highway Project', city: 'Hyderabad' }, status: 'approved', createdAt: '2025-03-08',
  },
  {
    id: 'b3', customerId: 'u5', customerName: 'Priya Desai', customerPhone: '+91 54321 09876',
    vendorId: 'u8', vendorName: 'Deepak Nair', machineId: 'm4', machineCategory: 'Bulldozer', machineModel: 'Komatsu D65',
    startDate: '2025-03-18', endDate: '2025-03-20', rateType: 'daily', rate: 10500, estimatedCost: 21000,
    workLocation: { address: 'Kakkanad IT Park', city: 'Kochi' }, status: 'pending', createdAt: '2025-03-16',
  },
  {
    id: 'b4', customerId: 'u7', customerName: 'Kavita Joshi', customerPhone: '+91 32109 87654',
    vendorId: 'u10', vendorName: 'Ravi Chandran', machineId: 'm5', machineCategory: 'Roller', machineModel: 'DYNAPAC CA250',
    startDate: '2025-03-22', endDate: '2025-03-22', rateType: 'hourly', rate: 900, estimatedCost: 7200,
    workLocation: { address: 'Anna Salai Renovation', city: 'Chennai' }, status: 'pending', createdAt: '2025-03-19',
  },
  {
    id: 'b5', customerId: 'u9', customerName: 'Sanjay Gupta', customerPhone: '+91 10987 65432',
    vendorId: 'u2', vendorName: 'Suresh Patel', machineId: 'm1', machineCategory: 'JCB', machineModel: 'JCB 3DX Plus',
    startDate: '2025-02-20', endDate: '2025-02-22', rateType: 'daily', rate: 8000, estimatedCost: 16000,
    workLocation: { address: 'Hinjewadi Phase 3', city: 'Pune' }, status: 'rejected', createdAt: '2025-02-18',
  },
  {
    id: 'b6', customerId: 'u1', customerName: 'Ramesh Kumar', customerPhone: '+91 98765 43210',
    vendorId: 'u6', vendorName: 'Mohan Reddy', machineId: 'm2', machineCategory: 'Excavator', machineModel: 'Caterpillar 320',
    startDate: '2025-03-25', endDate: '2025-03-28', rateType: 'daily', rate: 12000, estimatedCost: 36000,
    workLocation: { address: 'Outer Ring Road, Uppal', city: 'Hyderabad' }, status: 'approved', createdAt: '2025-03-20',
    notes: 'Need operator with minimum 5 years experience',
  },
];

export const mockEstimates: Estimate[] = [
  {
    id: 'e1', customerId: 'u1', customerName: 'Ramesh Kumar',
    workType: 'excavation', areaSize: 'large', soilType: 'mixed', machineCategory: 'Excavator',
    estimatedTimeHoursMin: 16, estimatedTimeHoursMax: 24, estimatedCostMin: 28800, estimatedCostMax: 43200,
    createdAt: '2025-02-28',
  },
  {
    id: 'e2', customerId: 'u3', customerName: 'Anil Sharma',
    workType: 'foundation', areaSize: 'medium', soilType: 'hard_rocky', machineCategory: 'JCB',
    estimatedTimeHoursMin: 10, estimatedTimeHoursMax: 14, estimatedCostMin: 12000, estimatedCostMax: 16800,
    createdAt: '2025-03-05',
  },
  {
    id: 'e3', customerId: 'u5', customerName: 'Priya Desai',
    workType: 'leveling', areaSize: 'small', soilType: 'soft', machineCategory: 'Bulldozer',
    estimatedTimeHoursMin: 4, estimatedTimeHoursMax: 6, estimatedCostMin: 6400, estimatedCostMax: 9600,
    createdAt: '2025-03-10',
  },
  {
    id: 'e4', customerId: 'u7', customerName: 'Kavita Joshi',
    workType: 'trenching', areaSize: 'medium', soilType: 'not_sure', machineCategory: 'JCB',
    estimatedTimeHoursMin: 8, estimatedTimeHoursMax: 12, estimatedCostMin: 9600, estimatedCostMax: 14400,
    createdAt: '2025-03-12',
  },
  {
    id: 'e5', customerId: 'u9', customerName: 'Sanjay Gupta',
    workType: 'debris_removal', areaSize: 'large', soilType: 'mixed', machineCategory: 'Excavator',
    estimatedTimeHoursMin: 20, estimatedTimeHoursMax: 30, estimatedCostMin: 36000, estimatedCostMax: 54000,
    createdAt: '2025-03-15',
  },
];

export const mockCategories: Category[] = [
  { id: 'c1', name: 'JCB', icon: '🚜', isActive: true, createdAt: '2024-10-01' },
  { id: 'c2', name: 'Excavator', icon: '⛏️', isActive: true, createdAt: '2024-10-01' },
  { id: 'c3', name: 'Crane', icon: '🏗️', isActive: true, createdAt: '2024-10-01' },
  { id: 'c4', name: 'Bulldozer', icon: '🚧', isActive: true, createdAt: '2024-10-01' },
  { id: 'c5', name: 'Roller', icon: '🛞', isActive: true, createdAt: '2024-10-01' },
  { id: 'c6', name: 'Pokelane', icon: '🛣️', isActive: true, createdAt: '2024-10-01' },
  { id: 'c7', name: 'Other', icon: '⚙️', isActive: false, createdAt: '2024-10-01' },
];

export const mockServiceAreas: ServiceArea[] = [
  { id: 'sa1', city: 'Mumbai', state: 'Maharashtra', isActive: true, createdAt: '2024-10-01' },
  { id: 'sa2', city: 'Pune', state: 'Maharashtra', isActive: true, createdAt: '2024-10-01' },
  { id: 'sa3', city: 'Nagpur', state: 'Maharashtra', isActive: true, createdAt: '2024-10-01' },
  { id: 'sa4', city: 'Delhi', state: 'Delhi', isActive: true, createdAt: '2024-10-01' },
  { id: 'sa5', city: 'Hyderabad', state: 'Telangana', isActive: true, createdAt: '2024-10-01' },
  { id: 'sa6', city: 'Chennai', state: 'Tamil Nadu', isActive: true, createdAt: '2024-10-01' },
  { id: 'sa7', city: 'Ahmedabad', state: 'Gujarat', isActive: true, createdAt: '2024-10-01' },
  { id: 'sa8', city: 'Kochi', state: 'Kerala', isActive: true, createdAt: '2024-10-01' },
  { id: 'sa9', city: 'Jaipur', state: 'Rajasthan', isActive: false, createdAt: '2024-11-01' },
  { id: 'sa10', city: 'Lucknow', state: 'Uttar Pradesh', isActive: false, createdAt: '2024-11-01' },
];

export const mockDashboardStats: DashboardStats = {
  totalUsers: 10,
  customers: 5,
  vendors: 5,
  totalMachines: 8,
  approvedMachines: 4,
  pendingMachines: 3,
  totalBookings: 6,
  pendingBookings: 2,
  completedBookings: 1,
  totalEstimates: 5,
  revenue: 156200,
};
