# CAHIER DES CHARGES FONCTIONNEL & TECHNIQUE – ACCESSPLUS

---

## 1. PRÉSENTATION DU PROJET

### 1.1 Objectif
AccessPlus est une application mobile (React Native/Expo) dédiée à l'accessibilité universelle : elle permet aux Personnes à Mobilité Réduite (PMR) et à tous les utilisateurs de trouver, évaluer et recommander des lieux accessibles, en s'appuyant sur la géolocalisation, la communauté, et des standards d'accessibilité avancés.

### 1.2 Public Cible
- PMR (fauteuils roulants, seniors, parents avec poussette…)
- Aidants, familles, professionnels médico-sociaux
- Établissements publics et privés
- Toute personne souhaitant contribuer à l'accessibilité

### 1.3 Valeur Ajoutée
- Données communautaires et vérifiées
- Recherche intelligente et cartographie
- Système de badge vérifié et gamification
- Sécurité, confidentialité, accessibilité exemplaires

---

## 2. FONCTIONNALITÉS FONCTIONNELLES

### 2.1 Authentification & Gestion Utilisateur
- Inscription/connexion par email/mot de passe
- Authentification biométrique (empreinte, Face ID)
- Mode visiteur (accès sans compte, migration possible)
- Réinitialisation et changement de mot de passe
- Gestion du profil (nom, email, avatar, préférences)
- Suppression de compte

### 2.2 Recherche & Découverte
- Recherche textuelle, par catégorie, par accessibilité
- Filtres avancés (rampe, ascenseur, parking, toilettes)
- Recherche géolocalisée (zones, rayon, carte)
- Suggestions intelligentes et favoris

### 2.3 Cartographie & Navigation
- Carte interactive (Google Maps, marqueurs personnalisés)
- Affichage des lieux accessibles, détails, itinéraires
- Navigation entre liste, carte, détail, avis
- Mode hors-ligne (fallback sur données locales)

### 2.4 Lieux & Avis
- Fiche lieu : nom, adresse, type, accessibilité, photos
- Ajout/modification/suppression de lieux (utilisateurs vérifiés)
- Système d'avis : note, commentaire, photos, critères d'accessibilité
- Historique et gestion des avis (édition, suppression)
- Favoris, historique de navigation, suggestions personnalisées

### 2.5 Système Communautaire & Badges
- Badge vérifié (3 avis minimum, compte créé)
- Statistiques utilisateur (avis, lieux ajoutés, progression)
- Notifications (nouveaux lieux, badges, sécurité)
- Système de progression (badges bronze, argent, or, platine)

