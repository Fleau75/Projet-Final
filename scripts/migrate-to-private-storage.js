/**
 * Script de migration des données globales vers le stockage privé
 * Migre toutes les données existantes vers le système de stockage privé par utilisateur
 */

const AsyncStorage = require('@react-native-async-storage/async-storage');
const { StorageService } = require('../services/storageService');

// Clés globales à migrer
const GLOBAL_KEYS_TO_MIGRATE = [
  'favorites',
  'mapMarkers',
  'accessibilityPrefs',
  'notifications',
  'searchRadius',
  'mapStyle',
  'biometricPreferences',
  'pushToken'
];

/**
 * Migration principale
 */
async function migrateToPrivateStorage() {
  console.log('🔄 Migration vers le stockage privé');
  console.log('==================================\n');

  try {
    // Étape 1: Vérifier les données globales existantes
    console.log('📋 Étape 1: Vérification des données globales existantes');
    const existingGlobalData = {};
    
    for (const key of GLOBAL_KEYS_TO_MIGRATE) {
      const value = await AsyncStorage.getItem(key);
      if (value !== null) {
        existingGlobalData[key] = value;
        console.log(`  ✅ ${key}: Données trouvées`);
      } else {
        console.log(`  ⚪ ${key}: Aucune donnée`);
      }
    }

    if (Object.keys(existingGlobalData).length === 0) {
      console.log('\n📝 Aucune donnée globale à migrer');
      return;
    }

    // Étape 2: Identifier les utilisateurs existants
    console.log('\n👥 Étape 2: Identification des utilisateurs existants');
    const allKeys = await AsyncStorage.getAllKeys();
    const userKeys = allKeys.filter(key => key.startsWith('user_'));
    
    const existingUsers = new Set();
    for (const key of userKeys) {
      const parts = key.split('_');
      if (parts.length >= 2) {
        existingUsers.add(parts[1]);
      }
    }

    // Ajouter le visiteur par défaut
    existingUsers.add('visitor');

    console.log(`  📊 Utilisateurs identifiés: ${existingUsers.size}`);
    for (const user of existingUsers) {
      console.log(`    👤 ${user}`);
    }

    // Étape 3: Migrer les données pour chaque utilisateur
    console.log('\n💾 Étape 3: Migration des données par utilisateur');
    
    for (const userId of existingUsers) {
      console.log(`\n👤 Migration pour: ${userId}`);
      
      for (const [key, value] of Object.entries(existingGlobalData)) {
        try {
          // Essayer de parser la valeur comme JSON
          let parsedValue;
          try {
            parsedValue = JSON.parse(value);
          } catch {
            parsedValue = value; // Garder la valeur brute si ce n'est pas du JSON
          }
          
          await StorageService.setUserData(key, parsedValue, userId);
          console.log(`  ✅ ${key}: Migré`);
        } catch (error) {
          console.log(`  ❌ ${key}: Erreur - ${error.message}`);
        }
      }
    }

    // Étape 4: Vérification de la migration
    console.log('\n🔍 Étape 4: Vérification de la migration');
    
    for (const userId of existingUsers) {
      console.log(`\n👤 Vérification pour: ${userId}`);
      
      const userData = await StorageService.getAllUserData(userId);
      const migratedKeys = Object.keys(userData).filter(key => 
        GLOBAL_KEYS_TO_MIGRATE.includes(key)
      );
      
      console.log(`  📊 Clés migrées: ${migratedKeys.length}/${GLOBAL_KEYS_TO_MIGRATE.length}`);
      
      for (const key of GLOBAL_KEYS_TO_MIGRATE) {
        if (migratedKeys.includes(key)) {
          console.log(`    ✅ ${key}`);
        } else {
          console.log(`    ❌ ${key}: Manquant`);
        }
      }
    }

    // Étape 5: Sauvegarde des données globales (optionnel)
    console.log('\n💾 Étape 5: Sauvegarde des données globales originales');
    
    const backupData = {
      timestamp: new Date().toISOString(),
      globalData: existingGlobalData
    };
    
    await AsyncStorage.setItem('migration_backup', JSON.stringify(backupData));
    console.log('  ✅ Sauvegarde créée: migration_backup');

    // Étape 6: Nettoyage des données globales (optionnel)
    console.log('\n🧹 Étape 6: Nettoyage des données globales');
    
    const shouldCleanup = true; // Mettre à false pour conserver les données globales
    
    if (shouldCleanup) {
      for (const key of GLOBAL_KEYS_TO_MIGRATE) {
        await AsyncStorage.removeItem(key);
        console.log(`  🗑️ ${key}: Supprimé`);
      }
      console.log('  ✅ Nettoyage terminé');
    } else {
      console.log('  ⚠️ Nettoyage ignoré (données globales conservées)');
    }

    console.log('\n🎉 Migration terminée avec succès !');
    console.log('\n📋 Résumé:');
    console.log(`  👥 Utilisateurs traités: ${existingUsers.size}`);
    console.log(`  📊 Données migrées: ${Object.keys(existingGlobalData).length} types`);
    console.log(`  💾 Sauvegarde créée: migration_backup`);
    console.log(`  🧹 Nettoyage: ${shouldCleanup ? 'Effectué' : 'Ignoré'}`);

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    throw error;
  }
}

