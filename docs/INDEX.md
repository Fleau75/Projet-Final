# 📚 Index de la Documentation AccessPlus

> **Vue d'ensemble de toute la documentation du projet AccessPlus - Version Finale**

[![Status](https://img.shields.io/badge/Status-✅%20Complète-brightgreen.svg)](https://github.com/Fleau75/Projet-Final)
[![Last Update](https://img.shields.io/badge/Last%20Update-Juin%202025-blue.svg)](https://github.com/Fleau75/Projet-Final)

## 🎯 **Vue d'ensemble**

Cette documentation couvre l'ensemble du projet **AccessPlus**, une application mobile React Native complète dédiée aux Personnes à Mobilité Réduite (PMR). Tous les guides sont organisés par catégorie pour faciliter la navigation.

## 📖 **Guides principaux**

### 🚀 **Démarrage et installation**

- **[📋 Documentation complète](./README.md)** - Guide principal du projet
- **[📱 Guide utilisateur](./USER_GUIDE.md)** - Manuel d'utilisation complet
- **[🔧 Configuration Firebase](./FIREBASE_SETUP.md)** - Setup Firebase et Google Places
- **[🗺️ Configuration Google Places](./GOOGLE_PLACES_SETUP.md)** - Intégration API Places

### 🔐 **Authentification et sécurité**

- **[🔐 Guide d'authentification](./AUTHENTICATION_GUIDE.md)** - Firebase et biométrie
- **[🔒 Authentification biométrique](./BIOMETRIC_AUTH_GUIDE.md)** - Empreinte et reconnaissance faciale
- **[🔑 Réinitialisation de mot de passe](./PASSWORD_RESET_GUIDE.md)** - Système de récupération

### 🏆 **Fonctionnalités avancées**

- **[🏆 Système de badges vérifiés](./VERIFICATION_BADGE_GUIDE.md)** - Badges et vérification utilisateur
- **[🔄 Mode visiteur et migration](./VISITOR_MODE_GUIDE.md)** - Gestion des visiteurs
- **[📊 Système de stockage](./STORAGE_GUIDE.md)** - Gestion des données

### 📋 **Spécifications techniques**

- **[📋 Cahier des charges](./CAHIER_DES_CHARGES.md)** - Spécifications complètes du projet
- **[🏗️ Architecture technique](./ARCHITECTURE_GUIDE.md)** - Structure du code et architecture
- **[🔌 Référence API](./API_REFERENCE.md)** - Documentation complète des APIs
- **[🧩 Guide des composants](./COMPONENTS_GUIDE.md)** - Composants réutilisables
- **[🔧 Guide des services](./SERVICES_GUIDE.md)** - Services et logique métier
- **[📱 Guide des écrans](./SCREENS_GUIDE.md)** - Écrans et navigation
- **[🧪 Tests et qualité](./TESTING_GUIDE.md)** - Stratégie de tests
- **[🚀 Guide de déploiement](./DEPLOYMENT_GUIDE.md)** - Déploiement et maintenance
- **[🆘 Guide de dépannage](./TROUBLESHOOTING_GUIDE.md)** - Résolution de problèmes

## 📱 **Fonctionnalités documentées**

### ✅ **Fonctionnalités complètes**

| Fonctionnalité | Statut | Documentation |
|----------------|--------|---------------|
| 🔐 **Authentification** | ✅ Complète | [AUTHENTICATION_GUIDE.md](./AUTHENTICATION_GUIDE.md) |
| 🗺️ **Cartographie** | ✅ Complète | [USER_GUIDE.md](./USER_GUIDE.md#carte-interactive) |
| ⭐ **Système d'évaluation** | ✅ Complète | [USER_GUIDE.md](./USER_GUIDE.md#système-dévaluation) |
| ♿ **Accessibilité** | ✅ Complète | [USER_GUIDE.md](./USER_GUIDE.md#accessibilité) |
| 🏆 **Badges vérifiés** | ✅ Complète | [VERIFICATION_BADGE_GUIDE.md](./VERIFICATION_BADGE_GUIDE.md) |
| 🔄 **Mode visiteur** | ✅ Complète | [VISITOR_MODE_GUIDE.md](./VISITOR_MODE_GUIDE.md) |
| 🔒 **Sécurité** | ✅ Complète | [AUTHENTICATION_GUIDE.md](./AUTHENTICATION_GUIDE.md) |
| 📊 **Statistiques** | ✅ Complète | [USER_GUIDE.md](./USER_GUIDE.md#profil-utilisateur) |

### 🎯 **Écrans de l'application**

| Écran | Statut | Documentation |
|-------|--------|---------------|
| 🔐 **Connexion** | ✅ Complète | [USER_GUIDE.md](./USER_GUIDE.md#première-connexion) |
| 📝 **Inscription** | ✅ Complète | [USER_GUIDE.md](./USER_GUIDE.md#première-connexion) |
| 🏠 **Accueil** | ✅ Complète | [USER_GUIDE.md](./USER_GUIDE.md#écran-daccueil) |
| 🗺️ **Carte** | ✅ Complète | [USER_GUIDE.md](./USER_GUIDE.md#carte-interactive) |
| 👤 **Profil** | ✅ Complète | [USER_GUIDE.md](./USER_GUIDE.md#profil-utilisateur) |
| ⚙️ **Réglages** | ✅ Complète | [USER_GUIDE.md](./USER_GUIDE.md#réglages) |
| 📍 **Détails lieu** | ✅ Complète | [USER_GUIDE.md](./USER_GUIDE.md#détails-dun-lieu) |
| ✍️ **Ajouter avis** | ✅ Complète | [USER_GUIDE.md](./USER_GUIDE.md#système-dévaluation) |
| 📊 **Mes avis** | ✅ Complète | [USER_GUIDE.md](./USER_GUIDE.md#système-dévaluation) |
| 🕒 **Historique** | ✅ Complète | [USER_GUIDE.md](./USER_GUIDE.md#profil-utilisateur) |
| 🔑 **Mot de passe oublié** | ✅ Complète | [PASSWORD_RESET_GUIDE.md](./PASSWORD_RESET_GUIDE.md) |
| 🎯 **Lieux favoris** | ✅ Complète | [USER_GUIDE.md](./USER_GUIDE.md#détails-dun-lieu) |

## 🛠️ **Scripts et outils**

### 📊 **Scripts de diagnostic**

| Script | Description | Usage |
|--------|-------------|-------|
| `diagnose-storage.js` | Diagnostic du stockage | Analyse des données utilisateur |
| `test-auth.js` | Tests d'authentification | Validation du système de connexion |
| `test-biometric.js` | Tests biométrie | Validation de l'authentification biométrique |
| `test-migration-flow.js` | Tests de migration | Validation du système de migration |
| `test-notifications.js` | Tests notifications | Validation du système de notifications |
| `test-verification.js` | Tests de vérification | Validation des badges vérifiés |
| `test-storage-isolation.js` | Tests isolation | Validation de l'isolation des données |

### 🔧 **Scripts d'initialisation**

| Script | Description | Usage |
|--------|-------------|-------|
| `initDatabase.js` | Initialisation BDD | Création des collections Firebase |
| `create-test-users.js` | Création utilisateurs test | Génération des comptes de test |
| `migrate-to-private-storage.js` | Migration stockage | Migration vers le stockage privé |

## 📊 **Statistiques du projet**

### 📈 **Métriques de développement**

- **15 écrans** principaux implémentés
- **11 services** spécialisés
- **18 scripts** utilitaires
- **100%** des fonctionnalités principales
- **Documentation complète** avec guides détaillés

### 🎯 **Utilisateurs de test**

- **test@example.com** / 123456 - Utilisateur de base
- **demo@accessplus.com** / demo123 - Utilisateur démo
- **admin@accessplus.com** / admin123 - Administrateur
- **visiteur@accessplus.com** - Mode visiteur

### 🔧 **Technologies utilisées**

- **React Native 0.79.2** - Framework mobile
- **Expo SDK 53** - Plateforme de développement
- **Firebase 10.14.1** - Backend et authentification
- **React Navigation 6.x** - Navigation
- **React Native Paper 5.14.5** - UI Components
- **react-native-maps 1.20.1** - Cartographie

## 🚀 **Démarrage rapide**

### 📋 **Pour les développeurs**

1. **Cloner le repository**
   ```bash
   git clone https://github.com/Fleau75/Projet-Final.git
   cd Projet-Final
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configurer Firebase** (optionnel)
   ```bash
   cp firebase.config.example.js firebase.config.js
   # Éditer avec vos clés Firebase
   ```

4. **Démarrer l'application**
   ```bash
   npx expo start
   ```

### 📱 **Pour les utilisateurs**

1. **Télécharger l'application** depuis les stores
2. **Lancer l'application** AccessPlus
3. **Choisir le mode visiteur** pour commencer
4. **Explorer les fonctionnalités** librement
5. **Créer un compte** pour plus de fonctionnalités

## 🔍 **Recherche dans la documentation**

### 🔐 **Authentification**
- [Guide d'authentification](./AUTHENTICATION_GUIDE.md)
- [Authentification biométrique](./BIOMETRIC_AUTH_GUIDE.md)
- [Réinitialisation de mot de passe](./PASSWORD_RESET_GUIDE.md)

### 🗺️ **Cartographie**
- [Configuration Google Places](./GOOGLE_PLACES_SETUP.md)
- [Utilisation de la carte](./USER_GUIDE.md#carte-interactive)

### ♿ **Accessibilité**
- [Guide utilisateur - Accessibilité](./USER_GUIDE.md#accessibilité)
- [Configuration Firebase](./FIREBASE_SETUP.md)

### 🏆 **Badges et vérification**
- [Système de badges vérifiés](./VERIFICATION_BADGE_GUIDE.md)
- [Mode visiteur](./VISITOR_MODE_GUIDE.md)

### 🏗️ **Architecture et développement**
- [Architecture technique](./ARCHITECTURE_GUIDE.md)
- [Référence API](./API_REFERENCE.md)
- [Guide des composants](./COMPONENTS_GUIDE.md)
- [Guide des services](./SERVICES_GUIDE.md)
- [Guide des écrans](./SCREENS_GUIDE.md)

### 🧪 **Tests et qualité**
- [Guide des tests](./TESTING_GUIDE.md)
- [Guide de déploiement](./DEPLOYMENT_GUIDE.md)
- [Guide de dépannage](./TROUBLESHOOTING_GUIDE.md)

## 📞 **Support et contact**

### 🆘 **Aide et support**

- **📧 Email** : support@accessplus.com
- **🐛 Issues** : [GitHub Issues](https://github.com/Fleau75/Projet-Final/issues)
- **📖 Documentation** : Ce guide complet

### 🤝 **Contribution**

Ce projet est maintenant **complet** et stable. Pour toute question ou suggestion d'amélioration, n'hésitez pas à ouvrir une issue.

## 📄 **Licence**

Ce projet est sous licence MIT. Voir le fichier [LICENSE](../LICENSE) pour plus de détails.

---

**AccessPlus** - Rendre l'accessibilité accessible à tous ! ♿

*Dernière mise à jour : Juin 2025* 