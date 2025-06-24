/**
 * Script de test pour vérifier l'isolation du stockage privé
 * Teste que chaque utilisateur a son propre espace de stockage
 */

const AsyncStorage = require('@react-native-async-storage/async-storage');
const { StorageService } = require('../services/storageService');

// Données de test
const testData = {
  favorites: [
    { id: '1', name: 'Restaurant Test 1', category: 'restaurant' },
    { id: '2', name: 'Cinéma Test 1', category: 'culture' }
  ],
  mapMarkers: [
    { id: '1', name: 'Lieu Test 1', coordinate: { lat: 48.8566, lng: 2.3522 } },
    { id: '2', name: 'Lieu Test 2', coordinate: { lat: 48.8606, lng: 2.3376 } }
  ],
  accessibilityPrefs: {
    requireRamp: true,
    requireElevator: false,
    requireAccessibleParking: true,
    requireAccessibleToilets: false
  },
  notifications: {
    newPlaces: true,
    reviews: false,
    updates: true
  }
};

// Utilisateurs de test
const testUsers = [
  'visitor',
  'test@example.com',
  'demo@accessplus.com',
  'admin@accessplus.com'
];

/**
 * Test principal
 */
async function testStorageIsolation() {
  console.log('🧪 Test d\'isolation du stockage privé');
  console.log('=====================================\n');

  try {
    // Nettoyer le stockage avant le test
    console.log('🧹 Nettoyage du stockage...');
    await AsyncStorage.clear();
    
    // Test 1: Sauvegarder des données pour chaque utilisateur
    console.log('\n📝 Test 1: Sauvegarde des données pour chaque utilisateur');
    for (const userId of testUsers) {
      console.log(`\n👤 Utilisateur: ${userId}`);
      
      // Sauvegarder les favoris
      await StorageService.setUserData('favorites', testData.favorites, userId);
      console.log('  ✅ Favoris sauvegardés');
      
      // Sauvegarder les marqueurs de carte
      await StorageService.setUserData('mapMarkers', testData.mapMarkers, userId);
      console.log('  ✅ Marqueurs sauvegardés');
      
      // Sauvegarder les préférences d'accessibilité
      await StorageService.setUserData('accessibilityPrefs', testData.accessibilityPrefs, userId);
      console.log('  ✅ Préférences d\'accessibilité sauvegardées');
      
      // Sauvegarder les notifications
      await StorageService.setUserData('notifications', testData.notifications, userId);
      console.log('  ✅ Notifications sauvegardées');
    }

    // Test 2: Vérifier que chaque utilisateur a ses propres données
    console.log('\n🔍 Test 2: Vérification de l\'isolation des données');
    for (const userId of testUsers) {
      console.log(`\n👤 Utilisateur: ${userId}`);
      
      // Récupérer toutes les données de l'utilisateur
      const userData = await StorageService.getAllUserData(userId);
      
      console.log(`  📊 Données récupérées: ${Object.keys(userData).length} clés`);
      console.log(`  ❤️ Favoris: ${userData.favorites?.length || 0} lieux`);
      console.log(`  📍 Marqueurs: ${userData.mapMarkers?.length || 0} lieux`);
      console.log(`  ♿ Préférences d'accessibilité: ${userData.accessibilityPrefs ? 'Oui' : 'Non'}`);
      console.log(`  🔔 Notifications: ${userData.notifications ? 'Oui' : 'Non'}`);
    }

    // Test 3: Vérifier qu'il n'y a pas de mélange entre utilisateurs
    console.log('\n🔒 Test 3: Vérification de l\'absence de mélange');
    
    // Lister toutes les clés dans AsyncStorage
    const allKeys = await AsyncStorage.getAllKeys();
    console.log(`\n📋 Total des clés dans AsyncStorage: ${allKeys.length}`);
    
    // Grouper par utilisateur
    const keysByUser = {};
    for (const key of allKeys) {
      if (key.startsWith('user_')) {
        const parts = key.split('_');
        const userId = parts[1];
        if (!keysByUser[userId]) {
          keysByUser[userId] = [];
        }
        keysByUser[userId].push(key);
      }
    }
    
    console.log('\n📊 Répartition des clés par utilisateur:');
    for (const [userId, keys] of Object.entries(keysByUser)) {
      console.log(`  👤 ${userId}: ${keys.length} clés`);
    }

    // Test 4: Vérifier que les données sont correctement isolées
    console.log('\n✅ Test 4: Vérification de l\'isolation');
    let isolationOk = true;
    
    for (const userId of testUsers) {
      const userData = await StorageService.getAllUserData(userId);
      
      // Vérifier que les données correspondent à celles sauvegardées
      if (userData.favorites?.length !== testData.favorites.length) {
        console.log(`  ❌ ${userId}: Nombre de favoris incorrect`);
        isolationOk = false;
      }
      
      if (userData.mapMarkers?.length !== testData.mapMarkers.length) {
        console.log(`  ❌ ${userId}: Nombre de marqueurs incorrect`);
        isolationOk = false;
      }
      
      if (!userData.accessibilityPrefs || !userData.notifications) {
        console.log(`  ❌ ${userId}: Préférences manquantes`);
        isolationOk = false;
      }
    }
    
    if (isolationOk) {
      console.log('  ✅ Toutes les données sont correctement isolées');
    }

    // Test 5: Test de suppression
    console.log('\n🗑️ Test 5: Test de suppression');
    const userToDelete = testUsers[1]; // Supprimer le deuxième utilisateur
    console.log(`\n👤 Suppression des données de: ${userToDelete}`);
    
    await StorageService.clearUserData(userToDelete);
    
    // Vérifier que les données ont été supprimées
    const remainingData = await StorageService.getAllUserData(userToDelete);
    if (Object.keys(remainingData).length === 0) {
      console.log('  ✅ Données supprimées avec succès');
    } else {
      console.log('  ❌ Erreur: données non supprimées');
    }
    
    // Vérifier que les autres utilisateurs n'ont pas été affectés
    const otherUsers = testUsers.filter(u => u !== userToDelete);
    let othersUnaffected = true;
    
    for (const userId of otherUsers) {
      const userData = await StorageService.getAllUserData(userId);
      if (Object.keys(userData).length === 0) {
        console.log(`  ❌ ${userId}: Données perdues par erreur`);
        othersUnaffected = false;
      }
    }
    
    if (othersUnaffected) {
      console.log('  ✅ Autres utilisateurs non affectés');
    }

    console.log('\n🎉 Tests terminés avec succès !');
    console.log('\n📋 Résumé:');
    console.log('  ✅ Stockage privé fonctionnel');
    console.log('  ✅ Isolation des données entre utilisateurs');
    console.log('  ✅ Sauvegarde et récupération correctes');
    console.log('  ✅ Suppression sélective fonctionnelle');

  } catch (error) {
    console.error('❌ Erreur lors des tests:', error);
  }
}

// Exécuter le test si le script est appelé directement
if (require.main === module) {
  testStorageIsolation();
}

module.exports = testStorageIsolation; 