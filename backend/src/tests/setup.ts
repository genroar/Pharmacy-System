import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Increase timeout for tests
jest.setTimeout(10000);

// Global test utilities
global.testUtils = {
  // Add any global test utilities here
};

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});
