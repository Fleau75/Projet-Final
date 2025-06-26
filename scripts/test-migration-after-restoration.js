#!/usr/bin/env node

/**
 * Script de test pour vérifier que la migration fonctionne après restauration
 */

const fs = require('fs');
const path = require('path');

async function testMigrationAfterRestoration() {
  console.log('🧪 === TEST MIGRATION APRÈS RESTAURATION ===');
  
  try {
    // 1. Vérifier que les données de restauration sont présentes
    const restorationFile = path.join(__dirname, 'visitor-data-restoration.json');
    if (!fs.existsSync(restorationFile)) {
      console.log('❌ Fichier de restauration non trouvé');
      return;
    }
    
    const restorationData = JSON.parse(fs.readFileSync(restorationFile, 'utf8'));
    console.log('✅ Données de restauration trouvées');
    
    // 2. Afficher les données disponibles
    console.log('\n📋 DONNÉES DISPONIBLES:');
    console.log(`  👤 Profil: ${restorationData.userProfile.name}`);
    console.log(`  ❤️ Favoris: ${restorationData.favorites.length} lieux`);
    console.log(`  📍 Marqueurs: ${restorationData.mapMarkers.length} points`);
    console.log(`  ♿ Accessibilité: ${Object.keys(restorationData.accessibilityPrefs).length} critères`);
    console.log(`  📖 Historique: ${restorationData.history.length} visites`);
    
    // 3. Instructions pour tester
    console.log('\n🔧 INSTRUCTIONS DE TEST:');
    console.log('1. Ouvrir l\'application AccessPlus');
    console.log('2. Se connecter en mode visiteur');
    console.log('3. Vérifier que les données sont présentes');
    console.log('4. Créer un nouveau compte avec migration');
    console.log('5. Vérifier que les données sont migrées');
    
    console.log('\n✅ Test de migration prêt !');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

testMigrationAfterRestoration();
