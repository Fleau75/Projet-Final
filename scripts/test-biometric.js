/**
 * Script de test pour l'authentification biométrique
 */

import { BiometricService } from '../services/biometricService.js';

const testBiometric = async () => {
  console.log('🔐 Test de l\'authentification biométrique\\n');

  try {
    // 1. Test de disponibilité
    console.log('1️⃣ Test de disponibilité de la biométrie');
    
    const isAvailable = await BiometricService.isBiometricAvailable();
    console.log(`   - Biométrie disponible: ${isAvailable}`);
    
    if (!isAvailable) {
      console.log('   - ⚠️  Biométrie non disponible sur cet appareil');
      console.log('   - Test terminé (fonctionnalité non supportée)');
      return;
    }

    // 2. Test des types supportés
    console.log('\\n2️⃣ Test des types d\'authentification supportés');
    
    const supportedTypes = await BiometricService.getSupportedTypes();
    console.log(`   - Types supportés: ${supportedTypes.names.join(', ')}`);
    console.log(`   - Nombre de types: ${supportedTypes.types.length}`);

    // 3. Test de sauvegarde des préférences
    console.log('\\n3️⃣ Test de sauvegarde des préférences');
    
    const testEmail = 'test@example.com';
    const saveResult = await BiometricService.saveBiometricPreferences(true, testEmail);
    console.log(`   - Sauvegarde réussie: ${saveResult}`);

    // 4. Test de chargement des préférences
    console.log('\\n4️⃣ Test de chargement des préférences');
    
    const prefs = await BiometricService.loadBiometricPreferences();
    console.log(`   - Préférences chargées:`, prefs);
    console.log(`   - Biométrie activée: ${prefs.enabled}`);
    console.log(`   - Email configuré: ${prefs.email}`);

    // 5. Test de vérification pour un utilisateur
    console.log('\\n5️⃣ Test de vérification pour un utilisateur');
    
    const isEnabledForUser = await BiometricService.isBiometricEnabledForUser(testEmail);
    console.log(`   - Activée pour ${testEmail}: ${isEnabledForUser}`);
    
    const isEnabledForOther = await BiometricService.isBiometricEnabledForUser('other@example.com');
    console.log(`   - Activée pour other@example.com: ${isEnabledForOther}`);

    // 6. Test d'authentification automatique
    console.log('\\n6️⃣ Test d\'authentification automatique');
    
    const autoAuthResult = await BiometricService.autoAuthenticateWithBiometrics(testEmail);
    console.log(`   - Résultat authentification automatique:`, autoAuthResult);
    
    if (autoAuthResult.success) {
      console.log('   - ✅ Authentification automatique réussie');
    } else {
      console.log(`   - ❌ Échec: ${autoAuthResult.reason}`);
    }

    // 7. Test de désactivation
    console.log('\\n7️⃣ Test de désactivation');
    
    const disableResult = await BiometricService.disableBiometrics();
    console.log(`   - Désactivation réussie: ${disableResult}`);
    
    const prefsAfterDisable = await BiometricService.loadBiometricPreferences();
    console.log(`   - Préférences après désactivation:`, prefsAfterDisable);

    // 8. Test des messages d'erreur
    console.log('\\n8️⃣ Test des messages d\'erreur');
    
    const errorMessages = [
      'UserCancel',
      'UserFallback', 
      'SystemCancel',
      'AuthenticationFailed',
      'PasscodeNotSet',
      'FingerprintScannerNotAvailable',
      'FingerprintScannerNotEnrolled',
      'FingerprintScannerLockout',
      'FingerprintScannerLockoutPermanent'
    ];
    
    errorMessages.forEach(error => {
      const message = BiometricService.getErrorMessage(error);
      console.log(`   - ${error}: "${message}"`);
    });

    console.log('\\n✅ Tests de l\'authentification biométrique terminés !');

  } catch (error) {
    console.error('❌ Erreur lors des tests biométriques:', error);
  }
};

// Exécuter les tests si le script est appelé directement
if (typeof window === 'undefined') {
  testBiometric();
}

export default testBiometric; 