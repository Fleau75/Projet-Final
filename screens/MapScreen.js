import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { Text, FAB, ActivityIndicator, Searchbar } from 'react-native-paper';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';

export default function MapScreen({ navigation }) {
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
    console.log('Recherche:', searchQuery);
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
        <ActivityIndicator size="large" color="#2563EB" />
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
          style={styles.searchBar}
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

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('AddPlace')}
        label="Ajouter un lieu"
      />
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
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 0,
    right: 0,
    zIndex: 1,
    padding: 16,
  },
  searchBar: {
    elevation: 4,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  errorText: {
    textAlign: 'center',
    color: '#EF4444',
    margin: 20,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#2563EB',
  },
});
