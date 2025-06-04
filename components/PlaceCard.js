import React from 'react';
import { View, StyleSheet, Image, Pressable } from 'react-native';
import { Surface, Text, useTheme } from 'react-native-paper';
import { Rating } from 'react-native-ratings';

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

export default function PlaceCard({ place, onPress }) {
  const theme = useTheme();

  return (
    <Pressable onPress={onPress}>
      <Surface style={styles.card}>
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

        <View style={styles.content}>
          <Text variant="titleMedium" style={styles.title}>
            {place.name}
          </Text>
          
          <Text variant="bodySmall" style={styles.address}>
            {place.address}
          </Text>

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