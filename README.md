# 🦽 AccessPlus - Application Mobile pour PMR

> **Application mobile React Native complète dédiée aux Personnes à Mobilité Réduite (PMR) - Version Finale**

[![React Native](https://img.shields.io/badge/React%20Native-0.79.2-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-SDK%2053-000000.svg)](https://expo.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-10.14.1-orange.svg)](https://firebase.google.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Status](https://img.shields.io/badge/Status-✅%20Complète-brightgreen.svg)](https://github.com/Fleau75/Projet-Final)
[![Last Update](https://img.shields.io/badge/Last%20Update-Juin%202025-blue.svg)](https://github.com/Fleau75/Projet-Final)

## 🎯 **Vue d'ensemble**

**AccessPlus** est une application mobile innovante qui révolutionne l'expérience des Personnes à Mobilité Réduite (PMR) en facilitant la découverte et l'évaluation de lieux accessibles. L'application combine géolocalisation intelligente et données communautaires pour offrir une expérience utilisateur optimale.

### ✨ **Fonctionnalités Principales**

- 🔍 **Recherche intelligente** de lieux accessibles avec filtres avancés
- 🗺️ **Carte interactive** avec géolocalisation en temps réel
- ⭐ **Système d'évaluation** communautaire avec photos
- 🔐 **Authentification biométrique** (empreinte/reconnaissance faciale)
- 🎨 **Interface adaptative** (mode sombre/clair automatique)
- ♿ **Accessibilité complète** pour les PMR
- 📊 **Statistiques personnalisées** et historique
- 🏆 **Système de badges vérifiés** pour les utilisateurs actifs
- 🔄 **Mode visiteur** avec migration vers compte permanent
- 🔒 **Stockage sécurisé** avec chiffrement AES-256

## 🚀 **Démarrage rapide**

### Prérequis

- Node.js (version 16 ou supérieure)
- npm ou yarn
- Expo CLI
- Compte Firebase (optionnel)
- Clé API Google Places (optionnel)

### Installation

```bash
# Cloner le repository
git clone https://github.com/Fleau75/Projet-Final.git
cd Projet-Final

# Installer les dépendances
npm install

# Démarrer l'application
npx expo start
```

### Configuration

1. **Configuration Firebase** (optionnel)
   ```bash
   # Copier le fichier de configuration
   cp firebase.config.example.js firebase.config.js
   # Éditer avec vos clés Firebase
   ```

2. **Configuration Google Places API** (optionnel)
   ```bash
   # Ajouter votre clé API dans le fichier .env
   GOOGLE_PLACES_API_KEY=votre_clé_api
   ```

## 📱 **Écrans de l'application**

| Écran | Description | Statut |
|-------|-------------|--------|
| 🔐 **Connexion** | Authentification avec biométrie | ✅ Complète |
| 📝 **Inscription** | Création de compte avec migration | ✅ Complète |
| 🏠 **Accueil** | Liste des lieux avec filtres | ✅ Complète |
| 🗺️ **Carte** | Carte interactive avec géolocalisation | ✅ Complète |
| 👤 **Profil** | Informations utilisateur et statistiques | ✅ Complète |
| ⚙️ **Réglages** | Paramètres et préférences | ✅ Complète |
| 📍 **Détails lieu** | Informations complètes d'un établissement | ✅ Complète |
| ✍️ **Ajouter avis** | Formulaire d'évaluation avec photos | ✅ Complète |
| 📊 **Mes avis** | Historique des évaluations personnelles | ✅ Complète |
| 🕒 **Historique** | Lieux visités et consultés | ✅ Complète |
| 🔑 **Mot de passe oublié** | Réinitialisation sécurisée | ✅ Complète |
| 🎯 **Lieux favoris** | Gestion des favoris | ✅ Complète |

## 🏗️ **Architecture technique**

### Stack technologique

| Technologie | Version | Usage |
|-------------|---------|-------|
| React Native | 0.79.2 | Framework mobile cross-platform |
| Expo | SDK 53 | Plateforme de développement |
| Firebase | 10.14.1 | Backend, authentification et base de données |
| React Navigation | 6.x | Navigation entre écrans |
| React Native Paper | 5.14.5 | UI Components Material Design |
| react-native-maps | 1.20.1 | Cartographie interactive |
| AsyncStorage | 2.1.2 | Stockage local sécurisé |
| expo-local-authentication | 16.0.4 | Authentification biométrique |
| expo-notifications | 0.31.3 | Système de notifications |

### Structure du projet

```
Projet-Final/
├── 📁 screens/           # 15 écrans principaux
├── 📁 components/        # Composants réutilisables
├── 📁 services/          # 11 services spécialisés
├── 📁 theme/            # Système de thèmes et contextes
├── 📁 assets/           # Ressources statiques
├── 📁 scripts/          # 18 scripts utilitaires
├── 📁 docs/             # 📚 Documentation complète
└── 📄 App.js            # Point d'entrée principal
```

## 🎯 **Fonctionnalités détaillées**

### 🔐 **Authentification Avancée**

- **Connexion classique** : Email/mot de passe avec validation robuste
- **Authentification biométrique** : Empreinte digitale et reconnaissance faciale
- **Mode visiteur** : Accès sans compte permanent avec migration automatique
- **Gestion des sessions** : Persistance configurable et sécurisée
- **Réinitialisation de mot de passe** : Système complet avec tokens
- **Chiffrement AES-256** : Sécurité renforcée des données sensibles

### 🗺️ **Cartographie Interactive**

- **Carte Google Maps** avec thème sombre/clair adaptatif
- **Géolocalisation** en temps réel avec gestion des permissions
- **Marqueurs personnalisés** par catégorie avec icônes distinctives
- **Recherche géolocalisée** de lieux à proximité
- **Ajout manuel** de nouveaux lieux avec validation
- **Calcul de distances** en temps réel avec formule de Haversine

### 🔍 **Recherche et Filtrage Intelligent**

- **Recherche textuelle** par nom d'établissement
- **Filtrage par catégorie** : Restaurants, Culture, Shopping, Santé, Sport, Éducation
- **Filtres d'accessibilité** : Rampes, ascenseurs, parking, toilettes
- **Tri intelligent** : Par distance, note, popularité
- **Recherche par proximité** avec rayon configurable

### ⭐ **Système d'Évaluation Communautaire**

- **Notation 1-5 étoiles** avec critères multiples
- **Avis textuels** détaillés avec validation
- **Photos illustratives** avec upload Firebase Storage
- **Intégration avis Google** pour plus de fiabilité
- **Historique personnel** des évaluations
- **Modération** et gestion des contenus

### ♿ **Accessibilité Complète**

- **Taille de texte** ajustable (3 niveaux)
- **Support lecteur d'écran** complet avec labels détaillés
- **Mode contraste** élevé pour la lisibilité
- **Navigation adaptée** aux interactions tactiles
- **Labels d'accessibilité** détaillés pour tous les éléments
- **Préférences d'accessibilité** personnalisables

### 🏆 **Système de Badges Vérifiés**

- **Critères de vérification** : Compte créé + 3 avis minimum
- **Badge visuel** distinctif avec tooltips informatifs
- **Statistiques utilisateur** en temps réel
- **Progression** vers la vérification
- **Reconnaissance** de la contribution communautaire

### 🔄 **Mode Visiteur avec Migration**

- **Accès immédiat** sans création de compte
- **Données temporaires** isolées et sécurisées
- **Migration automatique** vers compte permanent
- **Préservation** de l'historique et des préférences
- **Interface adaptée** pour les visiteurs

## 🔧 **Configuration avancée**

### Firebase Setup

Consultez le guide complet : [FIREBASE_SETUP.md](./docs/FIREBASE_SETUP.md)

### Google Places API

Consultez le guide complet : [GOOGLE_PLACES_SETUP.md](./docs/GOOGLE_PLACES_SETUP.md)

### Authentification biométrique

Consultez le guide complet : [BIOMETRIC_AUTH_GUIDE.md](./docs/BIOMETRIC_AUTH_GUIDE.md)

## 🛠️ **Scripts utilitaires**

```bash
# Diagnostic des données
node scripts/diagnose-storage.js

# Tests d'authentification
node scripts/test-auth.js

# Tests biométrie
node scripts/test-biometric.js

# Initialisation base de données
node scripts/initDatabase.js

# Création utilisateurs test
node scripts/create-test-users.js

# Tests de migration
node scripts/test-migration-flow.js

# Diagnostic des notifications
node scripts/test-notifications.js
```

## 📊 **Données et API**

### Sources de données

- **Firebase Firestore** : Base de données principale
- **Google Places API** : Informations des établissements
- **Données statiques** : Fallback en cas d'échec API
- **AsyncStorage** : Cache local et préférences sécurisées

### Collections Firebase

```javascript
// Collection "places"
{
  id: "string",
  name: "string",
  address: "string",
  type: "string",
  rating: "number",
  reviewCount: "number",
  coordinates: {
    latitude: "number",
    longitude: "number"
  },
  accessibility: {
    ramp: "boolean",
    elevator: "boolean",
    parking: "boolean",
    toilets: "boolean"
  }
}

// Collection "reviews"
{
  id: "string",
  placeId: "string",
  userId: "string",
  rating: "number",
  comment: "string",
  photos: ["string"],
  createdAt: "timestamp"
}
```

## 🎨 **Interface utilisateur**

### Design System

- **Material Design 3** avec composants personnalisés
- **Thème adaptatif** sombre/clair automatique
- **Couleurs accessibles** avec contraste WCAG 2.1
- **Typographie** optimisée pour la lisibilité
- **Animations** fluides et réactives

### Composants principaux

- **PlaceCard** : Affichage des lieux avec accessibilité
- **CustomRating** : Système de notation intuitif
- **VerifiedBadge** : Badges de vérification utilisateur
- **LoadingOverlay** : États de chargement élégants

## 🔒 **Sécurité et Confidentialité**

### Mesures de sécurité

- **Chiffrement AES-256** des données sensibles
- **Stockage privé** par utilisateur
- **Authentification biométrique** sécurisée
- **Validation** des entrées utilisateur
- **Isolation** des données entre utilisateurs

### Conformité

- **RGPD** : Gestion des données personnelles
- **Accessibilité** : Standards WCAG 2.1
- **Sécurité** : Bonnes pratiques OWASP

## 📈 **Statistiques du projet**

- **15 écrans** principaux implémentés
- **11 services** spécialisés
- **18 scripts** utilitaires
- **100%** des fonctionnalités principales
- **Documentation complète** avec guides détaillés

## 🤝 **Contribution**

Ce projet est maintenant **complet** et stable. Pour toute question ou suggestion d'amélioration, n'hésitez pas à ouvrir une issue.

## 📄 **Licence**

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

**AccessPlus** - Rendre l'accessibilité accessible à tous ! ♿

*Dernière mise à jour : Juin 2025* 