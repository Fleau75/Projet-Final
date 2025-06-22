# Configuration Firebase pour AccessPlus

Ce guide vous explique comment configurer Firebase pour utiliser de vraies données de base de données dans votre app AccessPlus.

## 🚀 Étapes de configuration

### 1. Créer un projet Firebase

1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Cliquez sur "Créer un projet"
3. Donnez un nom à votre projet (ex: "accessplus-app")
4. Activez Google Analytics si vous le souhaitez
5. Cliquez sur "Créer le projet"

### 2. Configurer Firestore Database

1. Dans votre projet Firebase, allez dans "Database" > "Firestore Database"
2. Cliquez sur "Créer une base de données"
3. Choisissez "Démarrer en mode test" (vous pourrez modifier les règles plus tard)
4. Sélectionnez une région proche de vos utilisateurs

### 3. Obtenir la configuration Firebase

1. Allez dans "Paramètres du projet" (icône engrenage)
2. Dans l'onglet "Général", descendez jusqu'à "Vos applications"
3. Cliquez sur "Ajouter une application" et sélectionnez "Web"
4. Donnez un nom à votre app (ex: "AccessPlus Web")
5. Copiez la configuration qui apparaît

### 4. Configurer l'app

1. Copiez le fichier `firebase.config.example.js` vers `firebase.config.js`
2. Remplacez les valeurs avec votre vraie configuration Firebase
3. Ou modifiez directement le fichier `services/firebaseService.js`

```javascript
const firebaseConfig = {
  apiKey: "votre-vraie-api-key",
  authDomain: "votre-projet.firebaseapp.com",
  projectId: "votre-projet-id",
  storageBucket: "votre-projet.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

### 5. Initialiser avec des données d'exemple

Pour ajouter des lieux d'exemple dans votre base de données :

```bash
node scripts/initDatabase.js
```

Ou utilisez directement la fonction dans votre app :

```javascript
import PlacesService from './services/firebaseService';

// Dans votre composant ou lors du premier lancement
await PlacesService.initializeWithSampleData();
```

## 📊 Structure des données

### Collection "places"

Chaque lieu contient les champs suivants :

```json
{
  "name": "Nom du lieu",
  "address": "Adresse complète",
  "type": "restaurant|culture|shopping|health|sport|education",
  "rating": 4.5,
  "reviewCount": 42,
  "image": "URL de l'image (optionnel)",
  "coordinates": {
    "latitude": 48.8627,
    "longitude": 2.3578
  },
  "accessibility": {
    "ramp": true,
    "elevator": true,
    "parking": true,
    "toilets": true
  },
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## 🔒 Règles de sécurité Firestore

Pour la production, configurez des règles de sécurité appropriées dans Firestore :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permettre la lecture de tous les lieux
    match /places/{document} {
      allow read: if true;
      allow write: if request.auth != null; // Seuls les utilisateurs authentifiés peuvent écrire
    }
    
    // Règles pour les avis (si vous les ajoutez plus tard)
    match /reviews/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## 🛠️ Fonctionnalités disponibles

### Service PlacesService

Le service `PlacesService` dans `services/firebaseService.js` offre les méthodes suivantes :

- `getAllPlaces()` - Récupère tous les lieux
- `getPlacesByCategory(category)` - Filtre par catégorie
- `getTopRatedPlaces(limit)` - Lieux les mieux notés
- `getPlaceById(id)` - Récupère un lieu spécifique
- `addPlace(placeData)` - Ajoute un nouveau lieu
- `updatePlace(id, updateData)` - Met à jour un lieu
- `deletePlace(id)` - Supprime un lieu
- `searchPlacesByName(searchTerm)` - Recherche par nom

### HomeScreen intégré

L'écran d'accueil charge automatiquement les données depuis Firestore et les combine avec les lieux Google Places API si disponibles.

## 🔄 Synchronisation des données

L'app se synchronise automatiquement avec Firestore :

- Au chargement de l'écran d'accueil
- Quand l'écran redevient focus
- Avec un bouton "Réessayer" en cas d'erreur

## 📝 Ajouter de nouveaux lieux

Vous pouvez ajouter de nouveaux lieux de plusieurs façons :

1. **Directement dans Firebase Console** - Interface web
2. **Via l'app** - En utilisant `PlacesService.addPlace()`
3. **Script d'import** - Créez un script pour importer en masse

## 🐛 Dépannage

### Erreur "Permission denied"
- Vérifiez vos règles Firestore
- Assurez-vous que l'authentification est configurée si nécessaire

### Erreur "Project not found"
- Vérifiez votre `projectId` dans la configuration
- Assurez-vous que Firestore est activé

### Pas de données affichées
- Vérifiez que des données existent dans Firestore
- Utilisez le script d'initialisation
- Vérifiez la console pour les erreurs

## 🎉 Vous êtes prêt !

Votre app AccessPlus utilise maintenant de vraies données de base de données ! Les lieux s'afficheront automatiquement sur l'écran d'accueil et vous pourrez facilement en ajouter de nouveaux via Firestore. 