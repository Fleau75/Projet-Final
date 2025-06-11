import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Platform, FlatList, TouchableOpacity } from 'react-native';
import { Text, FAB, ActivityIndicator, Searchbar, useTheme, Surface, Card } from 'react-native-paper';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { searchNearbyPlaces } from '../services/placesApi';
import { searchPlacesByText } from '../services/placesSearch';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

export default function MapScreen({ navigation }) {
  const theme = useTheme();
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
      style={styles.resultItem}
    >
      <View style={styles.resultContent}>
        <View style={styles.resultTextContainer}>
          <Text style={styles.resultTitle}>{item.name}</Text>
          <Text style={styles.resultAddress}>📍 {item.address}</Text>
          <View style={styles.resultMeta}>
            <Text style={styles.resultRating}>
              ⭐ {item.rating.toFixed(1)} ({item.reviewCount})
            </Text>
            <Text style={styles.resultAction}>Ajouter à la carte</Text>
          </View>
        </View>
        <MaterialCommunityIcons 
          name="chevron-right" 
          size={20} 
          color="#007AFF" 
        />
      </View>
    </TouchableOpacity>
  );

  if (!location) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Chargement de la carte...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        key={mapKey}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
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
        <Surface style={styles.resultsContainer}>
          <View style={styles.resultsHeader}>
            <Text variant="titleMedium" style={styles.resultsTitle}>
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
              style={styles.resultsList}
              showsVerticalScrollIndicator={false}
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
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  searchContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 16,
    right: 16,
    zIndex: 10,
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
    maxHeight: '50%',
    borderRadius: 12,
    elevation: 10,
    zIndex: 999,
    backgroundColor: '#FFFFFF',
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
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  resultsTitle: {
    fontWeight: 'bold',
  },
  resultsList: {
    maxHeight: 280,
    backgroundColor: '#FFFFFF',
    paddingBottom: 10,
  },
  resultItem: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 8,
    marginVertical: 5,
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,
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
    color: '#1F2937',
    marginBottom: 5,
  },
  resultAddress: {
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 9,
  },
  resultMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultRating: {
    fontSize: 13,
    color: '#4B5563',
  },
  resultAction: {
    fontSize: 13,
    color: '#007AFF',
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
    color: '#6B7280',
  },
  errorContainer: {
    position: 'absolute',
    bottom: 100,
    left: 16,
    right: 16,
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
    zIndex: 5,
  },
  errorText: {
    textAlign: 'center',
    color: '#EF4444',
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
