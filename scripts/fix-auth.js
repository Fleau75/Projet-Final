/**
 * Script pour nettoyer l'état d'authentification
 * Utile pour forcer l'utilisateur à se reconnecter
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export const clearAuthState = async () => {
  try {
    console.log('🧹 Nettoyage de l\'état d\'authentification...');
    
    // Supprimer toutes les données d'authentification
    await AsyncStorage.removeItem('userProfile');
    await AsyncStorage.removeItem('isAuthenticated');
    await AsyncStorage.removeItem('currentUser');
    await AsyncStorage.removeItem('userPassword');
    
    // Supprimer aussi les utilisateurs de test pour forcer une reconnexion propre
    const keys = await AsyncStorage.getAllKeys();
    const testUserKeys = keys.filter(key => key.startsWith('user_test@') || key.startsWith('user_demo@') || key.startsWith('user_admin@'));
    
    if (testUserKeys.length > 0) {
      await AsyncStorage.multiRemove(testUserKeys);
      console.log(`🗑️ Supprimé ${testUserKeys.length} utilisateurs de test`);
    }
    
    console.log('✅ État d\'authentification nettoyé avec succès');
    return true;
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
    return false;
  }
};

export const checkAuthState = async () => {
  try {
    console.log('🔍 Vérification de l\'état d\'authentification...');
    
    const isAuth = await AsyncStorage.getItem('isAuthenticated');
    const userProfile = await AsyncStorage.getItem('userProfile');
    const currentUser = await AsyncStorage.getItem('currentUser');
    
    console.log('📊 État actuel:');
    console.log('- isAuthenticated:', isAuth);
    console.log('- userProfile:', userProfile ? 'Présent' : 'Absent');
    console.log('- currentUser:', currentUser ? 'Présent' : 'Absent');
    
    if (userProfile) {
      const profile = JSON.parse(userProfile);
      console.log('- Email:', profile.email);
      console.log('- Nom:', profile.name);
      console.log('- Visiteur:', profile.isVisitor || false);
    }
    
    return {
      isAuthenticated: isAuth === 'true',
      hasProfile: !!userProfile,
      hasCurrentUser: !!currentUser
    };
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
    return null;
  }
}; 