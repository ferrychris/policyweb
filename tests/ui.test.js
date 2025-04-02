/**
 * UI Tests for WhitegloveAI Policy Generator
 * 
 * This file contains tests for user interface components
 * using Jest and Testing Library.
 */

// Mock DOM elements for testing
const setupDOM = () => {
  // Create mock DOM elements
  document.body.innerHTML = `
    <div id="mobile-menu" class="hidden"></div>
    <button id="mobile-menu-button" onclick="toggleMobileMenu()"></button>
    <button id="dark-mode-toggle" onclick="toggleDarkMode()"></button>
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

// Import functions to test
const { toggleMobileMenu, toggleDarkMode, checkAuthStatus } = require('../js/main');

describe('UI Functions', () => {
  beforeEach(() => {
    setupDOM();
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('toggleMobileMenu should toggle hidden class', () => {
    const mobileMenu = document.getElementById('mobile-menu');
    
    // Initial state
    expect(mobileMenu.classList.contains('hidden')).toBeTruthy();
    
    // Toggle menu
    toggleMobileMenu();
    expect(mobileMenu.classList.contains('hidden')).toBeFalsy();
    
    // Toggle menu again
    toggleMobileMenu();
    expect(mobileMenu.classList.contains('hidden')).toBeTruthy();
  });

  test('toggleDarkMode should toggle dark class and store preference', () => {
    // Initial state
    expect(document.documentElement.classList.contains('dark')).toBeFalsy();
    expect(localStorage.getItem).not.toHaveBeenCalled();
    
    // Toggle dark mode
    toggleDarkMode();
    
    // Check that dark class was added and localStorage was set
    expect(document.documentElement.classList.contains('dark')).toBeTruthy();
    expect(localStorage.setItem).toHaveBeenCalledWith('darkMode', 'true');
    
    // Toggle dark mode again
    toggleDarkMode();
    
    // Check that dark class was removed and localStorage was updated
    expect(document.documentElement.classList.contains('dark')).toBeFalsy();
    expect(localStorage.setItem).toHaveBeenCalledWith('darkMode', 'false');
  });

  test('checkAuthStatus should redirect if not authenticated on generator page', () => {
    // Mock window.location
    const originalLocation = window.location;
    delete window.location;
    window.location = { 
      pathname: '/generator.html',
      href: ''
    };

    // Not authenticated
    localStorage.getItem.mockReturnValueOnce(null);
    
    checkAuthStatus();
    
    // Should redirect to pricing
    expect(window.location.href).toBe('pricing.html');
    
    // Restore original location
    window.location = originalLocation;
  });

  test('checkAuthStatus should not redirect if authenticated on generator page', () => {
    // Mock window.location
    const originalLocation = window.location;
    delete window.location;
    window.location = { 
      pathname: '/generator.html',
      href: '/generator.html'
    };

    // Authenticated
    localStorage.getItem.mockReturnValueOnce('true');
    
    checkAuthStatus();
    
    // Should not redirect
    expect(window.location.href).toBe('/generator.html');
    
    // Restore original location
    window.location = originalLocation;
  });

  test('checkAuthStatus should not redirect if on a different page', () => {
    // Mock window.location
    const originalLocation = window.location;
    delete window.location;
    window.location = { 
      pathname: '/index.html',
      href: '/index.html'
    };

    // Not authenticated
    localStorage.getItem.mockReturnValueOnce(null);
    
    checkAuthStatus();
    
    // Should not redirect
    expect(window.location.href).toBe('/index.html');
    
    // Restore original location
    window.location = originalLocation;
  });
});