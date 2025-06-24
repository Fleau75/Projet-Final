/**
 * Service de gestion des notifications
 * Utilise expo-notifications pour les notifications push
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import StorageService from './storageService';

// Configuration des notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

class NotificationService {
  /**
   * Initialiser le service de notifications
   */
  static async initialize() {
    try {
      console.log('🔔 Initialisation du service de notifications...');
      
      // Vérifier si l'appareil supporte les notifications
      if (!Device.isDevice) {
        console.log('❌ Notifications non supportées sur émulateur');
        return false;
      }

      // Demander les permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('❌ Permissions de notifications refusées');
        return false;
      }

      // Essayer d'obtenir le token d'enregistrement (optionnel pour les notifications locales)
      try {
        const token = await Notifications.getExpoPushTokenAsync({
          projectId: 'your-project-id', // À remplacer par votre project ID
        });
        
        console.log('✅ Token de notification obtenu:', token.data);
        
        // Sauvegarder le token
        await StorageService.setPushToken(token.data);
      } catch (tokenError) {
        console.log('⚠️ Token de notification non disponible (notifications locales uniquement):', tokenError.message);
        // Les notifications locales fonctionnent sans token
      }
      
      // Configurer les notifications pour Android
      if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      console.log('✅ Service de notifications initialisé (notifications locales)');
      return true;
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation des notifications:', error);
      return false;
    }
  }

  /**
   * Vérifier si les notifications sont activées
   */
  static async isEnabled() {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Erreur lors de la vérification des permissions:', error);
      return false;
    }
  }

  /**
   * Obtenir les préférences de notifications de l'utilisateur
   */
  static async getNotificationPreferences() {
    try {
      const prefs = await StorageService.getNotificationPrefs();
      return prefs || {
        newPlaces: false,
        reviews: false,
        updates: false,
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des préférences:', error);
      return {
        newPlaces: false,
        reviews: false,
        updates: false,
      };
    }
  }

  /**
   * Envoyer une notification locale
   */
  static async sendLocalNotification(title, body, data = {}) {
    try {
      const prefs = await this.getNotificationPreferences();
      
      // Vérifier si les notifications sont activées
      if (!prefs.newPlaces && !prefs.reviews && !prefs.updates) {
        console.log('🔕 Notifications désactivées par l\'utilisateur');
        return false;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: true,
        },
        trigger: null, // Notification immédiate
      });

      console.log('✅ Notification locale envoyée:', title);
      return true;
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi de la notification:', error);
      return false;
    }
  }

  /**
   * Notifier un nouveau lieu accessible
   */
  static async notifyNewPlace(placeName, distance) {
    const prefs = await this.getNotificationPreferences();
    
    if (!prefs.newPlaces) {
      return false;
    }

    return await this.sendLocalNotification(
      '🏠 Nouveau lieu accessible !',
      `${placeName} a été ajouté à ${distance}m de chez vous`,
      {
        type: 'newPlace',
        placeName,
        distance,
      }
    );
  }

  /**
   * Notifier un nouvel avis sur un lieu favori
   */
  static async notifyNewReview(placeName, rating) {
    const prefs = await this.getNotificationPreferences();
    
    if (!prefs.reviews) {
      return false;
    }

    const stars = '⭐'.repeat(rating);
    return await this.sendLocalNotification(
      '⭐ Nouvel avis !',
      `${placeName} a reçu un avis ${stars}`,
      {
        type: 'newReview',
        placeName,
        rating,
      }
    );
  }

  /**
   * Notifier une mise à jour de l'application
   */
  static async notifyAppUpdate(version, features = []) {
    const prefs = await this.getNotificationPreferences();
    
    if (!prefs.updates) {
      return false;
    }

    const featuresText = features.length > 0 ? `\nNouvelles fonctionnalités : ${features.join(', ')}` : '';
    
    return await this.sendLocalNotification(
      '🔄 Mise à jour disponible',
      `AccessPlus v${version} est disponible !${featuresText}`,
      {
        type: 'appUpdate',
        version,
        features,
      }
    );
  }

  /**
   * Notifier un lieu accessible à proximité
   */
  static async notifyNearbyPlace(placeName, distance, accessibility) {
    const prefs = await this.getNotificationPreferences();
    
    if (!prefs.newPlaces) {
      return false;
    }

    const accessibilityText = accessibility.length > 0 ? ` (${accessibility.join(', ')})` : '';
    
    return await this.sendLocalNotification(
      '📍 Lieu accessible à proximité',
      `${placeName}${accessibilityText} à ${distance}m`,
      {
        type: 'nearbyPlace',
        placeName,
        distance,
        accessibility,
      }
    );
  }

  /**
   * Programmer une notification pour plus tard
   */
  static async scheduleNotification(title, body, trigger, data = {}) {
    try {
      const prefs = await this.getNotificationPreferences();
      
      // Vérifier si les notifications sont activées
      if (!prefs.newPlaces && !prefs.reviews && !prefs.updates) {
        return false;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: true,
        },
        trigger,
      });

      console.log('✅ Notification programmée:', title);
      return true;
    } catch (error) {
      console.error('❌ Erreur lors de la programmation:', error);
      return false;
    }
  }

  /**
   * Annuler toutes les notifications programmées
   */
  static async cancelAllScheduledNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('✅ Toutes les notifications programmées annulées');
    } catch (error) {
      console.error('❌ Erreur lors de l\'annulation:', error);
    }
  }

  /**
   * Obtenir le token de notification
   */
  static async getPushToken() {
    try {
      return await StorageService.getPushToken();
    } catch (error) {
      console.error('Erreur lors de la récupération du token:', error);
      return null;
    }
  }

  /**
   * Configurer les listeners de notifications
   */
  static setupNotificationListeners(navigation) {
    // Notification reçue quand l'app est ouverte
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('🔔 Notification reçue:', notification);
    });

    // Notification cliquée
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('👆 Notification cliquée:', response);
      
      const data = response.notification.request.content.data;
      
      // Navigation selon le type de notification
      switch (data.type) {
        case 'newPlace':
        case 'nearbyPlace':
          navigation.navigate('Map');
          break;
        case 'newReview':
          navigation.navigate('Home');
          break;
        case 'appUpdate':
          // Ouvrir les paramètres de l'app
          break;
        default:
          navigation.navigate('Home');
      }
    });

    // Retourner les fonctions de nettoyage
    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }
}

export default NotificationService; 