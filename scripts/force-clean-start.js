/**
 * Script pour forcer un nettoyage complet au démarrage
 * Supprime toutes les données d'authentification pour forcer la page de connexion
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export const forceCleanStart = async () => {
  try {
    console.log('🧹 FORÇAGE DU NETTOYAGE COMPLET AU DÉMARRAGE...');
    
    // Supprimer TOUTES les données d'authentification
    const authKeys = [
      'userProfile',
      'isAuthenticated', 
      'currentUser',
      'userPassword'
    ];
    
    await AsyncStorage.multiRemove(authKeys);
    console.log('🗑️ Données d\'authentification supprimées');
    
    // Supprimer aussi tous les utilisateurs de test
    const allKeys = await AsyncStorage.getAllKeys();
    const testUserKeys = allKeys.filter(key => 
      key.startsWith('user_') && 
      (key.includes('test@') || key.includes('demo@') || key.includes('admin@') || key.includes('visiteur@'))
    );
    
    if (testUserKeys.length > 0) {
      await AsyncStorage.multiRemove(testUserKeys);
      console.log(`🗑️ ${testUserKeys.length} utilisateurs de test supprimés`);
    }
    
    // Vérifier que tout est bien supprimé
    const remainingAuth = await AsyncStorage.getItem('isAuthenticated');
    const remainingProfile = await AsyncStorage.getItem('userProfile');
    
    if (!remainingAuth && !remainingProfile) {
      console.log('✅ Nettoyage complet réussi - L\'utilisateur arrivera sur la page de connexion');
      return true;
    } else {
      console.log('⚠️ Données résiduelles détectées');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage forcé:', error);
    return false;
  }
};

// Fonction pour vérifier si le nettoyage est nécessaire
export const shouldForceCleanStart = async () => {
  try {
    const isAuth = await AsyncStorage.getItem('isAuthenticated');
    const userProfile = await AsyncStorage.getItem('userProfile');
    
    // Si il y a des données d'auth mais pas de profil valide, nettoyer
    if (isAuth === 'true' && (!userProfile || userProfile === 'null')) {
      console.log('🔍 Détection de données d\'auth corrompues - nettoyage nécessaire');
      return true;
    }
    
    // Si il y a un profil mais pas d'auth, nettoyer
    if (isAuth !== 'true' && userProfile) {
      console.log('🔍 Détection de profil sans auth - nettoyage nécessaire');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
    return true; // En cas d'erreur, on nettoie par précaution
  }
}; 