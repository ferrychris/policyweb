/**
 * Pricing Consistency Tests for WhitegloveAI Policy Generator
 * 
 * This test ensures that pricing is consistent between the frontend and backend systems.
 */

// Import product data from different sources
const { PRODUCTS: frontendProducts } = require('../js/payments');
const { PRODUCTS: backendProducts } = require('../server');

describe('Pricing Consistency', () => {
  test('Product IDs should match between frontend and backend', () => {
    // Get product IDs from both systems
    const frontendProductIds = Object.keys(frontendProducts);
    const backendProductIds = Object.keys(backendProducts);
    
    // Check that all frontend products exist in backend
    frontendProductIds.forEach(productId => {
      expect(backendProductIds).toContain(productId);
    });
    
    // Check that all backend products exist in frontend
    backendProductIds.forEach(productId => {
      expect(frontendProductIds).toContain(productId);
    });
  });
  
  test('Product prices should be consistent between frontend and backend', () => {
    // For each product, check that price matches
    Object.keys(frontendProducts).forEach(productId => {
      const frontendPrice = frontendProducts[productId].price;
      const backendPrice = backendProducts[productId].price;
      
      expect(frontendPrice).toBe(backendPrice);
    });
  });
  
  test('Product names should be consistent between frontend and backend', () => {
    // For each product, check that name matches
    Object.keys(frontendProducts).forEach(productId => {
      const frontendName = frontendProducts[productId].name;
      const backendName = backendProducts[productId].name;
      
      expect(frontendName).toBe(backendName);
    });
  });
  
  test('Product descriptions should be consistent between frontend and backend', () => {
    // For each product, check that description matches
    Object.keys(frontendProducts).forEach(productId => {
      const frontendDesc = frontendProducts[productId].description;
      const backendDesc = backendProducts[productId].description;
      
      expect(frontendDesc).toBe(backendDesc);
    });
  });
});