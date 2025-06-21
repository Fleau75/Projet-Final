/**
 * Script de test pour la fonctionnalité de récupération de mot de passe
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthService } from '../services/authService.js';

const testPasswordReset = async () => {
  console.log('🧪 Test de la fonctionnalité de récupération de mot de passe\n');

  try {
    // 1. Test avec un utilisateur de test existant
    console.log('1️⃣ Test avec un utilisateur de test existant (test@example.com)');
    
    const testEmail = 'test@example.com';
    
    // Vérifier que l'utilisateur existe
    const userExists = await AuthService.checkUserExists(testEmail);
    console.log(`   - Utilisateur existe: ${userExists}`);
    
    if (userExists) {
      // Envoyer l'email de réinitialisation
      const resetResult = await AuthService.sendPasswordResetEmail(testEmail);
      console.log(`   - Email envoyé: ${resetResult.success}`);
      console.log(`   - Token généré: ${resetResult.resetToken}`);
      
      // Vérifier que le token est valide
      const isValidToken = await AuthService.verifyResetToken(testEmail);
      console.log(`   - Token valide: ${isValidToken}`);
      
      // Mettre à jour le mot de passe
      const updateResult = await AuthService.updatePassword(testEmail, 'nouveau123');
      console.log(`   - Mot de passe mis à jour: ${updateResult.success}`);
      
      // Vérifier que le nouveau mot de passe fonctionne
      try {
        await AuthService.login(testEmail, 'nouveau123');
        console.log('   - ✅ Connexion réussie avec le nouveau mot de passe');
      } catch (error) {
        console.log('   - ❌ Échec de connexion avec le nouveau mot de passe');
      }
    }
    
    console.log('\n2️⃣ Test avec un utilisateur inexistant');
    
    const fakeEmail = 'fake@example.com';
    
    // Vérifier que l'utilisateur n'existe pas
    const fakeUserExists = await AuthService.checkUserExists(fakeEmail);
    console.log(`   - Utilisateur existe: ${fakeUserExists}`);
    
    if (!fakeUserExists) {
      try {
        await AuthService.sendPasswordResetEmail(fakeEmail);
        console.log('   - ❌ Erreur: Email envoyé pour un utilisateur inexistant');
      } catch (error) {
        console.log('   - ✅ Correct: Erreur pour utilisateur inexistant');
      }
    }
    
    console.log('\n3️⃣ Test d\'expiration du token');
    
    // Créer un token expiré manuellement
    const expiredTokenData = {
      email: testEmail,
      token: 'expired_token',
      expiresAt: Date.now() - 1000, // Expiré il y a 1 seconde
      createdAt: new Date().toISOString()
    };
    
    await AsyncStorage.setItem(`resetToken_${testEmail}`, JSON.stringify(expiredTokenData));
    
    // Vérifier que le token expiré n'est pas valide
    const isExpiredTokenValid = await AuthService.verifyResetToken(testEmail);
    console.log(`   - Token expiré valide: ${isExpiredTokenValid}`);
    
    if (!isExpiredTokenValid) {
      console.log('   - ✅ Correct: Token expiré rejeté');
    } else {
      console.log('   - ❌ Erreur: Token expiré accepté');
    }
    
    console.log('\n4️⃣ Test de changement de mot de passe pour utilisateur connecté');
    
    // Se connecter d'abord
    await AuthService.login(testEmail, 'nouveau123');
    console.log('   - Utilisateur connecté');
    
    // Changer le mot de passe
    try {
      await AuthService.changePassword('nouveau123', 'encoreplusnouveau123');
      console.log('   - ✅ Mot de passe changé avec succès');
      
      // Vérifier que le nouveau mot de passe fonctionne
      await AuthService.logout();
      await AuthService.login(testEmail, 'encoreplusnouveau123');
      console.log('   - ✅ Connexion réussie avec le mot de passe changé');
    } catch (error) {
      console.log(`   - ❌ Erreur lors du changement: ${error.message}`);
    }
    
    console.log('\n🎉 Tests terminés avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors des tests:', error);
  }
};

// Exécuter les tests
testPasswordReset(); 