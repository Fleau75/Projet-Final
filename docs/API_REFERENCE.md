# 📚 Référence des APIs - AccessPlus

## 📋 Vue d'ensemble

Ce guide détaille toutes les APIs utilisées dans AccessPlus, leurs endpoints, leurs paramètres et leurs réponses.

## 🔐 APIs d'Authentification

### AuthService API

**Base URL :** `services/authService.js`

#### **Connexion**
```javascript
// Méthode
static async login(email, password)

// Paramètres
{
  email: string,      // Email de l'utilisateur
  password: string    // Mot de passe
}

// Réponse
{
  success: boolean,
  user: {
    id: string,
    email: string,
    name: string,
    isVerified: boolean,
    joinDate: string
  },
  token: string,
  error?: string
}
```

#### **Inscription**
```javascript
// Méthode
static async register(email, password, name)

// Paramètres
{
  email: string,      // Email de l'utilisateur
  password: string,   // Mot de passe (min 6 caractères)
  name: string        // Nom complet
}

// Réponse
{
  success: boolean,
  user: {
    id: string,
    email: string,
    name: string,
    isVerified: false,
    joinDate: string
  },
  error?: string
}
```

#### **Déconnexion**
```javascript
// Méthode
static async logout()

// Réponse
{
  success: boolean,
  error?: string
}
```

#### **Vérification d'utilisateur**
```javascript
// Méthode
static async checkUserExists(email)

// Paramètres
{
  email: string
}

// Réponse
{
  exists: boolean,
  error?: string
}
```

#### **Réinitialisation de mot de passe**
```javascript
// Méthode
static async sendPasswordResetEmail(email)

// Paramètres
{
  email: string
}

// Réponse
{
  success: boolean,
  token: string,      // Token de réinitialisation
  expiresAt: string,  // Date d'expiration
  error?: string
}
```

#### **Mise à jour du mot de passe**
```javascript
// Méthode
static async updatePassword(email, newPassword)

// Paramètres
{
  email: string,
  newPassword: string
}

// Réponse
{
  success: boolean,
  error?: string
}
```

#### **Changement de mot de passe**
```javascript
// Méthode
static async changePassword(currentPassword, newPassword)

// Paramètres
{
  currentPassword: string,
  newPassword: string
}

// Réponse
{
  success: boolean,
  error?: string
}
```

#### **Récupération de l'utilisateur actuel**
```javascript
// Méthode
static async getCurrentUser()

// Réponse
{
  user: {
    id: string,
    email: string,
    name: string,
    isVerified: boolean,
    joinDate: string,
    lastActivity: string
  } | null,
  error?: string
}
```

#### **Mise à jour du profil**
```javascript
// Méthode
static async updateUserProfile(userData)

// Paramètres
{
  name?: string,
  email?: string,
  preferences?: object
}

// Réponse
{
  success: boolean,
  user: {
    id: string,
    email: string,
    name: string,
    preferences: object
  },
  error?: string
}
```

#### **Suppression de compte**
```javascript
// Méthode
static async deleteUserAccount()

// Réponse
{
  success: boolean,
  error?: string
}
```

## 🏆 APIs de Vérification

### **Vérification du statut**
```javascript
// Méthode
static async checkVerificationStatus(userId)

// Paramètres
{
  userId: string
}

// Réponse
{
  isVerified: boolean,
  criteria: {
    hasAccount: boolean,
    hasEnoughReviews: boolean
  },
  stats: {
    reviewsAdded: number,
    placesAdded: number
  },
  error?: string
}
```

### **Incrémentation des avis**
```javascript
// Méthode
static async incrementReviewsAdded(userId)

// Paramètres
{
  userId: string
}

// Réponse
{
  success: boolean,
  newCount: number,
  isVerified: boolean,
  error?: string
}
```

### **Récupération des statistiques**
```javascript
// Méthode
static async getUserStats(userId)

// Paramètres
{
  userId: string
}

// Réponse
{
  stats: {
    reviewsAdded: number,
    placesAdded: number,
    isVisitor: boolean,
    joinDate: string,
    lastActivity: string
  },
  error?: string
}
```

