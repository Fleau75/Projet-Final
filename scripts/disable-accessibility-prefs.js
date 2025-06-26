
// Script pour désactiver temporairement les préférences d'accessibilité
// Copier ce code dans la console de développement

import AsyncStorage from '@react-native-async-storage/async-storage';

async function disableAccessibilityPrefs() {
  try {
    console.log('🔧 Désactivation des préférences d'accessibilité...');
    
    const newPrefs = {
      requireRamp: false,
      requireElevator: false,
      requireAccessibleParking: false,
      requireAccessibleToilets: false
    };
    
    await AsyncStorage.setItem('accessibilityPrefs', JSON.stringify(newPrefs));
    console.log('✅ Préférences d'accessibilité désactivées');
    console.log('🔄 Redémarrez l'application pour voir les marqueurs migrés');
    
  } catch (error) {
    console.error('❌ Erreur lors de la désactivation:', error);
  }
}

// Exécuter la désactivation
disableAccessibilityPrefs();
