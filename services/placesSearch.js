import { GOOGLE_PLACES_API_KEY } from '@env';

/**
 * Recherche des lieux avec l'API Google Places
 * @param {string} query - Le texte de recherche
 * @returns {Promise<Array>} - Liste des lieux trouvés
 */
export const searchPlaces = async (query) => {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
        query
      )}&key=${GOOGLE_PLACES_API_KEY}&region=FR&language=fr`
    );

    const data = await response.json();

    if (data.status === 'OK') {
      return data.results.map(place => ({
        id: place.place_id,
        name: place.name,
        address: place.formatted_address,
        location: place.geometry.location,
      }));
    } else {
      console.error('Erreur Google Places:', data.status);
      return [];
    }
  } catch (error) {
    console.error('Erreur lors de la recherche:', error);
    return [];
  }
}; 