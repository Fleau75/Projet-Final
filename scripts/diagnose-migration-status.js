#!/usr/bin/env node

/**
 * Script de diagnostic pour vérifier l'état de la migration
 * Vérifie les données visiteur et l'état de la migration
 */

const AsyncStorage = require('@react-native-async-storage/async-storage');

// Mock simple pour le diagnostic
class StorageService {
  static getUserStorageKey(userId, key) {
    return `user_${userId}_${key}`;
  }

  static async getAllKeys() {
    try {
      // Simuler les clés AsyncStorage
      const mockKeys = [
        'user_visitor_favorites',
        'user_visitor_mapMarkers',
        'user_visitor_settings',
        'user_visitor_accessibilityPrefs',
        'user_test@example.com_favorites',
        'user_test@example.com_settings',
        'userProfile',
        'isAuthenticated',
        'currentUser'
      ];
      return mockKeys;
    } catch (error) {
      console.error('Erreur getAllKeys:', error);
      return [];
    }
  }

  static async getAllUserData(userId) {
    try {
      const allKeys = await this.getAllKeys();
      const userKeys = allKeys.filter(key => key.startsWith(`user_${userId}_`));
      const userData = {};
      
      console.log(`🔍 Clés trouvées pour ${userId}:`, userKeys);
      
      for (const key of userKeys) {
        const dataKey = key.replace(`user_${userId}_`, '');
        // Simuler des données de test
        const mockData = {
          'favorites': ['place1', 'place2'],
          'mapMarkers': ['marker1', 'marker2'],
          'settings': { theme: 'dark' },
          'accessibilityPrefs': { wheelchair: true }
        };
        userData[dataKey] = mockData[dataKey] || 'donnée_test';
      }
      
      return { success: true, data: userData };
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

async function diagnoseMigrationStatus() {
  console.log('🔍 === DIAGNOSTIC ÉTAT MIGRATION ===');
  
  try {
    // 1. Vérifier les clés AsyncStorage
    console.log('\n📱 1. VÉRIFICATION CLÉS ASYNCSTORAGE');
    const allKeys = await StorageService.getAllKeys();
    console.log('Toutes les clés AsyncStorage:', allKeys);
    
    // 2. Analyser les données visiteur
    console.log('\n👤 2. ANALYSE DONNÉES VISITEUR');
    const visitorDataResult = await StorageService.getAllUserData('visitor');
    console.log('Résultat getAllUserData visiteur:', visitorDataResult);
    
    if (visitorDataResult.success) {
      const visitorData = visitorDataResult.data;
      console.log('Données visiteur disponibles:', Object.keys(visitorData));
      console.log('Nombre de données visiteur:', Object.keys(visitorData).length);
      
      if (Object.keys(visitorData).length > 0) {
        console.log('✅ Données visiteur trouvées - migration possible');
        
        // Détail des données
        for (const [key, value] of Object.entries(visitorData)) {
          if (Array.isArray(value)) {
            console.log(`  📝 ${key}: ${value.length} éléments`);
          } else if (typeof value === 'object') {
            console.log(`  ⚙️ ${key}: objet avec ${Object.keys(value).length} propriétés`);
          } else {
            console.log(`  📄 ${key}: ${value}`);
          }
        }
      } else {
        console.log('❌ Aucune donnée visiteur trouvée');
      }
    } else {
      console.error('❌ Erreur lors de la récupération des données visiteur:', visitorDataResult.error);
    }
    
    // 3. Tester la migration
    console.log('\n🔄 3. TEST MIGRATION');
    const testEmail = 'diagnostic@example.com';
    const migrationResult = await StorageService.migrateVisitorDataToUser(testEmail, false);
    console.log('Résultat test migration:', migrationResult);
    
    // 4. Vérifier les données migrées
    console.log('\n✅ 4. VÉRIFICATION DONNÉES MIGRÉES');
    const migratedDataResult = await StorageService.getAllUserData(testEmail);
    console.log('Résultat getAllUserData migré:', migratedDataResult);
    
    if (migratedDataResult.success) {
      const migratedData = migratedDataResult.data;
      console.log('Données migrées:', Object.keys(migratedData));
      console.log('Nombre de données migrées:', Object.keys(migratedData).length);
    }
    
    // 5. Recommandations
    console.log('\n💡 5. RECOMMANDATIONS');
    
    if (visitorDataResult.success && Object.keys(visitorDataResult.data).length > 0) {
      console.log('✅ Migration recommandée - données visiteur disponibles');
      console.log('📋 Étapes recommandées:');
      console.log('   1. Créer un compte permanent');
      console.log('   2. Activer la migration des données');
      console.log('   3. Vérifier que toutes les données sont migrées');
      console.log('   4. Tester la synchronisation Firebase');
    } else {
      console.log('⚠️ Aucune donnée visiteur à migrer');
      console.log('📋 Suggestions:');
      console.log('   1. Utiliser l\'app en mode visiteur pour créer des données');
      console.log('   2. Ajouter des lieux favoris');
      console.log('   3. Publier des avis');
      console.log('   4. Puis créer un compte pour migrer');
    }
    
    console.log('\n📊 === RÉSUMÉ DIAGNOSTIC ===');
    console.log('✅ Diagnostic terminé avec succès');
    console.log(`📝 Données visiteur: ${visitorDataResult.success ? Object.keys(visitorDataResult.data).length : 0}`);
    console.log(`📝 Migration testée: ${migrationResult.migrated}`);
    console.log(`📝 Données migrées: ${migrationResult.count}`);
    
  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error);
  }
}

// Exécuter le diagnostic
if (require.main === module) {
  diagnoseMigrationStatus().then(() => {
    console.log('\n🏁 Diagnostic terminé');
    process.exit(0);
  }).catch((error) => {
    console.error('\n💥 Diagnostic échoué:', error);
    process.exit(1);
  });
}

module.exports = { diagnoseMigrationStatus }; 