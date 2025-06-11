import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { Text, FAB, ActivityIndicator, Searchbar, useTheme } from 'react-native-paper';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';

export default function MapScreen({ navigation }) {
  const theme = useTheme();
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [places, setPlaces] = useState([
    // Données de test
    {
      id: '1',
      name: 'Restaurant Accessible',
      coordinate: {
        latitude: 48.8566,
        longitude: 2.3522,
      },
      type: 'restaurant',
    },
    {
      id: '2',
      name: 'Cinéma Adapté',
      coordinate: {
        latitude: 48.8606,
        longitude: 2.3376,
      },
      type: 'cinema',
    },
  ]);

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permission de localisation refusée');
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        setLocation(location);
      } catch (error) {
        console.error('Erreur de localisation:', error);
        setErrorMsg('Impossible d\'obtenir votre position');
      }
    })();
  }, []);

  const handleSearch = () => {
    // TODO: Implémenter la recherche de lieux
  };

  if (errorMsg) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{errorMsg}</Text>
      </View>
    );
  }

  if (!location) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Rechercher un lieu..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          onSubmitEditing={handleSearch}
          style={[styles.searchBar, { borderColor: theme.colors.primary }]}
        />
      </View>

      <MapView
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

        {/* Marqueurs des lieux accessibles */}
        {places.map((place) => (
          <Marker
            key={place.id}
            coordinate={place.coordinate}
            title={place.name}
            description={`Type: ${place.type}`}
            onPress={() => navigation.getParent()?.navigate('PlaceDetail', { place })}
          />
        ))}
      </MapView>

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  map: {
    flex: 1,
  },
  searchContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 35 : 15,
    left: 0,
    right: 0,
    zIndex: 1,
    padding: 16,
  },
  searchBar: {
    elevation: 4,
    borderRadius: 12,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: 'transparent', // Par défaut, sera overridé par le thème
  },
  errorText: {
    textAlign: 'center',
    color: '#EF4444',
    margin: 20,
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
