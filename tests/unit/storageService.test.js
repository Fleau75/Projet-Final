jest.mock('../../services/firebaseService');
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageService } from '../../services/storageService';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  getAllKeys: jest.fn(),
  multiGet: jest.fn(),
  multiRemove: jest.fn(),
}));

describe('StorageService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.getItem.mockResolvedValue(null);
    AsyncStorage.setItem.mockResolvedValue();
    AsyncStorage.removeItem.mockResolvedValue();
    AsyncStorage.getAllKeys.mockResolvedValue([]);
    AsyncStorage.multiRemove.mockResolvedValue();
  });

  describe('getUserStorageKey', () => {
    it('should generate a unique storage key for a user', () => {
      const key = StorageService.getUserStorageKey('test@example.com', 'favorites');
      expect(key).toBe('user_test@example.com_favorites');
    });

    it('should throw error if userId is missing', () => {
      expect(() => {
        StorageService.getUserStorageKey('', 'favorites');
      }).toThrow('userId est requis pour le stockage privé');
    });
  });

  describe('getCurrentUserId', () => {
    it('should return visitor when not authenticated', async () => {
      AsyncStorage.getItem.mockResolvedValue(null);

      const result = await StorageService.getCurrentUserId();

      expect(result).toBe('visitor');
    });

    it('should return visitor when authenticated but no profile', async () => {
      AsyncStorage.getItem
        .mockResolvedValueOnce('true') // isAuthenticated
        .mockResolvedValueOnce(null); // userProfile

      const result = await StorageService.getCurrentUserId();

      expect(result).toBe('visitor');
    });

    it('should return visitor when profile is visitor', async () => {
      const visitorProfile = { isVisitor: true, email: 'visiteur@accessplus.com' };
      AsyncStorage.getItem
        .mockResolvedValueOnce('true') // isAuthenticated
        .mockResolvedValueOnce(JSON.stringify(visitorProfile)); // userProfile

      const result = await StorageService.getCurrentUserId();

      expect(result).toBe('visitor');
    });

    it('should return email when profile has email', async () => {
      const userProfile = { email: 'test@example.com', name: 'Test User' };
      AsyncStorage.getItem
        .mockResolvedValueOnce('true') // isAuthenticated
        .mockResolvedValueOnce(JSON.stringify(userProfile)); // userProfile

      const result = await StorageService.getCurrentUserId();

      expect(result).toBe('test@example.com');
    });

    it('should return uid when profile has uid but no email', async () => {
      const userProfile = { uid: 'user123', name: 'Test User' };
      AsyncStorage.getItem
        .mockResolvedValueOnce('true') // isAuthenticated
        .mockResolvedValueOnce(JSON.stringify(userProfile)); // userProfile

      const result = await StorageService.getCurrentUserId();

      expect(result).toBe('user123');
    });

    it('should handle JSON parsing errors', async () => {
      AsyncStorage.getItem
        .mockResolvedValueOnce('true') // isAuthenticated
        .mockResolvedValueOnce('invalid json'); // userProfile

      const result = await StorageService.getCurrentUserId();

      expect(result).toBe('visitor');
    });

    it('should handle errors gracefully', async () => {
      AsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

      const result = await StorageService.getCurrentUserId();

      expect(result).toBe('visitor');
    });
  });

  describe('setUserData', () => {
    it('should save data successfully', async () => {
      const result = await StorageService.setUserData('favorites', ['place1', 'place2']);

      expect(result.success).toBe(true);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'user_visitor_favorites',
        JSON.stringify(['place1', 'place2'])
      );
    });

    it('should save string data without double serialization', async () => {
      const result = await StorageService.setUserData('token', 'abc123');

      expect(result.success).toBe(true);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'user_visitor_token',
        'abc123'
      );
    });

    it('should handle errors', async () => {
      AsyncStorage.setItem.mockRejectedValue(new Error('Storage error'));

      const result = await StorageService.setUserData('favorites', []);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Storage error');
    });

    it('should use provided userId', async () => {
      const result = await StorageService.setUserData('favorites', [], 'test@example.com');

      expect(result.success).toBe(true);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'user_test@example.com_favorites',
        JSON.stringify([])
      );
    });
  });

  describe('getUserData', () => {
    it('should retrieve JSON data successfully', async () => {
      const favorites = ['place1', 'place2'];
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(favorites));

      const result = await StorageService.getUserData('favorites');

      expect(result).toEqual(favorites);
    });

    it('should return raw value for non-JSON data', async () => {
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify('raw string value'));

      const result = await StorageService.getUserData('token');

      expect(result).toBe('raw string value');
    });

    it('should return default value when data not found', async () => {
      AsyncStorage.getItem.mockResolvedValue(null);

      const result = await StorageService.getUserData('favorites', []);

      expect(result).toEqual([]);
    });

    it('should handle errors gracefully', async () => {
      AsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

      const result = await StorageService.getUserData('favorites', []);

      expect(result).toEqual([]);
    });

    it('should use provided userId', async () => {
      const favorites = ['place1'];
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(favorites));

      await StorageService.getUserData('favorites', null, 'test@example.com');

      expect(AsyncStorage.getItem).toHaveBeenCalledWith('user_test@example.com_favorites');
    });
  });

  describe('removeUserData', () => {
    it('should remove data successfully', async () => {
      const result = await StorageService.removeUserData('favorites');

      expect(result.success).toBe(true);
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('user_visitor_favorites');
    });

    it('should handle errors', async () => {
      AsyncStorage.removeItem.mockRejectedValue(new Error('Storage error'));

      const result = await StorageService.removeUserData('favorites');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Storage error');
    });

    it('should use provided userId', async () => {
      const result = await StorageService.removeUserData('favorites', 'test@example.com');

      expect(result.success).toBe(true);
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('user_test@example.com_favorites');
    });
  });

  describe('getAllUserData', () => {
    it('should retrieve all user data successfully', async () => {
      const userKeys = ['user_visitor_favorites', 'user_visitor_settings'];
      AsyncStorage.getAllKeys.mockResolvedValue(userKeys);
      AsyncStorage.getItem
        .mockResolvedValueOnce(JSON.stringify(['place1']))
        .mockResolvedValueOnce(JSON.stringify({ theme: 'dark' }));

      const result = await StorageService.getAllUserData('visitor');

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        favorites: ['place1'],
        settings: { theme: 'dark' }
      });
    });

    it('should handle mixed JSON and raw data', async () => {
      const userKeys = ['user_visitor_favorites', 'user_visitor_token'];
      AsyncStorage.getAllKeys.mockResolvedValue(userKeys);
      AsyncStorage.getItem
        .mockResolvedValueOnce(JSON.stringify(['place1']))
        .mockResolvedValueOnce('raw token');

      const result = await StorageService.getAllUserData('visitor');

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        favorites: ['place1'],
        token: 'raw token'
      });
    });

    it('should handle errors', async () => {
      AsyncStorage.getAllKeys.mockRejectedValue(new Error('Storage error'));

      const result = await StorageService.getAllUserData('visitor');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Storage error');
    });

    it('should return empty object when no user data found', async () => {
      AsyncStorage.getAllKeys.mockResolvedValue([]);

      const result = await StorageService.getAllUserData('visitor');

      expect(result.success).toBe(true);
      expect(result.data).toEqual({});
    });
  });

  describe('clearUserData', () => {
    it('should clear all user data successfully', async () => {
      const userKeys = ['user_visitor_favorites', 'user_visitor_settings'];
      AsyncStorage.getAllKeys.mockResolvedValue(userKeys);

      const result = await StorageService.clearUserData('visitor');

      expect(result.success).toBe(true);
      expect(AsyncStorage.multiRemove).toHaveBeenCalledWith(userKeys);
    });

    it('should handle case when no user data exists', async () => {
      AsyncStorage.getAllKeys.mockResolvedValue([]);

      const result = await StorageService.clearUserData('visitor');

      expect(result.success).toBe(true);
      expect(AsyncStorage.multiRemove).not.toHaveBeenCalled();
    });

    it('should handle errors', async () => {
      AsyncStorage.getAllKeys.mockRejectedValue(new Error('Storage error'));

      const result = await StorageService.clearUserData('visitor');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Storage error');
    });
  });

  describe('migrateGlobalToUserData', () => {
    it('should migrate global data to user data', async () => {
      AsyncStorage.getItem.mockResolvedValue('{"test": "data"}');
      AsyncStorage.setItem.mockResolvedValue();
      
      const result = await StorageService.migrateGlobalToUserData(['favorites']);
      
      expect(result.success).toBe(true);
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    it('should skip null values during migration', async () => {
      AsyncStorage.getItem.mockResolvedValue(null);
      
      const result = await StorageService.migrateGlobalToUserData(['favorites']);
      
      expect(result.success).toBe(true);
      // Should not call setItem when value is null
      expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    });

    it('should handle errors', async () => {
      AsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));
      
      const result = await StorageService.migrateGlobalToUserData(['favorites']);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Storage error');
    });
  });

  describe('initialize', () => {
    it('should initialize storage service successfully', async () => {
      const result = await StorageService.initialize();

      expect(result).toBeUndefined();
    });

    it('should handle initialization errors', async () => {
      AsyncStorage.getAllKeys.mockRejectedValue(new Error('Storage error'));

      const result = await StorageService.initialize();

      expect(result).toBeUndefined();
    });
  });

  describe('migrateVisitorDataToUser', () => {
    beforeEach(() => {
      AsyncStorage.getItem.mockResolvedValue('{"favorites": [], "mapMarkers": []}');
      AsyncStorage.setItem.mockResolvedValue();
      AsyncStorage.removeItem.mockResolvedValue();
    });

    it('should migrate visitor data to user', async () => {
      // Mock getAllUserData to return visitor data
      jest.spyOn(StorageService, 'getAllUserData').mockResolvedValue({ 
        success: true, 
        data: { 
          favorites: ['place1'], 
          mapMarkers: ['marker1'] 
        } 
      });
      
      const result = await StorageService.migrateVisitorDataToUser('test@example.com');
      
      expect(result.migrated).toBe(true);
      expect(result.count).toBeGreaterThan(0);
    });

    it('should handle cleanup when requested', async () => {
      // Mock getAllUserData to return visitor data
      jest.spyOn(StorageService, 'getAllUserData').mockResolvedValue({ 
        success: true, 
        data: { 
          favorites: ['place1'], 
          mapMarkers: ['marker1'] 
        } 
      });
      
      const result = await StorageService.migrateVisitorDataToUser('test@example.com', true);
      
      expect(result.migrated).toBe(true);
      expect(result.count).toBeGreaterThan(0);
    });

    it('should handle case when no visitor data exists', async () => {
      // Mock getAllUserData to return empty object with new format
      jest.spyOn(StorageService, 'getAllUserData').mockResolvedValue({ success: true, data: {} });
      
      const result = await StorageService.migrateVisitorDataToUser('test@example.com');
      
      expect(result.migrated).toBe(false);
      expect(result.count).toBe(0);
    });

    it('should handle errors', async () => {
      // Mock getAllUserData to return error with new format
      jest.spyOn(StorageService, 'getAllUserData').mockResolvedValue({ success: false, error: 'Migration error' });
      
      const result = await StorageService.migrateVisitorDataToUser('test@example.com');
      
      expect(result.migrated).toBe(false);
      expect(result.error).toBe('Migration error');
    });
  });

  describe('Utility methods', () => {
    describe('getFavorites', () => {
      it('should return favorites', async () => {
        const favorites = ['place1', 'place2'];
        AsyncStorage.getItem.mockResolvedValue(JSON.stringify(favorites));

        const result = await StorageService.getFavorites();

        expect(result).toEqual(favorites);
      });
    });

    describe('setFavorites', () => {
      it('should save favorites', async () => {
        const favorites = ['place1'];
        const result = await StorageService.setFavorites(favorites);

        expect(result.success).toBe(true);
      });
    });

    describe('addFavorite', () => {
      beforeEach(() => {
        AsyncStorage.getItem.mockResolvedValue(JSON.stringify([]));
        AsyncStorage.setItem.mockResolvedValue();
      });

      it('should add favorite if not exists', async () => {
        await StorageService.addFavorite('place2');
        
        expect(AsyncStorage.setItem).toHaveBeenCalled();
      });

      it('should not add favorite if already exists', async () => {
        AsyncStorage.getItem.mockResolvedValue(JSON.stringify(['place1']));
        
        await StorageService.addFavorite('place1');
        
        // Should not call setItem since it already exists
        expect(AsyncStorage.setItem).not.toHaveBeenCalled();
      });
    });

    describe('removeFavorite', () => {
      beforeEach(() => {
        AsyncStorage.getItem.mockResolvedValue(JSON.stringify(['place1', 'place2']));
        AsyncStorage.setItem.mockResolvedValue();
      });

      it('should remove favorite if exists', async () => {
        await StorageService.removeFavorite('place1');
        
        expect(AsyncStorage.setItem).toHaveBeenCalled();
      });

      it('should not modify favorites if place not found', async () => {
        const existingFavorites = ['place1', 'place2'];
        AsyncStorage.getItem.mockResolvedValue(JSON.stringify(existingFavorites));
        
        await StorageService.removeFavorite('place3');
        
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          expect.any(String),
          JSON.stringify(existingFavorites)
        );
      });
    });

    describe('getMapMarkers', () => {
      it('should return map markers', async () => {
        const markers = [{ id: '1', lat: 48.8566, lng: 2.3522 }];
        AsyncStorage.getItem.mockResolvedValue(JSON.stringify(markers));

        const result = await StorageService.getMapMarkers();

        expect(result).toEqual(markers);
      });
    });

    describe('setMapMarkers', () => {
      it('should save map markers', async () => {
        const markers = [{ id: '1', lat: 48.8566, lng: 2.3522 }];
        const result = await StorageService.setMapMarkers(markers);

        expect(result.success).toBe(true);
      });
    });

    describe('addMapMarker', () => {
      beforeEach(() => {
        AsyncStorage.getItem.mockResolvedValue(JSON.stringify([]));
        AsyncStorage.setItem.mockResolvedValue();
      });

      it('should add marker if not exists', async () => {
        const newMarker = { id: '2', lat: 48.8566, lng: 2.3522 };
        
        await StorageService.addMapMarker(newMarker);
        
        expect(AsyncStorage.setItem).toHaveBeenCalled();
      });

      it('should not add marker if already exists', async () => {
        const existingMarkers = [{ id: '1', lat: 48.8566, lng: 2.3522 }];
        AsyncStorage.getItem.mockResolvedValue(JSON.stringify(existingMarkers));
        
        await StorageService.addMapMarker({ id: '1', lat: 48.8566, lng: 2.3522 });
        
        expect(AsyncStorage.setItem).not.toHaveBeenCalled();
      });
    });

    describe('getAccessibilityPrefs', () => {
      it('should return accessibility preferences', async () => {
        const prefs = { requireRamp: true, requireElevator: false };
        AsyncStorage.getItem.mockResolvedValue(JSON.stringify(prefs));

        const result = await StorageService.getAccessibilityPrefs();

        expect(result).toEqual(prefs);
      });

      it('should return default preferences if none found', async () => {
        AsyncStorage.getItem.mockResolvedValue(null);

        const result = await StorageService.getAccessibilityPrefs();

        expect(result).toEqual({
          requireRamp: false,
          requireElevator: false,
          requireAccessibleParking: false,
          requireAccessibleToilets: false,
        });
      });
    });

    describe('setAccessibilityPrefs', () => {
      it('should save accessibility preferences', async () => {
        const prefs = { requireRamp: true, requireElevator: false };
        const result = await StorageService.setAccessibilityPrefs(prefs);

        expect(result.success).toBe(true);
      });
    });

    describe('getNotificationPrefs', () => {
      it('should return notification preferences', async () => {
        const prefs = { newPlaces: true, reviews: false };
        AsyncStorage.getItem.mockResolvedValue(JSON.stringify(prefs));

        const result = await StorageService.getNotificationPrefs();

        expect(result).toEqual(prefs);
      });

      it('should return default preferences if none found', async () => {
        AsyncStorage.getItem.mockResolvedValue(null);

        const result = await StorageService.getNotificationPrefs();

        expect(result).toEqual({
          newPlaces: false,
          reviews: false,
          updates: false,
        });
      });
    });

    describe('setNotificationPrefs', () => {
      it('should save notification preferences', async () => {
        const prefs = { newPlaces: true, reviews: false };
        const result = await StorageService.setNotificationPrefs(prefs);

        expect(result.success).toBe(true);
      });
    });

    describe('getSearchRadius', () => {
      it('should return search radius', async () => {
        AsyncStorage.getItem.mockResolvedValue('5000');

        const result = await StorageService.getSearchRadius();

        expect(result).toBe(5000);
      });

      it('should return default radius if none found', async () => {
        AsyncStorage.getItem.mockResolvedValue(null);

        const result = await StorageService.getSearchRadius();

        expect(result).toBe(800);
      });
    });

    describe('setSearchRadius', () => {
      it('should save search radius', async () => {
        const result = await StorageService.setSearchRadius(3000);

        expect(result.success).toBe(true);
      });
    });

    describe('getMapStyle', () => {
      it('should return map style', async () => {
        AsyncStorage.getItem.mockResolvedValue('dark');

        const result = await StorageService.getMapStyle();

        expect(result).toBe('dark');
      });

      it('should return default style if none found', async () => {
        AsyncStorage.getItem.mockResolvedValue(null);

        const result = await StorageService.getMapStyle();

        expect(result).toBe('standard');
      });
    });

    describe('setMapStyle', () => {
      it('should save map style', async () => {
        const result = await StorageService.setMapStyle('satellite');

        expect(result.success).toBe(true);
      });
    });

    describe('getBiometricPrefs', () => {
      it('should return biometric preferences', async () => {
        const prefs = { enabled: true, type: 'fingerprint' };
        AsyncStorage.getItem.mockResolvedValue(JSON.stringify(prefs));

        const result = await StorageService.getBiometricPrefs();

        expect(result).toEqual(prefs);
      });

      it('should return default preferences if none found', async () => {
        AsyncStorage.getItem.mockResolvedValue(null);

        const result = await StorageService.getBiometricPrefs();

        expect(result).toEqual({
          enabled: false,
          type: 'fingerprint'
        });
      });
    });

    describe('setBiometricPrefs', () => {
      it('should save biometric preferences', async () => {
        const prefs = { enabled: true, type: 'face' };
        const result = await StorageService.setBiometricPrefs(prefs);

        expect(result.success).toBe(true);
      });
    });

    describe('getPushToken', () => {
      it('should return push token', async () => {
        AsyncStorage.getItem.mockResolvedValue('abc123');

        const result = await StorageService.getPushToken();

        expect(result).toBe('abc123');
      });
    });

    describe('setPushToken', () => {
      it('should save push token', async () => {
        const result = await StorageService.setPushToken('abc123');

        expect(result.success).toBe(true);
      });
    });

    describe('getHistory', () => {
      it('should return history', async () => {
        const history = [{ place: 'place1', date: '2023-01-01' }];
        AsyncStorage.getItem.mockResolvedValue(JSON.stringify(history));

        const result = await StorageService.getHistory();

        expect(result).toEqual(history);
      });
    });

    describe('setHistory', () => {
      it('should save history', async () => {
        const history = [{ place: 'place1', date: '2023-01-01' }];
        const result = await StorageService.setHistory(history);

        expect(result.success).toBe(true);
      });
    });

    describe('getSettings', () => {
      it('should return settings', async () => {
        const settings = { theme: 'dark', language: 'fr' };
        AsyncStorage.getItem.mockResolvedValue(JSON.stringify(settings));

        const result = await StorageService.getSettings();

        expect(result).toEqual(settings);
      });
    });

    describe('setSettings', () => {
      it('should save settings', async () => {
        const settings = { theme: 'light', language: 'en' };
        const result = await StorageService.setSettings(settings);

        expect(result.success).toBe(true);
      });
    });
  });
}); 