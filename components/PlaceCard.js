/**
 * Composant PlaceCard
 * Affiche les informations d'un lieu sous forme de carte
 * avec image, nom, adresse, note et icônes d'accessibilité
 */

import React from 'react';
import { View, StyleSheet, Image, Pressable } from 'react-native';
import { Surface, Text, useTheme } from 'react-native-paper';
import { Rating } from 'react-native-ratings';

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
    <View style={[
      styles.accessibilityIcon,
      { backgroundColor: available ? '#DCF7E3' : '#FEE2E2' }
    ]}>
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

  return (
    <Pressable onPress={onPress}>
      <Surface style={styles.card}>
        {/* Container de l'image */}
        <View style={styles.imageContainer}>
          {place.image ? (
            <Image source={{ uri: place.image }} style={styles.image} />
          ) : (
            <View style={[styles.placeholderImage, { backgroundColor: theme.colors.surfaceVariant }]}>
              <Text variant="headlineMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                {place.name[0]}
              </Text>
            </View>
          )}
        </View>

        {/* Contenu textuel et informations */}
        <View style={styles.content}>
          <Text variant="titleMedium" style={styles.title}>
            {place.name}
          </Text>
          
          <Text variant="bodySmall" style={styles.address}>
            {place.address}
          </Text>

          {/* Note et nombre d'avis */}
          <View style={styles.ratingContainer}>
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
              label="Rampe"
            />
            <AccessibilityIcon
              available={place.accessibility.elevator}
              icon="🛗"
              label="Ascenseur"
            />
            <AccessibilityIcon
              available={place.accessibility.parking}
              icon="🅿️"
              label="Parking"
            />
            <AccessibilityIcon
              available={place.accessibility.toilets}
              icon="🚻"
              label="Toilettes"
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