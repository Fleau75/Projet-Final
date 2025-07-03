import AsyncStorage from '@react-native-async-storage/async-storage';
import CryptoService from './cryptoService';
import StorageService from './storageService';
import { BiometricService } from './biometricService';

// Utilisateurs de test pré-créés
const TEST_USERS = {
  'test@example.com': {
    email: 'test@example.com',
    password: '123456',
    name: 'Utilisateur Test',
    createdAt: new Date().toISOString(),
    reviewsAdded: 5, // Déjà 5 avis ajoutés pour tester le badge
    isVerified: true
  },
  'demo@accessplus.com': {
    email: 'demo@accessplus.com',
    password: 'demo123',
    name: 'Démo AccessPlus',
    createdAt: new Date().toISOString(),
    reviewsAdded: 8,
    isVerified: true
  },
  'admin@accessplus.com': {
    email: 'admin@accessplus.com',
    password: 'admin123',
    name: 'Administrateur',
    createdAt: new Date().toISOString(),
    reviewsAdded: 12,
    isVerified: true
  }
};

// Initialiser les utilisateurs de test au démarrage
const initializeTestUsers = async () => {
  try {
    for (const [email, userData] of Object.entries(TEST_USERS)) {
      const userKey = `user_${email}`;
      const existingUser = await AsyncStorage.getItem(userKey);
      
      if (!existingUser) {
        await AsyncStorage.setItem(userKey, JSON.stringify(userData));
        console.log(`✅ Utilisateur de test créé: ${email}`);
      }
    }
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation des utilisateurs de test:', error);
  }
};

// Appeler l'initialisation au chargement du module
initializeTestUsers();

/**
 * Service d'authentification simplifié pour Expo
 * Utilise AsyncStorage pour simuler l'authentification
 */
export class AuthService {
  
  /**
   * Initialiser le service d'authentification
   * Migre automatiquement les données existantes vers le chiffrement
   */
  static async initialize() {
    try {
      console.log('🔐 Initialisation du service d\'authentification sécurisé...');
      await CryptoService.migrateToEncryption();
      console.log('✅ Service d\'authentification initialisé');
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation:', error);
    }
  }

  /**
   * Inscription d'un nouvel utilisateur
   */
  static async register(email, password, userData) {
    try {
      console.log('🔧 AuthService.register - Début avec:', { email, userData });
      
      // Vérifier si c'est un compte visiteur
      const isVisitor = email === 'visiteur@accessplus.com';
      console.log('🔧 Compte visiteur:', isVisitor);
      
      // Pour le visiteur, on écrase toujours le profil existant
      if (isVisitor) {
        console.log('🔧 Nettoyage du profil visiteur existant');
        await AsyncStorage.removeItem('userProfile');
        await AsyncStorage.removeItem('isAuthenticated');
        await AsyncStorage.removeItem('currentUser');
        await AsyncStorage.removeItem('userPassword');
      } else {
        // Pour les autres utilisateurs, vérifier si l'email existe déjà
        // Vérifier dans les utilisateurs de test
        const testUserKey = `user_${email}`;
        const existingTestUser = await AsyncStorage.getItem(testUserKey);
        
        // Vérifier dans le profil normal (utiliser AsyncStorage directement)
        const existingProfileKey = `user_${email}_userProfile`;
        const existingProfile = await AsyncStorage.getItem(existingProfileKey);
        
        console.log('🔧 Utilisateur de test existant:', existingTestUser ? 'Oui' : 'Non');
        console.log('🔧 Profil normal existant:', existingProfile ? 'Oui' : 'Non');
        
        if (existingTestUser || existingProfile) {
          throw new Error('Cette adresse email est déjà utilisée');
        }
        
        // MIGRATION DES DONNÉES VISITEUR AVANT LE NETTOYAGE
        // Vérifier si l'utilisateur veut migrer ses données
        const shouldMigrate = userData.migrateVisitorData !== false; // Par défaut true, sauf si explicitement false
        console.log('🔄 Option de migration des données visiteur:', shouldMigrate);
        
        if (shouldMigrate) {
          console.log('🔄 Vérification des données visiteur pour migration...');
          try {
            const visitorDataResult = await StorageService.getAllUserData('visitor');
            
            // Vérifier si la récupération des données a réussi
            if (visitorDataResult.success && visitorDataResult.data && Object.keys(visitorDataResult.data).length > 0) {
              console.log('✅ Données visiteur trouvées, migration automatique...');
              try {
                const migrationResult = await StorageService.migrateVisitorDataToUser(userData.email, true);
                console.log('📊 Résultat migration automatique:', migrationResult);
                
                // Afficher un message de confirmation si la migration a réussi
                if (migrationResult && migrationResult.migrated) {
                  console.log('✅ Migration réussie avec succès');
                } else if (migrationResult && migrationResult.error) {
                  console.warn('⚠️ Migration partiellement échouée:', migrationResult.error);
                }
              } catch (migrationError) {
                console.warn('⚠️ Erreur migration automatique (non critique):', migrationError);
                // Ne pas faire échouer l'inscription si la migration échoue
              }
            } else {
              console.log('❌ Aucune donnée visiteur à migrer');
            }
          } catch (visitorDataError) {
            console.warn('⚠️ Erreur lors de la vérification des données visiteur (non critique):', visitorDataError);
            // Ne pas faire échouer l'inscription si la vérification échoue
          }
        } else {
          console.log('❌ Migration des données visiteur désactivée par l\'utilisateur');
          // Si l'utilisateur ne veut pas migrer, nettoyer quand même les données visiteur
          try {
            console.log('🧹 Nettoyage des données visiteur (migration refusée)...');
            await StorageService.clearUserData('visitor');
            
            // Nettoyer aussi les données globales
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
                console.warn(`⚠️ Erreur lors de la suppression de ${key} (non critique):`, error);
              }
            }
            
            // Nettoyer aussi les avis Firebase du visiteur
            try {
              console.log('🧹 Nettoyage des avis Firebase du visiteur...');
              const { ReviewsService } = await import('./firebaseService');
              const visitorReviews = await ReviewsService.getReviewsByUserId('visiteur@accessplus.com', 'visiteur@accessplus.com');
              console.log(`📝 ${visitorReviews.length} avis visiteur trouvés à supprimer`);
              
              if (visitorReviews.length > 0) {
                for (const review of visitorReviews) {
                  try {
                    console.log(`🗑️ Suppression de l'avis: ${review.placeName} (${review.id})`);
                    await ReviewsService.deleteReview(review.id);
                  } catch (reviewError) {
                    console.warn(`⚠️ Erreur lors de la suppression de l'avis ${review.id} (non critique):`, reviewError);
                  }
                }
                console.log(`✅ ${visitorReviews.length} avis visiteur supprimés`);
              }
            } catch (firebaseError) {
              console.warn('⚠️ Erreur lors du nettoyage des avis Firebase (non critique):', firebaseError);
            }
            
            console.log('✅ Nettoyage des données visiteur terminé');
          } catch (cleanupError) {
            console.warn('⚠️ Erreur lors du nettoyage (non critique):', cleanupError);
          }
        }
        
        // NETTOYER LE PROFIL VISITEUR SI IL EXISTE
        console.log('🧹 Nettoyage du profil visiteur pour le nouveau compte...');
        try {
          await AsyncStorage.removeItem('userProfile');
          await AsyncStorage.removeItem('isAuthenticated');
          await AsyncStorage.removeItem('currentUser');
          await AsyncStorage.removeItem('userPassword');
          console.log('✅ Profil visiteur nettoyé');
        } catch (profileCleanupError) {
          console.warn('⚠️ Erreur lors du nettoyage du profil visiteur (non critique):', profileCleanupError);
        }
      }

