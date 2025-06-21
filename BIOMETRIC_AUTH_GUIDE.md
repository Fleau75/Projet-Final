# Guide d'authentification biométrique - AccessPlus

## 🎯 Fonctionnalité ajoutée

L'**authentification biométrique** a été implémentée dans AccessPlus pour permettre aux utilisateurs de se connecter rapidement et de manière sécurisée avec leur empreinte digitale ou reconnaissance faciale.

## 🔐 Comment ça fonctionne

### **Types d'authentification supportés**
- **Empreinte digitale** (Touch ID sur iOS, Fingerprint sur Android)
- **Reconnaissance faciale** (Face ID sur iOS, Face Unlock sur Android)
- **Reconnaissance d'iris** (sur certains appareils Android)

### **Sécurité**
- Les données biométriques restent sur l'appareil
- Aucune information biométrique n'est transmise ou stockée
- Fallback automatique vers mot de passe en cas d'échec
- Désactivation possible à tout moment

## 📱 Configuration

### **1. Première activation**
1. Connectez-vous à votre compte AccessPlus
2. Après la connexion, une popup vous proposera d'activer la biométrie
3. Cliquez sur "Activer"
4. Suivez les instructions de votre appareil pour configurer l'authentification
5. La biométrie est maintenant activée pour votre compte

### **2. Configuration manuelle**
1. Allez dans **Paramètres** → **🔐 Authentification biométrique**
2. Activez le switch "Authentification biométrique"
3. Suivez les instructions de votre appareil
4. La biométrie est configurée pour votre email

## 🔄 Utilisation

### **Connexion automatique**
- Si la biométrie est activée, l'app vous proposera automatiquement de vous connecter
- Appuyez sur le bouton "Se connecter avec la biométrie" sur l'écran de connexion
- Utilisez votre empreinte ou visage pour vous authentifier

### **Connexion manuelle**
- Vous pouvez toujours utiliser votre email/mot de passe
- La biométrie est un moyen de connexion supplémentaire, pas obligatoire

## ⚙️ Gestion des paramètres

### **Dans les Paramètres**
- **Section "🔐 Authentification biométrique"**
- Voir les types d'authentification supportés par votre appareil
- Activer/désactiver la biométrie
- Voir l'email configuré pour la biométrie

### **Désactivation**
1. Allez dans **Paramètres** → **🔐 Authentification biométrique**
2. Désactivez le switch
3. Confirmez la désactivation
4. La biométrie est maintenant désactivée

## 🛠️ Dépannage

### **Problèmes courants**

#### **"Biométrie non disponible"**
- Vérifiez que votre appareil supporte l'authentification biométrique
- Assurez-vous qu'au moins une empreinte ou visage est configuré
- Vérifiez les paramètres de sécurité de votre appareil

#### **"Échec de l'authentification"**
- Vérifiez que vous utilisez la bonne empreinte/visage
- Nettoyez le capteur d'empreinte ou la caméra
- Réessayez l'authentification

#### **"Scanner verrouillé"**
- Attendez quelques minutes avant de réessayer
- Redémarrez votre appareil si le problème persiste
- Utilisez votre mot de passe en attendant

#### **"Aucun code de verrouillage configuré"**
- Configurez un code PIN, mot de passe ou schéma sur votre appareil
- La biométrie nécessite un code de verrouillage comme fallback

### **Messages d'erreur**

| Erreur | Signification | Solution |
|--------|---------------|----------|
| `UserCancel` | Authentification annulée | Réessayez l'authentification |
| `UserFallback` | Utilisation du mot de passe | Utilisez votre mot de passe |
| `SystemCancel` | Interrompu par le système | Réessayez plus tard |
| `AuthenticationFailed` | Échec de l'authentification | Vérifiez votre empreinte/visage |
| `PasscodeNotSet` | Aucun code configuré | Configurez un code de verrouillage |
| `FingerprintScannerNotAvailable` | Scanner non disponible | Vérifiez votre appareil |
| `FingerprintScannerNotEnrolled` | Aucune empreinte enregistrée | Ajoutez une empreinte |
| `FingerprintScannerLockout` | Scanner verrouillé | Attendez et réessayez |

## 🔒 Sécurité et confidentialité

### **Protection des données**
- ✅ Les données biométriques restent sur votre appareil
- ✅ Aucune transmission vers nos serveurs
- ✅ Chiffrement local des préférences
- ✅ Désactivation possible à tout moment

### **Bonnes pratiques**
- Utilisez un code de verrouillage fort comme fallback
- Ne partagez pas votre appareil avec des personnes non autorisées
- Désactivez la biométrie si vous prêtez votre appareil
- Surveillez les tentatives d'authentification échouées

## 🧪 Test de la fonctionnalité

### **Script de test**
Un script de test est disponible pour vérifier le bon fonctionnement :

```bash
node scripts/test-biometric.js
```

### **Tests inclus**
- ✅ Vérification de la disponibilité
- ✅ Test des types supportés
- ✅ Sauvegarde/chargement des préférences
- ✅ Authentification automatique
- ✅ Messages d'erreur
- ✅ Désactivation

## 📋 Prérequis techniques

### **Appareils supportés**
- **iOS** : iPhone 5s et plus récents (Touch ID/Face ID)
- **Android** : API level 23+ avec capteur d'empreinte ou caméra compatible

### **Permissions requises**
- Aucune permission supplémentaire nécessaire
- Utilise les APIs système d'authentification

### **Dépendances**
- `expo-local-authentication` : Gestion de l'authentification biométrique
- `@react-native-async-storage/async-storage` : Stockage des préférences

## 🚀 Prochaines améliorations

### **Fonctionnalités prévues**
- 🔄 Authentification biométrique pour les actions sensibles
- 🔐 Chiffrement des données locales avec biométrie
- 📱 Support de l'authentification par Apple Watch
- 🌐 Synchronisation des préférences entre appareils

### **Optimisations**
- ⚡ Amélioration des performances
- 🎯 Meilleure détection des types d'authentification
- 🔧 Configuration plus granulaire
- 📊 Statistiques d'utilisation

---

**AccessPlus** - Rendre l'accessibilité accessible à tous ! ♿ 