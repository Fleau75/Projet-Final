# 📱 Guide des Écrans - AccessPlus

## 📋 Vue d'ensemble

Ce guide détaille tous les écrans d'AccessPlus, leur fonctionnalité, leur navigation et leur interface utilisateur.

## 🏠 Écrans Principaux

### HomeScreen

**Fichier :** `screens/HomeScreen.js`

**Description :** Écran d'accueil principal avec liste des lieux accessibles.

**Fonctionnalités :**
- ✅ Liste des lieux avec cartes interactives
- ✅ Filtres par catégorie (Restaurant, Culture, Shopping, etc.)
- ✅ Recherche en temps réel
- ✅ Compteur de lieux disponibles
- ✅ Bouton d'actualisation
- ✅ Support de l'accessibilité complète
- ✅ Thèmes clair/sombre
- ✅ Adaptation de la taille des polices

**Navigation :**
```javascript
// Navigation vers le détail d'un lieu
navigation.navigate('PlaceDetail', { place: placeData });

// Navigation vers la carte
navigation.navigate('Map');

// Navigation vers le profil
navigation.navigate('Profile');
```

**États :**
- `loading` : Chargement des données
- `error` : Erreur de chargement
- `success` : Données chargées
- `empty` : Aucun lieu trouvé

### MapScreen

**Fichier :** `screens/MapScreen.js`

**Description :** Écran de carte interactive avec géolocalisation.

**Fonctionnalités :**
- ✅ Carte interactive avec marqueurs
- ✅ Géolocalisation de l'utilisateur
- ✅ Marqueurs pour tous les lieux accessibles
- ✅ Filtres par catégorie
- ✅ Recherche par zone
- ✅ Navigation vers un lieu
- ✅ Support de l'accessibilité
- ✅ Mode hors ligne

**Navigation :**
```javascript
// Navigation vers le détail d'un lieu
navigation.navigate('PlaceDetail', { place: placeData });

// Retour à l'accueil
navigation.goBack();
```

### PlaceDetailScreen

**Fichier :** `screens/PlaceDetailScreen.js`

**Description :** Écran de détail d'un lieu avec informations complètes.

**Fonctionnalités :**
- ✅ Informations détaillées du lieu
- ✅ Indicateurs d'accessibilité
- ✅ Liste des avis utilisateurs
- ✅ Notation moyenne
- ✅ Bouton d'ajout d'avis
- ✅ Bouton de favori
- ✅ Navigation vers la carte
- ✅ Partage du lieu

**Navigation :**
```javascript
// Ajouter un avis
navigation.navigate('AddReview', { place: placeData });

// Voir sur la carte
navigation.navigate('Map', { focusPlace: placeData });

// Retour à l'accueil
navigation.goBack();
```

## 🔐 Écrans d'Authentification

### LoginScreen

**Fichier :** `screens/LoginScreen.js`

**Description :** Écran de connexion avec authentification biométrique.

**Fonctionnalités :**
- ✅ Connexion par email/mot de passe
- ✅ Authentification biométrique
- ✅ Bouton "Mot de passe oublié"
- ✅ Lien vers l'inscription
- ✅ Mode visiteur
- ✅ Validation des champs
- ✅ Messages d'erreur
- ✅ Support de l'accessibilité

**Navigation :**
```javascript
// Connexion réussie
navigation.replace('Main');

// Mot de passe oublié
navigation.navigate('ForgotPassword');

// Inscription
navigation.navigate('Register');

// Mode visiteur
navigation.replace('Main');
```

### RegisterScreen

**Fichier :** `screens/RegisterScreen.js`

**Description :** Écran d'inscription de nouveau compte.

**Fonctionnalités :**
- ✅ Formulaire d'inscription
- ✅ Validation des champs
- ✅ Vérification de la force du mot de passe
- ✅ Conditions d'utilisation
- ✅ Politique de confidentialité
- ✅ Messages d'erreur
- ✅ Support de l'accessibilité

**Navigation :**
```javascript
// Inscription réussie
navigation.replace('Main');

// Retour à la connexion
navigation.goBack();
```

### ForgotPasswordScreen

**Fichier :** `screens/ForgotPasswordScreen.js`

**Description :** Écran de récupération de mot de passe.

**Fonctionnalités :**
- ✅ Saisie de l'email
- ✅ Validation de l'email
- ✅ Envoi du lien de réinitialisation
- ✅ Messages de confirmation
- ✅ Retour à la connexion
- ✅ Support de l'accessibilité

**Navigation :**
```javascript
// Email envoyé
navigation.navigate('ResetPassword', { email: email });

// Retour à la connexion
navigation.goBack();
```

