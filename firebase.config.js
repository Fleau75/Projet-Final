// Configuration Firebase pour AccessPlus
// Ces valeurs sont utilisées en mode développement
// En production, utilisez les variables d'environnement

export const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyDf5RU9u0v6zBLabWGsxex-BIIdfe0jdHA",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "accessplus-demo.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "accessplus-demo",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "accessplus-demo.appspot.com",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.FIREBASE_APP_ID || "1:123456789:web:abcdef123456",
  measurementId: process.env.FIREBASE_MEASUREMENT_ID || "G-XXXXXXXXXX"
};

// Configuration pour le mode développement
export const devConfig = {
  // Utiliser des valeurs factices pour le développement
  useMockStorage: true,
  mockImageUrl: "https://via.placeholder.com/400x300/cccccc/666666?text=Image+Demo",
  enableOfflineMode: true
};

// Instructions pour la configuration en production:
// 1. Allez sur https://console.firebase.google.com/
// 2. Créez un nouveau projet ou sélectionnez un projet existant
// 3. Allez dans "Paramètres du projet" > "Général" > "Vos applications"
// 4. Ajoutez une application web et copiez la configuration
// 5. Activez Firestore Database dans la section "Database"
// 6. Activez Storage dans la section "Storage"
// 7. Configurez les règles de sécurité selon vos besoins
// 8. Remplacez les valeurs ci-dessus par vos vraies clés Firebase 