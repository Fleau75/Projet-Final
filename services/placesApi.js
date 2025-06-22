import ConfigService from './configService';

/**
 * Service pour interagir avec l'API Google Places
 */
class PlacesApiService {
  static BASE_URL = 'https://maps.googleapis.com/maps/api';
  
  /**
   * Obtenir la clé API Google Places
   */
  static getApiKey() {
    const apiKey = ConfigService.getGooglePlacesApiKey();
    if (!apiKey) {
      console.warn('⚠️ Clé API Google Places non configurée - utilisation des données locales uniquement');
      return null;
    }
    return apiKey;
  }
  
  /**
   * Rechercher des lieux
   */
  static async searchPlaces(query, location = null, radius = 5000) {
    try {
      const apiKey = this.getApiKey();
      if (!apiKey) {
        console.log('🔍 Google Places API non disponible - retour des données locales');
        return [];
      }
      
      let url = `${this.BASE_URL}/place/textsearch/json?query=${encodeURIComponent(query)}&language=fr&key=${apiKey}`;
      
      if (location) {
        url += `&location=${location.lat},${location.lng}&radius=${radius}`;
      }
      
      console.log('🔍 Recherche de lieux:', query);
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status === 'OK') {
        console.log(`✅ ${data.results.length} lieux trouvés pour "${query}"`);
        return data.results;
      } else {
        console.warn('⚠️ Erreur API Google Places:', data.status, data.error_message);
        return [];
      }
    } catch (error) {
      console.warn('⚠️ Erreur lors de la recherche de lieux:', error.message);
      return [];
    }
  }
  
  /**
   * Obtenir les détails d'un lieu
   */
  static async getPlaceDetails(placeId) {
    try {
      const apiKey = this.getApiKey();
      if (!apiKey) {
        console.log('🔍 Google Places API non disponible - retour des données locales');
        return null;
      }
      
      const fields = 'place_id,name,formatted_address,formatted_phone_number,website,opening_hours,price_level,reviews,photos,types,geometry,rating,user_ratings_total';
      
      const url = `${this.BASE_URL}/place/details/json?place_id=${placeId}&fields=${fields}&language=fr&key=${apiKey}`;
      
      console.log('🔍 Récupération des détails pour place_id:', placeId);
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status === 'OK') {
        console.log('✅ Détails récupérés pour', data.result.name);
        return data.result;
      } else {
        console.warn('⚠️ Erreur API Google Places:', data.status, data.error_message);
        return null;
      }
    } catch (error) {
      console.warn('⚠️ Erreur lors de la récupération des détails:', error.message);
      return null;
    }
  }
  
  /**
   * Rechercher des lieux à proximité
   */
  static async searchNearbyPlaces(location, radius = 5000, type = null) {
    try {
      const apiKey = this.getApiKey();
      if (!apiKey) {
        console.log('🔍 Google Places API non disponible - retour des données locales');
        return [];
      }
      
      let url = `${this.BASE_URL}/place/nearbysearch/json?location=${location.lat},${location.lng}&radius=${radius}&language=fr&key=${apiKey}`;
      
      if (type) {
        url += `&type=${type}`;
      }
      
      console.log('🔍 Recherche de lieux à proximité');
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status === 'OK') {
        console.log(`✅ ${data.results.length} lieux trouvés à proximité`);
        return data.results;
      } else {
        console.warn('⚠️ Erreur API Google Places:', data.status, data.error_message);
        return [];
      }
    } catch (error) {
      console.warn('⚠️ Erreur lors de la recherche à proximité:', error.message);
      return [];
    }
  }
}

export default PlacesApiService; 