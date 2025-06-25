# 🔧 Guide des Services - AccessPlus

## 📋 Vue d'ensemble

Ce guide détaille tous les services d'AccessPlus, leur architecture, leurs méthodes et leur utilisation dans l'application.

## 🏗️ Architecture des Services

### Structure des Services
```
services/
├── authService.js          # Authentification et gestion utilisateurs
├── biometricService.js     # Authentification biométrique
├── configService.js        # Configuration de l'application
├── cryptoService.js        # Chiffrement et sécurité
├── firebaseService.js      # Intégration Firebase
├── notificationService.js  # Notifications push
├── placesApi.js           # API Google Places
├── placesSearch.js        # Recherche de lieux
├── simplePlacesService.js # Service de lieux simplifié
├── storageService.js      # Stockage local sécurisé
└── accessibilityService.js # Services d'accessibilité
```

## 🔐 Services d'Authentification

### AuthService

**Fichier :** `services/authService.js`

**Description :** Service principal pour la gestion de l'authentification et des utilisateurs.

**Méthodes principales :**
```javascript
// Authentification
static async login(email, password)
static async register(email, password, name)
static async logout()
static async checkUserExists(email)

// Gestion des mots de passe
static async changePassword(currentPassword, newPassword)
static async sendPasswordResetEmail(email)
static async verifyResetToken(email)
static async updatePassword(email, newPassword)

// Gestion des utilisateurs
static async getCurrentUser()
static async updateUserProfile(userData)
static async deleteUserAccount()

// Système de vérification
static async checkVerificationStatus(userId)
static async incrementReviewsAdded(userId)
static async getUserStats(userId)
static async getUserVerificationStatus(userId)
```

**Utilisation :**
```javascript
import AuthService from '../services/authService';

// Connexion
const user = await AuthService.login('user@example.com', 'password');

// Vérification du statut
const isVerified = await AuthService.checkVerificationStatus(user.id);
```

### BiometricService

**Fichier :** `services/biometricService.js`

**Description :** Service pour l'authentification biométrique (empreinte digitale, Face ID).

**Méthodes principales :**
```javascript
// Vérification de disponibilité
static async isBiometricAvailable()
static async getSupportedTypes()

// Authentification
static async authenticate(reason = "Authentification requise")
static async authenticateWithFallback()

// Gestion des préférences
static async isBiometricEnabled(email)
static async enableBiometric(email)
static async disableBiometric(email)
static async saveBiometricPreference(email, enabled)

// Configuration
static async configureBiometric()
static async checkBiometricHardware()
```

**Utilisation :**
```javascript
import BiometricService from '../services/biometricService';

// Vérifier la disponibilité
const isAvailable = await BiometricService.isBiometricAvailable();

// Authentification
const success = await BiometricService.authenticate();
```

## 🗄️ Services de Données

### FirebaseService

**Fichier :** `services/firebaseService.js`

**Description :** Service pour l'intégration avec Firebase Firestore.

**Méthodes principales :**
```javascript
// Initialisation
static async initialize()
static async initializeWithSampleData()

// Gestion des lieux
static async getAllPlaces()
static async getPlacesByCategory(category)
static async getTopRatedPlaces(limit)
static async getPlaceById(id)
static async addPlace(placeData)
static async updatePlace(id, updateData)
static async deletePlace(id)
static async searchPlacesByName(searchTerm)

// Gestion des avis
static async getReviewsForPlace(placeId)
static async addReview(reviewData)
static async updateReview(reviewId, updateData)
static async deleteReview(reviewId)

// Synchronisation
static async syncData()
static async getLastSyncTime()
```

**Utilisation :**
```javascript
import FirebaseService from '../services/firebaseService';

// Initialiser avec des données d'exemple
await FirebaseService.initializeWithSampleData();

// Récupérer tous les lieux
const places = await FirebaseService.getAllPlaces();
```

### PlacesApi

**Fichier :** `services/placesApi.js`

**Description :** Service pour l'API Google Places.

**Méthodes principales :**
```javascript
// Recherche de lieux
static async searchPlaces(query, location, radius)
static async getPlaceDetails(placeId)
static async getNearbyPlaces(location, radius, type)

// Géocodage
static async geocodeAddress(address)
static async reverseGeocode(lat, lng)

// Configuration
static async setApiKey(apiKey)
static async isApiKeyConfigured()
```

