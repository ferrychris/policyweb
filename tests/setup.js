/**
 * Test Setup File for Jest
 * 
 * This file runs before all tests to set up the testing environment.
 */

// Mock browser globals
global.document = document;
global.window = window;
global.navigator = {
  userAgent: 'node.js',
};

// Mock browser APIs
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
  writable: true
});

// Mock DOM methods not provided by jsdom
document.body.classList = {
  add: jest.fn(),
  remove: jest.fn(),
  toggle: jest.fn(),
  contains: jest.fn(),
};

// Mock for FormData
global.FormData = class FormData {
  constructor(form) {
    this.data = {};
    
    // If a form is provided, extract data from inputs
    if (form) {
      const inputs = form.querySelectorAll('input');
      inputs.forEach(input => {
        if (input.type === 'checkbox') {
          this.data[input.name] = input.checked;
        } else {
          this.data[input.name] = input.value;
        }
      });
    }
  }
  
  append(key, value) {
    this.data[key] = value;
  }
  
  get(key) {
    return this.data[key];
  }
  
  getAll(key) {
    return [this.data[key]];
  }
  
  has(key) {
    return key in this.data;
  }
  
  delete(key) {
    delete this.data[key];
  }
};

// Fix for TextEncoder/TextDecoder not being available in jsdom
global.TextEncoder = require('util').TextEncoder;
global.TextDecoder = require('util').TextDecoder;

// Console mocking to suppress expected warnings
const originalConsoleError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === 'string' && 
    (args[0].includes('React does not recognize the') || 
     args[0].includes('Warning:'))
  ) {
    return;
  }
  originalConsoleError(...args);
};