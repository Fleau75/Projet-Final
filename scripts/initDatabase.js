/**
 * Script pour initialiser la base de données Firestore avec des données d'exemple
 * 
 * Pour utiliser ce script:
 * 1. Assurez-vous d'avoir configuré Firebase dans services/firebaseService.js
 * 2. Exécutez: node scripts/initDatabase.js
 */

const path = require('path');

// Configuration pour Node.js - ajustez le chemin vers votre service
const PlacesService = require('../services/firebaseService').PlacesService;

async function initializeDatabaseWithSampleData() {
  console.log('🚀 Initialisation de la base de données avec des données d\'exemple...');
  
  try {
    await PlacesService.initializeWithSampleData();
    console.log('✅ Base de données initialisée avec succès !');
    console.log('📍 Les lieux suivants ont été ajoutés :');
    console.log(
      '  - Restaurant Le Marais\n' +
      '  - Musée Carnavalet\n' +
      '  - BHV Marais\n' +
      '  - Café Saint-Régis\n' +
      '  - Bibliothèque de l\'Arsenal\n' +
      '  - Place des Vosges'
    );
    
    console.log('\n🎉 Votre app peut maintenant afficher ces lieux depuis Firestore !');
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
    console.log('\n💡 Vérifiez que :');
    console.log('  - Votre configuration Firebase est correcte');
    console.log('  - Firestore est activé dans votre projet');
    console.log('  - Les règles de sécurité permettent l\'écriture');
  }
}

// Exécuter le script seulement si appelé directement
if (require.main === module) {
  initializeDatabaseWithSampleData();
}

module.exports = { initializeDatabaseWithSampleData }; 