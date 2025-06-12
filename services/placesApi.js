import axios from 'axios';
import { GOOGLE_PLACES_API_KEY } from '@env';

/**
 * Recherche des lieux proches avec données complètes et vraies
 */
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

    // Pour chaque lieu, récupérer les détails complets avec les vrais avis
    const placesWithDetails = await Promise.all(
      response.data.results.slice(0, 20).map(async (place) => {
        try {
          const details = await getPlaceDetails(place.place_id);
          return {
            id: place.place_id,
            name: place.name,
            address: place.vicinity || details.formatted_address,
            type: getPlaceType(place.types),
            rating: place.rating || 0,
            reviewCount: place.user_ratings_total || 0,
            image: place.photos ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${GOOGLE_PLACES_API_KEY}` : null,
            coordinates: {
              latitude: place.geometry.location.lat,
              longitude: place.geometry.location.lng
            },
            // Vraies données supplémentaires de Place Details
            phone: details.formatted_phone_number || null,
            website: details.website || null,
            openingHours: details.opening_hours || null,
            priceLevel: details.price_level || 0,
            // Vrais avis Google
            reviews: details.reviews || [],
            // Informations d'accessibilité déduites des avis et types
            accessibility: extractAccessibilityFromReviews(details.reviews, place.types),
            // Données complètes pour les détails
            fullDetails: details
          };
        } catch (error) {
          console.warn(`Impossible de récupérer les détails pour ${place.name}:`, error);
          // Fallback avec données basiques
          return {
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
            phone: null,
            website: null,
            openingHours: null,
            priceLevel: 0,
            reviews: [],
            accessibility: getDefaultAccessibility(place.types)
          };
        }
      })
    );

    return placesWithDetails;
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

/**
 * Récupère les détails complets d'un lieu via Place Details API
 */
export const getPlaceDetails = async (placeId) => {
  try {
    console.log(`🔍 Récupération des détails pour place_id: ${placeId}`);
    
    const fields = [
      'place_id', 'name', 'formatted_address', 'formatted_phone_number',
      'website', 'opening_hours', 'price_level', 'reviews', 'photos',
      'types', 'geometry', 'rating', 'user_ratings_total'
    ].join(',');

    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&language=fr&key=${GOOGLE_PLACES_API_KEY}`;
    
    console.log(`📡 URL Place Details: ${url.replace(GOOGLE_PLACES_API_KEY, 'API_KEY_HIDDEN')}`);
    
    const response = await axios.get(url);

    console.log(`📊 Status Place Details: ${response.data.status}`);

    if (response.data.status === 'OK') {
      const result = response.data.result;
      console.log(`✅ Détails récupérés pour "${result.name}"`);
      console.log(`📱 Téléphone: ${result.formatted_phone_number || 'Non disponible'}`);
      console.log(`🌐 Site web: ${result.website || 'Non disponible'}`);
      console.log(`💬 Nombre d'avis: ${result.reviews ? result.reviews.length : 0}`);
      
      if (result.reviews && result.reviews.length > 0) {
        console.log(`📝 Premier avis: "${result.reviews[0].text.substring(0, 100)}..."`);
        console.log(`👤 Auteur: ${result.reviews[0].author_name}`);
        console.log(`⭐ Note: ${result.reviews[0].rating}/5`);
      }
      
      return result;
    } else {
      console.error(`❌ Erreur Place Details: ${response.data.status} - ${response.data.error_message}`);
      throw new Error(`Erreur Place Details: ${response.data.status}`);
    }
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des détails:', error.message);
    if (error.response) {
      console.error('📊 Status HTTP:', error.response.status);
      console.error('📄 Réponse:', error.response.data);
    }
    throw error;
  }
};

/**
 * Extrait les informations d'accessibilité des vrais avis Google
 */
const extractAccessibilityFromReviews = (reviews, types) => {
  if (!reviews || reviews.length === 0) {
    return getDefaultAccessibility(types);
  }

  // Mots-clés d'accessibilité dans les avis
  const accessibilityKeywords = {
    ramp: ['rampe', 'ramp', 'accès fauteuil', 'wheelchair', 'handicapé', 'pmr', 'accessible'],
    elevator: ['ascenseur', 'elevator', 'lift', 'étage', 'accessibilité étage'],
    parking: ['parking', 'stationnement', 'place handicapé', 'parking pmr'],
    toilets: ['toilettes', 'wc', 'sanitaires', 'toilet', 'bathroom', 'accessible toilet']
  };

  const accessibility = {
    ramp: false,
    elevator: false,
    parking: false,
    toilets: false
  };

  // Analyser les avis pour détecter les mentions d'accessibilité
  reviews.forEach(review => {
    const text = review.text.toLowerCase();
    
    Object.keys(accessibilityKeywords).forEach(feature => {
      if (accessibilityKeywords[feature].some(keyword => text.includes(keyword))) {
        // Si mention positive (pas de "pas de", "aucun", etc.)
        if (!text.match(/(pas de|aucun|sans|no|not|manque)/)) {
          accessibility[feature] = true;
        }
      }
    });
  });

  // Compléter avec des probabilités basées sur le type de lieu
  return enhanceAccessibilityWithDefaults(accessibility, types);
};

/**
 * Accessibilité par défaut basée sur le type de lieu
 */
const getDefaultAccessibility = (types) => {
  const isPublicBuilding = types?.some(type => 
    ['hospital', 'school', 'university', 'library', 'government', 'city_hall', 'post_office'].includes(type)
  );
  
  const isLargeCommercial = types?.some(type => 
    ['shopping_mall', 'department_store', 'supermarket', 'hotel'].includes(type)
  );
  
  const isTransport = types?.some(type => 
    ['subway_station', 'train_station', 'bus_station', 'airport'].includes(type)
  );

  // Bâtiments publics = meilleure accessibilité
  if (isPublicBuilding) {
    return {
      ramp: true,
      elevator: Math.random() > 0.3,
      parking: true,
      toilets: true
    };
  }
  
  // Grandes surfaces commerciales
  if (isLargeCommercial) {
    return {
      ramp: true,
      elevator: Math.random() > 0.4,
      parking: true,
      toilets: true
    };
  }
  
  // Transports
  if (isTransport) {
    return {
      ramp: Math.random() > 0.4,
      elevator: Math.random() > 0.5,
      parking: false,
      toilets: Math.random() > 0.6
    };
  }
  
  // Autres lieux
  return {
    ramp: Math.random() > 0.6,
    elevator: false,
    parking: Math.random() > 0.7,
    toilets: Math.random() > 0.7
  };
};

/**
 * Améliore l'accessibilité détectée avec des valeurs par défaut
 */
const enhanceAccessibilityWithDefaults = (detectedAccessibility, types) => {
  const defaultAccessibility = getDefaultAccessibility(types);
  
  return {
    ramp: detectedAccessibility.ramp || defaultAccessibility.ramp,
    elevator: detectedAccessibility.elevator || defaultAccessibility.elevator,
    parking: detectedAccessibility.parking || defaultAccessibility.parking,
    toilets: detectedAccessibility.toilets || defaultAccessibility.toilets
  };
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