const AsyncStorage = require('@react-native-async-storage/async-storage');

// Simuler AsyncStorage pour Node.js
const mockAsyncStorage = {
  getItem: async (key) => {
    console.log(`🔍 Récupération de: ${key}`);
    return null; // Simuler un AsyncStorage vide
  },
  setItem: async (key, value) => {
    console.log(`💾 Sauvegarde de: ${key}`);
    console.log(`📄 Contenu: ${value}`);
  }
};

// Remplacer AsyncStorage par notre mock
global.AsyncStorage = mockAsyncStorage;

const createTestUsers = async () => {
  console.log('🚀 Création des utilisateurs de test...\n');

  const testUsers = [
    {
      email: 'test@example.com',
      password: '123456',
      name: 'Utilisateur Test',
      createdAt: new Date().toISOString()
    },
    {
      email: 'demo@accessplus.com',
      password: 'demo123',
      name: 'Démo AccessPlus',
      createdAt: new Date().toISOString()
    },
    {
      email: 'admin@accessplus.com',
      password: 'admin123',
      name: 'Administrateur',
      createdAt: new Date().toISOString()
    }
  ];

  for (const user of testUsers) {
    const userKey = `user_${user.email}`;
    const userData = JSON.stringify(user);
    
    console.log(`👤 Création de l'utilisateur: ${user.email}`);
    console.log(`📧 Email: ${user.email}`);
    console.log(`🔑 Mot de passe: ${user.password}`);
    console.log(`👨‍💼 Nom: ${user.name}`);
    console.log(`📅 Créé le: ${user.createdAt}`);
    console.log('---');
    
    await AsyncStorage.setItem(userKey, userData);
  }

  console.log('✅ Utilisateurs de test créés avec succès!');
  console.log('\n📋 Informations de connexion:');
  console.log('1. Email: test@example.com | Mot de passe: 123456');
  console.log('2. Email: demo@accessplus.com | Mot de passe: demo123');
  console.log('3. Email: admin@accessplus.com | Mot de passe: admin123');
  console.log('\n🎯 Vous pouvez maintenant tester la connexion avec ces comptes!');
};

// Exécuter le script
createTestUsers().catch(console.error); 