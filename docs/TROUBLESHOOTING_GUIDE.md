# 🔧 Guide de Dépannage - AccessPlus

## 📋 Vue d'ensemble

Ce guide détaille les problèmes courants rencontrés avec AccessPlus et leurs solutions.

## 🚨 Problèmes Critiques

### 🔐 Problèmes d'Authentification

#### **Erreur : "Impossible de se connecter"**

**Symptômes :**
- Message d'erreur lors de la connexion
- Écran de connexion qui se recharge
- Impossible d'accéder à l'application

**Causes possibles :**
1. Identifiants incorrects
2. Problème de réseau
3. Serveur indisponible
4. Données corrompues

**Solutions :**

**Solution 1 : Vérifier les identifiants**
```bash
# Utiliser un compte de test
Email: test@example.com
Mot de passe: 123456
```

**Solution 2 : Réinitialiser le mot de passe**
1. Cliquer sur "Mot de passe oublié ?"
2. Saisir l'email
3. Suivre le lien de réinitialisation
4. Définir un nouveau mot de passe

**Solution 3 : Nettoyer les données locales**
```javascript
// Dans la console de développement
import AsyncStorage from '@react-native-async-storage/async-storage';
await AsyncStorage.clear();
```

**Solution 4 : Mode visiteur**
1. Cliquer sur "Continuer en tant que visiteur"
2. Utiliser l'app sans compte
3. Créer un compte plus tard

#### **Erreur : "Authentification biométrique échouée"**

**Symptômes :**
- Échec de l'authentification biométrique
- Message d'erreur biométrique
- Fallback vers mot de passe

**Solutions :**

**Solution 1 : Vérifier la configuration**
```bash
# Tester la biométrie
node scripts/test-biometric.js
```

**Solution 2 : Réactiver la biométrie**
1. Aller dans Paramètres → Authentification biométrique
2. Désactiver puis réactiver
3. Suivre la configuration

**Solution 3 : Utiliser le mot de passe**
- Cliquer sur "Utiliser le mot de passe"
- Se connecter normalement
- Réactiver la biométrie plus tard

### 💾 Problèmes de Stockage

#### **Erreur : "Impossible de sauvegarder les données"**

**Symptômes :**
- Données non sauvegardées
- Erreur de stockage
- Perte de données

**Solutions :**

**Solution 1 : Vérifier l'espace disque**
```bash
# Vérifier l'espace disponible
df -h
```

**Solution 2 : Nettoyer le cache**
```javascript
// Nettoyer le cache
import AsyncStorage from '@react-native-async-storage/async-storage';
await AsyncStorage.clear();
```

**Solution 3 : Réparer le stockage**
```bash
# Script de réparation
node scripts/fix-storage.js
```

#### **Erreur : "Migration des données échouée"**

**Symptômes :**
- Échec de migration visiteur → compte
- Données perdues
- Erreur de migration

**Solutions :**

**Solution 1 : Migration manuelle**
```bash
# Script de migration
node scripts/migrate-to-private-storage.js
```

**Solution 2 : Récupération des données**
```bash
# Script de récupération
node scripts/debug-storage.js
```

**Solution 3 : Nouvelle migration**
1. Se déconnecter
2. Supprimer les données locales
3. Se reconnecter
4. Relancer la migration

### 🌐 Problèmes de Réseau

#### **Erreur : "Impossible de charger les lieux"**

**Symptômes :**
- Liste vide de lieux
- Message d'erreur réseau
- Chargement infini

**Solutions :**

**Solution 1 : Vérifier la connexion**
- Vérifier la connexion internet
- Essayer un autre réseau
- Redémarrer l'appareil

**Solution 2 : Utiliser les données en cache**
```javascript
// Forcer l'utilisation du cache
await PlacesService.loadFromCache();
```

**Solution 3 : Actualiser les données**
- Tirer vers le bas pour actualiser
- Cliquer sur le bouton "🔄 Actualiser"
- Redémarrer l'application

#### **Erreur : "API Google Places indisponible"**

