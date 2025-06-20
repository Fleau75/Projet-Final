import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { Text, TextInput, Button, Surface, Checkbox, useTheme, Searchbar, List } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import CustomRating from '../components/CustomRating';
import { searchPlaces } from '../services/placesSearch';
import { useAppTheme } from '../theme/ThemeContext';
import { useTextSize } from '../theme/TextSizeContext';
import { ReviewsService } from '../services/firebaseService';
import { AccessibilityService } from '../services/accessibilityService';

export default function AddReviewScreen({ navigation, route }) {
  const theme = useTheme();
  const { isDarkMode } = useAppTheme();
  const { textSizes } = useTextSize();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [photos, setPhotos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(route.params?.place || null);
  const [isSearching, setIsSearching] = useState(false);
  const [accessibility, setAccessibility] = useState({
    ramp: false,
    elevator: false,
    parking: false,
    toilets: false,
  });
  const [accessibilityPrefs, setAccessibilityPrefs] = useState({
    requireRamp: false,
    requireElevator: false,
    requireAccessibleParking: false,
    requireAccessibleToilets: false,
  });

  // Effet pour afficher le lieu pré-sélectionné et charger les préférences
  useEffect(() => {
    if (route.params?.place) {
      console.log('🏠 Lieu pré-sélectionné:', route.params.place.name);
    }
    
    // Charger les préférences d'accessibilité
    const loadPrefs = async () => {
      const prefs = await AccessibilityService.loadAccessibilityPreferences();
      setAccessibilityPrefs(prefs);
    };
    loadPrefs();
  }, [route.params?.place]);

  // Effet pour la recherche de lieux
  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (searchQuery.length >= 3 && !selectedPlace) {
        setIsSearching(true);
        try {
          const results = await searchPlaces(searchQuery);
          
          // Filtrer les résultats selon les préférences d'accessibilité
          const filteredResults = results.filter(place => 
            AccessibilityService.meetsAccessibilityPreferences(place, accessibilityPrefs)
          );
          
          setSearchResults(filteredResults);
          console.log(`🔍 AddReview: ${results.length} résultats trouvés, ${filteredResults.length} après filtrage d'accessibilité`);
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
  }, [searchQuery, selectedPlace]);

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
      Alert.alert('Erreur', 'Veuillez sélectionner un lieu');
      return;
    }

    if (rating === 0) {
      Alert.alert('Erreur', 'Veuillez donner une note');
      return;
    }

    if (!comment.trim()) {
      Alert.alert('Erreur', 'Veuillez ajouter un commentaire');
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('🚀 Début de la soumission de l\'avis...');
      
      // 1. Upload des photos si il y en a
      let imageUrls = [];
      if (photos.length > 0) {
        console.log(`📸 Upload de ${photos.length} photos...`);
        imageUrls = await ReviewsService.uploadMultipleImages(photos, 'reviews');
        console.log('✅ Photos uploadées:', imageUrls);
      }

      // 2. Préparer les données de l'avis
      const reviewData = {
        placeId: selectedPlace.id,
        placeName: selectedPlace.name,
        placeAddress: selectedPlace.address,
        rating: rating,
        comment: comment.trim(),
        photos: imageUrls,
        accessibility: accessibility,
        userId: 'anonymous', // TODO: Remplacer par l'ID utilisateur réel quand l'auth sera complète
        userName: 'Utilisateur AccessPlus', // TODO: Remplacer par le nom utilisateur réel
      };

      console.log('📝 Données de l\'avis:', reviewData);

      // 3. Sauvegarder l'avis dans Firestore
      const reviewId = await ReviewsService.addReview(reviewData);
      console.log('✅ Avis sauvegardé avec l\'ID:', reviewId);

      // 4. Afficher le succès et retourner
      Alert.alert(
        'Succès !', 
        'Votre avis a été publié avec succès. Merci pour votre contribution !',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );

    } catch (error) {
      console.error('❌ Erreur lors de la soumission:', error);
      Alert.alert(
        'Erreur', 
        'Une erreur est survenue lors de la publication de votre avis. Veuillez réessayer.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Surface style={[styles.surface, { backgroundColor: theme.colors.surface }]}>
        {/* Bouton Annuler en haut */}
        <View style={styles.headerContainer}>
          <Button
            mode="text"
            onPress={() => navigation.goBack()}
            icon="arrow-left"
            style={styles.cancelButton}
            labelStyle={{ fontSize: textSizes.body }}
          >
            Annuler
          </Button>
        </View>

        <Text variant="headlineMedium" style={[styles.title, { fontSize: textSizes.headline }]}>
          Évaluer un lieu
        </Text>

        {/* Sélection du lieu */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={[styles.sectionTitle, { fontSize: textSizes.title }]}>
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
          <Text variant="titleMedium" style={[styles.sectionTitle, { fontSize: textSizes.title }]}>
            Note globale
          </Text>
          <CustomRating
            rating={rating}
            readonly={false}
            onRatingChange={setRating}
            size={30}
            style={styles.customRating}
          />
          <Text style={{ marginTop: 10, textAlign: 'center' }}>
            Note sélectionnée: {rating}/5
          </Text>
        </View>

        <View style={styles.section}>
          <Text variant="titleMedium" style={[styles.sectionTitle, { fontSize: textSizes.title }]}>
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
          <Text variant="titleMedium" style={[styles.sectionTitle, { fontSize: textSizes.title }]}>
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
          <Text variant="titleMedium" style={[styles.sectionTitle, { fontSize: textSizes.title }]}>
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
          disabled={isLoading || !selectedPlace || rating === 0 || !comment.trim()}
          labelStyle={{ fontSize: textSizes.body }}
        >
          {isLoading ? 'Publication en cours...' : 'Publier l\'avis'}
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
  customRating: {
    alignSelf: 'center',
    marginVertical: 10,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 16,
  },
  cancelButton: {
    alignSelf: 'flex-start',
  },
}); 