**Utilisation :**
```javascript
import PlacesApi from '../services/placesApi';

// Rechercher des lieux
const places = await PlacesApi.searchPlaces('restaurant', 'Paris', 5000);
```

### PlacesSearch

**Fichier :** `services/placesSearch.js`

**Description :** Service de recherche avancée de lieux avec cache et optimisation.

**Méthodes principales :**
```javascript
// Recherche par zones
static async searchPlacesInZones(type, zones)
static async searchAllZones(type)
static async searchZone(zone, type)

// Gestion du cache
static async getCachedResults(key)
static async cacheResults(key, results)
static async clearCache()

// Optimisation
static async deduplicatePlaces(places)
static async filterPlaces(places, filters)
static async sortPlaces(places, sortBy)
```

**Utilisation :**
```javascript
import PlacesSearch from '../services/placesSearch';

// Recherche dans toutes les zones
const places = await PlacesSearch.searchAllZones('restaurant');
```

### SimplePlacesService

**Fichier :** `services/simplePlacesService.js`

**Description :** Service de lieux simplifié avec données statiques.

**Méthodes principales :**
```javascript
// Données statiques
static getSamplePlaces()
static getPlacesByCategory(category)
static getPlaceById(id)

// Recherche
static searchPlaces(query)
static filterPlaces(places, filters)
```

## 💾 Services de Stockage

### StorageService

**Fichier :** `services/storageService.js`

**Description :** Service de stockage local sécurisé avec chiffrement AES-256.

**Méthodes principales :**
```javascript
// Stockage sécurisé
static async secureStore(key, value, encryptionKey)
static async secureRetrieve(key, encryptionKey)
static async secureRemove(key)

// Stockage standard
static async store(key, value)
static async retrieve(key)
static async remove(key)
static async clear()

// Gestion des clés
static async generateEncryptionKey()
static async getOrCreateEncryptionKey()
static async rotateEncryptionKey()

// Migration
static async migrateToSecureStorage()
static async migrateFromSecureStorage()
```

**Utilisation :**
```javascript
import StorageService from '../services/storageService';

// Stockage sécurisé
await StorageService.secureStore('userData', userData, encryptionKey);

// Récupération sécurisée
const userData = await StorageService.secureRetrieve('userData', encryptionKey);
```

### CryptoService

**Fichier :** `services/cryptoService.js`

**Description :** Service de chiffrement et de sécurité.

**Méthodes principales :**
```javascript
// Chiffrement
static async encrypt(data, key)
static async decrypt(encryptedData, key)
static async hash(data)
static async generateSalt()

// Gestion des clés
static async generateKey()
static async deriveKey(password, salt)
static async validateKey(key)

// Sécurité
static async secureRandomBytes(length)
static async timingSafeEqual(a, b)
```

**Utilisation :**
```javascript
import CryptoService from '../services/cryptoService';

// Chiffrer des données
const encrypted = await CryptoService.encrypt(sensitiveData, key);

// Déchiffrer
const decrypted = await CryptoService.decrypt(encrypted, key);
```

## ⚙️ Services de Configuration

### ConfigService

**Fichier :** `services/configService.js`

**Description :** Service de gestion de la configuration de l'application.

**Méthodes principales :**
```javascript
// Configuration générale
static async getConfig()
static async updateConfig(newConfig)
static async resetConfig()

// Paramètres utilisateur
static async getUserSettings()
static async updateUserSettings(settings)
static async getDefaultSettings()

// Configuration des APIs
static async getApiConfig()
static async updateApiConfig(config)
static async validateApiConfig(config)
```

**Utilisation :**
```javascript
import ConfigService from '../services/configService';

// Récupérer la configuration
const config = await ConfigService.getConfig();

// Mettre à jour les paramètres
await ConfigService.updateUserSettings({ theme: 'dark' });
```

## 🔔 Services de Notifications

### NotificationService

**Fichier :** `services/notificationService.js`

**Description :** Service de gestion des notifications push et locales.

