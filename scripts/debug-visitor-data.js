#!/usr/bin/env node

/**
 * Script de diagnostic pour vérifier l'état des données visiteur
 * Pour comprendre pourquoi la migration ne fonctionne plus après les tests
 */

const AsyncStorage = require('@react-native-async-storage/async-storage');

async function debugVisitorData() {
  console.log('🔍 === DIAGNOSTIC DONNÉES VISITEUR ===');
  
  try {
    // 1. Vérifier toutes les clés AsyncStorage
    console.log('\n📋 1. TOUTES LES CLÉS ASYNCSTORAGE');
    const allKeys = await AsyncStorage.getAllKeys();
    console.log(`Nombre total de clés: ${allKeys.length}`);
    
    // Filtrer les clés visiteur
    const visitorKeys = allKeys.filter(key => key.includes('visitor') || key.includes('visiteur'));
    console.log(`Clés visiteur trouvées: ${visitorKeys.length}`);
    
    if (visitorKeys.length > 0) {
      console.log('Clés visiteur:');
      visitorKeys.forEach(key => console.log(`  - ${key}`));
    }
    
    // 2. Vérifier les données globales du visiteur
    console.log('\n👤 2. DONNÉES GLOBALES VISITEUR');
    const globalVisitorKeys = [
      'userProfile',
      'isAuthenticated',
      'currentUser',
      'userPassword',
      'favorites',
      'mapMarkers',
      'accessibilityPrefs',
      'notifications',
      'searchRadius',
      'mapStyle',
      'biometricPreferences',
      'pushToken',
      'history',
      'settings'
    ];
    
    for (const key of globalVisitorKeys) {
      const value = await AsyncStorage.getItem(key);
      if (value !== null) {
        console.log(`  ✅ ${key}: Données présentes`);
        try {
          const parsed = JSON.parse(value);
          if (Array.isArray(parsed)) {
            console.log(`    📊 ${parsed.length} éléments`);
          } else if (typeof parsed === 'object') {
            console.log(`    📊 Objet avec ${Object.keys(parsed).length} propriétés`);
          }
        } catch (e) {
          console.log(`    📊 Données brutes: ${value.substring(0, 50)}...`);
        }
      } else {
        console.log(`  ❌ ${key}: Aucune donnée`);
      }
    }
    
    // 3. Vérifier les données privées du visiteur
    console.log('\n🔒 3. DONNÉES PRIVÉES VISITEUR');
    const privateVisitorKeys = allKeys.filter(key => key.startsWith('user_visitor_'));
    console.log(`Clés privées visiteur: ${privateVisitorKeys.length}`);
    
    if (privateVisitorKeys.length > 0) {
      for (const key of privateVisitorKeys) {
        const value = await AsyncStorage.getItem(key);
        if (value !== null) {
          console.log(`  ✅ ${key}: Données présentes`);
          try {
            const parsed = JSON.parse(value);
            if (Array.isArray(parsed)) {
              console.log(`    📊 ${parsed.length} éléments`);
            } else if (typeof parsed === 'object') {
              console.log(`    📊 Objet avec ${Object.keys(parsed).length} propriétés`);
            }
          } catch (e) {
            console.log(`    📊 Données brutes: ${value.substring(0, 50)}...`);
          }
        }
      }
    }
    
    // 4. Vérifier les utilisateurs de test
    console.log('\n🧪 4. UTILISATEURS DE TEST');
    const testUserKeys = allKeys.filter(key => key.includes('test@example.com') || key.includes('demo@accessplus.com'));
    console.log(`Utilisateurs de test trouvés: ${testUserKeys.length}`);
    
    if (testUserKeys.length > 0) {
      testUserKeys.forEach(key => console.log(`  - ${key}`));
    }
    
    // 5. Vérifier l'état d'authentification actuel
    console.log('\n🔐 5. ÉTAT AUTHENTIFICATION ACTUEL');
    const isAuth = await AsyncStorage.getItem('isAuthenticated');
    const userProfile = await AsyncStorage.getItem('userProfile');
    const currentUser = await AsyncStorage.getItem('currentUser');
    
    console.log(`isAuthenticated: ${isAuth}`);
    console.log(`userProfile: ${userProfile ? 'Présent' : 'Absent'}`);
    console.log(`currentUser: ${currentUser ? 'Présent' : 'Absent'}`);
    
    if (userProfile) {
      try {
        const profile = JSON.parse(userProfile);
        console.log(`Profil utilisateur:`, {
          email: profile.email,
          name: profile.name,
          isVisitor: profile.isVisitor
        });
      } catch (e) {
        console.log('Erreur parsing profil:', e.message);
      }
    }
    
    // 6. Résumé et recommandations
    console.log('\n📊 === RÉSUMÉ ===');
    console.log(`📝 Clés totales: ${allKeys.length}`);
    console.log(`👤 Clés visiteur: ${visitorKeys.length}`);
    console.log(`🔒 Clés privées visiteur: ${privateVisitorKeys.length}`);
    console.log(`🧪 Utilisateurs de test: ${testUserKeys.length}`);
    
    if (visitorKeys.length === 0 && privateVisitorKeys.length === 0) {
      console.log('\n❌ PROBLÈME DÉTECTÉ: Aucune donnée visiteur trouvée');
      console.log('🔧 CAUSE PROBABLE: Les tests ont nettoyé les données visiteur');
      console.log('💡 SOLUTION: Recréer les données visiteur ou restaurer depuis une sauvegarde');
    } else {
      console.log('\n✅ Données visiteur présentes');
      console.log('🔧 La migration devrait fonctionner normalement');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error);
  }
}

// Exécuter le diagnostic
debugVisitorData(); 