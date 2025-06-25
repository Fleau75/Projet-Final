# 🔐 Guide d'Authentification AccessPlus

> **Guide complet du système d'authentification d'AccessPlus - Version Finale**

[![Status](https://img.shields.io/badge/Status-✅%20Complète-brightgreen.svg)](https://github.com/Fleau75/Projet-Final)
[![Last Update](https://img.shields.io/badge/Last%20Update-Juin%202025-blue.svg)](https://github.com/Fleau75/Projet-Final)

## 🎯 **Vue d'ensemble**

Le système d'authentification d'AccessPlus est conçu pour offrir une expérience sécurisée et accessible aux Personnes à Mobilité Réduite (PMR). Il combine plusieurs méthodes d'authentification pour s'adapter aux besoins de chaque utilisateur.

## 🔐 **Méthodes d'authentification**

### 1. **Mode Visiteur (Recommandé pour commencer)**

Le mode visiteur permet d'utiliser l'application sans créer de compte permanent.

#### Avantages
- ✅ **Accès immédiat** sans inscription
- ✅ **Toutes les fonctionnalités** disponibles
- ✅ **Données sauvegardées** localement
- ✅ **Migration facile** vers un compte permanent

#### Utilisation
1. **Lancez l'application** AccessPlus
2. **Cliquez sur "Continuer sans compte"**
3. **Explorez librement** toutes les fonctionnalités
4. **Vos données sont automatiquement sauvegardées**

#### Limitations
- ❌ Pas de synchronisation entre appareils
- ❌ Pas de badge de vérification
- ❌ Pas d'authentification biométrique
- ❌ Données locales uniquement

### 2. **Authentification Classique (Email/Mot de passe)**

Système d'authentification traditionnel avec validation robuste.

#### Création de compte
1. **Cliquez sur "Créer un compte"**
2. **Remplissez le formulaire** :
   - Prénom et nom (obligatoire)
   - Adresse email (obligatoire)
   - Mot de passe (minimum 6 caractères)
   - Téléphone (optionnel)
3. **Choisissez la migration** des données visiteur
4. **Validez votre inscription**

#### Connexion
1. **Entrez votre email** et mot de passe
2. **Cliquez sur "Se connecter"**
3. **Accédez à votre compte** avec toutes les fonctionnalités

#### Validation
- **Email** : Format valide requis
- **Mot de passe** : Minimum 6 caractères
- **Doublons** : Vérification des emails existants
- **Sécurité** : Chiffrement AES-256 des mots de passe

### 3. **Authentification Biométrique**

Système d'authentification avancé utilisant les capacités biométriques de l'appareil.

#### Types supportés
- **Empreinte digitale** (Touch ID)
- **Reconnaissance faciale** (Face ID)
- **Reconnaissance d'iris** (selon l'appareil)

#### Activation
1. **Connectez-vous** avec votre compte
2. **Activez la biométrie** quand proposée
3. **Suivez les instructions** de votre appareil
4. **Confirmez l'activation**

#### Utilisation
- **Lancez l'application**
- **Utilisez votre empreinte** ou reconnaissance faciale
- **Connexion automatique** si réussie
- **Fallback vers mot de passe** si échec

#### Sécurité
- **Chiffrement local** des credentials
- **Validation biométrique** native
- **Pas d'accès** pour le mode visiteur
- **Désactivation** possible à tout moment

## 🔄 **Migration des données**

### Migration Visiteur → Compte Permanent

Le système de migration permet de transférer toutes les données du mode visiteur vers un compte permanent.

#### Données migrées
- ✅ **Lieux favoris** ajoutés
- ✅ **Avis publiés** avec photos
- ✅ **Préférences d'accessibilité**
- ✅ **Historique de navigation**
- ✅ **Paramètres personnalisés**

#### Processus de migration
1. **Créez un compte** depuis le mode visiteur
2. **Choisissez "Migrer mes données"**
3. **Attendez la migration** automatique
4. **Confirmez la migration** réussie

#### Avantages post-migration
- 🔄 **Synchronisation** sur tous vos appareils
- 🔒 **Sauvegarde sécurisée** dans le cloud
- 🏆 **Badge de vérification** possible
- 📊 **Statistiques détaillées**
- 🔐 **Authentification biométrique**

## 🔒 **Sécurité et confidentialité**

### Chiffrement des données

#### Chiffrement AES-256
- **Mots de passe** : Chiffrés avant stockage
- **Données sensibles** : Chiffrement automatique
- **Clés de chiffrement** : Générées localement
- **Migration automatique** vers le chiffrement

#### Stockage sécurisé
- **AsyncStorage** avec isolation utilisateur
- **Clés uniques** par utilisateur
- **Pas de partage** entre comptes
- **Nettoyage automatique** des données obsolètes

### Gestion des sessions

#### Persistance configurable
- **Session automatique** : Reconnexion automatique
- **Session manuelle** : Connexion à chaque lancement
- **Déconnexion automatique** : Après inactivité
- **Verrouillage biométrique** : Protection supplémentaire

#### Sécurité des sessions
- **Tokens temporaires** pour les opérations sensibles
- **Validation continue** de l'authentification
- **Déconnexion forcée** en cas de compromission
- **Historique des connexions** disponible

## 🆘 **Récupération de compte**

### Mot de passe oublié

#### Processus de récupération
1. **Cliquez sur "Mot de passe oublié"**
2. **Entrez votre adresse email**
3. **Recevez un email** de récupération
4. **Cliquez sur le lien** dans l'email
5. **Définissez un nouveau mot de passe**

#### Sécurité de la récupération
- **Tokens temporaires** (expiration 1 heure)
- **Validation email** obligatoire
- **Historique des récupérations** tracé
- **Notification** en cas de tentative

### Changement de mot de passe

#### Depuis l'application
1. **Allez dans Profil > Sécurité**
2. **Cliquez sur "Changer le mot de passe"**
3. **Entrez l'ancien mot de passe**
4. **Définissez le nouveau mot de passe**
5. **Confirmez le changement**

#### Validation
- **Ancien mot de passe** : Vérification obligatoire
- **Nouveau mot de passe** : Minimum 6 caractères
- **Confirmation** : Correspondance requise
- **Notification** : Confirmation du changement

## 🏆 **Badges de vérification**

### Critères de vérification

Pour obtenir le badge de vérification, l'utilisateur doit :
- ✅ **Avoir un compte permanent** (non visiteur)
- ✅ **Avoir publié au moins 3 avis**
- ✅ **Avoir une activité régulière**

### Avantages du badge

- 🏆 **Reconnaissance** de la contribution
- 📊 **Statistiques détaillées** disponibles
- 🔍 **Visibilité** dans la communauté
- 📈 **Progression** vers des niveaux supérieurs

### Progression

- **0 avis** : Utilisateur de base
- **1-2 avis** : En cours de vérification
- **3+ avis** : Utilisateur vérifié 🏆

## 🛠️ **Configuration technique**

### Variables d'environnement

```bash
# Firebase Configuration
FIREBASE_API_KEY=votre_clé_api
FIREBASE_AUTH_DOMAIN=votre_domaine
FIREBASE_PROJECT_ID=votre_projet
FIREBASE_STORAGE_BUCKET=votre_bucket
FIREBASE_MESSAGING_SENDER_ID=votre_sender_id
FIREBASE_APP_ID=votre_app_id

# Google Places API (optionnel)
GOOGLE_PLACES_API_KEY=votre_clé_places
```

### Configuration Firebase

#### Règles de sécurité Firestore
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Collection des utilisateurs
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Collection des avis
    match /reviews/{reviewId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Collection des lieux
    match /places/{placeId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

#### Règles de sécurité Storage
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Images des avis
    match /reviews/{reviewId}/{fileName} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Images des lieux
    match /places/{placeId}/{fileName} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## 🧪 **Tests et diagnostic**

### Scripts de test disponibles

```bash
# Tests d'authentification
node scripts/test-auth.js

# Tests biométrie
node scripts/test-biometric.js

# Tests de migration
node scripts/test-migration-flow.js

# Diagnostic du stockage
node scripts/diagnose-storage.js

# Tests de vérification
node scripts/test-verification.js
```

### Tests d'authentification

Le script `test-auth.js` vérifie :
- ✅ **Création de compte** avec validation
- ✅ **Connexion** avec email/mot de passe
- ✅ **Déconnexion** et nettoyage
- ✅ **Gestion des erreurs** (mauvais mot de passe, email inexistant)
- ✅ **Persistance** des sessions

### Tests biométriques

Le script `test-biometric.js` vérifie :
- ✅ **Disponibilité** de la biométrie
- ✅ **Activation** de l'authentification biométrique
- ✅ **Authentification** avec biométrie
- ✅ **Fallback** vers mot de passe
- ✅ **Désactivation** de la biométrie

## 🆘 **Résolution de problèmes**

### Problèmes courants

#### Connexion impossible
- **Vérifiez votre email** et mot de passe
- **Utilisez "Mot de passe oublié"** si nécessaire
- **Vérifiez votre connexion internet**
- **Redémarrez l'application**

#### Biométrie ne fonctionne pas
- **Vérifiez les paramètres** de votre appareil
- **Réactivez la biométrie** dans les réglages
- **Utilisez le mot de passe** en attendant
- **Contactez le support** si persistant

#### Migration échouée
- **Vérifiez votre connexion internet**
- **Relancez la migration** depuis le profil
- **Vérifiez l'espace disponible** sur l'appareil
- **Contactez le support** si persistant

#### Données perdues
- **Vérifiez la synchronisation** dans les réglages
- **Forcez la synchronisation** manuellement
- **Vérifiez votre compte** Firebase
- **Contactez le support** pour récupération

## 📊 **Statistiques d'utilisation**

### Métriques de sécurité

- **Tentatives de connexion** : Suivi des échecs
- **Utilisation biométrique** : Statistiques d'usage
- **Migrations réussies** : Taux de succès
- **Récupérations de mot de passe** : Fréquence

### Utilisateurs de test

L'application inclut des utilisateurs de test pré-configurés :

- **test@example.com** / 123456 - Utilisateur de base
- **demo@accessplus.com** / demo123 - Utilisateur démo
- **admin@accessplus.com** / admin123 - Administrateur
- **visiteur@accessplus.com** - Mode visiteur (pas de mot de passe)

## 🔮 **Évolutions futures**

### Fonctionnalités prévues

- 🔐 **Authentification à deux facteurs** (2FA)
- 🔗 **Connexion avec Google/Apple**
- 👥 **Comptes familiaux** partagés
- 🔄 **Synchronisation temps réel**
- 📱 **Notifications push** d'authentification

### Améliorations de sécurité

- 🔒 **Chiffrement end-to-end** des messages
- 🛡️ **Détection d'intrusion** automatique
- 📍 **Géolocalisation** des connexions
- ⏰ **Sessions temporaires** configurables

---

**AccessPlus** - Rendre l'accessibilité accessible à tous ! ♿

*Dernière mise à jour : Juin 2025* 