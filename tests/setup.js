// Mocks des contextes React - DOIT ÊTRE EN PREMIER
jest.mock('../../theme/ScreenReaderContext', () => ({
  __esModule: true,
  useScreenReader: jest.fn(() => ({
    isScreenReaderEnabled: false,
    speak: jest.fn(),
  })),
  ScreenReaderProvider: ({ children }) => children,
}), { virtual: true });

jest.mock('../theme/ScreenReaderContext', () => ({
  __esModule: true,
  useScreenReader: jest.fn(() => ({
    isScreenReaderEnabled: false,
    speak: jest.fn(),
  })),
  ScreenReaderProvider: ({ children }) => children,
}), { virtual: true });

jest.mock('../../theme/TextSizeContext', () => ({
  __esModule: true,
  useTextSize: jest.fn(() => ({
    isLargeText: false,
    toggleTextSize: jest.fn(),
    resetToDefault: jest.fn(),
    textSizes: {
      title: 18,
      subtitle: 16,
      body: 14,
      caption: 12,
      button: 14,
      label: 12,
    },
  })),
}), { virtual: true });

jest.mock('../theme/TextSizeContext', () => ({
  __esModule: true,
  useTextSize: jest.fn(() => ({
    isLargeText: false,
    toggleTextSize: jest.fn(),
    resetToDefault: jest.fn(),
    textSizes: {
      title: 18,
      subtitle: 16,
      body: 14,
      caption: 12,
      button: 14,
      label: 12,
    },
  })),
}), { virtual: true });

jest.mock('../../theme/ThemeContext', () => ({
  __esModule: true,
  useAppTheme: () => ({
    isDarkMode: false,
    toggleTheme: jest.fn(),
    resetToDefault: jest.fn(),
  }),
}), { virtual: true });

jest.mock('../theme/ThemeContext', () => ({
  __esModule: true,
  useAppTheme: () => ({
    isDarkMode: false,
    toggleTheme: jest.fn(),
    resetToDefault: jest.fn(),
  }),
}), { virtual: true });

jest.mock('../../theme/AuthContext', () => ({
  __esModule: true,
  useAuth: () => ({
    user: null,
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
  }),
}), { virtual: true });

jest.mock('../theme/AuthContext', () => ({
  __esModule: true,
  useAuth: () => ({
    user: null,
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
  }),
}), { virtual: true });

// Mock des composants de navigation
jest.mock('@react-navigation/native', () => {
  const React = require('react');
  const { View } = require('react-native');
  
  return {
    NavigationContainer: ({ children }) => {
      return React.createElement(View, { testID: 'navigation-container' }, children);
    },
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
      reset: jest.fn(),
      setParams: jest.fn(),
      getParent: () => ({
        navigate: jest.fn(),
      }),
      canGoBack: () => true,
      isFocused: () => true,
    }),
    useRoute: () => ({
      params: {},
      name: 'Test',
    }),
    useFocusEffect: jest.fn((callback) => {
      // Simule le comportement React Navigation : stocke le callback mais ne l'exécute pas immédiatement
      // Cela évite les erreurs de hoisting dans les tests
      return () => {
        // Fonction de cleanup vide
      };
    }),
  };
});

jest.mock('@react-navigation/stack', () => ({
  createStackNavigator: () => ({
    Navigator: ({ children }) => children,
    Screen: ({ children }) => children,
  }),
}));

// Imports après les mocks
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

// Mock des services de chiffrement
jest.mock('../services/cryptoService', () => ({
  encrypt: jest.fn(),
  decrypt: jest.fn(),
  migrateToEncryption: jest.fn(),
}));