**Méthodes principales :**
```javascript
// Permissions
static async requestPermissions()
static async checkPermissions()
static async getPermissionStatus()

// Notifications locales
static async scheduleLocalNotification(notification)
static async cancelLocalNotification(id)
static async cancelAllLocalNotifications()

// Notifications push
static async registerForPushNotifications()
static async getPushToken()
static async sendPushNotification(token, message)

// Gestion des notifications
static async getNotificationHistory()
static async markAsRead(notificationId)
static async clearNotificationHistory()
```

**Utilisation :**
```javascript
import NotificationService from '../services/notificationService';

// Demander les permissions
const granted = await NotificationService.requestPermissions();

// Programmer une notification
await NotificationService.scheduleLocalNotification({
  title: 'Nouveau lieu',
  body: 'Un nouveau lieu accessible a été ajouté',
  data: { placeId: '123' }
});
```

## ♿ Services d'Accessibilité

### AccessibilityService

**Fichier :** `services/accessibilityService.js`

**Description :** Service pour la gestion de l'accessibilité et des adaptations.

**Méthodes principales :**
```javascript
// Lecteur d'écran
static async isScreenReaderEnabled()
static async announceForAccessibility(message)
static async setAccessibilityFocus(ref)

// Taille des polices
static async getTextSize()
static async setTextSize(size)
static async increaseTextSize()
static async decreaseTextSize()

// Contraste et couleurs
static async isHighContrastEnabled()
static async setHighContrast(enabled)
static async getColorScheme()
static async setColorScheme(scheme)

// Navigation
static async isKeyboardNavigationEnabled()
static async setKeyboardNavigation(enabled)
static async getNavigationMode()
static async setNavigationMode(mode)
```

**Utilisation :**
```javascript
import AccessibilityService from '../services/accessibilityService';

// Vérifier le lecteur d'écran
const isEnabled = await AccessibilityService.isScreenReaderEnabled();

// Annoncer un message
await AccessibilityService.announceForAccessibility('Nouveau lieu ajouté');
```

## 🔄 Services de Synchronisation

### SyncService

**Fichier :** `services/syncService.js`

**Description :** Service de synchronisation des données entre local et distant.

**Méthodes principales :**
```javascript
// Synchronisation
static async syncAll()
static async syncPlaces()
static async syncReviews()
static async syncUserData()

// Gestion des conflits
static async resolveConflicts()
static async getLastSyncTime()
static async setLastSyncTime(timestamp)

// Mode hors ligne
static async enableOfflineMode()
static async disableOfflineMode()
static async isOfflineModeEnabled()
```

## 🧪 Tests des Services

### Scripts de test disponibles

```bash
# Test de l'authentification
node scripts/test-auth.js

# Test du stockage
node scripts/test-storage.js

# Test de la biométrie
node scripts/test-biometric.js

# Test des notifications
node scripts/test-notifications.js

# Test de la migration
node scripts/test-migration-flow.js
```

### Tests inclus

- ✅ Authentification et autorisation
- ✅ Stockage sécurisé
- ✅ Chiffrement/déchiffrement
- ✅ Intégration Firebase
- ✅ API Google Places
- ✅ Notifications
- ✅ Accessibilité
- ✅ Migration des données

## 📝 Bonnes Pratiques

### 1. **Gestion d'erreurs**
- Toujours utiliser try/catch
- Logs d'erreur détaillés
- Messages d'erreur utilisateur-friendly

### 2. **Performance**
- Cache des données fréquemment utilisées
- Requêtes optimisées
- Pagination pour les grandes listes

### 3. **Sécurité**
- Chiffrement des données sensibles
- Validation des entrées
- Gestion sécurisée des tokens

### 4. **Accessibilité**
- Support du lecteur d'écran
- Adaptation de la taille des polices
- Navigation alternative

## 🔮 Évolutions Futures

### Services prévus
- 🌐 Service de géolocalisation avancée
- 📊 Service d'analytics
- 🔍 Service de recherche sémantique
- 🤖 Service d'IA pour recommandations
- 📱 Service de partage social

### Améliorations
- ⚡ Performance optimisée
- 🔒 Sécurité renforcée
- 📱 Support hors ligne avancé
- 🌍 Internationalisation
- 🔄 Synchronisation temps réel

---

*Tous les services d'AccessPlus sont conçus pour offrir une architecture modulaire, sécurisée et performante.* 