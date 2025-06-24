/**
 * Script de test simple pour la migration des données visiteur
 * Teste directement la logique sans importer les services
 */

const AsyncStorage = require('@react-native-async-storage/async-storage');

async function simpleMigrationTest() {
  console.log('🧪 === TEST MIGRATION SIMPLE ===');
  
  try {
    // 1. Nettoyer
    console.log('\n🧹 1. NETTOYAGE');
    const allKeys = await AsyncStorage.getAllKeys();
    for (const key of allKeys) {
      await AsyncStorage.removeItem(key);
    }
    
    // 2. Créer des données visiteur de test
    console.log('\n👤 2. CRÉATION DONNÉES VISITEUR');
    const testFavorites = [
      { id: 'place1', name: 'Restaurant Test 1' },
      { id: 'place2', name: 'Musée Test 2' }
    ];
    
    const testMapMarkers = [
      { id: 'marker1', title: 'Marqueur 1' },
      { id: 'marker2', title: 'Marqueur 2' }
    ];
    
    // Sauvegarder avec le système de clés du StorageService
    await AsyncStorage.setItem('visitor_favorites', JSON.stringify(testFavorites));
    await AsyncStorage.setItem('visitor_mapMarkers', JSON.stringify(testMapMarkers));
    await AsyncStorage.setItem('visitor_searchRadius', '5000');
    await AsyncStorage.setItem('visitor_mapStyle', 'standard');
    
    console.log('✅ Données visiteur créées');
    
    // 3. Vérifier les données visiteur
    console.log('\n🔍 3. VÉRIFICATION DONNÉES VISITEUR');
    const allKeysAfter = await AsyncStorage.getAllKeys();
    const visitorKeys = allKeysAfter.filter(key => key.startsWith('visitor_'));
    console.log('Clés visiteur trouvées:', visitorKeys);
    
    for (const key of visitorKeys) {
      const value = await AsyncStorage.getItem(key);
      console.log(`  ${key}: ${value ? 'données présentes' : 'vide'}`);
    }
    
    // 4. Simuler la migration
    console.log('\n🔄 4. SIMULATION MIGRATION');
    const testEmail = 'test@example.com';
    
    // Copier les données du visiteur vers le nouvel utilisateur
    for (const key of visitorKeys) {
      const value = await AsyncStorage.getItem(key);
      if (value) {
        const newKey = key.replace('visitor_', `${testEmail}_`);
        await AsyncStorage.setItem(newKey, value);
        console.log(`✅ Migré ${key} -> ${newKey}`);
      }
    }
    
    // 5. Vérifier les données migrées
    console.log('\n✅ 5. VÉRIFICATION DONNÉES MIGRÉES');
    const allKeysFinal = await AsyncStorage.getAllKeys();
    const migratedKeys = allKeysFinal.filter(key => key.startsWith(`${testEmail}_`));
    console.log('Clés migrées trouvées:', migratedKeys);
    
    for (const key of migratedKeys) {
      const value = await AsyncStorage.getItem(key);
      console.log(`  ${key}: ${value ? 'données présentes' : 'vide'}`);
    }
    
    // 6. Comparer
    console.log('\n📊 6. COMPARAISON');
    console.log(`Données visiteur: ${visitorKeys.length} clés`);
    console.log(`Données migrées: ${migratedKeys.length} clés`);
    console.log(`Migration réussie: ${migratedKeys.length === visitorKeys.length ? 'Oui' : 'Non'}`);
    
    // 7. Nettoyer
    console.log('\n🧹 7. NETTOYAGE FINAL');
    const allKeysToClean = await AsyncStorage.getAllKeys();
    for (const key of allKeysToClean) {
      await AsyncStorage.removeItem(key);
    }
    
    console.log('\n📊 === RÉSUMÉ ===');
    console.log('✅ Test terminé avec succès');
    console.log(`📝 Données visiteur: ${visitorKeys.length}`);
    console.log(`📝 Données migrées: ${migratedKeys.length}`);
    console.log(`📝 Migration réussie: ${migratedKeys.length === visitorKeys.length}`);
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

// Exécuter le test
simpleMigrationTest(); 