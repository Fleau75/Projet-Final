import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

export const debugStorage = async () => {
  try {
    console.log('🔍 DEBUG STORAGE - Début de l\'inspection...');
    
    // Récupérer toutes les clés
    const allKeys = await AsyncStorage.getAllKeys();
    console.log('🔍 Toutes les clés:', allKeys);
    
    // Afficher les données importantes
    const importantKeys = [
      'isAuthenticated',
      'userProfile',
      'userPassword',
      'currentUser'
    ];
    
    for (const key of importantKeys) {
      const value = await AsyncStorage.getItem(key);
      console.log(`🔍 ${key}:`, value);
    }
    
    // Afficher les données utilisateur spécifiques
    const userKeys = allKeys.filter(key => key.includes('flo@gmail.com'));
    console.log('🔍 Clés pour flo@gmail.com:', userKeys);
    
    for (const key of userKeys) {
      const value = await AsyncStorage.getItem(key);
      console.log(`🔍 ${key}:`, value);
    }
    
    // Afficher les utilisateurs de test
    const testKeys = allKeys.filter(key => key.startsWith('user_test@') || key.startsWith('user_demo@') || key.startsWith('user_admin@'));
    console.log('🔍 Clés pour utilisateurs de test:', testKeys);
    
    for (const key of testKeys) {
      const value = await AsyncStorage.getItem(key);
      console.log(`🔍 ${key}:`, value);
    }
    
    console.log('🔍 DEBUG STORAGE - Inspection terminée');
  } catch (error) {
    console.error('❌ Erreur lors du debug storage:', error);
  }
};

export const clearAllStorage = async () => {
  try {
    console.log('🗑️ Nettoyage complet du stockage...');
    await AsyncStorage.clear();
    console.log('✅ Stockage nettoyé');
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
  }
};

