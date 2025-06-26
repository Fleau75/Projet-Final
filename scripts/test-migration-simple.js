#!/usr/bin/env node

/**
 * Script de test simple pour vérifier la correction de la migration
 * Teste seulement la fonction getAllUserData et la migration
 */

const AsyncStorage = require('@react-native-async-storage/async-storage');

// Mock simple du StorageService pour le test
class StorageService {
  static getUserStorageKey(userId, key) {
    if (!userId) {
      throw new Error('userId est requis pour le stockage privé');
    }
    return `user_${userId}_${key}`;
  }

  static async setUserData(key, value, userId = null) {
    try {
      const currentUserId = userId || 'visitor';
      const storageKey = this.getUserStorageKey(currentUserId, key);
      const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
      await AsyncStorage.setItem(storageKey, serializedValue);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message || error.toString() };
    }
  }

  static async getAllUserData(userId) {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const userKeys = allKeys.filter(key => key.startsWith(`user_${userId}_`));
      const userData = {};
      for (const key of userKeys) {
        const dataKey = key.replace(`user_${userId}_`, '');
        const value = await AsyncStorage.getItem(key);
        try {
          userData[dataKey] = JSON.parse(value);
        } catch {
          userData[dataKey] = value;
        }
      }
      return { success: true, data: userData };
    } catch (error) {
      return { success: false, error: error.message || error.toString() };
    }
  }

  static async clearUserData(userId) {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const userKeys = allKeys.filter(key => key.startsWith(`user_${userId}_`));
      if (userKeys.length > 0) {
        await AsyncStorage.multiRemove(userKeys);
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message || error.toString() };
    }
  }

  static async migrateVisitorDataToUser(userEmail, shouldCleanup = true) {
    try {
      const visitorId = 'visitor';
      const visitorDataResult = await this.getAllUserData(visitorId);
      let migratedCount = 0;
      let reviewsMigrated = 0;
      
      console.log('🔄 Début de la migration des données visiteur vers:', userEmail);
      
      // Vérifier si getAllUserData a réussi
      if (!visitorDataResult.success) {
        console.error('❌ Erreur lors de la récupération des données visiteur:', visitorDataResult.error);
        return { migrated: false, error: visitorDataResult.error };
      }
      
      const visitorData = visitorDataResult.data;
      console.log('📊 Données visiteur trouvées:', Object.keys(visitorData));
      
      // Migration des données locales
      if (visitorData && Object.keys(visitorData).length > 0) {
        // Copier chaque clé du visiteur vers le nouvel utilisateur
        for (const [key, value] of Object.entries(visitorData)) {
          // Ne pas migrer les clés d'authentification
          if (!['userProfile', 'isAuthenticated', 'userPassword', 'currentUser'].includes(key)) {
            await this.setUserData(key, value, userEmail);
            console.log(`✅ Migré ${key} du visiteur vers ${userEmail}`);
            migratedCount++;
          } else {
            console.log(`⏭️ Ignoré ${key} (clé d'authentification)`);
          }
        }
      }

      const result = { 
        migrated: migratedCount > 0 || reviewsMigrated > 0, 
        count: migratedCount,
        reviewsMigrated: reviewsMigrated
      };
      
      console.log('📊 Résultat final de la migration:', result);
      return result;
      
    } catch (error) {
      console.error('❌ Erreur lors de la migration des données visiteur:', error);
      return { migrated: false, error: error.message };
    }
  }
}

