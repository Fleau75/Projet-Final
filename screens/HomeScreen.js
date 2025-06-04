import React, { useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Searchbar, Title, Paragraph } from 'react-native-paper';
import PlaceCard from '../components/PlaceCard';
import { AccessibilityIcon } from '../components/AccessibilityIcons';

export default function HomeScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');

  const recentPlaces = [
    {
      id: 1,
      name: 'Restaurant Le Bon Vivant',
      type: 'restaurant',
      accessibility: {
        distance: 350,
        ramp: true,
        adaptedToilets: true,
        elevator: false,
        widePaths: true,
      }
    },
    {
      id: 2,
      name: 'Pharmacie Centrale',
      type: 'pharmacie',
      accessibility: {
        distance: 500,
        ramp: true,
        adaptedToilets: false,
        elevator: false,
        widePaths: true,
      }
    },
    {
      id: 3,
      name: 'Parc des Lilas',
      type: 'parc',
      accessibility: {
        distance: 700,
        ramp: true,
        adaptedToilets: false,
        widePaths: true,
        adaptedBenches: true,
      }
    },
    {
      id: 4,
      name: 'Cinéma Lumière',
      type: 'cinéma',
      accessibility: {
        distance: 1100,
        ramp: true,
        adaptedToilets: true,
        elevator: true,
        widePaths: true,
      }
    },
  ];

  const categories = [
    {
      id: 'restaurants',
      icon: 'restaurant',
      title: 'Restaurants',
      count: 15,
    },
    {
      id: 'commerces',
      icon: 'pharmacy',
      title: 'Commerces',
      count: 28,
    },
    {
      id: 'loisirs',
      icon: 'cinema',
      title: 'Loisirs',
      count: 8,
    },
    {
      id: 'services',
      icon: 'office-building',
      title: 'Services',
      count: 12,
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.welcomeText}>Bonjour 👋</Title>
        <Paragraph style={styles.subtitle}>
          Trouvez des lieux accessibles autour de vous
        </Paragraph>
      </View>

      <Searchbar
        placeholder="Rechercher un lieu..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />

      <View style={styles.categoriesContainer}>
        <Title style={styles.sectionTitle}>Catégories</Title>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map((category) => (
            <View key={category.id} style={styles.categoryCard}>
              <AccessibilityIcon type={category.icon} size={32} />
              <Title style={styles.categoryTitle}>{category.title}</Title>
              <Paragraph style={styles.categoryCount}>{category.count} lieux</Paragraph>
            </View>
          ))}
        </ScrollView>
      </View>

      <View style={styles.placesContainer}>
        <Title style={styles.sectionTitle}>Lieux accessibles à proximité</Title>
        {recentPlaces.map((place) => (
          <PlaceCard
            key={place.id}
            place={place}
            onPress={() => navigation.navigate('PlaceDetail', { place })}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    paddingTop: 24,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  searchBar: {
    margin: 16,
    elevation: 4,
  },
  categoriesContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 16,
    marginBottom: 12,
  },
  categoryCard: {
    backgroundColor: 'white',
    padding: 16,
    marginLeft: 16,
    marginRight: 8,
    borderRadius: 12,
    width: 140,
    alignItems: 'center',
    elevation: 4,
  },
  categoryTitle: {
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
  },
  categoryCount: {
    color: '#666',
  },
  placesContainer: {
    marginBottom: 24,
  },
});
