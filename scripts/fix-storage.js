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
