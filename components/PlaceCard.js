/**
 * Composant PlaceCard
 * Affiche les informations d'un lieu sous forme de carte
 * avec image, nom, adresse, note et icônes d'accessibilité
 */

import React from 'react';
import { View, StyleSheet, Image, Pressable } from 'react-native';
import { Surface, Text, useTheme } from 'react-native-paper';
import { Rating } from 'react-native-ratings';
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

  // Prépare la description d'accessibilité
  const getAccessibilityDescription = () => {
    const features = [];
    if (place.accessibility.ramp) features.push('rampe d\'accès');
    if (place.accessibility.elevator) features.push('ascenseur');
    if (place.accessibility.parking) features.push('parking accessible');
    if (place.accessibility.toilets) features.push('toilettes adaptées');
    
    return `${place.name}. ${place.address}. Note: ${place.rating} sur 5, ${place.reviewCount} avis. ${
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
      <Surface style={styles.card}>
        {/* Container de l'image */}
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

        {/* Contenu textuel et informations */}
        <View style={styles.content}>
          <Text 
            variant="titleMedium" 
            style={styles.title}
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
            <Rating
              readonly
              startingValue={place.rating}
              imageSize={16}
              style={styles.rating}
            />
            <Text variant="bodySmall" style={styles.reviewCount}>
              ({place.reviewCount})
            </Text>
          </View>

          {/* Icônes d'accessibilité */}
          <View style={styles.accessibilityContainer}>
            <AccessibilityIcon
              available={place.accessibility.ramp}
              icon="♿️"
              label="Rampe d'accès"
            />
            <AccessibilityIcon
              available={place.accessibility.elevator}
              icon="🛗"
              label="Ascenseur"
            />
            <AccessibilityIcon
              available={place.accessibility.parking}
              icon="🅿️"
              label="Parking accessible"
            />
            <AccessibilityIcon
              available={place.accessibility.toilets}
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
    flexDirection: 'row',
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
  },
  imageContainer: {
    width: 100,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 12,
  },
  title: {
    marginBottom: 4,
  },
  address: {
    marginBottom: 8,
    opacity: 0.7,
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
}); 