// Configuration Firebase - Exemple
// Copiez ce fichier vers firebase.config.js et remplacez les valeurs par vos vraies clés Firebase

export const firebaseConfig = {
  apiKey: "votre-api-key",
  authDomain: "votre-projet.firebaseapp.com",
  projectId: "votre-projet-id",
  storageBucket: "votre-projet.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Instructions:
// 1. Allez sur https://console.firebase.google.com/
// 2. Créez un nouveau projet ou sélectionnez un projet existant
// 3. Allez dans "Paramètres du projet" > "Général" > "Vos applications"
// 4. Ajoutez une application web et copiez la configuration
// 5. Activez Firestore Database dans la section "Database"
// 6. Configurez les règles de sécurité Firestore selon vos besoins 