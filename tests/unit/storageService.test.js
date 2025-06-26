// Tests temporairement désactivés à cause des erreurs d'imports dynamiques
// TODO: Réactiver une fois que les imports dynamiques seront corrigés

import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageService } from '../../services/storageService';

jest.mock('@react-native-async-storage/async-storage');

describe('StorageService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getUserStorageKey génère une clé unique', () => {
    expect(StorageService.getUserStorageKey('user1', 'key')).toBe('user_user1_key');
  });

  it('getUserStorageKey lance une erreur si userId manquant', () => {
    expect(() => StorageService.getUserStorageKey(null, 'key')).toThrow();
  });

  it('setUserData sauvegarde une donnée', async () => {
    AsyncStorage.setItem.mockResolvedValue();
    StorageService.getCurrentUserId = jest.fn().mockResolvedValue('user1');
    const res = await StorageService.setUserData('key', { foo: 'bar' });
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('user_user1_key', JSON.stringify({ foo: 'bar' }));
    expect(res.success).toBe(true);
  });

  it('getUserData retourne la valeur parsée', async () => {
    AsyncStorage.getItem.mockResolvedValue(JSON.stringify({ foo: 'bar' }));
    StorageService.getCurrentUserId = jest.fn().mockResolvedValue('user1');
    const res = await StorageService.getUserData('key');
    expect(res).toEqual({ foo: 'bar' });
  });

  it('getUserData retourne la valeur brute si non JSON', async () => {
    AsyncStorage.getItem.mockResolvedValue('brut');
    StorageService.getCurrentUserId = jest.fn().mockResolvedValue('user1');
    const res = await StorageService.getUserData('key');
    expect(res).toBe('brut');
  });

  it('getUserData retourne defaultValue si rien trouvé', async () => {
    AsyncStorage.getItem.mockResolvedValue(null);
    StorageService.getCurrentUserId = jest.fn().mockResolvedValue('user1');
    const res = await StorageService.getUserData('key', 'def');
    expect(res).toBe('def');
  });

  it('removeUserData supprime la donnée', async () => {
    AsyncStorage.removeItem.mockResolvedValue();
    StorageService.getCurrentUserId = jest.fn().mockResolvedValue('user1');
    const res = await StorageService.removeUserData('key');
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('user_user1_key');
    expect(res.success).toBe(true);
  });

  it('getAllUserData retourne toutes les données utilisateur', async () => {
    AsyncStorage.getAllKeys.mockResolvedValue(['user_user1_key1', 'user_user1_key2', 'other_key']);
    AsyncStorage.getItem.mockImplementation(key => {
      if (key === 'user_user1_key1') return Promise.resolve(JSON.stringify('val1'));
      if (key === 'user_user1_key2') return Promise.resolve('val2');
      return Promise.resolve(null);
    });
    const res = await StorageService.getAllUserData('user1');
    expect(res.success).toBe(true);
    expect(res.data).toEqual({ key1: 'val1', key2: 'val2' });
  });

  it('clearUserData supprime toutes les données utilisateur', async () => {
    AsyncStorage.getAllKeys.mockResolvedValue(['user_user1_key1', 'user_user1_key2', 'other_key']);
    AsyncStorage.multiRemove.mockResolvedValue();
    const res = await StorageService.clearUserData('user1');
    expect(AsyncStorage.multiRemove).toHaveBeenCalledWith(['user_user1_key1', 'user_user1_key2']);
    expect(res.success).toBe(true);
  });

  it('migrateGlobalToUserData migre les clés globales', async () => {
    StorageService.getCurrentUserId = jest.fn().mockResolvedValue('user1');
    AsyncStorage.getItem.mockResolvedValue('val');
    StorageService.setUserData = jest.fn().mockResolvedValue({ success: true });
    const res = await StorageService.migrateGlobalToUserData(['key1', 'key2']);
    expect(StorageService.setUserData).toHaveBeenCalledTimes(2);
    expect(res.success).toBe(true);
  });

  describe('Méthodes utilitaires', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      StorageService.getCurrentUserId = jest.fn().mockResolvedValue('user1');
    });

    it('getFavorites retourne les favoris', async () => {
      StorageService.getUserData = jest.fn().mockResolvedValue(['fav1']);
      const res = await StorageService.getFavorites();
      expect(res).toEqual(['fav1']);
    });
    it('setFavorites sauvegarde les favoris', async () => {
      StorageService.setUserData = jest.fn().mockResolvedValue({ success: true });
      const res = await StorageService.setFavorites(['fav1']);
      expect(StorageService.setUserData).toHaveBeenCalledWith('favorites', ['fav1']);
      expect(res.success).toBe(true);
    });
    it('addFavorite n\'appelle pas setFavorites si le favori existe déjà', async () => {
      StorageService.getFavorites = jest.fn().mockResolvedValue(['fav1']);
      StorageService.setFavorites = jest.fn();
      const res = await StorageService.addFavorite('fav1');
      expect(StorageService.setFavorites).not.toHaveBeenCalled();
      expect(res).toBeUndefined();
    });
    it('removeFavorite appelle setFavorites avec le tableau d\'origine si le favori n\'existe pas', async () => {
      StorageService.getFavorites = jest.fn().mockResolvedValue(['fav2']);
      StorageService.setFavorites = jest.fn().mockResolvedValue({ success: true });
      const res = await StorageService.removeFavorite('fav1');
      expect(StorageService.setFavorites).toHaveBeenCalledWith(['fav2']);
      expect(res).toBeUndefined();
    });
    it('getMapMarkers retourne les marqueurs', async () => {
      StorageService.getUserData = jest.fn().mockResolvedValue(['m1']);
      const res = await StorageService.getMapMarkers();
      expect(res).toEqual(['m1']);
    });
    it('setMapMarkers sauvegarde les marqueurs', async () => {
      StorageService.setUserData = jest.fn().mockResolvedValue({ success: true });
      const res = await StorageService.setMapMarkers(['m1']);
      expect(StorageService.setUserData).toHaveBeenCalledWith('mapMarkers', ['m1']);
      expect(res.success).toBe(true);
    });
    it('addMapMarker n\'appelle pas setMapMarkers si le marqueur existe déjà', async () => {
      StorageService.getMapMarkers = jest.fn().mockResolvedValue(['m1']);
      StorageService.setMapMarkers = jest.fn();
      const res = await StorageService.addMapMarker('m1');
      expect(StorageService.setMapMarkers).not.toHaveBeenCalled();
      expect(res).toBeUndefined();
    });
    it('getAccessibilityPrefs retourne les prefs', async () => {
      StorageService.getUserData = jest.fn().mockResolvedValue({ a: 1 });
      const res = await StorageService.getAccessibilityPrefs();
      expect(res).toEqual({ a: 1 });
    });
    it('setAccessibilityPrefs sauvegarde les prefs', async () => {
      StorageService.setUserData = jest.fn().mockResolvedValue({ success: true });
      const res = await StorageService.setAccessibilityPrefs({ a: 1 });
      expect(StorageService.setUserData).toHaveBeenCalledWith('accessibilityPrefs', { a: 1 });
      expect(res.success).toBe(true);
    });
    it('getNotificationPrefs retourne les prefs', async () => {
      StorageService.getUserData = jest.fn().mockResolvedValue({ n: 1 });
      const res = await StorageService.getNotificationPrefs();
      expect(res).toEqual({ n: 1 });
    });
    it('setNotificationPrefs sauvegarde les prefs', async () => {
      StorageService.setUserData = jest.fn().mockResolvedValue({ success: true });
      const res = await StorageService.setNotificationPrefs({ n: 1 });
      expect(StorageService.setUserData).toHaveBeenCalledWith('notifications', { n: 1 });
      expect(res.success).toBe(true);
    });
    it('getSearchRadius retourne le radius', async () => {
      StorageService.getUserData = jest.fn().mockResolvedValue(42);
      const res = await StorageService.getSearchRadius();
      expect(res).toBe(42);
    });
    it('setSearchRadius sauvegarde le radius', async () => {
      StorageService.setUserData = jest.fn().mockResolvedValue({ success: true });
      const res = await StorageService.setSearchRadius(42);
      expect(StorageService.setUserData).toHaveBeenCalledWith('searchRadius', 42);
      expect(res.success).toBe(true);
    });
    it('getMapStyle retourne le style', async () => {
      StorageService.getUserData = jest.fn().mockResolvedValue('style');
      const res = await StorageService.getMapStyle();
      expect(res).toBe('style');
    });
    it('setMapStyle sauvegarde le style', async () => {
      StorageService.setUserData = jest.fn().mockResolvedValue({ success: true });
      const res = await StorageService.setMapStyle('style');
      expect(StorageService.setUserData).toHaveBeenCalledWith('mapStyle', 'style');
      expect(res.success).toBe(true);
    });
    it('getBiometricPrefs retourne les prefs', async () => {
      StorageService.getUserData = jest.fn().mockResolvedValue({ b: 1 });
      const res = await StorageService.getBiometricPrefs();
      expect(res).toEqual({ b: 1 });
    });
    it('setBiometricPrefs sauvegarde les prefs', async () => {
      StorageService.setUserData = jest.fn().mockResolvedValue({ success: true });
      const res = await StorageService.setBiometricPrefs({ b: 1 });
      expect(StorageService.setUserData).toHaveBeenCalledWith('biometricPreferences', { b: 1 });
      expect(res.success).toBe(true);
    });
    it('getPushToken retourne le token', async () => {
      StorageService.getUserData = jest.fn().mockResolvedValue('token');
      const res = await StorageService.getPushToken();
      expect(res).toBe('token');
    });
    it('setPushToken sauvegarde le token', async () => {
      StorageService.setUserData = jest.fn().mockResolvedValue({ success: true });
      const res = await StorageService.setPushToken('token');
      expect(StorageService.setUserData).toHaveBeenCalledWith('pushToken', 'token');
      expect(res.success).toBe(true);
    });
    it('getHistory retourne l\'historique', async () => {
      StorageService.getUserData = jest.fn().mockResolvedValue(['h1']);
      const res = await StorageService.getHistory();
      expect(res).toEqual(['h1']);
    });
    it('setHistory sauvegarde l\'historique', async () => {
      StorageService.setUserData = jest.fn().mockResolvedValue({ success: true });
      const res = await StorageService.setHistory(['h1']);
      expect(StorageService.setUserData).toHaveBeenCalledWith('history', ['h1']);
      expect(res.success).toBe(true);
    });
    it('getSettings retourne les settings', async () => {
      StorageService.getUserData = jest.fn().mockResolvedValue({ s: 1 });
      const res = await StorageService.getSettings();
      expect(res).toEqual({ s: 1 });
    });
    it('setSettings sauvegarde les settings', async () => {
      StorageService.setUserData = jest.fn().mockResolvedValue({ success: true });
      const res = await StorageService.setSettings({ s: 1 });
      expect(StorageService.setUserData).toHaveBeenCalledWith('settings', { s: 1 });
      expect(res.success).toBe(true);
    });
  });
}); 