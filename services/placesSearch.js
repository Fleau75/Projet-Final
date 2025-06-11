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

/**
 * Recherche des lieux par texte dans une zone géographique spécifique
 * @param {string} query - Le texte de recherche
 * @param {Object} location - Coordonnées du centre de recherche
 * @param {number} maxResults - Nombre maximum de résultats (défaut: 100)
 * @returns {Promise<Array>} - Liste des lieux trouvés avec informations complètes
 */
export const searchPlacesByText = async (query, location = null, maxResults = 100) => {
  try {
    // Construction de l'URL de base
    let url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}`;
    
    // Si une localisation est fournie, ajouter les paramètres de géolocalisation
    if (location) {
      url += `&location=${location.latitude},${location.longitude}`;
      if (location.radius) {
        url += `&radius=${location.radius}`;
      }
    } else {
      // Par défaut, rechercher dans Paris
      url += `&location=48.8566,2.3522&radius=20000`;
    }

    // Ajouter la région et la langue
    url += `&region=FR&language=fr&key=${GOOGLE_PLACES_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK') {
      // Limiter les résultats au nombre demandé
      const limitedResults = data.results.slice(0, maxResults);
      
      return limitedResults.map(place => ({
        id: place.place_id,
        name: place.name,
        address: place.formatted_address || place.vicinity || 'Paris, France',
        type: getPlaceType(place.types || []),
        rating: place.rating || 3.5, // Valeur par défaut si pas de note
        reviewCount: place.user_ratings_total || 0,
        image: place.photos && place.photos.length > 0 
          ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${GOOGLE_PLACES_API_KEY}`
          : null,
        coordinates: {
          latitude: place.geometry.location.lat,
          longitude: place.geometry.location.lng
        },
        // Génération d'informations d'accessibilité basées sur le type de lieu
        accessibility: generateAccessibilityInfo(place.types || []),
        // Informations supplémentaires
        priceLevel: place.price_level || 0,
        isOpenNow: place.opening_hours ? place.opening_hours.open_now : null,
      }));
    } else {
      console.error('Erreur Google Places:', data.status, data.error_message);
      return [];
    }
  } catch (error) {
    console.error('Erreur lors de la recherche par texte:', error);
    return [];
  }
};

/**
 * Détermine le type de lieu basé sur les types Google Places
 * @param {Array} types - Types Google Places
 * @returns {string} - Type de lieu standardisé
 */
const getPlaceType = (types) => {
  const typeMapping = {
    restaurant: ['restaurant', 'cafe', 'bar', 'food', 'bakery', 'meal_takeaway', 'meal_delivery'],
    culture: ['museum', 'art_gallery', 'library', 'tourist_attraction', 'park', 'church', 'place_of_worship', 'zoo', 'amusement_park'],
    shopping: ['shopping_mall', 'store', 'supermarket', 'clothing_store', 'department_store', 'electronics_store', 'book_store'],
    health: ['hospital', 'doctor', 'pharmacy', 'physiotherapist', 'dentist', 'medical_clinic', 'health'],
    sport: ['gym', 'stadium', 'sports_complex', 'fitness_center', 'bowling_alley'],
    education: ['school', 'university', 'library', 'secondary_school', 'primary_school'],
    transport: ['subway_station', 'train_station', 'bus_station', 'airport'],
    hotel: ['lodging', 'hotel', 'hostel']
  };

  for (const [category, googleTypes] of Object.entries(typeMapping)) {
    if (types.some(type => googleTypes.includes(type))) {
      return category;
    }
  }
  
  return 'other';
};

/**
 * Génère des informations d'accessibilité basées sur le type de lieu
 * @param {Array} types - Types Google Places
 * @returns {Object} - Informations d'accessibilité
 */
const generateAccessibilityInfo = (types) => {
  // Probabilités d'accessibilité basées sur les types de lieux
  const isPublicBuilding = types.some(type => 
    ['hospital', 'school', 'university', 'library', 'government', 'city_hall', 'post_office'].includes(type)
  );
  
  const isLargeCommercial = types.some(type => 
    ['shopping_mall', 'department_store', 'supermarket', 'hotel'].includes(type)
  );
  
  const isTransport = types.some(type => 
    ['subway_station', 'train_station', 'bus_station', 'airport'].includes(type)
  );

  // Les bâtiments publics ont généralement une meilleure accessibilité
  if (isPublicBuilding) {
    return {
      ramp: Math.random() > 0.2, // 80% de chance
      elevator: Math.random() > 0.3, // 70% de chance
      parking: Math.random() > 0.4, // 60% de chance
      toilets: Math.random() > 0.2, // 80% de chance
    };
  }
  
  // Les grandes surfaces commerciales aussi
  if (isLargeCommercial) {
    return {
      ramp: Math.random() > 0.3, // 70% de chance
      elevator: Math.random() > 0.4, // 60% de chance
      parking: Math.random() > 0.3, // 70% de chance
      toilets: Math.random() > 0.4, // 60% de chance
    };
  }
  
  // Les transports en commun
  if (isTransport) {
    return {
      ramp: Math.random() > 0.4, // 60% de chance
      elevator: Math.random() > 0.5, // 50% de chance
      parking: false, // Rare dans les transports
      toilets: Math.random() > 0.6, // 40% de chance
    };
  }
  
  // Autres lieux - accessibilité variable
  return {
    ramp: Math.random() > 0.5, // 50% de chance
    elevator: Math.random() > 0.7, // 30% de chance
    parking: Math.random() > 0.6, // 40% de chance
    toilets: Math.random() > 0.6, // 40% de chance
  };
}; 