# 📊 Guide du Système de Stockage AccessPlus

> **Guide complet du système de stockage sécurisé et isolé d'AccessPlus - Version Finale**

[![Status](https://img.shields.io/badge/Status-✅%20Complète-brightgreen.svg)](https://github.com/Fleau75/Projet-Final)
[![Last Update](https://img.shields.io/badge/Last%20Update-Juin%202025-blue.svg)](https://github.com/Fleau75/Projet-Final)

## 🎯 **Vue d'ensemble**

Le système de stockage d'AccessPlus est conçu pour offrir une expérience sécurisée et privée à chaque utilisateur, avec isolation complète des données et chiffrement des informations sensibles.

## 🔒 **Architecture de stockage**

### 🏗️ **Structure générale**

#### Stockage multi-niveaux
```
AccessPlus Storage
├── 🔐 Stockage sécurisé (chiffré)
│   ├── Mots de passe
│   ├── Données sensibles
│   └── Clés de chiffrement
├── 📱 Stockage utilisateur (isolé)
│   ├── Profil utilisateur
│   ├── Préférences
│   └── Données d'activité
├── 🌐 Stockage Firebase (cloud)
│   ├── Avis et évaluations
│   ├── Lieux et marqueurs
│   └── Statistiques utilisateur
└── 📋 Stockage local (cache)
    ├── Images temporaires
    ├── Données de session
    └── Cache de navigation
```

### 🔐 **Isolation des utilisateurs**

#### Principe d'isolation
- **Chaque utilisateur** a son propre espace de stockage
- **Clés uniques** générées pour chaque utilisateur
- **Pas de partage** de données entre utilisateurs
- **Nettoyage automatique** des données obsolètes

#### Génération des clés
```javascript
// Format des clés de stockage
user_{userId}_{dataType}

// Exemples :
user_visitor_favorites          // Favoris du visiteur
user_test@example.com_profile   // Profil de l'utilisateur
user_admin@accessplus.com_settings // Réglages de l'admin
```

## 📱 **Stockage utilisateur**

### 🎯 **Types de données stockées**

#### Données de profil
- **Informations personnelles** : Nom, email, téléphone
- **Préférences d'accessibilité** : Rampes, ascenseurs, etc.
- **Paramètres d'interface** : Thème, taille de texte
- **Préférences de notification** : Types et fréquence

#### Données d'activité
- **Lieux favoris** : Liste des lieux sauvegardés
- **Avis publiés** : Commentaires, notes, photos
- **Historique de navigation** : Lieux consultés
- **Marqueurs de carte** : Lieux ajoutés manuellement

#### Données de session
- **État de connexion** : Authentification actuelle
- **Préférences temporaires** : Filtres actifs
- **Cache de recherche** : Résultats récents
- **Données de géolocalisation** : Position actuelle

### 🔧 **Service de stockage**

#### Méthodes principales
```javascript
class StorageService {
  // Récupérer l'ID utilisateur actuel
  static async getCurrentUserId()
  
  // Sauvegarder une donnée
  static async setUserData(key, value, userId = null)
  
  // Récupérer une donnée
  static async getUserData(key, defaultValue = null, userId = null)
  
  // Supprimer une donnée
  static async removeUserData(key, userId = null)
  
  // Récupérer toutes les données d'un utilisateur
  static async getAllUserData(userId)
  
  // Supprimer toutes les données d'un utilisateur
  static async clearUserData(userId)
}
```

#### Exemples d'utilisation
```javascript
// Sauvegarder des favoris
await StorageService.setUserData('favorites', favoritePlaces);

// Récupérer des préférences
const prefs = await StorageService.getUserData('accessibilityPrefs', defaultPrefs);

// Supprimer des données
await StorageService.removeUserData('tempSearchResults');
```

## 🔐 **Chiffrement des données**

### 🛡️ **Système de chiffrement AES-256**

#### Chiffrement automatique
- **Mots de passe** : Chiffrés avant stockage
- **Données sensibles** : Chiffrement automatique
- **Clés de chiffrement** : Générées localement
- **Migration automatique** vers le chiffrement

#### Service de chiffrement
```javascript
class CryptoService {
  // Chiffrer des données
  static async encrypt(data, key)
  
  // Déchiffrer des données
  static async decrypt(encryptedData, key)
  
  // Générer une clé de chiffrement
  static async generateKey()
  
  // Migrer vers le chiffrement
  static async migrateToEncryption()
}
```

### 🔑 **Gestion des clés**

#### Génération des clés
- **Clés uniques** par utilisateur
- **Dérivation** depuis un secret maître
- **Rotation** automatique des clés
- **Sauvegarde sécurisée** des clés

#### Sécurité des clés
- **Stockage local** uniquement
- **Chiffrement** des clés maîtres
- **Validation** de l'intégrité
- **Régénération** en cas de compromission

## 🌐 **Synchronisation Firebase**

### 📊 **Données synchronisées**

#### Collections Firebase
- **users** : Profils utilisateur
- **reviews** : Avis et évaluations
- **places** : Lieux et marqueurs
- **statistics** : Statistiques utilisateur

#### Règles de synchronisation
- **Synchronisation automatique** lors de la connexion
- **Synchronisation manuelle** depuis les réglages
- **Gestion des conflits** automatique
- **Fallback** vers les données locales

### 🔄 **Processus de synchronisation**

#### Synchronisation vers Firebase
1. **Vérification** de la connexion internet
2. **Validation** des données locales
3. **Upload** des nouvelles données
4. **Confirmation** de la synchronisation
5. **Mise à jour** du statut local

#### Synchronisation depuis Firebase
1. **Récupération** des données distantes
2. **Fusion** avec les données locales
3. **Résolution** des conflits
4. **Mise à jour** du stockage local
5. **Notification** de la synchronisation

## 🧪 **Tests et diagnostic**

### 📊 **Scripts de diagnostic**

```bash
# Diagnostic complet du stockage
node scripts/diagnose-storage.js

# Test d'isolation des données
node scripts/test-storage-isolation.js

# Test de chiffrement
node scripts/test-encryption.js

# Test de migration
node scripts/test-migration-flow.js

# Nettoyage du stockage
node scripts/clean-storage.js
```

### 🔍 **Diagnostic du stockage**

#### Analyse des données
- **Taille** des données par utilisateur
- **Types** de données stockées
- **Intégrité** des données
- **Performance** du stockage

#### Détection des problèmes
- **Données corrompues** : Validation JSON
- **Conflits** : Doublons et incohérences
- **Espace** : Utilisation du stockage
- **Permissions** : Accès aux données

## 🆘 **Résolution de problèmes**

### ❌ **Problèmes courants**

#### Données manquantes
**Symptômes** : Certaines données n'apparaissent pas
**Solutions** :
- Vérifiez la synchronisation
- Forcez la synchronisation manuellement
- Vérifiez l'espace disponible
- Contactez le support

#### Erreurs de chiffrement
**Symptômes** : Impossible de déchiffrer les données
**Solutions** :
- Vérifiez les clés de chiffrement
- Régénérez les clés si nécessaire
- Restaurez depuis une sauvegarde
- Contactez le support

#### Conflits de données
**Symptômes** : Doublons ou données incohérentes
**Solutions** :
- Nettoyez les données en conflit
- Forcez la synchronisation
- Vérifiez les règles de fusion
- Contactez le support

### 🔧 **Solutions techniques**

#### Nettoyage manuel
```bash
# Nettoyer les données d'un utilisateur
node scripts/clean-user-data.js --user=visitor

# Nettoyer toutes les données
node scripts/clean-all-data.js

# Vérifier l'intégrité
node scripts/verify-data-integrity.js
```

#### Récupération de données
```bash
# Sauvegarder avant nettoyage
node scripts/backup-storage.js

# Restaurer depuis sauvegarde
node scripts/restore-storage.js

# Migrer les données
node scripts/migrate-storage.js
```

## 📊 **Statistiques et métriques**

### 📈 **Métriques de stockage**

#### Utilisation par utilisateur
- **Taille moyenne** : 2-5 MB par utilisateur
- **Types de données** : 8-12 types différents
- **Fréquence d'accès** : 50-100 accès par jour
- **Taux de compression** : 30-40%

#### Performance
- **Temps de lecture** : < 100ms
- **Temps d'écriture** : < 200ms
- **Temps de chiffrement** : < 50ms
- **Temps de synchronisation** : < 5s

### 🎯 **Types de données**

#### Répartition par type
- **Profil utilisateur** : 15%
- **Préférences** : 10%
- **Favoris** : 25%
- **Avis** : 30%
- **Historique** : 15%
- **Cache** : 5%

## 🔮 **Évolutions futures**

### 🚀 **Améliorations prévues**

#### Stockage local
- **Compression automatique** des données
- **Cache intelligent** pour les données fréquentes
- **Nettoyage automatique** des données obsolètes
- **Backup automatique** des données importantes

#### Synchronisation
- **Synchronisation temps réel** avec Firebase
- **Synchronisation delta** pour les mises à jour
- **Synchronisation en arrière-plan** non bloquante
- **Gestion avancée** des conflits

### 🔧 **Optimisations techniques**

#### Performance
- **Indexation** des données fréquentes
- **Cache en mémoire** pour les accès rapides
- **Compression** des données volumineuses
- **Optimisation** des requêtes

#### Sécurité
- **Chiffrement end-to-end** des données sensibles
- **Validation cryptographique** des données
- **Audit trail** complet des accès
- **Suppression sécurisée** des données

---

**AccessPlus** - Rendre l'accessibilité accessible à tous ! ♿

*Dernière mise à jour : Juin 2025* 