// Mock des services biométriques
jest.mock('../services/biometricService', () => ({
  __esModule: true,
  BiometricService: {
    isBiometricAvailable: jest.fn(() => Promise.resolve(true)),
    getSupportedTypes: jest.fn(() => Promise.resolve({ types: [1, 2], names: ['Empreinte digitale', 'Reconnaissance faciale'] })),
    authenticateWithBiometrics: jest.fn(() => Promise.resolve({ success: true })),
    saveBiometricPreferences: jest.fn(() => Promise.resolve(true)),
    loadBiometricPreferences: jest.fn(() => Promise.resolve({ enabled: false, email: null })),
    getBiometricPrefsForUser: jest.fn(() => Promise.resolve({ enabled: false, email: null })),
    isBiometricEnabledForUser: jest.fn(() => Promise.resolve(false)),
    disableBiometrics: jest.fn(() => Promise.resolve()),
    autoAuthenticateWithBiometrics: jest.fn(() => Promise.resolve({ success: false })),
    getStoredCredentials: jest.fn(() => Promise.resolve(null)),
    authenticateAndGetCredentials: jest.fn(() => Promise.resolve({ success: false })),
    setupBiometricAuthentication: jest.fn(() => Promise.resolve({ success: true })),
    getErrorMessage: jest.fn(() => 'Erreur biométrique')
  }
}));

// Mock des services de notification
jest.mock('../services/notificationService', () => ({
  default: {
    requestPermissions: jest.fn(),
    scheduleNotification: jest.fn(),
    cancelNotification: jest.fn(),
    getNotificationStatus: jest.fn(),
  },
}));

// Mock des services de localisation
jest.mock('expo-location', () => {
  const Accuracy = {
    Lowest: 1,
    Low: 2,
    Balanced: 3,
    High: 4,
    Highest: 5,
    BestForNavigation: 6
  };
  const mock = {
    requestForegroundPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
    getCurrentPositionAsync: jest.fn(() => Promise.resolve({
      coords: {
        latitude: 48.8566,
        longitude: 2.3522,
        accuracy: 10,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null
      },
      timestamp: Date.now()
    })),
    hasServicesEnabledAsync: jest.fn(() => Promise.resolve(true)),
    Accuracy
  };
  mock.default = { ...mock, Accuracy };
  mock.default.default = { ...mock, Accuracy };
  mock.Accuracy = Accuracy;
  mock.default.Accuracy = Accuracy;
  mock.default.default.Accuracy = Accuracy;
  return {
    __esModule: true,
    ...mock,
    default: mock,
    Accuracy
  };
});

// Mock des services Firebase
jest.mock('../services/firebaseService', () => ({
  PlacesService: {
    getPlaces: jest.fn(),
    addPlace: jest.fn(),
    updatePlace: jest.fn(),
    deletePlace: jest.fn(),
  },
  ReviewsService: {
    getReviews: jest.fn(),
    addReview: jest.fn(),
    updateReview: jest.fn(),
    deleteReview: jest.fn(),
    getReviewsByUserId: jest.fn(),
  },
  AuthService: {
    signInWithEmailAndPassword: jest.fn(),
    createUserWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(),
  },
}));

// Mock des services de recherche de lieux
jest.mock('../services/placesApi', () => ({
  default: {
    searchNearby: jest.fn(),
    getPlaceDetails: jest.fn(),
    getPlacePhotos: jest.fn(),
  },
}));

// Mock des services de recherche simple
jest.mock('../services/placesSearch', () => ({
  default: {
    searchPlaces: jest.fn(),
    getPlaceDetails: jest.fn(),
  },
}));

// Mock des services de lieux simples
jest.mock('../services/simplePlacesService', () => ({
  default: {
    getPlaces: jest.fn(),
    addPlace: jest.fn(),
    updatePlace: jest.fn(),
    deletePlace: jest.fn(),
  },
}));

import AsyncStorage from '@react-native-async-storage/async-storage';
import StorageService from '../services/storageService';

