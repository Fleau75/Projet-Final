import AsyncStorage from '@react-native-async-storage/async-storage';
// const { AuthService } = require('./authService'); // décommenter si besoin

/**
 * Service de stockage privé pour chaque utilisateur/visiteur
 * Chaque utilisateur a son propre espace de stockage isolé
 */
export class StorageService {
  
  /**
   * Génère une clé de stockage unique pour un utilisateur
   * @param {string} userId - ID de l'utilisateur ou 'visitor' pour les visiteurs
   * @param {string} key - Clé de la donnée
   * @returns {string} Clé de stockage unique
   */
  static getUserStorageKey(userId, key) {
    if (!userId) {
      throw new Error('userId est requis pour le stockage privé');
    }
    return `user_${userId}_${key}`;
  }

  /**
   * Récupère l'ID de l'utilisateur actuel
   * @returns {Promise<string>} ID de l'utilisateur ou 'visitor'
   */
  static async getCurrentUserId() {
    try {
      console.log('🔍 StorageService.getCurrentUserId() - Début...');
      
      // Utiliser directement AsyncStorage pour les clés d'authentification globales
      // car ces clés ne sont pas encore migrées vers le système privé
      const isAuth = await AsyncStorage.getItem('isAuthenticated');
      console.log('🔍 isAuthenticated:', isAuth);
      
      if (isAuth === 'true') {
        const userProfile = await AsyncStorage.getItem('userProfile');
        console.log('🔍 userProfile brut:', userProfile);
        
        if (userProfile) {
          try {
            const profile = JSON.parse(userProfile);
            console.log('🔍 profile parsé:', profile);
            
            // Si c'est un visiteur, retourner 'visitor'
            if (profile.isVisitor) {
              console.log('🔍 Utilisateur détecté comme visiteur');
              return 'visitor';
            }
            // Sinon retourner l'email comme ID unique
            const userId = profile.email || profile.uid;
            console.log('🔍 ID utilisateur déterminé:', userId);
            return userId;
          } catch (parseError) {
            console.error('Erreur lors du parsing du profil:', parseError);
            return 'visitor';
          }
        } else {
          console.log('🔍 Aucun profil utilisateur trouvé');
        }
      } else {
        console.log('🔍 Utilisateur non authentifié');
      }
      
      console.log('🔍 Retour par défaut: visitor');
      return 'visitor';
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'ID utilisateur:', error);
      return 'visitor';
    }
  }

  /**
   * Sauvegarde une donnée pour l'utilisateur actuel
   * @param {string} key - Clé de la donnée
   * @param {any} value - Valeur à sauvegarder
   * @param {string} userId - ID de l'utilisateur (optionnel, auto-détecté si non fourni)
   */
  static async setUserData(key, value, userId = null) {
    try {
      const currentUserId = userId || await this.getCurrentUserId();
      const storageKey = this.getUserStorageKey(currentUserId, key);
      const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
      
      console.log(`💾 setUserData: ${key} -> ${storageKey} (userId: ${currentUserId})`);
      await AsyncStorage.setItem(storageKey, serializedValue);
      console.log(`💾 Donnée sauvegardée pour ${currentUserId}: ${key}`);
    } catch (error) {
      console.error(`❌ Erreur lors de la sauvegarde de ${key}:`, error);
      throw error;
    }
  }

  /**
   * Récupère une donnée pour l'utilisateur actuel
   * @param {string} key - Clé de la donnée
   * @param {any} defaultValue - Valeur par défaut si la donnée n'existe pas
   * @param {string} userId - ID de l'utilisateur (optionnel, auto-détecté si non fourni)
   * @returns {Promise<any>} Donnée récupérée
   */
  static async getUserData(key, defaultValue = null, userId = null) {
    try {
      const currentUserId = userId || await this.getCurrentUserId();
      const storageKey = this.getUserStorageKey(currentUserId, key);
      
      console.log(`🔍 getUserData: ${key} -> ${storageKey} (userId: ${currentUserId})`);
      
      const value = await AsyncStorage.getItem(storageKey);
      if (value === null) {
        console.log(`🔍 Aucune donnée trouvée pour ${key}, retour de la valeur par défaut`);
        return defaultValue;
      }
      
      // Essayer de parser comme JSON, sinon retourner la valeur brute
      try {
        const parsedValue = JSON.parse(value);
        console.log(`🔍 Donnée récupérée pour ${key}:`, parsedValue);
        return parsedValue;
      } catch {
        console.log(`🔍 Donnée brute récupérée pour ${key}:`, value);
        return value;
      }
    } catch (error) {
      console.error(`❌ Erreur lors de la récupération de ${key}:`, error);
      return defaultValue;
    }
  }

  /**
   * Supprime une donnée pour l'utilisateur actuel
   * @param {string} key - Clé de la donnée
   * @param {string} userId - ID de l'utilisateur (optionnel, auto-détecté si non fourni)
   */
  static async removeUserData(key, userId = null) {
    try {
      const currentUserId = userId || await this.getCurrentUserId();
      const storageKey = this.getUserStorageKey(currentUserId, key);
      
      await AsyncStorage.removeItem(storageKey);
      console.log(`🗑️ Donnée supprimée pour ${currentUserId}: ${key}`);
    } catch (error) {
      console.error(`❌ Erreur lors de la suppression de ${key}:`, error);
      throw error;
    }
  }

  /**
   * Récupère toutes les données d'un utilisateur
   * @param {string} userId - ID de l'utilisateur
   * @returns {Promise<Object>} Toutes les données de l'utilisateur
   */
  static async getAllUserData(userId) {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const userKeys = allKeys.filter(key => key.startsWith(`user_${userId}_`));
      
      const userData = {};
      for (const key of userKeys) {
        const dataKey = key.replace(`user_${userId}_`, '');
        const value = await AsyncStorage.getItem(key);
        try {
          userData[dataKey] = JSON.parse(value);
        } catch {
          userData[dataKey] = value;
        }
      }
      
      return userData;
    } catch (error) {
      console.error(`❌ Erreur lors de la récupération des données de ${userId}:`, error);
      return {};
    }
  }

  /**
   * Supprime toutes les données d'un utilisateur
   * @param {string} userId - ID de l'utilisateur
   */
  static async clearUserData(userId) {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const userKeys = allKeys.filter(key => key.startsWith(`user_${userId}_`));
      
      if (userKeys.length > 0) {
        await AsyncStorage.multiRemove(userKeys);
        console.log(`🗑️ Toutes les données supprimées pour ${userId} (${userKeys.length} clés)`);
      }
    } catch (error) {
      console.error(`❌ Erreur lors de la suppression des données de ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Migre les données globales vers le stockage privé de l'utilisateur actuel
   * @param {Array<string>} keys - Liste des clés à migrer
   */
  static async migrateGlobalToUserData(keys) {
    try {
      const currentUserId = await this.getCurrentUserId();
      console.log(`🔄 Migration des données globales vers ${currentUserId}...`);
      
      for (const key of keys) {
        const globalValue = await AsyncStorage.getItem(key);
        if (globalValue !== null) {
          await this.setUserData(key, globalValue, currentUserId);
          console.log(`✅ Migré: ${key}`);
        }
      }
      
      console.log(`✅ Migration terminée pour ${currentUserId}`);
    } catch (error) {
      console.error('❌ Erreur lors de la migration:', error);
      throw error;
    }
  }

  /**
   * Méthodes spécialisées pour les données courantes
   */

  // Favoris
  static async getFavorites() {
    return await this.getUserData('favorites', []);
  }

  static async setFavorites(favorites) {
    return await this.setUserData('favorites', favorites);
  }

  static async addFavorite(place) {
    const favorites = await this.getFavorites();
    const exists = favorites.find(fav => fav.id === place.id);
    if (!exists) {
      favorites.push({ ...place, savedDate: new Date().toISOString() });
      await this.setFavorites(favorites);
    }
  }

  static async removeFavorite(placeId) {
    const favorites = await this.getFavorites();
    const filtered = favorites.filter(fav => fav.id !== placeId);
    await this.setFavorites(filtered);
  }

  // Historique des lieux sur la carte
  static async getMapMarkers() {
    return await this.getUserData('mapMarkers', []);
  }

  static async setMapMarkers(markers) {
    return await this.setUserData('mapMarkers', markers);
  }

  static async addMapMarker(marker) {
    const markers = await this.getMapMarkers();
    const exists = markers.find(m => m.id === marker.id);
    if (!exists) {
      markers.push({ ...marker, addedDate: new Date().toISOString() });
      await this.setMapMarkers(markers);
    }
  }

  // Paramètres d'accessibilité
  static async getAccessibilityPrefs() {
    return await this.getUserData('accessibilityPrefs', {
      requireRamp: false,
      requireElevator: false,
      requireAccessibleParking: false,
      requireAccessibleToilets: false,
    });
  }

  static async setAccessibilityPrefs(prefs) {
    return await this.setUserData('accessibilityPrefs', prefs);
  }

  // Paramètres de notification
  static async getNotificationPrefs() {
    return await this.getUserData('notifications', {
      newPlaces: false,
      reviews: false,
      updates: false,
    });
  }

  static async setNotificationPrefs(prefs) {
    return await this.setUserData('notifications', prefs);
  }

  // Rayon de recherche
  static async getSearchRadius() {
    return await this.getUserData('searchRadius', 800);
  }

  static async setSearchRadius(radius) {
    return await this.setUserData('searchRadius', radius);
  }

  // Style de carte
  static async getMapStyle() {
    return await this.getUserData('mapStyle', 'standard');
  }

  static async setMapStyle(style) {
    return await this.setUserData('mapStyle', style);
  }

  // Préférences biométriques
  static async getBiometricPrefs() {
    return await this.getUserData('biometricPreferences', {
      enabled: false,
      type: 'fingerprint'
    });
  }

  static async setBiometricPrefs(prefs) {
    return await this.setUserData('biometricPreferences', prefs);
  }

  // Token push
  static async getPushToken() {
    return await this.getUserData('pushToken', null);
  }

  static async setPushToken(token) {
    return await this.setUserData('pushToken', token);
  }

  // Historique des lieux visités
  static async getHistory() {
    return await this.getUserData('history', []);
  }

  static async setHistory(history) {
    return await this.setUserData('history', history);
  }

  // Paramètres généraux (settings)
  static async getSettings() {
    return await this.getUserData('settings', {});
  }

  static async setSettings(settings) {
    return await this.setUserData('settings', settings);
  }

  /**
   * Initialise le service de stockage et migre les données existantes
   */
  static async initialize() {
    try {
      console.log('💾 Initialisation du service de stockage privé...');
      
      // Liste des clés à migrer depuis le stockage global
      const keysToMigrate = [
        'favorites',
        'mapMarkers', 
        'accessibilityPrefs',
        'notifications',
        'searchRadius',
        'mapStyle',
        'biometricPreferences',
        'pushToken'
      ];

      // Migrer les données globales vers le stockage privé
      await this.migrateGlobalToUserData(keysToMigrate);
      
      console.log('✅ Service de stockage privé initialisé');
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation du stockage:', error);
    }
  }
}

export default StorageService; 