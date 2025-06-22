/**
 * Écran d'accueil de l'application AccessPlus
 * Affiche la liste des lieux accessibles avec des options de filtrage et de tri
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, FlatList, ActivityIndicator } from 'react-native';
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

/**
 * Liste des catégories de lieux disponibles dans l'application
 */
const categories = [
  { id: 'all', label: 'Tous' },
  { id: 'restaurant', label: '🍽️ Restaurants' },
  { id: 'culture', label: '🎭 Culture' },
  { id: 'shopping', label: '🛍️ Shopping' },
  { id: 'health', label: '🏥 Santé' },
  { id: 'sport', label: '🏃 Sport' },
  { id: 'education', label: '📚 Éducation' },
];

/**
 * Données statiques de fallback (utilisées si Firebase ne fonctionne pas)
 */
const staticPlaces = [
  // Lieux du 11ème arrondissement (vraie zone de l'utilisateur)
  {
    id: 'static-11-1',
    name: 'Place de la République',
    address: 'Place de la République, 75011 Paris',
    type: 'culture',
    rating: 4.3,
    reviewCount: 89,
    image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=400&h=300&fit=crop',
    coordinates: {
      latitude: 48.8676,
      longitude: 2.3631
    },
    accessibility: {
      ramp: true,
      elevator: false,
      parking: true,
      toilets: true,
    },
  },
  {
    id: 'static-11-2',
    name: 'Café Charbon',
    address: '109 Rue Oberkampf, 75011 Paris',
    type: 'restaurant',
    rating: 4.1,
    reviewCount: 156,
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&h=300&fit=crop',
    coordinates: {
      latitude: 48.8665,
      longitude: 2.3731
    },
    accessibility: {
      ramp: true,
      elevator: false,
      parking: false,
      toilets: true,
    },
  },
  {
    id: 'static-11-3',
    name: 'Monoprix Bastille',
    address: '51 Rue du Faubourg Saint-Antoine, 75011 Paris',
    type: 'shopping',
    rating: 4.0,
    reviewCount: 234,
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop',
    coordinates: {
      latitude: 48.8531,
      longitude: 2.3726
    },
    accessibility: {
      ramp: true,
      elevator: true,
      parking: false,
      toilets: true,
    },
  },
  {
    id: 'static-11-4',
    name: 'Hôpital Saint-Antoine',
    address: '184 Rue du Faubourg Saint-Antoine, 75012 Paris',
    type: 'health',
    rating: 3.8,
    reviewCount: 89,
    image: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=400&h=300&fit=crop',
    coordinates: {
      latitude: 48.8479,
      longitude: 2.3939
    },
    accessibility: {
      ramp: true,
      elevator: true,
      parking: true,
      toilets: true,
    },
  },
  // Anciens lieux (3ème/4ème) gardés pour la compatibilité
  {
    id: 'static-1',
    name: 'Restaurant Le Marais',
    address: '35 rue des Archives, 75003 Paris',
    type: 'restaurant',
    rating: 4.5,
    reviewCount: 42,
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop',
    coordinates: {
      latitude: 48.8627,
      longitude: 2.3578
    },
    accessibility: {
      ramp: true,
      elevator: true,
      parking: true,
      toilets: true,
    },
  },
  {
    id: 'static-2',
    name: 'Musée Carnavalet',
    address: '23 Rue de Sévigné, 75003 Paris',
    type: 'culture',
    rating: 4.8,
    reviewCount: 89,
    image: 'https://images.unsplash.com/photo-1566127992631-137a642a90f4?w=400&h=300&fit=crop',
    coordinates: {
      latitude: 48.8578,
      longitude: 2.3622
    },
    accessibility: {
      ramp: true,
      elevator: true,
      parking: true,
      toilets: true,
    },
  },
  {
    id: 'static-3',
    name: 'BHV Marais',
    address: '52 Rue de Rivoli, 75004 Paris',
    type: 'shopping',
    rating: 4.2,
    reviewCount: 156,
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop',
    coordinates: {
      latitude: 48.8571,
      longitude: 2.3519
    },
    accessibility: {
      ramp: true,
      elevator: true,
      parking: true,
      toilets: true,
    },
  },
  {
    id: 'static-4',
    name: 'Café Saint-Régis',
    address: '6 Rue Jean du Bellay, 75004 Paris',
    type: 'restaurant',
    rating: 4.9,
    reviewCount: 56,
    image: null,
    coordinates: {
      latitude: 48.8524,
      longitude: 2.3568
    },
    accessibility: {
      ramp: true,
      elevator: false,
      parking: true,
      toilets: true,
    },
  },
  {
    id: 'static-5',
    name: 'Bibliothèque de l\'Arsenal',
    address: '1 Rue de Sully, 75004 Paris',
    type: 'education',
    rating: 4.7,
    reviewCount: 34,
    image: null,
    coordinates: {
      latitude: 48.8509,
      longitude: 2.3645
    },
    accessibility: {
      ramp: true,
      elevator: true,
      parking: true,
      toilets: true,
    },
  },
  {
    id: 'static-6',
    name: 'Place des Vosges',
    address: 'Place des Vosges, 75004 Paris',
    type: 'culture',
    rating: 4.9,
    reviewCount: 245,
    image: null,
    coordinates: {
      latitude: 48.8561,
      longitude: 2.3655
    },
    accessibility: {
      ramp: true,
      elevator: false,
      parking: true,
      toilets: true,
    },
  },
];

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

