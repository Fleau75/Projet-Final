import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, Surface, Checkbox, useTheme, Searchbar, List } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { Rating } from 'react-native-ratings';
import { searchPlaces } from '../services/placesSearch';
import { useAppTheme } from '../theme/ThemeContext';

export default function AddReviewScreen({ navigation }) {
  const theme = useTheme();
  const { isDarkMode } = useAppTheme();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [photos, setPhotos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [accessibility, setAccessibility] = useState({
    ramp: false,
    elevator: false,
    parking: false,
    toilets: false,
  });

  // Effet pour la recherche de lieux
  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (searchQuery.length >= 3) {
        setIsSearching(true);
        try {
          const results = await searchPlaces(searchQuery);
          setSearchResults(results);
        } catch (error) {
          console.error('Erreur de recherche:', error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(searchTimeout);
  }, [searchQuery]);

  // Fonction pour prendre une photo
  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        alert('Nous avons besoin de votre permission pour accéder à l\'appareil photo');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setPhotos([...photos, result.assets[0].uri]);
      }
    } catch (error) {
      console.error('Erreur lors de la prise de photo:', error);
    }
  };

  // Fonction pour choisir une photo depuis la galerie
  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Nous avons besoin de votre permission pour accéder à la galerie');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setPhotos([...photos, result.assets[0].uri]);
      }
    } catch (error) {
      console.error('Erreur lors de la sélection de l\'image:', error);
    }
  };

  const removePhoto = (index) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!selectedPlace) {
      alert('Veuillez sélectionner un lieu');
      return;
    }

    if (rating === 0) {
      alert('Veuillez donner une note');
      return;
    }

    setIsLoading(true);
    
    // Simuler l'envoi
    setTimeout(() => {
      setIsLoading(false);
      navigation.goBack();
    }, 1000);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Surface style={[styles.surface, { backgroundColor: theme.colors.surface }]}>
        <Text variant="headlineMedium" style={styles.title}>
          Évaluer un lieu
        </Text>

        {/* Sélection du lieu */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Sélectionner un lieu
          </Text>
          <Searchbar
            placeholder="Rechercher un lieu..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            loading={isSearching}
          />
          
          {/* Résultats de recherche */}
          {searchResults.length > 0 && !selectedPlace && (
            <Surface style={[styles.searchResults, { backgroundColor: theme.colors.surface }]}>
              {searchResults.map((place) => (
                <List.Item
                  key={place.id}
                  title={place.name}
                  description={place.address}
                  onPress={() => {
                    setSelectedPlace(place);
                    setSearchQuery('');
                    setSearchResults([]);
                  }}
                  style={[styles.searchResultItem, { borderBottomColor: isDarkMode ? '#334155' : '#E5E7EB' }]}
                />
              ))}
            </Surface>
          )}

          {/* Lieu sélectionné */}
          {selectedPlace && (
            <Surface style={[styles.selectedPlace, { backgroundColor: isDarkMode ? '#334155' : '#F1F5F9' }]}>
              <View style={styles.selectedPlaceHeader}>
                <View style={styles.selectedPlaceInfo}>
                  <Text variant="titleMedium">{selectedPlace.name}</Text>
                  <Text variant="bodySmall">{selectedPlace.address}</Text>
                </View>
                <Button
                  mode="text"
                  onPress={() => {
                    setSelectedPlace(null);
                    setSearchQuery('');
                  }}
                >
                  Changer
                </Button>
              </View>
            </Surface>
          )}
        </View>

        <View style={styles.ratingContainer}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Note globale
          </Text>
          <Rating
            type="star"
            ratingCount={5}
            imageSize={40}
            onFinishRating={setRating}
            style={[styles.rating, { backgroundColor: 'transparent' }]}
            tintColor={theme.colors.surface}
          />
        </View>

        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Votre avis
          </Text>
          <TextInput
            label="Commentaire"
            value={comment}
            onChangeText={setComment}
            mode="outlined"
            multiline
            numberOfLines={4}
            style={[styles.input, { backgroundColor: theme.colors.surface }]}
          />
        </View>

        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Photos
          </Text>
          <View style={styles.photoButtons}>
            <Button
              mode="contained-tonal"
              onPress={takePhoto}
              icon="camera"
              style={[styles.photoButton, { flex: 1 }]}
            >
              Prendre une photo
            </Button>
            <Button
              mode="contained-tonal"
              onPress={pickImage}
              icon="image"
              style={[styles.photoButton, { flex: 1 }]}
            >
              Galerie
            </Button>
          </View>
          
          <View style={styles.photoGrid}>
            {photos.map((photo, index) => (
              <TouchableOpacity
                key={index}
                style={styles.photoContainer}
                onPress={() => removePhoto(index)}
              >
                <Image source={{ uri: photo }} style={styles.photo} />
                <View style={styles.removePhoto}>
                  <Text style={styles.removePhotoText}>×</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Équipements accessibles
          </Text>
          <View style={[styles.accessibilityGrid, { backgroundColor: theme.colors.surface }]}>
            <Checkbox.Item
              label="Rampe d'accès"
              status={accessibility.ramp ? 'checked' : 'unchecked'}
              onPress={() => setAccessibility({ ...accessibility, ramp: !accessibility.ramp })}
            />
            <Checkbox.Item
              label="Ascenseur"
              status={accessibility.elevator ? 'checked' : 'unchecked'}
              onPress={() => setAccessibility({ ...accessibility, elevator: !accessibility.elevator })}
            />
            <Checkbox.Item
              label="Parking handicapé"
              status={accessibility.parking ? 'checked' : 'unchecked'}
              onPress={() => setAccessibility({ ...accessibility, parking: !accessibility.parking })}
            />
            <Checkbox.Item
              label="Toilettes adaptées"
              status={accessibility.toilets ? 'checked' : 'unchecked'}
              onPress={() => setAccessibility({ ...accessibility, toilets: !accessibility.toilets })}
            />
          </View>
        </View>

        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={isLoading}
          style={styles.submitButton}
          disabled={isLoading || !selectedPlace}
        >
          Publier l'avis
        </Button>
      </Surface>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  surface: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 4,
  },
  title: {
    marginBottom: 24,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  searchBar: {
    marginBottom: 8,
    elevation: 0,
  },
  searchResults: {
    marginTop: 8,
    borderRadius: 8,
    elevation: 4,
    maxHeight: 200,
  },
  searchResultItem: {
    borderBottomWidth: 1,
  },
  selectedPlace: {
    padding: 12,
    borderRadius: 8,
  },
  selectedPlaceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedPlaceInfo: {
    flex: 1,
    marginRight: 16,
  },
  ratingContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  rating: {
    paddingVertical: 8,
  },
  input: {
    // backgroundColor géré dynamiquement
  },
  photoButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  photoButton: {
    marginBottom: 0,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  photoContainer: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  removePhoto: {
    position: 'absolute',
    right: 8,
    top: 8,
    backgroundColor: 'rgba(255, 0, 0, 0.8)',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removePhotoText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  accessibilityGrid: {
    borderRadius: 8,
  },
  submitButton: {
    marginTop: 8,
  },
}); 