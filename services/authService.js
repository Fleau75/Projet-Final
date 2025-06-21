import AsyncStorage from '@react-native-async-storage/async-storage';

// Utilisateurs de test pré-créés
const TEST_USERS = {
  'test@example.com': {
    email: 'test@example.com',
    password: '123456',
    name: 'Utilisateur Test',
    createdAt: new Date().toISOString()
  },
  'demo@accessplus.com': {
    email: 'demo@accessplus.com',
    password: 'demo123',
    name: 'Démo AccessPlus',
    createdAt: new Date().toISOString()
  },
  'admin@accessplus.com': {
    email: 'admin@accessplus.com',
    password: 'admin123',
    name: 'Administrateur',
    createdAt: new Date().toISOString()
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
        uid: profile.uid || `user_${Date.now()}`,
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
      return isAuth === 'true';
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
        return userProfile ? JSON.parse(userProfile) : null;
      }
      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      return null;
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
} 