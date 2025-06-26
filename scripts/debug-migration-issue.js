/**
 * Script de diagnostic pour comprendre le problème de migration
 * Pourquoi la migration ne fonctionne pas depuis l'écran d'accueil
 */

const AsyncStorage = require('@react-native-async-storage/async-storage').default;
import { AuthService } from '../services/authService.js';
import StorageService from '../services/storageService.js';

async function debugMigrationIssue() {
  console.log('🔍 === DIAGNOSTIC PROBLÈME MIGRATION ===');
  
  try {
    // 1. Vérifier l'état actuel
    console.log('\n📱 1. ÉTAT ACTUEL');
    const currentUser = await AuthService.getCurrentUser();
    console.log('Utilisateur actuel:', currentUser);
    
    const isVisitor = await AuthService.isCurrentUserVisitor();
    console.log('Est visiteur:', isVisitor);
    
    // 2. Vérifier les données visiteur
    console.log('\n👤 2. DONNÉES VISITEUR');
    const visitorData = await StorageService.getAllUserData('visitor');
    console.log('Données visiteur disponibles:', Object.keys(visitorData));
    console.log('Nombre de clés visiteur:', Object.keys(visitorData).length);
    
    if (Object.keys(visitorData).length > 0) {
      console.log('Détail des données visiteur:');
      for (const [key, value] of Object.entries(visitorData)) {
        if (Array.isArray(value)) {
          console.log(`  ${key}: ${value.length} éléments`);
        } else if (typeof value === 'object') {
          console.log(`  ${key}: objet avec ${Object.keys(value).length} propriétés`);
        } else {
          console.log(`  ${key}: ${value}`);
        }
      }
    }
    
    // 3. Simuler le processus d'inscription
    console.log('\n🧪 3. SIMULATION INSCRIPTION');
    const testEmail = 'test-migration@example.com';
    const testPassword = '123456';
    const testUserData = {
      email: testEmail,
      firstName: 'Test',
      lastName: 'Migration',
      phone: ''
    };
    
    console.log('Données de test:', testUserData);
    
    // 4. Vérifier si l'utilisateur existe déjà
    console.log('\n🔍 4. VÉRIFICATION UTILISATEUR EXISTANT');
    const testUserKey = `user_${testEmail}`;
    const existingTestUser = await AsyncStorage.getItem(testUserKey);
    const existingProfileKey = `user_${testEmail}_userProfile`;
    const existingProfile = await AsyncStorage.getItem(existingProfileKey);
    
    console.log('Utilisateur de test existant:', existingTestUser ? 'Oui' : 'Non');
    console.log('Profil normal existant:', existingProfile ? 'Oui' : 'Non');
    
    // 5. Nettoyer l'utilisateur de test s'il existe
    if (existingTestUser || existingProfile) {
      console.log('\n🧹 5. NETTOYAGE UTILISATEUR DE TEST');
      await AsyncStorage.removeItem(testUserKey);
      await AsyncStorage.removeItem(existingProfileKey);
      await AsyncStorage.removeItem(`user_${testEmail}_userPassword`);
      await AsyncStorage.removeItem(`user_${testEmail}_isAuthenticated`);
      await AsyncStorage.removeItem(`user_${testEmail}_currentUser`);
      console.log('✅ Utilisateur de test nettoyé');
    }
    
    // 6. Simuler la migration
    console.log('\n🔄 6. SIMULATION MIGRATION');
    const migrationResult = await StorageService.migrateVisitorDataToUser(testEmail);
    console.log('Résultat migration:', migrationResult);
    
    // 7. Vérifier les données migrées
    console.log('\n✅ 7. VÉRIFICATION DONNÉES MIGRÉES');
    const migratedData = await StorageService.getAllUserData(testEmail);
    console.log('Données migrées:', Object.keys(migratedData));
    console.log('Nombre de clés migrées:', Object.keys(migratedData).length);
    
    if (Object.keys(migratedData).length > 0) {
      console.log('Détail des données migrées:');
      for (const [key, value] of Object.entries(migratedData)) {
        if (Array.isArray(value)) {
          console.log(`  ${key}: ${value.length} éléments`);
        } else if (typeof value === 'object') {
          console.log(`  ${key}: objet avec ${Object.keys(value).length} propriétés`);
        } else {
          console.log(`  ${key}: ${value}`);
        }
      }
    }
    
    // 8. Nettoyer après le test
    console.log('\n🧹 8. NETTOYAGE FINAL');
    await StorageService.clearUserData(testEmail);
    console.log('✅ Données de test nettoyées');
    
    console.log('\n📊 === RÉSUMÉ ===');
    console.log('✅ Diagnostic terminé');
    console.log(`📝 Données visiteur trouvées: ${Object.keys(visitorData).length}`);
    console.log(`📝 Données migrées: ${Object.keys(migratedData).length}`);
    console.log(`📝 Migration réussie: ${migrationResult.migrated}`);
    
  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error);
  }
}

