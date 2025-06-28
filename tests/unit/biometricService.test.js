// Mock des dépendances
jest.mock('expo-local-authentication', () => ({
  hasHardwareAsync: jest.fn(),
  isEnrolledAsync: jest.fn(),
  supportedAuthenticationTypesAsync: jest.fn(),
  authenticateAsync: jest.fn(),
  AuthenticationType: {
    FINGERPRINT: 1,
    FACIAL_RECOGNITION: 2,
    IRIS: 3,
  },
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  getAllKeys: jest.fn(),
}));

jest.mock('../../services/cryptoService', () => ({
  default: {
    encrypt: jest.fn((text) => `encrypted_${text}`),
    decrypt: jest.fn((text) => text.replace('encrypted_', '')),
  },
}));

jest.mock('../../services/storageService', () => ({
  default: {
    setBiometricPrefs: jest.fn(),
    getBiometricPrefs: jest.fn(),
  },
}));

// Forcer l'utilisation du vrai module BiometricService
jest.unmock('../../services/biometricService');

// Import BiometricService après les mocks
import { BiometricService } from '../../services/biometricService';

describe('BiometricService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getErrorMessage', () => {
    it('retourne un message d\'erreur pour tout type d\'erreur', () => {
      const result = BiometricService.getErrorMessage('NOT_AVAILABLE');
      expect(result).toBe('Erreur d\'authentification biométrique');
    });

    it('retourne le même message pour différents types d\'erreur', () => {
      const result1 = BiometricService.getErrorMessage('NOT_ENROLLED');
      const result2 = BiometricService.getErrorMessage('AUTHENTICATION_FAILED');
      const result3 = BiometricService.getErrorMessage('USER_CANCEL');
      
      expect(result1).toBe('Erreur d\'authentification biométrique');
      expect(result2).toBe('Erreur d\'authentification biométrique');
      expect(result3).toBe('Erreur d\'authentification biométrique');
    });

    it('retourne le même message pour une erreur inconnue', () => {
      const result = BiometricService.getErrorMessage('UNKNOWN_ERROR');
      expect(result).toBe('Erreur d\'authentification biométrique');
    });

    it('retourne le même message pour une erreur null', () => {
      const result = BiometricService.getErrorMessage(null);
      expect(result).toBe('Erreur d\'authentification biométrique');
    });

    it('retourne le même message pour une erreur undefined', () => {
      const result = BiometricService.getErrorMessage(undefined);
      expect(result).toBe('Erreur d\'authentification biométrique');
    });
  });

  describe('isBiometricAvailable', () => {
    it('retourne true si la biométrie est disponible', async () => {
      const { hasHardwareAsync, isEnrolledAsync } = require('expo-local-authentication');
      hasHardwareAsync.mockResolvedValue(true);
      isEnrolledAsync.mockResolvedValue(true);

      const result = await BiometricService.isBiometricAvailable();
      
      expect(result).toBe(true);
      expect(hasHardwareAsync).toHaveBeenCalled();
      expect(isEnrolledAsync).toHaveBeenCalled();
    });

    it('retourne false si le hardware n\'est pas disponible', async () => {
      const { hasHardwareAsync, isEnrolledAsync } = require('expo-local-authentication');
      hasHardwareAsync.mockResolvedValue(false);
      isEnrolledAsync.mockResolvedValue(true);

      const result = await BiometricService.isBiometricAvailable();
      
      expect(result).toBe(false);
    });

    it('retourne false si aucune empreinte n\'est configurée', async () => {
      const { hasHardwareAsync, isEnrolledAsync } = require('expo-local-authentication');
      hasHardwareAsync.mockResolvedValue(true);
      isEnrolledAsync.mockResolvedValue(false);

      const result = await BiometricService.isBiometricAvailable();
      
      expect(result).toBe(false);
    });

    it('retourne false en cas d\'erreur', async () => {
      const { hasHardwareAsync } = require('expo-local-authentication');
      hasHardwareAsync.mockRejectedValue(new Error('Test error'));

      const result = await BiometricService.isBiometricAvailable();
      
      expect(result).toBe(false);
    });
  });

  describe('getSupportedTypes', () => {
    it('retourne les types supportés avec leurs noms', async () => {
      const { supportedAuthenticationTypesAsync, AuthenticationType } = require('expo-local-authentication');
      supportedAuthenticationTypesAsync.mockResolvedValue([
        AuthenticationType.FINGERPRINT,
        AuthenticationType.FACIAL_RECOGNITION
      ]);

      const result = await BiometricService.getSupportedTypes();
      
      expect(result.types).toEqual([1, 2]);
      expect(result.names).toEqual(['Empreinte digitale', 'Reconnaissance faciale']);
    });

    it('retourne des tableaux vides en cas d\'erreur', async () => {
      const { supportedAuthenticationTypesAsync } = require('expo-local-authentication');
      supportedAuthenticationTypesAsync.mockRejectedValue(new Error('Test error'));

      const result = await BiometricService.getSupportedTypes();
      
      expect(result.types).toEqual([]);
      expect(result.names).toEqual([]);
    });
  });
}); 