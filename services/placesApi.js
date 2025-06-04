import axios from 'axios';

const GOOGLE_PLACES_API_KEY = 'VOTRE_CLE_API'; // À remplacer par votre clé API Google Places

export const searchNearbyPlaces = async (latitude, longitude, radius = 1500) => {
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&key=${GOOGLE_PLACES_API_KEY}`
    );

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
      // Par défaut, on marque comme partiellement accessible
      // Ces données devront être enrichies par la communauté
      accessibility: {
        ramp: true,
        elevator: false,
        parking: true,
        toilets: false,
      }
    }));
  } catch (error) {
    console.error('Erreur lors de la recherche des lieux:', error);
    return [];
  }
};

const getPlaceType = (types) => {
  const typeMapping = {
    restaurant: ['restaurant', 'cafe', 'bar', 'food'],
    culture: ['museum', 'art_gallery', 'library', 'tourist_attraction'],
    shopping: ['shopping_mall', 'store', 'supermarket'],
    health: ['hospital', 'doctor', 'pharmacy'],
    sport: ['gym', 'stadium', 'sports_complex'],
    education: ['school', 'university', 'library']
  };

  for (const [category, googleTypes] of Object.entries(typeMapping)) {
    if (types.some(type => googleTypes.includes(type))) {
      return category;
    }
  }
  
  return 'other';
}; 