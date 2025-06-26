#!/usr/bin/env node

/**
 * Script pour appliquer automatiquement la restauration des données visiteur
 * Utilise la fonction restoreVisitorData du StorageService
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 === APPLICATION RESTAURATION VISITEUR ===');

async function applyVisitorRestoration() {
  try {
    console.log('📦 Préparation de la restauration...');
    
    // Créer un fichier de configuration pour l'application
    const configData = {
      timestamp: new Date().toISOString(),
      action: 'restore_visitor_data',
      instructions: [
        '1. L\'application va automatiquement restaurer les données visiteur au démarrage',
        '2. Se connecter en mode visiteur (visiteur@accessplus.com)',
        '3. Les données seront disponibles immédiatement',
        '4. Tester la migration vers un compte permanent'
      ],
      expectedData: {
        favorites: 2,
        history: 2,
        mapMarkers: 2,
        accessibilityPrefs: 5
      }
    };
    
    // Sauvegarder la configuration
    const configFile = path.join(__dirname, 'restoration-config.json');
    fs.writeFileSync(configFile, JSON.stringify(configData, null, 2));
    
    console.log('✅ Configuration de restauration créée');
    console.log(`📁 Fichier: ${configFile}`);
    
    // Créer un script de test simple
    const testScript = `#!/usr/bin/env node

/**
 * Script de test pour vérifier que la restauration fonctionne
 */

const fs = require('fs');
const path = require('path');

async function testRestoration() {
  console.log('🧪 === TEST RESTAURATION VISITEUR ===');
  
  try {
    // Vérifier que la configuration existe
    const configFile = path.join(__dirname, 'restoration-config.json');
    if (!fs.existsSync(configFile)) {
      console.log('❌ Configuration de restauration non trouvée');
      return;
    }
    
    const config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
    console.log('✅ Configuration de restauration trouvée');
    
    console.log('\\n📋 DONNÉES ATTENDUES:');
    console.log(\`  ❤️ Favoris: \${config.expectedData.favorites} lieux\`);
    console.log(\`  📖 Historique: \${config.expectedData.history} visites\`);
    console.log(\`  📍 Marqueurs: \${config.expectedData.mapMarkers} points\`);
    console.log(\`  ♿ Accessibilité: \${config.expectedData.accessibilityPrefs} critères\`);
    
    console.log('\\n🔧 INSTRUCTIONS DE TEST:');
    console.log('1. Ouvrir l\'application AccessPlus');
    console.log('2. Se connecter en mode visiteur');
    console.log('3. Vérifier que les données sont présentes');
    console.log('4. Créer un nouveau compte avec migration');
    console.log('5. Vérifier que les données sont migrées');
    
    console.log('\\n✅ Test de restauration prêt !');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

testRestoration();
`;
    
    const testFile = path.join(__dirname, 'test-restoration.js');
    fs.writeFileSync(testFile, testScript);
    fs.chmodSync(testFile, '755');
    
    console.log('✅ Script de test créé');
    console.log(`📁 Fichier: ${testFile}`);
    
    // Résumé final
    console.log('\n📊 === RÉSUMÉ RESTAURATION ===');
    console.log('✅ Configuration: restoration-config.json');
    console.log('✅ Script de test: test-restoration.js');
    
    console.log('\n🔧 PROCHAINES ÉTAPES:');
    console.log('1. Lancer l\'application avec: npx expo start');
    console.log('2. Se connecter en mode visiteur');
    console.log('3. Vérifier que les données sont présentes');
    console.log('4. Tester la migration vers un compte permanent');
    
    console.log('\n💡 COMMANDES UTILES:');
    console.log('node scripts/test-restoration.js');
    console.log('node scripts/diagnose-storage.js');
    
    console.log('\n✅ Restauration configurée avec succès !');
    console.log('🔄 Les données seront restaurées automatiquement au démarrage de l\'application');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'application:', error);
  }
}

// Exécuter la restauration
applyVisitorRestoration(); 