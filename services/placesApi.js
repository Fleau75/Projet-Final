import axios from 'axios';
import { GOOGLE_PLACES_API_KEY } from '@env';

export const searchNearbyPlaces = async (latitude, longitude, radius = 1500) => {
  try {
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&key=${GOOGLE_PLACES_API_KEY}`;
    const response = await axios.get(url);

    if (!response.data) {
      throw new Error('Pas de données dans la réponse');
    }

    if (response.data.status === 'REQUEST_DENIED') {
      console.error('Détails de l\'erreur REQUEST_DENIED:', {
        message: response.data.error_message,
        status: response.data.status,
        fullResponse: JSON.stringify(response.data, null, 2)
      });
      throw new Error(`Requête refusée: ${response.data.error_message}`);
    }

    if (response.data.status !== 'OK') {
      console.error('Statut de réponse non-OK:', {
        status: response.data.status,
        message: response.data.error_message,
        fullResponse: JSON.stringify(response.data, null, 2)
      });
      throw new Error(`Statut invalide: ${response.data.status}`);
    }

    return response.data.results.map(place => ({
      id: place.place_id,
      name: place.name,
      address: place.vicinity,
      type: getPlaceType(place.types),
      rating: place.rating || 0,
      reviewCount: place.user_ratings_total || 0,
      image: place.photos ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${GOOGLE_PLACES_API_KEY}` : null,
      coordinates: {
        latitude: place.geometry.location.lat,
        longitude: place.geometry.location.lng
      },
      accessibility: {
        ramp: true,
        elevator: false,
        parking: true,
        toilets: false,
      }
    }));
  } catch (error) {
    console.error('Erreur détaillée:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers
    });
    return [];
  }
};

const getPlaceType = (types) => {
  const typeMapping = {
    restaurant: ['restaurant', 'cafe', 'bar', 'food', 'bakery', 'meal_takeaway'],
    culture: ['museum', 'art_gallery', 'library', 'tourist_attraction', 'park', 'church', 'place_of_worship'],
    shopping: ['shopping_mall', 'store', 'supermarket', 'clothing_store', 'department_store', 'electronics_store'],
    health: ['hospital', 'doctor', 'pharmacy', 'physiotherapist', 'dentist', 'medical_clinic'],
    sport: ['gym', 'stadium', 'sports_complex', 'fitness_center'],
    education: ['school', 'university', 'library', 'book_store']
  };

  for (const [category, googleTypes] of Object.entries(typeMapping)) {
    if (types.some(type => googleTypes.includes(type))) {
      return category;
    }
  }
  
  return 'other';
}; 