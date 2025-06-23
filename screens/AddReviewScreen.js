import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, Alert, Linking } from 'react-native';
import { Text, TextInput, Button, Surface, Checkbox, useTheme, Searchbar, List } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import CustomRating from '../components/CustomRating';
import { searchPlaces } from '../services/placesSearch';
import { useAppTheme } from '../theme/ThemeContext';
import { useTextSize } from '../theme/TextSizeContext';
import { useAuth } from '../theme/AuthContext';
import { ReviewsService } from '../services/firebaseService';
import { AccessibilityService } from '../services/accessibilityService';

export default function AddReviewScreen({ navigation, route }) {
  const theme = useTheme();
  const { isDarkMode } = useAppTheme();
  const { textSizes } = useTextSize();
  const { user } = useAuth();
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
      // Vérifier d'abord si la permission est déjà accordée
      let { status } = await ImagePicker.getCameraPermissionsAsync();
      
      if (status !== 'granted') {
        const { status: newStatus } = await ImagePicker.requestCameraPermissionsAsync();
        status = newStatus;
      }
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission requise',
          'Nous avons besoin de votre permission pour accéder à l\'appareil photo. Veuillez l\'activer dans les paramètres de votre appareil.',
          [
            { text: 'Annuler', style: 'cancel' },
            { text: 'Paramètres', onPress: () => Linking.openSettings() }
          ]
        );
        return;
      }

      // Utiliser la nouvelle API sans MediaTypeOptions déprécié
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        mediaTypes: 'Images', // Nouvelle syntaxe
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setPhotos([...photos, result.assets[0].uri]);
      }
    } catch (error) {
      console.error('❌ Erreur lors de la prise de photo:', error);
      Alert.alert(
        'Erreur', 
        'Impossible d\'accéder à l\'appareil photo. Veuillez vérifier les permissions et réessayer.',
        [{ text: 'OK' }]
      );
    }
  };

  // Fonction pour choisir une photo depuis la galerie
  const pickImage = async () => {
    try {
      // Essayer directement d'ouvrir la galerie (contournement iOS)
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'Images',
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setPhotos([...photos, result.assets[0].uri]);
      }
    } catch (error) {
      console.error('❌ Erreur lors de la sélection de l\'image:', error);
      
      // Si l'erreur est liée aux permissions, essayer une approche alternative
      if (error.message?.includes('permission') || error.message?.includes('denied')) {
        try {
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: 'Images',
            allowsEditing: false, // Désactiver l'édition
            quality: 0.5, // Qualité réduite
            allowsMultipleSelection: false,
          });
          
          if (!result.canceled && result.assets && result.assets.length > 0) {
            setPhotos([...photos, result.assets[0].uri]);
            return;
          }
        } catch (alternativeError) {
          console.error('❌ Tentative alternative échouée:', alternativeError);
        }
      }
      
      Alert.alert(
        'Erreur', 
        'Impossible d\'accéder à la galerie. Veuillez réessayer.',
        [{ text: 'OK' }]
      );
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
      // 1. Upload des photos si il y en a
      let imageUrls = [];
      if (photos.length > 0) {
        try {
          imageUrls = await ReviewsService.uploadMultipleImages(photos, 'reviews');
        } catch (uploadError) {
          // Continuer sans les images plutôt que d'échouer complètement
          imageUrls = [];
        }
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
        userId: user?.uid || 'anonymous',
        userName: user?.name || 'Utilisateur AccessPlus',
      };

      // 3. Sauvegarder l'avis dans Firestore
      const reviewId = await ReviewsService.addReview(reviewData, user?.uid);

      // 4. Afficher le succès et retourner
      Alert.alert(
        'Succès !', 
        'Votre avis a été publié avec succès. Merci pour votre contribution !',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );

    } catch (error) {
      console.error('❌ Erreur lors de la soumission:', error);
      
      let errorMessage = 'Une erreur est survenue lors de la publication de votre avis. Veuillez réessayer.';
      
      // Messages d'erreur plus spécifiques
      if (error.message?.includes('Firebase Storage')) {
        errorMessage = 'Impossible d\'uploader les images. Votre avis sera publié sans photos.';
      } else if (error.message?.includes('network')) {
        errorMessage = 'Problème de connexion. Vérifiez votre connexion internet et réessayez.';
      } else if (error.message?.includes('permission')) {
        errorMessage = 'Vous n\'avez pas les permissions nécessaires. Contactez l\'administrateur.';
      }
      
      Alert.alert(
        'Erreur', 
        errorMessage,
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        {/* Section Lieu */}
        <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.cardHeader}>
            <Text variant="titleMedium" style={[styles.cardTitle, { fontSize: textSizes.title, color: theme.colors.onSurface }]}>
              📍 Lieu à évaluer
            </Text>
          </View>
          
          {!selectedPlace ? (
            <View>
              <Searchbar
                placeholder="Rechercher un lieu..."
                onChangeText={setSearchQuery}
                value={searchQuery}
                style={[styles.searchBar, { backgroundColor: theme.colors.surfaceVariant }]}
                loading={isSearching}
                iconColor={theme.colors.primary}
              />
              
              {searchResults.length > 0 && (
                <Surface style={[styles.searchResults, { backgroundColor: theme.colors.surfaceVariant }]}>
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
                      style={styles.searchResultItem}
                      titleStyle={{ fontSize: textSizes.body, color: theme.colors.onSurface }}
                      descriptionStyle={{ fontSize: textSizes.caption, color: theme.colors.onSurfaceVariant }}
                    />
                  ))}
                </Surface>
              )}
            </View>
          ) : (
            <View style={[styles.selectedPlaceCard, { backgroundColor: theme.colors.primaryContainer }]}>
              <View style={styles.selectedPlaceContent}>
                <View style={styles.selectedPlaceInfo}>
                  <Text variant="titleMedium" style={[styles.selectedPlaceName, { fontSize: textSizes.title, color: theme.colors.onPrimaryContainer }]}>
                    {selectedPlace.name}
                  </Text>
                  <Text variant="bodySmall" style={[styles.selectedPlaceAddress, { fontSize: textSizes.caption, color: theme.colors.onPrimaryContainer }]}>
                    {selectedPlace.address}
                  </Text>
                </View>
                <Button
                  mode="text"
                  onPress={() => {
                    setSelectedPlace(null);
                    setSearchQuery('');
                  }}
                  textColor={theme.colors.primary}
                  compact
                >
                  Changer
                </Button>
              </View>
            </View>
          )}
        </Surface>

        {/* Section Note */}
        <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.cardHeader}>
            <Text variant="titleMedium" style={[styles.cardTitle, { fontSize: textSizes.title, color: theme.colors.onSurface }]}>
              ⭐ Note globale
            </Text>
          </View>
          
          <View style={styles.ratingSection}>
            <CustomRating
              rating={rating}
              readonly={false}
              onRatingChange={setRating}
              size={40}
              style={styles.customRating}
            />
            <Text style={[styles.ratingText, { fontSize: textSizes.body, color: theme.colors.onSurfaceVariant }]}>
              {rating > 0 ? `${rating}/5 étoiles` : 'Sélectionnez une note'}
            </Text>
          </View>
        </Surface>

        {/* Section Commentaire */}
        <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.cardHeader}>
            <Text variant="titleMedium" style={[styles.cardTitle, { fontSize: textSizes.title, color: theme.colors.onSurface }]}>
              💬 Votre avis
            </Text>
          </View>
          
          <TextInput
            label="Partagez votre expérience..."
            value={comment}
            onChangeText={setComment}
            mode="outlined"
            multiline
            numberOfLines={4}
            style={[styles.commentInput, { backgroundColor: theme.colors.surfaceVariant }]}
            theme={{
              colors: {
                primary: theme.colors.primary,
                background: theme.colors.surfaceVariant,
                surface: theme.colors.surfaceVariant,
                text: theme.colors.onSurface,
                placeholder: theme.colors.onSurfaceVariant,
              }
            }}
          />
        </Surface>

        {/* Section Photos */}
        <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.cardHeader}>
            <Text variant="titleMedium" style={[styles.cardTitle, { fontSize: textSizes.title, color: theme.colors.onSurface }]}>
              📸 Photos (optionnel)
            </Text>
          </View>
          
          <View style={styles.photoButtons}>
            <Button
              mode="outlined"
              onPress={takePhoto}
              icon="camera"
              style={[styles.photoButton, { borderColor: theme.colors.primary }]}
              textColor={theme.colors.primary}
            >
              Appareil photo
            </Button>
            <Button
              mode="outlined"
              onPress={pickImage}
              icon="image"
              style={[styles.photoButton, { borderColor: theme.colors.primary }]}
              textColor={theme.colors.primary}
            >
              Galerie
            </Button>
          </View>
          
          {photos.length > 0 && (
            <View style={styles.photoGrid}>
              {photos.map((photo, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.photoContainer}
                  onPress={() => removePhoto(index)}
                >
                  <Image source={{ uri: photo }} style={styles.photo} />
                  <View style={[styles.removePhoto, { backgroundColor: theme.colors.error }]}>
                    <Text style={[styles.removePhotoText, { color: theme.colors.onError }]}>×</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </Surface>

        {/* Section Accessibilité */}
        <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.cardHeader}>
            <Text variant="titleMedium" style={[styles.cardTitle, { fontSize: textSizes.title, color: theme.colors.onSurface }]}>
              ♿ Équipements accessibles
            </Text>
          </View>
          
          <View style={styles.accessibilityGrid}>
            <Checkbox.Item
              label="Rampe d'accès"
              status={accessibility.ramp ? 'checked' : 'unchecked'}
              onPress={() => setAccessibility({ ...accessibility, ramp: !accessibility.ramp })}
              color={theme.colors.primary}
              labelStyle={{ fontSize: textSizes.body, color: theme.colors.onSurface }}
            />
            <Checkbox.Item
              label="Ascenseur"
              status={accessibility.elevator ? 'checked' : 'unchecked'}
              onPress={() => setAccessibility({ ...accessibility, elevator: !accessibility.elevator })}
              color={theme.colors.primary}
              labelStyle={{ fontSize: textSizes.body, color: theme.colors.onSurface }}
            />
            <Checkbox.Item
              label="Parking handicapé"
              status={accessibility.parking ? 'checked' : 'unchecked'}
              onPress={() => setAccessibility({ ...accessibility, parking: !accessibility.parking })}
              color={theme.colors.primary}
              labelStyle={{ fontSize: textSizes.body, color: theme.colors.onSurface }}
            />
            <Checkbox.Item
              label="Toilettes adaptées"
              status={accessibility.toilets ? 'checked' : 'unchecked'}
              onPress={() => setAccessibility({ ...accessibility, toilets: !accessibility.toilets })}
              color={theme.colors.primary}
              labelStyle={{ fontSize: textSizes.body, color: theme.colors.onSurface }}
            />
          </View>
        </Surface>

        {/* Bouton de soumission */}
        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={isLoading}
          style={[styles.submitButton, { backgroundColor: theme.colors.primary }]}
          disabled={isLoading || !selectedPlace || rating === 0 || !comment.trim()}
          labelStyle={[styles.submitButtonLabel, { fontSize: textSizes.body }]}
          buttonColor={theme.colors.primary}
        >
          {isLoading ? 'Publication en cours...' : 'Publier mon avis'}
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardHeader: {
    marginBottom: 16,
  },
  cardTitle: {
    fontWeight: '600',
  },
  searchBar: {
    marginBottom: 8,
    elevation: 0,
    borderRadius: 8,
  },
  searchResults: {
    marginTop: 8,
    borderRadius: 8,
    elevation: 2,
    maxHeight: 200,
  },
  searchResultItem: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  selectedPlaceCard: {
    padding: 16,
    borderRadius: 8,
  },
  selectedPlaceContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedPlaceInfo: {
    flex: 1,
    marginRight: 16,
  },
  selectedPlaceName: {
    fontWeight: '600',
    marginBottom: 4,
  },
  selectedPlaceAddress: {
    opacity: 0.8,
  },
  ratingSection: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  customRating: {
    marginVertical: 16,
  },
  ratingText: {
    textAlign: 'center',
    marginTop: 8,
  },
  commentInput: {
    marginTop: 8,
  },
  photoButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  photoButton: {
    flex: 1,
    borderRadius: 8,
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
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  removePhoto: {
    position: 'absolute',
    right: 8,
    top: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  removePhotoText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  accessibilityGrid: {
    borderRadius: 8,
  },
  submitButton: {
    marginTop: 24,
    marginBottom: 32,
    paddingVertical: 12,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  submitButtonLabel: {
    fontWeight: '600',
  },
}); 