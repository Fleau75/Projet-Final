/**
 * Script pour créer des utilisateurs de test dans l'app
 * Ce script doit être exécuté dans l'environnement React Native
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export const createTestUsers = async () => {
  try {
    console.log('👥 Création des utilisateurs de test...');
    
    const testUsers = [
      {
        email: 'test@accessplus.com',
        password: 'test123',
        name: 'Utilisateur Test',
        uid: 'test_user_1',
        createdAt: new Date().toISOString()
      },
      {
        email: 'admin@accessplus.com',
        password: 'admin123',
        name: 'Administrateur',
        uid: 'admin_user_1',
        createdAt: new Date().toISOString()
      }
    ];
    
    for (const user of testUsers) {
      const testUserKey = `user_${user.email}`;
      await AsyncStorage.setItem(testUserKey, JSON.stringify(user));
      console.log(`✅ Utilisateur de test créé: ${user.email}`);
    }
    
    console.log('✅ Tous les utilisateurs de test ont été créés !');
    console.log('🎯 Vous pouvez maintenant vous connecter avec:');
    console.log('   - Email: test@accessplus.com');
    console.log('   - Mot de passe: test123');
    
    return true;
  } catch (error) {
    console.error('❌ Erreur lors de la création des utilisateurs de test:', error);
    return false;
  }
};

export const clearTestUsers = async () => {
  try {
    console.log('🧹 Suppression des utilisateurs de test...');
    
    const allKeys = await AsyncStorage.getAllKeys();
    const testUserKeys = allKeys.filter(key => key.startsWith('user_test@') || key.startsWith('user_admin@'));
    
    if (testUserKeys.length > 0) {
      await AsyncStorage.multiRemove(testUserKeys);
      console.log(`✅ ${testUserKeys.length} utilisateurs de test supprimés`);
    } else {
      console.log('ℹ️ Aucun utilisateur de test trouvé');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erreur lors de la suppression des utilisateurs de test:', error);
    return false;
  }
}; 