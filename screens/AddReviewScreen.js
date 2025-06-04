import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, Surface, Checkbox, useTheme } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { Rating } from 'react-native-ratings';

export default function AddReviewScreen({ navigation }) {
  const theme = useTheme();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [photos, setPhotos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [accessibility, setAccessibility] = useState({
    ramp: false,
    elevator: false,
    parking: false,
    toilets: false,
  });

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
    <ScrollView style={styles.container}>
      <Surface style={styles.surface}>
        <Text variant="headlineMedium" style={styles.title}>
          Évaluer ce lieu
        </Text>

        <View style={styles.ratingContainer}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Note globale
          </Text>
          <Rating
            type="star"
            ratingCount={5}
            imageSize={40}
            onFinishRating={setRating}
            style={styles.rating}
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
            style={styles.input}
          />
        </View>

        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Photos
          </Text>
          <Button
            mode="contained-tonal"
            onPress={pickImage}
            icon="camera"
            style={styles.photoButton}
          >
            Ajouter des photos
          </Button>
          
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
          <View style={styles.accessibilityGrid}>
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
          disabled={isLoading}
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
    backgroundColor: '#F1F5F9',
  },
  surface: {
    margin: 16,
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
  ratingContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  rating: {
    paddingVertical: 8,
  },
  input: {
    backgroundColor: 'white',
  },
  photoButton: {
    marginBottom: 16,
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
    backgroundColor: 'white',
    borderRadius: 8,
  },
  submitButton: {
    marginTop: 8,
  },
}); 