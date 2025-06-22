/**
 * Composant PlaceCard
 * Affiche les informations d'un lieu sous forme de carte
 * avec image, nom, adresse, note et icônes d'accessibilité
 */

import React from 'react';
import { View, StyleSheet, Image, Pressable } from 'react-native';
import { Surface, Text, useTheme } from 'react-native-paper';
import CustomRating from './CustomRating';
import { useScreenReader } from '../theme/ScreenReaderContext';

/**
 * Composant pour afficher une icône d'accessibilité
 * @param {Object} props - Les propriétés du composant
 * @param {boolean} props.available - Si la fonctionnalité est disponible
 * @param {string} props.icon - L'emoji à afficher
 * @param {string} props.label - Le libellé de la fonctionnalité
 */
const AccessibilityIcon = ({ available, icon, label }) => {
  const theme = useTheme();
  return (
    <View 
      style={[
        styles.accessibilityIcon,
        { backgroundColor: available ? '#DCF7E3' : '#FEE2E2' }
      ]}
      accessible={true}
      accessibilityLabel={`${label} ${available ? 'disponible' : 'non disponible'}`}
    >
      <Text>{icon}</Text>
    </View>
  );
};

/**
 * Composant principal PlaceCard
 * @param {Object} props - Les propriétés du composant
 * @param {Object} props.place - Les données du lieu à afficher
 * @param {Function} props.onPress - Fonction appelée lors du clic sur la carte
 */
export default function PlaceCard({ place, onPress }) {
  const theme = useTheme();
  const { isScreenReaderEnabled } = useScreenReader();

  // Fonction pour formater la distance
  const formatDistance = (distance) => {
    if (!distance && distance !== 0) return '';
    
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    } else {
      return `${distance.toFixed(1)}km`;
    }
  };

  // Prépare la description d'accessibilité
  const getAccessibilityDescription = () => {
    const features = [];
    
    // Vérifier si place.accessibility existe
    if (place.accessibility) {
      if (place.accessibility.ramp) features.push('rampe d\'accès');
      if (place.accessibility.elevator) features.push('ascenseur');
      if (place.accessibility.parking) features.push('parking accessible');
      if (place.accessibility.toilets) features.push('toilettes adaptées');
    }
    
    const distanceText = place.distance !== undefined ? ` Distance: ${formatDistance(place.distance)}.` : '';
    
    return `${place.name}. ${place.address}.${distanceText} Note: ${place.rating} sur 5, ${place.reviewCount} avis. ${
      features.length > 0 
        ? `Équipements accessibles: ${features.join(', ')}.` 
        : 'Aucun équipement d\'accessibilité signalé.'
    }`;
  };

  return (
    <Pressable 
      onPress={onPress}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={getAccessibilityDescription()}
    >
      <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        {/* Container de l'image - maintenant en haut */}
        <View style={styles.imageContainer}>
          {place.image ? (
            <Image 
              source={{ uri: place.image }} 
              style={styles.image}
              accessible={true}
              accessibilityLabel={`Photo de ${place.name}`}
            />
          ) : (
            <View 
              style={[styles.placeholderImage, { backgroundColor: theme.colors.surfaceVariant }]}
              accessible={true}
              accessibilityLabel="Pas de photo disponible"
            >
              <Text variant="headlineMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                {place.name[0]}
              </Text>
            </View>
          )}
        </View>

        {/* Contenu textuel et informations - maintenant en dessous */}
        <View style={styles.content}>
          <Text 
            variant="titleMedium" 
            style={[styles.title, { color: theme.colors.onSurface }]}
            accessible={true}
            accessibilityRole="header"
          >
            {place.name}
          </Text>
          
          <Text 
            variant="bodySmall" 
            style={styles.address}
            accessible={true}
            accessibilityLabel={`Adresse: ${place.address}`}
          >
            {place.address}
          </Text>

          {/* Note et nombre d'avis */}
          <View 
            style={styles.ratingContainer}
            accessible={true}
            accessibilityLabel={`Note: ${place.rating} sur 5, ${place.reviewCount} avis`}
          >
            <CustomRating
              rating={place.rating}
              readonly={true}
              size={16}
              style={styles.rating}
            />
            <Text variant="bodySmall" style={styles.reviewCount}>
              ({place.reviewCount})
            </Text>
          </View>

          {/* Distance */}
          {place.distance !== undefined && (
            <View 
              style={styles.distanceContainer}
              accessible={true}
              accessibilityLabel={`Distance: ${formatDistance(place.distance)}`}
            >
              <Text style={[styles.distanceText, { color: theme.colors.primary }]}>
                📍 {formatDistance(place.distance)}
              </Text>
            </View>
          )}

          {/* Icônes d'accessibilité */}
          <View style={styles.accessibilityContainer}>
            <AccessibilityIcon
              available={place.accessibility?.ramp || false}
              icon="♿️"
              label="Rampe d'accès"
            />
            <AccessibilityIcon
              available={place.accessibility?.elevator || false}
              icon="🛗"
              label="Ascenseur"
            />
            <AccessibilityIcon
              available={place.accessibility?.parking || false}
              icon="🅿️"
              label="Parking accessible"
            />
            <AccessibilityIcon
              available={place.accessibility?.toilets || false}
              icon="🚻"
              label="Toilettes adaptées"
            />
          </View>
        </View>
      </Surface>
    </Pressable>
  );
}

/**
 * Styles du composant
 */
const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  imageContainer: {
    width: '100%',
    height: 180, // Hauteur plus importante pour l'image
    overflow: 'hidden', // Déplacé ici pour éviter le warning Surface
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  title: {
    marginBottom: 6,
    fontWeight: 'bold',
    fontSize: 16,
  },
  address: {
    marginBottom: 10,
    opacity: 0.7,
    fontSize: 13,
    lineHeight: 18,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  rating: {
    marginRight: 4,
  },
  reviewCount: {
    opacity: 0.7,
  },
  accessibilityContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  accessibilityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  distanceContainer: {
    marginBottom: 12,
  },
  distanceText: {
    fontSize: 13,
    opacity: 0.7,
  },
}); 