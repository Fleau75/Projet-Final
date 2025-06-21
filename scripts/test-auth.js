/**
 * Script de test pour vérifier le système d'authentification
 */

const AuthService = require('../services/authService').AuthService;

async function testAuthentication() {
  console.log('🧪 Test du système d\'authentification...\n');

  try {
    // 1. Vérifier l'état initial
    console.log('1️⃣ Vérification de l\'état initial...');
    const isAuth = await AuthService.isAuthenticated();
    console.log(`   - Utilisateur connecté: ${isAuth}`);
    
    const currentUser = await AuthService.getCurrentUser();
    console.log(`   - Utilisateur actuel: ${currentUser ? currentUser.name : 'Aucun'}\n`);

    // 2. Créer un compte de test
    console.log('2️⃣ Création d\'un compte de test...');
    const testUser = {
      firstName: 'Test',
      lastName: 'Utilisateur',
      email: 'test@example.com',
      phone: '0123456789'
    };

    const registerResult = await AuthService.register('test@example.com', '123456', testUser);
    console.log(`   - Inscription réussie: ${registerResult.success}`);
    console.log(`   - UID: ${registerResult.user.uid}\n`);

    // 3. Vérifier que l'utilisateur est connecté
    console.log('3️⃣ Vérification après inscription...');
    const isAuthAfterRegister = await AuthService.isAuthenticated();
    console.log(`   - Utilisateur connecté: ${isAuthAfterRegister}`);
    
    const userAfterRegister = await AuthService.getCurrentUser();
    console.log(`   - Utilisateur: ${userAfterRegister ? userAfterRegister.name : 'Aucun'}\n`);

    // 4. Se déconnecter
    console.log('4️⃣ Déconnexion...');
    await AuthService.logout();
    console.log('   - Déconnexion réussie\n');

    // 5. Vérifier l'état après déconnexion
    console.log('5️⃣ Vérification après déconnexion...');
    const isAuthAfterLogout = await AuthService.isAuthenticated();
    console.log(`   - Utilisateur connecté: ${isAuthAfterLogout}`);
    
    const userAfterLogout = await AuthService.getCurrentUser();
    console.log(`   - Utilisateur: ${userAfterLogout ? userAfterLogout.name : 'Aucun'}\n`);

    // 6. Se reconnecter
    console.log('6️⃣ Test de reconnexion...');
    const loginResult = await AuthService.login('test@example.com', '123456');
    console.log(`   - Connexion réussie: ${loginResult.success}`);
    console.log(`   - UID: ${loginResult.user.uid}\n`);

    // 7. Test avec mauvais mot de passe
    console.log('7️⃣ Test avec mauvais mot de passe...');
    try {
      await AuthService.login('test@example.com', 'mauvais');
      console.log('   ❌ Erreur: La connexion aurait dû échouer');
    } catch (error) {
      console.log(`   ✅ Erreur attendue: ${error.message}`);
    }

    // 8. Test avec email inexistant
    console.log('8️⃣ Test avec email inexistant...');
    try {
      await AuthService.login('inexistant@example.com', '123456');
      console.log('   ❌ Erreur: La connexion aurait dû échouer');
    } catch (error) {
      console.log(`   ✅ Erreur attendue: ${error.message}`);
    }

    console.log('\n🎉 Tous les tests sont terminés !');

  } catch (error) {
    console.error('❌ Erreur lors des tests:', error);
  }
}

// Exécuter les tests
testAuthentication(); 