#!/usr/bin/env node

/**
 * Script pour restaurer les données visiteur perdues après les tests
 * Recrée les données de base pour que la migration fonctionne
 */

const fs = require('fs');
const path = require('path');

console.log('🔄 === RESTAURATION DONNÉES VISITEUR ===');

// Données visiteur de base à restaurer
const visitorData = {
  // Profil visiteur
  userProfile: {
    uid: 'visitor_001',
    name: 'Visiteur AccessPlus',
    email: 'visiteur@accessplus.com',
    phone: '',
    joinDate: 'juin 2025',
    isVisitor: true
  },
  
  // Favoris de test
  favorites: [
    {
      id: 'place-1',
      name: 'Restaurant Le Marais',
      address: '35 rue des Archives, 75003 Paris',
      type: 'restaurant',
      rating: 4.5,
      reviewCount: 42,
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop',
      coordinates: {
        latitude: 48.8627,
        longitude: 2.3578
      },
      accessibility: {
        ramp: true,
        elevator: true,
        parking: true,
        toilets: true,
      },
    },
    {
      id: 'place-2',
      name: 'Musée Carnavalet',
      address: '23 Rue de Sévigné, 75003 Paris',
      type: 'culture',
      rating: 4.8,
      reviewCount: 89,
      image: 'https://images.unsplash.com/photo-1566127992631-137a642a90f4?w=400&h=300&fit=crop',
      coordinates: {
        latitude: 48.8578,
        longitude: 2.3622
      },
      accessibility: {
        ramp: true,
        elevator: true,
        parking: true,
        toilets: true,
      },
    }
  ],
  
  // Marqueurs de carte
  mapMarkers: [
    {
      id: 'marker-1',
      title: 'Restaurant Test',
      description: 'Un excellent restaurant accessible',
      coordinate: {
        latitude: 48.8627,
        longitude: 2.3578
      },
      type: 'restaurant'
    },
    {
      id: 'marker-2',
      title: 'Musée Test',
      description: 'Un musée avec accès adapté',
      coordinate: {
        latitude: 48.8578,
        longitude: 2.3622
      },
      type: 'culture'
    }
  ],
  
  // Préférences d'accessibilité
  accessibilityPrefs: {
    requireRamp: true,
    requireElevator: false,
    requireAccessibleParking: true,
    requireAccessibleToilets: true
  },
  
  // Paramètres de recherche
  searchRadius: 800,
  mapStyle: 'standard',
  
  // Préférences de notifications
  notifications: {
    newPlaces: true,
    reviews: true,
    updates: false
  },
  
  // Historique de navigation
  history: [
    {
      id: 'place-1',
      name: 'Restaurant Le Marais',
      address: '35 rue des Archives, 75003 Paris',
      visitedAt: new Date().toISOString()
    },
    {
      id: 'place-2',
      name: 'Musée Carnavalet',
      address: '23 Rue de Sévigné, 75003 Paris',
      visitedAt: new Date().toISOString()
    }
  ],
  
  // Paramètres généraux
  settings: {
    theme: 'dark',
    textSize: 'medium',
    screenReader: false,
    biometricEnabled: false
  }
};

// Créer le fichier de restauration
const restorationFile = path.join(__dirname, 'visitor-data-restoration.json');
fs.writeFileSync(restorationFile, JSON.stringify(visitorData, null, 2));

console.log('✅ Données visiteur préparées pour restauration');
console.log(`📁 Fichier créé: ${restorationFile}`);

console.log('\n📋 DONNÉES PRÉPARÉES:');
console.log(`  👤 Profil visiteur: ${visitorData.userProfile.name}`);
console.log(`  ❤️ Favoris: ${visitorData.favorites.length} lieux`);
console.log(`  📍 Marqueurs: ${visitorData.mapMarkers.length} points`);
console.log(`  ♿ Préférences accessibilité: ${Object.keys(visitorData.accessibilityPrefs).length} critères`);
console.log(`  📖 Historique: ${visitorData.history.length} visites`);
console.log(`  ⚙️ Paramètres: ${Object.keys(visitorData.settings).length} options`);

console.log('\n🔧 INSTRUCTIONS DE RESTAURATION:');
console.log('1. Ouvrir l\'application AccessPlus');
console.log('2. Aller dans les Réglages');
console.log('3. Cliquer sur "Restaurer les données visiteur"');
console.log('4. Ou utiliser le script de restauration automatique');

console.log('\n💡 ALTERNATIVE - RESTAURATION AUTOMATIQUE:');
console.log('Exécuter: node scripts/apply-visitor-restoration.js');

console.log('\n✅ Restauration préparée avec succès !'); 