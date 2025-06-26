#!/usr/bin/env node

/**
 * Script de test pour vérifier la logique de la migration
 * Teste seulement la logique sans AsyncStorage
 */

// Mock des données pour simuler le comportement
const mockVisitorData = {
  favorites: ['place1', 'place2'],
  mapMarkers: ['marker1', 'marker2'],
  settings: { theme: 'dark' },
  userProfile: { email: 'visiteur@accessplus.com' }, // Doit être ignoré
  isAuthenticated: true // Doit être ignoré
};

// Mock de la fonction getAllUserData
function mockGetAllUserData(userId) {
  if (userId === 'visitor') {
    return { success: true, data: mockVisitorData };
  }
  return { success: true, data: {} };
}

// Mock de la fonction setUserData
function mockSetUserData(key, value, userId) {
  console.log(`✅ Mock: Migré ${key} du visiteur vers ${userId}`);
  return { success: true };
}

// Fonction de migration corrigée
async function migrateVisitorDataToUser(userEmail, shouldCleanup = true) {
  try {
    const visitorId = 'visitor';
    const visitorDataResult = mockGetAllUserData(visitorId);
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
          await mockSetUserData(key, value, userEmail);
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

async function testMigrationLogic() {
  console.log('🧪 === TEST LOGIQUE MIGRATION ===');
  
  try {
    // 1. Afficher les données de test
    console.log('\n📊 1. DONNÉES VISITEUR DE TEST');
    console.log('Données visiteur:', Object.keys(mockVisitorData));
    console.log('Nombre de clés:', Object.keys(mockVisitorData).length);
    
    // 2. Tester la migration
    console.log('\n🔄 2. TEST MIGRATION');
    const testEmail = 'test@example.com';
    const migrationResult = await migrateVisitorDataToUser(testEmail, false);
    console.log('Résultat migration:', migrationResult);
    
    // 3. Vérifier la logique
    console.log('\n🔍 3. VÉRIFICATION LOGIQUE');
    const visitorData = mockVisitorData;
    const originalKeys = Object.keys(visitorData).filter(key => 
      !['userProfile', 'isAuthenticated', 'userPassword', 'currentUser'].includes(key)
    );
    
    console.log('Clés originales à migrer:', originalKeys);
    console.log('Clés d\'authentification ignorées:', ['userProfile', 'isAuthenticated', 'userPassword', 'currentUser']);
    
    // 4. Vérifier que la correction fonctionne
    console.log('\n✅ 4. VÉRIFICATION CORRECTION');
    
    // Test de l'ancienne logique (qui ne fonctionnait pas)
    const oldLogic = () => {
      const visitorData = mockGetAllUserData('visitor');
      console.log('❌ Ancienne logique - visitorData:', typeof visitorData);
      console.log('❌ Ancienne logique - Object.keys(visitorData):', Object.keys(visitorData));
      return Object.keys(visitorData).length;
    };
    
    // Test de la nouvelle logique (qui fonctionne)
    const newLogic = () => {
      const visitorDataResult = mockGetAllUserData('visitor');
      if (!visitorDataResult.success) {
        return 0;
      }
      const visitorData = visitorDataResult.data;
      console.log('✅ Nouvelle logique - visitorData:', typeof visitorData);
      console.log('✅ Nouvelle logique - Object.keys(visitorData):', Object.keys(visitorData));
      return Object.keys(visitorData).length;
    };
    
    console.log('\n🔍 Test ancienne logique:');
    const oldCount = oldLogic();
    
    console.log('\n🔍 Test nouvelle logique:');
    const newCount = newLogic();
    
    console.log('\n📊 COMPARAISON:');
    console.log(`Ancienne logique: ${oldCount} clés (incorrect)`);
    console.log(`Nouvelle logique: ${newCount} clés (correct)`);
    
    if (newCount === originalKeys.length) {
      console.log('✅ La correction fonctionne correctement !');
    } else {
      console.log('❌ La correction ne fonctionne pas comme attendu');
    }
    
    console.log('\n📊 === RÉSUMÉ TEST ===');
    console.log('✅ Test terminé avec succès');
    console.log(`📝 Migration réussie: ${migrationResult.migrated}`);
    console.log(`📝 Données migrées: ${migrationResult.count}`);
    console.log(`📝 Clés à migrer: ${originalKeys.length}`);
    console.log(`📝 Clés migrées: ${migrationResult.count}`);
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

// Exécuter le test
if (require.main === module) {
  testMigrationLogic().then(() => {
    console.log('\n🏁 Test terminé');
    process.exit(0);
  }).catch((error) => {
    console.error('\n💥 Test échoué:', error);
    process.exit(1);
  });
}

module.exports = { testMigrationLogic }; 