### **Statut de vérification utilisateur**
```javascript
// Méthode
static async getUserVerificationStatus(userId)

// Paramètres
{
  userId: string
}

// Réponse
{
  isVerified: boolean,
  verifiedAt: string,
  criteria: {
    hasAccount: boolean,
    hasEnoughReviews: boolean
  },
  error?: string
}
```

## 🔐 APIs Biométriques

### BiometricService API

**Base URL :** `services/biometricService.js`

#### **Vérification de disponibilité**
```javascript
// Méthode
static async isBiometricAvailable()

// Réponse
{
  available: boolean,
  types: string[],    // ['fingerprint', 'face', 'iris']
  error?: string
}
```

#### **Types supportés**
```javascript
// Méthode
static async getSupportedTypes()

// Réponse
{
  types: string[],
  hardwareAvailable: boolean,
  error?: string
}
```

#### **Authentification**
```javascript
// Méthode
static async authenticate(reason)

// Paramètres
{
  reason: string      // Raison de l'authentification
}

// Réponse
{
  success: boolean,
  error?: string
}
```

#### **Authentification avec fallback**
```javascript
// Méthode
static async authenticateWithFallback()

// Réponse
{
  success: boolean,
  method: string,     // 'biometric' | 'password'
  error?: string
}
```

#### **Vérification de l'activation**
```javascript
// Méthode
static async isBiometricEnabled(email)

// Paramètres
{
  email: string
}

// Réponse
{
  enabled: boolean,
  error?: string
}
```

#### **Activation de la biométrie**
```javascript
// Méthode
static async enableBiometric(email)

// Paramètres
{
  email: string
}

// Réponse
{
  success: boolean,
  error?: string
}
```

#### **Désactivation de la biométrie**
```javascript
// Méthode
static async disableBiometric(email)

// Paramètres
{
  email: string
}

// Réponse
{
  success: boolean,
  error?: string
}
```

#### **Sauvegarde des préférences**
```javascript
// Méthode
static async saveBiometricPreference(email, enabled)

// Paramètres
{
  email: string,
  enabled: boolean
}

// Réponse
{
  success: boolean,
  error?: string
}
```

## 🗄️ APIs Firebase

### FirebaseService API

**Base URL :** `services/firebaseService.js`

#### **Initialisation**
```javascript
// Méthode
static async initialize()

// Réponse
{
  success: boolean,
  error?: string
}
```

#### **Initialisation avec données d'exemple**
```javascript
// Méthode
static async initializeWithSampleData()

// Réponse
{
  success: boolean,
  placesAdded: number,
  error?: string
}
```

#### **Récupération de tous les lieux**
```javascript
// Méthode
static async getAllPlaces()

// Réponse
{
  places: [
    {
      id: string,
      name: string,
      address: string,
      type: string,
      rating: number,
      reviewCount: number,
      image: string,
      coordinates: {
        latitude: number,
        longitude: number
      },
      accessibility: {
        ramp: boolean,
        elevator: boolean,
        parking: boolean,
        toilets: boolean
      },
      createdAt: string,
      updatedAt: string
    }
  ],
  error?: string
}
```

#### **Filtrage par catégorie**
```javascript
// Méthode
static async getPlacesByCategory(category)

// Paramètres
{
  category: string    // 'restaurant' | 'culture' | 'shopping' | 'health' | 'sport' | 'education'
}

// Réponse
{
  places: Place[],
  error?: string
}
```

#### **Lieux les mieux notés**
```javascript
// Méthode
static async getTopRatedPlaces(limit)

// Paramètres
{
  limit: number       // Nombre de lieux à récupérer
}

// Réponse
{
  places: Place[],
  error?: string
}
```

#### **Récupération d'un lieu**
```javascript
// Méthode
static async getPlaceById(id)

// Paramètres
{
  id: string
}

// Réponse
{
  place: Place,
  error?: string
}
```

