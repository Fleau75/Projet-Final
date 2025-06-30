# 🧩 Guide des Composants - AccessPlus

[![React Native](https://img.shields.io/badge/React%20Native-0.79.2-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-SDK%2053-000000.svg)](https://expo.dev/)
[![Components](https://img.shields.io/badge/Components-5%20Total-blue.svg)](https://github.com/Fleau75/Projet-Final)
[![Last Update](https://img.shields.io/badge/Last%20Update-Juin%202025-blue.svg)](https://github.com/Fleau75/Projet-Final)

## 📋 Vue d'ensemble

Ce guide détaille tous les composants réutilisables d'AccessPlus, leur utilisation, leurs props et leurs fonctionnalités d'accessibilité. **Mise à jour juin 2025** avec les nouvelles améliorations.

### **🆕 Nouvelles Améliorations (Juin 2025)**
- **LoadingOverlay** : Composant de chargement amélioré
- **Accessibilité renforcée** : Support complet lecteur d'écran
- **Thèmes dynamiques** : Adaptation automatique clair/sombre
- **Performance optimisée** : Rendu plus fluide
- **Tests complets** : Couverture de tests étendue

---

## 🎯 Composants Principaux

### 📍 PlaceCard

**Fichier :** `components/PlaceCard.js`

**Description :** Carte affichant les informations d'un lieu avec support complet de l'accessibilité.

**Props :**
```javascript
{
  place: {
    id: string,
    name: string,
    address: string,
    type: string,
    rating: number,
    reviewCount: number,
    image: string,
    coordinates: { latitude: number, longitude: number },
    accessibility: {
      ramp: boolean,
      elevator: boolean,
      parking: boolean,
      toilets: boolean
    },
    contact: {
      phone: string,
      website: string,
      email: string
    },
    priceLevel: string,
    category: string
  },
  onPress: function,
  showAccessibility: boolean = true,
  showRating: boolean = true,
  showContact: boolean = false,
  showPrice: boolean = true,
  compact: boolean = false
}
```

**Fonctionnalités :**
- ✅ Affichage des informations du lieu
- ✅ Indicateurs d'accessibilité visuels
- ✅ Support du lecteur d'écran
- ✅ Adaptation de la taille des polices
- ✅ Navigation tactile
- ✅ Thèmes clair/sombre
- 🆕 **Informations de contact** contextuelles
- 🆕 **Indicateur de prix** pour planification budgétaire
- 🆕 **Mode compact** pour interface optimisée
- 🆕 **Gestion d'erreurs** améliorée pour les images

**Utilisation :**
```javascript
import PlaceCard from '../components/PlaceCard';

<PlaceCard
  place={placeData}
  onPress={() => navigation.navigate('PlaceDetail', { place: placeData })}
  showAccessibility={true}
  showRating={true}
  showContact={true}
  showPrice={true}
  compact={false}
/>
```

### ⭐ ReviewCard

**Fichier :** `components/ReviewCard.js`

**Description :** Composant pour afficher un avis utilisateur avec notation et commentaire.

**Props :**
```javascript
{
  review: {
    id: string,
    userId: string,
    userName: string,
    rating: number,
    comment: string,
    createdAt: string,
    isVerified: boolean,
    photos: Array<string>,
    helpfulCount: number,
    category: string
  },
  onPress: function,
  showUserInfo: boolean = true,
  showPhotos: boolean = true,
  showHelpful: boolean = false,
  layout: 'default' | 'compact' = 'default'
}
```

**Fonctionnalités :**
- ✅ Affichage de la notation avec étoiles
- ✅ Commentaire utilisateur
- ✅ Informations sur l'auteur
- ✅ Badge de vérification
- ✅ Date de création
- ✅ Support de l'accessibilité
- 🆕 **Photos des avis** avec gestion d'erreurs
- 🆕 **Layout optimisé** aligné à gauche
- 🆕 **Compteur d'utilité** pour les avis
- 🆕 **Mode compact** pour listes denses

**Utilisation :**
```javascript
import ReviewCard from '../components/ReviewCard';

<ReviewCard
  review={reviewData}
  onPress={() => handleReviewPress(reviewData)}
  showUserInfo={true}
  showPhotos={true}
  showHelpful={true}
  layout="default"
/>
```

### 🏆 VerifiedBadge

**Fichier :** `components/VerifiedBadge.js`

**Description :** Badge indiquant qu'un utilisateur est vérifié.

**Props :**
```javascript
{
  size: number = 16,
  color: string,
  style: object,
  showLabel: boolean = false,
  animated: boolean = true,
  showTooltip: boolean = false,
  tooltipText: string = "Utilisateur vérifié"
}
```

**Variantes :**
- `VerifiedBadge` : Badge simple
- `UserNameWithBadge` : Nom + badge
- `VerificationStats` : Statistiques détaillées
- 🆕 `AnimatedBadge` : Badge avec animation

**Utilisation :**
```javascript
import { VerifiedBadge, UserNameWithBadge } from '../components/VerifiedBadge';

// Badge simple
<VerifiedBadge size={20} color={theme.colors.primary} animated={true} />

// Nom avec badge
<UserNameWithBadge 
  userName="John Doe" 
  isVerified={true} 
  style={styles.userName}
  showTooltip={true}
/>
```

### ⭐ CustomRating

**Fichier :** `components/CustomRating.js`

**Description :** Composant de notation personnalisé avec étoiles interactives.

**Props :**
```javascript
{
  rating: number,
  maxRating: number = 5,
  size: number = 24,
  onRatingChange: function,
  readonly: boolean = false,
  showLabel: boolean = true,
  showHalfStars: boolean = false,
  color: string,
  emptyColor: string,
  animation: boolean = true,
  accessibilityLabel: string
}
```

**Fonctionnalités :**
- ✅ Étoiles interactives
- ✅ Mode lecture seule
- ✅ Labels d'accessibilité
- ✅ Support tactile
- ✅ Adaptation de la taille
- 🆕 **Demi-étoiles** pour notation plus précise
- 🆕 **Couleurs personnalisables** selon le thème
- 🆕 **Animations fluides** pour l'interaction
- 🆕 **Accessibilité renforcée** avec labels détaillés

**Utilisation :**
```javascript
import CustomRating from '../components/CustomRating';

<CustomRating
  rating={place.rating}
  onRatingChange={(newRating) => handleRatingChange(newRating)}
  readonly={false}
  showLabel={true}
  showHalfStars={true}
  animation={true}
  accessibilityLabel="Note d'accessibilité du lieu"
/>
```

### 🔄 LoadingOverlay

**Fichier :** `components/LoadingOverlay.js`

**Description :** Overlay de chargement avec indicateur et message personnalisable.

**Props :**
```javascript
{
  visible: boolean,
  message: string = "Chargement...",
  showSpinner: boolean = true,
  backgroundColor: string,
  textColor: string,
  spinnerSize: number = 40,
  spinnerColor: string,
  showProgress: boolean = false,
  progress: number = 0,
  cancelable: boolean = false,
  onCancel: function,
  animation: 'fade' | 'slide' | 'none' = 'fade',
  zIndex: number = 1000
}
```

**Fonctionnalités :**
- ✅ Indicateur de chargement animé
- ✅ Message personnalisable
- ✅ Support des thèmes
- ✅ Accessibilité complète
- ✅ Animation fluide
- 🆕 **Barre de progression** pour chargements longs
- 🆕 **Possibilité d'annulation** pour opérations longues
- 🆕 **Animations multiples** (fade, slide, none)
- 🆕 **Z-index configurable** pour superposition
- 🆕 **Spinner personnalisable** avec couleurs et tailles

**Utilisation :**
```javascript
import LoadingOverlay from '../components/LoadingOverlay';

<LoadingOverlay
  visible={isLoading}
  message="Chargement des lieux..."
  showSpinner={true}
  showProgress={true}
  progress={loadingProgress}
  cancelable={true}
  onCancel={() => cancelLoading()}
  animation="fade"
  spinnerSize={50}
  spinnerColor={theme.colors.primary}
/>
```

## 🎨 Composants de Navigation

### 🔙 BackButton

**Fichier :** `components/BackButton.js`

**Description :** Bouton de retour personnalisé avec support de l'accessibilité.

**Props :**
```javascript
{
  onPress: function,
  title: string = "Retour",
  color: string,
  size: number = 24
}
```

**Fonctionnalités :**
- ✅ Icône de retour
- ✅ Label d'accessibilité
- ✅ Support tactile
- ✅ Adaptation des thèmes

### 🔍 SearchBar

**Fichier :** `components/SearchBar.js`

**Description :** Barre de recherche avec filtres et suggestions.

**Props :**
```javascript
{
  value: string,
  onChangeText: function,
  placeholder: string = "Rechercher un lieu...",
  onSearch: function,
  filters: array,
  onFilterChange: function
}
```

**Fonctionnalités :**
- ✅ Recherche en temps réel
- ✅ Filtres par catégorie
- ✅ Suggestions automatiques
- ✅ Support clavier
- ✅ Accessibilité complète

## 🔧 Composants Utilitaires

### 📱 ScreenReader

**Fichier :** `components/ScreenReader.js`

**Description :** Wrapper pour optimiser l'affichage pour les lecteurs d'écran.

**Props :**
```javascript
{
  children: ReactNode,
  accessible: boolean = true,
  accessibilityLabel: string,
  accessibilityHint: string,
  accessibilityRole: string
}
```

**Utilisation :**
```javascript
import ScreenReader from '../components/ScreenReader';

<ScreenReader
  accessibilityLabel="Liste des lieux accessibles"
  accessibilityHint="Double-tapez pour ouvrir un lieu"
>
  {places.map(place => (
    <PlaceCard key={place.id} place={place} />
  ))}
</ScreenReader>
```

### 🎯 Focusable

**Fichier :** `components/Focusable.js`

**Description :** Wrapper pour gérer le focus et la navigation clavier.

**Props :**
```javascript
{
  children: ReactNode,
  onFocus: function,
  onBlur: function,
  focusable: boolean = true,
  hasTVPreferredFocus: boolean = false
}
```

## 📊 Composants de Données

### 📈 StatisticsCard

**Fichier :** `components/StatisticsCard.js`

**Description :** Carte affichant des statistiques avec graphiques.

**Props :**
```javascript
{
  title: string,
  value: number | string,
  unit: string,
  trend: number,
  icon: string,
  color: string
}
```

### 📋 DataTable

**Fichier :** `components/DataTable.js`

**Description :** Tableau de données avec tri et filtres.

**Props :**
```javascript
{
  data: array,
  columns: array,
  sortable: boolean = true,
  filterable: boolean = true,
  onRowPress: function
}
```

## 🎭 Composants de Feedback

### ✅ SuccessMessage

**Fichier :** `components/SuccessMessage.js`

**Description :** Message de succès avec animation.

**Props :**
```javascript
{
  message: string,
  visible: boolean,
  duration: number = 3000,
  onHide: function
}
```

### ❌ ErrorMessage

**Fichier :** `components/ErrorMessage.js`

**Description :** Message d'erreur avec options de retry.

**Props :**
```javascript
{
  message: string,
  visible: boolean,
  onRetry: function,
  onDismiss: function
}
```

### ⚠️ WarningMessage

**Fichier :** `components/WarningMessage.js`

**Description :** Message d'avertissement avec icône.

**Props :**
```javascript
{
  message: string,
  visible: boolean,
  type: 'warning' | 'info' | 'success',
  onDismiss: function
}
```

## 🔄 Composants de Synchronisation

### 🔄 SyncIndicator

**Fichier :** `components/SyncIndicator.js`

**Description :** Indicateur de synchronisation des données.

**Props :**
```javascript
{
  isSyncing: boolean,
  lastSync: string,
  onManualSync: function
}
```

### 📡 NetworkStatus

**Fichier :** `components/NetworkStatus.js`

**Description :** Indicateur de statut réseau.

**Props :**
```javascript
{
  isOnline: boolean,
  connectionType: string,
  onRetry: function
}
```

## 🎨 Thèmes et Styles

### 🎨 ThemeProvider

**Fichier :** `theme/ThemeContext.js`

**Description :** Fournisseur de thème pour l'application.

**Hooks :**
```javascript
import { useTheme } from '../theme/ThemeContext';

const { theme, toggleTheme, isDark } = useTheme();
```

### 📏 TextSizeProvider

**Fichier :** `theme/TextSizeContext.js`

**Description :** Gestion de la taille des polices.

**Hooks :**
```javascript
import { useTextSize } from '../theme/TextSizeContext';

const { textSize, increaseTextSize, decreaseTextSize } = useTextSize();
```

### Système de thèmes

**Fichier :** `theme/index.js`

**Description :** Système de thèmes centralisé avec support clair/sombre.

**Fonctionnalités :**
- ✅ Thèmes clair et sombre
- ✅ Couleurs d'accessibilité
- ✅ Tailles de police adaptatives
- ✅ Espacements cohérents
- 🆕 **Thèmes dynamiques** selon l'heure
- 🆕 **Couleurs de contraste élevé**
- 🆕 **Animations fluides** entre thèmes

**Utilisation :**
```javascript
import { useTheme } from '../theme';

const MyComponent = () => {
  const { colors, fonts, spacing } = useTheme();
  
  return (
    <View style={{ backgroundColor: colors.background }}>
      <Text style={{ color: colors.text, fontSize: fonts.medium }}>
        Contenu
      </Text>
    </View>
  );
};
```

### Contextes d'accessibilité

**Fichiers :**
- `theme/ThemeContext.js` : Gestion du thème
- `theme/TextSizeContext.js` : Taille du texte
- `theme/ScreenReaderContext.js` : Lecteur d'écran
- `theme/AuthContext.js` : État d'authentification

**Fonctionnalités :**
- ✅ Gestion centralisée des préférences
- ✅ Persistance des paramètres
- ✅ Synchronisation entre composants
- 🆕 **Notifications de changements** en temps réel
- 🆕 **Validation des paramètres** d'accessibilité

## 🔧 Utilitaires et Helpers

### Fonctions d'accessibilité

**Fichier :** `utils/accessibility.js`

**Description :** Utilitaires pour améliorer l'accessibilité.

**Fonctions :**
```javascript
// Génère un label d'accessibilité
generateAccessibilityLabel(text, context)

// Vérifie si le lecteur d'écran est actif
isScreenReaderEnabled()

// Adapte la taille selon les préférences
getAdaptiveSize(baseSize, scale)

// Génère des couleurs de contraste
getContrastColor(backgroundColor)
```

### Validation des props

**Fichier :** `utils/validation.js`

**Description :** Validation des props des composants.

**Fonctions :**
```javascript
// Valide les props d'un lieu
validatePlaceProps(place)

// Valide les props d'un avis
validateReviewProps(review)

// Valide les props de notation
validateRatingProps(rating, maxRating)
```

## 🧪 Tests des Composants

### Tests unitaires

**Fichiers :**
- `tests/unit/PlaceCard.test.js`
- `tests/unit/ReviewCard.test.js`
- `tests/unit/VerifiedBadge.test.js`
- `tests/unit/CustomRating.test.js`
- `tests/unit/LoadingOverlay.test.js`

**Couverture :**
- ✅ Rendu des composants
- ✅ Gestion des props
- ✅ Interactions utilisateur
- ✅ Accessibilité
- 🆕 **Tests de performance**
- 🆕 **Tests d'accessibilité** automatisés
- 🆕 **Tests de thèmes** (clair/sombre)

### Tests d'intégration

**Fichiers :**
- `tests/integration/components.test.js`

**Scénarios :**
- ✅ Interaction entre composants
- ✅ Navigation avec composants
- ✅ Gestion d'état globale
- 🆕 **Tests de rendu** sur différents appareils
- 🆕 **Tests de performance** en conditions réelles

## 📱 Responsive Design

### Adaptation aux écrans

**Fonctionnalités :**
- ✅ Adaptation automatique aux tailles d'écran
- ✅ Support des orientations portrait/paysage
- ✅ Adaptation aux tablettes
- 🆕 **Breakpoints personnalisés** pour PMR
- 🆕 **Zones de toucher optimisées** (minimum 44px)

### Accessibilité tactile

**Améliorations :**
- ✅ Zones de toucher suffisamment grandes
- ✅ Espacement entre éléments interactifs
- ✅ Feedback tactile
- 🆕 **Gestes personnalisés** pour PMR
- 🆕 **Mode "toucher unique"** pour certains utilisateurs

## 🚀 Performance

### Optimisations

**Techniques utilisées :**
- ✅ `React.memo()` pour éviter les re-rendus
- ✅ `useCallback()` pour les fonctions
- ✅ `useMemo()` pour les calculs coûteux
- 🆕 **Lazy loading** des images
- 🆕 **Virtualisation** des listes longues
- 🆕 **Debouncing** des interactions

### Métriques

**Mesures :**
- ✅ Temps de rendu initial
- ✅ Temps de réponse aux interactions
- ✅ Utilisation mémoire
- 🆕 **Temps d'accessibilité** (lecteur d'écran)
- 🆕 **Score de performance** global

## 🔮 Roadmap

### Fonctionnalités futures

**Planifiées :**
- 🎯 **Composants 3D** pour cartographie avancée
- 🎯 **Reconnaissance vocale** intégrée
- 🎯 **Haptic feedback** pour interactions
- 🎯 **Mode réalité augmentée** pour navigation
- 🎯 **Composants personnalisables** par utilisateur

### Améliorations techniques

**Prévues :**
- 🔧 **TypeScript** pour type safety
- 🔧 **Storybook** pour documentation interactive
- 🔧 **Tests E2E** avec Detox
- 🔧 **Monitoring** des performances en production
- 🔧 **A/B testing** des interfaces

## 📚 Ressources

### Documentation

- 📖 [Guide des écrans](./SCREENS_GUIDE.md)
- 📖 [Guide des services](./SERVICES_GUIDE.md)
- 📖 [Guide de test](./TESTING_GUIDE.md)
- 📖 [Guide d'architecture](./ARCHITECTURE_GUIDE.md)

### Outils de développement

- 🛠️ [React Native Debugger](https://github.com/jhen0409/react-native-debugger)
- 🛠️ [Flipper](https://fbflipper.com/)
- 🛠️ [Reactotron](https://github.com/infinitered/reactotron)

---

**AccessPlus Components** - Des composants accessibles pour tous ! 🧩✨

*Dernière mise à jour : Juin 2025 - Nouvelles fonctionnalités incluses* 