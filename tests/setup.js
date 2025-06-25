import '@testing-library/jest-native/extend-expect';

// Mock AsyncStorage avec toutes les méthodes nécessaires
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  getAllKeys: jest.fn(),
  multiGet: jest.fn(),
  multiSet: jest.fn(),
  multiRemove: jest.fn(),
}));

// Mock axios
jest.mock('axios', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  create: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  })),
}));

// Mock react-native-crypto-js
jest.mock('react-native-crypto-js', () => ({
  AES: {
    encrypt: jest.fn(() => 'encrypted'),
    decrypt: jest.fn(() => 'decrypted'),
  },
  enc: {
    Utf8: 'utf8',
    Base64: 'base64',
  },
}));

// Mock expo-local-authentication
jest.mock('expo-local-authentication', () => ({
  hasHardwareAsync: jest.fn(() => Promise.resolve(true)),
  isEnrolledAsync: jest.fn(() => Promise.resolve(true)),
  authenticateAsync: jest.fn(() => Promise.resolve({ success: true })),
}));

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => require('react-native-gesture-handler/jestSetup'));

// Configuration globale pour les tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: console.error,
};

jest.setTimeout(10000); 