#### **Ajout d'un lieu**
```javascript
// Méthode
static async addPlace(placeData)

// Paramètres
{
  name: string,
  address: string,
  type: string,
  coordinates: {
    latitude: number,
    longitude: number
  },
  accessibility: {
    ramp: boolean,
    elevator: boolean,
    parking: boolean,
    toilets: boolean
  }
}

// Réponse
{
  success: boolean,
  placeId: string,
  error?: string
}
```

#### **Mise à jour d'un lieu**
```javascript
// Méthode
static async updatePlace(id, updateData)

// Paramètres
{
  id: string,
  updateData: object
}

// Réponse
{
  success: boolean,
  error?: string
}
```

#### **Suppression d'un lieu**
```javascript
// Méthode
static async deletePlace(id)

// Paramètres
{
  id: string
}

// Réponse
{
  success: boolean,
  error?: string
}
```

#### **Recherche par nom**
```javascript
// Méthode
static async searchPlacesByName(searchTerm)

// Paramètres
{
  searchTerm: string
}

// Réponse
{
  places: Place[],
  error?: string
}
```

## 🌐 APIs Google Places

### PlacesApi API

**Base URL :** `services/placesApi.js`

#### **Recherche de lieux**
```javascript
// Méthode
static async searchPlaces(query, location, radius)

// Paramètres
{
  query: string,      // Terme de recherche
  location: string,   // Localisation
  radius: number      // Rayon de recherche en mètres
}

// Réponse
{
  places: [
    {
      place_id: string,
      name: string,
      formatted_address: string,
      geometry: {
        location: {
          lat: number,
          lng: number
        }
      },
      types: string[],
      rating: number,
      user_ratings_total: number
    }
  ],
  error?: string
}
```

#### **Détails d'un lieu**
```javascript
// Méthode
static async getPlaceDetails(placeId)

// Paramètres
{
  placeId: string
}

// Réponse
{
  place: {
    place_id: string,
    name: string,
    formatted_address: string,
    formatted_phone_number: string,
    website: string,
    opening_hours: {
      open_now: boolean,
      weekday_text: string[]
    },
    geometry: {
      location: {
        lat: number,
        lng: number
      }
    },
    photos: [
      {
        photo_reference: string,
        height: number,
        width: number
      }
    ],
    rating: number,
    user_ratings_total: number,
    reviews: [
      {
        author_name: string,
        rating: number,
        text: string,
        time: number
      }
    ]
  },
  error?: string
}
```

#### **Lieux à proximité**
```javascript
// Méthode
static async getNearbyPlaces(location, radius, type)

// Paramètres
{
  location: {
    latitude: number,
    longitude: number
  },
  radius: number,
  type: string        // Type de lieu
}

// Réponse
{
  places: Place[],
  error?: string
}
```

#### **Géocodage**
```javascript
// Méthode
static async geocodeAddress(address)

// Paramètres
{
  address: string
}

// Réponse
{
  location: {
    latitude: number,
    longitude: number
  },
  formatted_address: string,
  error?: string
}
```

#### **Géocodage inverse**
```javascript
// Méthode
static async reverseGeocode(lat, lng)

// Paramètres
{
  lat: number,
  lng: number
}

// Réponse
{
  address: string,
  components: {
    street_number: string,
    route: string,
    locality: string,
    country: string
  },
  error?: string
}
```

## 💾 APIs de Stockage

### StorageService API

**Base URL :** `services/storageService.js`

#### **Stockage sécurisé**
```javascript
// Méthode
static async secureStore(key, value, encryptionKey)

// Paramètres
{
  key: string,
  value: any,
  encryptionKey: string
}

// Réponse
{
  success: boolean,
  error?: string
}
```

#### **Récupération sécurisée**
```javascript
// Méthode
static async secureRetrieve(key, encryptionKey)

// Paramètres
{
  key: string,
  encryptionKey: string
}

// Réponse
{
  value: any,
  error?: string
}
```

#### **Suppression sécurisée**
```javascript
// Méthode
static async secureRemove(key)

// Paramètres
{
  key: string
}

// Réponse
{
  success: boolean,
  error?: string
}
```

#### **Stockage standard**
```javascript
// Méthode
static async store(key, value)

// Paramètres
{
  key: string,
  value: any
}

// Réponse
{
  success: boolean,
  error?: string
}
```

