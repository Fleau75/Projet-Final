#!/usr/bin/env node

/**
 * Script de réparation pour les problèmes de statistiques et d'historique
 */

console.log('🔧 Réparation des données AccessPlus...\n');

// Instructions de réparation manuelle
console.log('📋 ACTIONS À EFFECTUER:');
console.log('');
console.log('1. 🗑️  Vider le cache React Native:');
console.log('   npx react-native start --reset-cache');
console.log('');
console.log('2. 🔄 Redémarrer l\'application complètement:');
console.log('   npx expo start -c');
console.log('');
console.log('3. 📱 Tester les écrans problématiques:');
console.log('   - Profil → Vérifier statistiques');
console.log('   - Mes Avis → Vérifier chargement');
console.log('   - Historique → Vérifier données');
console.log('');
console.log('4. 🧹 Si le problème persiste, vider AsyncStorage:');
console.log('   - Ouvrir l\'app');
console.log('   - Aller dans Réglages');
console.log('   - Réinitialiser les données');
console.log('');
console.log('✅ Script de réparation terminé');

const AsyncStorage = require('@react-native-async-storage/async-storage');

async function fixStorage() {
  try {
    console.log('🧹 Début du nettoyage du stockage...');
    
    // Récupérer toutes les clés
    const allKeys = await AsyncStorage.getAllKeys();
    console.log(`📋 ${allKeys.length} clés trouvées`);
    
    // Nettoyer les clés corrompues
    const keysToRemove = [];
    
    for (const key of allKeys) {
      try {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          // Essayer de parser comme JSON pour détecter les erreurs
          try {
            JSON.parse(value);
          } catch (parseError) {
            console.log(`❌ Clé corrompue détectée: ${key}`);
            keysToRemove.push(key);
          }
        }
      } catch (error) {
        console.log(`❌ Erreur avec la clé ${key}:`, error);
        keysToRemove.push(key);
      }
    }
    
    // Supprimer les clés corrompues
    if (keysToRemove.length > 0) {
      console.log(`🗑️ Suppression de ${keysToRemove.length} clés corrompues...`);
      await AsyncStorage.multiRemove(keysToRemove);
      console.log('✅ Clés corrompues supprimées');
    } else {
      console.log('✅ Aucune clé corrompue trouvée');
    }
    
    // Nettoyer spécifiquement les clés de visiteur
    const visitorKeys = allKeys.filter(key => key.includes('visitor'));
    if (visitorKeys.length > 0) {
      console.log(`🗑️ Suppression de ${visitorKeys.length} clés de visiteur...`);
      await AsyncStorage.multiRemove(visitorKeys);
      console.log('✅ Clés de visiteur supprimées');
    }
    
    console.log('✅ Nettoyage terminé');
    
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
  }
}

// Exécuter le script
fixStorage();