// Exécuter le diagnostic
debugMigrationIssue(); 

console.log('🔍 === DIAGNOSTIC MIGRATION ET AFFICHAGE ===');

async function diagnoseMigrationAndDisplay() {
  try {
    console.log('📊 1. Vérification des préférences d\'accessibilité...');
    
    // Vérifier les préférences d'accessibilité
    const accessibilityPrefs = await AsyncStorage.getItem('accessibilityPrefs');
    console.log('🔧 Préférences d\'accessibilité brutes:', accessibilityPrefs);
    
    if (accessibilityPrefs) {
      const prefs = JSON.parse(accessibilityPrefs);
      console.log('🔧 Préférences d\'accessibilité parsées:', prefs);
      
      const hasActivePrefs = Object.values(prefs).some(pref => pref);
      console.log('🔧 Préférences actives:', hasActivePrefs);
      
      if (hasActivePrefs) {
        console.log('⚠️ ATTENTION: Des préférences d\'accessibilité sont activées !');
        console.log('⚠️ Cela peut filtrer les marqueurs migrés qui ont tous les critères à false');
      }
    }
    
    console.log('\n📊 2. Vérification des marqueurs migrés...');
    
    // Vérifier les marqueurs de l'utilisateur test
    const testEmail = 'flo@gmail.com';
    const userMarkersKey = `user_${testEmail}_mapMarkers`;
    const userMarkers = await AsyncStorage.getItem(userMarkersKey);
    
    if (userMarkers) {
      const markers = JSON.parse(userMarkers);
      console.log(`📍 ${markers.length} marqueurs trouvés pour ${testEmail}`);
      
      markers.forEach((marker, index) => {
        console.log(`📍 Marqueur ${index + 1}: ${marker.name}`);
        console.log(`   🔧 Accessibilité:`, marker.accessibility);
        
        // Vérifier si ce marqueur passerait les filtres
        if (accessibilityPrefs) {
          const prefs = JSON.parse(accessibilityPrefs);
          const hasActivePrefs = Object.values(prefs).some(pref => pref);
          
          if (hasActivePrefs) {
            const accessibility = marker.accessibility || {};
            let wouldBeFiltered = false;
            
            if (prefs.requireRamp && !accessibility.ramp) {
              console.log(`   ❌ Filtré: pas de rampe`);
              wouldBeFiltered = true;
            }
            if (prefs.requireElevator && !accessibility.elevator) {
              console.log(`   ❌ Filtré: pas d'ascenseur`);
              wouldBeFiltered = true;
            }
            if (prefs.requireAccessibleParking && !accessibility.parking) {
              console.log(`   ❌ Filtré: pas de parking accessible`);
              wouldBeFiltered = true;
            }
            if (prefs.requireAccessibleToilets && !accessibility.toilets) {
              console.log(`   ❌ Filtré: pas de toilettes accessibles`);
              wouldBeFiltered = true;
            }
            
            if (!wouldBeFiltered) {
              console.log(`   ✅ Passerait les filtres d'accessibilité`);
            }
          } else {
            console.log(`   ✅ Aucune préférence active, marqueur visible`);
          }
        }
      });
    } else {
      console.log('❌ Aucun marqueur trouvé pour l\'utilisateur test');
    }
    
    console.log('\n📊 3. Solution recommandée...');
    console.log('💡 Pour corriger le problème d\'affichage des marqueurs migrés:');
    console.log('   1. Désactiver temporairement les préférences d\'accessibilité');
    console.log('   2. Ou mettre à jour les critères d\'accessibilité des marqueurs migrés');
    console.log('   3. Ou ajouter une option "Afficher tous les marqueurs"');
    
  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error);
  }
}

// Exécuter le diagnostic
diagnoseMigrationAndDisplay(); 