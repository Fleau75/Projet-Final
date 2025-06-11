import { GOOGLE_PLACES_API_KEY } from '@env';

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
  
  static async getNearbyPlaces(category = 'all', maxResults = 20) {
    try {
      // Vérifier si l'API est accessible
      const apiAvailable = await this.checkApiStatus();
      if (!apiAvailable) {
        console.log('Google Places API désactivé - utilisation des données Firestore uniquement');
        return [];
      }
      
      console.log(`🔍 Recherche Google Places pour "${category}" à Paris...`);
      
      // Coordonnées du centre de Paris
      const parisCenter = { lat: 48.8566, lng: 2.3522 };
      
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
      
      // URL de l'API Google Places Nearby Search
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${parisCenter.lat},${parisCenter.lng}&radius=5000&type=${type}&key=${GOOGLE_PLACES_API_KEY}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status !== 'OK') {
        console.warn(`⚠️ Google Places status: ${data.status}`);
        this.isApiEnabled = false; // Marquer comme non disponible
        return [];
      }
      
      // Transformer les résultats au format de l'app
      const places = data.results.slice(0, maxResults).map(place => ({
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
        photos: place.photos ? [place.photos[0].photo_reference] : []
      }));
      
      console.log(`✅ Google Places: ${places.length} lieux trouvés pour "${category}"`);
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

export default SimplePlacesService; 