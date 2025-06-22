# Configuration Google Places API pour AccessPlus

## 🚀 Pourquoi cette amélioration ?

Avant : L'application n'affichait que **6 lieux statiques** de Paris  
Maintenant : L'application peut récupérer **des centaines de lieux réels** à Paris via l'API Google Places !

## 📋 Étapes de configuration

### 1. Obtenir une clé API Google Places

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un nouveau projet ou sélectionnez un projet existant
3. Activez les APIs suivantes :
   - **Places API**
   - **Maps JavaScript API** 
   - **Geocoding API** (optionnel)

4. Allez dans "Identifiants" > "Créer des identifiants" > "Clé API"
5. Copiez votre clé API

### 2. Configurer la clé dans l'application

Créez un fichier `.env` à la racine du projet :

```bash
GOOGLE_PLACES_API_KEY=votre_vraie_cle_api_ici
```

**⚠️ Important :** Ajoutez `.env` à votre `.gitignore` pour ne pas exposer votre clé !

### 3. Restrictions de sécurité (recommandé)

Dans Google Cloud Console, configurez des restrictions pour votre clé :

- **Restrictions d'application** : Applications Android/iOS
- **Restrictions d'API** : Limitez aux APIs Places seulement
- **Quotas** : Définissez une limite journalière

## 🌍 Ce que fait le nouveau système

### Recherche par zones géographiques
L'application divise Paris en **7 zones** et recherche dans chacune :
- Centre Paris
- Nord-Ouest (17e, 8e arrondissements)
- Nord-Est (19e, 20e arrondissements)  
- Sud-Ouest (15e, 16e arrondissements)
- Sud-Est (12e, 13e arrondissements)
- Ouest (Boulogne, Neuilly)
- Est (Vincennes, Montreuil)

### Types de lieux recherchés

**🍽️ Restaurants :**
- restaurant, cafe, bar, bakery, meal_takeaway, food, night_club

**🎭 Culture :**
- museum, art_gallery, library, tourist_attraction, park, church, movie_theater

**🛍️ Shopping :**
- shopping_mall, store, supermarket, clothing_store, department_store

**🏥 Santé :**
- hospital, doctor, pharmacy, physiotherapist, dentist, medical_clinic

**🏃 Sport :**
- gym, stadium, sports_complex, fitness_center, bowling_alley, spa

**📚 Éducation :**
- school, university, library, primary_school, secondary_school

## 📊 Résultats attendus

- **Avant** : 6 lieux statiques
- **Après** : 200-1000+ lieux réels selon les filtres

## 🔧 Utilisation dans l'app

### Interface utilisateur
- Compteur de lieux : `"📍 X lieux disponibles à Paris"`
- Bouton "🔄 Actualiser" pour recharger
- Filtres par catégorie fonctionnent avec les vrais lieux

### Fonctionnalités automatiques
- Élimination des doublons
- Estimation de l'accessibilité 
- Géolocalisation et calcul de distance
- Fallback sur données statiques si API indisponible

## 🚨 Limites et coûts

### Limites Google Places API
- **20 lieux maximum** par requête
- **Délai de 100ms** entre requêtes pour éviter rate limiting
- **Quotas gratuits** : 100 requêtes/jour (puis payant)

### Optimisations incluses
- Cache des résultats
- Limitation à 500 lieux max par catégorie
- Gestion d'erreurs avec fallback

## 🛠️ Dépannage

### "REQUEST_DENIED"
- Vérifiez que votre clé API est correcte
- Vérifiez que Places API est activée
- Vérifiez les restrictions de votre clé

### "ZERO_RESULTS"
- Normal pour certains types de lieux dans certaines zones
- L'app continue avec d'autres requêtes

### Pas de lieux affichés
- Vérifiez les logs dans la console
- Vérifiez votre connexion internet
- L'app utilise les données statiques en fallback

## 🎉 Test de fonctionnement

Une fois configuré :

1. Lancez l'app : `npx expo start`
2. Regardez la console pour voir : `🔍 Recherche de lieux "all" dans toutes les zones de Paris...`
3. L'interface affichera : `📍 XXX lieux disponibles à Paris` (au lieu de 6)
4. Testez les filtres par catégorie

## 💡 Améliorations futures possibles

- Integration avec l'API officielle de la Ville de Paris
- Données d'accessibilité réelles (Jaccede, etc.)
- Cache persistant avec AsyncStorage
- Mode hors-ligne avancé
- Recherche textuelle améliorée 