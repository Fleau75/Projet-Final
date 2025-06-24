/**
 * Script de test pour vérifier le flux complet de migration des données visiteur
 * Simule le processus d'inscription avec migration
 */

const AsyncStorage = require('@react-native-async-storage/async-storage');
const { AuthService } = require('../services/authService.js');
const StorageService = require('../services/storageService.js');

async function testMigrationFlow() {
  console.log('🧪 === TEST FLUX MIGRATION ===');
  
  try {
    // 1. Nettoyer l'environnement
    console.log('\n🧹 1. NETTOYAGE ENVIRONNEMENT');
    await clearTestData();
    
    // 2. Créer des données visiteur de test
    console.log('\n👤 2. CRÉATION DONNÉES VISITEUR DE TEST');
    await createTestVisitorData();
    
    // 3. Vérifier les données visiteur
    console.log('\n🔍 3. VÉRIFICATION DONNÉES VISITEUR');
    const visitorData = await StorageService.getAllUserData('visitor');
    console.log('Données visiteur créées:', Object.keys(visitorData));
    
    // 4. Simuler l'inscription avec migration
    console.log('\n📝 4. SIMULATION INSCRIPTION AVEC MIGRATION');
    const testEmail = 'test-migration@example.com';
    const testPassword = '123456';
    const testUserData = {
      email: testEmail,
      firstName: 'Test',
      lastName: 'Migration',
      phone: '',
      migrateVisitorData: true // Activer la migration
    };
    
    const result = await AuthService.register(testEmail, testPassword, testUserData);
    console.log('Résultat inscription:', result);
    
    // 5. Vérifier les données migrées
    console.log('\n✅ 5. VÉRIFICATION DONNÉES MIGRÉES');
    const migratedData = await StorageService.getAllUserData(testEmail);
    console.log('Données migrées:', Object.keys(migratedData));
    
    // 6. Comparer les données
    console.log('\n📊 6. COMPARAISON DONNÉES');
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
    
    // 7. Nettoyer après le test
    console.log('\n🧹 7. NETTOYAGE FINAL');
    await clearTestData();
    await StorageService.clearUserData(testEmail);
    
    console.log('\n📊 === RÉSUMÉ TEST ===');
    console.log('✅ Test terminé avec succès');
    console.log(`📝 Données visiteur créées: ${Object.keys(visitorData).length}`);
    console.log(`📝 Données migrées: ${Object.keys(migratedData).length}`);
    console.log(`📝 Migration réussie: ${result.success}`);
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

async function clearTestData() {
  console.log('🧹 Nettoyage des données de test...');
  
  // Nettoyer les données visiteur
  await StorageService.clearUserData('visitor');
  
  // Nettoyer les utilisateurs de test
  const testEmails = ['test-migration@example.com'];
  for (const email of testEmails) {
    await AsyncStorage.removeItem(`user_${email}`);
    await AsyncStorage.removeItem(`user_${email}_userProfile`);
    await AsyncStorage.removeItem(`user_${email}_userPassword`);
    await AsyncStorage.removeItem(`user_${email}_isAuthenticated`);
    await AsyncStorage.removeItem(`user_${email}_currentUser`);
    await StorageService.clearUserData(email);
  }
  
  console.log('✅ Données de test nettoyées');
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
  
  // Sauvegarder les données visiteur
  await StorageService.setUserData('favorites', testFavorites, 'visitor');
  await StorageService.setUserData('mapMarkers', testMapMarkers, 'visitor');
  await StorageService.setUserData('accessibilityPrefs', testAccessibilityPrefs, 'visitor');
  await StorageService.setUserData('searchRadius', 5000, 'visitor');
  await StorageService.setUserData('mapStyle', 'standard', 'visitor');
  
  console.log('✅ Données visiteur de test créées');
}

// Exécuter le test
testMigrationFlow(); 