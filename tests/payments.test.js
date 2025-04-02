/**
 * Payment Tests for WhitegloveAI Policy Generator
 * 
 * This file contains tests for the Stripe payment integration
 * using Jest and mocking the Stripe API.
 */

// Mock Stripe
const stripeMock = {
  elements: jest.fn(() => ({
    create: jest.fn(() => ({
      mount: jest.fn(),
      addEventListener: jest.fn((event, callback) => {
        stripeMock._eventCallbacks[event] = callback;
      })
    }))
  })),
  confirmCardPayment: jest.fn(),
  _eventCallbacks: {}
};

// Mock global fetch
global.fetch = jest.fn();

// Mock DOM elements for payment processing
const setupPaymentDOM = () => {
  document.body.innerHTML = `
    <div id="payment-modal" class="hidden"></div>
    <h3 id="payment-modal-title"></h3>
    <p id="product-name"></p>
    <p id="product-price"></p>
    <div id="card-element"></div>
    <div id="card-errors"></div>
    <input id="customer-email" value="" />
    <button id="submit-payment">Pay Now</button>
    <div id="success-modal" class="hidden"></div>
  `;
};

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value;
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    }),
    getAll: () => store
  };
})();

// Replace global localStorage with mock
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock global Stripe
global.Stripe = jest.fn(() => stripeMock);

// Import payment functions
const { checkout, closePaymentModal, processPayment, PRODUCTS } = require('../js/payments');

describe('Payment Processing', () => {
  beforeEach(() => {
    setupPaymentDOM();
    localStorage.clear();
    jest.clearAllMocks();
    
    // Setup default mocks
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ clientSecret: 'test_secret' })
    });
    
    stripeMock.confirmCardPayment.mockResolvedValue({
      paymentIntent: { status: 'succeeded' }
    });
  });

  test('checkout should setup payment modal for valid product', () => {
    // Call checkout with valid product ID
    checkout('basic_plan');
    
    // Check that modal was shown
    const modal = document.getElementById('payment-modal');
    expect(modal.classList.contains('hidden')).toBeFalsy();
    
    // Check that product details were set
    expect(document.getElementById('payment-modal-title').textContent)
      .toBe(`Complete Purchase: ${PRODUCTS.basic_plan.name}`);
    expect(document.getElementById('product-name').textContent)
      .toBe(PRODUCTS.basic_plan.name);
    expect(document.getElementById('product-price').textContent)
      .toBe(`$${PRODUCTS.basic_plan.price.toFixed(2)}`);
    
    // Check that Stripe elements were created
    expect(stripeMock.elements).toHaveBeenCalled();
  });

  test('checkout should not proceed with invalid product ID', () => {
    // Mock console.error
    const originalConsoleError = console.error;
    console.error = jest.fn();
    
    // Call checkout with invalid product ID
    checkout('invalid_product');
    
    // Check that error was logged
    expect(console.error).toHaveBeenCalledWith('Product ID invalid_product not found');
    
    // Check that modal was not shown
    const modal = document.getElementById('payment-modal');
    expect(modal.classList.contains('hidden')).toBeTruthy();
    
    // Restore console.error
    console.error = originalConsoleError;
  });

  test('closePaymentModal should hide modal and reset state', () => {
    // Setup initial state
    const modal = document.getElementById('payment-modal');
    const errorsDiv = document.getElementById('card-errors');
    const submitButton = document.getElementById('submit-payment');
    
    modal.classList.remove('hidden');
    errorsDiv.textContent = 'Some error';
    submitButton.disabled = true;
    submitButton.textContent = 'Processing...';
    
    // Close modal
    closePaymentModal();
    
    // Check final state
    expect(modal.classList.contains('hidden')).toBeTruthy();
    expect(errorsDiv.textContent).toBe('');
    expect(submitButton.disabled).toBeFalsy();
    expect(submitButton.textContent).toBe('Pay Now');
  });

  test('processPayment should require email', async () => {
    // Call processPayment with no email set
    await processPayment('basic_plan');
    
    // Check that error was shown
    const errorsDiv = document.getElementById('card-errors');
    expect(errorsDiv.textContent).toBe('Please enter your email address.');
  });

  test('processPayment should handle successful payment in simulation mode', async () => {
    // Setup email
    document.getElementById('customer-email').value = 'test@example.com';
    
    // Process payment
    await processPayment('basic_plan');
    
    // Check that success flags were set
    expect(localStorage.setItem).toHaveBeenCalledWith('authenticated', 'true');
    expect(localStorage.setItem).toHaveBeenCalledWith('purchased_package', 'basic_plan');
    
    // Check that success modal was shown
    const successModal = document.getElementById('success-modal');
    expect(successModal.classList.contains('hidden')).toBeFalsy();
  });

  test('processPayment should handle API errors', async () => {
    // Override fetch mock to return error
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Payment failed' })
    });
    
    // Setup for real API mode
    const USE_REAL_PAYMENT_API = true;
    jest.mock('../js/payments', () => ({
      ...jest.requireActual('../js/payments'),
      USE_REAL_PAYMENT_API
    }));
    
    // Setup email
    document.getElementById('customer-email').value = 'test@example.com';
    
    // Process payment
    await processPayment('basic_plan');
    
    // Check that error was shown
    const errorsDiv = document.getElementById('card-errors');
    expect(errorsDiv.textContent).toBe('Payment failed');
    
    // Check that button was re-enabled
    const submitButton = document.getElementById('submit-payment');
    expect(submitButton.disabled).toBeFalsy();
    expect(submitButton.textContent).toBe('Pay Now');
  });

  test('processPayment should handle Stripe payment failure', async () => {
    // Setup for real API mode
    const USE_REAL_PAYMENT_API = true;
    jest.mock('../js/payments', () => ({
      ...jest.requireActual('../js/payments'),
      USE_REAL_PAYMENT_API
    }));
    
    // Override confirmCardPayment to simulate failure
    stripeMock.confirmCardPayment.mockResolvedValueOnce({
      error: { message: 'Your card was declined' }
    });
    
    // Setup email
    document.getElementById('customer-email').value = 'test@example.com';
    
    // Process payment
    await processPayment('basic_plan');
    
    // Check that error was shown
    const errorsDiv = document.getElementById('card-errors');
    expect(errorsDiv.textContent).toBe('Payment failed');
  });
});