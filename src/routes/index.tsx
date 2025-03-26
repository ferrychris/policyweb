import React, { type ReactElement, type ReactNode } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '../components/Layout';
import PolicyTypeSelector from '../components/PolicyTypeSelector';
import DashboardHome from '../components/userdashboard/DashboardHome';
import Policies from '../components/userdashboard/Policies';
import Subscription from '../components/userdashboard/Subscription';
import UserProfile from '../components/userdashboard/UserProfile';
import Packages from '../components/userdashboard/Packages';
import PaymentForm from '../components/userdashboard/PaymentForm';
import PolicyWizard from '../components/userdashboard/PolicyWizard';

// Policy type components
const AutoInsurance = (): ReactElement => (
  <div className="p-8 max-w-3xl mx-auto space-y-6">
    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-dark-heading">Auto Insurance</h1>
    <div className="bg-white dark:bg-dark-card shadow-lg rounded-lg p-8">
      <p className="text-base text-gray-500 dark:text-dark-text mb-4">
        Comprehensive auto insurance that protects against accidents, theft, and damage.
      </p>
    </div>
  </div>
);

const HomeInsurance = (): ReactElement => (
  <div className="p-8 max-w-3xl mx-auto space-y-6">
    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-dark-heading">Home Insurance</h1>
    <div className="bg-white dark:bg-dark-card shadow-lg rounded-lg p-8">
      <p className="text-base text-gray-500 dark:text-dark-text mb-4">
        Complete coverage for your home, including natural disasters and personal liability.
      </p>
    </div>
  </div>
);

const LifeInsurance = (): ReactElement => (
  <div className="p-8 max-w-3xl mx-auto space-y-6">
    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-dark-heading">Life Insurance</h1>
    <div className="bg-white dark:bg-dark-card shadow-lg rounded-lg p-8">
      <p className="text-base text-gray-500 dark:text-dark-text mb-4">
        Ensure your family's financial future with comprehensive life insurance coverage.
      </p>
    </div>
  </div>
);

const HealthInsurance = (): ReactElement => (
  <div className="p-8 max-w-3xl mx-auto space-y-6">
    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-dark-heading">Health Insurance</h1>
    <div className="bg-white dark:bg-dark-card shadow-lg rounded-lg p-8">
      <p className="text-base text-gray-500 dark:text-dark-text mb-4">
        Quality healthcare coverage including preventive care, prescriptions, and specialists.
      </p>
    </div>
  </div>
);

const Contact = (): ReactElement => (
  <div className="p-8 max-w-3xl mx-auto space-y-6">
    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-dark-heading">Contact Us</h1>
    <div className="bg-white dark:bg-dark-card shadow-lg rounded-lg p-8">
      <p className="text-base text-gray-500 dark:text-dark-text mb-4">
        Get in touch with our support team for any questions or concerns.
      </p>
    </div>
  </div>
);

interface WrappedComponentProps {
  Component: React.ComponentType;
}

const WrappedComponent = ({ Component }: WrappedComponentProps): ReactElement => {
  const content = <Component />;
  return (
    <Layout>
      {content}
    </Layout>
  );
};

const AppRoutes = (): ReactElement => {
  return (
    <Routes>
      <Route path="/" element={<WrappedComponent Component={DashboardHome} />} />
      <Route path="/dashboard" element={<WrappedComponent Component={DashboardHome} />} />
      <Route path="/dashboard/policies" element={<WrappedComponent Component={Policies} />} />
      <Route path="/dashboard/subscription" element={<WrappedComponent Component={Subscription} />} />
      <Route path="/dashboard/profile" element={<WrappedComponent Component={UserProfile} />} />
      <Route path="/dashboard/packages" element={<WrappedComponent Component={Packages} />} />
      <Route path="/dashboard/payment" element={<WrappedComponent Component={PaymentForm} />} />
      <Route path="/dashboard/new-policy" element={<WrappedComponent Component={PolicyWizard} />} />
      <Route path="/auto" element={<WrappedComponent Component={AutoInsurance} />} />
      <Route path="/home" element={<WrappedComponent Component={HomeInsurance} />} />
      <Route path="/life" element={<WrappedComponent Component={LifeInsurance} />} />
      <Route path="/health" element={<WrappedComponent Component={HealthInsurance} />} />
      <Route path="/contact" element={<WrappedComponent Component={Contact} />} />
    </Routes>
  );
};

export default AppRoutes;
