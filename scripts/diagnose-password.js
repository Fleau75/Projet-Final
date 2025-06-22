/**
 * Script de diagnostic pour vérifier les mots de passe stockés
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthService } from '../services/authService.js';

const diagnosePassword = async () => {
  console.log('🔍 Diagnostic des mots de passe stockés\n');

  try {
    // 1. Vérifier l'utilisateur connecté
    console.log('1️⃣ Vérification de l\'utilisateur connecté');
    const currentUser = await AuthService.getCurrentUser();
    console.log('   - Utilisateur connecté:', currentUser ? currentUser.email : 'Aucun');
    
    if (!currentUser) {
      console.log('   ❌ Aucun utilisateur connecté');
      return;
    }
    
    // 2. Vérifier les données utilisateur de test
    console.log('\n2️⃣ Vérification des données utilisateur de test');
    const testUserKey = `user_${currentUser.email}`;
    const testUser = await AsyncStorage.getItem(testUserKey);
    console.log('   - Clé utilisateur de test:', testUserKey);
    console.log('   - Données trouvées:', !!testUser);
    
    if (testUser) {
      const userData = JSON.parse(testUser);
      console.log('   - Email stocké:', userData.email);
      console.log('   - Mot de passe stocké:', userData.password);
      console.log('   - Nom stocké:', userData.name);
    }
    
    // 3. Vérifier le mot de passe normal
    console.log('\n3️⃣ Vérification du mot de passe normal');
    const storedPassword = await AsyncStorage.getItem('userPassword');
    console.log('   - Mot de passe stocké (normal):', storedPassword);
    
    // 4. Vérifier l'état d'authentification
    console.log('\n4️⃣ Vérification de l\'état d\'authentification');
    const isAuthenticated = await AuthService.isAuthenticated();
    console.log('   - Utilisateur authentifié:', isAuthenticated);
    
    // 5. Vérifier le profil utilisateur
    console.log('\n5️⃣ Vérification du profil utilisateur');
    const userProfile = await AsyncStorage.getItem('userProfile');
    console.log('   - Profil utilisateur trouvé:', !!userProfile);
    
    if (userProfile) {
      const profile = JSON.parse(userProfile);
      console.log('   - Email du profil:', profile.email);
      console.log('   - Nom du profil:', profile.name);
    }
    
    // 6. Test de connexion avec différents mots de passe
    console.log('\n6️⃣ Test de connexion');
    
    // Test avec le mot de passe de test
    if (testUser) {
      const userData = JSON.parse(testUser);
      try {
        await AuthService.login(currentUser.email, userData.password);
        console.log('   ✅ Connexion réussie avec le mot de passe de test');
      } catch (error) {
        console.log('   ❌ Échec de connexion avec le mot de passe de test:', error.message);
      }
    }
    
    // Test avec le mot de passe normal
    if (storedPassword) {
      try {
        await AuthService.login(currentUser.email, storedPassword);
        console.log('   ✅ Connexion réussie avec le mot de passe normal');
      } catch (error) {
        console.log('   ❌ Échec de connexion avec le mot de passe normal:', error.message);
      }
    }
    
    console.log('\n🎉 Diagnostic terminé !');
    
  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error);
  }
};

// Exécuter le diagnostic
diagnosePassword(); 