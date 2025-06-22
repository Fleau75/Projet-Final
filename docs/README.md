# 🦽 AccessPlus - Application Mobile pour PMR

[![React Native](https://img.shields.io/badge/React%20Native-0.79.2-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-SDK%2053-000000.svg)](https://expo.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-10.14.1-orange.svg)](https://firebase.google.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-iOS%20%7C%20Android-lightgrey.svg)](https://reactnative.dev/)

> **Application mobile React Native dédiée aux Personnes à Mobilité Réduite (PMR) pour faciliter la découverte et l'évaluation de lieux accessibles.**

## 📚 Documentation

📖 **Toute la documentation est maintenant organisée dans le dossier [`docs/`](./INDEX.md)**

- **[📋 Index de la documentation](./INDEX.md)** - Vue d'ensemble de tous les guides
- **[🔐 Guides d'authentification](./AUTHENTICATION_GUIDE.md)** - Firebase et biométrie
- **[🏆 Système de badges](./VERIFICATION_BADGE_GUIDE.md)** - Badges vérifiés
- **[🔧 Configuration](./FIREBASE_SETUP.md)** - Setup Firebase et Google Places

## 📱 Aperçu

AccessPlus est une application mobile innovante qui permet aux utilisateurs de rechercher, localiser et partager des informations sur l'accessibilité des établissements. L'application combine géolocalisation, intelligence artificielle et données communautaires pour offrir une expérience utilisateur optimale.

### ✨ Fonctionnalités principales

- 🔍 **Recherche intelligente** de lieux accessibles
- 🗺️ **Carte interactive** avec géolocalisation
- ⭐ **Système d'évaluation** et d'avis communautaire
- 🔐 **Authentification biométrique** (empreinte digitale/reconnaissance faciale)
- 🎨 **Interface adaptative** (mode sombre/clair)
- ♿ **Accessibilité complète** pour les PMR
- 📊 **Statistiques personnalisées** et historique

## 🚀 Démarrage rapide

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

## 🏗️ Architecture technique

### Stack technologique

| Technologie | Version | Usage |
|-------------|---------|-------|
| React Native | 0.79.2 | Framework mobile |
| Expo | SDK 53 | Plateforme de développement |
| Firebase | 10.14.1 | Backend et authentification |
| React Navigation | 6.x | Navigation |
| React Native Paper | 5.14.5 | UI Components |
| react-native-maps | 1.20.1 | Cartographie |

### Structure du projet

```
Projet-Final/
├── 📁 screens/           # Écrans de l'application
├── 📁 components/        # Composants réutilisables
├── 📁 services/          # Services et API
├── 📁 theme/            # Thèmes et contextes
├── 📁 assets/           # Ressources statiques
├── 📁 scripts/          # Scripts utilitaires
├── 📁 docs/             # 📚 Documentation complète
└── 📄 App.js            # Point d'entrée
```

## 🎯 Fonctionnalités détaillées

### 🔐 Authentification

- **Connexion classique** : Email/mot de passe
- **Authentification biométrique** : Empreinte digitale et reconnaissance faciale
- **Mode visiteur** : Accès sans compte permanent
- **Gestion des sessions** : Persistance configurable
- **Réinitialisation de mot de passe** : Système complet

### 🗺️ Cartographie interactive

- **Carte Google Maps** avec thème sombre/clair
- **Géolocalisation** en temps réel
- **Marqueurs personnalisés** par catégorie
- **Recherche géolocalisée** de lieux à proximité
- **Ajout manuel** de nouveaux lieux

### 🔍 Recherche et filtrage

- **Recherche textuelle** par nom d'établissement
- **Filtrage par catégorie** : Restaurants, Culture, Shopping, Santé, Sport, Éducation
- **Filtres d'accessibilité** : Rampes, ascenseurs, parking, toilettes
- **Tri intelligent** : Par distance, note, popularité

### ⭐ Système d'évaluation

- **Notation 1-5 étoiles** avec critères multiples
- **Avis textuels** détaillés
- **Photos** illustratives (Firebase Storage)
- **Intégration avis Google** pour plus de fiabilité
- **Historique personnel** des évaluations

### ♿ Accessibilité

- **Taille de texte** ajustable (3 niveaux)
- **Support lecteur d'écran** complet
- **Mode contraste** élevé
- **Navigation adaptée** aux interactions tactiles
- **Labels d'accessibilité** détaillés

## 📱 Écrans de l'application

| Écran | Description |
|-------|-------------|
| 🏠 **Accueil** | Liste des lieux avec filtres et recherche |
| 🗺️ **Carte** | Carte interactive avec géolocalisation |
| 👤 **Profil** | Informations utilisateur et statistiques |
| ⚙️ **Réglages** | Paramètres et préférences |
| 📍 **Détails lieu** | Informations complètes d'un établissement |
| ✍️ **Ajouter avis** | Formulaire d'évaluation avec photos |
| 📊 **Mes avis** | Historique des évaluations personnelles |
| 🕒 **Historique** | Lieux visités et consultés |

## 🔧 Configuration avancée

### Firebase Setup

Consultez le guide complet : [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)

### Google Places API

Consultez le guide complet : [GOOGLE_PLACES_SETUP.md](./GOOGLE_PLACES_SETUP.md)

### Authentification biométrique

Consultez le guide complet : [BIOMETRIC_AUTH_GUIDE.md](./BIOMETRIC_AUTH_GUIDE.md)

## 🛠️ Scripts utilitaires

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
```

## 📊 Données et API

### Sources de données

- **Firebase Firestore** : Base de données principale
- **Google Places API** : Informations des établissements
- **Données statiques** : Fallback en cas d'échec API
- **AsyncStorage** : Cache local et préférences

### Collections Firebase

```javascript
// Collection "places"
{
  name: "Nom du lieu",
  address: "Adresse complète",
  type: "restaurant|culture|shopping|health|sport|education",
  rating: 4.5,
  reviewCount: 42,
  coordinates: { latitude: 48.8627, longitude: 2.3578 },
  accessibility: {
    ramp: true,
    elevator: true,
    parking: true,
    toilets: true
  }
}

// Collection "reviews"
{
  placeId: "place_id",
  userId: "user_id",
  rating: 4,
  comment: "Commentaire détaillé",
  photos: ["url1", "url2"],
  createdAt: "2024-01-01T00:00:00.000Z"
}
```

## 🧪 Tests et qualité

### Tests unitaires
```bash
# Lancer les tests
npm test

# Tests avec couverture
npm run test:coverage
```

### Tests d'intégration
```bash
# Tests d'authentification
npm run test:auth

# Tests de l'API Places
npm run test:places
```

## 🚀 Déploiement

### Expo Build
```bash
# Build pour Android
expo build:android

# Build pour iOS
expo build:ios
```

### Configuration de production
1. Configurer les variables d'environnement
2. Optimiser les images et assets
3. Configurer Firebase pour la production
4. Tester sur appareils réels

## 🤝 Contribution

### Comment contribuer
1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

### Standards de code
- Suivre les conventions ESLint
- Ajouter des tests pour les nouvelles fonctionnalités
- Documenter les nouvelles APIs
- Respecter l'accessibilité

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🙏 Remerciements

- **Expo** pour la plateforme de développement
- **Firebase** pour le backend
- **Google Places API** pour les données géographiques
- **React Native Paper** pour les composants UI
- **La communauté React Native** pour le support

## 📞 Support

- 📧 **Email** : support@accessplus.com
- 🐛 **Issues** : [GitHub Issues](https://github.com/Fleau75/Projet-Final/issues)
- 📖 **Documentation** : [docs/INDEX.md](./INDEX.md)

---

**AccessPlus** - Rendre l'accessibilité accessible à tous ! ♿

*Développé avec ❤️ pour la communauté PMR*



