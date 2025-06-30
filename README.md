# 🦽 AccessPlus - Application Mobile pour PMR

> **Application mobile React Native complète dédiée aux Personnes à Mobilité Réduite (PMR) - Version Finale**

[![React Native](https://img.shields.io/badge/React%20Native-0.79.2-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-SDK%2053-000000.svg)](https://expo.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-10.14.1-orange.svg)](https://firebase.google.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Status](https://img.shields.io/badge/Status-✅%20Complète-brightgreen.svg)](https://github.com/Fleau75/Projet-Final)
[![Last Update](https://img.shields.io/badge/Last%20Update-Juin%202025-blue.svg)](https://github.com/Fleau75/Projet-Final)
[![Tests](https://img.shields.io/badge/Tests-328%20passing-brightgreen.svg)](https://github.com/Fleau75/Projet-Final)

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
- 🆘 **Système d'aide et support** intégré
- 📱 **Notifications push** personnalisables

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

| Écran | Description | Statut | Fonctionnalités |
|-------|-------------|--------|-----------------|
| 🔐 **Connexion** | Authentification avec biométrie | ✅ Complète | Auth + Face ID |
| 📝 **Inscription** | Création de compte avec migration | ✅ Complète | Migration visiteur |
| 🏠 **Accueil** | Liste des lieux avec filtres | ✅ Complète | Bouton retour, catégorisation |
| 🗺️ **Carte** | Carte interactive avec géolocalisation | ✅ Complète | FAB ajout avis |
| 👤 **Profil** | Informations utilisateur et statistiques | ✅ Complète | Badges vérifiés |
| ⚙️ **Réglages** | Paramètres et préférences | ✅ Complète | Notifications, aide |
| 📍 **Détails lieu** | Informations complètes d'un établissement | ✅ Complète | Contact, prix |
| ✍️ **Ajouter avis** | Formulaire d'évaluation avec photos | ✅ Complète | Upload photos |
| 📊 **Mes avis** | Historique des évaluations personnelles | ✅ Complète | Gestion avis |
| 🕒 **Historique** | Lieux visités et consultés | ✅ Complète | Historique complet |
| 🔑 **Mot de passe oublié** | Réinitialisation sécurisée | ✅ Complète | Tokens sécurisés |
| 🎯 **Lieux favoris** | Gestion des favoris | ✅ Complète | Favoris persistants |

## 🏗️ **Architecture technique**

### Stack technologique

| Technologie | Version | Usage | Statut |
|-------------|---------|-------|--------|
| React Native | 0.79.2 | Framework mobile cross-platform | ✅ Stable |
| Expo | SDK 53 | Plateforme de développement | ✅ Stable |
| Firebase | 10.14.1 | Backend, authentification et base de données | ✅ Stable |
| React Navigation | 6.x | Navigation entre écrans | ✅ Stable |
| React Native Paper | 5.14.5 | UI Components Material Design | ✅ Stable |
| react-native-maps | 1.20.1 | Cartographie interactive | ✅ Stable |
| AsyncStorage | 2.1.2 | Stockage local sécurisé | ✅ Stable |
| expo-local-authentication | 16.0.4 | Authentification biométrique | ✅ Stable |
| expo-notifications | 0.31.3 | Système de notifications | ✅ Stable |

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
- **FAB (Floating Action Button)** pour ajouter des avis directement depuis la carte

### 🔍 **Recherche et Filtrage Intelligent**

- **Recherche textuelle** par nom d'établissement
- **Filtrage par catégorie** : Restaurants, Culture, Shopping, Santé, Sport, Éducation, Hôtels
- **Filtres d'accessibilité** : Rampes, ascenseurs, parking, toilettes
- **Tri intelligent** : Par distance, note, popularité
- **Recherche par proximité** avec rayon configurable (500m par défaut)
- **Bouton retour en haut** pour navigation rapide

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
- **Menus compacts** pour une meilleure expérience

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

### 🆘 **Système d'Aide et Support**

- **Interface d'aide** intégrée dans les réglages
- **Signaler un problème** avec formulaire dédié
- **Support utilisateur** avec options multiples
- **Documentation** accessible directement dans l'app

### 📱 **Notifications Avancées**

- **Notifications push** Firebase
- **Notifications locales** Expo
- **Personnalisation** des préférences
- **Gestion des permissions** granulaire
- **Mode simulation** pour les tests

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

# Tests notifications
node scripts/test-notifications.js

# Migration des données
node scripts/migrate-to-private-storage.js
```

## 🧪 **Tests et Qualité**

### Couverture de Tests
- **328 tests** au total (unitaires + intégration)
- **98.7% de réussite** (323/328 tests passent)
- **Tests automatisés** pour tous les services
- **Tests d'intégration** pour les interactions utilisateur

### Services Testés
- ✅ **AuthService** - Authentification complète
- ✅ **BiometricService** - Biométrie avancée
- ✅ **ConfigService** - Configuration globale
- ✅ **NotificationService** - Notifications push
- ✅ **PlacesSearch** - Recherche avancée
- ✅ **CryptoService** - Chiffrement AES-256
- ✅ **PlacesApi** - API Google Places
- ✅ **SimplePlacesService** - Données statiques
- ✅ **AccessibilityService** - Accessibilité

## 📚 **Documentation Complète**

Consultez notre documentation détaillée dans le dossier `docs/` :

- [📋 Cahier des Charges](./docs/CAHIER_DES_CHARGES.md)
- [🏗️ Guide d'Architecture](./docs/ARCHITECTURE_GUIDE.md)
- [🔌 Référence API](./docs/API_REFERENCE.md)
- [🧩 Guide des Composants](./docs/COMPONENTS_GUIDE.md)
- [📱 Guide des Écrans](./docs/SCREENS_GUIDE.md)
- [⚙️ Guide des Services](./docs/SERVICES_GUIDE.md)
- [🧪 Guide des Tests](./docs/TESTING_GUIDE.md)
- [🚀 Guide de Déploiement](./docs/DEPLOYMENT_GUIDE.md)
- [🔧 Guide de Dépannage](./docs/TROUBLESHOOTING_GUIDE.md)
- [👤 Guide Utilisateur](./docs/USER_GUIDE.md)
- [👥 Mode Visiteur](./docs/VISITOR_MODE_GUIDE.md)

## 🎨 **Interface Utilisateur**

### Design System
- **Material Design** avec React Native Paper
- **Thèmes adaptatifs** (clair/sombre automatique)
- **Composants réutilisables** bien structurés
- **Animations** fluides et accessibles
- **Logo intégré** avec tests dédiés

### Améliorations UX Récentes
- **Bouton retour en haut** pour navigation rapide
- **Correction catégorisation hôtels** avec icônes appropriées
- **Informations de contact** contextuelles
- **Prix contextuels** pour les établissements
- **Layout avis** optimisé avec alignement gauche
- **FAB amélioré** sur la carte pour ajouter des avis
- **Menus compacts** pour une meilleure accessibilité

## 🔒 **Sécurité et Performance**

### Sécurité
- **Chiffrement AES-256** des données sensibles
- **Authentification Firebase** sécurisée
- **Permissions granulaire** des utilisateurs
- **Validation** robuste des entrées
- **Stockage sécurisé** des tokens

### Performance
- **Lazy loading** des images
- **Cache intelligent** des données
- **Optimisation** des requêtes Firebase
- **Gestion mémoire** efficace
- **Tests de performance** intégrés

## 🤝 **Contribution**

1. Fork le projet
2. Créez une branche pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📄 **Licence**

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 📞 **Support**

- 📧 Email : support@accessplus.com
- 🐛 Issues : [GitHub Issues](https://github.com/Fleau75/Projet-Final/issues)
- 📖 Documentation : [Documentation complète](./docs/)

---

**AccessPlus** - Rendre l'accessibilité accessible à tous ! 🦽✨

*Dernière mise à jour : Juin 2025* 