#### **Récupération standard**
```javascript
// Méthode
static async retrieve(key)

// Paramètres
{
  key: string
}

// Réponse
{
  value: any,
  error?: string
}
```

#### **Suppression standard**
```javascript
// Méthode
static async remove(key)

// Paramètres
{
  key: string
}

// Réponse
{
  success: boolean,
  error?: string
}
```

#### **Nettoyage complet**
```javascript
// Méthode
static async clear()

// Réponse
{
  success: boolean,
  error?: string
}
```

#### **Génération de clé de chiffrement**
```javascript
// Méthode
static async generateEncryptionKey()

// Réponse
{
  key: string,
  error?: string
}
```

#### **Récupération ou création de clé**
```javascript
// Méthode
static async getOrCreateEncryptionKey()

// Réponse
{
  key: string,
  error?: string
}
```

#### **Rotation de clé**
```javascript
// Méthode
static async rotateEncryptionKey()

// Réponse
{
  success: boolean,
  newKey: string,
  error?: string
}
```

## 🔔 APIs de Notifications

### NotificationService API

**Base URL :** `services/notificationService.js`

#### **Demande de permissions**
```javascript
// Méthode
static async requestPermissions()

// Réponse
{
  granted: boolean,
  status: string,     // 'granted' | 'denied' | 'undetermined'
  error?: string
}
```

#### **Vérification des permissions**
```javascript
// Méthode
static async checkPermissions()

// Réponse
{
  status: string,
  error?: string
}
```

#### **Statut des permissions**
```javascript
// Méthode
static async getPermissionStatus()

// Réponse
{
  status: string,
  canAskAgain: boolean,
  error?: string
}
```

#### **Programmation de notification locale**
```javascript
// Méthode
static async scheduleLocalNotification(notification)

// Paramètres
{
  title: string,
  body: string,
  data?: object,
  trigger?: {
    seconds?: number,
    date?: Date
  }
}

// Réponse
{
  success: boolean,
  notificationId: string,
  error?: string
}
```

#### **Annulation de notification**
```javascript
// Méthode
static async cancelLocalNotification(id)

// Paramètres
{
  id: string
}

// Réponse
{
  success: boolean,
  error?: string
}
```

#### **Annulation de toutes les notifications**
```javascript
// Méthode
static async cancelAllLocalNotifications()

// Réponse
{
  success: boolean,
  error?: string
}
```

#### **Enregistrement pour notifications push**
```javascript
// Méthode
static async registerForPushNotifications()

// Réponse
{
  success: boolean,
  token: string,
  error?: string
}
```

#### **Récupération du token push**
```javascript
// Méthode
static async getPushToken()

// Réponse
{
  token: string,
  error?: string
}
```

#### **Envoi de notification push**
```javascript
// Méthode
static async sendPushNotification(token, message)

// Paramètres
{
  token: string,
  message: {
    title: string,
    body: string,
    data?: object
  }
}

// Réponse
{
  success: boolean,
  error?: string
}
```

## ♿ APIs d'Accessibilité

### AccessibilityService API

**Base URL :** `services/accessibilityService.js`

#### **Vérification du lecteur d'écran**
```javascript
// Méthode
static async isScreenReaderEnabled()

// Réponse
{
  enabled: boolean,
  error?: string
}
```

#### **Annonce pour l'accessibilité**
```javascript
// Méthode
static async announceForAccessibility(message)

// Paramètres
{
  message: string
}

// Réponse
{
  success: boolean,
  error?: string
}
```

#### **Définition du focus**
```javascript
// Méthode
static async setAccessibilityFocus(ref)

// Paramètres
{
  ref: React.RefObject
}

// Réponse
{
  success: boolean,
  error?: string
}
```

#### **Récupération de la taille de police**
```javascript
// Méthode
static async getTextSize()

// Réponse
{
  size: number,       // 1 = normal, 2 = large, 3 = extra large
  error?: string
}
```

#### **Définition de la taille de police**
```javascript
// Méthode
static async setTextSize(size)

// Paramètres
{
  size: number
}

// Réponse
{
  success: boolean,
  error?: string
}
```

