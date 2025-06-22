# 🏆 Guide du Système de Badges Vérifiés

## 📋 Vue d'ensemble

Le système de badges vérifiés d'AccessPlus récompense les utilisateurs qui participent activement à la communauté en ajoutant des avis et commentaires sur les lieux accessibles.

## 🎯 Critères d'obtention

### ✅ Badge Vérifié
Pour obtenir le badge vérifié, un utilisateur doit :

1. **Avoir créé un compte** (pas en mode visiteur)
2. **Avoir ajouté au moins 3 avis/commentaires** sur des lieux

### ❌ Exclusions
- Les utilisateurs en mode visiteur ne peuvent pas obtenir le badge
- Les avis supprimés ne comptent pas dans le total
- Seuls les avis validés sont pris en compte

## 🔧 Implémentation Technique

### Services impliqués

#### `AuthService.js`
```javascript
// Vérifier le statut de vérification
static async checkVerificationStatus(userId)

// Incrémenter le compteur d'avis
static async incrementReviewsAdded(userId)

// Récupérer les statistiques utilisateur
static async getUserStats(userId)
```

#### `ReviewsService.js`
```javascript
// Ajouter un avis et incrémenter le compteur
static async addReview(reviewData, userId)
```

### Composants UI

#### `VerifiedBadge.js`
- `VerifiedBadge` : Badge simple
- `UserNameWithBadge` : Nom + badge
- `VerificationStats` : Statistiques détaillées

## 📱 Utilisation dans l'Application

### Affichage du badge
Le badge apparaît automatiquement à côté du nom d'utilisateur dans :
- L'écran de profil
- Les commentaires d'avis
- Les listes d'utilisateurs

### Progression
Les utilisateurs peuvent voir leur progression vers le badge dans :
- L'écran de profil (section statistiques)
- Les notifications lors de l'ajout d'avis

## 🎨 Design du Badge

### Icône
- **Icône** : `check-decagram` (Material Community Icons)
- **Couleur** : Couleur primaire du thème
- **Taille** : 16px par défaut (configurable)

### Accessibilité
- **Label** : "Utilisateur vérifié - Compte créé et au moins 3 avis ajoutés"
- **Rôle** : `image`
- **Support lecteur d'écran** : Complet

## 📊 Données Stockées

### AsyncStorage Keys
```javascript
// Statistiques utilisateur
`userStats_${userId}` = {
  reviewsAdded: 5,
  placesAdded: 2,
  isVisitor: false,
  joinDate: "2024-01-01T00:00:00.000Z",
  lastActivity: "2024-01-15T10:30:00.000Z"
}

// Statut de vérification
`userVerification_${userId}` = {
  isVerified: true,
  verifiedAt: "2024-01-10T15:45:00.000Z",
  criteria: {
    hasAccount: true,
    hasEnoughReviews: true
  }
}
```

## 🧪 Tests

### Script de test
```bash
node scripts/test-verification.js
```

Ce script teste :
- L'initialisation des statistiques
- L'incrémentation du compteur d'avis
- La vérification du statut
- Les différents types d'utilisateurs (compte vs visiteur)

## 🔄 Flux de données

### Ajout d'un avis
1. Utilisateur soumet un avis via `AddReviewScreen`
2. `ReviewsService.addReview()` est appelé avec l'ID utilisateur
3. `AuthService.incrementReviewsAdded()` incrémente le compteur
4. `AuthService.checkVerificationStatus()` vérifie si le badge doit être accordé
5. Le statut est sauvegardé dans AsyncStorage

### Affichage du badge
1. `ProfileScreen` charge les données utilisateur
2. `AuthService.getUserVerificationStatus()` récupère le statut
3. `UserNameWithBadge` affiche le nom + badge si vérifié

## 🎯 Avantages du système

### Pour les utilisateurs
- **Reconnaissance** : Badge visible pour montrer leur participation
- **Motivation** : Objectif clair (3 avis minimum)
- **Crédibilité** : Les avis des utilisateurs vérifiés sont plus fiables

### Pour la communauté
- **Qualité** : Encourage des avis détaillés et utiles
- **Engagement** : Incite à participer activement
- **Fiabilité** : Distingue les contributeurs réguliers

## 🔮 Évolutions futures

### Badges supplémentaires
- **Bronze** : 3 avis (actuel)
- **Argent** : 10 avis
- **Or** : 25 avis
- **Platine** : 50 avis

### Critères additionnels
- Avis avec photos
- Avis très détaillés
- Avis sur des lieux non répertoriés
- Réponses aux questions d'autres utilisateurs

## 🛠️ Maintenance

### Nettoyage des données
```javascript
// Supprimer les statistiques d'un utilisateur
await AsyncStorage.removeItem(`userStats_${userId}`);
await AsyncStorage.removeItem(`userVerification_${userId}`);
```

### Migration des données
En cas de changement de critères, un script de migration peut recalculer tous les statuts :
```javascript
// Recalculer tous les statuts
const allUsers = await getAllUsers();
for (const user of allUsers) {
  await AuthService.checkVerificationStatus(user.id);
}
```

## 📝 Notes importantes

- Le système est **rétroactif** : les avis existants sont pris en compte
- Les **visiteurs** ne peuvent jamais obtenir le badge (éthique)
- Le badge est **permanent** une fois obtenu
- Les **statistiques** sont mises à jour en temps réel

---

*Ce système encourage la participation tout en maintenant la qualité de la communauté AccessPlus.* 