**Symptômes :**
- Erreur API Google Places
- Lieux non chargés
- Message d'erreur API

**Solutions :**

**Solution 1 : Vérifier la clé API**
```bash
# Vérifier la configuration
node scripts/check-env.js
```

**Solution 2 : Utiliser les données statiques**
```javascript
// Forcer l'utilisation des données statiques
await SimplePlacesService.getSamplePlaces();
```

**Solution 3 : Configurer une nouvelle clé**
1. Obtenir une nouvelle clé Google Places
2. Mettre à jour la configuration
3. Redémarrer l'application

## 🔧 Problèmes Techniques

### 📱 Problèmes de Performance

#### **Application lente**

**Symptômes :**
- Chargement lent
- Interface qui lag
- Consommation batterie élevée

**Solutions :**

**Solution 1 : Optimiser les images**
```bash
# Optimiser les assets
npx expo optimize
```

**Solution 2 : Nettoyer le cache**
```javascript
// Nettoyer le cache des images
import { Image } from 'react-native';
Image.clearMemoryCache();
```

**Solution 3 : Redémarrer l'application**
- Fermer complètement l'app
- Redémarrer l'appareil
- Relancer l'application

#### **Consommation mémoire élevée**

**Symptômes :**
- Application qui plante
- Messages d'erreur mémoire
- Performance dégradée

**Solutions :**

**Solution 1 : Optimiser les listes**
```javascript
// Utiliser FlatList optimisée
<FlatList
  data={places}
  keyExtractor={(item) => item.id}
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  windowSize={10}
/>
```

**Solution 2 : Gestion de la mémoire**
```javascript
// Nettoyer les listeners
useEffect(() => {
  return () => {
    // Cleanup
  };
}, []);
```

### 🎨 Problèmes d'Interface

#### **Thème non appliqué**

**Symptômes :**
- Thème clair/sombre non fonctionnel
- Couleurs incorrectes
- Interface incohérente

**Solutions :**

**Solution 1 : Redémarrer le thème**
```javascript
// Forcer le changement de thème
import { useTheme } from '../theme/ThemeContext';
const { toggleTheme } = useTheme();
toggleTheme();
```

**Solution 2 : Réinitialiser les paramètres**
1. Aller dans Paramètres → Apparence
2. Changer de thème
3. Redémarrer l'application

#### **Taille de police incorrecte**

**Symptômes :**
- Texte trop petit/grand
- Adaptation de taille non fonctionnelle
- Lisibilité réduite

**Solutions :**

**Solution 1 : Ajuster la taille**
```javascript
// Ajuster la taille des polices
import { useTextSize } from '../theme/TextSizeContext';
const { increaseTextSize, decreaseTextSize } = useTextSize();
```

**Solution 2 : Réinitialiser les paramètres**
1. Aller dans Paramètres → Accessibilité
2. Réinitialiser la taille des polices
3. Ajuster selon les préférences

### ♿ Problèmes d'Accessibilité

#### **Lecteur d'écran ne fonctionne pas**

**Symptômes :**
- Lecteur d'écran silencieux
- Navigation impossible
- Labels manquants

**Solutions :**

**Solution 1 : Vérifier la configuration**
```javascript
// Vérifier l'accessibilité
import { AccessibilityInfo } from 'react-native';
const isEnabled = await AccessibilityInfo.isScreenReaderEnabled();
```

**Solution 2 : Redémarrer le lecteur d'écran**
1. Désactiver le lecteur d'écran
2. Redémarrer l'application
3. Réactiver le lecteur d'écran

**Solution 3 : Vérifier les labels**
```javascript
// Ajouter des labels d'accessibilité
<Button
  accessibilityLabel="Ajouter un avis"
  accessibilityHint="Double-tapez pour ajouter un avis"
/>
```

#### **Navigation clavier défaillante**

**Symptômes :**
- Impossible de naviguer au clavier
- Focus non visible
- Ordre de tabulation incorrect

**Solutions :**

**Solution 1 : Vérifier le focus**
```javascript
// Gérer le focus
import { useRef } from 'react';
const inputRef = useRef();
inputRef.current?.focus();
```