#### **Augmentation de la taille**
```javascript
// Méthode
static async increaseTextSize()

// Réponse
{
  success: boolean,
  newSize: number,
  error?: string
}
```

#### **Diminution de la taille**
```javascript
// Méthode
static async decreaseTextSize()

// Réponse
{
  success: boolean,
  newSize: number,
  error?: string
}
```

## 🔄 APIs de Migration

### **Migration vers stockage sécurisé**
```javascript
// Méthode
static async migrateToSecureStorage()

// Réponse
{
  success: boolean,
  migratedItems: number,
  error?: string
}
```

### **Migration depuis stockage sécurisé**
```javascript
// Méthode
static async migrateFromSecureStorage()

// Réponse
{
  success: boolean,
  migratedItems: number,
  error?: string
}
```

## 📊 Codes d'Erreur

### **Codes d'erreur communs**

```javascript
const ERROR_CODES = {
  // Authentification
  AUTH_INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
  AUTH_USER_NOT_FOUND: 'AUTH_USER_NOT_FOUND',
  AUTH_EMAIL_ALREADY_EXISTS: 'AUTH_EMAIL_ALREADY_EXISTS',
  AUTH_WEAK_PASSWORD: 'AUTH_WEAK_PASSWORD',
  AUTH_TOKEN_EXPIRED: 'AUTH_TOKEN_EXPIRED',
  
  // Réseau
  NETWORK_ERROR: 'NETWORK_ERROR',
  API_UNAVAILABLE: 'API_UNAVAILABLE',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  
  // Stockage
  STORAGE_FULL: 'STORAGE_FULL',
  STORAGE_CORRUPTED: 'STORAGE_CORRUPTED',
  ENCRYPTION_ERROR: 'ENCRYPTION_ERROR',
  
  // Biométrie
  BIOMETRIC_NOT_AVAILABLE: 'BIOMETRIC_NOT_AVAILABLE',
  BIOMETRIC_NOT_ENROLLED: 'BIOMETRIC_NOT_ENROLLED',
  BIOMETRIC_LOCKOUT: 'BIOMETRIC_LOCKOUT',
  
  // Permissions
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  PERMISSION_UNAVAILABLE: 'PERMISSION_UNAVAILABLE',
  
  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  
  // Général
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  NOT_IMPLEMENTED: 'NOT_IMPLEMENTED'
};
```

## 📝 Exemples d'Utilisation

### **Exemple complet d'authentification**
```javascript
import AuthService from '../services/authService';

const loginUser = async (email, password) => {
  try {
    const result = await AuthService.login(email, password);
    
    if (result.success) {
      console.log('Connexion réussie:', result.user);
      return result.user;
    } else {
      console.error('Erreur de connexion:', result.error);
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('Exception lors de la connexion:', error);
    throw error;
  }
};
```

### **Exemple de gestion des lieux**
```javascript
import FirebaseService from '../services/firebaseService';

const loadPlaces = async (category = null) => {
  try {
    let places;
    
    if (category) {
      const result = await FirebaseService.getPlacesByCategory(category);
      places = result.places;
    } else {
      const result = await FirebaseService.getAllPlaces();
      places = result.places;
    }
    
    return places;
  } catch (error) {
    console.error('Erreur lors du chargement des lieux:', error);
    return [];
  }
};
```

### **Exemple de stockage sécurisé**
```javascript
import StorageService from '../services/storageService';

const saveUserData = async (userData) => {
  try {
    const encryptionKey = await StorageService.getOrCreateEncryptionKey();
    const result = await StorageService.secureStore('userData', userData, encryptionKey);
    
    if (result.success) {
      console.log('Données utilisateur sauvegardées');
    } else {
      console.error('Erreur de sauvegarde:', result.error);
    }
  } catch (error) {
    console.error('Exception lors de la sauvegarde:', error);
  }
};
```

---

*Cette référence API couvre toutes les interfaces utilisées dans AccessPlus. Pour plus de détails, consultez les fichiers de service correspondants.* 