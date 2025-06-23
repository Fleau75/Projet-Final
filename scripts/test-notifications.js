/**
 * Script de test pour les notifications
 * Teste toutes les fonctionnalités du service de notifications
 */

const NotificationService = require('../services/notificationService');

async function testNotifications() {
  console.log('🔔 Test du service de notifications...\n');

  try {
    // Test 1: Initialisation
    console.log('1️⃣ Test d\'initialisation...');
    const initialized = await NotificationService.initialize();
    console.log(`   ${initialized ? '✅' : '❌'} Initialisation: ${initialized ? 'Réussie' : 'Échouée'}\n`);

    // Test 2: Vérification des permissions
    console.log('2️⃣ Test des permissions...');
    const isEnabled = await NotificationService.isEnabled();
    console.log(`   ${isEnabled ? '✅' : '❌'} Permissions: ${isEnabled ? 'Accordées' : 'Refusées'}\n`);

    // Test 3: Récupération des préférences
    console.log('3️⃣ Test des préférences...');
    const prefs = await NotificationService.getNotificationPreferences();
    console.log('   📋 Préférences actuelles:');
    console.log(`      - Nouveaux lieux: ${prefs.newPlaces ? '✅' : '❌'}`);
    console.log(`      - Nouveaux avis: ${prefs.reviews ? '✅' : '❌'}`);
    console.log(`      - Mises à jour: ${prefs.updates ? '✅' : '❌'}\n`);

    // Test 4: Notification locale simple
    console.log('4️⃣ Test notification locale...');
    const localResult = await NotificationService.sendLocalNotification(
      'Test AccessPlus',
      'Ceci est un test de notification locale'
    );
    console.log(`   ${localResult ? '✅' : '❌'} Notification locale: ${localResult ? 'Envoyée' : 'Échouée'}\n`);

    // Test 5: Notification nouveau lieu
    console.log('5️⃣ Test notification nouveau lieu...');
    const newPlaceResult = await NotificationService.notifyNewPlace('Restaurant Test', '250');
    console.log(`   ${newPlaceResult ? '✅' : '❌'} Notification nouveau lieu: ${newPlaceResult ? 'Envoyée' : 'Échouée'}\n`);

    // Test 6: Notification nouvel avis
    console.log('6️⃣ Test notification nouvel avis...');
    const newReviewResult = await NotificationService.notifyNewReview('Musée Test', 5);
    console.log(`   ${newReviewResult ? '✅' : '❌'} Notification nouvel avis: ${newReviewResult ? 'Envoyée' : 'Échouée'}\n`);

    // Test 7: Notification mise à jour
    console.log('7️⃣ Test notification mise à jour...');
    const updateResult = await NotificationService.notifyAppUpdate('1.2.0', ['Nouvelles fonctionnalités']);
    console.log(`   ${updateResult ? '✅' : '❌'} Notification mise à jour: ${updateResult ? 'Envoyée' : 'Échouée'}\n`);

    // Test 8: Notification lieu proche
    console.log('8️⃣ Test notification lieu proche...');
    const nearbyResult = await NotificationService.notifyNearbyPlace('Café Test', '150', ['Rampe', 'Ascenseur']);
    console.log(`   ${nearbyResult ? '✅' : '❌'} Notification lieu proche: ${nearbyResult ? 'Envoyée' : 'Échouée'}\n`);

    // Test 9: Récupération du token
    console.log('9️⃣ Test récupération token...');
    const token = await NotificationService.getPushToken();
    console.log(`   ${token ? '✅' : '❌'} Token: ${token ? token.substring(0, 20) + '...' : 'Non disponible'}\n`);

    console.log('🎉 Tests terminés !');
    console.log('\n📝 Résumé:');
    console.log(`   - Initialisation: ${initialized ? '✅' : '❌'}`);
    console.log(`   - Permissions: ${isEnabled ? '✅' : '❌'}`);
    console.log(`   - Notifications locales: ${localResult ? '✅' : '❌'}`);
    console.log(`   - Notifications spécialisées: ${newPlaceResult && newReviewResult && updateResult && nearbyResult ? '✅' : '❌'}`);

  } catch (error) {
    console.error('❌ Erreur lors des tests:', error);
  }
}

// Exécuter les tests si le script est appelé directement
if (require.main === module) {
  testNotifications();
}

module.exports = { testNotifications }; 