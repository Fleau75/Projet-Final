# 🦽 AccessPlus - Application Mobile pour PMR

[![React Native](https://img.shields.io/badge/React%20Native-0.79.2-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-SDK%2053-000000.svg)](https://expo.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-10.14.1-orange.svg)](https://firebase.google.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-iOS%20%7C%20Android-lightgrey.svg)](https://reactnative.dev/)

> **Application mobile React Native dédiée aux Personnes à Mobilité Réduite (PMR) pour faciliter la découverte et l'évaluation de lieux accessibles.**

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

Consultez le guide complet : [FIREBASE_SETUP.md](FIREBASE_SETUP.md)

### Google Places API

Consultez le guide complet : [GOOGLE_PLACES_SETUP.md](GOOGLE_PLACES_SETUP.md)

### Authentification biométrique

Consultez le guide complet : [BIOMETRIC_AUTH_GUIDE.md](BIOMETRIC_AUTH_GUIDE.md)

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

## 🎨 Thèmes et personnalisation

### Couleurs principales

```css
/* Thème clair */
primary: #2596BE
background: #F1F5F9
surface: #FFFFFF

/* Thème sombre */
primary: #2596BE
background: #0F172A
surface: #1E293B
```

### Personnalisation

L'application supporte :
- **Mode sombre/clair** automatique
- **Taille de texte** ajustable
- **Contraste** élevé
- **Animations** réduites

## 🚀 Déploiement

### Build pour production

```bash
# Build Android
expo build:android

# Build iOS
expo build:ios

# Build web
expo build:web
```

### Configuration EAS Build

```bash
# Installer EAS CLI
npm install -g @expo/eas-cli

# Configurer le projet
eas build:configure

# Build pour production
eas build --platform all
```

## 🤝 Contribution

Nous accueillons les contributions ! Voici comment participer :

1. **Fork** le projet
2. **Créer** une branche feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** vos changements (`git commit -m 'Add some AmazingFeature'`)
4. **Push** vers la branche (`git push origin feature/AmazingFeature`)
5. **Ouvrir** une Pull Request

### Guidelines de contribution

- Respectez les standards de code
- Ajoutez des tests pour les nouvelles fonctionnalités
- Documentez les changements
- Testez sur iOS et Android

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 👥 Équipe

- **Développeur principal** : [Fleau75](https://github.com/Fleau75)
- **Design** : AccessPlus Team
- **Accessibilité** : AccessPlus Team

## 🙏 Remerciements

- **Expo** pour la plateforme de développement
- **Firebase** pour le backend
- **Google Places API** pour les données géographiques
- **React Native Paper** pour les composants UI
- **La communauté React Native** pour le support

## 📞 Support

- **Issues** : [GitHub Issues](https://github.com/Fleau75/Projet-Final/issues)
- **Documentation** : [Wiki du projet](https://github.com/Fleau75/Projet-Final/wiki)
- **Email** : support@accessplus-app.com

---

<div align="center">

**AccessPlus** - Rendre le monde plus accessible, un lieu à la fois 🌍

[![GitHub stars](https://img.shields.io/github/stars/Fleau75/Projet-Final?style=social)](https://github.com/Fleau75/Projet-Final/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/Fleau75/Projet-Final?style=social)](https://github.com/Fleau75/Projet-Final/network)
[![GitHub issues](https://img.shields.io/github/issues/Fleau75/Projet-Final)](https://github.com/Fleau75/Projet-Final/issues)

</div>



