import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider, useNotifications } from './context/NotificationContext';
import { Toaster } from 'sonner';
import ProtectedRoute from './components/auth/ProtectedRoute';
import DashboardLayout from './components/userdashboard/DashboardLayout';
import LandingPage from './components/landing/LandingPage';
import Login from './components/auth/login';
import Register from './components/auth/register.tsx';
import Pricing from './components/pricing/Pricing';
import DashboardHome from './components/userdashboard/DashboardHome';
import Policies from './components/userdashboard/Policies';
import Subscription from './components/userdashboard/Subscription';
import UserProfile from './components/userdashboard/UserProfile';
import Packages from './components/userdashboard/Packages';
import PaymentForm from './components/userdashboard/PaymentForm';
import PolicyWizard from './components/userdashboard/PolicyWizard';
import NewPolicy from './components/userdashboard/NewPolicy';
import Settings from './components/settings/Settings';
import { cn } from './lib/utils';
import Checkout from './components/pricing/Checkout';

// Component to conditionally render Toaster based on notification settings
const NotificationToaster = () => {
  const { notificationsEnabled } = useNotifications();
  return notificationsEnabled ? <Toaster position="top-right" richColors /> : null;
};

const App = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <div className={cn(
          "min-h-screen bg-navy-900 text-white"
        )}>
          <NotificationToaster />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/checkout/:packageId" element={<Checkout />} />

            {/* Protected Dashboard Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route index element={<DashboardHome />} />
              <Route path="policies" element={<Policies />} />
              <Route path="new-policy" element={<PolicyWizard />} />
              <Route path="packages" element={<Packages />} />
              <Route path="subscription" element={<Subscription />} />
              <Route path="profile" element={<UserProfile />} />
              <Route path="payment" element={<PaymentForm />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* New Policy Route */}
            <Route path="/dashboard/new-policy" element={<NewPolicy />} />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </NotificationProvider>
    </AuthProvider>
  );
};

export default App;
