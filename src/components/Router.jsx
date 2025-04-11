import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Checkout from './pricing/Checkout';
import PaymentSuccess from './pricing/PaymentSuccess';

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/payment-success" element={<PaymentSuccess />} />
      {/* Add other routes here */}
    </Routes>
  );
};

export default AppRouter; 