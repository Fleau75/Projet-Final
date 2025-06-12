import React, { useState, useEffect, useRef } from 'react';
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
import { AccessibilityService } from '../services/accessibilityService';

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

export default function MapScreen({ navigation, route }) {
  const theme = useTheme();
  const { isDarkMode } = useAppTheme(); // Récupérer l'état du thème sombre
  const mapRef = useRef(null); // Référence pour contrôler la carte
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [places, setPlaces] = useState([]);
  const [lastAddedPlace, setLastAddedPlace] = useState(null); // Pour tracker le dernier lieu ajouté
  const [mapKey, setMapKey] = useState(0); // Pour forcer le re-rendu quand nécessaire
  const [accessibilityPrefs, setAccessibilityPrefs] = useState({
    requireRamp: false,
    requireElevator: false,
    requireAccessibleParking: false,
    requireAccessibleToilets: false,
  });
  const [filteredPlaces, setFilteredPlaces] = useState([]);
  const [searchRadius, setSearchRadius] = useState(1000); // Distance de recherche en mètres

  // Position par défaut sur Paris
  const defaultParisLocation = {
    coords: {
      latitude: 48.8566,
      longitude: 2.3522,
    }
  };

  // Fonction pour calculer la distance entre deux points
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

  // Fonction pour formater la distance
  const formatDistance = (distance) => {
    if (!distance && distance !== 0) return '';
    
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    } else {
      return `${distance.toFixed(1)}km`;
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

  // Charger les marqueurs sauvegardés et les préférences d'accessibilité
  const loadSavedMarkers = async () => {
    try {
      const savedMarkers = await AsyncStorage.getItem('mapMarkers');
      if (savedMarkers) {
        const allPlaces = JSON.parse(savedMarkers);
        console.log(`📁 Chargement de ${allPlaces.length} marqueurs sauvegardés`);
        
        // Si on a déjà une position, l'utiliser, sinon essayer de la récupérer
        let currentLocation = location;
        if (!currentLocation) {
          console.log('📍 Tentative de récupération de la position actuelle...');
          try {
            const newLocation = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Balanced,
              maximumAge: 30000, // Accepter une position vieille de 30 secondes max
            });
            currentLocation = newLocation;
            setLocation(newLocation);
            console.log(`📍 Position récupérée: ${newLocation.coords.latitude}, ${newLocation.coords.longitude}`);
          } catch (error) {
            console.log('⚠️ Impossible de récupérer la position, utilisation de la position par défaut');
            currentLocation = defaultParisLocation;
          }
        }
        
        // Ajouter la distance à chaque lieu sauvegardé
        const placesWithDistance = allPlaces.map(place => {
          const distance = currentLocation ? calculateDistance(currentLocation.coords, place.coordinates) : 0;
          if (currentLocation) {
            console.log(`📏 Distance calculée pour ${place.name}: ${distance.toFixed(3)}km`);
          } else {
            console.log(`⏳ Position non disponible, distance temporaire pour ${place.name}: 0km`);
          }
          return {
            ...place,
            distance
          };
        });
        
        setPlaces(placesWithDistance);
        
        // Charger les préférences d'accessibilité et filtrer
        const prefs = await AccessibilityService.loadAccessibilityPreferences();
        setAccessibilityPrefs(prefs);
        
        // Filtrer les lieux selon les préférences
        const filtered = placesWithDistance.filter(place => 
          AccessibilityService.meetsAccessibilityPreferences(place, prefs)
        );
        setFilteredPlaces(filtered);
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
      console.log('🔄 Focus sur MapScreen, rechargement des marqueurs');
      loadSavedMarkers();
      
      // Recharger aussi les préférences d'accessibilité
      const loadPreferences = async () => {
        try {
          const prefs = await AccessibilityService.loadAccessibilityPreferences();
          console.log('🔧 Préférences rechargées:', prefs);
          setAccessibilityPrefs(prefs);
        } catch (error) {
          console.error('Erreur lors du rechargement des préférences:', error);
        }
      };
      
      loadPreferences();
    }, []) // Pas de dépendances pour éviter la boucle infinie
  );

  // Recalculer les distances quand la position de l'utilisateur devient disponible
  useEffect(() => {
    if (location && places.length > 0) {
      console.log('🔄 Recalcul des distances pour les marqueurs existants');
      console.log(`📍 Position utilisateur: ${location.coords.latitude}, ${location.coords.longitude}`);
      
      // Vérifier si les places ont des distances invalides (nulles ou zéro)
      const placesWithInvalidDistances = places.filter(place => !place.distance || place.distance === 0);
      
      if (placesWithInvalidDistances.length > 0) {
        console.log(`📏 ${placesWithInvalidDistances.length} lieux avec distances invalides détectés, recalcul nécessaire`);
        const placesWithUpdatedDistance = places.map(place => {
          if (!place.distance || place.distance === 0) {
            const distance = calculateDistance(location.coords, place.coordinates);
            console.log(`📏 ${place.name}: ${distance.toFixed(3)}km (recalculé)`);
            return {
              ...place,
              distance
            };
          }
          return place; // Garder la distance existante si elle est valide
        });
        
        setPlaces(placesWithUpdatedDistance);
        
        // Mettre à jour aussi les lieux filtrés
        const filtered = placesWithUpdatedDistance.filter(place => 
          AccessibilityService.meetsAccessibilityPreferences(place, accessibilityPrefs)
        );
        setFilteredPlaces(filtered);
        
        // Sauvegarder les distances mises à jour
        saveMarkers(placesWithUpdatedDistance);
      }
    }
  }, [location, places.length]); // Se déclenche quand location change ou nombre de places change

  // Refiltrer les marqueurs quand les préférences d'accessibilité changent
  useEffect(() => {
    if (places.length > 0) {
      console.log('🔄 Refiltrage automatique suite au changement de préférences');
      console.log('🔧 Préférences actuelles:', accessibilityPrefs);
      
      const filtered = places.filter(place => 
        AccessibilityService.meetsAccessibilityPreferences(place, accessibilityPrefs)
      );
      
      console.log(`📊 Filtrage: ${places.length} lieux total → ${filtered.length} lieux affichés`);
      setFilteredPlaces(filtered);
    }
  }, [accessibilityPrefs, places]); // Se déclenche quand les préférences ou les places changent

  // Écouter les changements d'AsyncStorage en temps réel
  useEffect(() => {
    const checkStorageChanges = setInterval(async () => {
      try {
        const savedMarkers = await AsyncStorage.getItem('mapMarkers');
        const currentMarkers = savedMarkers ? JSON.parse(savedMarkers) : [];
        
        // Si le nombre de marqueurs a changé, mettre à jour l'affichage
        if (currentMarkers.length !== places.length) {
          console.log(`🔄 Synchronisation: ${places.length} → ${currentMarkers.length} marqueurs`);
          
          // Ajouter la distance à chaque marqueur
          const markersWithDistance = currentMarkers.map(place => ({
            ...place,
            distance: location ? calculateDistance(location.coords, place.coordinates) : 0
          }));
          
          setPlaces(markersWithDistance);
          
          // Filtrer selon les préférences d'accessibilité
          const prefs = await AccessibilityService.loadAccessibilityPreferences();
          const filtered = markersWithDistance.filter(place => 
            AccessibilityService.meetsAccessibilityPreferences(place, prefs)
          );
          setFilteredPlaces(filtered);
        }
      } catch (error) {
        console.error('Erreur lors de la synchronisation:', error);
      }
    }, 1000); // Vérifier toutes les secondes pour la synchronisation

    return () => clearInterval(checkStorageChanges);
  }, [places.length]);

  // Centrer automatiquement quand un nouveau lieu est ajouté
  useEffect(() => {
    if (lastAddedPlace && mapRef.current) {
      // Attendre que la carte soit re-rendue avec le nouveau marqueur
      setTimeout(() => {
        mapRef.current.animateToRegion({
          latitude: lastAddedPlace.coordinates.latitude,
          longitude: lastAddedPlace.coordinates.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }, 800); // Animation rapide
      }, 100); // Délai pour laisser la carte se re-rendre
    }
  }, [lastAddedPlace]);

  // Centrer sur un lieu spécifique depuis les paramètres de navigation
  useEffect(() => {
    const centerOnPlace = route?.params?.centerOnPlace;
    if (centerOnPlace && mapRef.current) {
      console.log('🎯 Centrage sur le lieu:', centerOnPlace.name);
      console.log('📍 Coordonnées:', centerOnPlace.coordinates);
      
      // Attendre que la carte soit prête
      setTimeout(() => {
        mapRef.current.animateToRegion({
          latitude: centerOnPlace.coordinates.latitude,
          longitude: centerOnPlace.coordinates.longitude,
          latitudeDelta: 0.01, // Zoom plus proche pour bien voir le lieu
          longitudeDelta: 0.01,
        }, 1000); // Animation un peu plus lente pour bien voir
      }, 500); // Délai plus long pour s'assurer que la carte est prête
      
      // Nettoyer le paramètre pour éviter les re-centrages
      navigation.setParams({ centerOnPlace: null });
    }
  }, [route?.params?.centerOnPlace, mapRef]);

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

      // Ajouter la distance à chaque résultat
      const resultsWithDistance = results.map(place => ({
        ...place,
        distance: location ? calculateDistance(location.coords, place.coordinates) : 0
      }));

      // Filtrer les résultats selon les préférences d'accessibilité
      const filteredResults = resultsWithDistance.filter(place => 
        AccessibilityService.meetsAccessibilityPreferences(place, accessibilityPrefs)
      );

      // Trier par distance
      const sortedResults = filteredResults.sort((a, b) => a.distance - b.distance);

      setSearchResults(sortedResults);
      console.log(`🔍 Recherche: ${results.length} résultats trouvés, ${filteredResults.length} après filtrage d'accessibilité`);
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
    
    // Ajouter une date d'ajout et recalculer la distance au lieu
    const placeWithDate = {
      ...place,
      addedDate: new Date().toISOString(),
      distance: location ? calculateDistance(location.coords, place.coordinates) : 0
    };
    
    // Ajouter le lieu sélectionné aux marqueurs de la carte
    const newPlaces = [...places, placeWithDate];
    setPlaces(newPlaces);
    
    // Filtrer selon les préférences d'accessibilité
    const filtered = newPlaces.filter(place => 
      AccessibilityService.meetsAccessibilityPreferences(place, accessibilityPrefs)
    );
    setFilteredPlaces(filtered);
    
    // Forcer la mise à jour immédiate de la carte pour afficher le marqueur
    setMapKey(prev => prev + 1);
    
    // Déclencher le centrage via le state après que le marqueur soit visible
    setLastAddedPlace(placeWithDate);
    
    // Sauvegarder automatiquement
    saveMarkers(newPlaces);

    // Ne pas naviguer vers les détails - juste ajouter le marqueur
    // L'utilisateur pourra cliquer sur le marqueur s'il veut voir les détails
  };

  // Fonction pour recentrer sur la position de l'utilisateur
  const centerOnUser = () => {
    if (mapRef.current && location) {
      mapRef.current.animateToRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 800);
    }
  };

  // Fonction pour supprimer un marqueur individuel
  const removeMarker = async (placeId) => {
    try {
      const updatedPlaces = places.filter(place => place.id !== placeId);
      setPlaces(updatedPlaces);
      
      // Filtrer selon les préférences d'accessibilité
      const filtered = updatedPlaces.filter(place => 
        AccessibilityService.meetsAccessibilityPreferences(place, accessibilityPrefs)
      );
      setFilteredPlaces(filtered);
      
      // Sauvegarder les changements
      await saveMarkers(updatedPlaces);
      
      console.log(`🗑️ Marqueur supprimé: ${placeId}`);
    } catch (error) {
      console.error('Erreur lors de la suppression du marqueur:', error);
    }
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
            {item.distance !== undefined && (
              <Text style={[styles.resultDistance, { color: theme.colors.primary }]}>
                📍 {formatDistance(item.distance)}
              </Text>
            )}
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
        ref={mapRef} // Ajouter la référence
        key={mapKey} // Pour forcer le re-rendu des marqueurs
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

        {/* Marqueurs des lieux sélectionnés (filtrés selon les préférences d'accessibilité) */}
        {filteredPlaces.map((place) => (
          <Marker
            key={place.id}
            coordinate={place.coordinates}
            title={place.name}
            description={`${place.address}${place.distance !== undefined ? ` - 📍 ${formatDistance(place.distance)}` : ''} - ⭐ ${place.rating} (${place.reviewCount} avis)`}
            onPress={() => navigation.getParent()?.navigate('PlaceDetail', { place })}
            pinColor="#FF6B6B"
          />
        ))}
      </MapView>

      {/* Barre de recherche */}
      <View style={[styles.searchContainer, { backgroundColor: 'transparent' }]}>
        <Searchbar
          placeholder="Rechercher lieux, restaurants, hôtels..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          onSubmitEditing={handleSearch}
          loading={isSearching}
          style={[styles.searchBar, { 
            backgroundColor: theme.colors.surface,
          }]}
          onIconPress={handleSearch}
        />
        
        {/* Indicateur des préférences d'accessibilité actives */}
        {AccessibilityService.hasActivePreferences(accessibilityPrefs) && (
          <View style={[styles.preferencesIndicator, { backgroundColor: theme.colors.primaryContainer }]}>
            <Text style={[styles.preferencesText, { color: theme.colors.onPrimaryContainer }]}>
              🔧 Filtres actifs: {AccessibilityService.getActivePreferencesText(accessibilityPrefs)}
            </Text>
          </View>
        )}
      </View>

      {/* Bouton de recentrage sur l'utilisateur */}
      <TouchableOpacity 
        style={[styles.centerButton, { backgroundColor: theme.colors.surface }]}
        onPress={centerOnUser}
        activeOpacity={0.7}
      >
        <Text style={styles.centerButtonText}>📍</Text>
      </TouchableOpacity>

      {/* Résultats de recherche */}
      {showResults && (
        <Surface style={[styles.resultsContainer, { backgroundColor: theme.colors.surface }]}>
          <View style={[styles.resultsHeader, { 
            backgroundColor: theme.colors.surface,
            borderBottomColor: theme.colors.outline 
          }]}>
            <Text variant="titleMedium" style={[styles.resultsTitle, { color: theme.colors.onSurface }]}>
              Résultats de recherche ({searchResults.length}{AccessibilityService.hasActivePreferences(accessibilityPrefs) ? ' filtrés' : ''})
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
  preferencesIndicator: {
    marginTop: 8,
    padding: 8,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  preferencesText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  centerButton: {
    position: 'absolute',
    bottom: 100,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    zIndex: 1002,
  },
  centerButtonText: {
    fontSize: 16,
    textAlign: 'center',
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
  resultDistance: {
    fontSize: 13,
    fontWeight: '500',
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