// Mock pour authService
jest.mock('../services/authService', () => {
  const mockAuthService = {
    initialize: jest.fn(() => Promise.resolve()),
    register: jest.fn(() => Promise.resolve({ success: true, user: { email: 'test@example.com', name: 'Test User' } })),
    login: jest.fn(() => Promise.resolve({ success: true, user: { email: 'test@example.com', name: 'Test User' } })),
    logout: jest.fn(() => Promise.resolve({ success: true })),
    isAuthenticated: jest.fn(() => Promise.resolve(true)),
    getCurrentUser: jest.fn(() => Promise.resolve({ email: 'test@example.com', name: 'Test User' })),
    isCurrentUserVisitor: jest.fn(() => Promise.resolve(false)),
    checkUserExists: jest.fn(() => Promise.resolve(true)),
    sendPasswordResetEmail: jest.fn(() => Promise.resolve({ success: true })),
    verifyResetToken: jest.fn(() => Promise.resolve(true)),
    updatePassword: jest.fn(() => Promise.resolve({ success: true })),
    changePassword: jest.fn(() => Promise.resolve({ success: true })),
    getErrorMessage: jest.fn((error) => error.message || 'Unknown error'),
  };
  return {
    __esModule: true,
    AuthService: mockAuthService,
    default: mockAuthService,
  };
});

// Mock des services de stockage
jest.mock('../services/storageService', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
    getAllKeys: jest.fn(),
    multiGet: jest.fn(),
    multiSet: jest.fn(),
    multiRemove: jest.fn(),
    getTheme: jest.fn(() => Promise.resolve('light')),
    setTheme: jest.fn(),
    getTextSize: jest.fn(() => Promise.resolve('medium')),
    setTextSize: jest.fn(),
    getAccessibilityPrefs: jest.fn(() => Promise.resolve({ isScreenReaderEnabled: false })),
    setAccessibilityPrefs: jest.fn(),
    getUser: jest.fn(),
    setUser: jest.fn(),
    removeUser: jest.fn(),
    getFavorites: jest.fn(() => Promise.resolve([])),
    addFavorite: jest.fn(),
    removeFavorite: jest.fn(),
    getNotificationPrefs: jest.fn(() => Promise.resolve({ newPlaces: false, reviews: false, updates: false })),
    setNotificationPrefs: jest.fn(),
    getSearchRadius: jest.fn(() => Promise.resolve('800')),
    setSearchRadius: jest.fn(),
    getMapStyle: jest.fn(() => Promise.resolve('standard')),
    setMapStyle: jest.fn(),
    // Méthodes spécifiques pour les tests authService
    getAllUserData: jest.fn(() => Promise.resolve({ favorites: [], reviews: [] })),
    migrateVisitorDataToUser: jest.fn(() => Promise.resolve({ success: true })),
    clearUserData: jest.fn(() => Promise.resolve({ success: true })),
    getUserData: jest.fn(() => Promise.resolve({ email: 'test@example.com', name: 'Test User' })),
    saveUserData: jest.fn(() => Promise.resolve({ success: true })),
  },
  StorageService: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
    getAllKeys: jest.fn(),
    multiGet: jest.fn(),
    multiSet: jest.fn(),
    multiRemove: jest.fn(),
    getTheme: jest.fn(() => Promise.resolve('light')),
    setTheme: jest.fn(),
    getTextSize: jest.fn(() => Promise.resolve('medium')),
    setTextSize: jest.fn(),
    getAccessibilityPrefs: jest.fn(() => Promise.resolve({ isScreenReaderEnabled: false })),
    setAccessibilityPrefs: jest.fn(),
    getUser: jest.fn(),
    setUser: jest.fn(),
    removeUser: jest.fn(),
    getFavorites: jest.fn(() => Promise.resolve([])),
    addFavorite: jest.fn(),
    removeFavorite: jest.fn(),
    getNotificationPrefs: jest.fn(() => Promise.resolve({ newPlaces: false, reviews: false, updates: false })),
    setNotificationPrefs: jest.fn(),
    getSearchRadius: jest.fn(() => Promise.resolve('800')),
    setSearchRadius: jest.fn(),
    getMapStyle: jest.fn(() => Promise.resolve('standard')),
    setMapStyle: jest.fn(),
    // Méthodes spécifiques pour les tests authService
    getAllUserData: jest.fn(() => Promise.resolve({ favorites: [], reviews: [] })),
    migrateVisitorDataToUser: jest.fn(() => Promise.resolve({ success: true })),
    clearUserData: jest.fn(() => Promise.resolve({ success: true })),
    getUserData: jest.fn(() => Promise.resolve({ email: 'test@example.com', name: 'Test User' })),
    saveUserData: jest.fn(() => Promise.resolve({ success: true })),
  },
}));

