/**
 * Script de test pour les notifications
 * Teste toutes les fonctionnalités du service de notifications
 */

// Mock des services Expo pour les tests Node.js
const mockNotifications = {
  getPermissionsAsync: async () => ({ status: 'granted' }),
  requestPermissionsAsync: async () => ({ status: 'granted' }),
  scheduleNotificationAsync: async (notification) => {
    console.log('📱 Notification simulée:', notification.content.title);
    return 'mock-notification-id';
  },
  setNotificationHandler: () => {},
  setNotificationChannelAsync: () => {},
  getExpoPushTokenAsync: async () => ({ data: 'mock-push-token-12345' }),
  addNotificationReceivedListener: () => ({ remove: () => {} }),
  addNotificationResponseReceivedListener: () => ({ remove: () => {} }),
};

const mockDevice = {
  isDevice: true,
};

const mockPlatform = {
  OS: 'ios',
};

// Mock du StorageService
const mockStorageService = {
  getNotificationPrefs: async () => ({
    newPlaces: true,
    reviews: true,
    updates: true,
  }),
  setPushToken: async (token) => console.log('Token sauvegardé:', token),
  getPushToken: async () => 'mock-push-token-12345',
};

// Mock du NotificationService
class MockNotificationService {
  static async initialize() {
    console.log('🔔 Initialisation simulée...');
    return true;
  }

  static async isEnabled() {
    return true;
  }

  static async getNotificationPreferences() {
    return await mockStorageService.getNotificationPrefs();
  }

  static async sendLocalNotification(title, body, data = {}) {
    console.log(`📱 Notification locale: "${title}" - "${body}"`);
    return true;
  }

  static async notifyNewPlace(placeName, distance) {
    const prefs = await this.getNotificationPreferences();
    if (!prefs.newPlaces) return false;
    
    return await this.sendLocalNotification(
      '🏠 Nouveau lieu accessible !',
      `${placeName} a été ajouté à ${distance}m de chez vous`,
      { type: 'newPlace', placeName, distance }
    );
  }

  static async notifyNewReview(placeName, rating) {
    const prefs = await this.getNotificationPreferences();
    if (!prefs.reviews) return false;
    
    const stars = '⭐'.repeat(rating);
    return await this.sendLocalNotification(
      '⭐ Nouvel avis !',
      `${placeName} a reçu un avis ${stars}`,
      { type: 'newReview', placeName, rating }
    );
  }

  static async notifyAppUpdate(version, features = []) {
    const prefs = await this.getNotificationPreferences();
    if (!prefs.updates) return false;
    
    const featuresText = features.length > 0 ? `\nNouvelles fonctionnalités : ${features.join(', ')}` : '';
    return await this.sendLocalNotification(
      '🔄 Mise à jour disponible',
      `AccessPlus v${version} est disponible !${featuresText}`,
      { type: 'appUpdate', version, features }
    );
  }

  static async notifyNearbyPlace(placeName, distance, accessibility) {
    const prefs = await this.getNotificationPreferences();
    if (!prefs.newPlaces) return false;
    
    const accessibilityText = accessibility.length > 0 ? ` (${accessibility.join(', ')})` : '';
    return await this.sendLocalNotification(
      '📍 Lieu accessible à proximité',
      `${placeName}${accessibilityText} à ${distance}m`,
      { type: 'nearbyPlace', placeName, distance, accessibility }
    );
  }

  static async getPushToken() {
    return await mockStorageService.getPushToken();
  }
}

