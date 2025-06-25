# 🚀 Guide de Déploiement - AccessPlus

## 📋 Vue d'ensemble

Ce guide détaille le processus de déploiement d'AccessPlus sur différentes plateformes et environnements.

## 🎯 Plateformes Supportées

### 📱 Mobile
- **iOS** : App Store, TestFlight
- **Android** : Google Play Store, APK
- **Expo** : Expo Application Services (EAS)

### 🌐 Web
- **Web App** : PWA (Progressive Web App)
- **Desktop** : Electron (optionnel)

## 📦 Préparation du Déploiement

### 1. Configuration de l'Environnement

**Variables d'environnement :**
```bash
# .env.production
NODE_ENV=production
EXPO_PUBLIC_API_URL=https://api.accessplus.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=accessplus-prod
EXPO_PUBLIC_GOOGLE_PLACES_API_KEY=your_production_api_key
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_maps_api_key
```

**Configuration Expo :**
```javascript
// app.config.js
export default {
  expo: {
    name: "AccessPlus",
    slug: "accessplus",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    updates: {
      fallbackToCacheTimeout: 0
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.accessplus.app",
      buildNumber: "1.0.0"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#FFFFFF"
      },
      package: "com.accessplus.app",
      versionCode: 1
    },
    web: {
      favicon: "./assets/favicon.png"
    }
  }
};
```

### 2. Optimisation des Assets

**Images :**
```bash
# Optimisation des images
npx expo optimize

# Génération des icônes
npx expo generate-icons

# Génération des splash screens
npx expo generate-splash
```

**Code :**
```bash
# Minification du code
npm run build:optimize

# Analyse du bundle
npx expo export --analyze
```

## 📱 Déploiement iOS

### 1. Configuration Xcode

**Certificats et Profils :**
- Certificat de développement
- Certificat de distribution
- Profil de provisionnement
- Identifiant d'application

**Configuration :**
```bash
# Installation d'EAS CLI
npm install -g @expo/eas-cli

# Connexion à Expo
eas login

# Configuration du projet
eas build:configure
```

### 2. Build iOS

**Build de développement :**
```bash
# Build pour simulateur
eas build --platform ios --profile development

# Build pour appareil physique
eas build --platform ios --profile development --local
```

**Build de production :**
```bash
# Build pour App Store
eas build --platform ios --profile production

# Build avec options spécifiques
eas build --platform ios --profile production --non-interactive
```

### 3. Soumission App Store

**Préparation :**
```bash
# Création de l'archive
eas submit --platform ios

# Ou avec options
eas submit --platform ios --latest
```

**App Store Connect :**
1. Créer une nouvelle version
2. Ajouter les métadonnées
3. Télécharger le build
4. Soumettre pour review

## 🤖 Déploiement Android

### 1. Configuration Android

**Keystore :**
```bash
# Génération du keystore
keytool -genkey -v -keystore accessplus.keystore -alias accessplus -keyalg RSA -keysize 2048 -validity 10000

# Configuration dans eas.json
{
  "build": {
    "production": {
      "android": {
        "buildType": "apk",
        "gradleCommand": ":app:assembleRelease"
      }
    }
  }
}
```

### 2. Build Android

**Build de développement :**
```bash
# Build APK
eas build --platform android --profile development

# Build AAB
eas build --platform android --profile production
```

**Build de production :**
```bash
# Build pour Google Play
eas build --platform android --profile production --non-interactive
```

### 3. Soumission Google Play

**Préparation :**
```bash
# Création du bundle
eas submit --platform android

# Ou avec options
eas submit --platform android --latest
```

**Google Play Console :**
1. Créer une nouvelle version
2. Télécharger le bundle
3. Ajouter les métadonnées
4. Soumettre pour review

## 🌐 Déploiement Web

### 1. Build Web

**Configuration :**
```bash
# Build pour production
npx expo export --platform web

# Ou avec options
npx expo export --platform web --clear
```

**Optimisation :**
```bash
# Optimisation des assets
npm run build:web

# Analyse du bundle
npm run analyze:web
```

### 2. Déploiement

**Vercel :**
```bash
# Installation de Vercel CLI
npm install -g vercel

# Déploiement
vercel --prod
```

**Netlify :**
```bash
# Build et déploiement
npm run build:web
netlify deploy --prod --dir=web-build
```

**Firebase Hosting :**
```bash
# Installation Firebase CLI
npm install -g firebase-tools

# Configuration
firebase init hosting

# Déploiement
firebase deploy --only hosting
```

## 🔄 Déploiement Continu (CI/CD)

### 1. Configuration GitHub Actions

**.github/workflows/deploy.yml :**
```yaml
name: Deploy AccessPlus

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test
      - run: npm run lint

  build-ios:
    needs: test
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm install -g @expo/eas-cli
      - run: eas build --platform ios --non-interactive

  build-android:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm install -g @expo/eas-cli
      - run: eas build --platform android --non-interactive

  deploy-web:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build:web
      - run: npm run deploy:web
```

### 2. Configuration EAS

