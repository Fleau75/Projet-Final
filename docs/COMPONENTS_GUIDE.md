# 🧩 Guide des Composants - AccessPlus

## 📋 Vue d'ensemble

Ce guide détaille tous les composants réutilisables d'AccessPlus, leur utilisation, leurs props et leurs fonctionnalités d'accessibilité.

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
    }
  },
  onPress: function,
  showAccessibility: boolean = true,
  showRating: boolean = true
}
```

**Fonctionnalités :**
- ✅ Affichage des informations du lieu
- ✅ Indicateurs d'accessibilité visuels
- ✅ Support du lecteur d'écran
- ✅ Adaptation de la taille des polices
- ✅ Navigation tactile
- ✅ Thèmes clair/sombre

**Utilisation :**
```javascript
import PlaceCard from '../components/PlaceCard';

<PlaceCard
  place={placeData}
  onPress={() => navigation.navigate('PlaceDetail', { place: placeData })}
  showAccessibility={true}
  showRating={true}
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
    isVerified: boolean
  },
  onPress: function,
  showUserInfo: boolean = true
}
```

**Fonctionnalités :**
- ✅ Affichage de la notation avec étoiles
- ✅ Commentaire utilisateur
- ✅ Informations sur l'auteur
- ✅ Badge de vérification
- ✅ Date de création
- ✅ Support de l'accessibilité

**Utilisation :**
```javascript
import ReviewCard from '../components/ReviewCard';

<ReviewCard
  review={reviewData}
  onPress={() => handleReviewPress(reviewData)}
  showUserInfo={true}
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
  showLabel: boolean = false
}
```

**Variantes :**
- `VerifiedBadge` : Badge simple
- `UserNameWithBadge` : Nom + badge
- `VerificationStats` : Statistiques détaillées

**Utilisation :**
```javascript
import { VerifiedBadge, UserNameWithBadge } from '../components/VerifiedBadge';

// Badge simple
<VerifiedBadge size={20} color={theme.colors.primary} />

// Nom avec badge
<UserNameWithBadge 
  userName="John Doe" 
  isVerified={true} 
  style={styles.userName} 
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
  showLabel: boolean = true
}
```

**Fonctionnalités :**
- ✅ Étoiles interactives
- ✅ Mode lecture seule
- ✅ Labels d'accessibilité
- ✅ Support tactile
- ✅ Adaptation de la taille

**Utilisation :**
```javascript
import CustomRating from '../components/CustomRating';

<CustomRating
  rating={place.rating}
  onRatingChange={(newRating) => handleRatingChange(newRating)}
  readonly={false}
  showLabel={true}
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
  textColor: string
}
```

**Fonctionnalités :**
- ✅ Indicateur de chargement animé
- ✅ Message personnalisable
- ✅ Support des thèmes
- ✅ Accessibilité complète
- ✅ Animation fluide

**Utilisation :**
```javascript
import LoadingOverlay from '../components/LoadingOverlay';

<LoadingOverlay
  visible={isLoading}
  message="Récupération des lieux..."
  showSpinner={true}
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

## 🧪 Tests des Composants

### Scripts de test disponibles

```bash
# Test des composants principaux
node scripts/test-components.js

# Test de l'accessibilité
node scripts/test-accessibility.js

# Test des thèmes
node scripts/test-themes.js
```

### Tests inclus

- ✅ Rendu des composants
- ✅ Props et validation
- ✅ Interactions utilisateur
- ✅ Accessibilité
- ✅ Thèmes et styles
- ✅ Performance

## 📝 Bonnes Pratiques

### 1. **Accessibilité**
- Toujours inclure `accessibilityLabel`
- Utiliser des rôles appropriés
- Tester avec les lecteurs d'écran

### 2. **Performance**
- Utiliser `React.memo` pour les composants lourds
- Éviter les re-renders inutiles
- Optimiser les images

### 3. **Réutilisabilité**
- Props flexibles et configurables
- Documentation claire
- Exemples d'utilisation

### 4. **Thèmes**
- Utiliser les couleurs du thème
- Supporter les modes clair/sombre
- Adapter la taille des polices

## 🔮 Évolutions Futures

### Composants prévus
- 📊 Graphiques interactifs
- 🗺️ Carte personnalisée
- 📱 Notifications push
- 🔔 Système d'alertes
- 📋 Formulaires avancés

### Améliorations
- ⚡ Performance optimisée
- 🎨 Animations fluides
- 🔧 Configuration avancée
- 📱 Support tablette
- 🌐 Internationalisation

---

*Tous les composants d'AccessPlus sont conçus pour offrir une expérience utilisateur optimale avec un support complet de l'accessibilité.* 