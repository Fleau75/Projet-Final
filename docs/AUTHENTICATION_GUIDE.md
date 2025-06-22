# 🔐 Guide d'Authentification AccessPlus

## ✅ Authentification Firebase Implémentée !

Votre application AccessPlus a maintenant une **authentification complète** avec Firebase Auth !

## 🚀 Comment Tester

### 1. **Lancer l'application**
```bash
npx expo start
```

### 2. **Créer un compte**
- Ouvrez l'app sur votre téléphone/simulateur
- Cliquez sur "S'inscrire"
- Remplissez le formulaire :
  - Prénom : `Test`
  - Nom : `Utilisateur`
  - Email : `test@accessplus.com`
  - Mot de passe : `123456`
  - Acceptez les conditions
- Cliquez sur "Créer mon compte"

### 3. **Se connecter**
- Utilisez les mêmes identifiants :
  - Email : `test@accessplus.com`
  - Mot de passe : `123456`
- Cliquez sur "Se connecter"

### 4. **Tester la déconnexion**
- Allez dans l'onglet "Profil"
- Cliquez sur "Se déconnecter"
- Vous revenez à l'écran de connexion

## 🔧 Fonctionnalités Implémentées

### ✅ **Inscription**
- Validation des champs
- Création de compte Firebase Auth
- Sauvegarde des données dans Firestore
- Stockage local avec AsyncStorage

### ✅ **Connexion**
- Authentification Firebase
- Récupération des données utilisateur
- Navigation automatique vers l'app

### ✅ **Déconnexion**
- Déconnexion Firebase
- Nettoyage des données locales
- Retour à l'écran de connexion

### ✅ **Persistance**
- L'utilisateur reste connecté entre les sessions
- Chargement automatique du profil
- Navigation conditionnelle

## 🎯 Points Clés

### **Contexte d'Authentification**
- `AuthContext` gère l'état global de connexion
- `useAuth()` hook pour accéder aux fonctions d'auth
- Navigation automatique selon l'état de connexion

### **Sécurité**
- Mots de passe sécurisés (minimum 6 caractères)
- Validation des emails
- Gestion d'erreurs en français
- Messages d'erreur explicites

### **UX/UI**
- Écrans de chargement
- Messages de succès/erreur
- Validation en temps réel
- Interface adaptée aux PMR

## 🔍 Structure des Données

### **Firebase Auth**
```javascript
{
  uid: "user123",
  email: "test@accessplus.com",
  displayName: "Test Utilisateur"
}
```

### **Firestore (Collection 'users')**
```javascript
{
  firstName: "Test",
  lastName: "Utilisateur",
  email: "test@accessplus.com",
  phone: "",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z"
}
```

### **AsyncStorage (userProfile)**
```javascript
{
  uid: "user123",
  name: "Test Utilisateur",
  email: "test@accessplus.com",
  phone: "",
  joinDate: "Mars 2024"
}
```

## 🛠️ Configuration Firebase

### **Activer l'Authentification**
1. Allez dans Firebase Console > Authentication
2. Cliquez sur "Get started"
3. Dans l'onglet "Sign-in method"
4. Activez "Email/Password"
5. Cliquez sur "Save"

### **Règles Firestore**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permettre la lecture/écriture des utilisateurs
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Permettre la lecture de tous les lieux
    match /places/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## 🎉 Résultat

Votre app AccessPlus a maintenant :
- ✅ **Authentification complète** avec Firebase
- ✅ **Interface utilisateur** élégante et accessible
- ✅ **Gestion d'état** globale avec React Context
- ✅ **Persistance** des sessions
- ✅ **Navigation conditionnelle** selon l'état de connexion
- ✅ **Messages d'erreur** en français
- ✅ **Validation** des formulaires

**L'authentification est prête pour la production !** 🚀 