      // Simuler la création d'un utilisateur
      const user = {
        uid: `user_${Date.now()}`,
        email: userData.email,
        displayName: `${userData.firstName} ${userData.lastName}`
      };
      console.log('🔧 Utilisateur créé:', user);

      // Sauvegarder les données utilisateur dans le format normal
      const userProfile = {
        uid: user.uid,
        name: `${userData.firstName} ${userData.lastName}`,
        email: userData.email,
        phone: userData.phone || '',
        joinDate: new Date().toLocaleDateString('fr-FR', { 
          year: 'numeric', 
          month: 'long' 
        }),
        isVisitor: isVisitor
      };
      console.log('🔧 Profil utilisateur à sauvegarder:', userProfile);

      // Sauvegarder dans le stockage privé avec StorageService
      await StorageService.setUserData('userProfile', userProfile, userData.email);
      await StorageService.setUserData('userPassword', password, userData.email);
      await StorageService.setUserData('isAuthenticated', 'true', userData.email);
      await StorageService.setUserData('currentUser', user, userData.email);

      // AUSSI sauvegarder directement avec AsyncStorage pour la compatibilité
      await AsyncStorage.setItem(`user_${userData.email}_userProfile`, JSON.stringify(userProfile));
      await AsyncStorage.setItem(`user_${userData.email}_userPassword`, password);
      await AsyncStorage.setItem(`user_${userData.email}_isAuthenticated`, 'true');
      await AsyncStorage.setItem(`user_${userData.email}_currentUser`, JSON.stringify(user));
      console.log('🔧 Données sauvegardées directement avec AsyncStorage');

      // AUSSI sauvegarder dans le format des utilisateurs de test pour la compatibilité
      if (!isVisitor) {
        const testUserData = {
          email: userData.email,
          password: password, // Inclure le mot de passe pour la compatibilité
          name: `${userData.firstName} ${userData.lastName}`,
          createdAt: new Date().toISOString()
        };
        const testUserKey = `user_${email}`;
        await AsyncStorage.setItem(testUserKey, JSON.stringify(testUserData));
        console.log('🔧 Utilisateur sauvegardé aussi au format test:', testUserKey);
      }

