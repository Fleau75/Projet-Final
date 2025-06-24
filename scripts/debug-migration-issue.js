/**
 * Script de diagnostic pour comprendre le problème de migration
 * Pourquoi la migration ne fonctionne pas depuis l'écran d'accueil
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthService } from '../services/authService.js';
import StorageService from '../services/storageService.js';

async function debugMigrationIssue() {
  console.log('🔍 === DIAGNOSTIC PROBLÈME MIGRATION ===');
  
  try {
    // 1. Vérifier l'état actuel
    console.log('\n📱 1. ÉTAT ACTUEL');
    const currentUser = await AuthService.getCurrentUser();
    console.log('Utilisateur actuel:', currentUser);
    
    const isVisitor = await AuthService.isCurrentUserVisitor();
    console.log('Est visiteur:', isVisitor);
    
    // 2. Vérifier les données visiteur
    console.log('\n👤 2. DONNÉES VISITEUR');
    const visitorData = await StorageService.getAllUserData('visitor');
    console.log('Données visiteur disponibles:', Object.keys(visitorData));
    console.log('Nombre de clés visiteur:', Object.keys(visitorData).length);
    
    if (Object.keys(visitorData).length > 0) {
      console.log('Détail des données visiteur:');
      for (const [key, value] of Object.entries(visitorData)) {
        if (Array.isArray(value)) {
          console.log(`  ${key}: ${value.length} éléments`);
        } else if (typeof value === 'object') {
          console.log(`  ${key}: objet avec ${Object.keys(value).length} propriétés`);
        } else {
          console.log(`  ${key}: ${value}`);
        }
      }
    }
    
    // 3. Simuler le processus d'inscription
    console.log('\n🧪 3. SIMULATION INSCRIPTION');
    const testEmail = 'test-migration@example.com';
    const testPassword = '123456';
    const testUserData = {
      email: testEmail,
      firstName: 'Test',
      lastName: 'Migration',
      phone: ''
    };
    
    console.log('Données de test:', testUserData);
    
    // 4. Vérifier si l'utilisateur existe déjà
    console.log('\n🔍 4. VÉRIFICATION UTILISATEUR EXISTANT');
    const testUserKey = `user_${testEmail}`;
    const existingTestUser = await AsyncStorage.getItem(testUserKey);
    const existingProfileKey = `user_${testEmail}_userProfile`;
    const existingProfile = await AsyncStorage.getItem(existingProfileKey);
    
    console.log('Utilisateur de test existant:', existingTestUser ? 'Oui' : 'Non');
    console.log('Profil normal existant:', existingProfile ? 'Oui' : 'Non');
    
    // 5. Nettoyer l'utilisateur de test s'il existe
    if (existingTestUser || existingProfile) {
      console.log('\n🧹 5. NETTOYAGE UTILISATEUR DE TEST');
      await AsyncStorage.removeItem(testUserKey);
      await AsyncStorage.removeItem(existingProfileKey);
      await AsyncStorage.removeItem(`user_${testEmail}_userPassword`);
      await AsyncStorage.removeItem(`user_${testEmail}_isAuthenticated`);
      await AsyncStorage.removeItem(`user_${testEmail}_currentUser`);
      console.log('✅ Utilisateur de test nettoyé');
    }
    
    // 6. Simuler la migration
    console.log('\n🔄 6. SIMULATION MIGRATION');
    const migrationResult = await StorageService.migrateVisitorDataToUser(testEmail);
    console.log('Résultat migration:', migrationResult);
    
    // 7. Vérifier les données migrées
    console.log('\n✅ 7. VÉRIFICATION DONNÉES MIGRÉES');
    const migratedData = await StorageService.getAllUserData(testEmail);
    console.log('Données migrées:', Object.keys(migratedData));
    console.log('Nombre de clés migrées:', Object.keys(migratedData).length);
    
    if (Object.keys(migratedData).length > 0) {
      console.log('Détail des données migrées:');
      for (const [key, value] of Object.entries(migratedData)) {
        if (Array.isArray(value)) {
          console.log(`  ${key}: ${value.length} éléments`);
        } else if (typeof value === 'object') {
          console.log(`  ${key}: objet avec ${Object.keys(value).length} propriétés`);
        } else {
          console.log(`  ${key}: ${value}`);
        }
      }
    }
    
    // 8. Nettoyer après le test
    console.log('\n🧹 8. NETTOYAGE FINAL');
    await StorageService.clearUserData(testEmail);
    console.log('✅ Données de test nettoyées');
    
    console.log('\n📊 === RÉSUMÉ ===');
    console.log('✅ Diagnostic terminé');
    console.log(`📝 Données visiteur trouvées: ${Object.keys(visitorData).length}`);
    console.log(`📝 Données migrées: ${Object.keys(migratedData).length}`);
    console.log(`📝 Migration réussie: ${migrationResult.migrated}`);
    
  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error);
  }
}

// Exécuter le diagnostic
debugMigrationIssue(); 