### 2.6 Accessibilité & Personnalisation
- Thème clair/sombre automatique
- Taille de texte ajustable (jusqu'à 200%)
- Support complet des lecteurs d'écran (VoiceOver, TalkBack)
- Navigation clavier, focus, feedback haptique
- Contraste élevé, couleurs accessibles
- Labels et rôles d'accessibilité sur tous les éléments

### 2.7 Sécurité & Confidentialité
- Chiffrement AES-256 des données sensibles (stockage local)
- Authentification Firebase sécurisée
- Permissions granulaire (écriture, modification, suppression)
- Respect RGPD : consentement, export, suppression des données
- Stockage sécurisé des tokens, clés API, préférences

---

## 3. ARCHITECTURE TECHNIQUE

### 3.1 Stack & Outils
- **Frontend** : React Native 0.79.2, Expo SDK 53
- **Navigation** : React Navigation 6
- **UI** : React Native Paper, Material Icons
- **Cartographie** : react-native-maps, Google Maps API
- **Backend** : Firebase Auth, Firestore, Storage
- **API externe** : Google Places API
- **Stockage local** : AsyncStorage, chiffrement AES-256
- **Tests** : scripts Node.js, Jest, Expo
- **CI/CD** : GitHub Actions, EAS Build, Vercel/Netlify (web)

### 3.2 Structure du Code
```
Projet-Final-main/
├── screens/           # Écrans principaux
├── components/        # Composants réutilisables
├── services/          # Services (auth, storage, places, etc.)
├── theme/             # Contextes, thèmes, accessibilité
├── assets/            # Images, icônes
├── scripts/           # Scripts de test, migration, debug
├── docs/              # Documentation complète
├── App.js, index.js   # Entrée de l'app
```

### 3.3 Diagrammes d'Architecture

#### 3.3.1 Architecture Système Globale

```mermaid
graph TB
    %% Application Mobile
    subgraph "Application Mobile (React Native + Expo)"
        UI[Interface Utilisateur]
        NAV[Navigation React Navigation]
        COMP[Composants UI]
        CONTEXT[Contextes React]
        THEME[Thèmes & Accessibilité]
    end
    
    %% Services Locaux
    subgraph "Services Locaux"
        ASYNC[AsyncStorage]
        CRYPTO[CryptoService AES-256]
        LOC[Géolocalisation]
        CACHE[Cache Local]
        BIOMETRIC[BiometricService]
    end
    
    %% Services Externes
    subgraph "Services Externes"
        FIREBASE[Firebase Platform]
        GOOGLE[Google Cloud Platform]
    end
    
    %% Firebase Services
    subgraph "Firebase Services"
        AUTH[Authentication]
        FIRESTORE[Firestore Database]
        STORAGE[Cloud Storage]
        FUNCTIONS[Cloud Functions]
    end
    
    %% Google Services
    subgraph "Google APIs"
        PLACES[Places API]
        MAPS[Maps API]
        GEOLOC[Geolocation API]
    end
    
    %% Base de Données
    subgraph "Collections Firestore"
        USERS[(Users)]
        PLACES_DB[(Places)]
        REVIEWS[(Reviews)]
        FAVORITES[(Favorites)]
        BADGES[(Badges)]
    end
    
    %% Connexions
    UI --> NAV
    UI --> COMP
    COMP --> CONTEXT
    CONTEXT --> THEME
    CONTEXT --> ASYNC
    CONTEXT --> CACHE
    CONTEXT --> CRYPTO
    CONTEXT --> BIOMETRIC
    
    UI --> FIREBASE
    UI --> GOOGLE
    
    FIREBASE --> AUTH
    FIREBASE --> FIRESTORE
    FIREBASE --> STORAGE
    FIREBASE --> FUNCTIONS
    
    GOOGLE --> PLACES
    GOOGLE --> MAPS
    GOOGLE --> GEOLOC
    
    FIRESTORE --> USERS
    FIRESTORE --> PLACES_DB
    FIRESTORE --> REVIEWS
    FIRESTORE --> FAVORITES
    FIRESTORE --> BADGES
    
    LOC --> GEOLOC
    CACHE --> STORAGE
    CRYPTO --> ASYNC
    
    %% Styles
    classDef mobile fill:#e1f5fe
    classDef service fill:#f3e5f5
    classDef firebase fill:#ffebee
    classDef google fill:#e8f5e8
    classDef database fill:#fff3e0
    
    class UI,NAV,COMP,CONTEXT,THEME mobile
    class ASYNC,CRYPTO,LOC,CACHE,BIOMETRIC service
    class AUTH,FIRESTORE,STORAGE,FUNCTIONS firebase
    class PLACES,MAPS,GEOLOC google
    class USERS,PLACES_DB,REVIEWS,FAVORITES,BADGES database
```

#### 3.3.2 Flux d'Authentification et Migration

```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant UI as Interface
    participant AUTH as AuthService
    participant BIO as BiometricService
    participant STORAGE as StorageService
    participant FIREBASE as Firebase Auth
    participant DB as Firestore
    
    %% Connexion normale
    U->>UI: Saisie email/password
    UI->>AUTH: login(email, password)
    AUTH->>FIREBASE: authenticateUser()
    FIREBASE-->>AUTH: userToken
    AUTH->>STORAGE: secureStore(userData)
    AUTH-->>UI: success + userData
    UI-->>U: Accès à l'app
    
    %% Authentification biométrique
    U->>UI: Utilise biométrie
    UI->>BIO: authenticate()
    BIO->>UI: success
    UI->>AUTH: getCurrentUser()
    AUTH->>STORAGE: secureRetrieve(userData)
    AUTH-->>UI: userData
    UI-->>U: Accès à l'app
    
    %% Mode visiteur
    U->>UI: Continue en visiteur
    UI->>STORAGE: store(visitorData)
    UI-->>U: Accès limité
    
    %% Migration visiteur → compte
    U->>UI: Créer un compte
    UI->>AUTH: register(email, password, name)
    AUTH->>FIREBASE: createUser()
    FIREBASE-->>AUTH: newUser
    AUTH->>STORAGE: migrateVisitorData()
    AUTH->>DB: saveUserData()
    AUTH-->>UI: success + userData
    UI-->>U: Compte créé, données migrées
```

#### 3.3.3 Flux de Recherche et Affichage des Lieux

```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant UI as Interface
    participant PLACES as PlacesService
    participant GOOGLE as Google Places API
    participant FIREBASE as Firebase
    participant CACHE as Cache Local
    
    %% Recherche de lieux
    U->>UI: Recherche de lieux
    UI->>PLACES: searchPlaces(query, filters)
    
    alt Données en cache disponibles
        PLACES->>CACHE: getCachedResults()
        CACHE-->>PLACES: cachedPlaces
        PLACES-->>UI: places
    else Pas de cache ou actualisation
        PLACES->>GOOGLE: searchPlacesAPI()
        GOOGLE-->>PLACES: googlePlaces
        PLACES->>FIREBASE: getPlacesFromDB()
        FIREBASE-->>PLACES: dbPlaces
        PLACES->>PLACES: mergeAndDeduplicate()
        PLACES->>CACHE: cacheResults()
        PLACES-->>UI: mergedPlaces
    end
    
    UI->>UI: renderPlaces()
    UI-->>U: Affichage des lieux
    
    %% Sélection d'un lieu
    U->>UI: Sélectionne un lieu
    UI->>PLACES: getPlaceDetails(placeId)
    PLACES->>FIREBASE: getPlaceById()
    FIREBASE-->>PLACES: placeDetails
    PLACES->>FIREBASE: getReviewsForPlace()
    FIREBASE-->>PLACES: reviews
    PLACES-->>UI: placeWithReviews
    UI-->>U: Détails du lieu
```

#### 3.3.4 Flux d'Ajout d'Avis et Badge Vérifié

```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant UI as Interface
    participant REVIEW as ReviewService
    participant AUTH as AuthService
    participant FIREBASE as Firebase
    participant BADGE as BadgeService
    
    %% Ajout d'un avis
    U->>UI: Ajoute un avis
    UI->>REVIEW: addReview(reviewData)
    REVIEW->>AUTH: getCurrentUser()
    AUTH-->>REVIEW: userData
    REVIEW->>FIREBASE: saveReview()
    FIREBASE-->>REVIEW: reviewId
    
    %% Incrémentation du compteur
    REVIEW->>AUTH: incrementReviewsAdded(userId)
    AUTH->>AUTH: updateUserStats()
    AUTH->>FIREBASE: updateUserStats()
    
    %% Vérification du badge
    AUTH->>BADGE: checkVerificationStatus(userId)
    BADGE->>FIREBASE: getUserStats()
    FIREBASE-->>BADGE: userStats
    
    alt Critères remplis (3+ avis, compte créé)
        BADGE->>FIREBASE: setUserVerified()
        BADGE->>AUTH: updateVerificationStatus()
        BADGE-->>AUTH: isVerified = true
        AUTH-->>REVIEW: badgeGranted
        REVIEW-->>UI: success + badgeGranted
        UI-->>U: Avis ajouté + Badge vérifié !
    else Critères non remplis
        BADGE-->>AUTH: isVerified = false
        AUTH-->>REVIEW: success
        REVIEW-->>UI: success
        UI-->>U: Avis ajouté
    end
```

#### 3.3.5 Architecture de Sécurité et Chiffrement

```mermaid
graph TB
    %% Couches de sécurité
    subgraph "Couche Application"
        UI[Interface Utilisateur]
        VALID[Validation des Données]
        SANIT[Sanitisation Input]
    end
    
    subgraph "Couche Authentification"
        AUTH[Firebase Auth]
        BIO[Biometric Auth]
        TOKEN[JWT Tokens]
        SESSION[Gestion Sessions]
    end
    
    subgraph "Couche Chiffrement"
        CRYPTO[CryptoService]
        AES[AES-256 Encryption]
        KEY[Gestion des Clés]
        IV[Vecteurs d'Initialisation]
    end
    
    subgraph "Couche Stockage"
        SECURE[Stockage Sécurisé]
        ASYNC[AsyncStorage]
        ISOLATION[Isolation Utilisateur]
        MIGRATION[Migration Sécurisée]
    end
    
    subgraph "Couche Réseau"
        HTTPS[HTTPS/TLS]
        API[API Security]
        RATE[Rate Limiting]
        CORS[CORS Policy]
    end
    
    subgraph "Couche Base de Données"
        RULES[Firestore Rules]
        PERM[Permissions]
        AUDIT[Audit Logs]
        BACKUP[Backup Automatique]
    end
    
    %% Connexions de sécurité
    UI --> VALID
    VALID --> SANIT
    SANIT --> AUTH
    AUTH --> BIO
    AUTH --> TOKEN
    TOKEN --> SESSION
    
    UI --> CRYPTO
    CRYPTO --> AES
    AES --> KEY
    AES --> IV
    
    CRYPTO --> SECURE
    SECURE --> ASYNC
    ASYNC --> ISOLATION
    ISOLATION --> MIGRATION
    
    UI --> HTTPS
    HTTPS --> API
    API --> RATE
    API --> CORS
    
    API --> RULES
    RULES --> PERM
    PERM --> AUDIT
    AUDIT --> BACKUP
    
    %% Styles
    classDef app fill:#e3f2fd
    classDef auth fill:#f3e5f5
    classDef crypto fill:#fff3e0
    classDef storage fill:#e8f5e8
    classDef network fill:#ffebee
    classDef db fill:#fce4ec
    
    class UI,VALID,SANIT app
    class AUTH,BIO,TOKEN,SESSION auth
    class CRYPTO,AES,KEY,IV crypto
    class SECURE,ASYNC,ISOLATION,MIGRATION storage
    class HTTPS,API,RATE,CORS network
    class RULES,PERM,AUDIT,BACKUP db
```

#### 3.3.6 Modèle de Données et Relations

```mermaid
erDiagram
    USERS {
        string id PK
        string email
        string name
        string avatar
        boolean isVisitor
        boolean isVerified
        date joinDate
        object stats
        object preferences
    }
    
    PLACES {
        string id PK
        string name
        string address
        string type
        object coordinates
        object accessibility
        number rating
        number reviewCount
        string image
        date createdAt
        date updatedAt
    }
    
    REVIEWS {
        string id PK
        string placeId FK
        string userId FK
        number rating
        string comment
        array photos
        object accessibility
        date createdAt
        date updatedAt
    }
    
    FAVORITES {
        string userId FK
        string placeId FK
        date addedAt
    }
    
    BADGES {
        string userId FK
        boolean isVerified
        date verifiedAt
        object criteria
    }
    
    USERS ||--o{ REVIEWS : "publie"
    USERS ||--o{ FAVORITES : "ajoute"
    USERS ||--o| BADGES : "possède"
    PLACES ||--o{ REVIEWS : "reçoit"
    PLACES ||--o{ FAVORITES : "est_favori"
```

#### 3.3.7 Flux d'Accessibilité et Personnalisation

```mermaid
graph LR
    %% Flux d'accessibilité
    subgraph "Détection"
        SCREEN[Screen Reader]
        CONTRAST[Contraste]
        TEXT_SIZE[Taille Texte]
        THEME[Thème]
    end
    
    subgraph "Adaptation"
        ACCESS[AccessibilityService]
        ANNOUNCE[Annonces]
        FOCUS[Gestion Focus]
        NAV[Navigation]
    end
    
    subgraph "Interface"
        COMP[Composants]
        LABELS[Labels]
        ROLES[Rôles]
        HINTS[Hints]
    end
    
    subgraph "Tests"
        VOICEOVER[VoiceOver]
        TALKBACK[TalkBack]
        LIGHTHOUSE[Lighthouse]
        MANUAL[Tests Manuels]
    end
    
    SCREEN --> ACCESS
    CONTRAST --> ACCESS
    TEXT_SIZE --> ACCESS
    THEME --> ACCESS
    
    ACCESS --> ANNOUNCE
    ACCESS --> FOCUS
    ACCESS --> NAV
    
    ANNOUNCE --> COMP
    FOCUS --> COMP
    NAV --> COMP
    
    COMP --> LABELS
    COMP --> ROLES
    COMP --> HINTS
    
    LABELS --> VOICEOVER
    ROLES --> TALKBACK
    HINTS --> LIGHTHOUSE
    COMP --> MANUAL
    
    %% Styles
    classDef detection fill:#e8f5e8
    classDef adaptation fill:#fff3e0
    classDef interface fill:#f3e5f5
    classDef tests fill:#ffebee
    
    class SCREEN,CONTRAST,TEXT_SIZE,THEME detection
    class ACCESS,ANNOUNCE,FOCUS,NAV adaptation
    class COMP,LABELS,ROLES,HINTS interface
    class VOICEOVER,TALKBACK,LIGHTHOUSE,MANUAL tests
```

### 3.4 Services & APIs
- **authService** : gestion complète de l'authentification, migration visiteur, badge
- **biometricService** : gestion biométrie, fallback sécurisé
- **firebaseService** : CRUD lieux, avis, favoris, synchronisation
- **placesApi** : intégration Google Places (recherche, détails, géocodage)
- **storageService** : stockage local sécurisé, migration, isolation utilisateur
- **notificationService** : notifications locales et push
- **accessibilityService** : gestion des préférences, annonces, focus

### 3.5 Sécurité & RGPD
- Chiffrement AES-256 (données locales, clés générées par utilisateur)
- Permissions Firebase (règles Firestore, accès restreint)
- Stockage des tokens sécurisé, rotation des clés
- Export/suppression des données sur demande
- Consentement explicite à la première utilisation

### 3.6 Accessibilité Technique
- Labels, rôles, hints sur tous les composants
- Navigation clavier, focus visible, feedback haptique
- Tests automatisés d'accessibilité (scripts, Lighthouse, VoiceOver)
- Conformité WCAG 2.1 AA, RGAA, Section 508

### 3.7 Tests & Qualité
- Scripts de test pour : auth, biométrie, stockage, migration, notifications, accessibilité, composants, écrans, navigation, performance
- Couverture cible : 80%+
- Tests d'intégration (navigation, flux utilisateur, API)
- Tests d'accessibilité automatisés et manuels
- CI/CD avec tests avant build/déploiement

### 3.8 Déploiement & Maintenance
- Environnements : dev, staging, production
- Déploiement mobile : EAS Build (iOS, Android), stores
- Déploiement web : Vercel/Netlify/Firebase Hosting
- Monitoring : Sentry, Firebase Analytics, logs custom
- Rollback, versioning, mises à jour OTA
- Scripts de migration et de diagnostic

---

## 4. MODÈLES DE DONNÉES PRINCIPAUX

### 4.1 Utilisateur
```json
{
  "id": "string",
  "email": "string",
  "name": "string",
  "avatar": "string",
  "isVisitor": "boolean",
  "isVerified": "boolean",
  "joinDate": "date",
  "stats": {
    "reviewsAdded": "number",
    "placesAdded": "number"
  },
  "preferences": {
    "accessibility": { "ramp": true, "elevator": false, ... },
    "theme": "light|dark",
    "textSize": "normal|large|xlarge"
  }
}
```

### 4.2 Lieu
```json
{
  "id": "string",
  "name": "string",
  "address": "string",
  "type": "string",
  "coordinates": { "latitude": 0, "longitude": 0 },
  "accessibility": { "ramp": true, "elevator": false, ... },
  "rating": 4.5,
  "reviewCount": 12,
  "image": "string",
  "createdAt": "date",
  "updatedAt": "date"
}
```

### 4.3 Avis
```json
{
  "id": "string",
  "placeId": "string",
  "userId": "string",
  "rating": 5,
  "comment": "string",
  "photos": ["string"],
  "accessibility": { "ramp": true, ... },
  "createdAt": "date",
  "updatedAt": "date"
}
```

### 4.4 Favoris
```json
{
  "userId": "string",
  "placeId": "string",
  "addedAt": "date"
}
```

### 4.5 Badge Vérifié
```json
{
  "userId": "string",
  "isVerified": true,
  "verifiedAt": "date",
  "criteria": { "hasAccount": true, "hasEnoughReviews": true }
}
```

---

## 5. FLUX & ENDPOINTS PRINCIPAUX

### 5.1 Authentification & Migration
- POST /auth/register, /auth/login, /auth/logout
- POST /auth/biometric (init, enable, disable)
- POST /auth/visitor (init, migrate)
- POST /auth/password-reset, /auth/change-password

### 5.2 Lieux & Avis
- GET /places, /places/:id
- POST /places (création), PATCH /places/:id (modif), DELETE /places/:id
- GET /places/:id/reviews, POST /places/:id/reviews
- PATCH /reviews/:id, DELETE /reviews/:id

### 5.3 Favoris & Historique
- GET /users/:id/favorites, POST /users/:id/favorites, DELETE /users/:id/favorites/:placeId
- GET /users/:id/history

### 5.4 Badge & Statistiques
- GET /users/:id/badge, GET /users/:id/stats

### 5.5 Notifications
- POST /notifications/local, /notifications/push
- GET /users/:id/notifications

### 5.6 Accessibilité & Préférences
- GET/POST /users/:id/preferences
- GET /accessibility/status

---

## 6. ACCESSIBILITÉ & RGPD

### 6.1 Accessibilité
- Conformité WCAG 2.1 AA, RGAA, Section 508
- Tests manuels et automatisés (scripts, Lighthouse, VoiceOver)
- Labels, rôles, hints sur tous les composants
- Navigation clavier, focus visible, feedback haptique
- Taille de texte ajustable, contraste élevé

### 6.2 RGPD & Confidentialité
- Consentement explicite à la première utilisation
- Export/suppression des données sur demande
- Données chiffrées localement (AES-256)
- Aucune donnée biométrique stockée côté serveur
- Journalisation minimale, anonymisation des logs

---

## 7. TESTS, QUALITÉ & MAINTENANCE

### 7.1 Stratégie de Test
- Tests unitaires (composants, services, hooks)
- Tests d'intégration (navigation, flux, API)
- Tests d'accessibilité (scripts, lecteurs d'écran)
- Tests de performance (chargement, mémoire, batterie)
- Scripts de test automatisés (Node.js, Jest, Expo)
- Couverture cible : 80%+

