// Mock des dépendances
jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  getExpoPushTokenAsync: jest.fn(),
  setNotificationChannelAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  cancelAllScheduledNotificationsAsync: jest.fn(),
  AndroidImportance: {
    MAX: 'max',
  },
}));

jest.mock('expo-device', () => ({
  isDevice: true,
}));

jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
  },
}));

jest.mock('../../services/storageService', () => ({
  default: {
    setPushToken: jest.fn(),
    getNotificationPrefs: jest.fn(),
  },
}));

// Forcer l'utilisation du vrai module NotificationService
jest.unmock('../../services/notificationService');

// Import NotificationService après les mocks
import NotificationService from '../../services/notificationService';

describe('NotificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isEnabled', () => {
    it('retourne true si les permissions sont accordées', async () => {
      const { getPermissionsAsync } = require('expo-notifications');
      getPermissionsAsync.mockResolvedValue({ status: 'granted' });

      const result = await NotificationService.isEnabled();
      
      expect(result).toBe(true);
      expect(getPermissionsAsync).toHaveBeenCalled();
    });

    it('retourne false si les permissions sont refusées', async () => {
      const { getPermissionsAsync } = require('expo-notifications');
      getPermissionsAsync.mockResolvedValue({ status: 'denied' });

      const result = await NotificationService.isEnabled();
      
      expect(result).toBe(false);
    });

    it('retourne false en cas d\'erreur', async () => {
      const { getPermissionsAsync } = require('expo-notifications');
      getPermissionsAsync.mockRejectedValue(new Error('Test error'));

      const result = await NotificationService.isEnabled();
      
      expect(result).toBe(false);
    });
  });

  describe('getNotificationPreferences', () => {
    it('retourne les préférences par défaut si aucune préférence stockée', async () => {
      const { default: StorageService } = require('../../services/storageService');
      StorageService.getNotificationPrefs.mockResolvedValue(null);

      const result = await NotificationService.getNotificationPreferences();
      
      expect(result).toEqual({
        newPlaces: false,
        reviews: false,
        updates: false,
      });
    });

    it('retourne les préférences par défaut en cas d\'erreur', async () => {
      const { default: StorageService } = require('../../services/storageService');
      StorageService.getNotificationPrefs.mockRejectedValue(new Error('Test error'));

      const result = await NotificationService.getNotificationPreferences();
      
      expect(result).toEqual({
        newPlaces: false,
        reviews: false,
        updates: false,
      });
    });
  });

  describe('sendLocalNotification', () => {
    it('retourne false si toutes les notifications sont désactivées', async () => {
      const { default: StorageService } = require('../../services/storageService');
      StorageService.getNotificationPrefs.mockResolvedValue({
        newPlaces: false,
        reviews: false,
        updates: false,
      });

      const result = await NotificationService.sendLocalNotification('Test', 'Test body');
      
      expect(result).toBe(false);
    });
  });

  describe('notifyNewPlace', () => {
    it('retourne false si les notifications de nouveaux lieux sont désactivées', async () => {
      const { default: StorageService } = require('../../services/storageService');
      StorageService.getNotificationPrefs.mockResolvedValue({
        newPlaces: false,
        reviews: false,
        updates: false,
      });

      const result = await NotificationService.notifyNewPlace('Restaurant Test', 500);
      
      expect(result).toBe(false);
    });
  });

  describe('notifyNewReview', () => {
    it('retourne false si les notifications d\'avis sont désactivées', async () => {
      const { default: StorageService } = require('../../services/storageService');
      StorageService.getNotificationPrefs.mockResolvedValue({
        newPlaces: false,
        reviews: false,
        updates: false,
      });

      const result = await NotificationService.notifyNewReview('Restaurant Test', 4);
      
      expect(result).toBe(false);
    });
  });
}); 