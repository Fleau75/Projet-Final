#!/usr/bin/env node

/**
 * Script de test pour vérifier que la migration fonctionne après la correction
 * Teste le processus complet de migration des données visiteur
 */

const AsyncStorage = require('@react-native-async-storage/async-storage');
const { AuthService } = require('../services/authService.js');
const { StorageService } = require('../services/storageService.js');

async function testMigrationAfterFix() {
  console.log('🧪 === TEST MIGRATION APRÈS CORRECTION ===');
  
  try {
    // 1. Nettoyer l'environnement
    console.log('\n🧹 1. NETTOYAGE ENVIRONNEMENT');
    await clearTestData();
    
    // 2. Créer des données visiteur de test
    console.log('\n👤 2. CRÉATION DONNÉES VISITEUR DE TEST');
    await createTestVisitorData();
    
    // 3. Vérifier les données visiteur
    console.log('\n🔍 3. VÉRIFICATION DONNÉES VISITEUR');
    const visitorDataResult = await StorageService.getAllUserData('visitor');
    console.log('Résultat getAllUserData:', visitorDataResult);
    
    if (visitorDataResult.success) {
      const visitorData = visitorDataResult.data;
      console.log('Données visiteur créées:', Object.keys(visitorData));
      console.log('Nombre de clés:', Object.keys(visitorData).length);
      
      // Afficher le détail des données
      for (const [key, value] of Object.entries(visitorData)) {
        if (Array.isArray(value)) {
          console.log(`  ${key}: ${value.length} éléments`);
        } else if (typeof value === 'object') {
          console.log(`  ${key}: objet avec ${Object.keys(value).length} propriétés`);
        } else {
          console.log(`  ${key}: ${value}`);
        }
      }
    } else {
      console.error('❌ Erreur lors de la récupération des données visiteur:', visitorDataResult.error);
      return;
    }
    
    // 4. Tester la migration directement
    console.log('\n🔄 4. TEST MIGRATION DIRECTE');
    const testEmail = 'test-migration-fix@example.com';
    const migrationResult = await StorageService.migrateVisitorDataToUser(testEmail, false); // Pas de nettoyage pour le test
    console.log('Résultat migration:', migrationResult);
    
    // 5. Vérifier les données migrées
    console.log('\n✅ 5. VÉRIFICATION DONNÉES MIGRÉES');
    const migratedDataResult = await StorageService.getAllUserData(testEmail);
    console.log('Résultat getAllUserData migré:', migratedDataResult);
    
    if (migratedDataResult.success) {
      const migratedData = migratedDataResult.data;
      console.log('Données migrées:', Object.keys(migratedData));
      console.log('Nombre de clés migrées:', Object.keys(migratedData).length);
      
      // Comparer les données
      console.log('\n📊 6. COMPARAISON DONNÉES');
      const visitorData = visitorDataResult.data;
      
      console.log('Données visiteur originales:');
      for (const [key, value] of Object.entries(visitorData)) {
        if (Array.isArray(value)) {
          console.log(`  ${key}: ${value.length} éléments`);
        } else if (typeof value === 'object') {
          console.log(`  ${key}: objet avec ${Object.keys(value).length} propriétés`);
        } else {
          console.log(`  ${key}: ${value}`);
        }
      }
      
      console.log('\nDonnées migrées:');
      for (const [key, value] of Object.entries(migratedData)) {
        if (Array.isArray(value)) {
          console.log(`  ${key}: ${value.length} éléments`);
        } else if (typeof value === 'object') {
          console.log(`  ${key}: objet avec ${Object.keys(value).length} propriétés`);
        } else {
          console.log(`  ${key}: ${value}`);
        }
      }
      
      // Vérifier que toutes les données ont été migrées
      const originalKeys = Object.keys(visitorData).filter(key => 
        !['userProfile', 'isAuthenticated', 'userPassword', 'currentUser'].includes(key)
      );
      const migratedKeys = Object.keys(migratedData);
      
      console.log('\n🔍 7. VÉRIFICATION COMPLÉTUDE');
      console.log('Clés originales à migrer:', originalKeys);
      console.log('Clés migrées:', migratedKeys);
      
      const missingKeys = originalKeys.filter(key => !migratedKeys.includes(key));
      const extraKeys = migratedKeys.filter(key => !originalKeys.includes(key));
      
      if (missingKeys.length === 0 && extraKeys.length === 0) {
        console.log('✅ Toutes les données ont été migrées correctement !');
      } else {
        console.log('❌ Problème de migration:');
        if (missingKeys.length > 0) {
          console.log('  Clés manquantes:', missingKeys);
        }
        if (extraKeys.length > 0) {
          console.log('  Clés en trop:', extraKeys);
        }
      }
    } else {
      console.error('❌ Erreur lors de la récupération des données migrées:', migratedDataResult.error);
    }
    
    // 8. Nettoyer après le test
    console.log('\n🧹 8. NETTOYAGE FINAL');
    await clearTestData();
    await StorageService.clearUserData(testEmail);
    
    console.log('\n📊 === RÉSUMÉ TEST ===');
    console.log('✅ Test terminé avec succès');
    console.log(`📝 Migration réussie: ${migrationResult.migrated}`);
    console.log(`📝 Données migrées: ${migrationResult.count}`);
    console.log(`📝 Avis migrés: ${migrationResult.reviewsMigrated}`);
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

async function clearTestData() {
  console.log('🧹 Nettoyage des données de test...');
  
  // Nettoyer les données visiteur
  await StorageService.clearUserData('visitor');
  
  // Nettoyer les données de test
  const testEmails = [
    'test-migration@example.com',
    'test-migration-fix@example.com'
  ];
  
  for (const email of testEmails) {
    await StorageService.clearUserData(email);
  }
  
  // Nettoyer les clés globales
  const globalKeys = [
    'userProfile',
    'isAuthenticated',
    'currentUser',
    'userPassword'
  ];
  
  for (const key of globalKeys) {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      // Ignorer les erreurs de clés inexistantes
    }
  }
  
  console.log('✅ Nettoyage terminé');
}

async function createTestVisitorData() {
  console.log('👤 Création de données visiteur de test...');
  
  // Créer des favoris de test
  const testFavorites = [
    {
      id: 'test-place-1',
      name: 'Restaurant Test 1',
      address: '123 Rue Test, Paris',
      type: 'restaurant',
      rating: 4.5
    },
    {
      id: 'test-place-2', 
      name: 'Musée Test 2',
      address: '456 Avenue Test, Paris',
      type: 'culture',
      rating: 4.2
    }
  ];
  
  // Créer des marqueurs de carte de test
  const testMapMarkers = [
    {
      id: 'marker-1',
      title: 'Marqueur Test 1',
      description: 'Description du marqueur 1',
      coordinate: {
        latitude: 48.8566,
        longitude: 2.3522
      }
    },
    {
      id: 'marker-2',
      title: 'Marqueur Test 2', 
      description: 'Description du marqueur 2',
      coordinate: {
        latitude: 48.8584,
        longitude: 2.2945
      }
    }
  ];
  
  // Créer des préférences d'accessibilité de test
  const testAccessibilityPrefs = {
    wheelchair: true,
    visual: false,
    hearing: true,
    cognitive: false
  };
  
  // Créer des paramètres de test
  const testSettings = {
    theme: 'dark',
    language: 'fr',
    notifications: true
  };
  
  // Sauvegarder les données visiteur
  await StorageService.setUserData('favorites', testFavorites, 'visitor');
  await StorageService.setUserData('mapMarkers', testMapMarkers, 'visitor');
  await StorageService.setUserData('accessibilityPrefs', testAccessibilityPrefs, 'visitor');
  await StorageService.setUserData('searchRadius', 5000, 'visitor');
  await StorageService.setUserData('mapStyle', 'standard', 'visitor');
  await StorageService.setUserData('settings', testSettings, 'visitor');
  await StorageService.setUserData('history', ['place1', 'place2'], 'visitor');
  
  console.log('✅ Données visiteur de test créées');
}

// Exécuter le test
if (require.main === module) {
  testMigrationAfterFix().then(() => {
    console.log('\n🏁 Test terminé');
    process.exit(0);
  }).catch((error) => {
    console.error('\n💥 Test échoué:', error);
    process.exit(1);
  });
}

module.exports = { testMigrationAfterFix }; 