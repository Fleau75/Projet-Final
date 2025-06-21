# Guide de récupération de mot de passe - AccessPlus

## 🎯 Fonctionnalité ajoutée

La fonctionnalité **"Mot de passe oublié"** a été implémentée dans AccessPlus pour permettre aux utilisateurs de récupérer l'accès à leur compte en cas d'oubli de mot de passe.

## 🔧 Comment ça fonctionne

### 1. **Demande de réinitialisation**
- L'utilisateur clique sur "Mot de passe oublié ?" sur l'écran de connexion
- Il saisit son adresse email
- Le système vérifie que l'utilisateur existe
- Un token de réinitialisation est généré (valide 1 heure)

### 2. **Simulation d'envoi d'email**
- En mode développement, l'email est simulé
- Le token est stocké localement dans AsyncStorage
- En production, un vrai service d'email serait utilisé

### 3. **Réinitialisation du mot de passe**
- L'utilisateur définit un nouveau mot de passe
- Le système vérifie la validité du token
- Le mot de passe est mis à jour dans le stockage local

## 📱 Utilisation dans l'application

### **Écran de connexion**
```
Email: [utilisateur@example.com]
Mot de passe: [••••••••]
[Mot de passe oublié ?] ← Nouveau bouton
[Se connecter]
```

### **Écran "Mot de passe oublié"**
```
Mot de passe oublié
Entrez votre adresse email pour recevoir un lien de réinitialisation

[Adresse email]
[Envoyer le lien de réinitialisation]
[Retour à la connexion]
```

### **Écran "Nouveau mot de passe"**
```
Nouveau mot de passe
Définissez votre nouveau mot de passe
utilisateur@example.com

[Nouveau mot de passe]
[Confirmer le nouveau mot de passe]
[Réinitialiser le mot de passe]
[Retour à la connexion]
```

## 🔐 Sécurité

### **Tokens de réinitialisation**
- **Durée de vie** : 1 heure
- **Format** : `reset_[timestamp]_[random]`
- **Stockage** : AsyncStorage local
- **Expiration automatique** : Suppression après utilisation

### **Validation**
- Vérification de l'existence de l'utilisateur
- Validation du format email
- Confirmation du nouveau mot de passe
- Vérification de la force du mot de passe (minimum 6 caractères)

## 🧪 Tests

### **Utilisateurs de test disponibles**
- `test@example.com` / `123456`
- `demo@accessplus.com` / `demo123`
- `admin@accessplus.com` / `admin123`

### **Scénarios de test**
1. **Utilisateur existant** : Demande de réinitialisation réussie
2. **Utilisateur inexistant** : Message d'erreur approprié
3. **Token expiré** : Redirection vers nouvelle demande
4. **Changement de mot de passe** : Mise à jour réussie

## 🚀 Fonctionnalités ajoutées

### **Nouveaux écrans**
- `ForgotPasswordScreen.js` : Demande de réinitialisation
- `ResetPasswordScreen.js` : Définition du nouveau mot de passe

### **Nouvelles méthodes AuthService**
- `checkUserExists(email)` : Vérifier l'existence d'un utilisateur
- `sendPasswordResetEmail(email)` : Envoyer l'email de réinitialisation
- `verifyResetToken(email)` : Vérifier la validité du token
- `updatePassword(email, newPassword)` : Mettre à jour le mot de passe
- `changePassword(currentPassword, newPassword)` : Changer le mot de passe

### **Navigation mise à jour**
- Ajout des routes `ForgotPassword` et `ResetPassword`
- Intégration dans le flux d'authentification

## 🔄 Flux complet

```
1. Utilisateur oublie son mot de passe
   ↓
2. Clic sur "Mot de passe oublié ?"
   ↓
3. Saisie de l'email
   ↓
4. Vérification de l'existence de l'utilisateur
   ↓
5. Génération du token de réinitialisation
   ↓
6. "Envoi" de l'email (simulé)
   ↓
7. Utilisateur clique sur le lien (simulé)
   ↓
8. Saisie du nouveau mot de passe
   ↓
9. Validation et mise à jour
   ↓
10. Redirection vers la connexion
```

## 🎨 Interface utilisateur

### **Design cohérent**
- Même style que les autres écrans d'authentification
- Support des thèmes clair/sombre
- Adaptation de la taille des polices
- Messages d'erreur et de succès clairs

### **Accessibilité**
- Support du lecteur d'écran
- Navigation au clavier
- Messages d'erreur explicites
- Boutons avec icônes descriptives

## 🔧 Configuration en production

### **Service d'email réel**
Pour passer en production, remplacer la simulation par un vrai service :

```javascript
// Dans AuthService.sendPasswordResetEmail()
// Remplacer la simulation par :
const emailService = new EmailService();
await emailService.sendPasswordResetEmail(email, resetToken, resetUrl);
```

### **Base de données**
- Stockage des tokens en base de données
- Gestion des expirations côté serveur
- Historique des demandes de réinitialisation

## ✅ Validation

La fonctionnalité a été testée avec :
- ✅ Utilisateurs de test existants
- ✅ Utilisateurs inexistants
- ✅ Tokens expirés
- ✅ Changement de mot de passe
- ✅ Navigation entre les écrans
- ✅ Gestion des erreurs
- ✅ Interface utilisateur responsive

## 🎉 Résultat

La fonctionnalité **"Mot de passe oublié"** est maintenant entièrement fonctionnelle et intégrée dans AccessPlus, offrant aux utilisateurs un moyen sécurisé et convivial de récupérer l'accès à leur compte ! 