/**
 * Composant principal de l'écran d'accueil
 */
export default function HomeScreen({ navigation }) {
  // États pour gérer les filtres et la recherche
  const theme = useTheme();
  const { textSizes } = useTextSize();

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortValue, setSortValue] = useState('photo');
  const [accessibilityFilter, setAccessibilityFilter] = useState('all');
  
  // États pour les données depuis Firestore
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // États pour la géolocalisation
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  
  // État combiné pour le chargement des lieux
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(false);
  
  // État pour le rayon de recherche
  const [searchRadius, setSearchRadius] = useState(1000); // valeur par défaut 1000m
  
  // État pour les préférences d'accessibilité depuis les réglages
  const [accessibilityPrefs, setAccessibilityPrefs] = useState({
    requireRamp: false,
    requireElevator: false,
    requireAccessibleParking: false,
    requireAccessibleToilets: false,
  });

  /**
   * Fonction pour charger le rayon de recherche
   */
  const loadSearchRadius = useCallback(async () => {
    try {
      const savedRadius = await AsyncStorage.getItem('searchRadius');
      if (savedRadius !== null) {
        setSearchRadius(parseInt(savedRadius));
      }
    } catch (error) {
      console.error('Erreur lors du chargement du rayon de recherche:', error);
    }
  }, []);

  /**
   * Fonction pour charger les préférences d'accessibilité depuis les réglages
   */
  const loadAccessibilityPrefs = useCallback(async () => {
    try {
      const prefs = await AccessibilityService.loadAccessibilityPreferences();
      setAccessibilityPrefs(prefs);
      console.log('🔧 Préférences d\'accessibilité chargées:', prefs);
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
   * Effet pour recharger les lieux quand l'écran devient focus
   * Utile si des lieux ont été ajoutés/modifiés dans d'autres écrans
   */
  useFocusEffect(
    useCallback(() => {
      loadPlacesFromFirestore();
    }, [loadPlacesFromFirestore])
  );

  /**
   * Fonction pour charger les lieux Google Places avec données réelles
   */
  const loadGooglePlacesWithRealData = useCallback(async (location, radius) => {
    try {
      if (!location) {
        console.log('📍 Recherche depuis le centre de Paris (position non disponible)');
        // Utiliser le centre de Paris par défaut
        return await PlacesApiService.searchNearbyPlaces({ lat: 48.8566, lng: 2.3522 }, radius);
      }
      
      console.log(`📍 Recherche depuis votre position: ${location.latitude}, ${location.longitude}`);
      console.log(`🎯 Rayon de recherche: ${radius}m (configuré dans les réglages)`);
      
      return await PlacesApiService.searchNearbyPlaces({ lat: location.latitude, lng: location.longitude }, radius);
    } catch (error) {
      console.warn('⚠️ Google Places erreur:', error.message);
      return [];
    }
  }, []);

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
      
      // Ajouter les lieux statiques comme fallback si besoin
      if (allPlaces.length === 0) {
        console.log('📦 Fallback sur les données statiques');
        staticPlaces.forEach(staticPlace => {
          if (!existingNames.has(staticPlace.name.toLowerCase())) {
            allPlaces.push(staticPlace);
          }
        });
      }
      
      console.log(`✅ ${allPlaces.length} lieux total chargés (Firebase: ${firestorePlaces.length}, Google: ${parisPlaces.length})`);
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
      const matchesCategory = selectedCategory === 'all' || place.type === selectedCategory;
      const accessLevel = getAccessibilityLevel(place);
      const isAccessible = accessibilityFilter === 'all' || 
                          accessibilityFilter === accessLevel ||
                          (accessibilityFilter === 'partial' && (accessLevel === 'full' || accessLevel === 'partial'));
      const meetsPreferences = meetsAccessibilityPreferences(place);
      return matchesCategory && isAccessible && meetsPreferences;
    })
    .map(place => ({
      ...place,
      distance: userLocation ? calculateDistance(userLocation, place.coordinates) : 0,
      accessibilityLevel: getAccessibilityLevel(place),
      accessibilityLabel: getAccessibilityLabel(getAccessibilityLevel(place))
    }))
    .filter(place => {
      // Si le filtre "photo" est activé, ne montrer que les lieux avec des images
      if (sortValue === 'photo') {
        return place.image || (place.photos && place.photos.length > 0);
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
      } else if (sortValue === 'rating') {
        return b.rating - a.rating;
      } else {
        return b.reviewCount - a.reviewCount;
      }
    });

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

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.surface, paddingTop: 40 }]}>
        {locationError && (
          <View style={[styles.errorContainer, { backgroundColor: theme.colors.errorContainer }]}>
            <Text style={[styles.errorText, { color: theme.colors.error }]}>⚠️ {locationError}</Text>
            <Button onPress={async () => {
              setLocationError(null);
              setIsLoadingLocation(true);
              setIsLoadingPlaces(true);
              try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status === 'granted') {
                  const location = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.Balanced,
                  });
                  setUserLocation(location.coords);
                  const nearbyPlaces = await PlacesApiService.searchNearbyPlaces(
                    { lat: location.coords.latitude, lng: location.coords.longitude },
                    1500
                  );
                  setPlaces(nearbyPlaces);
                  setLocationError(null);
                } else {
                  throw new Error('Permission refusée');
                }
              } catch (error) {
                setLocationError('Impossible d\'obtenir votre position');
              } finally {
                setIsLoadingLocation(false);
                setIsLoadingPlaces(false);
              }
            }} mode="text" compact>
              Réessayer
            </Button>
          </View>
        )}

        {isLoadingLocation && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <Text style={[styles.loadingText, { color: theme.colors.onSurface }]}>
              Recherche de votre position...
            </Text>
          </View>
        )}

        {userLocation && (
          <View style={[styles.locationInfo, { backgroundColor: theme.colors.surfaceVariant }]}>
            <Text style={[styles.locationText, { color: theme.colors.onSurface }]}>
              🔍 Rayon de recherche: {searchRadius >= 1000 ? (searchRadius/1000).toFixed(1) + ' km' : searchRadius + ' m'}
            </Text>
          </View>
        )}

        {/* Indicateur des préférences d'accessibilité actives */}
        {AccessibilityService.hasActivePreferences(accessibilityPrefs) && (
          <View style={[styles.preferencesInfo, { backgroundColor: theme.colors.primaryContainer }]}>
            <Text style={[styles.preferencesText, { color: theme.colors.onPrimaryContainer }]}>
              🔧 Filtres d'accessibilité actifs: {AccessibilityService.getActivePreferencesText(accessibilityPrefs)}
            </Text>
          </View>
        )}



        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categories}
        >
          {categories.map(category => (
            <Chip
              key={category.id}
              selected={selectedCategory === category.id}
              onPress={() => setSelectedCategory(category.id)}
              style={styles.categoryChip}
              textStyle={{ fontSize: textSizes.body }}
            >
              {category.label}
            </Chip>
          ))}
        </ScrollView>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.accessibilityContainer}
          contentContainerStyle={styles.categories}
        >
          <Chip
            selected={accessibilityFilter === 'all'}
            onPress={() => setAccessibilityFilter('all')}
            style={styles.categoryChip}
            selectedColor={theme.colors.primary}
            textStyle={{ fontSize: textSizes.body }}
          >
            🔍 Tous
          </Chip>
          <Chip
            selected={accessibilityFilter === 'full'}
            onPress={() => setAccessibilityFilter('full')}
            style={styles.categoryChip}
            selectedColor={theme.colors.primary}
            textStyle={{ fontSize: textSizes.body }}
          >
            ♿ Totalement accessible
          </Chip>
          <Chip
            selected={accessibilityFilter === 'partial'}
            onPress={() => setAccessibilityFilter('partial')}
            style={styles.categoryChip}
            selectedColor={theme.colors.primary}
            textStyle={{ fontSize: textSizes.body }}
          >
            ⚡ Partiellement accessible
          </Chip>
        </ScrollView>

        <SegmentedButtons
          value={sortValue}
          onValueChange={setSortValue}
          buttons={[
            { value: 'photo', label: '📸 Photo', labelStyle: { fontSize: textSizes.body } },
            { value: 'rating', label: '⭐ Note', labelStyle: { fontSize: textSizes.body } },
            { value: 'reviews', label: '💬 Avis', labelStyle: { fontSize: textSizes.body } },
          ]}
          style={styles.sortButtons}
        />
      </View>

      {/* Affichage simple de TOUS les lieux */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Chargement...</Text>
          </View>
        )}
        
        {!loading && (
          <>
            <View style={styles.resultsHeader}>
              <View style={styles.headerLeft}></View>
              <Text style={styles.sectionTitle}>
                📍 {selectedCategory === 'all' ? 'Tous les lieux' : categories.find(c => c.id === selectedCategory)?.label || 'Lieux'}
              </Text>
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{sortedAndFilteredPlaces.length}</Text>
              </View>
            </View>
            
            {sortedAndFilteredPlaces.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>😔 Aucun lieu trouvé</Text>
                <Text style={styles.emptyStateSubtext}>Essayez de modifier vos filtres</Text>
              </View>
            ) : (
              sortedAndFilteredPlaces.map((place, index) => (
                <PlaceCard
                  key={`${place.id}-${index}`}
                  place={place}
                  onPress={() => navigation.getParent()?.navigate('PlaceDetail', { place })}
                />
              ))
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 5,
    paddingBottom: 6,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  categoriesContainer: {
    marginBottom: 8,
  },
  accessibilityContainer: {
    marginBottom: 8,
  },
  categories: {
    paddingRight: 20,
    gap: 12,
  },
  categoryChip: {
    marginRight: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sortButtons: {
    marginBottom: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  content: {
    flex: 1,
    marginTop: 2,
    paddingHorizontal: 10,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    flex: 1,
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 0,
    paddingHorizontal: 0,
    paddingVertical: 0,
    marginLeft: -8,
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
    marginBottom: 16,
    borderRadius: 8,
  },
  locationText: {
    
  },
  preferencesInfo: {
    padding: 8,
    marginBottom: 16,
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 12,
    marginBottom: 12,
  },
  headerLeft: {
    width: 60, // Même largeur que le countBadge pour équilibrer
  },
  countBadge: {
    backgroundColor: '#4CAF50',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    width: 60,
    alignItems: 'center',
  },
  countText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
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

});
