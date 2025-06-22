import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Linking, Alert } from 'react-native';
import { Text, Button, Surface, useTheme, Chip, Divider } from 'react-native-paper';
import CustomRating from '../components/CustomRating';
import { useTextSize } from '../theme/TextSizeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const AccessibilityFeature = ({ label, available }) => {
  const { textSizes } = useTextSize();
  const theme = useTheme();
  
  const getFeatureStyle = () => {
    if (available) {
      return {
        backgroundColor: theme.colors.primary + '20',
        borderColor: theme.colors.primary,
        borderWidth: 1,
      };
    } else {
      return {
        backgroundColor: theme.colors.error + '20',
        borderColor: theme.colors.error,
        borderWidth: 1,
      };
    }
  };

  return (
    <View style={[styles.feature, getFeatureStyle()]}>
      <Text style={[
        styles.featureText, 
        { 
          fontSize: textSizes.body,
          color: available ? theme.colors.primary : theme.colors.error
        }
      ]}>{label}</Text>
    </View>
  );
};

// Composant pour afficher un vrai avis Google
const GoogleReviewCard = ({ review }) => {
  const theme = useTheme();
  const { textSizes } = useTextSize();

  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Surface style={[styles.reviewCard, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewUser}>
          <View style={styles.userAvatar}>
            <Text style={[styles.userInitial, { color: theme.colors.primary }]}>
              {review.author_name.charAt(0)}
            </Text>
          </View>
          <View>
            <Text style={[styles.userName, { fontSize: textSizes.body, color: theme.colors.onSurface }]}>
              {review.author_name}
            </Text>
            <Text style={[styles.reviewDate, { fontSize: textSizes.caption, color: theme.colors.onSurface }]}>
              {formatDate(review.time)}
            </Text>
          </View>
        </View>
        <CustomRating
          rating={review.rating}
          readonly={true}
          size={16}
        />
      </View>
      
      <Text style={[styles.reviewText, { fontSize: textSizes.body, color: theme.colors.onSurface }]}>
        {review.text}
      </Text>
      
      {review.author_url && (
        <Text 
          style={[styles.reviewSource, { fontSize: textSizes.caption, color: theme.colors.primary }]}
          onPress={() => Linking.openURL(review.author_url)}
        >
          Voir sur Google
        </Text>
      )}
    </Surface>
  );
};

