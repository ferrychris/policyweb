module.exports = {
  // The test environment for browser-based tests
  testEnvironment: 'jsdom',
  
  // Files to process with the Jest transform
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  
  // Setup files to run before tests
  setupFiles: ['./tests/setup.js'],
  
  // Coverage configuration
  collectCoverage: true,
  collectCoverageFrom: [
    'js/**/*.js',
    'server.js',
    '!**/node_modules/**',
  ],
  coverageReporters: ['text', 'lcov', 'html'],
  
  // Test pattern matching
  testMatch: ['**/tests/**/*.test.js'],
  
  // Mock file extensions
  moduleFileExtensions: ['js', 'json'],
  
  // Module name mapper for non-JS assets
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': '<rootDir>/tests/mocks/styleMock.js',
    '\\.(gif|ttf|eot|svg|png|jpg|jpeg)$': '<rootDir>/tests/mocks/fileMock.js'
  },
  
  // Verbose output
  verbose: true
};