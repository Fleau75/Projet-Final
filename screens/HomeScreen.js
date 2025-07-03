/**
 * Écran d'accueil de l'application AccessPlus
 * Affiche la liste des lieux accessibles avec des options de filtrage et de tri
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, StyleSheet, ScrollView, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Chip, Text, SegmentedButtons, useTheme, Button } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import PlaceCard from '../components/PlaceCard';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PlacesApiService from '../services/placesApi';
import { useTextSize } from '../theme/TextSizeContext';
import PlacesService from '../services/firebaseService';
import SimplePlacesService from '../services/simplePlacesService';
import { AccessibilityService } from '../services/accessibilityService';
import StorageService from '../services/storageService';
import ConfigService from '../services/configService';
import fakePlaces from '../services/fakePlacesData';

/**
 * Liste des catégories de lieux disponibles dans l'application
 */
const categories = [
  { id: 'all', label: 'Tous' },
  { id: 'restaurant', label: 'Restaurants' },
  { id: 'culture', label: 'Culture' },
  { id: 'shopping', label: 'Shopping' },
  { id: 'health', label: 'Santé' },
  { id: 'sport', label: 'Sport' },
  { id: 'education', label: 'Éducation' },
  { id: 'hotel', label: 'Hôtels' },
  { id: 'nature', label: 'Parcs & Nature' },
];

/**
 * Données statiques de fallback enrichies (utilisées si Firebase ne fonctionne pas)
 * Plus de 50 lieux fictifs pour tester l'application sans API Google Places
 */
const staticPlaces = fakePlaces;

// Images par défaut cohérentes par type
const defaultImages = {
  restaurant: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop',
  culture: 'https://images.unsplash.com/photo-1566127992631-137a642a90f4?w=400&h=300&fit=crop',
  shopping: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop',
  health: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=400&h=300&fit=crop',
  sport: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
  education: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?w=400&h=300&fit=crop',
  hotel: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop',
  nature: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop',
  other: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&h=300&fit=crop',
};

/**
 * Calcule le niveau d'accessibilité d'un lieu
 * @param {Object} place - Le lieu à évaluer
 * @returns {string} - Le niveau d'accessibilité ('full', 'partial', 'none')
 */
const getAccessibilityLevel = (place) => {
  // Vérifier si place.accessibility existe
  if (!place.accessibility) {
    return 'none';
  }
  
  const features = [
    place.accessibility.ramp,
    place.accessibility.elevator,
    place.accessibility.parking,
    place.accessibility.toilets
  ];
  
  const accessibleCount = features.filter(Boolean).length;
  
  if (accessibleCount === 4) {
    return 'full';
  } else if (accessibleCount >= 2) {
    return 'partial';
  } else {
    return 'none';
  }
};

/**
 * Retourne le libellé correspondant au niveau d'accessibilité
 * @param {string} level - Le niveau d'accessibilité
 * @returns {string} - Le libellé avec l'icône correspondante
 */
const getAccessibilityLabel = (level) => {
  switch (level) {
    case 'full':
      return '♿ Totalement accessible';
    case 'partial':
      return '⚡ Partiellement accessible';
    default:
      return '⚠️ Non accessible';
  }
};

// Cache mémoire simple pour les recherches Google Places
const googlePlacesCache = {};

// Fonction utilitaire debounce
function debounceAsync(fn, delay) {
  let timeout;
  let lastPromise = null;
  return (...args) => {
    clearTimeout(timeout);
    return new Promise((resolve, reject) => {
      timeout = setTimeout(() => {
        lastPromise = fn(...args).then(resolve).catch(reject);
      }, delay);
    });
  };
}

/**
 * Composant principal de l'écran d'accueil
 */
