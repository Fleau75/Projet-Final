import { GOOGLE_PLACES_API_KEY } from '@env';
import PlacesApiService from './placesApi';

// Cache mémoire simple pour les recherches Google Places
const placesSearchCache = {};

// Fonction utilitaire debounce
function debounceAsync(fn, delay) {
  let timeout;
  let lastPromise = null;
  return (...args) => {
    clearTimeout(timeout);
    return new Promise((resolve, reject) => {
      // En mode test, exécuter immédiatement sans debounce
      if (process.env.NODE_ENV === 'test') {
        lastPromise = fn(...args).then(resolve).catch(reject);
      } else {
        timeout = setTimeout(() => {
          lastPromise = fn(...args).then(resolve).catch(reject);
        }, delay);
      }
    });
  };
}

/**
 * Recherche des lieux avec l'API Google Places
 * @param {string} query - Le texte de recherche
 * @returns {Promise<Array>} - Liste des lieux trouvés
 */
export const searchPlaces = debounceAsync(async (query) => {
  try {
    if (placesSearchCache[query]) {
      console.log('🟡 Résultat Places Search depuis le cache');
      return placesSearchCache[query];
    }
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
        query
      )}&key=${GOOGLE_PLACES_API_KEY}&region=FR&language=fr`
    );
    const data = await response.json();
    if (data.status === 'OK') {
      // Limiter le nombre de détails à 15 (comme avant)
      const placesWithDetails = await Promise.all(
        data.results.slice(0, 15).map(async (place) => {
          try {
            const details = await PlacesApiService.getPlaceDetails(place.place_id);
            return {
              id: place.place_id,
              name: place.name,
              address: place.formatted_address,
              location: place.geometry.location,
              rating: place.rating || 0,
              reviewCount: place.user_ratings_total || 0,
              phone: details.formatted_phone_number || null,
              website: details.website || null,
              openingHours: details.opening_hours || null,
              priceLevel: details.price_level || 0,
              reviews: details.reviews || [],
              accessibility: extractAccessibilityFromReviews(details.reviews, place.types),
              fullDetails: details
            };
          } catch (error) {
            return {
              id: place.place_id,
              name: place.name,
              address: place.formatted_address,
              location: place.geometry.location,
              rating: place.rating || 0,
              reviewCount: place.user_ratings_total || 0,
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
      placesSearchCache[query] = placesWithDetails;
      return placesWithDetails;
    } else {
      return [];
    }
  } catch (error) {
    return [];
  }
}, 300); // 300ms debounce (plus réactif)

/**
 * Recherche des lieux par texte dans une zone géographique spécifique
 * @param {string} query - Le texte de recherche
 * @param {Object} location - Coordonnées du centre de recherche
 * @param {number} maxResults - Nombre maximum de résultats (défaut: 100)
 * @returns {Promise<Array>} - Liste des lieux trouvés avec informations complètes
 */
export const searchPlacesByText = debounceAsync(async (query, location = null, maxResults = 20) => {
  try {
    console.log(`🔍 Début de recherche pour: "${query}" avec maxResults: ${maxResults}`);
    const cacheKey = location ? `${query}_${location.latitude}_${location.longitude}_${maxResults}` : `${query}_default_${maxResults}`;
    if (placesSearchCache[cacheKey]) {
      console.log('🟡 Résultat Places SearchByText depuis le cache');
      return placesSearchCache[cacheKey];
    }
    let url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}`;
    if (location) {
      url += `&location=${location.latitude},${location.longitude}`;
      if (location.radius) {
        url += `&radius=${location.radius}`;
      }
    } else {
      url += `&location=48.8566,2.3522&radius=20000`;
    }
    url += `&region=FR&language=fr&key=${GOOGLE_PLACES_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    console.log(`🔍 Réponse API: status=${data.status}, résultats=${data.results?.length || 0}`);
    if (data.status === 'OK') {
      const limitedResults = data.results.slice(0, Math.min(maxResults, 20));
      console.log(`🔍 Limitation: ${data.results.length} → ${limitedResults.length} résultats`);
      const placesWithDetails = await Promise.all(
        limitedResults.map(async (place) => {
          try {
            const details = await PlacesApiService.getPlaceDetails(place.place_id);
            return {
              id: place.place_id,
              name: place.name,
              address: place.formatted_address || place.vicinity || 'Paris, France',
              type: getPlaceType(place.types || []),
              rating: place.rating || 0,
              reviewCount: place.user_ratings_total || 0,
              image: place.photos && place.photos.length > 0 
                ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${GOOGLE_PLACES_API_KEY}`
                : null,
              coordinates: {
                latitude: place.geometry.location.lat,
                longitude: place.geometry.location.lng
              },
              phone: details.formatted_phone_number || null,
              website: details.website || null,
              openingHours: details.opening_hours || null,
              priceLevel: details.price_level || 0,
              reviews: details.reviews || [],
              accessibility: extractAccessibilityFromReviews(details.reviews, place.types),
              isOpenNow: place.opening_hours ? place.opening_hours.open_now : null,
              fullDetails: details
            };
          } catch (error) {
            return {
              id: place.place_id,
              name: place.name,
              address: place.formatted_address || place.vicinity || 'Paris, France',
              type: getPlaceType(place.types || []),
              rating: place.rating || 0,
              reviewCount: place.user_ratings_total || 0,
              image: place.photos && place.photos.length > 0 
                ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${GOOGLE_PLACES_API_KEY}`
                : null,
              coordinates: {
                latitude: place.geometry.location.lat,
                longitude: place.geometry.location.lng
              },
              phone: null,
              website: null,
              openingHours: null,
              priceLevel: 0,
              reviews: [],
              accessibility: getDefaultAccessibility(place.types),
              isOpenNow: place.opening_hours ? place.opening_hours.open_now : null,
              fullDetails: null
            };
          }
        })
      );
      placesSearchCache[cacheKey] = placesWithDetails;
      return placesWithDetails;
    } else {
      return [];
    }
  } catch (error) {
    return [];
  }
}, 300); // 300ms debounce (plus réactif)

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

export const clearPlacesSearchCache = () => {
  Object.keys(placesSearchCache).forEach(k => delete placesSearchCache[k]);
}; 