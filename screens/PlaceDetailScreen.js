import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, Surface, useTheme } from 'react-native-paper';
import { Rating } from 'react-native-ratings';
import ReviewCard from '../components/ReviewCard';
import { useTextSize } from '../theme/TextSizeContext';

const AccessibilityFeature = ({ label, available }) => {
  const { textSizes } = useTextSize();
  return (
    <View style={[styles.feature, available ? styles.featureAvailable : styles.featureUnavailable]}>
      <Text style={[styles.featureText, { fontSize: textSizes.body }]}>{label}</Text>
    </View>
  );
};

export default function PlaceDetailScreen({ navigation, route }) {
  const theme = useTheme();
  const { textSizes } = useTextSize();
  const [reviews] = useState([
    {
      id: 1,
      userName: 'Marie D.',
      userPhoto: null,
      rating: 4,
      date: '2024-03-15',
      comment: 'Très bon accueil, le personnel est attentif aux besoins des personnes à mobilité réduite.',
      photos: [],
    },
    {
      id: 2,
      userName: 'Pierre M.',
      userPhoto: null,
      rating: 5,
      date: '2024-03-10',
      comment: 'Parfaitement accessible en fauteuil roulant. Les allées sont larges et tout est bien pensé.',
      photos: [],
    },
  ]);

  const place = route.params?.place || {
    name: 'Lieu exemple',
    address: '123 rue de l\'Accessibilité',
    type: 'restaurant',
    rating: 4.5,
    accessibility: {
      ramp: true,
      elevator: true,
      parking: true,
      toilets: true,
    },
  };

  const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.headerSurface}>
        <Text style={[styles.title, { fontSize: textSizes.title }]}>
          {place.name}
        </Text>
        
        <Text style={[styles.address, { fontSize: textSizes.body }]}>
          {place.address}
        </Text>

        <View style={styles.ratingContainer}>
          <Rating
            readonly
            startingValue={averageRating}
            imageSize={24}
            style={styles.rating}
          />
          <Text style={{ fontSize: textSizes.body }}>
            {averageRating.toFixed(1)} ({reviews.length} avis)
          </Text>
        </View>
      </Surface>

      <Surface style={styles.section}>
        <Text style={[styles.sectionTitle, { fontSize: textSizes.subtitle }]}>
          Accessibilité
        </Text>
        <View style={styles.featuresGrid}>
          <AccessibilityFeature label="♿️ Rampe d'accès" available={place.accessibility.ramp} />
          <AccessibilityFeature label="🛗 Ascenseur" available={place.accessibility.elevator} />
          <AccessibilityFeature label="🅿️ Parking" available={place.accessibility.parking} />
          <AccessibilityFeature label="🚻 Toilettes adaptées" available={place.accessibility.toilets} />
        </View>
      </Surface>

      <Surface style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { fontSize: textSizes.subtitle }]}>
            Avis
          </Text>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('AddReview')}
            style={styles.addReviewButton}
            labelStyle={{ fontSize: textSizes.body }}
          >
            Ajouter un avis
          </Button>
        </View>

        <View style={styles.reviewsContainer}>
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </View>
      </Surface>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  headerSurface: {
    padding: 16,
    margin: 16,
    marginTop: 80,
    borderRadius: 12,
    elevation: 4,
  },
  section: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 4,
  },
  title: {
    marginBottom: 8,
  },
  address: {
    marginBottom: 16,
    opacity: 0.7,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rating: {
    marginRight: 8,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  feature: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: '48%',
  },
  featureAvailable: {
    backgroundColor: '#DCF7E3',
  },
  featureUnavailable: {
    backgroundColor: '#FEE2E2',
  },
  featureText: {
    fontWeight: '500',
  },
  reviewsContainer: {
    gap: 16,
  },
  addReviewButton: {
    marginLeft: 8,
  },
});
