/**
 * Écran d'affichage de l'historique des lieux ajoutés sur la carte
 * Permet de voir, filtrer et gérer les lieux qu'on a placés sur la carte
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert, Dimensions, FlatList, TouchableOpacity } from 'react-native';
import { 
  Card, 
  Title, 
  Text, 
  Button,
  Avatar,
  useTheme,
  IconButton,
  Chip,
  Divider,
  Surface
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomRating from '../components/CustomRating';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTextSize } from '../theme/TextSizeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { AccessibilityService } from '../services/accessibilityService';

const { width } = Dimensions.get('window');

// Catégories avec icônes
const categories = [
  { id: 'all', label: 'Tous', icon: 'view-list' },
  { id: 'restaurant', label: '🍽️ Restaurants', icon: 'food' },
  { id: 'culture', label: '🎭 Culture', icon: 'palette' },
  { id: 'shopping', label: '🛍️ Shopping', icon: 'shopping' },
  { id: 'health', label: '🏥 Santé', icon: 'hospital-building' },
  { id: 'sport', label: '🏃 Sport', icon: 'bike' },
];

export default function LocationHistoryScreen({ navigation }) {
  const theme = useTheme();
  const { textSizes } = useTextSize();
  
  const [mapPlaces, setMapPlaces] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState('recent'); // recent, name, rating, distance
  const [isLoading, setIsLoading] = useState(true);
  const [accessibilityPrefs, setAccessibilityPrefs] = useState({
    requireRamp: false,
    requireElevator: false,
    requireAccessibleParking: false,
    requireAccessibleToilets: false,
  });

  // Charger les lieux de la carte depuis AsyncStorage
  const loadMapPlaces = async () => {
    try {
      setIsLoading(true);
      const savedMarkers = await AsyncStorage.getItem('mapMarkers');
      if (savedMarkers) {
        const places = JSON.parse(savedMarkers);
        // Ajouter une date d'ajout si elle n'existe pas
        const placesWithDate = places.map(place => ({
          ...place,
          addedDate: place.addedDate || new Date().toISOString(),
          category: place.type || place.category || 'culture'
        }));
        setMapPlaces(placesWithDate);
      } else {
        setMapPlaces([]);
      }
      
      // Charger les préférences d'accessibilité
      const prefs = await AccessibilityService.loadAccessibilityPreferences();
      setAccessibilityPrefs(prefs);
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique:', error);
      setMapPlaces([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les données au montage et quand on revient sur l'écran
  useFocusEffect(
    useCallback(() => {
      loadMapPlaces();
    }, [])
  );

  // Fonction pour rafraîchir l'historique
  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadMapPlaces();
    setIsRefreshing(false);
  }, []);

  // Filtrer et trier les lieux
  const filteredAndSortedPlaces = useCallback(() => {
    let filtered = mapPlaces;

    // Filtrer par catégorie
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(place => 
        place.category === selectedCategory || 
        place.type === selectedCategory
      );
    }

    // Filtrer par préférences d'accessibilité
    filtered = filtered.filter(place => 
      AccessibilityService.meetsAccessibilityPreferences(place, accessibilityPrefs)
    );

    // Trier
    switch (sortBy) {
      case 'recent':
        return filtered.sort((a, b) => new Date(b.addedDate) - new Date(a.addedDate));
      case 'name':
        return filtered.sort((a, b) => a.name.localeCompare(b.name));
      case 'rating':
        return filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      default:
        return filtered;
    }
  }, [mapPlaces, selectedCategory, sortBy]);

  // Supprimer un lieu de l'historique
  const removePlaceFromHistory = async (placeId) => {
    try {
      const updatedPlaces = mapPlaces.filter(place => place.id !== placeId);
      setMapPlaces(updatedPlaces);
      await AsyncStorage.setItem('mapMarkers', JSON.stringify(updatedPlaces));
    } catch (error) {
      console.error('Erreur lors de la suppression du lieu:', error);
      Alert.alert('Erreur', 'Impossible de supprimer ce lieu');
    }
  };



  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const LocationCard = ({ place }) => {
    // Sécuriser toutes les valeurs texte
    const placeName = String(place?.name || 'Lieu sans nom');
    const placeAddress = String(place?.address || place?.vicinity || 'Adresse non disponible');
    const placeRating = place?.rating ? Number(place.rating) : null;
    const placeId = String(place?.id || '');
    const addedDate = place?.addedDate ? String(place.addedDate) : null;
    
    return (
      <Card style={[styles.placeCard, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <View style={styles.placeInfo}>
              <Text style={[styles.placeName, { fontSize: textSizes.title, fontWeight: 'bold', color: theme.colors.onSurface }]}>
                {placeName}
              </Text>
              <Text style={[styles.placeAddress, { fontSize: textSizes.caption, color: theme.colors.onSurfaceVariant }]}>
                {placeAddress}
              </Text>
              {addedDate && (
                <Text style={[styles.addedDate, { fontSize: textSizes.caption, color: theme.colors.onSurfaceVariant }]}>
                  Ajouté le {formatDate(addedDate)}
                </Text>
              )}
            </View>
            <IconButton
              icon="delete"
              size={20}
              onPress={() => removePlaceFromHistory(placeId)}
              iconColor={theme.colors.error}
            />
          </View>
          
          {placeRating && (
            <View style={styles.ratingContainer}>
              <CustomRating
                rating={placeRating}
                readonly={true}
                size={16}
                style={styles.rating}
              />
              <Text style={[styles.ratingText, { fontSize: textSizes.caption, color: theme.colors.onSurfaceVariant }]}>
                {placeRating.toFixed(1)}
              </Text>
            </View>
          )}
        </Card.Content>
        
        <Card.Actions>
          <Button 
            mode="outlined" 
            onPress={() => {
              console.log('🗺️ Clic sur "Voir sur la carte" pour:', placeName);
              
              try {
                // Approche 1: Retourner aux MainTabs puis naviguer vers Map
                console.log('🔄 Retour vers MainTabs puis Map');
                navigation.navigate('MainTabs', { 
                  screen: 'Map',
                  params: { centerOnPlace: place }
                });
                
                console.log('✅ Navigation vers Map réussie');
              } catch (error) {
                console.error('❌ Erreur navigation:', error);
                
                // Fallback: goBack puis navigation
                console.log('🔄 Fallback: goBack puis navigate');
                navigation.goBack();
                setTimeout(() => {
                  navigation.navigate('MainTabs', { screen: 'Map' });
                }, 200);
              }
            }}
            icon="map"
          >
            Voir sur la carte
          </Button>
          {place?.place_id && (
            <Button 
              mode="contained" 
              onPress={() => navigation.navigate('PlaceDetail', { place })}
            >
              Détails
            </Button>
          )}
        </Card.Actions>
      </Card>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons 
        name="map-marker-off" 
        size={80} 
        color={theme.colors.disabled} 
      />
      <Text style={[styles.emptyTitle, { fontWeight: 'bold', fontSize: 18, color: theme.colors.onBackground }]}>Aucun lieu dans l'historique</Text>
      <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
        Commencez à explorer et ajoutez des lieux sur la carte pour les voir apparaître ici !
      </Text>
      <Button 
        mode="contained" 
        onPress={() => {
          console.log('🗺️ Clic sur "Explorer la carte"');
          try {
            // Naviguer vers l'onglet Map
            navigation.navigate('MainTabs', { screen: 'Map' });
            console.log('✅ Navigation vers Map explorer réussie');
          } catch (error) {
            console.error('❌ Erreur navigation explorer:', error);
            // Fallback
            navigation.goBack();
            setTimeout(() => {
              navigation.navigate('MainTabs', { screen: 'Map' });
            }, 200);
          }
        }}
        style={styles.exploreButton}
      >
        Explorer la carte
      </Button>
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <MaterialCommunityIcons 
          name="map-marker" 
          size={50} 
          color={theme.colors.primary} 
        />
        <Text style={{ color: theme.colors.onBackground }}>Chargement de l'historique...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Liste des lieux */}
      {mapPlaces.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={filteredAndSortedPlaces()}
          renderItem={({ item }) => <LocationCard place={item} />}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={[styles.headerWrapper, { backgroundColor: theme.colors.surface }]}>
              <View style={styles.headerContent}>
                {/* Filtres par catégorie */}
                <View style={styles.categoriesSection}>
                  <Text style={[styles.sectionTitle, { fontSize: textSizes.body, color: theme.colors.onSurface }]}>
                    📂 Catégories
                  </Text>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    style={styles.categoriesContainer}
                    contentContainerStyle={styles.categoriesContent}
                  >
                    {categories.map(category => (
                      <TouchableOpacity
                        key={category.id}
                        onPress={() => setSelectedCategory(category.id)}
                        style={[
                          styles.categoryButton,
                          { borderColor: theme.colors.outline },
                          selectedCategory === category.id && {
                            backgroundColor: theme.colors.primary,
                            borderColor: theme.colors.primary,
                          }
                        ]}
                      >
                        <MaterialCommunityIcons
                          name={category.icon}
                          size={16}
                          color={selectedCategory === category.id ? theme.colors.onPrimary : theme.colors.onSurface}
                        />
                        <Text style={[
                          styles.categoryText,
                          { fontSize: textSizes.caption },
                          selectedCategory === category.id ? 
                            { color: theme.colors.onPrimary } : 
                            { color: theme.colors.onSurface }
                        ]}>
                          {category.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
                
                {/* Options de tri */}
                <View style={styles.sortSection}>
                  <Text style={[styles.sectionTitle, { fontSize: textSizes.body, color: theme.colors.onSurface }]}>
                    🔄 Trier par
                  </Text>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    style={styles.sortContainer}
                    contentContainerStyle={styles.sortContent}
                  >
                    <TouchableOpacity
                      onPress={() => setSortBy('recent')}
                      style={[
                        styles.sortButton,
                        { borderColor: theme.colors.outline },
                        sortBy === 'recent' && {
                          backgroundColor: theme.colors.primary,
                          borderColor: theme.colors.primary,
                        }
                      ]}
                    >
                      <MaterialCommunityIcons
                        name="clock-outline"
                        size={14}
                        color={sortBy === 'recent' ? theme.colors.onPrimary : theme.colors.onSurface}
                      />
                      <Text style={[
                        styles.sortText,
                        { fontSize: textSizes.caption },
                        sortBy === 'recent' ? 
                          { color: theme.colors.onPrimary } : 
                          { color: theme.colors.onSurface }
                      ]}>
                        Plus récents
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      onPress={() => setSortBy('name')}
                      style={[
                        styles.sortButton,
                        { borderColor: theme.colors.outline },
                        sortBy === 'name' && {
                          backgroundColor: theme.colors.primary,
                          borderColor: theme.colors.primary,
                        }
                      ]}
                    >
                      <MaterialCommunityIcons
                        name="sort-alphabetical-ascending"
                        size={14}
                        color={sortBy === 'name' ? theme.colors.onPrimary : theme.colors.onSurface}
                      />
                      <Text style={[
                        styles.sortText,
                        { fontSize: textSizes.caption },
                        sortBy === 'name' ? 
                          { color: theme.colors.onPrimary } : 
                          { color: theme.colors.onSurface }
                      ]}>
                        Nom
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      onPress={() => setSortBy('rating')}
                      style={[
                        styles.sortButton,
                        { borderColor: theme.colors.outline },
                        sortBy === 'rating' && {
                          backgroundColor: theme.colors.primary,
                          borderColor: theme.colors.primary,
                        }
                      ]}
                    >
                      <MaterialCommunityIcons
                        name="star-outline"
                        size={14}
                        color={sortBy === 'rating' ? theme.colors.onPrimary : theme.colors.onSurface}
                      />
                      <Text style={[
                        styles.sortText,
                        { fontSize: textSizes.caption },
                        sortBy === 'rating' ? 
                          { color: theme.colors.onPrimary } : 
                          { color: theme.colors.onSurface }
                      ]}>
                        Note
                      </Text>
                    </TouchableOpacity>
                  </ScrollView>
                </View>
              </View>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerWrapper: {
    padding: 16,
    marginBottom: 8,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  categoriesContainer: {
    marginBottom: 8,
  },
  categoryChip: {
    marginRight: 8,
  },
  sortContainer: {
    marginTop: 8,
  },
  sortChip: {
    marginRight: 8,
  },
  listContainer: {
    padding: 16,
  },
  placeCard: {
    marginBottom: 12,
    elevation: 2,
    borderRadius: 8, // Garder les coins arrondis mais pas d'overflow
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  placeInfo: {
    flex: 1,
  },
  placeName: {
    marginBottom: 4,
  },
  placeAddress: {
    marginBottom: 4,
  },
  addedDate: {
    fontStyle: 'italic',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  rating: {
    alignSelf: 'flex-start',
  },
  ratingText: {
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  exploreButton: {
    paddingHorizontal: 24,
  },
  categoriesSection: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  categoriesContent: {
    padding: 4,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: 16,
    marginRight: 6,
    backgroundColor: 'transparent',
  },
  categoryText: {
    marginLeft: 4,
    fontWeight: '500',
    fontSize: 12,
  },
  sortSection: {
    marginBottom: 12,
  },
  sortContent: {
    padding: 4,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: 16,
    marginRight: 6,
    backgroundColor: 'transparent',
  },
  sortText: {
    marginLeft: 4,
    fontWeight: '500',
    fontSize: 12,
  },
}); 