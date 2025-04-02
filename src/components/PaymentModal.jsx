import React, { useState } from 'react';
import { initializeStripeElements, confirmPayment, createPaymentIntent } from '../services/payments';

const PaymentModal = ({ productId, onClose }) => {
  const [email, setEmail] = useState('');
  const [cardElement, setCardElement] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const initializePayment = async () => {
    try {
      const card = initializeStripeElements();
      card.mount('#card-element');
      setCardElement(card);

      card.on('change', (event) => {
        if (event.error) {
          setErrorMessage(event.error.message);
        } else {
          setErrorMessage('');
        }
      });
    } catch (error) {
      console.error('Error initializing payment:', error);
      setErrorMessage('Failed to initialize payment. Please try again later.');
    }
  };

  const handlePayment = async () => {
    if (!email) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');

    try {
      const { clientSecret } = await createPaymentIntent(productId, email);

      const paymentResult = await confirmPayment(clientSecret, { email });

      if (paymentResult.status === 'succeeded') {
        alert('Payment successful!');
        onClose();
      } else {
        setErrorMessage('Payment failed. Please try again.');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      setErrorMessage(error.message || 'An error occurred during payment.');
    } finally {
      setIsProcessing(false);
    }
  };

  React.useEffect(() => {
    initializePayment();
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Complete Your Purchase</h2>
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="your@email.com"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="card-element" className="block text-sm font-medium text-gray-700">
            Credit or Debit Card
          </label>
          <div id="card-element" className="p-3 border border-gray-300 rounded-md shadow-sm"></div>
          {errorMessage && <p className="mt-2 text-sm text-red-600">{errorMessage}</p>}
        </div>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="mr-4 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handlePayment}
            disabled={isProcessing}
            className={`px-4 py-2 text-white rounded-md ${
              isProcessing ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {isProcessing ? 'Processing...' : 'Pay Now'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
