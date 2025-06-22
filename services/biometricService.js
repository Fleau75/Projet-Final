import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Service pour gérer l'authentification biométrique
 */
export class BiometricService {
  
  /**
   * Vérifier si l'authentification biométrique est disponible
   */
  static async isBiometricAvailable() {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      
      console.log('🔐 Vérification biométrie:', { hasHardware, isEnrolled });
      
      return hasHardware && isEnrolled;
    } catch (error) {
      console.error('❌ Erreur lors de la vérification biométrie:', error);
      return false;
    }
  }

  /**
   * Obtenir les types d'authentification disponibles
   */
  static async getSupportedTypes() {
    try {
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      
      const typeNames = supportedTypes.map(type => {
        switch (type) {
          case LocalAuthentication.AuthenticationType.FINGERPRINT:
            return 'Empreinte digitale';
          case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION:
            return 'Reconnaissance faciale';
          case LocalAuthentication.AuthenticationType.IRIS:
            return 'Reconnaissance d\'iris';
          default:
            return 'Inconnu';
        }
      });
      
      console.log('🔐 Types d\'authentification supportés:', typeNames);
      return { types: supportedTypes, names: typeNames };
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des types:', error);
      return { types: [], names: [] };
    }
  }

  /**
   * Authentifier avec la biométrie
   */
  static async authenticateWithBiometrics(reason = 'Veuillez vous authentifier') {
    try {
      console.log('🔐 Tentative d\'authentification biométrique...');
      
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: reason,
        fallbackLabel: 'Utiliser le mot de passe',
        cancelLabel: 'Annuler',
        disableDeviceFallback: false,
      });
      
      console.log('🔐 Résultat authentification:', result);
      
      return {
        success: result.success,
        error: result.error,
        warning: result.warning
      };
    } catch (error) {
      console.error('❌ Erreur lors de l\'authentification biométrique:', error);
      return {
        success: false,
        error: error.message,
        warning: null
      };
    }
  }

  /**
   * Sauvegarder les préférences biométriques
   */
  static async saveBiometricPreferences(enabled, email) {
    try {
      const prefs = {
        enabled,
        email,
        updatedAt: new Date().toISOString()
      };
      
      await AsyncStorage.setItem('biometricPreferences', JSON.stringify(prefs));
      console.log('✅ Préférences biométriques sauvegardées:', prefs);
      
      return true;
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde des préférences:', error);
      return false;
    }
  }

  /**
   * Charger les préférences biométriques
   */
  static async loadBiometricPreferences() {
    try {
      const prefs = await AsyncStorage.getItem('biometricPreferences');
      
      if (prefs) {
        const parsedPrefs = JSON.parse(prefs);
        console.log('📱 Préférences biométriques chargées:', parsedPrefs);
        return parsedPrefs;
      }
      
      return {
        enabled: false,
        email: null,
        updatedAt: null
      };
    } catch (error) {
      console.error('❌ Erreur lors du chargement des préférences:', error);
      return {
        enabled: false,
        email: null,
        updatedAt: null
      };
    }
  }

  /**
   * Vérifier si la biométrie est activée pour un utilisateur
   */
  static async isBiometricEnabledForUser(email) {
    try {
      const prefs = await this.loadBiometricPreferences();
      return prefs.enabled && prefs.email === email;
    } catch (error) {
      console.error('❌ Erreur lors de la vérification biométrie utilisateur:', error);
      return false;
    }
  }

  /**
   * Désactiver la biométrie
   */
  static async disableBiometrics() {
    try {
      await AsyncStorage.removeItem('biometricPreferences');
      console.log('✅ Biométrie désactivée');
      return true;
    } catch (error) {
      console.error('❌ Erreur lors de la désactivation:', error);
      return false;
    }
  }

  /**
   * Authentifier automatiquement avec biométrie si activée
   */
  static async autoAuthenticateWithBiometrics(email) {
    try {
      // Vérifier si la biométrie est disponible et activée
      const isAvailable = await this.isBiometricAvailable();
      const isEnabled = await this.isBiometricEnabledForUser(email);
      
      if (!isAvailable || !isEnabled) {
        console.log('🔐 Biométrie non disponible ou non activée');
        return { success: false, reason: 'not_available' };
      }
      
      // Tenter l'authentification
      const result = await this.authenticateWithBiometrics(
        'Connectez-vous à AccessPlus'
      );
      
      if (result.success) {
        console.log('✅ Authentification biométrique réussie');
        return { success: true, method: 'biometric' };
      } else {
        console.log('❌ Authentification biométrique échouée:', result.error);
        return { success: false, reason: result.error };
      }
    } catch (error) {
      console.error('❌ Erreur lors de l\'authentification automatique:', error);
      return { success: false, reason: error.message };
    }
  }

  /**
   * Récupérer les informations de connexion pour un utilisateur avec biométrie activée
   */
  static async getStoredCredentials(email) {
    try {
      console.log('🔍 Récupération des informations de connexion pour:', email);
      
      // Vérifier si la biométrie est activée pour cet utilisateur
      const isEnabled = await this.isBiometricEnabledForUser(email);
      if (!isEnabled) {
        console.log('❌ Biométrie non activée pour cet utilisateur');
        return null;
      }
      
      // Récupérer les informations de connexion depuis AsyncStorage
      const testUserKey = `user_${email}`;
      const testUser = await AsyncStorage.getItem(testUserKey);
      
      if (testUser) {
        const userData = JSON.parse(testUser);
        console.log('✅ Informations de connexion récupérées (utilisateur test)');
        return {
          email: userData.email,
          password: userData.password,
          name: userData.name
        };
      }
      
      // Vérifier dans le profil normal
      const userProfile = await AsyncStorage.getItem('userProfile');
      if (userProfile) {
        const profile = JSON.parse(userProfile);
        if (profile.email === email) {
          const password = await AsyncStorage.getItem('userPassword');
          if (password) {
            console.log('✅ Informations de connexion récupérées (utilisateur normal)');
            return {
              email: profile.email,
              password: password,
              name: profile.name
            };
          }
        }
      }
      
      console.log('❌ Aucune information de connexion trouvée');
      return null;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des informations:', error);
      return null;
    }
  }

  /**
   * Authentifier avec biométrie et récupérer automatiquement les informations de connexion
   */
  static async authenticateAndGetCredentials(email) {
    try {
      console.log('🔐 Authentification biométrique avec récupération des informations...');
      
      // Tenter l'authentification biométrique
      const authResult = await this.autoAuthenticateWithBiometrics(email);
      
      if (!authResult.success) {
        return { success: false, reason: authResult.reason };
      }
      
      // Récupérer les informations de connexion
      const credentials = await this.getStoredCredentials(email);
      
      if (!credentials) {
        return { success: false, reason: 'no_credentials_found' };
      }
      
      console.log('✅ Authentification biométrique et récupération réussies');
      return {
        success: true,
        credentials: credentials,
        method: 'biometric'
      };
    } catch (error) {
      console.error('❌ Erreur lors de l\'authentification avec récupération:', error);
      return { success: false, reason: error.message };
    }
  }

  /**
   * Obtenir un message d'erreur en français
   */
  static getErrorMessage(error) {
    switch (error) {
      case 'UserCancel':
        return 'Authentification annulée';
      case 'UserFallback':
        return 'Utilisation du mot de passe';
      case 'SystemCancel':
        return 'Authentification interrompue par le système';
      case 'AuthenticationFailed':
        return 'Échec de l\'authentification';
      case 'PasscodeNotSet':
        return 'Aucun code de verrouillage configuré';
      case 'FingerprintScannerNotAvailable':
        return 'Scanner d\'empreinte non disponible';
      case 'FingerprintScannerNotEnrolled':
        return 'Aucune empreinte enregistrée';
      case 'FingerprintScannerLockout':
        return 'Scanner d\'empreinte verrouillé';
      case 'FingerprintScannerLockoutPermanent':
        return 'Scanner d\'empreinte verrouillé définitivement';
      default:
        return 'Erreur d\'authentification biométrique';
    }
  }
} 