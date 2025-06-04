import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Title, Paragraph } from 'react-native-paper';
import { AccessibilityIcon } from './AccessibilityIcons';

export default function PlaceCard({ place, onPress }) {
  const getPlaceTypeIcon = () => {
    switch (place.type.toLowerCase()) {
      case 'restaurant':
        return 'restaurant';
      case 'pharmacie':
        return 'pharmacy';
      case 'parc':
        return 'park';
      case 'cinéma':
        return 'cinema';
      default:
        return 'map-marker';
    }
  };

  const formatDistance = (distance) => {
    if (typeof distance === 'number') {
      return distance >= 1000 
        ? `${(distance / 1000).toFixed(1)} km`
        : `${distance}m`;
    }
    return distance; // Si c'est déjà formaté
  };

  return (
    <Card style={styles.card} onPress={onPress}>
      <Card.Content style={styles.content}>
        <View style={styles.header}>
          <AccessibilityIcon
            type={getPlaceTypeIcon()}
            size={24}
            color="#4169E1"
          />
          <View style={styles.titleContainer}>
            <Title style={styles.title}>{place.name}</Title>
            <Paragraph style={styles.distance}>
              {formatDistance(place.accessibility.distance)}
            </Paragraph>
          </View>
        </View>

        <View style={styles.features}>
          {place.accessibility.ramp && (
            <AccessibilityIcon type="ramp" size={20} />
          )}
          {place.accessibility.adaptedToilets && (
            <AccessibilityIcon type="toilet" size={20} />
          )}
          {place.accessibility.elevator && (
            <AccessibilityIcon type="elevator" size={20} />
          )}
          {place.accessibility.widePaths && (
            <AccessibilityIcon type="wide-path" size={20} />
          )}
          {place.accessibility.adaptedBenches && (
            <AccessibilityIcon type="bench" size={20} />
          )}
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    elevation: 4,
  },
  content: {
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  distance: {
    fontSize: 14,
    color: '#666',
  },
  features: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 12,
  },
}); 