// Mock des services de configuration
jest.mock('../services/configService', () => ({
  __esModule: true,
  default: {
    get: jest.fn((key) => {
      const config = {
        FIREBASE_API_KEY: 'test-api-key',
        FIREBASE_AUTH_DOMAIN: 'test-project.firebaseapp.com',
        FIREBASE_PROJECT_ID: 'test-project',
        FIREBASE_STORAGE_BUCKET: 'test-project.appspot.com',
        FIREBASE_MESSAGING_SENDER_ID: '123456789',
        FIREBASE_APP_ID: 'test-app-id',
      };
      return config[key] || null;
    }),
  },
}), { virtual: true });

// Mock accessibilityService pour export nommé et default
jest.mock('../services/accessibilityService', () => {
  const mock = {
    isScreenReaderEnabled: jest.fn(),
    speak: jest.fn(),
    announceForAccessibility: jest.fn(),
    hasActivePreferences: jest.fn(() => false),
    getActivePreferencesText: jest.fn(() => ''),
    filterPlacesByAccessibility: jest.fn((places) => places),
    meetsAccessibilityPreferences: jest.fn(() => true),
  };
  return {
    __esModule: true,
    AccessibilityService: mock,
    ...mock,
    default: mock,
  };
}, { virtual: true });

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

jest.mock('../../services/accessibilityService', () => {
  const mock = {
    isScreenReaderEnabled: jest.fn(),
    speak: jest.fn(),
    announceForAccessibility: jest.fn(),
    hasActivePreferences: jest.fn(() => false),
    getActivePreferencesText: jest.fn(() => ''),
    filterPlacesByAccessibility: jest.fn((places) => places),
    meetsAccessibilityPreferences: jest.fn(() => true),
  };
  return {
    __esModule: true,
    AccessibilityService: mock,
    ...mock,
    default: mock,
  };
}, { virtual: true });

// Mock expo-location
jest.mock('expo-location', () => ({
  hasServicesEnabledAsync: jest.fn(() => Promise.resolve(true)),
  requestForegroundPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  getCurrentPositionAsync: jest.fn(() => Promise.resolve({
    coords: { latitude: 48.8566, longitude: 2.3522 }
  })),
}));

// Mock firebaseService
jest.mock('../services/firebaseService', () => ({
  __esModule: true,
  default: {
    getAllPlaces: jest.fn(() => Promise.resolve([])),
  },
}), { virtual: true });

// Mock storageService
jest.mock('../services/storageService', () => ({
  __esModule: true,
  default: {
    getSearchRadius: jest.fn(() => Promise.resolve(5000)),
    setSearchRadius: jest.fn(() => Promise.resolve()),
  },
}), { virtual: true });

// Mock pour CryptoService
jest.mock('../services/cryptoService', () => ({
  __esModule: true,
  default: {
    migrateToEncryption: jest.fn(() => Promise.resolve()),
    encrypt: jest.fn((data) => Promise.resolve(`encrypted_${data}`)),
    decrypt: jest.fn((data) => Promise.resolve(data.replace('encrypted_', ''))),
  },
  CryptoService: {
    migrateToEncryption: jest.fn(() => Promise.resolve()),
    encrypt: jest.fn((data) => Promise.resolve(`encrypted_${data}`)),
    decrypt: jest.fn((data) => Promise.resolve(data.replace('encrypted_', ''))),
  },
})); 