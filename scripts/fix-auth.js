/**
 * Script pour nettoyer l'état d'authentification
 * Utile pour forcer l'utilisateur à se reconnecter
 */

const AsyncStorage = require('@react-native-async-storage/async-storage');

async function fixAuth() {
  try {
    console.log('🔧 Début de la correction de l\'authentification...\n');
    
    // 1. Nettoyer complètement le stockage
    console.log('🧹 Nettoyage complet du stockage...');
    const allKeys = await AsyncStorage.getAllKeys();
    console.log(`📋 ${allKeys.length} clés trouvées`);
    
    if (allKeys.length > 0) {
      await AsyncStorage.multiRemove(allKeys);
      console.log('✅ Toutes les clés supprimées');
    }
    
    // 2. Recréer les utilisateurs de test
    console.log('\n👥 Recréation des utilisateurs de test...');
    
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
    
    // 3. Vérifier que tout est bien créé
    console.log('\n🔍 Vérification finale...');
    const finalKeys = await AsyncStorage.getAllKeys();
    console.log('📋 Clés finales:', finalKeys);
    
    for (const key of finalKeys) {
      const value = await AsyncStorage.getItem(key);
      console.log(`${key}:`, value);
    }
    
    console.log('\n✅ Correction terminée !');
    console.log('🎯 Vous pouvez maintenant tester la connexion avec:');
    console.log('   - Email: test@accessplus.com');
    console.log('   - Mot de passe: test123');
    
  } catch (error) {
    console.error('❌ Erreur lors de la correction:', error);
  }
}

fixAuth(); 