      // Pour le visiteur, sauvegarder aussi dans le stockage global
      if (isVisitor) {
        await AsyncStorage.setItem('userProfile', JSON.stringify(userProfile));
        await AsyncStorage.setItem('isAuthenticated', 'true');
        await AsyncStorage.setItem('userPassword', password);
        console.log('🔧 Données visiteur sauvegardées dans le stockage global');
      } else {
        // Pour les utilisateurs normaux, sauvegarder aussi dans le stockage global
        // pour que getCurrentUser() puisse les trouver
        await AsyncStorage.setItem('userProfile', JSON.stringify(userProfile));
        await AsyncStorage.setItem('isAuthenticated', 'true');
        await AsyncStorage.setItem('userPassword', password);
        await AsyncStorage.setItem('currentUser', JSON.stringify(user));
        console.log('🔧 Données utilisateur sauvegardées dans le stockage global');
      }

      console.log('🔧 Données sauvegardées avec succès');
      console.log('🔧 Vérification finale - getCurrentUser():', await this.getCurrentUser());
      return { success: true, user };
    } catch (error) {
      // console.error('❌ Erreur lors de l\'inscription:', error); // Commenté pour empêcher le toast d'erreur
      throw error;
    }
  }

  /**
   * Connexion de l'utilisateur
   */
  static async login(email, password) {
    try {
      // console.log('🔍 Tentative de connexion pour:', email);
      
      // Cas spécial pour le visiteur
      if (email === 'visiteur@accessplus.com') {
        // console.log('🔍 Connexion visiteur détectée');
        
        // Vérifier le mot de passe du visiteur (peut être stocké directement ou chiffré)
        const visitorPasswordKey = `user_${email}_userPassword`;
        let storedPassword = await AsyncStorage.getItem(visitorPasswordKey);
        
        // Si le mot de passe est chiffré, le déchiffrer
        if (storedPassword && storedPassword.startsWith('U2F')) {
          const CryptoService = require('./cryptoService').default;
          storedPassword = CryptoService.decrypt(storedPassword);
        }
        
        if (storedPassword === password) {
          console.log('✅ Connexion visiteur réussie');
          
          // Créer le profil visiteur
          const userProfile = {
            uid: `user_${Date.now()}`,
            name: 'Visiteur AccessPlus',
            email: 'visiteur@accessplus.com',
            phone: '',
            joinDate: new Date().toLocaleDateString('fr-FR', { 
              year: 'numeric', 
              month: 'long' 
            }),
            isVisitor: true
          };
          
          // Sauvegarder dans le stockage global pour le visiteur
          await AsyncStorage.setItem('userProfile', JSON.stringify(userProfile));
          await AsyncStorage.setItem('isAuthenticated', 'true');
          
          return { success: true };
        }
      }
      
      // Vérifier d'abord les utilisateurs de test (stockage direct)
      const testUserKey = `user_${email}`;
      const testUser = await AsyncStorage.getItem(testUserKey);
      
      if (testUser) {
        console.log('🔍 Utilisateur de test trouvé');
        const userData = JSON.parse(testUser);
        
        // Vérifier si le mot de passe est chiffré
        let storedPassword = userData.password;
        if (storedPassword && storedPassword.startsWith('U2F')) {
          console.log('🔍 Mot de passe chiffré détecté, déchiffrement...');
          const CryptoService = require('./cryptoService').default;
          storedPassword = CryptoService.decrypt(storedPassword);
          console.log('🔍 Mot de passe déchiffré:', storedPassword);
        }
        
        if (storedPassword === password) {
          console.log('✅ Connexion réussie avec utilisateur de test');
          
          // Sauvegarder les données d'authentification dans le stockage privé
          const userProfile = {
            email: userData.email,
            name: userData.name,
            uid: userData.uid || `test_${Date.now()}`,
            isVisitor: false,
            createdAt: new Date().toISOString()
          };
          
          // Utiliser StorageService pour tout le stockage privé
          await StorageService.setUserData('userProfile', userProfile, email);
          await StorageService.setUserData('isAuthenticated', 'true', email);
          await StorageService.setUserData('userPassword', password, email);
          
          // Sauvegarder aussi dans le stockage global pour compatibilité
          await AsyncStorage.setItem('userProfile', JSON.stringify(userProfile));
          await AsyncStorage.setItem('isAuthenticated', 'true');
          
          return { success: true };
        }
      }
      
      // Si pas d'utilisateur de test, vérifier les utilisateurs normaux
      // Utiliser le même système de stockage pour les deux
      const storedPassword = await StorageService.getUserData('userPassword', null, email);
      const isAuthenticated = await StorageService.getUserData('isAuthenticated', null, email);
      
      console.log('🔍 Vérification utilisateur normal:', { email, storedPassword, isAuthenticated });
      
      if (isAuthenticated === 'true' && storedPassword === password) {
        console.log('✅ Connexion réussie avec utilisateur normal');
        
        // Récupérer le profil utilisateur
        const userProfile = await StorageService.getUserData('userProfile', null, email);
        
        // Sauvegarder aussi dans le stockage global pour compatibilité
        if (userProfile) {
          await AsyncStorage.setItem('userProfile', JSON.stringify(userProfile));
          await AsyncStorage.setItem('isAuthenticated', 'true');
        }
        
        return { success: true };
      }
      
      // Si on arrive ici, essayer de vérifier avec AsyncStorage directement
      console.log('🔍 Tentative de vérification directe avec AsyncStorage...');
      const directPassword = await AsyncStorage.getItem(`user_${email}_userPassword`);
      const directAuth = await AsyncStorage.getItem(`user_${email}_isAuthenticated`);
      
      console.log('🔍 Vérification directe:', { email, directPassword, directAuth });
      
      // Vérifier si le mot de passe direct est chiffré
      let decryptedDirectPassword = directPassword;
      if (directPassword && directPassword.startsWith('U2F')) {
        console.log('🔍 Mot de passe direct chiffré détecté, déchiffrement...');
        const CryptoService = require('./cryptoService').default;
        decryptedDirectPassword = CryptoService.decrypt(directPassword);
        console.log('🔍 Mot de passe direct déchiffré:', decryptedDirectPassword);
      }
      
      if (directAuth === 'true' && decryptedDirectPassword === password) {
        console.log('✅ Connexion réussie avec vérification directe');
        
        // Récupérer le profil utilisateur
        const userProfile = await AsyncStorage.getItem(`user_${email}_userProfile`);
        if (userProfile) {
          await AsyncStorage.setItem('userProfile', userProfile);
          await AsyncStorage.setItem('isAuthenticated', 'true');
        }
        
        return { success: true };
      }
      
      console.log('❌ Email ou mot de passe incorrect');
      throw new Error('Email ou mot de passe incorrect');
      
    } catch (error) {
      // Ne pas afficher l'erreur dans la console pour éviter le bandeau
      // console.error('❌ Erreur lors de la connexion:', error);
      throw error;
    }
  }

  /**
   * Déconnexion de l'utilisateur
   */
  static async logout() {
    try {
      console.log('🔓 Début de la déconnexion...');
      
      // Récupérer l'utilisateur actuel pour savoir quelles données supprimer
      const currentUser = await this.getCurrentUser();
      const currentEmail = currentUser?.email;
      
      console.log('🔓 Utilisateur à déconnecter:', currentEmail);
      
      // Supprimer les clés de session de manière sécurisée
      const keysToRemove = [
        'userProfile',
        'isAuthenticated', 
        'currentUser',
        'userPassword'
      ];
      
      // Supprimer avec StorageService
      for (const key of keysToRemove) {
        try {
          await StorageService.removeUserData(key);
          console.log(`✅ Clé supprimée (StorageService): ${key}`);
        } catch (error) {
          console.warn(`⚠️ Erreur lors de la suppression de ${key}:`, error);
        }
      }
      
      // Supprimer aussi les données stockées directement avec AsyncStorage
      if (currentEmail && currentEmail !== 'visiteur@accessplus.com') {
        const directKeysToRemove = [
          `user_${currentEmail}_userProfile`,
          `user_${currentEmail}_userPassword`,
          `user_${currentEmail}_isAuthenticated`,
          `user_${currentEmail}_currentUser`
        ];
        
        for (const key of directKeysToRemove) {
        try {
          await AsyncStorage.removeItem(key);
            console.log(`✅ Clé supprimée (AsyncStorage): ${key}`);
        } catch (error) {
          console.warn(`⚠️ Erreur lors de la suppression de ${key}:`, error);
          }
        }
      }
      
      // Supprimer les clés globales
      const globalKeysToRemove = [
        'userProfile',
        'isAuthenticated',
        'currentUser',
        'userPassword'
      ];
      
      for (const key of globalKeysToRemove) {
        try {
          await AsyncStorage.removeItem(key);
          console.log(`✅ Clé globale supprimée: ${key}`);
        } catch (error) {
          console.warn(`⚠️ Erreur lors de la suppression de la clé globale ${key}:`, error);
        }
      }
      
      console.log('✅ Déconnexion réussie');
      return { success: true };
    } catch (error) {
      console.error('❌ Erreur lors de la déconnexion:', error);
      // Retourner un succès même en cas d'erreur pour éviter les crashs
      return { success: true };
    }
  }

  /**
   * Vérifier si l'utilisateur est connecté
   */
  static async isAuthenticated() {
    try {
      // Essayer de récupérer l'utilisateur depuis les préférences biométriques
      const biometricPrefs = await BiometricService.loadBiometricPreferences();
      if (biometricPrefs && biometricPrefs.enabled && biometricPrefs.email) {
        const isAuth = await StorageService.getUserData('isAuthenticated', null, biometricPrefs.email);
        if (isAuth === 'true') {
          console.log('🔧 Utilisateur authentifié via biométrie:', biometricPrefs.email);
          return true;
        }
      }
      
      // Fallback : utiliser directement AsyncStorage pour les clés d'authentification
      const isAuth = await AsyncStorage.getItem('isAuthenticated');
      const userProfile = await AsyncStorage.getItem('userProfile');
      
      // Vérifier que l'utilisateur est authentifié ET qu'un profil existe
      if (isAuth === 'true' && userProfile) {
        try {
        const profile = JSON.parse(userProfile);
        // Vérifier que ce n'est pas un profil vide ou invalide
        if (profile && profile.email && profile.name) {
          console.log('🔧 Utilisateur authentifié:', profile.email);
          return true;
          }
        } catch (parseError) {
          console.error('Erreur lors du parsing du profil:', parseError);
        }
      }
      
      console.log('🔧 Aucun utilisateur authentifié trouvé');
      return false;
    } catch (error) {
      console.error('Erreur lors de la vérification d\'authentification:', error);
      return false;
    }
  }

  /**
   * Obtenir l'utilisateur actuel
   */
  static async getCurrentUser() {
    try {
      // Essayer de récupérer l'utilisateur depuis les préférences biométriques
      const biometricPrefs = await BiometricService.loadBiometricPreferences();
      if (biometricPrefs && biometricPrefs.enabled && biometricPrefs.email) {
        const userProfile = await StorageService.getUserData('userProfile', null, biometricPrefs.email);
        if (userProfile && userProfile.email && userProfile.name) {
          console.log('🔧 Utilisateur récupéré via biométrie:', userProfile.email);
          return userProfile;
        }
      }
      
      // Fallback : utiliser directement AsyncStorage pour les clés d'authentification
      const isAuth = await AsyncStorage.getItem('isAuthenticated');
      if (isAuth === 'true') {
        const userProfile = await AsyncStorage.getItem('userProfile');
        if (userProfile) {
          try {
          const profile = JSON.parse(userProfile);
          if (profile && profile.email && profile.name) {
            return profile;
            }
          } catch (parseError) {
            console.error('Erreur lors du parsing du profil:', parseError);
          }
        }
      }
      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      return null;
    }
  }

  /**
   * Vérifier si l'utilisateur actuel est un visiteur
   */
  static async isCurrentUserVisitor() {
    try {
      // Utiliser directement AsyncStorage pour les clés d'authentification
      const userProfile = await AsyncStorage.getItem('userProfile');
      if (userProfile) {
        try {
        const profile = JSON.parse(userProfile);
        return profile && profile.isVisitor === true;
        } catch (parseError) {
          console.error('Erreur lors du parsing du profil:', parseError);
        }
      }
      return false;
    } catch (error) {
      console.error('Erreur lors de la vérification du statut visiteur:', error);
      return false;
    }
  }

  /**
   * Écouter les changements d'état d'authentification
   */
  static onAuthStateChange(callback) {
    // Pour Expo, on simule un listener simple
    // En production, vous pourriez utiliser un EventEmitter
    return () => {}; // Cleanup function
  }

  /**
   * Obtenir le message d'erreur en français
   */
  static getErrorMessage(error) {
    if (error.message) {
      return error.message;
    }
    
    switch (error.code) {
      case 'auth/email-already-in-use':
        return 'Cette adresse email est déjà utilisée';
      case 'auth/invalid-email':
        return 'Adresse email invalide';
      case 'auth/weak-password':
        return 'Le mot de passe doit contenir au moins 6 caractères';
      case 'auth/user-not-found':
        return 'Aucun compte trouvé avec cette adresse email';
      case 'auth/wrong-password':
        return 'Mot de passe incorrect';
      case 'auth/too-many-requests':
        return 'Trop de tentatives. Veuillez réessayer plus tard';
      case 'auth/network-request-failed':
        return 'Erreur de connexion. Vérifiez votre connexion internet';
      default:
        return 'Une erreur est survenue. Veuillez réessayer';
    }
  }

  /**
   * Vérifier si un utilisateur existe
   */
  static async checkUserExists(email) {
    try {
      console.log('🔍 Vérification de l\'existence de l\'utilisateur:', email);
      
      // Vérifier dans les utilisateurs de test
      const testUserKey = `user_${email}`;
      const testUser = await AsyncStorage.getItem(testUserKey);
      
      if (testUser) {
        console.log('✅ Utilisateur de test trouvé');
        return true;
      }
      
      // Vérifier dans le profil normal (utiliser AsyncStorage directement)
      const existingProfileKey = `user_${email}_userProfile`;
      const existingProfile = await AsyncStorage.getItem(existingProfileKey);
      
      if (existingProfile) {
          console.log('✅ Utilisateur normal trouvé');
          return true;
      }
      
      // Vérifier aussi dans le stockage global (pour les utilisateurs connectés)
      const globalProfile = await AsyncStorage.getItem('userProfile');
      if (globalProfile) {
        try {
          const profile = JSON.parse(globalProfile);
          if (profile.email === email) {
            console.log('✅ Utilisateur trouvé dans le stockage global');
            return true;
          }
        } catch (parseError) {
          console.log('❌ Erreur parsing profil global:', parseError);
        }
      }
      
      console.log('❌ Aucun utilisateur trouvé avec cet email');
      return false;
    } catch (error) {
      console.error('❌ Erreur lors de la vérification de l\'utilisateur:', error);
      return false;
    }
  }

  /**
   * Envoyer un email de réinitialisation de mot de passe
   */
  static async sendPasswordResetEmail(email) {
    try {
      console.log('📧 Envoi d\'email de réinitialisation pour:', email);
      
      // Simuler l'envoi d'email (en production, ceci utiliserait un vrai service d'email)
      const resetToken = `reset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const expiresAt = Date.now() + (60 * 60 * 1000); // 1 heure
      
      // Sauvegarder le token de réinitialisation
      const resetData = {
        email,
        token: resetToken,
        expiresAt,
        createdAt: new Date().toISOString()
      };
      
      await StorageService.setUserData(`resetToken_${email}`, resetData);
      
      console.log('✅ Token de réinitialisation créé:', resetToken);
      console.log('📧 Email de réinitialisation "envoyé" (simulé)');
      
      // En production, vous enverriez un vrai email ici
      // avec un lien contenant le token
      
      return { success: true, resetToken };
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi de l\'email de réinitialisation:', error);
      throw new Error('Impossible d\'envoyer l\'email de réinitialisation');
    }
  }

  /**
   * Vérifier si un token de réinitialisation est valide
   */
  static async verifyResetToken(email) {
    try {
      console.log('🔍 Vérification du token de réinitialisation pour:', email);
      
      const resetDataKey = `resetToken_${email}`;
      const resetData = await StorageService.getUserData(resetDataKey);
      
      if (!resetData) {
        console.log('❌ Aucun token de réinitialisation trouvé');
        return false;
      }
      
      const { token, expiresAt } = resetData;
      
      // Vérifier si le token a expiré
      if (Date.now() > expiresAt) {
        console.log('❌ Token de réinitialisation expiré');
        await StorageService.removeUserData(resetDataKey);
        return false;
      }
      
      console.log('✅ Token de réinitialisation valide');
      return true;
    } catch (error) {
      console.error('❌ Erreur lors de la vérification du token:', error);
      return false;
    }
  }

  /**
   * Mettre à jour le mot de passe d'un utilisateur
   */
  static async updatePassword(email, newPassword) {
    try {
      console.log('🔧 Mise à jour du mot de passe pour:', email);
      
      // Vérifier que le token est toujours valide
      const isValidToken = await this.verifyResetToken(email);
      if (!isValidToken) {
        throw new Error('Token de réinitialisation invalide ou expiré');
      }
      
      // Mettre à jour le mot de passe selon le type d'utilisateur
      const testUserKey = `user_${email}`;
      const testUser = await AsyncStorage.getItem(testUserKey);
      
      if (testUser) {
        // Utilisateur de test
        const userData = JSON.parse(testUser);
        userData.password = newPassword;
        await AsyncStorage.setItem(testUserKey, JSON.stringify(userData));
        console.log('✅ Mot de passe mis à jour pour l\'utilisateur de test');
      } else {
        // Utilisateur normal
        const userProfile = await AsyncStorage.getItem('userProfile');
        if (userProfile) {
          const profile = JSON.parse(userProfile);
          if (profile.email === email) {
            await AsyncStorage.setItem('userPassword', newPassword);
            console.log('✅ Mot de passe mis à jour pour l\'utilisateur normal');
          } else {
            throw new Error('Utilisateur non trouvé');
          }
        } else {
          throw new Error('Utilisateur non trouvé');
        }
      }
      
      // Supprimer le token de réinitialisation
      await AsyncStorage.removeItem(`resetToken_${email}`);
      
      console.log('✅ Mot de passe mis à jour avec succès');
      return { success: true };
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour du mot de passe:', error);
      throw error;
    }
  }

  /**
   * Changer le mot de passe d'un utilisateur connecté
   */
  static async changePassword(currentPassword, newPassword) {
    try {
      console.log('🔧 Changement de mot de passe pour l\'utilisateur connecté');
      
      // Récupérer l'utilisateur actuel
      const currentUser = await this.getCurrentUser();
      if (!currentUser) {
        throw new Error('Aucun utilisateur connecté');
      }
      
      console.log('🔍 Utilisateur connecté:', currentUser.email);
      
      // Vérifier l'ancien mot de passe en essayant de se connecter avec
      console.log('🔍 Vérification du mot de passe par connexion...');
      let isPasswordCorrect = false;
      
      try {
        // Essayer de se connecter avec le mot de passe fourni
        await this.login(currentUser.email, currentPassword);
        console.log('✅ Mot de passe vérifié par connexion réussie');
        isPasswordCorrect = true;
      } catch (loginError) {
        console.log('❌ Échec de vérification par connexion:', loginError.message);
        isPasswordCorrect = false;
      }
      
      if (!isPasswordCorrect) {
        throw new Error('Mot de passe actuel incorrect');
      }
      
      // Maintenant mettre à jour le mot de passe selon le type d'utilisateur
      const testUserKey = `user_${currentUser.email}`;
      const testUser = await AsyncStorage.getItem(testUserKey);
      
      if (testUser) {
        // Utilisateur de test
        const userData = JSON.parse(testUser);
        userData.password = CryptoService.encrypt(newPassword); // Chiffrer le nouveau mot de passe
        await AsyncStorage.setItem(testUserKey, JSON.stringify(userData));
        console.log('✅ Mot de passe mis à jour pour l\'utilisateur de test');
      } else {
        // Utilisateur normal
        await CryptoService.setEncryptedItem('userPassword', newPassword);
        console.log('✅ Mot de passe mis à jour pour l\'utilisateur normal');
      }
      
      console.log('✅ Mot de passe changé avec succès');
      return { success: true };
    } catch (error) {
      console.error('❌ Erreur lors du changement de mot de passe:', error);
      throw error;
    }
  }

  /**
   * Vérifier si un utilisateur mérite le badge vérifié
   * Critères : Compte créé + minimum 3 avis/commentaires ajoutés
   */
  static async checkVerificationStatus(userId) {
    try {
      // Récupérer l'utilisateur actuel pour obtenir l'email
      const currentUser = await this.getCurrentUser();
      const userEmail = currentUser ? currentUser.email : null;
      
      if (!userEmail) {
        console.log('❌ Aucun utilisateur connecté pour vérification');
        return { isVerified: false, criteria: {} };
      }
      
      // Récupérer les statistiques de l'utilisateur par email
      const userStats = await this.getUserStatsByEmail(userEmail);
      
      // Critères pour le badge vérifié
      const hasAccount = !userStats.isVisitor;
      const hasEnoughReviews = userStats.reviewsAdded >= 3;
      
      const isVerified = hasAccount && hasEnoughReviews;
      
      console.log(`🔍 Statut de vérification: ${JSON.stringify({
        criteria: {
          hasAccount,
          hasEnoughReviews,
          reviewsAdded: userStats.reviewsAdded,
          requiredReviews: 3
        },
        isVerified,
        verifiedAt: isVerified ? new Date().toISOString() : null
      })}`);
      
      // Sauvegarder le statut de vérification par email
      await this.updateUserVerificationStatusByEmail(userEmail, isVerified);
      
      return {
        isVerified,
        criteria: {
          hasAccount,
          hasEnoughReviews,
          reviewsAdded: userStats.reviewsAdded,
          requiredReviews: 3
        },
        verifiedAt: isVerified ? new Date().toISOString() : null
      };
    } catch (error) {
      console.error('❌ Erreur lors de la vérification du statut:', error);
      return { isVerified: false, criteria: {} };
    }
  }

  /**
   * Récupérer les statistiques d'un utilisateur par email
   */
  static async getUserStatsByEmail(userEmail) {
    try {
      const statsKey = `userStats_email_${userEmail}`;
      const savedStats = await AsyncStorage.getItem(statsKey);
      
      if (savedStats) {
        return JSON.parse(savedStats);
      }
      
      // Statistiques par défaut
      const defaultStats = {
        placesAdded: 0,
        reviewsAdded: 0,
        isVisitor: false,
        joinDate: new Date().toISOString(),
        lastActivity: new Date().toISOString()
      };
      
      await AsyncStorage.setItem(statsKey, JSON.stringify(defaultStats));
      return defaultStats;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des stats:', error);
      return {
        placesAdded: 0,
        reviewsAdded: 0,
        isVisitor: false,
        joinDate: new Date().toISOString(),
        lastActivity: new Date().toISOString()
      };
    }
  }

  /**
   * Récupérer les statistiques d'un utilisateur (compatibilité)
   */
  static async getUserStats(userId) {
    try {
      // Essayer d'abord par email si c'est un email
      if (userId.includes('@')) {
        return await this.getUserStatsByEmail(userId);
      }
      
      // Sinon, essayer par UID
      const statsKey = `userStats_${userId}`;
      const savedStats = await AsyncStorage.getItem(statsKey);
      
      if (savedStats) {
        return JSON.parse(savedStats);
      }
      
      // Statistiques par défaut
      const defaultStats = {
        placesAdded: 0,
        reviewsAdded: 0,
        isVisitor: false,
        joinDate: new Date().toISOString(),
        lastActivity: new Date().toISOString()
      };
      
      await AsyncStorage.setItem(statsKey, JSON.stringify(defaultStats));
      return defaultStats;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des stats:', error);
      return {
        placesAdded: 0,
        reviewsAdded: 0,
        isVisitor: false,
        joinDate: new Date().toISOString(),
        lastActivity: new Date().toISOString()
      };
    }
  }

  /**
   * Mettre à jour le statut de vérification d'un utilisateur par email
   */
  static async updateUserVerificationStatusByEmail(userEmail, isVerified) {
    try {
      const verificationKey = `userVerification_email_${userEmail}`;
      
      // Récupérer les vraies statistiques pour les critères
      const userStats = await this.getUserStatsByEmail(userEmail);
      const hasAccount = !userStats.isVisitor;
      const hasEnoughReviews = userStats.reviewsAdded >= 3;
      
      await AsyncStorage.setItem(verificationKey, JSON.stringify({
        isVerified,
        verifiedAt: isVerified ? new Date().toISOString() : null,
        criteria: {
          hasAccount,
          hasEnoughReviews,
          reviewsAdded: userStats.reviewsAdded,
          requiredReviews: 3
        }
      }));
      
      console.log(`✅ Statut de vérification mis à jour pour ${userEmail}: ${isVerified} (${userStats.reviewsAdded}/3 avis)`);
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour du statut:', error);
    }
  }

  /**
   * Mettre à jour le statut de vérification d'un utilisateur (compatibilité)
   */
  static async updateUserVerificationStatus(userId, isVerified) {
    try {
      // Essayer d'abord par email si c'est un email
      if (userId.includes('@')) {
        return await this.updateUserVerificationStatusByEmail(userId, isVerified);
      }
      
      const verificationKey = `userVerification_${userId}`;
      
      // Récupérer les vraies statistiques pour les critères
      const userStats = await this.getUserStats(userId);
      const hasAccount = !userStats.isVisitor;
      const hasEnoughReviews = userStats.reviewsAdded >= 3;
      
      await AsyncStorage.setItem(verificationKey, JSON.stringify({
        isVerified,
        verifiedAt: isVerified ? new Date().toISOString() : null,
        criteria: {
          hasAccount,
          hasEnoughReviews,
          reviewsAdded: userStats.reviewsAdded,
          requiredReviews: 3
        }
      }));
      
      console.log(`✅ Statut de vérification mis à jour pour ${userId}: ${isVerified} (${userStats.reviewsAdded}/3 avis)`);
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour du statut:', error);
    }
  }

  /**
   * Incrémenter le compteur d'avis ajoutés par un utilisateur
   */
  static async incrementReviewsAdded(userId) {
    try {
      // Récupérer l'utilisateur actuel pour obtenir l'email
      const currentUser = await this.getCurrentUser();
      const userEmail = currentUser ? currentUser.email : null;
      
      if (!userEmail) {
        console.log('❌ Aucun utilisateur connecté pour incrémenter les avis');
        return 0;
      }
      
      const stats = await this.getUserStatsByEmail(userEmail);
      stats.reviewsAdded += 1;
      stats.lastActivity = new Date().toISOString();
      
      const statsKey = `userStats_email_${userEmail}`;
      await AsyncStorage.setItem(statsKey, JSON.stringify(stats));
      
      // Vérifier si l'utilisateur mérite maintenant le badge
      await this.checkVerificationStatus(userId);
      
      console.log(`✅ Avis ajouté pour ${userEmail}, total: ${stats.reviewsAdded}`);
      return stats.reviewsAdded;
    } catch (error) {
      console.error('❌ Erreur lors de l\'incrémentation des avis:', error);
      return 0;
    }
  }

  /**
   * Récupérer le statut de vérification d'un utilisateur
   */
  static async getUserVerificationStatus(userId) {
    try {
      // Récupérer l'utilisateur actuel pour obtenir l'email
      const currentUser = await this.getCurrentUser();
      const userEmail = currentUser ? currentUser.email : null;
      
      if (!userEmail) {
        console.log('❌ Aucun utilisateur connecté pour récupérer le statut');
        return { isVerified: false };
      }
      
      const verificationKey = `userVerification_email_${userEmail}`;
      const savedVerification = await AsyncStorage.getItem(verificationKey);
      
      if (savedVerification) {
        return JSON.parse(savedVerification);
      }
      
      // Si pas de statut sauvegardé, le calculer
      return await this.checkVerificationStatus(userId);
    } catch (error) {
      console.error('❌ Erreur lors de la récupération du statut:', error);
      return { isVerified: false };
    }
  }

  /**
   * Supprimer complètement un utilisateur et toutes ses données
   */
  static async deleteUser(email) {
    try {
      console.log('🗑️ Suppression complète de l\'utilisateur:', email);
      
      // Supprimer les données de test
      const testUserKey = `user_${email}`;
      await AsyncStorage.removeItem(testUserKey);
      
      // Supprimer toutes les données privées de l'utilisateur
      await StorageService.clearUserData(email);
      
      // Supprimer les clés AsyncStorage directes
      const keysToRemove = [
        `user_${email}_userProfile`,
        `user_${email}_userPassword`,
        `user_${email}_isAuthenticated`,
        `user_${email}_currentUser`,
        `resetToken_${email}`
      ];
      
      await AsyncStorage.multiRemove(keysToRemove);
      
      console.log('✅ Utilisateur supprimé complètement:', email);
      return { success: true };
    } catch (error) {
      console.error('❌ Erreur lors de la suppression de l\'utilisateur:', error);
      throw error;
    }
  }
} 