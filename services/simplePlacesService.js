import { GOOGLE_PLACES_API_KEY } from '@env';
import fakePlaces from './fakePlacesData';

// Cache mémoire pour les recherches Nearby
const simpleNearbyCache = {};

// Service Places simplifié et robuste
class SimplePlacesService {
  static isApiEnabled = null; // Cache pour éviter les vérifications répétées
  
  static async checkApiStatus() {
    if (this.isApiEnabled !== null) {
      return this.isApiEnabled;
    }
    
    try {
      // Test simple avec une requête minimale
      const testUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=48.8566,2.3522&radius=1000&type=restaurant&key=${GOOGLE_PLACES_API_KEY}`;
      const response = await fetch(testUrl);
      const data = await response.json();
      
      if (data.status === 'REQUEST_DENIED') {
        console.log('❌ Google Places API non accessible:', data.error_message);
        this.isApiEnabled = false;
        return false;
      }
      
      this.isApiEnabled = true;
      console.log('✅ Google Places API accessible');
      return true;
    } catch (error) {
      console.log('❌ Erreur test Google Places:', error.message);
      this.isApiEnabled = false;
      return false;
    }
  }
  
  /**
   * Convertit une photo_reference en URL d'image Google Places
   * @param {string} photoReference - La référence de photo de Google Places
   * @param {number} maxWidth - Largeur maximale de l'image (défaut: 400px)
   * @returns {string} - URL de l'image
   */
  static getPhotoUrl(photoReference, maxWidth = 400) {
    if (!photoReference) return null;
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${GOOGLE_PLACES_API_KEY}`;
  }
  
  static async getNearbyPlaces(category = 'all', maxResults = 10, userLocation = null, searchRadius = null) {
    try {
      // Clé de cache basée sur la catégorie et la position
      const cacheKey = `${category}_${userLocation ? userLocation.latitude + ',' + userLocation.longitude : 'default'}_${searchRadius || 'default'}`;
      if (simpleNearbyCache[cacheKey]) {
        console.log('🟡 Résultat Nearby depuis le cache');
        return simpleNearbyCache[cacheKey];
      }
      // Vérifier si l'API est accessible
      const apiAvailable = await this.checkApiStatus();
      if (!apiAvailable) {
        console.log('Google Places API désactivé - utilisation des données Firestore uniquement');
        return [];
      }
      
      console.log(`🔍 Recherche Google Places pour "${category}" à Paris...`);
      
      // Utiliser la position de l'utilisateur ou fallback sur le centre de Paris
      let searchLocation;
      if (userLocation && userLocation.latitude && userLocation.longitude) {
        searchLocation = { lat: userLocation.latitude, lng: userLocation.longitude };
        console.log(`📍 Recherche depuis votre position: ${searchLocation.lat.toFixed(4)}, ${searchLocation.lng.toFixed(4)}`);
      } else {
        // Fallback sur le centre de Paris si pas de localisation
        searchLocation = { lat: 48.8566, lng: 2.3522 };
        console.log('📍 Recherche depuis le centre de Paris (position non disponible)');
      }
      
      // Mapping des catégories vers les types Google Places
      const typeMapping = {
        'all': 'establishment',
        'restaurant': 'restaurant',
        'culture': 'museum',
        'shopping': 'store',
        'health': 'hospital',
        'sport': 'gym',
        'education': 'school'
      };
      
      const type = typeMapping[category] || 'establishment';
      
      // Utiliser le rayon configuré dans les réglages ou fallback
      const radius = searchRadius || (userLocation ? 1500 : 5000); // Défaut: 1.5km si position connue, 5km sinon
      
      console.log(`🎯 Rayon de recherche: ${radius}m ${searchRadius ? '(configuré dans les réglages)' : '(par défaut)'}`);
      
      // URL de l'API Google Places Nearby Search
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${searchLocation.lat},${searchLocation.lng}&radius=${radius}&type=${type}&key=${GOOGLE_PLACES_API_KEY}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status !== 'OK') {
        console.warn(`⚠️ Google Places status: ${data.status}`);
        this.isApiEnabled = false; // Marquer comme non disponible
        return [];
      }
      
      // Transformer les résultats au format de l'app
      const places = data.results.slice(0, Math.min(maxResults, 10)).map(place => {
        // Récupérer l'URL de la première image si disponible
        const imageUrl = place.photos && place.photos.length > 0 
          ? this.getPhotoUrl(place.photos[0].photo_reference, 400)
          : null;

        return {
          id: place.place_id,
          name: place.name,
          type: category,
          address: place.vicinity || 'Paris, France',
          coordinates: {
            latitude: place.geometry.location.lat,
            longitude: place.geometry.location.lng
          },
          rating: place.rating || 4.0,
          accessibility: {
            score: Math.floor(Math.random() * 3) + 3, // 3-5 pour la démo
            features: ['Entrée accessible', 'Toilettes accessibles']
          },
          source: 'google_places',
          image: imageUrl, // URL de l'image directement utilisable
          photos: place.photos ? [place.photos[0].photo_reference] : [] // Garder pour compatibilité
        };
      });
      
      // Debug: Afficher les premiers lieux trouvés avec leurs adresses
      console.log('🔍 Premiers lieux Google Places trouvés:');
      places.slice(0, 5).forEach((place, index) => {
        console.log(`${index + 1}. ${place.name} - ${place.address} (${place.coordinates.latitude.toFixed(4)}, ${place.coordinates.longitude.toFixed(4)}) ${place.image ? '📸' : '❌'}`);
      });
      
      // Debug: Compter les lieux avec images
      const placesWithImages = places.filter(place => place.image);
      console.log(`📸 ${placesWithImages.length}/${places.length} lieux ont des images`);
      
      console.log(`✅ Google Places: ${places.length} lieux trouvés pour "${category}" dans un rayon de ${radius}m`);
      simpleNearbyCache[cacheKey] = places;
      return places;
      
    } catch (error) {
      console.error(`❌ Erreur Google Places pour ${category}:`, error.message);
      this.isApiEnabled = false;
      return [];
    }
  }
  
  // Reset le cache de statut API (utile pour les tests)
  static resetApiStatus() {
    this.isApiEnabled = null;
    console.log('🔄 Statut API Google Places réinitialisé');
  }
}

export function getFakePlaces() {
  return fakePlaces;
}

export default SimplePlacesService; 