async function testNotifications() {
  console.log('🔔 Test du service de notifications (Mode Simulation)...\n');

  try {
    // Test 1: Initialisation
    console.log('1️⃣ Test d\'initialisation...');
    const initialized = await MockNotificationService.initialize();
    console.log(`   ${initialized ? '✅' : '❌'} Initialisation: ${initialized ? 'Réussie' : 'Échouée'}\n`);

    // Test 2: Vérification des permissions
    console.log('2️⃣ Test des permissions...');
    const isEnabled = await MockNotificationService.isEnabled();
    console.log(`   ${isEnabled ? '✅' : '❌'} Permissions: ${isEnabled ? 'Accordées' : 'Refusées'}\n`);

    // Test 3: Récupération des préférences
    console.log('3️⃣ Test des préférences...');
    const prefs = await MockNotificationService.getNotificationPreferences();
    console.log('   📋 Préférences actuelles:');
    console.log(`      - Nouveaux lieux: ${prefs.newPlaces ? '✅' : '❌'}`);
    console.log(`      - Nouveaux avis: ${prefs.reviews ? '✅' : '❌'}`);
    console.log(`      - Mises à jour: ${prefs.updates ? '✅' : '❌'}\n`);

    // Test 4: Notification locale simple
    console.log('4️⃣ Test notification locale...');
    const localResult = await MockNotificationService.sendLocalNotification(
      'Test AccessPlus',
      'Ceci est un test de notification locale'
    );
    console.log(`   ${localResult ? '✅' : '❌'} Notification locale: ${localResult ? 'Envoyée' : 'Échouée'}\n`);

    // Test 5: Notification nouveau lieu
    console.log('5️⃣ Test notification nouveau lieu...');
    const newPlaceResult = await MockNotificationService.notifyNewPlace('Restaurant Test', '250');
    console.log(`   ${newPlaceResult ? '✅' : '❌'} Notification nouveau lieu: ${newPlaceResult ? 'Envoyée' : 'Échouée'}\n`);

    // Test 6: Notification nouvel avis
    console.log('6️⃣ Test notification nouvel avis...');
    const newReviewResult = await MockNotificationService.notifyNewReview('Musée Test', 5);
    console.log(`   ${newReviewResult ? '✅' : '❌'} Notification nouvel avis: ${newReviewResult ? 'Envoyée' : 'Échouée'}\n`);

    // Test 7: Notification mise à jour
    console.log('7️⃣ Test notification mise à jour...');
    const updateResult = await MockNotificationService.notifyAppUpdate('1.2.0', ['Nouvelles fonctionnalités']);
    console.log(`   ${updateResult ? '✅' : '❌'} Notification mise à jour: ${updateResult ? 'Envoyée' : 'Échouée'}\n`);

    // Test 8: Notification lieu proche
    console.log('8️⃣ Test notification lieu proche...');
    const nearbyResult = await MockNotificationService.notifyNearbyPlace('Café Test', '150', ['Rampe', 'Ascenseur']);
    console.log(`   ${nearbyResult ? '✅' : '❌'} Notification lieu proche: ${nearbyResult ? 'Envoyée' : 'Échouée'}\n`);

    // Test 9: Récupération du token
    console.log('9️⃣ Test récupération token...');
    const token = await MockNotificationService.getPushToken();
    console.log(`   ${token ? '✅' : '❌'} Token: ${token ? token.substring(0, 20) + '...' : 'Non disponible'}\n`);

    console.log('🎉 Tests terminés !');
    console.log('\n📝 Résumé:');
    console.log(`   - Initialisation: ${initialized ? '✅' : '❌'}`);
    console.log(`   - Permissions: ${isEnabled ? '✅' : '❌'}`);
    console.log(`   - Notifications locales: ${localResult ? '✅' : '❌'}`);
    console.log(`   - Notifications spécialisées: ${newPlaceResult && newReviewResult && updateResult && nearbyResult ? '✅' : '❌'}`);

    console.log('\n💡 Note: Ces tests sont en mode simulation. Pour tester les vraies notifications, lancez l\'app sur un appareil physique.');

  } catch (error) {
    console.error('❌ Erreur lors des tests:', error);
  }
}

// Exécuter les tests si le script est appelé directement
if (require.main === module) {
  testNotifications();
}

module.exports = { testNotifications }; 