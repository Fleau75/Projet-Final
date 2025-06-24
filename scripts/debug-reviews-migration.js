/**
 * Script de diagnostic pour la migration des avis
 * Pour comprendre pourquoi les avis ne s'affichent pas après migration
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { ReviewsService } from '../services/firebaseService.js';
import { AuthService } from '../services/authService.js';
import StorageService from '../services/storageService.js';

async function debugReviewsMigration() {
  console.log('🔍 === DIAGNOSTIC MIGRATION AVIS ===');
  
  try {
    // 1. Vérifier l'utilisateur actuel
    console.log('\n📱 1. UTILISATEUR ACTUEL');
    const currentUser = await AuthService.getCurrentUser();
    console.log('Current user:', currentUser);
    
    // 2. Vérifier les données visiteur
    console.log('\n👤 2. DONNÉES VISITEUR');
    const visitorData = await StorageService.getAllUserData('visitor');
    console.log('Données visiteur:', Object.keys(visitorData));
    console.log('Nombre de clés visiteur:', Object.keys(visitorData).length);
    
    // 3. Vérifier les avis visiteur dans Firebase
    console.log('\n📝 3. AVIS VISITEUR DANS FIREBASE');
    try {
      const visitorReviews = await ReviewsService.getReviewsByUserId('visitor');
      console.log('Avis visiteur trouvés:', visitorReviews.length);
      if (visitorReviews.length > 0) {
        console.log('Premier avis visiteur:', {
          id: visitorReviews[0].id,
          placeName: visitorReviews[0].placeName,
          userEmail: visitorReviews[0].userEmail,
          addedBy: visitorReviews[0].addedBy
        });
      }
    } catch (error) {
      console.log('❌ Erreur récupération avis visiteur:', error.message);
    }
    
    // 4. Vérifier les avis de l'utilisateur actuel
    console.log('\n👤 4. AVIS UTILISATEUR ACTUEL');
    if (currentUser && currentUser.email) {
      try {
        const userReviews = await ReviewsService.getReviewsByUserId(currentUser.email);
        console.log('Avis utilisateur trouvés:', userReviews.length);
        if (userReviews.length > 0) {
          console.log('Premier avis utilisateur:', {
            id: userReviews[0].id,
            placeName: userReviews[0].placeName,
            userEmail: userReviews[0].userEmail,
            addedBy: userReviews[0].addedBy
          });
        }
      } catch (error) {
        console.log('❌ Erreur récupération avis utilisateur:', error.message);
      }
    }
    
    // 5. Vérifier les statistiques
    console.log('\n📊 5. STATISTIQUES');
    if (currentUser && currentUser.email) {
      const stats = await AuthService.getUserStatsByEmail(currentUser.email);
      console.log('Statistiques utilisateur:', stats);
      console.log('📊 Détail des statistiques:');
      console.log('  - reviewsAdded:', stats.reviewsAdded);
      console.log('  - placesAdded:', stats.placesAdded);
      console.log('  - Total (reviews + places):', (stats.reviewsAdded || 0) + (stats.placesAdded || 0));
      
      // Vérifier aussi le statut de vérification
      const verificationStatus = await AuthService.getUserVerificationStatus(currentUser.email);
      console.log('🔍 Statut de vérification:', verificationStatus);
      console.log('🔍 Critères de vérification:', verificationStatus.criteria);
    }
    
    // 6. Vérifier toutes les clés AsyncStorage
    console.log('\n💾 6. TOUTES LES CLÉS ASYNCSTORAGE');
    const allKeys = await AsyncStorage.getAllKeys();
    const userKeys = allKeys.filter(key => key.includes(currentUser?.email || ''));
    console.log('Clés utilisateur:', userKeys);
    
    // 7. Test de recherche directe par email
    console.log('\n🔍 7. RECHERCHE DIRECTE PAR EMAIL');
    if (currentUser && currentUser.email) {
      try {
        const userReviewsDirect = await ReviewsService.getReviewsByUserId(currentUser.email);
        console.log('Recherche directe par email:', userReviewsDirect.length, 'avis trouvés');
        if (userReviewsDirect.length > 0) {
          console.log('Premier avis (recherche directe):', {
            id: userReviewsDirect[0].id,
            placeName: userReviewsDirect[0].placeName,
            userEmail: userReviewsDirect[0].userEmail,
            addedBy: userReviewsDirect[0].addedBy
          });
        }
      } catch (error) {
        console.log('❌ Erreur recherche directe:', error.message);
      }
    }
    
    console.log('\n✅ === DIAGNOSTIC TERMINÉ ===');
    
  } catch (error) {
    console.error('❌ Erreur diagnostic:', error);
  }
}

// Exporter pour utilisation
export { debugReviewsMigration };

// Si exécuté directement
if (typeof window !== 'undefined') {
  // Dans React Native, on peut l'appeler depuis la console
  window.debugReviewsMigration = debugReviewsMigration;
  console.log('🔧 Script de diagnostic disponible: window.debugReviewsMigration()');
} 