**Solution 2 : Améliorer la navigation**
```javascript
// Ajouter la navigation clavier
<TouchableOpacity
  accessible={true}
  accessibilityRole="button"
  accessibilityLabel="Bouton d'action"
/>
```

## 🔔 Problèmes de Notifications

### **Notifications non reçues**

**Symptômes :**
- Aucune notification
- Permissions refusées
- Notifications manquées

**Solutions :**

**Solution 1 : Vérifier les permissions**
```javascript
// Vérifier les permissions
import * as Notifications from 'expo-notifications';
const { status } = await Notifications.getPermissionsAsync();
```

**Solution 2 : Redemander les permissions**
1. Aller dans Paramètres → Notifications
2. Activer les notifications
3. Redémarrer l'application

**Solution 3 : Tester les notifications**
```bash
# Tester les notifications
node scripts/test-notifications.js
```

## 🏆 Problèmes de Vérification

### **Badge de vérification manquant**

**Symptômes :**
- Badge non affiché
- Compteur d'avis incorrect
- Statut non mis à jour

**Solutions :**

**Solution 1 : Vérifier les critères**
```bash
# Vérifier le statut de vérification
node scripts/test-verification.js
```

**Solution 2 : Recalculer le statut**
```javascript
// Recalculer le statut
await AuthService.checkVerificationStatus(userId);
```

**Solution 3 : Ajouter des avis**
1. Ajouter au moins 3 avis
2. Attendre la mise à jour
3. Vérifier le badge

## 🛠️ Outils de Diagnostic

### Scripts de Diagnostic

**Diagnostic complet :**
```bash
# Diagnostic général
node scripts/diagnose-storage.js
node scripts/diagnose-password.js
```

**Diagnostic spécifique :**
```bash
# Diagnostic du stockage
node scripts/debug-storage.js

# Diagnostic de l'authentification
node scripts/debug-auth.js

# Diagnostic des migrations
node scripts/debug-migration-issue.js
```

### Logs et Debug

**Activer les logs :**
```javascript
// Dans le code
console.log('Debug info:', data);

// Dans la console
adb logcat | grep AccessPlus
```

**Analyser les erreurs :**
```javascript
// Capturer les erreurs
try {
  // Code problématique
} catch (error) {
  console.error('Erreur:', error);
  // Gérer l'erreur
}
```

## 📞 Support Utilisateur

### **Problèmes courants**

**"L'application ne démarre pas"**
1. Redémarrer l'appareil
2. Réinstaller l'application
3. Vérifier l'espace disque

**"Je ne peux pas me connecter"**
1. Vérifier la connexion internet
2. Utiliser le mode visiteur
3. Réinitialiser le mot de passe

**"Les lieux ne se chargent pas"**
1. Actualiser l'application
2. Vérifier la géolocalisation
3. Utiliser les données en cache

### **Contact Support**

**Informations à fournir :**
- Version de l'application
- Modèle d'appareil
- Système d'exploitation
- Description du problème
- Étapes de reproduction
- Logs d'erreur

## 🔮 Prévention des Problèmes

### **Bonnes Pratiques**

1. **Mise à jour régulière**
   - Garder l'application à jour
   - Mettre à jour le système d'exploitation
   - Vérifier les permissions

2. **Sauvegarde des données**
   - Sauvegarder régulièrement
   - Utiliser la synchronisation
   - Exporter les données importantes

3. **Maintenance préventive**
   - Nettoyer le cache régulièrement
   - Vérifier l'espace disque
   - Tester les fonctionnalités

### **Monitoring**

**Surveillance automatique :**
- Erreurs d'application
- Performance dégradée
- Utilisation des ressources
- Comportement utilisateur

**Alertes :**
- Erreurs critiques
- Performance anormale
- Utilisation excessive
- Problèmes de sécurité

---

*Ce guide de dépannage couvre les problèmes les plus courants d'AccessPlus. Pour des problèmes spécifiques, consultez la documentation technique ou contactez le support.* 