/**
 * Restaurer les données depuis la sauvegarde
 */
async function restoreFromBackup() {
  console.log('🔄 Restauration depuis la sauvegarde');
  console.log('===================================\n');

  try {
    const backupData = await AsyncStorage.getItem('migration_backup');
    if (!backupData) {
      console.log('❌ Aucune sauvegarde trouvée');
      return;
    }

    const backup = JSON.parse(backupData);
    console.log(`📅 Sauvegarde du: ${backup.timestamp}`);
    console.log(`📊 Données sauvegardées: ${Object.keys(backup.globalData).length} types`);

    // Restaurer les données globales
    for (const [key, value] of Object.entries(backup.globalData)) {
      await AsyncStorage.setItem(key, value);
      console.log(`  ✅ ${key}: Restauré`);
    }

    console.log('\n🎉 Restauration terminée !');

  } catch (error) {
    console.error('❌ Erreur lors de la restauration:', error);
  }
}

/**
 * Afficher l'état actuel du stockage
 */
async function showStorageStatus() {
  console.log('📊 État actuel du stockage');
  console.log('==========================\n');

  try {
    const allKeys = await AsyncStorage.getAllKeys();
    
    // Données globales
    const globalKeys = allKeys.filter(key => 
      GLOBAL_KEYS_TO_MIGRATE.includes(key) && !key.startsWith('user_')
    );
    
    // Données privées
    const privateKeys = allKeys.filter(key => key.startsWith('user_'));
    
    console.log(`📋 Total des clés: ${allKeys.length}`);
    console.log(`🌍 Données globales: ${globalKeys.length}`);
    console.log(`🔒 Données privées: ${privateKeys.length}`);

    if (globalKeys.length > 0) {
      console.log('\n🌍 Données globales:');
      for (const key of globalKeys) {
        console.log(`  📄 ${key}`);
      }
    }

    if (privateKeys.length > 0) {
      console.log('\n🔒 Données privées par utilisateur:');
      const users = {};
      for (const key of privateKeys) {
        const parts = key.split('_');
        const userId = parts[1];
        if (!users[userId]) {
          users[userId] = [];
        }
        users[userId].push(key);
      }
      
      for (const [userId, keys] of Object.entries(users)) {
        console.log(`  👤 ${userId}: ${keys.length} clés`);
      }
    }

  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
  }
}

// Exécuter la migration si le script est appelé directement
if (require.main === module) {
  const command = process.argv[2];
  
  switch (command) {
    case 'migrate':
      migrateToPrivateStorage();
      break;
    case 'restore':
      restoreFromBackup();
      break;
    case 'status':
      showStorageStatus();
      break;
    default:
      console.log('Usage:');
      console.log('  node migrate-to-private-storage.js migrate  # Migrer les données');
      console.log('  node migrate-to-private-storage.js restore  # Restaurer depuis la sauvegarde');
      console.log('  node migrate-to-private-storage.js status   # Afficher l\'état du stockage');
  }
}

module.exports = { migrateToPrivateStorage, restoreFromBackup, showStorageStatus }; 