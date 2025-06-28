// Forcer l'utilisation du vrai module ConfigService
jest.unmock('../../services/configService');

// Import ConfigService après les mocks
import ConfigService from '../../services/configService';

describe('ConfigService', () => {
  beforeEach(() => {
    // Réinitialiser la configuration avant chaque test
    ConfigService.config = {
      GOOGLE_PLACES_API_KEY: 'test-api-key',
      ENCRYPTION_KEY: 'test-encryption-key',
      MAX_LOGIN_ATTEMPTS: 5,
      LOGIN_TIMEOUT_MINUTES: 15,
      SESSION_TIMEOUT_HOURS: 24,
      NODE_ENV: 'test',
    };
  });

  describe('get', () => {
    it('retourne la valeur d\'une clé existante', () => {
      const result = ConfigService.get('GOOGLE_PLACES_API_KEY');
      expect(result).toBe('test-api-key');
    });

    it('retourne la valeur par défaut pour une clé inexistante', () => {
      const result = ConfigService.get('NON_EXISTENT_KEY', 'default-value');
      expect(result).toBe('default-value');
    });

    it('retourne null pour une clé inexistante sans valeur par défaut', () => {
      const result = ConfigService.get('NON_EXISTENT_KEY');
      expect(result).toBe(null);
    });
  });

  describe('set', () => {
    it('définit une nouvelle valeur de configuration', () => {
      ConfigService.set('NEW_KEY', 'new-value');
      const result = ConfigService.get('NEW_KEY');
      expect(result).toBe('new-value');
    });

    it('met à jour une valeur existante', () => {
      ConfigService.set('GOOGLE_PLACES_API_KEY', 'updated-api-key');
      const result = ConfigService.get('GOOGLE_PLACES_API_KEY');
      expect(result).toBe('updated-api-key');
    });
  });

  describe('getSecurityConfig', () => {
    it('retourne la configuration de sécurité', () => {
      const result = ConfigService.getSecurityConfig();
      
      expect(result).toEqual({
        maxLoginAttempts: 5,
        loginTimeoutMinutes: 15,
        sessionTimeoutHours: 24,
      });
    });

    it('utilise les valeurs par défaut si les clés sont manquantes', () => {
      ConfigService.config = {};
      
      const result = ConfigService.getSecurityConfig();
      
      expect(result).toEqual({
        maxLoginAttempts: 5,
        loginTimeoutMinutes: 15,
        sessionTimeoutHours: 24,
      });
    });
  });

  describe('getGooglePlacesApiKey', () => {
    it('retourne la clé API si elle est configurée', () => {
      const result = ConfigService.getGooglePlacesApiKey();
      expect(result).toBe('test-api-key');
    });

    it('retourne null si la clé est API_KEY_HIDDEN', () => {
      ConfigService.config.GOOGLE_PLACES_API_KEY = 'API_KEY_HIDDEN';
      
      const result = ConfigService.getGooglePlacesApiKey();
      expect(result).toBe(null);
    });

    it('retourne null si la clé est vide', () => {
      ConfigService.config.GOOGLE_PLACES_API_KEY = '';
      
      const result = ConfigService.getGooglePlacesApiKey();
      expect(result).toBe(null);
    });
  });

  describe('getEncryptionKey', () => {
    it('retourne la clé de chiffrement', () => {
      const result = ConfigService.getEncryptionKey();
      expect(result).toBe('test-encryption-key');
    });
  });

  describe('isValid', () => {
    it('retourne true si la configuration est valide', () => {
      const result = ConfigService.isValid();
      expect(result).toBe(true);
    });

    it('retourne false si la clé Google Places est manquante', () => {
      ConfigService.config.GOOGLE_PLACES_API_KEY = null;
      
      const result = ConfigService.isValid();
      expect(result).toBe(false);
    });

    it('retourne false si la clé de chiffrement est manquante', () => {
      ConfigService.config.ENCRYPTION_KEY = null;
      
      const result = ConfigService.isValid();
      expect(result).toBe(false);
    });
  });
}); 