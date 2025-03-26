/**
 * Server API Tests for WhitegloveAI Policy Generator
 * 
 * This file contains tests for the Express server API endpoints
 * using Jest and supertest for HTTP requests.
 */

const request = require('supertest');
const express = require('express');

// Mock Stripe
jest.mock('stripe', () => {
  return function() {
    return {
      customers: {
        create: jest.fn().mockResolvedValue({ id: 'cus_test123' })
      },
      paymentIntents: {
        create: jest.fn().mockResolvedValue({
          id: 'pi_test123',
          client_secret: 'pi_test123_secret_test',
          amount: 1500,
          currency: 'usd'
        })
      }
    };
  };
});

// Import the server app
let app;

// Setup server for testing
beforeAll(() => {
  // Mock process.env
  process.env.STRIPE_SECRET_KEY = 'sk_test_mock';
  
  // Use dynamic import to reload the server with mocked environment
  app = require('../server');
});

describe('Server API', () => {
  test('GET / should serve static files', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
  });
  
  test('POST /api/create-payment-intent should create a payment intent', async () => {
    const response = await request(app)
      .post('/api/create-payment-intent')
      .send({
        productId: 'professional_package',
        email: 'test@example.com'
      });
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('clientSecret');
    expect(response.body).toHaveProperty('productId', 'professional_package');
    expect(response.body).toHaveProperty('amount');
    
    // Verify Stripe was called with correct parameters
    const stripe = require('stripe')();
    expect(stripe.customers.create).toHaveBeenCalledWith({
      email: 'test@example.com'
    });
    
    expect(stripe.paymentIntents.create).toHaveBeenCalledWith(
      expect.objectContaining({
        currency: 'usd',
        customer: 'cus_test123',
        metadata: expect.objectContaining({
          productId: 'professional_package'
        })
      })
    );
  });
  
  test('POST /api/create-payment-intent should handle invalid product ID', async () => {
    const response = await request(app)
      .post('/api/create-payment-intent')
      .send({
        productId: 'invalid_product',
        email: 'test@example.com'
      });
    
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'Invalid product ID');
  });
  
  test('POST /api/create-payment-intent should handle Stripe errors', async () => {
    // Override mock to simulate Stripe error
    const stripe = require('stripe')();
    stripe.paymentIntents.create.mockRejectedValueOnce(
      new Error('Stripe API error')
    );
    
    const response = await request(app)
      .post('/api/create-payment-intent')
      .send({
        productId: 'basic_plan',
        email: 'test@example.com'
      });
    
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'Stripe API error');
  });
});

// Add endpoint to check for valid product IDs
test('Server should have valid product IDs defined', () => {
  // Extract product IDs from server-side PRODUCTS object
  const { PRODUCTS } = require('../server');
  
  // Check basic structure
  expect(PRODUCTS).toBeDefined();
  expect(Object.keys(PRODUCTS)).toContain('basic_plan');
  expect(Object.keys(PRODUCTS)).toContain('professional_package');
  expect(Object.keys(PRODUCTS)).toContain('premium_suite');
  
  // Check product data structure
  Object.values(PRODUCTS).forEach(product => {
    expect(product).toHaveProperty('name');
    expect(product).toHaveProperty('price');
    expect(product).toHaveProperty('description');
  });
});