export default function HomeScreen({ navigation }) {
  const theme = useTheme();
  const { textSizes } = useTextSize();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [accessibilityFilter, setAccessibilityFilter] = useState('all');
  const [sortValue, setSortValue] = useState('photo');
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [searchRadius, setSearchRadius] = useState(500);
  const [isCategoriesMenuOpen, setIsCategoriesMenuOpen] = useState(false);
  const [accessibilityPrefs, setAccessibilityPrefs] = useState({});
  
  // États pour la géolocalisation
  const [locationError, setLocationError] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  
  // État combiné pour le chargement des lieux
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(false);
  
  // État pour le bouton "Retour en haut"
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  
  // Référence pour le ScrollView
  const scrollViewRef = useRef(null);
  
  /**
   * Fonction pour charger le rayon de recherche
   */
  const loadSearchRadius = useCallback(async () => {
    try {
      const savedRadius = await StorageService.getSearchRadius();
      if (savedRadius !== null) {
        setSearchRadius(parseInt(savedRadius));
      } else {
        // Si aucune valeur sauvegardée, utiliser 500m par défaut
        setSearchRadius(500);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du rayon de recherche:', error);
      // En cas d'erreur, utiliser 500m par défaut
      setSearchRadius(500);
    }
  }, []);

  /**
   * Fonction pour charger les préférences d'accessibilité depuis les réglages
   */
  const loadAccessibilityPrefs = useCallback(async () => {
    try {
      const prefs = await AccessibilityService.loadAccessibilityPreferences();
      console.log('🔧 Préférences d\'accessibilité chargées:', prefs);
      setAccessibilityPrefs(prefs);
    } catch (error) {
      console.error('Erreur lors du chargement des préférences d\'accessibilité:', error);
    }
  }, []);

  /**
   * Effet pour recharger le rayon de recherche et les préférences d'accessibilité quand l'écran devient focus
   */
  useFocusEffect(
    useCallback(() => {
      loadSearchRadius();
      loadAccessibilityPrefs();
    }, [loadSearchRadius, loadAccessibilityPrefs])
  );

  /**
   * Mapper les types Google Places vers les catégories de l'app
   */
  const mapGooglePlaceTypeToCategory = (googleTypes) => {
    if (!googleTypes || !Array.isArray(googleTypes)) {
      return 'shopping'; // Fallback vers shopping au lieu de restaurant
    }

    // Mapping des types Google Places vers nos catégories
    const typeMapping = {
      // Restaurants - Plus spécifique
      'restaurant': 'restaurant',
      'food': 'restaurant',
      'cafe': 'restaurant',
      'bar': 'restaurant',
      'bakery': 'restaurant',
      'meal_takeaway': 'restaurant',
      'meal_delivery': 'restaurant',
      'pizza': 'restaurant',
      'fast_food': 'restaurant',
      'ice_cream_shop': 'restaurant',
      'coffee_shop': 'restaurant',
      'night_club': 'restaurant',
      'liquor_store': 'restaurant',
      
      // Hôtels - Priorité haute pour éviter la confusion
      'lodging': 'hotel',
      'hotel': 'hotel',
      'motel': 'hotel',
      'resort': 'hotel',
      'guest_house': 'hotel',
      'bed_and_breakfast': 'hotel',
      'inn': 'hotel',
      'hostel': 'hotel',
      
      // Culture
      'museum': 'culture',
      'art_gallery': 'culture',
      'library': 'culture',
      'theater': 'culture',
      'movie_theater': 'culture',
      'amusement_park': 'culture',
      'tourist_attraction': 'culture',
      'church': 'culture',
      'synagogue': 'culture',
      'mosque': 'culture',
      'hindu_temple': 'culture',
      'establishment': 'culture', // Souvent utilisé pour les lieux culturels
      
      // Shopping
      'store': 'shopping',
      'shopping_mall': 'shopping',
      'department_store': 'shopping',
      'clothing_store': 'shopping',
      'jewelry_store': 'shopping',
      'shoe_store': 'shopping',
      'book_store': 'shopping',
      'electronics_store': 'shopping',
      'convenience_store': 'shopping',
      'supermarket': 'shopping',
      'grocery_or_supermarket': 'shopping',
      
      // Santé
      'hospital': 'health',
      'doctor': 'health',
      'dentist': 'health',
      'pharmacy': 'health',
      'physiotherapist': 'health',
      'veterinary_care': 'health',
      'health': 'health',
      
      // Sport
      'gym': 'sport',
      'fitness_center': 'sport',
      'sports_complex': 'sport',
      'stadium': 'sport',
      'swimming_pool': 'sport',
      'tennis_court': 'sport',
      'basketball_court': 'sport',
      'soccer_field': 'sport',
      'baseball_field': 'sport',
      'volleyball_court': 'sport',
      'bowling_alley': 'sport',
      'golf_course': 'sport',
      'ski_resort': 'sport',
      'ice_rink': 'sport',
      'rock_climbing': 'sport',
      'yoga_studio': 'sport',
      'pilates_studio': 'sport',
      'boxing_gym': 'sport',
      'martial_arts': 'sport',
      'dance_studio': 'sport',
      
      // Éducation
      'school': 'education',
      'university': 'education',
      'training': 'education',
      
      // Parcs & Nature
      'park': 'nature',
      'zoo': 'nature',
      'aquarium': 'nature',
      'campground': 'nature',
      'rv_park': 'nature',
      'natural_feature': 'nature',
    };

    // Chercher le premier type qui correspond
    // PRIORITÉ ABSOLUE aux hôtels - vérifier d'abord si lodging est présent
    if (googleTypes.includes('lodging') || googleTypes.includes('hotel') || googleTypes.includes('motel') || 
        googleTypes.includes('resort') || googleTypes.includes('guest_house') || googleTypes.includes('bed_and_breakfast') ||
        googleTypes.includes('inn') || googleTypes.includes('hostel')) {
      return 'hotel';
    }
    
    // Puis chercher les autres types dans l'ordre
    for (const googleType of googleTypes) {
      if (typeMapping[googleType]) {
        return typeMapping[googleType];
      }
    }

    // Si aucun type ne correspond, essayer de deviner par le nom
    const name = googleTypes.join(' ').toLowerCase();
    
    // PRIORITÉ ABSOLUE aux hôtels - même dans le fallback
    if (name.includes('hotel') || name.includes('hôtel') || name.includes('lodging') || 
        name.includes('motel') || name.includes('resort') || name.includes('inn') || 
        name.includes('hostel') || name.includes('guesthouse') || name.includes('b&b') ||
        name.includes('bed and breakfast') || name.includes('pension') || name.includes('auberge')) {
      return 'hotel';
    }
    
    // Puis les restaurants
    if (name.includes('restaurant') || name.includes('café') || name.includes('cafe') || 
        name.includes('bar') || name.includes('pizzeria') || name.includes('boulangerie') ||
        name.includes('brasserie') || name.includes('bistrot') || name.includes('brasserie')) {
      return 'restaurant';
    }

    return 'shopping'; // Fallback vers shopping au lieu de restaurant
  };

  /**
   * Transformer les données brutes Google Places au format de l'app
   */
  const transformGooglePlacesData = (rawPlaces) => {
    return rawPlaces.map(place => {
      // Déterminer la catégorie basée sur les types Google Places
      const category = mapGooglePlaceTypeToCategory(place.types);
      
      // Log de débogage pour voir la catégorisation
      if (category === 'restaurant' || category === 'hotel') {
        console.log(`🏷️ Catégorisation: "${place.name}" (types: ${place.types?.join(', ')}) → ${category}`);
      }
      
      return {
        id: place.place_id,
        name: place.name,
        type: category,
        address: place.vicinity || place.formatted_address || 'Paris, France',
        coordinates: {
          latitude: place.geometry?.location?.lat,
          longitude: place.geometry?.location?.lng
        },
        rating: place.rating || 4.0,
        reviewCount: place.user_ratings_total || 0,
        phone: place.formatted_phone_number || null,
        website: place.website || null,
        priceLevel: place.price_level,
        openingHours: place.opening_hours,
        image: place.photos && place.photos.length > 0 
          ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${place.photos[0].photo_reference}&key=${ConfigService.getGooglePlacesApiKey()}`
          : null,
        photos: place.photos || [],
        accessibility: {
          ramp: true, // Valeurs par défaut
          elevator: false,
          parking: false,
          toilets: true,
        },
        source: 'google_places'
      };
    });
  };

  /**
   * Fonction pour charger les lieux Google Places avec données réelles (corrigée)
   */
  const loadGooglePlacesWithRealData = useCallback(
    debounceAsync(async (location, radius) => {
      try {
        // Clé de cache basée sur la position et le rayon
        const cacheKey = location
          ? `${location.latitude || location.lat},${location.longitude || location.lng},${radius}`
          : `default,${radius}`;
        if (googlePlacesCache[cacheKey]) {
          console.log('🟡 Résultat Google Places depuis le cache');
          return googlePlacesCache[cacheKey];
        }

        // Limiter à 3 types pour éviter la surconsommation
        const searchTypes = [
          'restaurant',
          'store',
          'museum',
        ];
        let allPlaces = [];
        for (const type of searchTypes) {
          try {
            console.log(`🔍 Recherche de lieux de type: ${type}`);
            const placesOfType = await PlacesApiService.searchNearbyPlaces(
              location
                ? { lat: location.latitude || location.lat, lng: location.longitude || location.lng }
                : { lat: 48.8566, lng: 2.3522 },
              radius,
              type
            );
            allPlaces = allPlaces.concat(placesOfType);
          } catch (error) {
            console.warn(`⚠️ Erreur pour le type ${type}:`, error.message);
          }
        }
        // Déduplication
        const uniquePlaces = [];
        const seenIds = new Set();
        allPlaces.forEach(place => {
          if (!seenIds.has(place.place_id)) {
            seenIds.add(place.place_id);
            uniquePlaces.push(place);
          }
        });
        // Limiter le nombre de détails à 5
        const placesWithDetails = [];
        const maxDetailsToFetch = 5;
        for (let i = 0; i < Math.min(uniquePlaces.length, maxDetailsToFetch); i++) {
          try {
            const place = uniquePlaces[i];
            const details = await PlacesApiService.getPlaceDetails(place.place_id);
            placesWithDetails.push({ ...place, ...details });
          } catch (error) {
            placesWithDetails.push(uniquePlaces[i]);
          }
        }
        // Ajouter les lieux restants sans détails
        for (let i = maxDetailsToFetch; i < uniquePlaces.length; i++) {
          placesWithDetails.push(uniquePlaces[i]);
        }
        const result = transformGooglePlacesData(placesWithDetails);
        googlePlacesCache[cacheKey] = result;
        return result;
      } catch (error) {
        console.warn('⚠️ Google Places erreur:', error.message);
        return [];
      }
    }, 700), // 700ms debounce
    []
  );

  /**
   * Fonction pour recharger les lieux de manière robuste
   */
  const reloadPlaces = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Rechargement des lieux au retour sur l\'écran...');
      
      // Récupérer les valeurs actuelles
      const currentLocation = userLocation;
      const currentRadius = searchRadius || 1000; // Fallback si pas encore chargé
      
      // Charger depuis les différentes sources en parallèle
      const [firestorePlaces, parisPlaces] = await Promise.all([
        PlacesService.getAllPlaces().catch(() => []),
        loadGooglePlacesWithRealData(currentLocation, currentRadius).catch((error) => {
          console.warn('⚠️ Google Places erreur:', error.message);
          return [];
        })
      ]);
      
      // Combiner toutes les sources en évitant les doublons
      const allPlaces = [...firestorePlaces];
      const existingNames = new Set(firestorePlaces.map(p => p.name.toLowerCase()));
      
      // Ajouter les lieux Google Places qui ne sont pas déjà dans Firebase
      parisPlaces.forEach(place => {
        if (!existingNames.has(place.name.toLowerCase())) {
          allPlaces.push(place);
          existingNames.add(place.name.toLowerCase());
        }
      });
      
      // Ajouter les lieux statiques en complément des données Firebase/Google
      console.log('📦 Ajout des données statiques en complément');
        staticPlaces.forEach(staticPlace => {
        if (!existingNames.has(staticPlace.name.toLowerCase())) {
          allPlaces.push(staticPlace);
          existingNames.add(staticPlace.name.toLowerCase());
      }
      });
      
      console.log(`✅ ${allPlaces.length} lieux rechargés (Firebase: ${firestorePlaces.length}, Google: ${parisPlaces.length}, Statiques: ${staticPlaces.length})`);
      setPlaces(allPlaces);
      
    } catch (err) {
      console.error('❌ Erreur lors du rechargement:', err.message);
      setError('Erreur de rechargement - utilisation des données locales');
      setPlaces(staticPlaces);
    } finally {
      setLoading(false);
    }
  }, [userLocation, searchRadius]);

  /**
   * Fonction pour charger TOUS les lieux de Paris depuis Google Places API + Firebase
   */
  const loadPlacesFromFirestore = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🚀 Chargement de tous les lieux de Paris...');
      
      // Charger depuis les différentes sources en parallèle
      const [firestorePlaces, parisPlaces] = await Promise.all([
        PlacesService.getAllPlaces().catch(() => []),
        loadGooglePlacesWithRealData(userLocation, searchRadius).catch((error) => {
          console.warn('⚠️ Google Places erreur:', error.message);
          return [];
        })
      ]);
      
      // Combiner toutes les sources en évitant les doublons
      const allPlaces = [...firestorePlaces];
      const existingNames = new Set(firestorePlaces.map(p => p.name.toLowerCase()));
      
      // Ajouter les lieux Google Places qui ne sont pas déjà dans Firebase
      parisPlaces.forEach(place => {
        if (!existingNames.has(place.name.toLowerCase())) {
          allPlaces.push(place);
          existingNames.add(place.name.toLowerCase());
        }
      });
      
      // Ajouter les lieux statiques en complément des données Firebase/Google
      console.log('📦 Ajout des données statiques en complément');
        staticPlaces.forEach(staticPlace => {
        if (!existingNames.has(staticPlace.name.toLowerCase())) {
          allPlaces.push(staticPlace);
          existingNames.add(staticPlace.name.toLowerCase());
      }
      });
      
      console.log(`✅ ${allPlaces.length} lieux total chargés (Firebase: ${firestorePlaces.length}, Google: ${parisPlaces.length}, Statiques: ${staticPlaces.length})`);
      setPlaces(allPlaces);
      
    } catch (err) {
      console.error('❌ Erreur lors du chargement:', err.message);
      setError('Erreur de chargement - utilisation des données locales');
      setPlaces(staticPlaces);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, userLocation, searchRadius]);

  /**
   * Effet pour charger les lieux au montage du composant
   */
  useEffect(() => {
    loadPlacesFromFirestore();
  }, [loadPlacesFromFirestore]);

  /**
   * Effet pour gérer la géolocalisation au chargement
   */
  useEffect(() => {
    (async () => {
      setIsLoadingLocation(true);
      try {
        // Charger le rayon de recherche depuis AsyncStorage
        await loadSearchRadius();

        // Vérifie si la localisation est activée
        const providerStatus = await Location.hasServicesEnabledAsync();
        if (!providerStatus) {
          setLocationError('La localisation est désactivée sur votre appareil');
          setIsLoadingLocation(false);
          return;
        }

        // Demande la permission de localisation
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setLocationError('Permission de localisation refusée');
          setIsLoadingLocation(false);
          return;
        }

        // Obtient la position actuelle
        let location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setUserLocation(location.coords);
        
        // Debug: Afficher votre position et calculer les distances aux lieux du 11ème
        console.log(`📍 VOTRE POSITION: ${location.coords.latitude.toFixed(6)}, ${location.coords.longitude.toFixed(6)}`);
        
        // Fonction locale pour calculer les distances
        const calcDistance = (coords1, coords2) => {
          const lat1 = coords1.latitude * Math.PI / 180;
          const lon1 = coords1.longitude * Math.PI / 180;
          const lat2 = coords2.latitude * Math.PI / 180;
          const lon2 = coords2.longitude * Math.PI / 180;
          const R = 6371;
          const dLat = lat2 - lat1;
          const dLon = lon2 - lon1;
          const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                    Math.cos(lat1) * Math.cos(lat2) *
                    Math.sin(dLon/2) * Math.sin(dLon/2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          return R * c;
        };
        
        // Calculer distances aux lieux du 11ème pour debug
        const lieu11eme = {
          nom: 'Place de la République (11ème)',
          coords: { latitude: 48.8676, longitude: 2.3631 }
        };
        const lieuOberkampf = {
          nom: 'Rue Oberkampf (11ème)',
          coords: { latitude: 48.8665, longitude: 2.3731 }
        };
        
        const distanceRepublique = calcDistance(location.coords, lieu11eme.coords);
        const distanceOberkampf = calcDistance(location.coords, lieuOberkampf.coords);
        
        console.log(`🏠 Distance à ${lieu11eme.nom}: ${(distanceRepublique * 1000).toFixed(0)}m`);
        console.log(`🏠 Distance à ${lieuOberkampf.nom}: ${(distanceOberkampf * 1000).toFixed(0)}m`);
        
        // Google Places intégré avec le service principal
        console.log('📍 Localisation obtenue, les lieux Google Places seront chargés via loadPlacesFromFirestore');
      } catch (error) {
        console.error('Erreur:', error);
        setLocationError('Impossible d\'obtenir votre position');
      } finally {
        setIsLoadingLocation(false);
        setIsLoadingPlaces(false);
      }
    })();
  }, [loadSearchRadius]);

  const calculateDistance = (coords1, coords2) => {
    if (!coords1 || !coords2) {
      return Infinity;
    }
    
    // Conversion en radians
    const lat1 = coords1.latitude * Math.PI / 180;
    const lon1 = coords1.longitude * Math.PI / 180;
    const lat2 = coords2.latitude * Math.PI / 180;
    const lon2 = coords2.longitude * Math.PI / 180;

    // Formule de Haversine
    const R = 6371; // Rayon de la Terre en km
    const dLat = lat2 - lat1;
    const dLon = lon2 - lon1;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;

    return distance;
  };

  /**
   * Vérifie si un lieu respecte les préférences d'accessibilité de l'utilisateur
   */
  const meetsAccessibilityPreferences = useCallback((place) => {
    return AccessibilityService.meetsAccessibilityPreferences(place, accessibilityPrefs);
  }, [accessibilityPrefs]);

  const sortedAndFilteredPlaces = places
    .filter(place => {
      // Exclure les lieux sans coordonnées valides
      if (!place.coordinates || typeof place.coordinates.latitude !== 'number' || typeof place.coordinates.longitude !== 'number') {
        return false;
      }
      // Filtrer les lieux fallback incomplets (nom 'Paris' sans adresse ou coordonnées)
      if ((place.name === 'Paris' || place.name === 'paris') && (!place.address || place.address === '' || !place.coordinates)) {
        return false;
      }
      const matchesCategory = selectedCategory === 'all' || place.type === selectedCategory;
      const accessLevel = getAccessibilityLevel(place);
      const isAccessible = accessibilityFilter === 'all' || 
                          accessibilityFilter === accessLevel ||
                          (accessibilityFilter === 'partial' && (accessLevel === 'full' || accessLevel === 'partial'));
      const meetsPreferences = meetsAccessibilityPreferences(place);
      // Filtrage par distance
      let withinRadius = true;
      if (userLocation && place.coordinates && searchRadius) {
        const distance = calculateDistance(userLocation, place.coordinates);
        const radiusInKm = searchRadius / 1000;
        withinRadius = distance <= radiusInKm;
      }
      
      return matchesCategory && isAccessible && meetsPreferences && withinRadius;
    })
    .map(place => {
      // Calculer la distance, mais la mettre à null si elle est infinie
      let distance = userLocation ? calculateDistance(userLocation, place.coordinates) : null;
      if (!isFinite(distance)) distance = null;
      return {
      ...place,
        distance,
      accessibilityLevel: getAccessibilityLevel(place),
      accessibilityLabel: getAccessibilityLabel(getAccessibilityLevel(place))
      };
    })
    .filter(place => {
      // Si le filtre "photo" est activé, ne montrer que les lieux avec des images
      if (sortValue === 'photo') {
        const hasImage = place.image || (place.photos && place.photos.length > 0);
        return hasImage;
      }
      return true; // Sinon, montrer tous les lieux filtrés
    })
    .sort((a, b) => {
      if (sortValue === 'photo') {
        // Trier par présence d'image (avec image = plus haut)
        const aHasImage = a.image ? 1 : 0;
        const bHasImage = b.image ? 1 : 0;
        if (aHasImage !== bHasImage) {
          return bHasImage - aHasImage; // Ceux avec image en premier
        }
        // Si même statut d'image, trier par note
        return b.rating - a.rating;
      } else if (sortValue === 'reviews') {
        return b.reviewCount - a.reviewCount;
      }
    });

  // Logs essentiels pour le diagnostic
  console.log(`[INFO] Lieux chargés: ${places.length}, affichés: ${sortedAndFilteredPlaces.length}, rayon: ${searchRadius}m`);

  const nearbyPlaces = [...places]
    .map(place => ({
      ...place,
      distance: calculateDistance(userLocation, place.coordinates),
      accessibilityLevel: getAccessibilityLevel(place),
      accessibilityLabel: getAccessibilityLabel(getAccessibilityLevel(place))
    }))
    .filter(place => getAccessibilityLevel(place) !== 'none')
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 5);

  const topRatedPlaces = [...places]
    .map(place => ({
      ...place,
      accessibilityLevel: getAccessibilityLevel(place),
      accessibilityLabel: getAccessibilityLabel(getAccessibilityLevel(place))
    }))
    .filter(place => getAccessibilityLevel(place) !== 'none')
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3);

  // Debug: Firebase fonctionne !
  // console.log(`🔍 Debug: ${places.length} lieux total`);

  // Fonction renderPlace supprimée - affichage simplifié

  const renderSectionHeader = (title) => (
    <Text style={[styles.sectionHeader, { fontSize: textSizes.subtitle }]}>
      {title}
    </Text>
  );

  /**
   * Fonction pour gérer le scroll et afficher/masquer le bouton "Retour en haut"
   */
  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    // Afficher le bouton après avoir scrollé de 300 pixels
    setShowScrollToTop(offsetY > 300);
  };

  /**
   * Fonction pour remonter en haut de la liste
   */
  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]} testID="home-screen">
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        {/* Rayon de recherche en haut */}
        {userLocation && (
          <View style={[styles.locationInfo, { backgroundColor: theme.colors.surfaceVariant }]}>
            <View style={styles.locationInfoContent}>
              <View style={[styles.locationIcon, { backgroundColor: theme.colors.primary }]}>
                <Text style={[styles.locationIconText, { color: theme.colors.onPrimary }]}>
                  📍
                </Text>
              </View>
              <View style={styles.locationTextContainer}>
                <Text style={[styles.locationLabel, { color: theme.colors.onSurfaceVariant, fontSize: textSizes.caption }]}>
                  Rayon de recherche
                </Text>
                <Text style={[styles.locationValue, { color: theme.colors.onSurface, fontSize: textSizes.body }]}>
                  {searchRadius >= 1000 ? (searchRadius/1000).toFixed(1) + ' km' : searchRadius + ' m'}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Indicateur des préférences d'accessibilité actives */}
        {AccessibilityService.hasActivePreferences(accessibilityPrefs) && (
          <View style={[styles.preferencesInfo, { backgroundColor: theme.colors.primaryContainer }]}>
            <Text style={[styles.preferencesText, { color: theme.colors.onPrimaryContainer, fontSize: textSizes.caption }]}>
              🔧 Filtres d'accessibilité actifs: {AccessibilityService.getActivePreferencesText(accessibilityPrefs)}
            </Text>
          </View>
        )}

        {/* Boutons de tri en haut */}
        <View style={styles.sortButtonsContainer}>
          <TouchableOpacity
            style={[
              styles.sortButton,
              {
                backgroundColor: sortValue === 'photo' ? '#2596BE' : 'transparent',
                borderColor: '#2596BE',
              }
            ]}
            onPress={() => setSortValue('photo')}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.sortButtonText,
              { 
                color: sortValue === 'photo' ? '#FFFFFF' : '#2596BE',
                fontWeight: sortValue === 'photo' ? '700' : '600'
              }
            ]}>
              Photo
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.sortButton,
              {
                backgroundColor: sortValue === 'reviews' ? '#2596BE' : 'transparent',
                borderColor: '#2596BE',
              }
            ]}
            onPress={() => setSortValue('reviews')}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.sortButtonText,
              { 
                color: sortValue === 'reviews' ? '#FFFFFF' : '#2596BE',
                fontWeight: sortValue === 'reviews' ? '700' : '600'
              }
            ]}>
              Avis
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {error && (
        <View style={[styles.errorContainer, { backgroundColor: theme.colors.errorContainer }]}> 
          <Text style={[styles.errorText, { color: theme.colors.error }]}>⚠️ {error}</Text>
        </View>
      )}

      {/* Affichage simple de TOUS les lieux */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} ref={scrollViewRef} onScroll={handleScroll}>
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <Text style={[styles.loadingText, { fontSize: textSizes.body }]}>Chargement...</Text>
          </View>
        )}
        
        {!loading && (
          <>
            <View style={styles.resultsHeader}>
              <Text style={[styles.sectionTitle, { fontSize: textSizes.title }]}>
                {selectedCategory === 'all' ? 'Tous les lieux' : categories.find(c => c.id === selectedCategory)?.label || 'Lieux'}
              </Text>
              <TouchableOpacity
                testID="list-button"
                style={[
                  styles.listButton,
                  {
                    backgroundColor: 'transparent',
                    borderWidth: 1.5,
                    borderColor: theme.colors.primary,
                  }
                ]}
                onPress={() => setIsCategoriesMenuOpen(!isCategoriesMenuOpen)}
              >
                <Text style={[styles.listButtonText, { color: theme.colors.primary }]}>
                  📋
                </Text>
              </TouchableOpacity>
            </View>
            
            {sortedAndFilteredPlaces.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={[styles.emptyStateText, { fontSize: textSizes.title }]}>😔 Aucun lieu trouvé</Text>
                <Text style={[styles.emptyStateSubtext, { fontSize: textSizes.body }]}>Essayez de modifier vos filtres</Text>
              </View>
            ) : (
              sortedAndFilteredPlaces.map((place, index) => (
                <PlaceCard
                  key={`${place.id}-${index}`}
                  testID={`place-card-${place.id}`}
                  place={place}
                  onPress={() => navigation.getParent()?.navigate('PlaceDetail', { place })}
                />
              ))
            )}
          </>
        )}
      </ScrollView>

      {/* Bouton "Retour en haut" */}
      {showScrollToTop && (
        <TouchableOpacity
          style={[styles.scrollToTopButton, { backgroundColor: theme.colors.primary }]}
          onPress={scrollToTop}
          activeOpacity={0.8}
        >
          <Text style={[styles.scrollToTopText, { color: theme.colors.onPrimary }]}>
            ↑
          </Text>
        </TouchableOpacity>
      )}

      {/* Menu des catégories (affiché conditionnellement) */}
      {isCategoriesMenuOpen && (
        <View style={[styles.categoriesMenu, { backgroundColor: theme.colors.surface }]}>
          {/* Bouton de fermeture */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setIsCategoriesMenuOpen(false)}
          >
            <Text style={[styles.closeButtonText, { color: theme.colors.onSurface, fontSize: textSizes.body }]}>
              ✕ Fermer
            </Text>
          </TouchableOpacity>
          
          {/* Catégories */}
          <View style={styles.menuSection}>
            <Text style={[styles.menuSectionTitle, { color: theme.colors.onSurface, fontSize: textSizes.label }]}>
              Catégories
            </Text>
            <View style={styles.categoriesGrid}>
              {categories.map(category => (
                <TouchableOpacity
                  key={category.id}
                  testID={`category-${category.id}`}
                  style={[
                    styles.categoryButton,
                    {
                      backgroundColor: selectedCategory === category.id ? theme.colors.primary : 'transparent',
                      borderColor: theme.colors.primary,
                    }
                  ]}
                  onPress={() => {
                    setSelectedCategory(category.id);
                  }}
                >
                  <Text style={[
                    styles.categoryButtonText,
                    {
                      color: selectedCategory === category.id ? '#FFFFFF' : theme.colors.primary,
                      fontWeight: selectedCategory === category.id ? '700' : '600',
                      fontSize: textSizes.caption
                    }
                  ]}>
                  {category.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Filtres d'accessibilité */}
          <View style={styles.menuSection}>
            <Text style={[styles.menuSectionTitle, { color: theme.colors.onSurface, fontSize: textSizes.label }]}>
              Accessibilité
            </Text>
            <View style={styles.accessibilityGrid}>
              <TouchableOpacity
                testID="accessibility-all"
                style={[
                  styles.accessibilityButton,
                  {
                    backgroundColor: accessibilityFilter === 'all' ? theme.colors.primary : 'transparent',
                    borderColor: theme.colors.primary,
                  }
                ]}
                onPress={() => {
                  setAccessibilityFilter('all');
                }}
              >
                <Text style={[
                  styles.accessibilityButtonText,
                  {
                    color: accessibilityFilter === 'all' ? '#FFFFFF' : theme.colors.primary,
                    fontWeight: accessibilityFilter === 'all' ? '700' : '600',
                    fontSize: textSizes.caption
                  }
                ]}>
                Tous
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                testID="accessibility-full"
                style={[
                  styles.accessibilityButton,
                  {
                    backgroundColor: accessibilityFilter === 'full' ? theme.colors.primary : 'transparent',
                    borderColor: theme.colors.primary,
                  }
                ]}
                onPress={() => {
                  setAccessibilityFilter('full');
                }}
              >
                <Text style={[
                  styles.accessibilityButtonText,
                  {
                    color: accessibilityFilter === 'full' ? '#FFFFFF' : theme.colors.primary,
                    fontWeight: accessibilityFilter === 'full' ? '700' : '600',
                    fontSize: textSizes.caption
                  }
                ]}>
                Totalement accessible
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                testID="accessibility-partial"
                style={[
                  styles.accessibilityButton,
                  {
                    backgroundColor: accessibilityFilter === 'partial' ? theme.colors.primary : 'transparent',
                    borderColor: theme.colors.primary,
                  }
                ]}
                onPress={() => {
                  setAccessibilityFilter('partial');
                }}
              >
                <Text style={[
                  styles.accessibilityButtonText,
                  {
                    color: accessibilityFilter === 'partial' ? '#FFFFFF' : theme.colors.primary,
                    fontWeight: accessibilityFilter === 'partial' ? '700' : '600',
                    fontSize: textSizes.caption
                  }
                ]}>
                Partiellement accessible
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
    marginBottom: 12,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  categoriesContainer: {
    marginBottom: 2,
  },
  accessibilityContainer: {
    marginBottom: 0,
  },
  categories: {
    paddingRight: 8,
    gap: 3,
  },
  categoryChip: {
    marginHorizontal: 2,
    marginVertical: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minHeight: 20,
  },
  sortButtonsContainer: {
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  sortButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: '#2596BE',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  sortButtonText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    marginTop: 0,
    paddingHorizontal: 10,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    flex: 1,
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'left',
    marginBottom: 0,
    paddingHorizontal: 0,
    paddingVertical: 0,
    marginLeft: 0,
  },
  list: {
    padding: 16,
  },
  resultsCount: {
    marginBottom: 16,
    opacity: 0.7,
  },
  errorContainer: {
    padding: 8,
    borderRadius: 8,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  errorText: {
    flex: 1,
    marginRight: 8,
  },
  loadingContainer: {
    padding: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  locationInfo: {
    padding: 8,
    marginBottom: 12,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  locationInfoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationIconText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  locationTextContainer: {
    marginLeft: 8,
    alignItems: 'center',
  },
  locationLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  locationValue: {
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
  },
  preferencesInfo: {
    padding: 6,
    marginBottom: 12,
    borderRadius: 8,
  },
  preferencesText: {
    fontSize: 12,
    fontWeight: '500',
  },
  loadingText: {
    marginTop: 8,
  },

  subtitle: {
    opacity: 0.8,
    fontWeight: '400',
    letterSpacing: 0.3,
  },
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  headerLeft: {
    width: 0,
  },
  listButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
  },
  sectionHeader: {
    fontWeight: 'bold',
    marginVertical: 12,
    paddingHorizontal: 16,
  },
  bottomCategories: {
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.08)',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  categoriesButton: {
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoriesButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  categoriesButtonIcon: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  categoriesMenu: {
    padding: 6,
    borderRadius: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    marginBottom: 6,
  },
  accessibilityButton: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderWidth: 1.5,
    borderColor: 'transparent',
    borderRadius: 5,
    minHeight: 20,
  },
  accessibilityButtonText: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  accessibilityMenu: {
    padding: 6,
    borderRadius: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    marginBottom: 8,
  },
  menuSection: {
    marginBottom: 8,
  },
  menuSectionTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
    paddingHorizontal: 3,
    fontSize: 11,
  },
  closeButton: {
    padding: 3,
    alignItems: 'center',
    marginBottom: 6,
  },
  closeButtonText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 3,
  },
  categoryButton: {
    padding: 6,
    borderWidth: 1.5,
    borderColor: 'transparent',
    borderRadius: 6,
  },
  categoryButtonText: {
    fontSize: 11,
    fontWeight: '600',
  },
  accessibilityGrid: {
    flexDirection: 'row',
    gap: 3,
  },
  scrollToTopButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  scrollToTopText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
