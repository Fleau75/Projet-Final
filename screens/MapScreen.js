import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Platform, FlatList, TouchableOpacity, StatusBar } from 'react-native';
import { Text, FAB, ActivityIndicator, Searchbar, useTheme, Surface, Card } from 'react-native-paper';
import { useAppTheme } from '../theme/ThemeContext';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { searchNearbyPlaces } from '../services/placesApi';
import { searchPlacesByText } from '../services/placesSearch';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

// Style de carte sombre pour Google Maps
const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#212121" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#757575" }] },
  { featureType: "administrative.country", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
  { featureType: "administrative.land_parcel", stylers: [{ visibility: "off" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#bdbdbd" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#181818" }] },
  { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
  { featureType: "poi.park", elementType: "labels.text.stroke", stylers: [{ color: "#1b1b1b" }] },
  { featureType: "road", elementType: "geometry.fill", stylers: [{ color: "#2c2c2c" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#8a8a8a" }] },
  { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#373737" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#3c3c3c" }] },
  { featureType: "road.highway.controlled_access", elementType: "geometry", stylers: [{ color: "#4e4e4e" }] },
  { featureType: "road.local", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
  { featureType: "transit", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#000000" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#3d3d3d" }] }
];

export default function MapScreen({ navigation }) {
  const theme = useTheme();
  const { isDarkMode } = useAppTheme(); // Récupérer l'état du thème sombre
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [places, setPlaces] = useState([]);
  const [mapKey, setMapKey] = useState(0); // Pour forcer le re-rendu de la carte

  // Position par défaut sur Paris
  const defaultParisLocation = {
    coords: {
      latitude: 48.8566,
      longitude: 2.3522,
    }
  };

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permission de localisation refusée - utilisation de Paris par défaut');
          setLocation(defaultParisLocation);
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        setLocation(location);
      } catch (error) {
        console.error('Erreur de localisation:', error);
        setErrorMsg('Impossible d\'obtenir votre position - utilisation de Paris par défaut');
        setLocation(defaultParisLocation);
      }
    })();
  }, []);

  // Charger les marqueurs sauvegardés
  const loadSavedMarkers = async () => {
    try {
      const savedMarkers = await AsyncStorage.getItem('mapMarkers');
      if (savedMarkers) {
        setPlaces(JSON.parse(savedMarkers));
      }
    } catch (error) {
      console.error('Erreur lors du chargement des marqueurs:', error);
    }
  };

  // Sauvegarder les marqueurs
  const saveMarkers = async (markers) => {
    try {
      await AsyncStorage.setItem('mapMarkers', JSON.stringify(markers));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des marqueurs:', error);
    }
  };

  // Charger les marqueurs au montage et quand on revient sur l'écran
  useFocusEffect(
    React.useCallback(() => {
      loadSavedMarkers();
    }, [])
  );

  // Vérifier régulièrement si les marqueurs ont été supprimés
  useEffect(() => {
    const checkMarkers = setInterval(async () => {
      try {
        const savedMarkers = await AsyncStorage.getItem('mapMarkers');
        if (!savedMarkers && places.length > 0) {
          // Les marqueurs ont été supprimés, vider l'état local
          setPlaces([]);
        }
      } catch (error) {
        console.error('Erreur lors de la vérification des marqueurs:', error);
      }
    }, 1000); // Vérifier toutes les secondes

    return () => clearInterval(checkMarkers);
  }, [places]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    setShowResults(true);

    try {
      // Recherche par texte dans Paris avec limite de 100 résultats
      const results = await searchPlacesByText(searchQuery, {
        latitude: 48.8566, // Centre de Paris
        longitude: 2.3522,
        radius: 20000 // 20km pour couvrir tout Paris
      }, 100); // Limite à 100 résultats

      setSearchResults(results);
    } catch (error) {
      console.error('Erreur de recherche:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handlePlaceSelect = (place) => {
    setShowResults(false);
    setSearchQuery(''); // Vider la barre de recherche pour permettre une nouvelle recherche
    
    // Ajouter le lieu sélectionné aux marqueurs de la carte
    const newPlaces = [...places, place];
    setPlaces(newPlaces);
    
    // Sauvegarder automatiquement
    saveMarkers(newPlaces);
    
    // Forcer le re-rendu de la carte
    setMapKey(prev => prev + 1);

    // Ne pas naviguer vers les détails - juste ajouter le marqueur
    // L'utilisateur pourra cliquer sur le marqueur s'il veut voir les détails
  };



  const renderSearchResult = ({ item }) => (
    <TouchableOpacity 
      onPress={() => handlePlaceSelect(item)}
      activeOpacity={0.6}
      style={[styles.resultItem, { 
        backgroundColor: theme.colors.surface,
        borderBottomColor: theme.colors.outline
      }]}
    >
      <View style={styles.resultContent}>
        <View style={styles.resultTextContainer}>
          <Text style={[styles.resultTitle, { color: theme.colors.onSurface }]}>{item.name}</Text>
          <Text style={[styles.resultAddress, { color: theme.colors.onSurfaceVariant }]}>📍 {item.address}</Text>
          <View style={styles.resultMeta}>
            <Text style={[styles.resultRating, { color: theme.colors.onSurfaceVariant }]}>
              ⭐ {item.rating.toFixed(1)} ({item.reviewCount})
            </Text>
            <Text style={[styles.resultAction, { color: theme.colors.primary }]}>Ajouter à la carte</Text>
          </View>
        </View>
        <MaterialCommunityIcons 
          name="chevron-right" 
          size={20} 
          color={theme.colors.primary} 
        />
      </View>
    </TouchableOpacity>
  );

  if (!location) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.onBackground }]}>Chargement de la carte...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar 
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor={theme.colors.background}
      />
      <MapView
        key={mapKey}
        provider={PROVIDER_GOOGLE}
        style={[
          styles.map,
          { backgroundColor: theme.colors.background }, // S'assurer que la carte a le bon fond
        ]}
        initialRegion={{
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        customMapStyle={isDarkMode ? darkMapStyle : undefined} // Applique le style sombre si activé
      >
        {/* Marqueur de position actuelle */}
        <Marker
          coordinate={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          }}
          title="Ma position"
          pinColor="#2563EB"
        />

        {/* Marqueurs des lieux sélectionnés */}
        {places.map((place) => (
          <Marker
            key={place.id}
            coordinate={place.coordinates}
            title={place.name}
            description={`${place.address} - ⭐ ${place.rating} (${place.reviewCount} avis)`}
            onPress={() => navigation.getParent()?.navigate('PlaceDetail', { place })}
            pinColor="#FF6B6B"
          />
        ))}
      </MapView>

      {/* Barre de recherche */}
      <View style={[styles.searchContainer, { backgroundColor: 'transparent' }]}>
        <Searchbar
          placeholder="Rechercher un lieu à Paris..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          onSubmitEditing={handleSearch}
          loading={isSearching}
          style={[styles.searchBar, { 
            backgroundColor: theme.colors.surface,
          }]}
          onIconPress={handleSearch}
        />
      </View>

      {/* Résultats de recherche */}
      {showResults && (
        <Surface style={[styles.resultsContainer, { backgroundColor: theme.colors.surface }]}>
          <View style={[styles.resultsHeader, { 
            backgroundColor: theme.colors.surface,
            borderBottomColor: theme.colors.outline 
          }]}>
            <Text variant="titleMedium" style={[styles.resultsTitle, { color: theme.colors.onSurface }]}>
              Résultats de recherche ({searchResults.length}/100)
            </Text>
            <TouchableOpacity onPress={() => setShowResults(false)}>
              <MaterialCommunityIcons 
                name="close" 
                size={24} 
                color={theme.colors.onSurface} 
              />
            </TouchableOpacity>
          </View>
          
          {isSearching ? (
            <View style={styles.searchingContainer}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <Text>Recherche en cours...</Text>
            </View>
          ) : searchResults.length > 0 ? (
            <FlatList
              data={searchResults}
              renderItem={renderSearchResult}
              keyExtractor={(item) => item.id}
              style={[styles.resultsList, { backgroundColor: theme.colors.surface }]}
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
              contentContainerStyle={{ 
                flexGrow: 1,
                justifyContent: 'flex-start', // Align items to top
                paddingBottom: 5 // Minimal padding at bottom
              }}
              removeClippedSubviews={false}
              initialNumToRender={12} // Plus d'items pour remplir l'espace
              maxToRenderPerBatch={15}
              windowSize={15}
              getItemLayout={(data, index) => (
                // Optimisation pour le scroll - hauteur fixe par item
                {length: 80, offset: 80 * index, index}
              )}
            />
          ) : (
            <View style={styles.noResultsContainer}>
              <Text variant="bodyMedium">Aucun résultat trouvé</Text>
              <Text variant="bodySmall" style={styles.noResultsSubtext}>
                Essayez d'autres mots-clés
              </Text>
            </View>
          )}
        </Surface>
      )}

      {/* Bouton FAB */}
      <View style={styles.fabContainer}>
        <FAB
          icon="comment-plus"
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
          onPress={() => navigation.getParent()?.navigate('AddReview')}
          label="Ajouter avis"
          mode="extended"
          size="medium"
          color="white"
        />
      </View>

      {/* Message d'erreur si applicable */}
      {errorMsg && (
        <View style={[styles.errorContainer, { backgroundColor: theme.colors.errorContainer }]}>
          <Text style={[styles.errorText, { color: theme.colors.onErrorContainer }]}>{errorMsg}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor supprimé - sera défini dynamiquement avec le thème
  },
  map: {
    flex: 1,
  },
  searchContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 16,
    right: 16,
    zIndex: 1001, // Augmenté pour être au-dessus des résultats
  },
  searchBar: {
    elevation: 6,
    borderRadius: 25,
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  resultsContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 110 : 90,
    left: 16,
    right: 16,
    bottom: 80, // Utiliser bottom au lieu de maxHeight pour un meilleur contrôle
    borderRadius: 12,
    elevation: 15,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8, // Réduit de 12 à 8 pour optimiser l'espace
    borderBottomWidth: 0.5, // Réduit pour plus de subtilité
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  resultsTitle: {
    fontWeight: 'bold',
  },
  resultsList: {
    maxHeight: 450, // Augmenté pour utiliser plus d'espace vertical
    paddingBottom: 5, // Réduit pour optimiser l'espace
    paddingTop: 2, // Réduit pour optimiser l'espace
  },
  resultItem: {
    marginHorizontal: 6, // Réduit pour plus d'espace
    marginVertical: 2, // Réduit pour optimiser l'espace
    borderRadius: 8,
    paddingVertical: 12, // Réduit pour plus d'items visibles
    paddingHorizontal: 14, // Réduit légèrement
    elevation: 2, // Réduit pour moins d'ombre
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderBottomWidth: 0.5, // Réduit pour plus de subtilité
  },
  resultContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resultTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  resultTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    // color supprimé - sera défini dynamiquement avec le thème
    marginBottom: 5,
  },
  resultAddress: {
    fontSize: 15,
    // color supprimé - sera défini dynamiquement avec le thème
    marginBottom: 9,
  },
  resultMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultRating: {
    fontSize: 13,
    // color supprimé - sera défini dynamiquement avec le thème
  },
  resultAction: {
    fontSize: 13,
    // color supprimé - sera défini dynamiquement avec le thème
    fontWeight: '500',
  },
  searchingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 8,
  },
  noResultsContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noResultsSubtext: {
    color: '#6B7280',
    marginTop: 4,
  },

  loadingText: {
    textAlign: 'center',
    marginTop: 10,
    // color supprimé - sera défini dynamiquement avec le thème
  },
  errorContainer: {
    position: 'absolute',
    bottom: 100,
    left: 16,
    right: 16,
    // backgroundColor supprimé - sera défini dynamiquement avec le thème
    padding: 12,
    borderRadius: 8,
    zIndex: 5,
  },
  errorText: {
    textAlign: 'center',
    // color supprimé - sera défini dynamiquement avec le thème
  },
  fabContainer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 2,
  },
  fab: {
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
});
