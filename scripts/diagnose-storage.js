#!/usr/bin/env node

/**
 * Script de diagnostic pour vérifier l'état des données AsyncStorage
 * Utilisé pour diagnostiquer les problèmes de statistiques et d'historique
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 DIAGNOSTIC - Vérification des données AccessPlus\n');

// Clés AsyncStorage importantes dans l'application
const STORAGE_KEYS = [
  'mapMarkers',           // Marqueurs de la carte (historique des lieux)
  'userProfile',          // Profil utilisateur
  'accessibilityPrefs',   // Préférences d'accessibilité  
  'theme_preference',     // Préférence de thème
  'searchRadius',         // Rayon de recherche
  'notifications',        // Paramètres de notifications
  'textSize',            // Taille du texte
  'screenReader'         // Paramètres lecteur d'écran
];

// Fonction pour diagnostiquer les services Firebase
function diagnosisFirebaseService() {
  console.log('📊 FIREBASE SERVICE:');
  
  const firebaseServicePath = path.join(__dirname, '..', 'services', 'firebaseService.js');
  if (fs.existsSync(firebaseServicePath)) {
    console.log('  ✅ firebaseService.js existe');
    
    const content = fs.readFileSync(firebaseServicePath, 'utf8');
    
    // Vérifier la configuration Firebase
    if (content.includes('apiKey:')) {
      console.log('  ✅ Configuration Firebase présente');
    } else {
      console.log('  ❌ Configuration Firebase manquante');
    }
    
    // Vérifier les services
    if (content.includes('ReviewsService')) {
      console.log('  ✅ ReviewsService défini');
    } else {
      console.log('  ❌ ReviewsService manquant');
    }
    
    if (content.includes('PlacesService')) {
      console.log('  ✅ PlacesService défini');
    } else {
      console.log('  ❌ PlacesService manquant');
    }
  } else {
    console.log('  ❌ firebaseService.js manquant');
  }
  console.log();
}

// Fonction pour diagnostiquer les écrans de statistiques
function diagnosisScreens() {
  console.log('📱 ÉCRANS DE STATISTIQUES:');
  
  const screens = [
    'ProfileScreen.js',
    'MyReviewsScreen.js', 
    'LocationHistoryScreen.js'
  ];
  
  screens.forEach(screenName => {
    const screenPath = path.join(__dirname, '..', 'screens', screenName);
    if (fs.existsSync(screenPath)) {
      console.log(`  ✅ ${screenName} existe`);
      
      const content = fs.readFileSync(screenPath, 'utf8');
      
      // Vérifier les fonctions de chargement
      if (content.includes('loadUserStats') || content.includes('loadProfile') || content.includes('loadMapPlaces')) {
        console.log(`    ✅ Fonction de chargement présente`);
      } else {
        console.log(`    ⚠️  Fonction de chargement non trouvée`);
      }
      
      // Vérifier useFocusEffect
      if (content.includes('useFocusEffect')) {
        console.log(`    ✅ Rafraîchissement automatique configuré`);
      } else {
        console.log(`    ❌ Rafraîchissement automatique manquant`);
      }
    } else {
      console.log(`  ❌ ${screenName} manquant`);
    }
  });
  console.log();
}

// Fonction pour diagnostiquer la navigation
function diagnosisNavigation() {
  console.log('🧭 NAVIGATION:');
  
  const appJsPath = path.join(__dirname, '..', 'App.js');
  if (fs.existsSync(appJsPath)) {
    const content = fs.readFileSync(appJsPath, 'utf8');
    
    const requiredScreens = [
      'MyReviews',
      'LocationHistory', 
      'Profile'
    ];
    
    requiredScreens.forEach(screen => {
      if (content.includes(screen)) {
        console.log(`  ✅ Route ${screen} configurée`);
      } else {
        console.log(`  ❌ Route ${screen} manquante`);
      }
    });
  }
  console.log();
}

// Fonction pour diagnostiquer les dépendances
function diagnosisDependencies() {
  console.log('📦 DÉPENDANCES:');
  
  const packageJsonPath = path.join(__dirname, '..', 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    const requiredDeps = [
      '@react-native-async-storage/async-storage',
      'firebase',
      '@react-navigation/native',
      '@react-navigation/bottom-tabs'
    ];
    
    requiredDeps.forEach(dep => {
      if (packageJson.dependencies[dep]) {
        console.log(`  ✅ ${dep}: ${packageJson.dependencies[dep]}`);
      } else {
        console.log(`  ❌ ${dep} manquant`);
      }
    });
  }
  console.log();
}

// Fonction pour créer un script de réparation
function generateFixScript() {
  console.log('🔧 GÉNÉRATION DU SCRIPT DE RÉPARATION:');
  
  const fixScript = `#!/usr/bin/env node

/**
 * Script de réparation pour les problèmes de statistiques et d'historique
 */

console.log('🔧 Réparation des données AccessPlus...\\n');

// Instructions de réparation manuelle
console.log('📋 ACTIONS À EFFECTUER:');
console.log('');
console.log('1. 🗑️  Vider le cache React Native:');
console.log('   npx react-native start --reset-cache');
console.log('');
console.log('2. 🔄 Redémarrer l\\'application complètement:');
console.log('   npx expo start -c');
console.log('');
console.log('3. 📱 Tester les écrans problématiques:');
console.log('   - Profil → Vérifier statistiques');
console.log('   - Mes Avis → Vérifier chargement');
console.log('   - Historique → Vérifier données');
console.log('');
console.log('4. 🧹 Si le problème persiste, vider AsyncStorage:');
console.log('   - Ouvrir l\\'app');
console.log('   - Aller dans Réglages');
console.log('   - Réinitialiser les données');
console.log('');
console.log('✅ Script de réparation terminé');
`;

  fs.writeFileSync(path.join(__dirname, 'fix-storage.js'), fixScript);
  console.log('  ✅ Script de réparation créé: scripts/fix-storage.js');
  console.log();
}

// Exécution du diagnostic
async function runDiagnosis() {
  console.log('🏥 DIAGNOSTIC ACCESSPLUS - Statistiques & Historique');
  console.log('=' .repeat(60));
  console.log();
  
  diagnosisFirebaseService();
  diagnosisScreens();
  diagnosisNavigation(); 
  diagnosisDependencies();
  generateFixScript();
  
  console.log('📋 RÉSUMÉ:');
  console.log('Les problèmes de statistiques/historique peuvent venir de:');
  console.log('  1. 🔥 Connexion Firebase interrompue');
  console.log('  2. 💾 Données AsyncStorage corrompues');
  console.log('  3. 🔄 Problème de synchronisation des écrans');
  console.log('  4. 🧭 Navigation incorrecte');
  console.log();
  console.log('🔧 Solution recommandée: Exécuter scripts/fix-storage.js');
  console.log();
}

runDiagnosis().catch(console.error); 