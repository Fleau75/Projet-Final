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
      await AsyncStorage.setItem(storageKey, serializedValue);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message || error.toString() };
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
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message || error.toString() };
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
      return { success: true, data: userData };
    } catch (error) {
      return { success: false, error: error.message || error.toString() };
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
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message || error.toString() };
    }
  }

  /**
   * Migre les données globales vers le stockage privé de l'utilisateur actuel
   * @param {Array<string>} keys - Liste des clés à migrer
   */
  static async migrateGlobalToUserData(keys) {
    try {
      const currentUserId = await this.getCurrentUserId();
      for (const key of keys) {
        const globalValue = await AsyncStorage.getItem(key);
        if (globalValue !== null) {
          await this.setUserData(key, globalValue, currentUserId);
        }
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message || error.toString() };
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
    const prefs = await this.getUserData('accessibilityPrefs', {
      requireRamp: false,
      requireElevator: false,
      requireAccessibleParking: false,
      requireAccessibleToilets: false,
    });
    
    // Convertir l'ancien format vers le nouveau si nécessaire
    return this.convertAccessibilityPrefs(prefs);
  }

  static async setAccessibilityPrefs(prefs) {
    return await this.setUserData('accessibilityPrefs', prefs);
  }

  /**
   * Convertit les anciens formats de préférences d'accessibilité vers le nouveau format
   */
  static convertAccessibilityPrefs(prefs) {
    // Si c'est déjà le bon format, retourner tel quel
    if (prefs.requireRamp !== undefined) {
      return prefs;
    }
    
    // Convertir l'ancien format (cognitive, hearing, mobility, visual, wheelchair)
    // vers le nouveau format (requireRamp, requireElevator, requireAccessibleParking, requireAccessibleToilets)
    const convertedPrefs = {
      requireRamp: prefs.wheelchair || prefs.mobility || false,
      requireElevator: prefs.mobility || false,
      requireAccessibleParking: prefs.wheelchair || prefs.mobility || false,
      requireAccessibleToilets: prefs.wheelchair || prefs.mobility || false,
    };
    
    console.log('🔄 Conversion des préférences d\'accessibilité:', { old: prefs, new: convertedPrefs });
    return convertedPrefs;
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

  /**
   * Migre toutes les données du visiteur vers un nouvel utilisateur
   * @param {string} userEmail - Email du nouvel utilisateur
   * @param {boolean} shouldCleanup - Si true, nettoie les données visiteur après migration
   */
  static async migrateVisitorDataToUser(userEmail, shouldCleanup = true) {
    try {
      const visitorId = 'visitor';
      const visitorDataResult = await this.getAllUserData(visitorId);
      let migratedCount = 0;
      let reviewsMigrated = 0;
      
      console.log('🔄 Début de la migration des données visiteur vers:', userEmail);
      
      // Vérifier si la récupération des données a réussi
      if (!visitorDataResult.success) {
        console.error('❌ Erreur lors de la récupération des données visiteur:', visitorDataResult.error);
        return { migrated: false, error: visitorDataResult.error };
      }
      
      const visitorData = visitorDataResult.data;
      console.log('📊 Données visiteur trouvées:', Object.keys(visitorData));
      
      // Migration des données locales
      if (visitorData && Object.keys(visitorData).length > 0) {
        // Copier chaque clé du visiteur vers le nouvel utilisateur
        for (const [key, value] of Object.entries(visitorData)) {
          // Ne pas migrer les clés d'authentification
          if (!['userProfile', 'isAuthenticated', 'userPassword', 'currentUser'].includes(key)) {
            await this.setUserData(key, value, userEmail);
            console.log(`✅ Migré ${key} du visiteur vers ${userEmail}`);
            migratedCount++;
          } else {
            console.log(`⏭️ Ignoré ${key} (clé d'authentification)`);
          }
        }
      }

      // Migration des avis Firebase (import dynamique pour éviter les conflits)
      try {
        console.log('🔄 Migration des avis Firebase du visiteur...');
        let ReviewsService, AuthService;
        if (process.env.NODE_ENV === 'test') {
          ({ ReviewsService, AuthService } = require('./firebaseService'));
        } else {
          ({ ReviewsService } = await import('./firebaseService'));
          ({ AuthService } = await import('./firebaseService'));
        }
        console.log('✅ ReviewsService importé avec succès');
        
        // Chercher les avis avec l'email du visiteur, pas l'ID
        const visitorReviews = await ReviewsService.getReviewsByUserId('visiteur@accessplus.com', 'visiteur@accessplus.com');
        console.log(`📝 ${visitorReviews.length} avis visiteur trouvés à migrer`);
        
        if (visitorReviews && visitorReviews.length > 0) {
          reviewsMigrated = visitorReviews.length;
          
          for (const review of visitorReviews) {
            console.log(`🔄 Migration de l'avis: ${review.placeName} (${review.id})`);
            
            // Recopier les images vers le nouveau compte utilisateur
            let migratedImages = [];
            if (review.photos && review.photos.length > 0) {
              console.log(`🖼️ Migration de ${review.photos.length} photos...`);
              try {
                // Recopier chaque image vers le nouveau compte
                const uploadPromises = review.photos.map(async (imageUri, index) => {
                  console.log(`🖼️ Upload de la photo ${index + 1}: ${imageUri}`);
                  
                  // Vérifier si c'est une URL Firebase ou une URI locale
                  if (imageUri.startsWith('http') && imageUri.includes('firebase')) {
                    console.log(`🖼️ Photo Firebase détectée, recopie...`);
                    // C'est une image Firebase, la recopier
                    return await ReviewsService.uploadImage(imageUri, 'reviews');
                  } else {
                    console.log(`🖼️ Photo locale détectée, upload...`);
                    // C'est une image locale, l'uploader
                    return await ReviewsService.uploadImage(imageUri, 'reviews');
                  }
                });
                
                migratedImages = await Promise.all(uploadPromises);
                console.log(`✅ ${migratedImages.length} photos migrées avec succès`);
              } catch (imageError) {
                console.error('❌ Erreur lors de la migration des photos:', imageError);
                // Continuer avec les photos originales si la migration échoue
                migratedImages = review.photos;
                console.log(`⚠️ Utilisation des photos originales`);
              }
            }
            
            // Recréer l'avis avec le nouvel ID utilisateur et les nouvelles photos
            const newReviewData = {
              placeId: review.placeId,
              placeName: review.placeName,
              rating: review.rating,
              comment: review.comment,
              photos: migratedImages,
              accessibility: review.accessibility || {},
              userEmail: userEmail,
            };
            
            console.log(`📝 Création du nouvel avis pour ${review.placeName}`);
            const newReviewId = await ReviewsService.addReview(newReviewData, userEmail);
            console.log(`✅ Avis migré pour ${review.placeName} -> ID: ${newReviewId}`);
            
            // Supprimer l'ancien avis visiteur
            await ReviewsService.deleteReview(review.id);
            console.log(`🗑️ Ancien avis visiteur supprimé: ${review.id}`);
          }
          
          console.log(`✅ ${visitorReviews.length} avis Firebase migrés avec succès`);
          
          // NETTOYAGE SUPPLÉMENTAIRE : Supprimer tous les avis restants du visiteur
          try {
            console.log('🧹 Nettoyage supplémentaire des avis Firebase du visiteur...');
            const remainingReviews = await ReviewsService.getReviewsByUserId('visiteur@accessplus.com', 'visiteur@accessplus.com');
            console.log(`📝 ${remainingReviews.length} avis restants trouvés pour nettoyage`);
            
            if (remainingReviews.length > 0) {
              for (const review of remainingReviews) {
                console.log(`🗑️ Suppression de l'avis restant: ${review.placeName} (${review.id})`);
                await ReviewsService.deleteReview(review.id);
              }
              console.log(`✅ ${remainingReviews.length} avis restants supprimés`);
            }
          } catch (cleanupError) {
            console.error('❌ Erreur lors du nettoyage supplémentaire des avis:', cleanupError);
          }
          
          // Mettre à jour les statistiques de l'utilisateur
          try {
            console.log('📊 Mise à jour des statistiques...');
            const currentStats = await AuthService.getUserStatsByEmail(userEmail);
            console.log('📊 Statistiques actuelles:', currentStats);
            
            const updatedStats = {
              ...currentStats,
              reviewsAdded: (currentStats.reviewsAdded || 0) + visitorReviews.length,
              placesAdded: (currentStats.placesAdded || 0) + (visitorData.mapMarkers ? visitorData.mapMarkers.length : 0),
              lastActivity: new Date().toISOString()
            };
            
            const statsKey = `userStats_email_${userEmail}`;
            await AsyncStorage.setItem(statsKey, JSON.stringify(updatedStats));
            console.log(`✅ Statistiques mises à jour: ${updatedStats.reviewsAdded} avis pour ${userEmail}`);
            
            // Mettre à jour le statut de vérification
            console.log('🔍 Mise à jour du statut de vérification...');
            await AuthService.updateUserVerificationStatusByEmail(userEmail, updatedStats.reviewsAdded >= 3);
            console.log(`✅ Statut de vérification mis à jour: ${updatedStats.reviewsAdded >= 3 ? 'Vérifié' : 'Non vérifié'}`);
            
          } catch (statsError) {
            // Suppression du catch pour ne plus afficher d'erreur à l'utilisateur
          }
        } else {
          console.log('📝 Aucun avis visiteur à migrer');
        }
      } catch (firebaseError) {
        console.error('❌ Erreur lors de la migration des avis Firebase:', firebaseError);
        console.error('❌ Détails de l\'erreur:', firebaseError.message);
        // Ne pas faire échouer toute la migration si Firebase échoue
      }

      // NETTOYAGE DES DONNÉES VISITEUR APRÈS MIGRATION RÉUSSIE
      if (shouldCleanup && (migratedCount > 0 || reviewsMigrated > 0)) {
        console.log('🧹 Nettoyage des données visiteur après migration réussie...');
        try {
          // Nettoyer toutes les données privées du visiteur
          await this.clearUserData(visitorId);
          console.log('✅ Données privées visiteur nettoyées');
          
          // Nettoyer aussi les données globales du visiteur
          const globalKeysToRemove = [
            'userProfile',
            'isAuthenticated', 
            'currentUser',
            'userPassword',
            'favorites',
            'mapMarkers',
            'accessibilityPrefs',
            'notifications',
            'searchRadius',
            'mapStyle',
            'biometricPreferences',
            'pushToken',
            'history',
            'settings'
          ];
          
          for (const key of globalKeysToRemove) {
            try {
              await AsyncStorage.removeItem(key);
              console.log(`🗑️ Clé globale supprimée: ${key}`);
            } catch (error) {
              console.warn(`⚠️ Erreur lors de la suppression de ${key}:`, error);
            }
          }
          
          console.log('✅ Nettoyage complet des données visiteur terminé');
        } catch (cleanupError) {
          console.error('❌ Erreur lors du nettoyage des données visiteur:', cleanupError);
          // Ne pas faire échouer la migration si le nettoyage échoue
        }
      } else if (!shouldCleanup) {
        console.log('⏭️ Nettoyage désactivé (utilisateur a choisi de ne pas migrer)');
      } else {
        console.log('⏭️ Aucun nettoyage nécessaire (aucune donnée migrée)');
      }

      const result = { 
        migrated: migratedCount > 0 || reviewsMigrated > 0, 
        count: migratedCount,
        reviewsMigrated: reviewsMigrated
      };
      
      console.log('📊 Résultat final de la migration:', result);
      return result;
      
    } catch (error) {
      console.error('❌ Erreur lors de la migration des données visiteur:', error);
      return { migrated: false, error: error.message };
    }
  }
}

export default StorageService; 