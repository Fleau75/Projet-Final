/**
 * Écran d'accueil de l'application AccessPlus
 * Affiche la liste des lieux accessibles avec des options de filtrage et de tri
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, FlatList, ActivityIndicator } from 'react-native';
import { Searchbar, Chip, FAB, Text, SegmentedButtons, useTheme } from 'react-native-paper';
import PlaceCard from '../components/PlaceCard';
import * as Location from 'expo-location';
import { searchNearbyPlaces } from '../services/placesApi';

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
 * Données de test pour les lieux
 * À remplacer par les données réelles de l'API
 */
const places = [
    {
    id: '1',
    name: 'Restaurant Le Marais',
    address: '35 rue des Archives, 75003 Paris',
      type: 'restaurant',
    rating: 4.5,
    reviewCount: 42,
    image: null,
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
    id: '2',
    name: 'Musée Carnavalet',
    address: '23 Rue de Sévigné, 75003 Paris',
    type: 'culture',
    rating: 4.8,
    reviewCount: 89,
    image: null,
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
    id: '3',
    name: 'BHV Marais',
    address: '52 Rue de Rivoli, 75004 Paris',
    type: 'shopping',
    rating: 4.2,
    reviewCount: 156,
    image: null,
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
    id: '4',
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
    id: '5',
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
    id: '6',
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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortValue, setSortValue] = useState('proximity');
  const [accessibilityFilter, setAccessibilityFilter] = useState('all');
  
  // États pour la géolocalisation
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  
  // États pour les données des lieux
  const [places, setPlaces] = useState([]);
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(false);

  /**
   * Effet pour gérer la géolocalisation au chargement
   */
  useEffect(() => {
    (async () => {
      setIsLoadingLocation(true);
      try {
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
        
        // Charger les lieux une fois la position obtenue
        setIsLoadingPlaces(true);
        const nearbyPlaces = await searchNearbyPlaces(
          location.coords.latitude,
          location.coords.longitude
        );
        setPlaces(nearbyPlaces);
      } catch (error) {
        console.error('Erreur:', error);
        setLocationError('Impossible d\'obtenir votre position');
      } finally {
        setIsLoadingLocation(false);
        setIsLoadingPlaces(false);
      }
    })();
  }, []);

  const calculateDistance = (coords1, coords2) => {
    if (!coords1 || !coords2) {
      console.log('Coordonnées manquantes:', { coords1, coords2 });
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

    console.log('Distance calculée:', {
      from: coords1,
      to: coords2,
      distance: distance.toFixed(2) + ' km'
    });

    return distance;
  };

  const sortedAndFilteredPlaces = places
    .filter(place => {
      const matchesSearch = place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          place.address.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || place.type === selectedCategory;
      const accessLevel = getAccessibilityLevel(place);
      const isAccessible = accessibilityFilter === 'all' || 
                          accessibilityFilter === accessLevel ||
                          (accessibilityFilter === 'partial' && accessLevel === 'full');
      return matchesSearch && matchesCategory && isAccessible;
    })
    .map(place => ({
      ...place,
      distance: calculateDistance(userLocation, place.coordinates),
      accessibilityLevel: getAccessibilityLevel(place),
      accessibilityLabel: getAccessibilityLabel(getAccessibilityLevel(place))
    }))
    .sort((a, b) => {
      if (sortValue === 'proximity') {
        return a.distance - b.distance;
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

  const renderPlace = ({ item }) => (
    <PlaceCard
      place={{
        ...item,
        distance: item.distance < Infinity ? item.distance.toFixed(1) + ' km' : null,
        accessibilityLabel: item.accessibilityLabel
      }}
      onPress={() => navigation.navigate('PlaceDetail', { place: item })}
    />
  );

  const renderSectionHeader = (title) => (
    <Text variant="titleLarge" style={styles.sectionTitle}>
      {title}
    </Text>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {locationError && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              {locationError}
            </Text>
            <Chip 
              icon="refresh" 
              onPress={async () => {
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
                    const nearbyPlaces = await searchNearbyPlaces(
                      location.coords.latitude,
                      location.coords.longitude
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
              }}
            >
              Réessayer
            </Chip>
          </View>
        )}

        {(isLoadingLocation || isLoadingPlaces) && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={[styles.loadingText, { color: theme.colors.primary }]}>
              {isLoadingLocation ? 'Recherche de votre position...' : 'Chargement des lieux...'}
            </Text>
          </View>
        )}

        {userLocation && (
          <View style={styles.locationInfo}>
            <Text style={styles.locationText}>
              Position actuelle : {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
            </Text>
      </View>
        )}

      <Searchbar
        placeholder="Rechercher un lieu..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />

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
              selectedColor={theme.colors.primary}
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
          >
            🔍 Tous
          </Chip>
          <Chip
            selected={accessibilityFilter === 'full'}
            onPress={() => setAccessibilityFilter('full')}
            style={styles.categoryChip}
            selectedColor={theme.colors.primary}
          >
            ♿ Totalement accessible
          </Chip>
          <Chip
            selected={accessibilityFilter === 'partial'}
            onPress={() => setAccessibilityFilter('partial')}
            style={styles.categoryChip}
            selectedColor={theme.colors.primary}
          >
            ⚡ Partiellement accessible
          </Chip>
        </ScrollView>

        <SegmentedButtons
          value={sortValue}
          onValueChange={setSortValue}
          buttons={[
            { value: 'proximity', label: 'Distance' },
            { value: 'rating', label: 'Note' },
            { value: 'popular', label: 'Populaire' },
          ]}
          style={styles.sortButtons}
        />
      </View>

      {!searchQuery && selectedCategory === 'all' && accessibilityFilter === 'all' && (
        <ScrollView style={styles.content}>
          <View style={styles.section}>
            {renderSectionHeader('✨ Mieux notés')}
            {topRatedPlaces.map(place => (
              <PlaceCard
                key={place.id}
                place={{
                  ...place,
                  accessibilityLabel: place.accessibilityLabel
                }}
                onPress={() => navigation.navigate('PlaceDetail', { place })}
              />
            ))}
          </View>

          <View style={styles.section}>
            {renderSectionHeader('📍 À proximité')}
            {nearbyPlaces.map(place => (
          <PlaceCard
            key={place.id}
                place={{
                  ...place,
                  distance: place.distance < Infinity ? place.distance.toFixed(1) + ' km' : null,
                  accessibilityLabel: place.accessibilityLabel
                }}
            onPress={() => navigation.navigate('PlaceDetail', { place })}
          />
        ))}
      </View>
    </ScrollView>
      )}

      {(searchQuery || selectedCategory !== 'all' || accessibilityFilter !== 'all') && (
        <FlatList
          data={sortedAndFilteredPlaces}
          renderItem={renderPlace}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          ListHeaderComponent={() => (
            <Text variant="titleMedium" style={styles.resultsCount}>
              {sortedAndFilteredPlaces.length} résultat{sortedAndFilteredPlaces.length > 1 ? 's' : ''}
            </Text>
          )}
        />
      )}

      <View style={styles.fabContainer}>
        <FAB
          icon="map"
          label="Voir la carte"
          onPress={() => navigation.navigate('Map')}
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        />
        <FAB
          icon="plus"
          label="Ajouter un lieu"
          onPress={() => navigation.navigate('AddReview')}
          style={[styles.fab, { backgroundColor: theme.colors.secondary }]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  header: {
    backgroundColor: 'white',
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
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
  searchBar: {
    elevation: 0,
    borderRadius: 12,
    marginBottom: 16,
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  accessibilityContainer: {
    marginBottom: 16,
  },
  categories: {
    paddingRight: 16,
    gap: 8,
  },
  categoryChip: {
    marginRight: 8,
  },
  sortButtons: {
    marginBottom: 8,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  list: {
    padding: 16,
  },
  resultsCount: {
    marginBottom: 16,
    opacity: 0.7,
  },
  fabContainer: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    gap: 16,
  },
  fab: {
    elevation: 4,
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    padding: 8,
    borderRadius: 8,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  errorText: {
    color: '#DC2626',
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
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
  },
  locationText: {
    color: '#333',
  },
  loadingText: {
    marginTop: 8,
  },
});
