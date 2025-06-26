
// Script à exécuter dans l'application React Native
// Copier ce code dans la console de développement

import AsyncStorage from '@react-native-async-storage/async-storage';

async function fixAccessibilityPrefs() {
  try {
    console.log('🔧 Correction des préférences d'accessibilité...');
    
    // Nouvelles préférences avec le bon format
    const newAccessibilityPrefs = {
      requireRamp: false,
      requireElevator: false,
      requireAccessibleParking: false,
      requireAccessibleToilets: false
    };
    
    // Corriger les données globales
    await AsyncStorage.setItem('accessibilityPrefs', JSON.stringify(newAccessibilityPrefs));
    console.log('✅ Préférences globales corrigées');
    
    // Corriger les données privées du visiteur
    await AsyncStorage.setItem('user_visitor_accessibilityPrefs', JSON.stringify(newAccessibilityPrefs));
    console.log('✅ Préférences visiteur corrigées');
    
    // Vérifier les données
    const globalPrefs = await AsyncStorage.getItem('accessibilityPrefs');
    const visitorPrefs = await AsyncStorage.getItem('user_visitor_accessibilityPrefs');
    
    console.log('📊 Préférences globales:', JSON.parse(globalPrefs));
    console.log('📊 Préférences visiteur:', JSON.parse(visitorPrefs));
    
    console.log('✅ Correction terminée !');
    console.log('🔄 Redémarrez l'application pour voir les changements');
    
  } catch (error) {
    console.error('❌ Erreur lors de la correction:', error);
  }
}

// Exécuter la correction
fixAccessibilityPrefs();
