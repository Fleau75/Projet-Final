
// Script à exécuter dans l'application React Native
// Copier ce code dans la console de développement

import AsyncStorage from '@react-native-async-storage/async-storage';

async function checkAccessibilityFilters() {
  try {
    console.log('📊 1. Vérification des préférences d'accessibilité...');
    
    // Vérifier les préférences d'accessibilité
    const accessibilityPrefs = await AsyncStorage.getItem('accessibilityPrefs');
    console.log('🔧 Préférences d'accessibilité brutes:', accessibilityPrefs);
    
    if (accessibilityPrefs) {
      const prefs = JSON.parse(accessibilityPrefs);
      console.log('🔧 Préférences d'accessibilité parsées:', prefs);
      
      const hasActivePrefs = Object.values(prefs).some(pref => pref);
      console.log('🔧 Préférences actives:', hasActivePrefs);
      
      if (hasActivePrefs) {
        console.log('⚠️ ATTENTION: Des préférences d'accessibilité sont activées !');
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
      console.log('❌ Aucun marqueur trouvé pour l'utilisateur test');
    }
    
    console.log('\n📊 3. Solution recommandée...');
    console.log('💡 Pour corriger le problème d'affichage des marqueurs migrés:');
    console.log('   1. Désactiver temporairement les préférences d'accessibilité');
    console.log('   2. Ou mettre à jour les critères d'accessibilité des marqueurs migrés');
    console.log('   3. Ou ajouter une option "Afficher tous les marqueurs"');
    
  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error);
  }
}

// Exécuter le diagnostic
checkAccessibilityFilters();