export const recreateTestUsers = async () => {
  try {
    console.log('🔧 Recréation des utilisateurs de test...');
    
    const TEST_USERS = {
      'test@example.com': {
        email: 'test@example.com',
        password: '123456',
        name: 'Utilisateur Test',
        createdAt: new Date().toISOString(),
        reviewsAdded: 5,
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
    
    for (const [email, userData] of Object.entries(TEST_USERS)) {
      const userKey = `user_${email}`;
      await AsyncStorage.setItem(userKey, JSON.stringify(userData));
      console.log(`✅ Utilisateur de test recréé: ${email}`);
    }
    
    console.log('✅ Tous les utilisateurs de test recréés');
  } catch (error) {
    console.error('❌ Erreur lors de la recréation des utilisateurs de test:', error);
  }
};

export const clearUserData = async (email) => {
  try {
    console.log(`🗑️ Nettoyage des données pour: ${email}`);
    
    // Supprimer les clés AsyncStorage directes
    const directKeys = [
      `user_${email}`,
      `user_${email}_userProfile`,
      `user_${email}_userPassword`,
      `user_${email}_isAuthenticated`,
      `user_${email}_currentUser`
    ];
    
    for (const key of directKeys) {
      try {
        await AsyncStorage.removeItem(key);
        console.log(`✅ Clé supprimée: ${key}`);
      } catch (error) {
        console.warn(`⚠️ Erreur lors de la suppression de ${key}:`, error);
      }
    }
    
    // Supprimer les clés StorageService
    const storageKeys = [
      'userProfile',
      'userPassword',
      'isAuthenticated',
      'currentUser'
    ];
    
    for (const key of storageKeys) {
      try {
        await AsyncStorage.removeItem(`user_${email}_${key}`);
        console.log(`✅ Clé StorageService supprimée: user_${email}_${key}`);
      } catch (error) {
        console.warn(`⚠️ Erreur lors de la suppression de user_${email}_${key}:`, error);
      }
    }
    
    console.log(`✅ Données nettoyées pour ${email}`);
  } catch (error) {
    console.error(`❌ Erreur lors du nettoyage de ${email}:`, error);
  }
};

export const clearAllCustomUsers = async () => {
  try {
    console.log('🗑️ Suppression de tous les utilisateurs créés manuellement...');
    
    // Récupérer toutes les clés
    const allKeys = await AsyncStorage.getAllKeys();
    console.log('🔍 Toutes les clés:', allKeys);
    
    // Identifier les utilisateurs de test (à ne PAS supprimer)
    const testUsers = ['test@example.com', 'demo@accessplus.com', 'admin@accessplus.com', 'visiteur@accessplus.com'];
    
    // Trouver tous les utilisateurs créés manuellement
    const customUserKeys = allKeys.filter(key => {
      // Exclure les utilisateurs de test
      for (const testUser of testUsers) {
        if (key.includes(testUser)) {
          return false;
        }
      }
      
      // Inclure les clés qui ressemblent à des utilisateurs créés manuellement
      return key.includes('@') && (
        key.startsWith('user_') || 
        key.includes('_userProfile') ||
        key.includes('_userPassword') ||
        key.includes('_isAuthenticated') ||
        key.includes('_currentUser') ||
        key.includes('_stats') ||
        key.includes('userVerification_email_') ||
        key.includes('userStats_email_')
      );
    });
    
    console.log('🔍 Clés d\'utilisateurs créés manuellement à supprimer:', customUserKeys);
    
    // Supprimer toutes les clés des utilisateurs créés manuellement
    for (const key of customUserKeys) {
      try {
        await AsyncStorage.removeItem(key);
        console.log(`✅ Clé supprimée: ${key}`);
      } catch (error) {
        console.warn(`⚠️ Erreur lors de la suppression de ${key}:`, error);
      }
    }
    
    // Supprimer aussi les clés globales d'authentification
    const globalKeys = ['userProfile', 'isAuthenticated', 'currentUser', 'userPassword'];
    for (const key of globalKeys) {
      try {
        await AsyncStorage.removeItem(key);
        console.log(`✅ Clé globale supprimée: ${key}`);
      } catch (error) {
        console.warn(`⚠️ Erreur lors de la suppression de la clé globale ${key}:`, error);
      }
    }
    
    console.log('✅ Tous les utilisateurs créés manuellement supprimés');
  } catch (error) {
    console.error('❌ Erreur lors de la suppression des utilisateurs:', error);
  }
};

export const testCompleteFlow = async () => {
  try {
    console.log('🧪 TEST COMPLET - Début du test d\'inscription et connexion...');
    
    // 1. Nettoyer d'abord
    console.log('🧪 Étape 1: Nettoyage...');
    await clearAllCustomUsers();
    
    // 2. Vérifier l'état initial
    console.log('🧪 Étape 2: Vérification de l\'état initial...');
    const allKeys = await AsyncStorage.getAllKeys();
    console.log('🔍 Clés après nettoyage:', allKeys);
    
    // 3. Simuler une inscription
    console.log('🧪 Étape 3: Simulation d\'inscription...');
    const testEmail = 'testuser@example.com';
    const testPassword = '123456';
    const testUserData = {
      email: testEmail,
      firstName: 'Test',
      lastName: 'User',
      phone: ''
    };
    
    // Simuler la création des données d'inscription
    const user = {
      uid: `user_${Date.now()}`,
      email: testUserData.email,
      displayName: `${testUserData.firstName} ${testUserData.lastName}`
    };
    
    const userProfile = {
      uid: user.uid,
      name: `${testUserData.firstName} ${testUserData.lastName}`,
      email: testUserData.email,
      phone: testUserData.phone || '',
      joinDate: new Date().toLocaleDateString('fr-FR', { 
        year: 'numeric', 
        month: 'long' 
      }),
      isVisitor: false
    };
    
    // Sauvegarder les données comme dans register()
    await AsyncStorage.setItem(`user_${testEmail}_userProfile`, JSON.stringify(userProfile));
    await AsyncStorage.setItem(`user_${testEmail}_userPassword`, testPassword);
    await AsyncStorage.setItem(`user_${testEmail}_isAuthenticated`, 'true');
    await AsyncStorage.setItem(`user_${testEmail}_currentUser`, JSON.stringify(user));
    
    // Sauvegarder aussi au format test
    const testUserData2 = {
      email: testUserData.email,
      password: testPassword,
      name: `${testUserData.firstName} ${testUserData.lastName}`,
      createdAt: new Date().toISOString()
    };
    await AsyncStorage.setItem(`user_${testEmail}`, JSON.stringify(testUserData2));
    
    console.log('✅ Données d\'inscription créées');
    
    // 4. Vérifier que les données sont bien sauvegardées
    console.log('🧪 Étape 4: Vérification des données sauvegardées...');
    const savedProfile = await AsyncStorage.getItem(`user_${testEmail}_userProfile`);
    const savedPassword = await AsyncStorage.getItem(`user_${testEmail}_userPassword`);
    const savedAuth = await AsyncStorage.getItem(`user_${testEmail}_isAuthenticated`);
    const savedTestUser = await AsyncStorage.getItem(`user_${testEmail}`);
    
    console.log('🔍 Profil sauvegardé:', savedProfile);
    console.log('🔍 Mot de passe sauvegardé:', savedPassword);
    console.log('🔍 Authentification sauvegardée:', savedAuth);
    console.log('🔍 Utilisateur test sauvegardé:', savedTestUser);
    
    // 5. Simuler une connexion
    console.log('🧪 Étape 5: Simulation de connexion...');
    
    // Vérifier utilisateur de test
    const testUser = await AsyncStorage.getItem(`user_${testEmail}`);
    if (testUser) {
      console.log('✅ Utilisateur de test trouvé');
      const userData = JSON.parse(testUser);
      console.log('🔍 Données utilisateur:', userData);
      
      if (userData.password === testPassword) {
        console.log('✅ Connexion réussie avec utilisateur de test');
      } else {
        console.log('❌ Mot de passe incorrect pour utilisateur de test');
      }
    } else {
      console.log('❌ Utilisateur de test non trouvé');
    }
    
    // Vérifier utilisateur normal
    const directPassword = await AsyncStorage.getItem(`user_${testEmail}_userPassword`);
    const directAuth = await AsyncStorage.getItem(`user_${testEmail}_isAuthenticated`);
    
    console.log('🔍 Vérification directe:', { testEmail, directPassword, directAuth });
    
    if (directAuth === 'true' && directPassword === testPassword) {
      console.log('✅ Connexion réussie avec vérification directe');
    } else {
      console.log('❌ Échec de la vérification directe');
    }
    
    // 6. Vérifier l'état final
    console.log('🧪 Étape 6: État final...');
    const finalKeys = await AsyncStorage.getAllKeys();
    const userKeys = finalKeys.filter(key => key.includes(testEmail));
    console.log('🔍 Clés finales pour l\'utilisateur:', userKeys);
    
    console.log('🧪 TEST COMPLET - Terminé');
    
  } catch (error) {
    console.error('❌ Erreur lors du test complet:', error);
  }
};

export const testRegistrationFlow = async () => {
  try {
    console.log('🧪 TEST INSCRIPTION - Début du test d\'inscription complète...');
    
    // 1. Nettoyer d'abord
    console.log('🧪 Étape 1: Nettoyage...');
    await clearAllCustomUsers();
    
    // 2. Simuler une inscription complète
    console.log('🧪 Étape 2: Simulation d\'inscription...');
    const testEmail = 'newuser@example.com';
    const testPassword = '123456';
    const testUserData = {
      firstName: 'New',
      lastName: 'User',
      email: testEmail,
      phone: '0123456789'
    };
    
    // Importer AuthService pour tester la vraie fonction d'inscription
    const { AuthService } = require('./services/authService');
    
    // Appeler la vraie fonction d'inscription
    const registerResult = await AuthService.register(testEmail, testPassword, testUserData);
    console.log('🔧 Résultat de l\'inscription:', registerResult);
    
    // 3. Vérifier que l'utilisateur est bien connecté
    console.log('🧪 Étape 3: Vérification de l\'état de connexion...');
    const isAuth = await AuthService.isAuthenticated();
    const currentUser = await AuthService.getCurrentUser();
    
    console.log('🔍 isAuthenticated:', isAuth);
    console.log('🔍 currentUser:', currentUser);
    
    // 4. Tester la connexion avec le nouveau compte
    console.log('🧪 Étape 4: Test de connexion avec le nouveau compte...');
    const loginResult = await AuthService.login(testEmail, testPassword);
    console.log('🔧 Résultat de la connexion:', loginResult);
    
    // 5. Vérifier l'état final
    console.log('🧪 Étape 5: État final...');
    const finalIsAuth = await AuthService.isAuthenticated();
    const finalUser = await AuthService.getCurrentUser();
    
    console.log('🔍 État final - isAuthenticated:', finalIsAuth);
    console.log('🔍 État final - currentUser:', finalUser);
    
    // 6. Vérifier les clés de stockage
    const allKeys = await AsyncStorage.getAllKeys();
    const userKeys = allKeys.filter(key => key.includes(testEmail));
    console.log('🔍 Clés de stockage pour l\'utilisateur:', userKeys);
    
    console.log('🧪 TEST INSCRIPTION - Terminé');
    
    return {
      success: registerResult.success && loginResult.success,
      registerResult,
      loginResult,
      isAuthenticated: finalIsAuth,
      currentUser: finalUser
    };
    
  } catch (error) {
    console.error('❌ Erreur lors du test d\'inscription:', error);
    return { success: false, error: error.message };
  }
};

export const testUIRegistration = async () => {
  try {
    console.log('🧪 TEST UI INSCRIPTION - Début du test d\'inscription via l\'interface...');
    
    // 1. Nettoyer d'abord
    console.log('🧪 Étape 1: Nettoyage...');
    await clearAllCustomUsers();
    
    // 2. Simuler les données d'inscription
    console.log('🧪 Étape 2: Simulation des données d\'inscription...');
    const testEmail = 'uiuser@example.com';
    const testPassword = '123456';
    const testUserData = {
      firstName: 'UI',
      lastName: 'User',
      email: testEmail,
      phone: '0123456789'
    };
    
    // 3. Importer AuthContext pour tester la vraie fonction d'inscription
    const { AuthService } = require('./services/authService');
    
    // 4. Appeler la fonction d'inscription comme dans l'UI
    console.log('🧪 Étape 3: Appel de la fonction d\'inscription...');
    const registerResult = await AuthService.register(testEmail, testPassword, testUserData);
    console.log('🔧 Résultat de l\'inscription:', registerResult);
    
    // 5. Vérifier l'état d'authentification
    console.log('🧪 Étape 4: Vérification de l\'état d\'authentification...');
    const isAuth = await AuthService.isAuthenticated();
    const currentUser = await AuthService.getCurrentUser();
    
    console.log('🔍 isAuthenticated:', isAuth);
    console.log('🔍 currentUser:', currentUser);
    
    // 6. Vérifier les clés de stockage
    console.log('🧪 Étape 5: Vérification des clés de stockage...');
    const allKeys = await AsyncStorage.getAllKeys();
    const userKeys = allKeys.filter(key => key.includes(testEmail));
    const globalKeys = allKeys.filter(key => ['userProfile', 'isAuthenticated', 'currentUser', 'userPassword'].includes(key));
    
    console.log('🔍 Clés utilisateur:', userKeys);
    console.log('🔍 Clés globales:', globalKeys);
    
    // 7. Vérifier le contenu des clés globales
    console.log('🧪 Étape 6: Vérification du contenu des clés globales...');
    const globalUserProfile = await AsyncStorage.getItem('userProfile');
    const globalIsAuth = await AsyncStorage.getItem('isAuthenticated');
    const globalCurrentUser = await AsyncStorage.getItem('currentUser');
    
    console.log('🔍 userProfile global:', globalUserProfile);
    console.log('🔍 isAuthenticated global:', globalIsAuth);
    console.log('🔍 currentUser global:', globalCurrentUser);
    
    console.log('🧪 TEST UI INSCRIPTION - Terminé');
    
    return {
      success: registerResult.success && isAuth,
      registerResult,
      isAuthenticated: isAuth,
      currentUser: currentUser,
      hasGlobalKeys: globalKeys.length > 0,
      globalUserProfile: globalUserProfile ? JSON.parse(globalUserProfile) : null
    };
    
  } catch (error) {
    console.error('❌ Erreur lors du test UI d\'inscription:', error);
    return { success: false, error: error.message };
  }
};

export const testRealUIRegistration = async () => {
  try {
    console.log('🧪 TEST RÉEL UI INSCRIPTION - Début du test d\'inscription via l\'interface réelle...');
    
    // 1. Nettoyer d'abord
    console.log('🧪 Étape 1: Nettoyage...');
    await clearAllCustomUsers();
    
    // 2. Simuler les données d'inscription
    console.log('🧪 Étape 2: Simulation des données d\'inscription...');
    const testEmail = 'realuser@example.com';
    const testPassword = '123456';
    const testUserData = {
      firstName: 'Real',
      lastName: 'User',
      email: testEmail,
      phone: '0123456789'
    };
    
    // 3. Importer AuthService pour tester la vraie fonction d'inscription
    console.log('🧪 Étape 3: Import d\'AuthService...');
    const { AuthService } = require('./services/authService');
    
    // 4. Appeler la fonction d'inscription comme dans l'UI (via le contexte)
    console.log('🧪 Étape 4: Appel de la fonction d\'inscription via le contexte...');
    
    // Simuler l'appel du contexte d'authentification
    const registerResult = await AuthService.register(testEmail, testPassword, testUserData);
    console.log('🔧 Résultat de l\'inscription:', registerResult);
    
    // 5. Attendre un peu pour s'assurer que les données sont bien sauvegardées
    console.log('🧪 Étape 5: Attente pour la sauvegarde...');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 6. Vérifier l'état d'authentification
    console.log('🧪 Étape 6: Vérification de l\'état d\'authentification...');
    const isAuth = await AuthService.isAuthenticated();
    const currentUser = await AuthService.getCurrentUser();
    
    console.log('🔍 isAuthenticated:', isAuth);
    console.log('🔍 currentUser:', currentUser);
    
    // 7. Vérifier les clés de stockage
    console.log('🧪 Étape 7: Vérification des clés de stockage...');
    const allKeys = await AsyncStorage.getAllKeys();
    const userKeys = allKeys.filter(key => key.includes(testEmail));
    const globalKeys = allKeys.filter(key => ['userProfile', 'isAuthenticated', 'currentUser', 'userPassword'].includes(key));
    
    console.log('🔍 Clés utilisateur:', userKeys);
    console.log('🔍 Clés globales:', globalKeys);
    
    // 8. Vérifier le contenu des clés globales
    console.log('🧪 Étape 8: Vérification du contenu des clés globales...');
    const globalUserProfile = await AsyncStorage.getItem('userProfile');
    const globalIsAuth = await AsyncStorage.getItem('isAuthenticated');
    const globalCurrentUser = await AsyncStorage.getItem('currentUser');
    
    console.log('🔍 userProfile global:', globalUserProfile);
    console.log('🔍 isAuthenticated global:', globalIsAuth);
    console.log('🔍 currentUser global:', globalCurrentUser);
    
    // 9. Simuler la vérification du contexte d'authentification
    console.log('🧪 Étape 9: Simulation de la vérification du contexte...');
    const shouldRedirect = globalIsAuth === 'true' && globalUserProfile;
    console.log('🔍 Devrait rediriger:', shouldRedirect);
    
    if (shouldRedirect) {
      console.log('✅ Conditions de redirection remplies !');
    } else {
      console.log('❌ Conditions de redirection non remplies');
    }
    
    // 10. Résumé final
    console.log('🧪 ÉTAPE FINALE - RÉSUMÉ:');
    console.log('✅ Inscription réussie:', registerResult.success);
    console.log('✅ Authentification:', isAuth);
    console.log('✅ Utilisateur actuel:', currentUser ? 'Oui' : 'Non');
    console.log('✅ Clés globales:', globalKeys.length);
    console.log('✅ Redirection possible:', shouldRedirect);
    
    console.log('🧪 TEST RÉEL UI INSCRIPTION - Terminé avec succès');
    
    return {
      success: registerResult.success && isAuth && shouldRedirect,
      registerResult,
      isAuthenticated: isAuth,
      currentUser: currentUser,
      hasGlobalKeys: globalKeys.length > 0,
      globalUserProfile: globalUserProfile ? JSON.parse(globalUserProfile) : null,
      shouldRedirect: shouldRedirect
    };
    
  } catch (error) {
    console.error('❌ ERREUR CRITIQUE lors du test réel UI d\'inscription:', error);
    console.error('❌ Stack trace:', error.stack);
    
    // Afficher l'erreur dans une alerte pour qu'elle reste visible
    Alert.alert(
      "Erreur Test UI Réel",
      `Erreur: ${error.message}\n\nStack: ${error.stack}`,
      [{ text: "OK" }]
    );
    
    return { success: false, error: error.message };
  }
};

export const testCurrentState = async () => {
  try {
    console.log('🧪 TEST ÉTAT ACTUEL - Début du test de l\'état actuel...');
    
    // 1. Vérifier l'état d'authentification actuel
    console.log('🧪 Étape 1: Vérification de l\'état d\'authentification...');
    const { AuthService } = require('./services/authService');
    
    const isAuth = await AuthService.isAuthenticated();
    const currentUser = await AuthService.getCurrentUser();
    
    console.log('🔍 isAuthenticated:', isAuth);
    console.log('🔍 currentUser:', currentUser);
    
    // 2. Vérifier les clés de stockage
    console.log('🧪 Étape 2: Vérification des clés de stockage...');
    const allKeys = await AsyncStorage.getAllKeys();
    const globalKeys = allKeys.filter(key => ['userProfile', 'isAuthenticated', 'currentUser', 'userPassword'].includes(key));
    const userKeys = allKeys.filter(key => key.includes('@') && key.startsWith('user_'));
    
    console.log('🔍 Toutes les clés:', allKeys);
    console.log('🔍 Clés globales:', globalKeys);
    console.log('🔍 Clés utilisateur:', userKeys);
    
    // 3. Vérifier le contenu des clés globales
    console.log('🧪 Étape 3: Vérification du contenu des clés globales...');
    const globalUserProfile = await AsyncStorage.getItem('userProfile');
    const globalIsAuth = await AsyncStorage.getItem('isAuthenticated');
    const globalCurrentUser = await AsyncStorage.getItem('currentUser');
    
    console.log('🔍 userProfile global:', globalUserProfile);
    console.log('🔍 isAuthenticated global:', globalIsAuth);
    console.log('🔍 currentUser global:', globalCurrentUser);
    
    // 4. Résumé
    console.log('🧪 RÉSUMÉ ÉTAT ACTUEL:');
    console.log('✅ Authentifié:', isAuth);
    console.log('✅ Utilisateur actuel:', currentUser ? currentUser.email : 'Aucun');
    console.log('✅ Clés globales présentes:', globalKeys.length);
    console.log('✅ Utilisateurs enregistrés:', userKeys.length);
    
    console.log('🧪 TEST ÉTAT ACTUEL - Terminé');
    
    return {
      success: true,
      isAuthenticated: isAuth,
      currentUser: currentUser,
      hasGlobalKeys: globalKeys.length > 0,
      userCount: userKeys.length,
      globalUserProfile: globalUserProfile ? JSON.parse(globalUserProfile) : null
    };
    
  } catch (error) {
    console.error('❌ Erreur lors du test d\'état actuel:', error);
    Alert.alert(
      "Erreur Test État",
      `Erreur: ${error.message}`,
      [{ text: "OK" }]
    );
    return { success: false, error: error.message };
  }
}; 