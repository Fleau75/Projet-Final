import AsyncStorage from '@react-native-async-storage/async-storage';

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
        
        // Vérifier dans le profil normal
        const existingProfile = await AsyncStorage.getItem('userProfile');
        
        console.log('🔧 Utilisateur de test existant:', existingTestUser ? 'Oui' : 'Non');
        console.log('🔧 Profil normal existant:', existingProfile ? 'Oui' : 'Non');
        
        if (existingTestUser || (existingProfile && JSON.parse(existingProfile).email === email)) {
          throw new Error('Cette adresse email est déjà utilisée');
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

      // Sauvegarder dans le format normal
      await AsyncStorage.setItem('userProfile', JSON.stringify(userProfile));
      await AsyncStorage.setItem('userPassword', password);
      await AsyncStorage.setItem('isAuthenticated', 'true');
      await AsyncStorage.setItem('currentUser', JSON.stringify(user));

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

      console.log('🔧 Données sauvegardées avec succès');
      return { success: true, user };
    } catch (error) {
      console.error('❌ Erreur lors de l\'inscription:', error);
      throw error;
    }
  }

  /**
   * Connexion d'un utilisateur
   */
  static async login(email, password) {
    try {
      console.log('🔧 AuthService.login - Début avec:', { email, password });
      
      // D'abord, vérifier dans les utilisateurs de test
      const testUserKey = `user_${email}`;
      const testUser = await AsyncStorage.getItem(testUserKey);
      console.log('🔧 Utilisateur de test trouvé:', testUser ? 'Oui' : 'Non');
      
      let profile = null;
      let isTestUser = false;
      
      if (testUser) {
        // Utilisateur de test trouvé
        profile = JSON.parse(testUser);
        isTestUser = true;
        console.log('🔧 Profil utilisateur de test:', profile);
        
        // Vérifier le mot de passe
        if (profile.password !== password) {
          console.log('❌ Mot de passe incorrect pour utilisateur de test');
          throw new Error('Email ou mot de passe incorrect');
        }
      } else {
        // Vérifier dans le profil utilisateur normal
        const userProfile = await AsyncStorage.getItem('userProfile');
        console.log('🔧 Profil normal trouvé dans AsyncStorage:', userProfile ? 'Oui' : 'Non');
        
        if (!userProfile) {
          console.log('❌ Aucun profil trouvé');
          throw new Error('Aucun compte trouvé avec cette adresse email');
        }

        profile = JSON.parse(userProfile);
        console.log('🔧 Profil parsé:', profile);
        
        // Vérifier l'email
        if (profile.email !== email) {
          console.log('❌ Email ne correspond pas:', { attendu: profile.email, reçu: email });
          throw new Error('Email ou mot de passe incorrect');
        }

        // Vérifier le mot de passe
        const storedPassword = await AsyncStorage.getItem('userPassword');
        console.log('🔧 Mot de passe stocké:', storedPassword ? 'Oui' : 'Non');
        
        if (!storedPassword || storedPassword !== password) {
          console.log('❌ Mot de passe incorrect:', { stocké: storedPassword, reçu: password });
          throw new Error('Email ou mot de passe incorrect');
        }
      }

      console.log('✅ Email et mot de passe corrects');

      // Simuler la connexion
      const user = {
        uid: profile.uid || (isTestUser ? `user_${email.replace(/[^a-zA-Z0-9]/g, '_')}` : `user_${Date.now()}`),
        email: profile.email,
        displayName: profile.name || profile.displayName
      };

      // Pour les utilisateurs de test, créer un profil temporaire
      if (isTestUser) {
        const userProfile = {
          uid: user.uid,
          name: profile.name,
          email: profile.email,
          phone: '',
          joinDate: profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('fr-FR', { 
            year: 'numeric', 
            month: 'long' 
          }) : new Date().toLocaleDateString('fr-FR', { 
            year: 'numeric', 
            month: 'long' 
          }),
          isVisitor: false
        };
        await AsyncStorage.setItem('userProfile', JSON.stringify(userProfile));
        await AsyncStorage.setItem('userPassword', password);
      }

      await AsyncStorage.setItem('isAuthenticated', 'true');
      await AsyncStorage.setItem('currentUser', JSON.stringify(user));

      console.log('🔧 Connexion réussie, utilisateur:', user);
      return { success: true, user };
    } catch (error) {
      console.error('❌ Erreur lors de la connexion:', error);
      throw error;
    }
  }

  /**
   * Déconnexion
   */
  static async logout() {
    try {
      await AsyncStorage.removeItem('userProfile');
      await AsyncStorage.removeItem('isAuthenticated');
      await AsyncStorage.removeItem('currentUser');
      await AsyncStorage.removeItem('userPassword');
      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      throw error;
    }
  }

  /**
   * Vérifier si l'utilisateur est connecté
   */
  static async isAuthenticated() {
    try {
      const isAuth = await AsyncStorage.getItem('isAuthenticated');
      const userProfile = await AsyncStorage.getItem('userProfile');
      
      // Vérifier que l'utilisateur est authentifié ET qu'un profil existe
      if (isAuth === 'true' && userProfile) {
        const profile = JSON.parse(userProfile);
        // Vérifier que ce n'est pas un profil vide ou invalide
        if (profile && profile.email && profile.name) {
          console.log('🔧 Utilisateur authentifié:', profile.email);
          return true;
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
      const isAuth = await AsyncStorage.getItem('isAuthenticated');
      if (isAuth === 'true') {
        const userProfile = await AsyncStorage.getItem('userProfile');
        if (userProfile) {
          const profile = JSON.parse(userProfile);
          // Vérifier que le profil est valide
          if (profile && profile.email && profile.name) {
            return profile;
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
      const userProfile = await AsyncStorage.getItem('userProfile');
      if (userProfile) {
        const profile = JSON.parse(userProfile);
        return profile && profile.isVisitor === true;
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
   * Vérifier si un utilisateur existe avec cet email
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
      
      // Vérifier dans le profil normal
      const userProfile = await AsyncStorage.getItem('userProfile');
      if (userProfile) {
        const profile = JSON.parse(userProfile);
        if (profile.email === email) {
          console.log('✅ Utilisateur normal trouvé');
          return true;
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
      
      await AsyncStorage.setItem(`resetToken_${email}`, JSON.stringify(resetData));
      
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
      const resetData = await AsyncStorage.getItem(resetDataKey);
      
      if (!resetData) {
        console.log('❌ Aucun token de réinitialisation trouvé');
        return false;
      }
      
      const { token, expiresAt } = JSON.parse(resetData);
      
      // Vérifier si le token a expiré
      if (Date.now() > expiresAt) {
        console.log('❌ Token de réinitialisation expiré');
        await AsyncStorage.removeItem(resetDataKey);
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
      
      // Vérifier l'ancien mot de passe
      const storedPassword = await AsyncStorage.getItem('userPassword');
      if (storedPassword !== currentPassword) {
        throw new Error('Mot de passe actuel incorrect');
      }
      
      // Mettre à jour le mot de passe
      await AsyncStorage.setItem('userPassword', newPassword);
      
      // Mettre à jour aussi dans les utilisateurs de test si applicable
      const testUserKey = `user_${currentUser.email}`;
      const testUser = await AsyncStorage.getItem(testUserKey);
      if (testUser) {
        const userData = JSON.parse(testUser);
        userData.password = newPassword;
        await AsyncStorage.setItem(testUserKey, JSON.stringify(userData));
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
} 