### ResetPasswordScreen

**Fichier :** `screens/ResetPasswordScreen.js`

**Description :** Écran de définition du nouveau mot de passe.

**Fonctionnalités :**
- ✅ Saisie du nouveau mot de passe
- ✅ Confirmation du mot de passe
- ✅ Validation de la force
- ✅ Réinitialisation
- ✅ Messages de succès
- ✅ Support de l'accessibilité

**Navigation :**
```javascript
// Mot de passe réinitialisé
navigation.replace('Login');

// Retour à la demande
navigation.goBack();
```

## 👤 Écrans de Profil

### ProfileScreen

**Fichier :** `screens/ProfileScreen.js`

**Description :** Écran de profil utilisateur avec statistiques.

**Fonctionnalités :**
- ✅ Informations du profil
- ✅ Badge de vérification
- ✅ Statistiques utilisateur
- ✅ Historique des activités
- ✅ Paramètres rapides
- ✅ Bouton de déconnexion
- ✅ Support de l'accessibilité

**Navigation :**
```javascript
// Éditer le profil
navigation.navigate('EditProfile');

// Changer le mot de passe
navigation.navigate('ChangePassword');

// Mes avis
navigation.navigate('MyReviews');

// Lieux favoris
navigation.navigate('FavoritePlaces');

// Historique des lieux
navigation.navigate('LocationHistory');

// Paramètres
navigation.navigate('Settings');
```

### EditProfileScreen

**Fichier :** `screens/EditProfileScreen.js`

**Description :** Écran d'édition du profil utilisateur.

**Fonctionnalités :**
- ✅ Modification du nom
- ✅ Modification de l'email
- ✅ Photo de profil
- ✅ Validation des champs
- ✅ Sauvegarde automatique
- ✅ Support de l'accessibilité

**Navigation :**
```javascript
// Sauvegarde réussie
navigation.goBack();

// Annulation
navigation.goBack();
```

### ChangePasswordScreen

**Fichier :** `screens/ChangePasswordScreen.js`

**Description :** Écran de changement de mot de passe.

**Fonctionnalités :**
- ✅ Ancien mot de passe
- ✅ Nouveau mot de passe
- ✅ Confirmation du nouveau mot de passe
- ✅ Validation de la force
- ✅ Messages de succès
- ✅ Support de l'accessibilité

**Navigation :**
```javascript
// Mot de passe changé
navigation.goBack();

// Annulation
navigation.goBack();
```

## 📝 Écrans d'Avis

### AddReviewScreen

**Fichier :** `screens/AddReviewScreen.js`

**Description :** Écran d'ajout d'un avis sur un lieu.

**Fonctionnalités :**
- ✅ Notation avec étoiles
- ✅ Commentaire détaillé
- ✅ Informations sur le lieu
- ✅ Validation des champs
- ✅ Sauvegarde automatique
- ✅ Support de l'accessibilité

**Navigation :**
```javascript
// Avis ajouté
navigation.goBack();

// Annulation
navigation.goBack();
```

### MyReviewsScreen

**Fichier :** `screens/MyReviewsScreen.js`

**Description :** Écran de gestion des avis de l'utilisateur.

**Fonctionnalités :**
- ✅ Liste des avis de l'utilisateur
- ✅ Modification d'avis
- ✅ Suppression d'avis
- ✅ Filtres par lieu
- ✅ Tri par date
- ✅ Support de l'accessibilité

**Navigation :**
```javascript
// Modifier un avis
navigation.navigate('EditReview', { review: reviewData });

// Voir le lieu
navigation.navigate('PlaceDetail', { place: placeData });

// Retour au profil
navigation.goBack();
```

## ⚙️ Écrans de Paramètres

### SettingsScreen

**Fichier :** `screens/SettingsScreen.js`

**Description :** Écran principal des paramètres de l'application.

**Fonctionnalités :**
- ✅ Thème clair/sombre
- ✅ Taille des polices
- ✅ Authentification biométrique
- ✅ Notifications
- ✅ Confidentialité
- ✅ À propos
- ✅ Support de l'accessibilité

**Navigation :**
```javascript
// Paramètres d'accessibilité
navigation.navigate('AccessibilitySettings');

// Paramètres de confidentialité
navigation.navigate('PrivacySettings');

// À propos
navigation.navigate('About');
```

## 📍 Écrans de Lieux

### FavoritePlacesScreen

**Fichier :** `screens/FavoritePlacesScreen.js`

**Description :** Écran des lieux favoris de l'utilisateur.

