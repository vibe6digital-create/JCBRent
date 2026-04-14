import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layouts
import CustomerLayout from './components/layout/CustomerLayout';
import VendorLayout from './components/layout/VendorLayout';

// Pages
import Landing from './pages/Landing/Landing';
import Login from './pages/Auth/Login';
import OTPVerify from './pages/Auth/OTPVerify';
import ProfileSetup from './pages/Auth/ProfileSetup';

// Customer
import CustomerHome from './pages/Customer/Home/CustomerHome';
import CustomerSearch from './pages/Customer/Search/CustomerSearch';
import MachineDetail from './pages/Customer/Machine/MachineDetail';
import CreateBooking from './pages/Customer/Booking/CreateBooking';
import MyBookings from './pages/Customer/Booking/MyBookings';
import BookingDetail from './pages/Customer/Booking/BookingDetail';
import LiveTracking from './pages/Customer/Tracking/LiveTracking';
import CustomerEstimate from './pages/Customer/Estimate/CustomerEstimate';
import MyEstimates from './pages/Customer/Estimate/MyEstimates';
import CustomerNotifications from './pages/Customer/Notifications/CustomerNotifications';
import CustomerProfile from './pages/Customer/Profile/CustomerProfile';
import EditProfile from './pages/Customer/Profile/EditProfile';
import HelpSupport from './pages/Customer/Help/HelpSupport';

// Vendor
import VendorHome from './pages/Vendor/Home/VendorHome';
import VendorMachines from './pages/Vendor/Machines/VendorMachines';
import AddMachine from './pages/Vendor/Machines/AddMachine';
import EditMachine from './pages/Vendor/Machines/EditMachine';
import EditVendorProfile from './pages/Vendor/Profile/EditVendorProfile';
import VendorBookings from './pages/Vendor/Bookings/VendorBookings';
import VendorEarnings from './pages/Vendor/Earnings/VendorEarnings';
import VendorNotifications from './pages/Vendor/Notifications/VendorNotifications';
import VendorProfile from './pages/Vendor/Profile/VendorProfile';

function CustomerGuard({ children }: { children: React.ReactNode }) {
  const { role, loading } = useAuth();
  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}><span className="spin" style={{ width: 32, height: 32, border: '3px solid #E5E7EB', borderTopColor: '#FF8C00', borderRadius: '50%', display: 'inline-block' }} /></div>;
  if (!role) return <Navigate to="/" replace />;
  if (role === 'vendor') return <Navigate to="/vendor/home" replace />;
  return <>{children}</>;
}

function VendorGuard({ children }: { children: React.ReactNode }) {
  const { role, loading } = useAuth();
  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}><span className="spin" style={{ width: 32, height: 32, border: '3px solid #E5E7EB', borderTopColor: '#FF8C00', borderRadius: '50%', display: 'inline-block' }} /></div>;
  if (!role) return <Navigate to="/" replace />;
  if (role === 'customer') return <Navigate to="/customer/home" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/otp" element={<OTPVerify />} />
      <Route path="/profile-setup" element={<ProfileSetup />} />

      {/* Customer */}
      <Route element={<CustomerGuard><CustomerLayout /></CustomerGuard>}>
        <Route path="/customer/home" element={<CustomerHome />} />
        <Route path="/customer/search" element={<CustomerSearch />} />
        <Route path="/customer/machine/:id" element={<MachineDetail />} />
        <Route path="/customer/book/:machineId" element={<CreateBooking />} />
        <Route path="/customer/bookings" element={<MyBookings />} />
        <Route path="/customer/bookings/:id" element={<BookingDetail />} />
        <Route path="/customer/tracking/:id" element={<LiveTracking />} />
        <Route path="/customer/estimate" element={<CustomerEstimate />} />
        <Route path="/customer/estimates" element={<MyEstimates />} />
        <Route path="/customer/notifications" element={<CustomerNotifications />} />
        <Route path="/customer/profile" element={<CustomerProfile />} />
        <Route path="/customer/profile/edit" element={<EditProfile />} />
        <Route path="/customer/help" element={<HelpSupport />} />
      </Route>

      {/* Vendor */}
      <Route element={<VendorGuard><VendorLayout /></VendorGuard>}>
        <Route path="/vendor/home" element={<VendorHome />} />
        <Route path="/vendor/machines" element={<VendorMachines />} />
        <Route path="/vendor/machines/add" element={<AddMachine />} />
        <Route path="/vendor/machines/:id/edit" element={<EditMachine />} />
        <Route path="/vendor/bookings" element={<VendorBookings />} />
        <Route path="/vendor/earnings" element={<VendorEarnings />} />
        <Route path="/vendor/notifications" element={<VendorNotifications />} />
        <Route path="/vendor/profile" element={<VendorProfile />} />
        <Route path="/vendor/profile/edit" element={<EditVendorProfile />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ style: { background: '#1A1A2E', color: '#fff', borderRadius: 12, fontSize: 13 } }} />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
