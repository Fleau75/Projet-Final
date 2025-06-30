# 📱 Guide des Écrans - AccessPlus

> **Guide complet des 15 écrans de l'application AccessPlus - Version Finale**

[![React Native](https://img.shields.io/badge/React%20Native-0.79.2-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-SDK%2053-000000.svg)](https://expo.dev/)
[![Status](https://img.shields.io/badge/Status-✅%20Complète-brightgreen.svg)](https://github.com/Fleau75/Projet-Final)
[![Last Update](https://img.shields.io/badge/Last%20Update-Juin%202025-blue.svg)](https://github.com/Fleau75/Projet-Final)

## 🎯 **Vue d'ensemble des écrans**

AccessPlus comprend **15 écrans principaux** organisés en 3 catégories :

### **🔐 Écrans d'Authentification**
- LoginScreen - Connexion avec biométrie
- RegisterScreen - Inscription avec migration
- ForgotPasswordScreen - Mot de passe oublié
- ResetPasswordScreen - Réinitialisation

### **📱 Écrans Principaux (Navigation par onglets)**
- HomeScreen - Accueil avec liste des lieux
- MapScreen - Carte interactive
- ProfileScreen - Profil utilisateur
- SettingsScreen - Paramètres et aide

### **🔍 Écrans de Détail et Gestion**
- PlaceDetailScreen - Détails d'un lieu
- AddReviewScreen - Ajout d'avis
- MyReviewsScreen - Mes avis
- FavoritePlacesScreen - Lieux favoris
- LocationHistoryScreen - Historique
- EditProfileScreen - Édition profil
- ChangePasswordScreen - Changement mot de passe

---

## 🔐 **ÉCRANS D'AUTHENTIFICATION**

### **1. LoginScreen.js** - Écran de Connexion

**📁 Fichier :** `screens/LoginScreen.js`  
**📏 Taille :** 500 lignes  
**🎯 Fonctionnalités :** Authentification complète

#### **Fonctionnalités Principales**
- **Connexion email/mot de passe** avec validation
- **Authentification biométrique** (empreinte/Face ID)
- **Mode visiteur** avec accès immédiat
- **Gestion des erreurs** avec messages contextuels
- **Navigation** vers inscription et mot de passe oublié

#### **Composants Utilisés**
```javascript
// Authentification biométrique
import { BiometricService } from '../services/biometricService';

// Validation des entrées
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');

// Gestion des erreurs
const [error, setError] = useState('');
```

#### **Améliorations Récentes**
- **Interface plus intuitive** avec labels d'accessibilité
- **Gestion améliorée** des états de chargement
- **Support complet** des lecteurs d'écran
- **Validation en temps réel** des champs

### **2. RegisterScreen.js** - Écran d'Inscription

**📁 Fichier :** `screens/RegisterScreen.js`  
**📏 Taille :** 590 lignes  
**🎯 Fonctionnalités :** Création de compte avec migration

#### **Fonctionnalités Principales**
- **Inscription** avec validation complète
- **Migration automatique** des données visiteur
- **Gestion des préférences** de migration
- **Validation en temps réel** des champs
- **Navigation** vers connexion

#### **Migration des Données**
```javascript
// Migration automatique des données visiteur
const migrationResult = await StorageService.migrateVisitorDataToUser(
  userData.email, 
  true
);

// Préservation de l'historique et des préférences
if (migrationResult.migrated) {
  console.log('✅ Migration réussie');
}
```

#### **Améliorations Récentes**
- **Suppression du bouton 'Se connecter'** pour éviter les erreurs de navigation
- **Interface plus claire** pour la gestion de la migration
- **Messages informatifs** sur le processus de migration

### **3. ForgotPasswordScreen.js** - Mot de Passe Oublié

**📁 Fichier :** `screens/ForgotPasswordScreen.js`  
**📏 Taille :** 222 lignes  
**🎯 Fonctionnalités :** Réinitialisation sécurisée

#### **Fonctionnalités Principales**
- **Formulaire de récupération** par email
- **Validation** de l'adresse email
- **Messages de confirmation** clairs
- **Navigation** vers connexion

### **4. ResetPasswordScreen.js** - Réinitialisation

**📁 Fichier :** `screens/ResetPasswordScreen.js`  
**📏 Taille :** 264 lignes  
**🎯 Fonctionnalités :** Confirmation de réinitialisation

#### **Fonctionnalités Principales**
- **Confirmation** de l'envoi du lien
- **Instructions** pour l'utilisateur
- **Navigation** vers connexion

---

## 📱 **ÉCRANS PRINCIPAUX (Navigation par onglets)**

### **5. HomeScreen.js** - Écran d'Accueil

**📁 Fichier :** `screens/HomeScreen.js`  
**📏 Taille :** 1661 lignes  
**🎯 Fonctionnalités :** Liste des lieux avec filtres avancés

#### **Fonctionnalités Principales**
- **Liste des lieux** avec cartes interactives
- **Filtrage par catégorie** (Restaurants, Culture, Shopping, Santé, Sport, Éducation, Hôtels)
- **Filtres d'accessibilité** (rampes, ascenseurs, parking, toilettes)
- **Recherche textuelle** par nom d'établissement
- **Tri intelligent** (distance, note, popularité)
- **Géolocalisation** avec calcul de distances
- **Bouton retour en haut** pour navigation rapide

#### **Améliorations Récentes (Juin 2025)**
```javascript
// Bouton retour en haut
const scrollToTop = () => {
  if (flatListRef.current) {
    flatListRef.current.scrollToOffset({ offset: 0, animated: true });
  }
};

// Correction catégorisation hôtels
const mapGooglePlaceTypeToCategory = (googleTypes) => {
  if (googleTypes.includes('lodging')) return 'hotel';
  // ... autres catégories
};

// Rayon de recherche par défaut (500m)
const defaultSearchRadius = 500;
```

#### **Fonctionnalités Avancées**
- **Données statiques** de fallback (11ème arrondissement)
- **Intégration Google Places API** avec gestion d'erreurs
- **Cache intelligent** des résultats
- **Support complet** de l'accessibilité
- **Menus compacts** pour une meilleure expérience

### **6. MapScreen.js** - Carte Interactive

**📁 Fichier :** `screens/MapScreen.js`  
**📏 Taille :** 868 lignes  
**🎯 Fonctionnalités :** Cartographie interactive

#### **Fonctionnalités Principales**
- **Carte Google Maps** avec thème adaptatif
- **Marqueurs personnalisés** par catégorie
- **Géolocalisation** en temps réel
- **Recherche géolocalisée** avec rayon configurable
- **FAB (Floating Action Button)** pour ajouter des avis
- **Navigation** vers détails des lieux

#### **Améliorations Récentes (Juin 2025)**
```javascript
// FAB amélioré pour ajouter des avis
<FAB
  icon="plus"
  style={styles.fab}
  onPress={() => navigation.navigate('AddReview')}
  accessibilityLabel="Ajouter un avis"
  accessibilityHint="Ouvre le formulaire d'ajout d'avis"
/>
```

#### **Fonctionnalités Avancées**
- **Calcul de distances** avec formule de Haversine
- **Gestion des permissions** de localisation
- **Mode hors-ligne** avec données locales
- **Animations** fluides des marqueurs

### **7. ProfileScreen.js** - Profil Utilisateur

**📁 Fichier :** `screens/ProfileScreen.js`  
**📏 Taille :** 690 lignes  
**🎯 Fonctionnalités :** Gestion du profil et statistiques

#### **Fonctionnalités Principales**
- **Informations utilisateur** (nom, email, avatar)
- **Statistiques personnelles** (avis, lieux visités)
- **Badge vérifié** avec critères
- **Actions rapides** (éditer profil, changer mot de passe)
- **Navigation** vers écrans de gestion

#### **Améliorations Récentes (Juin 2025)**
```javascript
// Correction effet rouge profil
const getProfileCardStyle = () => ({
  backgroundColor: theme.colors.surface,
  borderRadius: 16,
  elevation: 4,
  // Suppression de l'effet rouge non désiré
});
```

#### **Système de Badges**
- **Critères de vérification** : Compte créé + 3 avis minimum
- **Badge visuel** distinctif avec tooltips
- **Progression** vers la vérification
- **Statistiques** en temps réel

### **8. SettingsScreen.js** - Paramètres

**📁 Fichier :** `screens/SettingsScreen.js`  
**📏 Taille :** 955 lignes  
**🎯 Fonctionnalités :** Configuration et aide

#### **Fonctionnalités Principales**
- **Thème** (clair/sombre automatique)
- **Taille de texte** (3 niveaux)
- **Accessibilité** (lecteur d'écran, contraste)
- **Notifications** (push, locales, préférences)
- **Système d'aide et support** intégré
- **Signaler un problème** avec formulaire dédié

#### **Améliorations Récentes (Juin 2025)**
```javascript
// Suppression des boutons de test de notifications
// Interface plus propre et intuitive

// Amélioration du design du bouton 'Réinitialiser'
<Button
  mode="outlined"
  onPress={handleResetSettings}
  style={styles.resetButton}
  labelStyle={styles.resetButtonLabel}
>
  Réinitialiser
</Button>

// Suppression du Divider inutile dans la section Notifications
```

#### **Système d'Aide et Support**
- **Interface d'aide** intégrée
- **Signaler un problème** avec formulaire
- **Support utilisateur** avec options multiples
- **Documentation** accessible directement

---

## 🔍 **ÉCRANS DE DÉTAIL ET GESTION**

### **9. PlaceDetailScreen.js** - Détails d'un Lieu

**📁 Fichier :** `screens/PlaceDetailScreen.js`  
**📏 Taille :** 545 lignes  
**🎯 Fonctionnalités :** Informations complètes d'un établissement

#### **Fonctionnalités Principales**
- **Informations détaillées** (nom, adresse, type)
- **Note et avis** avec système de notation
- **Photos** du lieu et des avis
- **Informations d'accessibilité** détaillées
- **Actions** (ajouter aux favoris, ajouter avis)
- **Informations de contact** contextuelles
- **Prix contextuels** pour les établissements

#### **Améliorations Récentes (Juin 2025)**
```javascript
// Ajout d'informations de contact
const renderContactInfo = () => {
  if (place.phone || place.website) {
    return (
      <View style={styles.contactSection}>
        {place.phone && (
          <TouchableOpacity onPress={() => Linking.openURL(`tel:${place.phone}`)}>
            <Text>📞 {place.phone}</Text>
          </TouchableOpacity>
        )}
        {place.website && (
          <TouchableOpacity onPress={() => Linking.openURL(place.website)}>
            <Text>🌐 {place.website}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }
};

// Prix contextuels
const renderPriceInfo = () => {
  if (place.priceLevel) {
    const priceText = '€'.repeat(place.priceLevel);
    return (
      <View style={styles.priceSection}>
        <Text>Prix : {priceText}</Text>
      </View>
    );
  }
};
```

#### **Layout Avis Optimisé**
- **Alignement gauche** pour une meilleure lisibilité
- **Photos** des avis avec gestion d'erreurs
- **Informations contextuelles** enrichies

### **10. AddReviewScreen.js** - Ajout d'Avis

**📁 Fichier :** `screens/AddReviewScreen.js`  
**📏 Taille :** 617 lignes  
**🎯 Fonctionnalités :** Formulaire d'évaluation avec photos

#### **Fonctionnalités Principales**
- **Système de notation** 1-5 étoiles
- **Commentaire textuel** avec validation
- **Upload de photos** avec Firebase Storage
- **Critères d'accessibilité** spécifiques
- **Prévisualisation** avant envoi
- **Gestion des erreurs** complète

#### **Upload de Photos**
```javascript
// Gestion des photos avec Firebase Storage
const uploadPhotos = async (photos) => {
  const uploadedUrls = [];
  
  for (const photo of photos) {
    const photoRef = ref(storage, `reviews/${reviewId}/${Date.now()}.jpg`);
    await uploadBytes(photoRef, photo);
    const url = await getDownloadURL(photoRef);
    uploadedUrls.push(url);
  }
  
  return uploadedUrls;
};
```

### **11. MyReviewsScreen.js** - Mes Avis

**📁 Fichier :** `screens/MyReviewsScreen.js`  
**📏 Taille :** 626 lignes  
**🎯 Fonctionnalités :** Historique des évaluations personnelles

#### **Fonctionnalités Principales**
- **Liste des avis** personnels
- **Filtrage** par lieu, date, note
- **Actions** (éditer, supprimer)
- **Statistiques** personnelles
- **Navigation** vers détails des lieux

### **12. FavoritePlacesScreen.js** - Lieux Favoris

**📁 Fichier :** `screens/FavoritePlacesScreen.js`  
**📏 Taille :** 709 lignes  
**🎯 Fonctionnalités :** Gestion des favoris

#### **Fonctionnalités Principales**
- **Liste des lieux favoris** avec cartes
- **Actions** (retirer des favoris, voir détails)
- **Tri** par nom, distance, note
- **Recherche** dans les favoris
- **Synchronisation** avec Firebase

### **13. LocationHistoryScreen.js** - Historique

**📁 Fichier :** `screens/LocationHistoryScreen.js`  
**📏 Taille :** 583 lignes  
**🎯 Fonctionnalités :** Lieux visités et consultés

#### **Fonctionnalités Principales**
- **Historique chronologique** des lieux
- **Filtrage** par date, type, accessibilité
- **Actions** (voir détails, ajouter aux favoris)
- **Statistiques** de navigation
- **Export** des données

### **14. EditProfileScreen.js** - Édition Profil

**📁 Fichier :** `screens/EditProfileScreen.js`  
**📏 Taille :** 623 lignes  
**🎯 Fonctionnalités :** Modification des informations utilisateur

#### **Fonctionnalités Principales**
- **Modification** du nom et email
- **Upload d'avatar** avec ImagePicker
- **Validation** des champs
- **Sauvegarde** automatique
- **Gestion des erreurs**

### **15. ChangePasswordScreen.js** - Changement Mot de Passe

**📁 Fichier :** `screens/ChangePasswordScreen.js`  
**📏 Taille :** 424 lignes  
**🎯 Fonctionnalités :** Modification sécurisée du mot de passe

#### **Fonctionnalités Principales**
- **Validation** de l'ancien mot de passe
- **Nouveau mot de passe** avec critères de sécurité
- **Confirmation** du nouveau mot de passe
- **Chiffrement** sécurisé
- **Messages de confirmation**

---

## 🎨 **PATTERNS DE DESIGN COMMUNS**

### **Navigation**
```javascript
// Navigation standard entre écrans
navigation.navigate('ScreenName', { params });

// Retour avec données
navigation.goBack();

// Navigation vers onglet spécifique
navigation.navigate('MainTabs', { screen: 'Home' });
```

### **Gestion d'État**
```javascript
// État local avec useState
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

// Effets avec useEffect
useEffect(() => {
  loadData();
}, []);
```

### **Accessibilité**
```javascript
// Labels d'accessibilité
<View
  accessible={true}
  accessibilityLabel="Description de l'élément"
  accessibilityRole="button"
  accessibilityHint="Action à effectuer"
>
```

### **Gestion des Erreurs**
```javascript
// Try-catch avec messages utilisateur
try {
  await performAction();
} catch (error) {
  setError(getErrorMessage(error));
}
```

---

## 🔧 **CONFIGURATION ET PERSONNALISATION**

### **Thèmes et Styles**
```javascript
// Utilisation du thème
const theme = useTheme();

// Styles adaptatifs
const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.medium,
  },
});
```

### **Tests d'Accessibilité**
```javascript
// TestID pour les tests
<View testID="screen-container">
  <Text testID="screen-title">Titre</Text>
</View>
```

---

## 📊 **STATISTIQUES DES ÉCRANS**

| Écran | Lignes | Complexité | Tests | Statut |
|-------|--------|------------|-------|--------|
| HomeScreen | 1661 | ⭐⭐⭐⭐⭐ | ✅ | Complète |
| SettingsScreen | 955 | ⭐⭐⭐⭐ | ✅ | Complète |
| ProfileScreen | 690 | ⭐⭐⭐⭐ | ✅ | Complète |
| MapScreen | 868 | ⭐⭐⭐⭐ | ✅ | Complète |
| RegisterScreen | 590 | ⭐⭐⭐ | ✅ | Complète |
| AddReviewScreen | 617 | ⭐⭐⭐ | ✅ | Complète |
| FavoritePlacesScreen | 709 | ⭐⭐⭐ | ✅ | Complète |
| MyReviewsScreen | 626 | ⭐⭐⭐ | ✅ | Complète |
| LocationHistoryScreen | 583 | ⭐⭐⭐ | ✅ | Complète |
| EditProfileScreen | 623 | ⭐⭐⭐ | ✅ | Complète |
| PlaceDetailScreen | 545 | ⭐⭐⭐ | ✅ | Complète |
| LoginScreen | 500 | ⭐⭐ | ✅ | Complète |
| ChangePasswordScreen | 424 | ⭐⭐ | ✅ | Complète |
| ForgotPasswordScreen | 222 | ⭐ | ✅ | Complète |
| ResetPasswordScreen | 264 | ⭐ | ✅ | Complète |

**Total :** 9,207 lignes de code pour les écrans

---

## 🚀 **BONNES PRATIQUES IMPLÉMENTÉES**

### **Performance**
- **Lazy loading** des images et données
- **Memoization** des composants coûteux
- **Optimisation** des re-renders
- **Gestion mémoire** efficace

### **Accessibilité**
- **Labels d'accessibilité** sur tous les éléments
- **Support lecteur d'écran** complet
- **Navigation clavier** et tactile
- **Contraste élevé** configurable

### **Sécurité**
- **Validation** des entrées utilisateur
- **Chiffrement** des données sensibles
- **Gestion sécurisée** des tokens
- **Permissions** granulaire

### **Maintenabilité**
- **Code modulaire** et réutilisable
- **Documentation** inline complète
- **Tests** couvrants
- **Gestion d'erreurs** robuste

---

## 📚 **RESSOURCES COMPLÉMENTAIRES**

- [🏗️ Guide d'Architecture](./ARCHITECTURE_GUIDE.md)
- [🧩 Guide des Composants](./COMPONENTS_GUIDE.md)
- [⚙️ Guide des Services](./SERVICES_GUIDE.md)
- [🧪 Guide des Tests](./TESTING_GUIDE.md)
- [👤 Guide Utilisateur](./USER_GUIDE.md)

---

**AccessPlus** - Des écrans accessibles pour tous ! 🦽✨ 