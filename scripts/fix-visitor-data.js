#!/usr/bin/env node

/**
 * Script pour injecter directement les données visiteur dans AsyncStorage
 * Ce script simule l'ajout de données dans le stockage de l'application
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 === INJECTION DONNÉES VISITEUR ===');

// Données visiteur complètes à injecter
const visitorData = {
  // Profil visiteur
  'userProfile': {
    uid: 'visitor_001',
    name: 'Visiteur AccessPlus',
    email: 'visiteur@accessplus.com',
    phone: '',
    joinDate: 'juin 2025',
    isVisitor: true,
    isVerified: false,
    avatar: null
  },
  
  // Favoris de test
  'favorites': [
    {
      id: 'place-1',
      name: 'Restaurant Le Marais',
      address: '35 rue des Archives, 75003 Paris',
      type: 'restaurant',
      rating: 4.5,
      reviewCount: 42,
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500',
      accessibility: {
        wheelchair: true,
        hearing: true,
        visual: false,
        cognitive: true
      },
      addedAt: new Date().toISOString()
    },
    {
      id: 'place-2', 
      name: 'Musée du Louvre',
      address: 'Rue de Rivoli, 75001 Paris',
      type: 'museum',
      rating: 4.8,
      reviewCount: 1250,
      image: 'https://images.unsplash.com/photo-1565967511849-76a60a516170?w=500',
      accessibility: {
        wheelchair: true,
        hearing: true,
        visual: true,
        cognitive: true
      },
      addedAt: new Date().toISOString()
    }
  ],
  
  // Marqueurs sur la carte
  'mapMarkers': [
    {
      id: 'marker-1',
      placeId: 'place-1',
      position: { latitude: 48.8566, longitude: 2.3522 },
      title: 'Restaurant Le Marais',
      description: 'Restaurant accessible',
      type: 'favorite'
    },
    {
      id: 'marker-2',
      placeId: 'place-2', 
      position: { latitude: 48.8606, longitude: 2.3376 },
      title: 'Musée du Louvre',
      description: 'Musée accessible',
      type: 'favorite'
    }
  ],
  
  // Préférences d'accessibilité
  'accessibilityPrefs': {
    requireRamp: true,
    requireElevator: true,
    requireAccessibleParking: true,
    requireAccessibleToilets: true
  },
  
  // Historique des visites
  'history': [
    {
      id: 'visit-1',
      placeId: 'place-1',
      placeName: 'Restaurant Le Marais',
      visitDate: new Date(Date.now() - 86400000).toISOString(), // Hier
      rating: 4,
      notes: 'Très bon restaurant, accessible en fauteuil roulant'
    },
    {
      id: 'visit-2',
      placeId: 'place-2',
      placeName: 'Musée du Louvre', 
      visitDate: new Date(Date.now() - 172800000).toISOString(), // Avant-hier
      rating: 5,
      notes: 'Excellente expérience, personnel très accueillant'
    }
  ],
  
  // Avis laissés
  'reviews': [
    {
      id: 'review-1',
      placeId: 'place-1',
      placeName: 'Restaurant Le Marais',
      rating: 4,
      comment: 'Excellent restaurant avec une bonne accessibilité. L\'entrée est de plain-pied et les toilettes sont adaptées.',
      date: new Date(Date.now() - 86400000).toISOString(),
      helpful: 3
    }
  ],
  
  // Paramètres utilisateur
  'userSettings': {
    theme: 'light',
    notifications: true,
    locationServices: true,
    textSize: 'medium',
    language: 'fr'
  }
};

async function injectVisitorData() {
  try {
    console.log('📦 Préparation des données visiteur...');
    
    // 1. Créer un fichier de données prêtes à injecter
    const dataFile = path.join(__dirname, 'visitor-data-injection.json');
    fs.writeFileSync(dataFile, JSON.stringify(visitorData, null, 2));
    
    console.log('✅ Données préparées');
    console.log(`📁 Fichier: ${dataFile}`);
    
    // 2. Créer un script d'injection pour l'application
    const injectionScript = `
// Script à exécuter dans l'application React Native
// Copier ce code dans la console de développement ou l'injecter via le debugger

import AsyncStorage from '@react-native-async-storage/async-storage';

const visitorData = ${JSON.stringify(visitorData, null, 2)};

async function injectVisitorData() {
  try {
    console.log('🔧 Injection des données visiteur...');
    
    // Injecter chaque type de données
    await AsyncStorage.setItem('userProfile', JSON.stringify(visitorData.userProfile));
    await AsyncStorage.setItem('favorites', JSON.stringify(visitorData.favorites));
    await AsyncStorage.setItem('mapMarkers', JSON.stringify(visitorData.mapMarkers));
    await AsyncStorage.setItem('accessibilityPrefs', JSON.stringify(visitorData.accessibilityPrefs));
    await AsyncStorage.setItem('history', JSON.stringify(visitorData.history));
    await AsyncStorage.setItem('reviews', JSON.stringify(visitorData.reviews));
    await AsyncStorage.setItem('userSettings', JSON.stringify(visitorData.userSettings));
    
    console.log('✅ Données visiteur injectées avec succès !');
    console.log('🔄 Redémarrez l\'application pour voir les changements');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'injection:', error);
  }
}

// Exécuter l'injection
injectVisitorData();
`;
    
    const injectionFile = path.join(__dirname, 'injection-code.js');
    fs.writeFileSync(injectionFile, injectionScript);
    
    console.log('✅ Code d\'injection créé');
    console.log(`📁 Fichier: ${injectionFile}`);
    
    // 3. Créer des instructions simples
    console.log('\n📋 === INSTRUCTIONS D\'INJECTION ===');
    console.log('1. Ouvrir l\'application AccessPlus');
    console.log('2. Ouvrir la console de développement (F12 ou Cmd+Option+I)');
    console.log('3. Copier le contenu du fichier injection-code.js');
    console.log('4. Coller et exécuter dans la console');
    console.log('5. Redémarrer l\'application');
    console.log('6. Se connecter en mode visiteur');
    
    console.log('\n💡 ALTERNATIVE SIMPLE:');
    console.log('1. Ouvrir l\'application');
    console.log('2. Aller dans les paramètres');
    console.log('3. Cliquer sur "Restaurer données visiteur"');
    console.log('4. Redémarrer l\'application');
    
    console.log('\n✅ Injection prête !');
    
  } catch (error) {
    console.error('❌ Erreur lors de la préparation:', error);
  }
}

// Fonction pour nettoyer les données visiteur existantes
async function cleanVisitorData() {
  try {
    console.log('🧹 Nettoyage des données visiteur existantes...');
    
    const cleanScript = `
// Script pour nettoyer et corriger les données visiteur existantes
import AsyncStorage from '@react-native-async-storage/async-storage';

async function cleanVisitorData() {
  try {
    console.log('🧹 Nettoyage des données visiteur...');
    
    // Supprimer les anciennes données
    await AsyncStorage.removeItem('accessibilityPrefs');
    await AsyncStorage.removeItem('user_visitor_accessibilityPrefs');
    
    // Injecter les nouvelles données avec le bon format
    const newAccessibilityPrefs = {
      requireRamp: false,
      requireElevator: false,
      requireAccessibleParking: false,
      requireAccessibleToilets: false
    };
    
    await AsyncStorage.setItem('accessibilityPrefs', JSON.stringify(newAccessibilityPrefs));
    await AsyncStorage.setItem('user_visitor_accessibilityPrefs', JSON.stringify(newAccessibilityPrefs));
    
    console.log('✅ Données visiteur nettoyées et corrigées !');
    console.log('🔄 Redémarrez l\'application pour voir les changements');
    
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
  }
}

// Exécuter le nettoyage
cleanVisitorData();
`;
    
    const cleanFile = path.join(__dirname, 'clean-visitor-data.js');
    fs.writeFileSync(cleanFile, cleanScript);
    
    console.log('✅ Script de nettoyage créé');
    console.log(`📁 Fichier: ${cleanFile}`);
    
    console.log('\n🧹 === INSTRUCTIONS DE NETTOYAGE ===');
    console.log('1. Ouvrir l\'application AccessPlus');
    console.log('2. Ouvrir la console de développement');
    console.log('3. Copier le contenu du fichier clean-visitor-data.js');
    console.log('4. Coller et exécuter dans la console');
    console.log('5. Redémarrer l\'application');
    
  } catch (error) {
    console.error('❌ Erreur lors de la création du script de nettoyage:', error);
  }
}

// Exécuter l'injection et le nettoyage
injectVisitorData();
cleanVisitorData(); 