**Fonctionnalités :**
- ✅ Liste des lieux favoris
- ✅ Ajout/suppression de favoris
- ✅ Tri par nom/date
- ✅ Recherche dans les favoris
- ✅ Navigation vers le détail
- ✅ Support de l'accessibilité

**Navigation :**
```javascript
// Voir le détail d'un lieu
navigation.navigate('PlaceDetail', { place: placeData });

// Retour au profil
navigation.goBack();
```

### LocationHistoryScreen

**Fichier :** `screens/LocationHistoryScreen.js`

**Description :** Écran de l'historique des lieux visités.

**Fonctionnalités :**
- ✅ Historique des lieux visités
- ✅ Tri par date
- ✅ Filtres par catégorie
- ✅ Statistiques de visite
- ✅ Navigation vers le détail
- ✅ Support de l'accessibilité

**Navigation :**
```javascript
// Voir le détail d'un lieu
navigation.navigate('PlaceDetail', { place: placeData });

// Retour au profil
navigation.goBack();
```

## 🎨 Thèmes et Accessibilité

### Adaptation des Thèmes

Tous les écrans supportent :
- ✅ Thème clair/sombre automatique
- ✅ Adaptation de la taille des polices
- ✅ Contraste élevé
- ✅ Couleurs d'accent personnalisables

### Support de l'Accessibilité

Tous les écrans incluent :
- ✅ Labels d'accessibilité
- ✅ Rôles appropriés
- ✅ Navigation au clavier
- ✅ Support du lecteur d'écran
- ✅ Messages d'erreur clairs
- ✅ Boutons avec icônes descriptives

## 🔄 Navigation

### Structure de Navigation

```
App
├── Auth Stack
│   ├── Login
│   ├── Register
│   ├── ForgotPassword
│   └── ResetPassword
└── Main Stack
    ├── Home
    ├── Map
    ├── PlaceDetail
    ├── AddReview
    ├── Profile Stack
    │   ├── Profile
    │   ├── EditProfile
    │   ├── ChangePassword
    │   ├── MyReviews
    │   ├── FavoritePlaces
    │   └── LocationHistory
    └── Settings Stack
        ├── Settings
        ├── AccessibilitySettings
        ├── PrivacySettings
        └── About
```

### Navigation Conditionnelle

```javascript
// Vérifier si l'utilisateur est connecté
const isAuthenticated = await AuthService.getCurrentUser();

if (isAuthenticated) {
  navigation.replace('Main');
} else {
  navigation.replace('Login');
}
```

## 📱 Responsive Design

### Adaptation Mobile

Tous les écrans sont optimisés pour :
- ✅ Smartphones (portrait/paysage)
- ✅ Tablettes
- ✅ Différentes tailles d'écran
- ✅ Densités de pixels variables

### Composants Adaptatifs

- ✅ Cartes de lieux redimensionnables
- ✅ Listes avec scroll fluide
- ✅ Formulaires adaptatifs
- ✅ Boutons tactiles optimisés

## 🧪 Tests des Écrans

### Scripts de test disponibles

```bash
# Test de navigation
node scripts/test-navigation.js

# Test des écrans
node scripts/test-screens.js

# Test de l'accessibilité
node scripts/test-accessibility.js
```

### Tests inclus

- ✅ Navigation entre les écrans
- ✅ Rendu des composants
- ✅ Interactions utilisateur
- ✅ Gestion des états
- ✅ Accessibilité
- ✅ Thèmes et styles
- ✅ Performance

## 📝 Bonnes Pratiques

### 1. **Performance**
- Lazy loading des images
- Optimisation des listes
- Gestion de la mémoire
- Cache des données

### 2. **UX/UI**
- Design cohérent
- Feedback utilisateur
- États de chargement
- Gestion des erreurs

### 3. **Accessibilité**
- Labels descriptifs
- Navigation alternative
- Contraste suffisant
- Support des lecteurs d'écran

### 4. **Maintenance**
- Code modulaire
- Documentation claire
- Tests automatisés
- Gestion des versions

## 🔮 Évolutions Futures

### Écrans prévus
- 📊 Tableau de bord analytique
- 🗺️ Carte personnalisée avancée
- 📱 Notifications push
- 🔔 Système d'alertes
- 🌐 Mode hors ligne avancé

### Améliorations
- ⚡ Performance optimisée
- 🎨 Animations fluides
- 🔧 Configuration avancée
- 📱 Support tablette
- 🌍 Internationalisation

---

*Tous les écrans d'AccessPlus sont conçus pour offrir une expérience utilisateur optimale avec un support complet de l'accessibilité.* 