**eas.json :**
```json
{
  "cli": {
    "version": ">= 3.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@example.com",
        "ascAppId": "your-app-store-connect-app-id",
        "appleTeamId": "your-apple-team-id"
      },
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json",
        "track": "production"
      }
    }
  }
}
```

## 🔧 Configuration des Services

### 1. Firebase

**Configuration de production :**
```javascript
// firebase.config.js
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID
};
```

**Règles Firestore :**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permettre la lecture de tous les lieux
    match /places/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Règles pour les avis
    match /reviews/{document} {
      allow read: if true;
      allow write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // Règles pour les utilisateurs
    match /users/{userId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == userId;
    }
  }
}
```

### 2. Google Places API

**Configuration de production :**
```javascript
// services/placesApi.js
const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY;
const BASE_URL = 'https://maps.googleapis.com/maps/api/place';

// Restrictions de sécurité
// - Limiter aux domaines de l'app
// - Définir des quotas
// - Activer la facturation
```

### 3. Notifications Push

**Configuration Expo :**
```javascript
// app.config.js
export default {
  expo: {
    // ... autres configurations
    plugins: [
      [
        "expo-notifications",
        {
          icon: "./assets/notification-icon.png",
          color: "#ffffff",
          sounds: ["./assets/notification-sound.wav"]
        }
      ]
    ]
  }
};
```

## 📊 Monitoring et Analytics

### 1. Sentry

**Configuration :**
```javascript
// App.js
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  enableAutoSessionTracking: true,
});
```

### 2. Analytics

**Expo Analytics :**
```javascript
// app.config.js
export default {
  expo: {
    // ... autres configurations
    extra: {
      eas: {
        projectId: "your-project-id"
      }
    }
  }
};
```

### 3. Performance Monitoring

**Firebase Performance :**
```javascript
// services/performanceService.js
import perf from '@react-native-firebase/perf';

export const monitorScreenLoad = async (screenName) => {
  const trace = await perf().startTrace(screenName);
  return trace;
};
```

## 🔒 Sécurité

### 1. Chiffrement

**Clés de chiffrement :**
```javascript
// services/cryptoService.js
const ENCRYPTION_KEY = process.env.EXPO_PUBLIC_ENCRYPTION_KEY;
const IV_LENGTH = 16;

export const encryptData = async (data) => {
  // Implémentation du chiffrement AES-256
};
```

### 2. Validation des Données

**Schémas de validation :**
```javascript
// utils/validation.js
import * as Yup from 'yup';

export const placeSchema = Yup.object({
  name: Yup.string().required().min(2).max(100),
  address: Yup.string().required(),
  type: Yup.string().required().oneOf(['restaurant', 'culture', 'shopping']),
  rating: Yup.number().min(0).max(5),
});
```

### 3. Protection contre les Attaques

**Rate Limiting :**
```javascript
// services/rateLimitService.js
export const checkRateLimit = async (action, userId) => {
  // Implémentation du rate limiting
};
```

## 📈 Tests de Déploiement

### 1. Tests de Smoke

```bash
# Tests de base
npm run test:smoke

# Tests de performance
npm run test:performance

# Tests d'accessibilité
npm run test:accessibility
```

### 2. Tests de Régression

```bash
# Tests complets
npm run test:regression

# Tests d'intégration
npm run test:integration

# Tests de compatibilité
npm run test:compatibility
```

### 3. Tests de Charge

```bash
# Tests de charge
npm run test:load

# Tests de stress
npm run test:stress

# Tests de volume
npm run test:volume
```

## 🚨 Gestion des Incidents

### 1. Rollback

**Stratégie de rollback :**
```bash
# Rollback vers version précédente
eas build:list
eas build:rollback --platform ios --version 1.0.1

# Rollback web
git revert HEAD
npm run deploy:web
```

### 2. Monitoring

**Alertes :**
- Erreurs critiques
- Performance dégradée
- Disponibilité du service
- Utilisation des ressources

### 3. Communication

**Plan de communication :**
- Notification aux utilisateurs
- Mise à jour du statut
- Documentation des changements
- Support utilisateur

## 📝 Checklist de Déploiement

### Pré-déploiement
- [ ] Tests complets passés
- [ ] Code review approuvé
- [ ] Configuration de production
- [ ] Assets optimisés
- [ ] Documentation mise à jour

### Déploiement
- [ ] Build de production créé
- [ ] Tests de smoke passés
- [ ] Déploiement sur staging
- [ ] Tests de validation
- [ ] Déploiement en production

### Post-déploiement
- [ ] Monitoring activé
- [ ] Tests de régression
- [ ] Validation utilisateur
- [ ] Documentation mise à jour
- [ ] Communication équipe

## 🔮 Évolutions Futures

### Améliorations Préparées
- 🚀 Déploiement automatique
- 📊 Monitoring avancé
- 🔄 Rollback automatique
- 🧪 Tests automatisés
- 📱 Multi-plateforme

### Optimisations
- ⚡ Performance améliorée
- 🔒 Sécurité renforcée
- 📈 Scalabilité
- 🌍 Internationalisation
- 🔧 Configuration dynamique

---

*Le déploiement d'AccessPlus est conçu pour être fiable, sécurisé et automatisé.* 