async function testMigrationSimple() {
  console.log('🧪 === TEST MIGRATION SIMPLE ===');
  
  try {
    // 1. Nettoyer l'environnement
    console.log('\n🧹 1. NETTOYAGE ENVIRONNEMENT');
    await StorageService.clearUserData('visitor');
    await StorageService.clearUserData('test@example.com');
    
    // 2. Créer des données visiteur de test
    console.log('\n👤 2. CRÉATION DONNÉES VISITEUR DE TEST');
    await StorageService.setUserData('favorites', ['place1', 'place2'], 'visitor');
    await StorageService.setUserData('mapMarkers', ['marker1', 'marker2'], 'visitor');
    await StorageService.setUserData('settings', { theme: 'dark' }, 'visitor');
    
    // 3. Vérifier les données visiteur
    console.log('\n🔍 3. VÉRIFICATION DONNÉES VISITEUR');
    const visitorDataResult = await StorageService.getAllUserData('visitor');
    console.log('Résultat getAllUserData:', visitorDataResult);
    
    if (visitorDataResult.success) {
      const visitorData = visitorDataResult.data;
      console.log('Données visiteur créées:', Object.keys(visitorData));
      console.log('Nombre de clés:', Object.keys(visitorData).length);
      
      // Afficher le détail des données
      for (const [key, value] of Object.entries(visitorData)) {
        if (Array.isArray(value)) {
          console.log(`  ${key}: ${value.length} éléments`);
        } else if (typeof value === 'object') {
          console.log(`  ${key}: objet avec ${Object.keys(value).length} propriétés`);
        } else {
          console.log(`  ${key}: ${value}`);
        }
      }
    } else {
      console.error('❌ Erreur lors de la récupération des données visiteur:', visitorDataResult.error);
      return;
    }
    
    // 4. Tester la migration
    console.log('\n🔄 4. TEST MIGRATION');
    const testEmail = 'test@example.com';
    const migrationResult = await StorageService.migrateVisitorDataToUser(testEmail, false);
    console.log('Résultat migration:', migrationResult);
    
    // 5. Vérifier les données migrées
    console.log('\n✅ 5. VÉRIFICATION DONNÉES MIGRÉES');
    const migratedDataResult = await StorageService.getAllUserData(testEmail);
    console.log('Résultat getAllUserData migré:', migratedDataResult);
    
    if (migratedDataResult.success) {
      const migratedData = migratedDataResult.data;
      console.log('Données migrées:', Object.keys(migratedData));
      console.log('Nombre de clés migrées:', Object.keys(migratedData).length);
      
      // Comparer les données
      const visitorData = visitorDataResult.data;
      const originalKeys = Object.keys(visitorData).filter(key => 
        !['userProfile', 'isAuthenticated', 'userPassword', 'currentUser'].includes(key)
      );
      const migratedKeys = Object.keys(migratedData);
      
      console.log('\n🔍 6. VÉRIFICATION COMPLÉTUDE');
      console.log('Clés originales à migrer:', originalKeys);
      console.log('Clés migrées:', migratedKeys);
      
      const missingKeys = originalKeys.filter(key => !migratedKeys.includes(key));
      const extraKeys = migratedKeys.filter(key => !originalKeys.includes(key));
      
      if (missingKeys.length === 0 && extraKeys.length === 0) {
        console.log('✅ Toutes les données ont été migrées correctement !');
      } else {
        console.log('❌ Problème de migration:');
        if (missingKeys.length > 0) {
          console.log('  Clés manquantes:', missingKeys);
        }
        if (extraKeys.length > 0) {
          console.log('  Clés en trop:', extraKeys);
        }
      }
    } else {
      console.error('❌ Erreur lors de la récupération des données migrées:', migratedDataResult.error);
    }
    
    // 6. Nettoyer après le test
    console.log('\n🧹 6. NETTOYAGE FINAL');
    await StorageService.clearUserData('visitor');
    await StorageService.clearUserData(testEmail);
    
    console.log('\n📊 === RÉSUMÉ TEST ===');
    console.log('✅ Test terminé avec succès');
    console.log(`📝 Migration réussie: ${migrationResult.migrated}`);
    console.log(`📝 Données migrées: ${migrationResult.count}`);
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

// Exécuter le test
if (require.main === module) {
  testMigrationSimple().then(() => {
    console.log('\n🏁 Test terminé');
    process.exit(0);
  }).catch((error) => {
    console.error('\n💥 Test échoué:', error);
    process.exit(1);
  });
}

module.exports = { testMigrationSimple }; 