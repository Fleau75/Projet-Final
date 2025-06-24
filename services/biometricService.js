import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CryptoService from './cryptoService';
import StorageService from './storageService';

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
      // Empêcher l'activation de la biométrie pour le mode visiteur
      if (email === 'visiteur@accessplus.com') {
        console.log('🚫 Impossible d\'activer la biométrie pour le mode visiteur');
        return false;
      }
      
      const prefs = {
        enabled,
        email,
        updatedAt: new Date().toISOString()
      };
      
      // Sauvegarder les préférences de l'utilisateur actuel
      await StorageService.setBiometricPrefs(prefs);
      
      // AUSSI sauvegarder l'email du dernier utilisateur qui a activé la biométrie de manière globale
      if (enabled) {
        await AsyncStorage.setItem('lastBiometricUser', email);
        console.log('💾 Email biométrique sauvegardé globalement:', email);
      } else {
        await AsyncStorage.removeItem('lastBiometricUser');
        console.log('🗑️ Email biométrique supprimé globalement');
      }
      
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
      // D'abord essayer de charger les préférences de l'utilisateur actuel
      const prefs = await StorageService.getBiometricPrefs();
      
      if (prefs && prefs.enabled) {
        console.log('📱 Préférences biométriques chargées (utilisateur actuel):', prefs);
        return prefs;
      }
      
      // Si pas de préférences pour l'utilisateur actuel, essayer de récupérer le dernier utilisateur
      const lastBiometricUser = await AsyncStorage.getItem('lastBiometricUser');
      if (lastBiometricUser) {
        console.log('🔍 Dernier utilisateur biométrique trouvé:', lastBiometricUser);
        
        // Vérifier si cet utilisateur existe encore et a la biométrie activée
        const lastUserPrefs = await this.getBiometricPrefsForUser(lastBiometricUser);
        if (lastUserPrefs && lastUserPrefs.enabled) {
          console.log('📱 Préférences biométriques restaurées pour:', lastBiometricUser);
          return lastUserPrefs;
        } else {
          console.log('❌ Dernier utilisateur biométrique n\'a plus la biométrie activée');
          // Nettoyer la référence si l'utilisateur n'a plus la biométrie activée
          await AsyncStorage.removeItem('lastBiometricUser');
        }
      } else {
        console.log('🔍 Aucun dernier utilisateur biométrique trouvé');
      }
      
      // Si on arrive ici, essayer de chercher dans toutes les clés AsyncStorage
      console.log('🔍 Recherche de toutes les préférences biométriques...');
      const allKeys = await AsyncStorage.getAllKeys();
      const biometricKeys = allKeys.filter(key => key.includes('biometricPreferences'));
      
      for (const key of biometricKeys) {
        try {
          const prefsData = await AsyncStorage.getItem(key);
          if (prefsData) {
            const userPrefs = JSON.parse(prefsData);
            if (userPrefs && userPrefs.enabled && userPrefs.email) {
              console.log('📱 Préférences biométriques trouvées pour:', userPrefs.email);
              // Sauvegarder cette référence pour la prochaine fois
              await AsyncStorage.setItem('lastBiometricUser', userPrefs.email);
              return userPrefs;
            }
          }
        } catch (error) {
          console.error('❌ Erreur lors de la lecture de', key, ':', error);
        }
      }
      
      console.log('📱 Aucune préférence biométrique trouvée');
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
   * Récupérer les préférences biométriques pour un utilisateur spécifique
   */
  static async getBiometricPrefsForUser(email) {
    try {
      // Utiliser directement AsyncStorage pour éviter les conflits avec StorageService
      const allKeys = await AsyncStorage.getAllKeys();
      const userBiometricKey = allKeys.find(key => key.includes(`user_${email}_biometricPreferences`));
      
      if (userBiometricKey) {
        const prefsData = await AsyncStorage.getItem(userBiometricKey);
        if (prefsData) {
          return JSON.parse(prefsData);
        }
      }
      
      return null;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des préférences pour', email, ':', error);
      return null;
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
      await StorageService.setBiometricPrefs({ enabled: false, type: 'fingerprint' });
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
      
      // Empêcher la biométrie pour le mode visiteur
      if (email === 'visiteur@accessplus.com') {
        console.log('🚫 Biométrie non autorisée pour le mode visiteur');
        return null;
      }
      
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
        
        // Déchiffrer le mot de passe si nécessaire
        let password = userData.password;
        if (CryptoService.isEncrypted(password)) {
          password = CryptoService.decrypt(password);
        }
        
        console.log('✅ Informations de connexion récupérées (utilisateur test)');
        return {
          email: userData.email,
          password: password,
          name: userData.name
        };
      }
      
      // Vérifier dans le profil normal
      const userProfile = await AsyncStorage.getItem('userProfile');
      if (userProfile) {
        const profile = JSON.parse(userProfile);
        if (profile.email === email) {
          const password = await CryptoService.getEncryptedItem('userPassword');
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
  static async authenticateAndGetCredentials(email = null) {
    try {
      console.log('🔐 Authentification biométrique avec récupération des informations...');
      
      // Si aucun email fourni, essayer de le récupérer depuis les préférences
      let targetEmail = email;
      if (!targetEmail) {
        const prefs = await this.loadBiometricPreferences();
        if (prefs && prefs.enabled && prefs.email) {
          targetEmail = prefs.email;
          console.log('📧 Email récupéré depuis les préférences:', targetEmail);
        } else {
          console.log('❌ Aucun email trouvé dans les préférences biométriques');
          return { success: false, reason: 'no_email_found' };
        }
      }
      
      // Tenter l'authentification biométrique
      const authResult = await this.autoAuthenticateWithBiometrics(targetEmail);
      
      if (!authResult.success) {
        return { success: false, reason: authResult.reason };
      }
      
      // Récupérer les informations de connexion
      const credentials = await this.getStoredCredentials(targetEmail);
      
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
   * Configurer l'authentification biométrique pour un utilisateur
   */
  static async setupBiometricAuthentication(email, password) {
    try {
      console.log('🔐 Configuration de l\'authentification biométrique pour:', email);
      
      // Empêcher l'activation de la biométrie pour le mode visiteur
      if (email === 'visiteur@accessplus.com') {
        console.log('🚫 Impossible d\'activer la biométrie pour le mode visiteur');
        return { success: false, error: 'visitor_not_allowed' };
      }
      
      // Vérifier si la biométrie est disponible
      const isAvailable = await this.isBiometricAvailable();
      if (!isAvailable) {
        console.log('❌ Biométrie non disponible sur cet appareil');
        return { success: false, error: 'not_available' };
      }
      
      // Tenter l'authentification biométrique pour vérifier
      const authResult = await this.authenticateWithBiometrics(
        'Configurez l\'authentification biométrique'
      );
      
      if (!authResult.success) {
        console.log('❌ Échec de l\'authentification biométrique:', authResult.error);
        return { success: false, error: authResult.error };
      }
      
      // Sauvegarder les préférences biométriques
      const saved = await this.saveBiometricPreferences(true, email);
      if (!saved) {
        console.log('❌ Impossible de sauvegarder les préférences biométriques');
        return { success: false, error: 'save_failed' };
      }
      
      console.log('✅ Authentification biométrique configurée avec succès');
      return { success: true };
    } catch (error) {
      console.error('❌ Erreur lors de la configuration biométrie:', error);
      return { success: false, error: error.message };
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