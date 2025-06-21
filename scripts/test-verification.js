#!/usr/bin/env node

/**
 * Script de test pour le système de badges vérifiés
 * Teste le système basé sur 3 avis minimum pour obtenir le badge
 */

const AsyncStorage = require('@react-native-async-storage/async-storage').default;

// Simuler AsyncStorage pour Node.js
if (typeof AsyncStorage === 'undefined') {
  console.log('⚠️ AsyncStorage non disponible, utilisation de la simulation...');
  global.AsyncStorage = {
    getItem: async (key) => {
      console.log(`📖 Lecture: ${key}`);
      return null;
    },
    setItem: async (key, value) => {
      console.log(`💾 Sauvegarde: ${key} = ${value}`);
    },
    removeItem: async (key) => {
      console.log(`🗑️ Suppression: ${key}`);
    }
  };
}

console.log('🏆 TEST DU SYSTÈME DE BADGES VÉRIFIÉS\n');

// Simulation des fonctions AuthService
class MockAuthService {
  static async getUserStats(userId) {
    try {
      const statsKey = `userStats_${userId}`;
      const savedStats = await AsyncStorage.getItem(statsKey);
      
      if (savedStats) {
        return JSON.parse(savedStats);
      }
      
      // Statistiques par défaut
      const defaultStats = {
        placesAdded: 0,
        reviewsAdded: 0,
        isVisitor: false,
        joinDate: new Date().toISOString(),
        lastActivity: new Date().toISOString()
      };
      
      await AsyncStorage.setItem(statsKey, JSON.stringify(defaultStats));
      return defaultStats;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des stats:', error);
      return {
        placesAdded: 0,
        reviewsAdded: 0,
        isVisitor: false,
        joinDate: new Date().toISOString(),
        lastActivity: new Date().toISOString()
      };
    }
  }

  static async incrementReviewsAdded(userId) {
    try {
      const stats = await this.getUserStats(userId);
      stats.reviewsAdded += 1;
      stats.lastActivity = new Date().toISOString();
      
      const statsKey = `userStats_${userId}`;
      await AsyncStorage.setItem(statsKey, JSON.stringify(stats));
      
      console.log(`✅ Avis ajouté pour ${userId}, total: ${stats.reviewsAdded}`);
      return stats.reviewsAdded;
    } catch (error) {
      console.error('❌ Erreur lors de l\'incrémentation des avis:', error);
      return 0;
    }
  }

  static async checkVerificationStatus(userId) {
    try {
      const userStats = await this.getUserStats(userId);
      
      const hasAccount = !userStats.isVisitor;
      const hasEnoughReviews = userStats.reviewsAdded >= 3;
      
      const isVerified = hasAccount && hasEnoughReviews;
      
      console.log(`🔍 Vérification pour ${userId}:`);
      console.log(`  - Compte créé: ${hasAccount}`);
      console.log(`  - Avis suffisants (${userStats.reviewsAdded}/3): ${hasEnoughReviews}`);
      console.log(`  - Badge vérifié: ${isVerified ? '✅' : '❌'}`);
      
      return {
        isVerified,
        criteria: {
          hasAccount,
          hasEnoughReviews,
          reviewsAdded: userStats.reviewsAdded,
          requiredReviews: 3
        }
      };
    } catch (error) {
      console.error('❌ Erreur lors de la vérification du statut:', error);
      return { isVerified: false, criteria: {} };
    }
  }
}

// Tests
async function runTests() {
  console.log('🧪 TESTS DU SYSTÈME DE BADGES\n');
  
  const testUsers = [
    { id: 'user1', name: 'Utilisateur Test 1', isVisitor: false },
    { id: 'user2', name: 'Utilisateur Test 2', isVisitor: false },
    { id: 'visitor1', name: 'Visiteur', isVisitor: true }
  ];

  for (const testUser of testUsers) {
    console.log(`\n👤 Test pour: ${testUser.name} (${testUser.isVisitor ? 'Visiteur' : 'Compte'})`);
    console.log('─'.repeat(50));
    
    // Initialiser les stats
    const initialStats = await MockAuthService.getUserStats(testUser.id);
    console.log(`📊 Stats initiales: ${initialStats.reviewsAdded} avis`);
    
    // Vérifier le statut initial
    const initialStatus = await MockAuthService.checkVerificationStatus(testUser.id);
    
    // Simuler l'ajout d'avis
    for (let i = 1; i <= 5; i++) {
      console.log(`\n📝 Ajout de l'avis #${i}...`);
      await MockAuthService.incrementReviewsAdded(testUser.id);
      
      const status = await MockAuthService.checkVerificationStatus(testUser.id);
      
      if (status.isVerified && !initialStatus.isVerified) {
        console.log(`🎉 BADGE OBTENU après ${i} avis !`);
      }
    }
    
    // Statut final
    const finalStatus = await MockAuthService.checkVerificationStatus(testUser.id);
    console.log(`\n🏁 Statut final: ${finalStatus.isVerified ? '✅ Vérifié' : '❌ Non vérifié'}`);
  }
  
  console.log('\n✅ Tests terminés !');
}

// Exécuter les tests
runTests().catch(console.error); 