export default function PlaceDetailScreen({ navigation, route }) {
  const theme = useTheme();
  const { textSizes } = useTextSize();

  const place = route.params?.place || {
    name: 'Lieu exemple',
    address: '123 rue de l\'Accessibilité',
    type: 'restaurant',
    rating: 4.5,
    reviewCount: 0,
    reviews: [],
    accessibility: {
      ramp: false,
      elevator: false,
      parking: false,
      toilets: false,
    },
  };

  // S'assurer que place.accessibility existe
  const accessibility = place.accessibility || {
    ramp: false,
    elevator: false,
    parking: false,
    toilets: false,
  };

  // Utiliser les vrais avis Google ou fallback
  const realReviews = place.reviews || [];
  
  const handleCall = () => {
    if (place.phone) {
      Linking.openURL(`tel:${place.phone}`);
    } else {
      Alert.alert('Téléphone', 'Numéro de téléphone non disponible');
    }
  };

  const handleWebsite = () => {
    if (place.website) {
      Linking.openURL(place.website);
    } else {
      Alert.alert('Site web', 'Site web non disponible');
    }
  };

  const formatPriceLevel = (level) => {
    const prices = ['Gratuit', '€', '€€', '€€€', '€€€€'];
    return prices[level] || 'Non renseigné';
  };

  const formatOpeningHours = (openingHours) => {
    if (!openingHours || !openingHours.weekday_text) {
      return 'Horaires non disponibles';
    }
    return openingHours.weekday_text;
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* En-tête principal */}
      <Surface style={styles.headerSurface}>
        <Text style={[styles.title, { fontSize: textSizes.title, color: theme.colors.onSurface }]}>
          {place.reviewCount ? `${place.reviewCount} avis Google` : 'Aucun avis Google'}
        </Text>
        
        <Text style={[styles.address, { fontSize: textSizes.body, color: theme.colors.onSurface }]}>
          {place.address}
        </Text>

        <View style={styles.ratingContainer}>
          <CustomRating
            rating={place.rating}
            readonly={true}
            size={24}
            style={styles.rating}
          />
          <Text style={{ fontSize: textSizes.body, color: theme.colors.onSurface }}>
            {place.rating ? place.rating.toFixed(1) : '0'}
          </Text>
        </View>

        {/* Informations pratiques */}
        <View style={styles.infoContainer}>
          {place.phone && (
            <Button 
              mode="outlined" 
              icon="phone" 
              onPress={handleCall}
              style={styles.infoButton}
            >
              Appeler
            </Button>
          )}
          
          {place.website && (
            <Button 
              mode="outlined" 
              icon="web" 
              onPress={handleWebsite}
              style={styles.infoButton}
            >
              Site web
            </Button>
          )}
        </View>

        {/* Niveau de prix */}
        {place.priceLevel !== undefined && (
          <View style={styles.priceContainer}>
            <Text style={{ fontSize: textSizes.body, color: theme.colors.onSurface }}>
              Prix : {formatPriceLevel(place.priceLevel)}
            </Text>
          </View>
        )}
      </Surface>

      {/* Horaires d'ouverture */}
      {place.openingHours && (
        <Surface style={styles.section}>
          <Text style={[styles.sectionTitle, { fontSize: textSizes.subtitle, color: theme.colors.onSurface }]}>
            Horaires d'ouverture
          </Text>
          
          {place.openingHours.open_now !== undefined && (
            <Chip 
              icon={place.openingHours.open_now ? "check-circle" : "clock-alert"}
              style={[
                styles.statusChip,
                { backgroundColor: place.openingHours.open_now ? '#4CAF50' : '#FF9800' }
              ]}
            >
              {place.openingHours.open_now ? 'Ouvert maintenant' : 'Fermé maintenant'}
            </Chip>
          )}
          
          {place.openingHours.weekday_text && (
            <View style={styles.hoursContainer}>
              {place.openingHours.weekday_text.map((day, index) => (
                <Text key={index} style={[styles.dayText, { fontSize: textSizes.body, color: theme.colors.onSurface }]}>
                  {day}
                </Text>
              ))}
            </View>
          )}
        </Surface>
      )}

      {/* Accessibilité */}
      <Surface style={styles.section}>
        <Text style={[styles.sectionTitle, { fontSize: textSizes.subtitle, color: theme.colors.onSurface }]}>
          Accessibilité
        </Text>
        <View style={styles.featuresGrid}>
          <AccessibilityFeature label="♿️ Rampe d'accès" available={accessibility?.ramp || false} />
          <AccessibilityFeature label="🛗 Ascenseur" available={accessibility?.elevator || false} />
          <AccessibilityFeature label="🅿️ Parking" available={accessibility?.parking || false} />
          <AccessibilityFeature label="🚻 Toilettes adaptées" available={accessibility?.toilets || false} />
        </View>
        <Text style={[styles.accessibilityNote, { fontSize: textSizes.caption, color: theme.colors.onSurface }]}>
          * Informations basées sur les avis et le type d'établissement
        </Text>
      </Surface>

      {/* Vrais avis Google */}
      <Surface style={styles.section}>
        <Text style={[styles.sectionTitle, { fontSize: textSizes.subtitle, color: theme.colors.onSurface }]}>
          Avis Google ({realReviews.length})
        </Text>

        {realReviews.length > 0 ? (
          <View style={styles.reviewsContainer}>
            {realReviews.map((review, index) => (
              <GoogleReviewCard key={`${review.author_name}-${index}`} review={review} />
            ))}
          </View>
        ) : (
          <Text style={[styles.noReviews, { fontSize: textSizes.body, color: theme.colors.onSurface }]}>
            Aucun avis disponible pour ce lieu.
          </Text>
        )}
      </Surface>

      {/* Bouton d'ajout d'avis */}
      <Surface style={styles.section}>
        <Button
          mode="contained"
          icon="plus"
          onPress={() => navigation.navigate('AddReview', { place })}
          style={styles.addReviewButton}
        >
          Ajouter mon avis AccessPlus
        </Button>
      </Surface>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    fontWeight: 'bold',
  },
  address: {
    marginBottom: 16,
    opacity: 0.7,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  rating: {
    marginRight: 8,
  },
  infoContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  infoButton: {
    flex: 1,
  },
  priceContainer: {
    marginTop: 8,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  statusChip: {
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  hoursContainer: {
    gap: 4,
  },
  dayText: {
    paddingVertical: 2,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  feature: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: '48%',
  },
  featureText: {
    fontWeight: '500',
  },
  accessibilityNote: {
    fontStyle: 'italic',
    opacity: 0.7,
  },
  reviewsContainer: {
    gap: 16,
  },
  reviewCard: {
    padding: 16,
    borderRadius: 8,
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reviewUser: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInitial: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  userName: {
    fontWeight: '600',
  },
  reviewDate: {
    opacity: 0.7,
  },
  reviewText: {
    lineHeight: 20,
    marginBottom: 8,
  },
  reviewSource: {
    textDecorationLine: 'underline',
  },
  noReviews: {
    textAlign: 'center',
    fontStyle: 'italic',
    opacity: 0.7,
    paddingVertical: 20,
  },
  addReviewButton: {
    marginTop: 8,
  },
});