### 7.2 CI/CD & Déploiement
- GitHub Actions : lint, test, build, déploiement
- EAS Build (Expo) : iOS, Android, OTA
- Vercel/Netlify/Firebase Hosting pour le web
- Monitoring : Sentry, Firebase Analytics
- Rollback, versioning, mises à jour OTA

### 7.3 Maintenance & Support
- Scripts de migration, debug, diagnostic
- Documentation exhaustive (guides, API, troubleshooting)
- Support utilisateur (contact, FAQ, logs anonymisés)
- Roadmap publique, gestion des évolutions

---

## 8. ROADMAP & ÉVOLUTIONS FUTURES

### 8.1 Prochaines Versions
- Mode hors-ligne complet (synchronisation avancée)
- Notifications push personnalisées
- Gamification avancée (badges, points, classements)
- Communauté (forums, entraide, modération)
- IA (recommandations, analyse d'accessibilité)
- AR/IoT (navigation augmentée, capteurs)
- API publique (ouverture aux développeurs)

### 8.2 Améliorations Continues
- Optimisation performance, accessibilité, sécurité
- Tests utilisateurs réguliers (retours PMR)
- Mise à jour des standards (WCAG, RGPD, sécurité)

---

## 9. CONCLUSION

AccessPlus est une solution mobile et web de référence pour l'accessibilité, pensée pour et avec les utilisateurs. Ce cahier des charges garantit une couverture totale des besoins fonctionnels, techniques, de sécurité, d'accessibilité et de conformité, pour un produit évolutif, fiable et inclusif.

---

*Document généré automatiquement – dernière mise à jour : Juin 2025* 