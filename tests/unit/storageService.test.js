import AsyncStorage from '@react-native-async-storage/async-storage';
import StorageService from '../../services/storageService';
import CryptoService from '../../services/cryptoService';

// Mock du service de chiffrement
jest.mock('../../services/cryptoService');

describe('StorageService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.clear();
  });

  describe('saveUserData', () => {
    it('devrait sauvegarder les données utilisateur avec succès', async () => {
      const userId = 'test@example.com';
      const data = { favorites: ['place1', 'place2'] };
      const encryptedData = 'encrypted-data';
      
      CryptoService.encrypt.mockResolvedValue(encryptedData);
      AsyncStorage.setItem.mockResolvedValue();
      
      const result = await StorageService.saveUserData(userId, 'favorites', data);
      
      expect(result.success).toBe(true);
      expect(CryptoService.encrypt).toHaveBeenCalledWith(JSON.stringify(data));
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        `user_${userId}_favorites`,
        encryptedData
      );
    });

    it('devrait gérer les erreurs de chiffrement', async () => {
      const userId = 'test@example.com';
      const data = { favorites: ['place1'] };
      
      CryptoService.encrypt.mockRejectedValue(new Error('Erreur de chiffrement'));
      
      const result = await StorageService.saveUserData(userId, 'favorites', data);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('devrait gérer les erreurs de stockage', async () => {
      const userId = 'test@example.com';
      const data = { favorites: ['place1'] };
      const encryptedData = 'encrypted-data';
      
      CryptoService.encrypt.mockResolvedValue(encryptedData);
      AsyncStorage.setItem.mockRejectedValue(new Error('Erreur de stockage'));
      
      const result = await StorageService.saveUserData(userId, 'favorites', data);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('getUserData', () => {
    it('devrait récupérer les données utilisateur avec succès', async () => {
      const userId = 'test@example.com';
      const encryptedData = 'encrypted-data';
      const decryptedData = JSON.stringify({ favorites: ['place1', 'place2'] });
      
      AsyncStorage.getItem.mockResolvedValue(encryptedData);
      CryptoService.decrypt.mockResolvedValue(decryptedData);
      
      const result = await StorageService.getUserData(userId, 'favorites');
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ favorites: ['place1', 'place2'] });
      expect(CryptoService.decrypt).toHaveBeenCalledWith(encryptedData);
    });

    it('devrait retourner null si aucune donnée trouvée', async () => {
      const userId = 'test@example.com';
      
      AsyncStorage.getItem.mockResolvedValue(null);
      
      const result = await StorageService.getUserData(userId, 'favorites');
      
      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
    });

    it('devrait gérer les erreurs de déchiffrement', async () => {
      const userId = 'test@example.com';
      const encryptedData = 'invalid-encrypted-data';
      
      AsyncStorage.getItem.mockResolvedValue(encryptedData);
      CryptoService.decrypt.mockRejectedValue(new Error('Erreur de déchiffrement'));
      
      const result = await StorageService.getUserData(userId, 'favorites');
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('getAllUserData', () => {
    it('devrait récupérer toutes les données utilisateur', async () => {
      const userId = 'test@example.com';
      const keys = ['favorites', 'settings', 'history'];
      const mockData = {
        favorites: 'encrypted-favorites',
        settings: 'encrypted-settings',
        history: 'encrypted-history'
      };
      
      AsyncStorage.multiGet.mockResolvedValue([
        ['user_test@example.com_favorites', 'encrypted-favorites'],
        ['user_test@example.com_settings', 'encrypted-settings'],
        ['user_test@example.com_history', 'encrypted-history']
      ]);
      
      CryptoService.decrypt
        .mockResolvedValueOnce(JSON.stringify(['place1', 'place2']))
        .mockResolvedValueOnce(JSON.stringify({ theme: 'dark' }))
        .mockResolvedValueOnce(JSON.stringify(['visit1', 'visit2']));
      
      const result = await StorageService.getAllUserData(userId);
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        favorites: ['place1', 'place2'],
        settings: { theme: 'dark' },
        history: ['visit1', 'visit2']
      });
    });

    it('devrait gérer les données manquantes', async () => {
      const userId = 'test@example.com';
      
      AsyncStorage.multiGet.mockResolvedValue([
        ['user_test@example.com_favorites', 'encrypted-favorites'],
        ['user_test@example.com_settings', null],
        ['user_test@example.com_history', null]
      ]);
      
      CryptoService.decrypt.mockResolvedValue(JSON.stringify(['place1']));
      
      const result = await StorageService.getAllUserData(userId);
      
      expect(result.success).toBe(true);
      expect(result.data.favorites).toEqual(['place1']);
      expect(result.data.settings).toBeNull();
      expect(result.data.history).toBeNull();
    });
  });

  describe('deleteUserData', () => {
    it('devrait supprimer les données utilisateur avec succès', async () => {
      const userId = 'test@example.com';
      
      AsyncStorage.removeItem.mockResolvedValue();
      
      const result = await StorageService.deleteUserData(userId, 'favorites');
      
      expect(result.success).toBe(true);
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(
        `user_${userId}_favorites`
      );
    });

    it('devrait gérer les erreurs de suppression', async () => {
      const userId = 'test@example.com';
      
      AsyncStorage.removeItem.mockRejectedValue(new Error('Erreur de suppression'));
      
      const result = await StorageService.deleteUserData(userId, 'favorites');
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('clearUserData', () => {
    it('devrait supprimer toutes les données utilisateur', async () => {
      const userId = 'test@example.com';
      const keys = ['favorites', 'settings', 'history'];
      
      AsyncStorage.multiRemove.mockResolvedValue();
      
      const result = await StorageService.clearUserData(userId);
      
      expect(result.success).toBe(true);
      expect(AsyncStorage.multiRemove).toHaveBeenCalledWith([
        'user_test@example.com_favorites',
        'user_test@example.com_settings',
        'user_test@example.com_history',
        'user_test@example.com_profile',
        'user_test@example.com_notifications',
        'user_test@example.com_mapMarkers',
        'user_test@example.com_accessibilityPrefs',
        'user_test@example.com_searchRadius',
        'user_test@example.com_mapStyle',
        'user_test@example.com_biometricPreferences',
        'user_test@example.com_pushToken'
      ]);
    });
  });

  describe('migrateVisitorDataToUser', () => {
    it('devrait migrer les données visiteur vers un utilisateur', async () => {
      const userEmail = 'test@example.com';
      const visitorData = {
        favorites: ['place1', 'place2'],
        settings: { theme: 'dark' },
        history: ['visit1']
      };
      
      // Mock pour récupérer les données visiteur
      AsyncStorage.multiGet.mockResolvedValue([
        ['user_visitor_favorites', 'encrypted-favorites'],
        ['user_visitor_settings', 'encrypted-settings'],
        ['user_visitor_history', 'encrypted-history']
      ]);
      
      CryptoService.decrypt
        .mockResolvedValueOnce(JSON.stringify(['place1', 'place2']))
        .mockResolvedValueOnce(JSON.stringify({ theme: 'dark' }))
        .mockResolvedValueOnce(JSON.stringify(['visit1']));
      
      CryptoService.encrypt
        .mockResolvedValueOnce('new-encrypted-favorites')
        .mockResolvedValueOnce('new-encrypted-settings')
        .mockResolvedValueOnce('new-encrypted-history');
      
      AsyncStorage.multiSet.mockResolvedValue();
      AsyncStorage.multiRemove.mockResolvedValue();
      
      const result = await StorageService.migrateVisitorDataToUser(userEmail, true);
      
      expect(result.success).toBe(true);
      expect(result.migrated).toBe(true);
      expect(result.migratedData).toEqual(visitorData);
    });

    it('devrait gérer l\'absence de données visiteur', async () => {
      const userEmail = 'test@example.com';
      
      AsyncStorage.multiGet.mockResolvedValue([
        ['user_visitor_favorites', null],
        ['user_visitor_settings', null],
        ['user_visitor_history', null]
      ]);
      
      const result = await StorageService.migrateVisitorDataToUser(userEmail, true);
      
      expect(result.success).toBe(true);
      expect(result.migrated).toBe(false);
      expect(result.migratedData).toEqual({});
    });
  });

  describe('saveGlobalData', () => {
    it('devrait sauvegarder les données globales avec succès', async () => {
      const key = 'appSettings';
      const data = { theme: 'dark', language: 'fr' };
      const encryptedData = 'encrypted-data';
      
      CryptoService.encrypt.mockResolvedValue(encryptedData);
      AsyncStorage.setItem.mockResolvedValue();
      
      const result = await StorageService.saveGlobalData(key, data);
      
      expect(result.success).toBe(true);
      expect(CryptoService.encrypt).toHaveBeenCalledWith(JSON.stringify(data));
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(key, encryptedData);
    });
  });

  describe('getGlobalData', () => {
    it('devrait récupérer les données globales avec succès', async () => {
      const key = 'appSettings';
      const encryptedData = 'encrypted-data';
      const decryptedData = JSON.stringify({ theme: 'dark', language: 'fr' });
      
      AsyncStorage.getItem.mockResolvedValue(encryptedData);
      CryptoService.decrypt.mockResolvedValue(decryptedData);
      
      const result = await StorageService.getGlobalData(key);
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ theme: 'dark', language: 'fr' });
    });
  });

  describe('deleteGlobalData', () => {
    it('devrait supprimer les données globales avec succès', async () => {
      const key = 'appSettings';
      
      AsyncStorage.removeItem.mockResolvedValue();
      
      const result = await StorageService.deleteGlobalData(key);
      
      expect(result.success).toBe(true);
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(key);
    });
  });

  describe('getAllKeys', () => {
    it('devrait récupérer toutes les clés de stockage', async () => {
      const keys = ['key1', 'key2', 'key3'];
      
      AsyncStorage.getAllKeys.mockResolvedValue(keys);
      
      const result = await StorageService.getAllKeys();
      
      expect(result.success).toBe(true);
      expect(result.keys).toEqual(keys);
    });

    it('devrait gérer les erreurs de récupération des clés', async () => {
      AsyncStorage.getAllKeys.mockRejectedValue(new Error('Erreur de récupération'));
      
      const result = await StorageService.getAllKeys();
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('clearAllData', () => {
    it('devrait supprimer toutes les données avec succès', async () => {
      AsyncStorage.clear.mockResolvedValue();
      const result = await StorageService.clearAllData();
      expect(result.success).toBe(true);
      expect(AsyncStorage.clear).toHaveBeenCalled();
      AsyncStorage.clear.mockReset();
    });

    it('devrait gérer les erreurs de suppression complète', async () => {
      AsyncStorage.clear.mockRejectedValue(new Error('Erreur de suppression'));
      const result = await StorageService.clearAllData();
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      AsyncStorage.clear.mockReset();
    });
  });

  describe('Cas d\'erreur généraux', () => {
    it('devrait gérer les erreurs de chiffrement dans toutes les méthodes', async () => {
      CryptoService.encrypt.mockRejectedValue(new Error('Erreur de chiffrement'));
      
      const result = await StorageService.saveUserData('test@example.com', 'favorites', {});
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Erreur de chiffrement');
    });

    it('devrait gérer les erreurs de déchiffrement dans toutes les méthodes', async () => {
      AsyncStorage.getItem.mockResolvedValue('invalid-data');
      CryptoService.decrypt.mockRejectedValue(new Error('Erreur de déchiffrement'));
      
      const result = await StorageService.getUserData('test@example.com', 'favorites');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Erreur de déchiffrement');
    });

    it('devrait gérer les erreurs de stockage dans toutes les méthodes', async () => {
      AsyncStorage.setItem.mockRejectedValue(new Error('Erreur de stockage'));
      CryptoService.encrypt.mockResolvedValue('encrypted-data');
      
      const result = await StorageService.saveUserData('test@example.com', 'favorites', {});
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Erreur de stockage');
    });
  });
}); 