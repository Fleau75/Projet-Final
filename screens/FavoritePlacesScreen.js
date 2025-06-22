/**
 * Écran d'affichage des lieux favoris de l'utilisateur
 * Permet à l'utilisateur de voir et gérer ses lieux sauvegardés
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert, Dimensions } from 'react-native';
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
  Surface,
  Searchbar
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomRating from '../components/CustomRating';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTextSize } from '../theme/TextSizeContext';

const { width } = Dimensions.get('window');

// Données d'exemple des lieux favoris
const sampleFavorites = [
  {
    id: '1',
    name: 'Restaurant Le Jardin Accessible',
    address: '15 rue de la Paix, 75001 Paris',
    category: 'restaurant',
    rating: 4.5,
    reviewCount: 128,
    distance: '0.8 km',
    accessibility: {
      ramp: true,
      elevator: false,
      parking: true,
      toilets: true,
      level: 'full'
    },
    description: 'Restaurant gastronomique avec excellente accessibilité',
    phone: '01 42 86 87 88',
    website: 'www.jardin-accessible.fr',
    openNow: true,
    savedDate: '2024-03-15',
    lastVisited: '2024-03-10',
    myRating: 5,
    myNote: 'Parfait pour un dîner en famille, très accessible !'
  },
  {
    id: '2',
    name: 'Cinéma Gaumont Opéra',
    address: '2 boulevard des Capucines, 75009 Paris',
    category: 'culture',
    rating: 4.2,
    reviewCount: 89,
    distance: '1.2 km',
    accessibility: {
      ramp: true,
      elevator: true,
      parking: false,
      toilets: true,
      level: 'partial'
    },
    description: 'Cinéma moderne avec équipements adaptés',
    phone: '08 92 69 66 96',
    website: 'www.cinemasgaumont.com',
    openNow: true,
    savedDate: '2024-03-08',
    lastVisited: null,
    myRating: 4,
    myNote: 'Bon cinéma, pensez à réserver les places handicapées à l\'avance'
  },
  {
    id: '3',
    name: 'Musée d\'Orsay',
    address: '1 rue de la Légion d\'Honneur, 75007 Paris',
    category: 'culture',
    rating: 4.8,
    reviewCount: 245,
    distance: '2.1 km',
    accessibility: {
      ramp: true,
      elevator: true,
      parking: true,
      toilets: true,
      level: 'full'
    },
    description: 'Musée d\'art impressionniste entièrement accessible',
    phone: '01 40 49 48 14',
    website: 'www.musee-orsay.fr',
    openNow: false,
    savedDate: '2024-02-28',
    lastVisited: '2024-02-25',
    myRating: 5,
    myNote: 'Référence en matière d\'accessibilité culturelle !'
  },
  {
    id: '4',
    name: 'Centre Commercial Beaugrenelle',
    address: '12 rue Linois, 75015 Paris',
    category: 'shopping',
    rating: 4.0,
    reviewCount: 156,
    distance: '3.5 km',
    accessibility: {
      ramp: true,
      elevator: true,
      parking: true,
      toilets: true,
      level: 'full'
    },
    description: 'Centre commercial moderne avec tous les équipements',
    phone: '01 45 75 35 15',
    website: 'www.beaugrenelle-paris.com',
    openNow: true,
    savedDate: '2024-02-20',
    lastVisited: '2024-03-05',
    myRating: 4,
    myNote: 'Très bien équipé, parking adapté facile d\'accès'
  },
  {
    id: '5',
    name: 'Pharmacie Centrale',
    address: '25 avenue des Champs-Élysées, 75008 Paris',
    category: 'health',
    rating: 3.8,
    reviewCount: 67,
    distance: '1.8 km',
    accessibility: {
      ramp: true,
      elevator: false,
      parking: false,
      toilets: false,
      level: 'partial'
    },
    description: 'Pharmacie accessible avec personnel formé',
    phone: '01 42 25 78 90',
    website: null,
    openNow: true,
    savedDate: '2024-02-15',
    lastVisited: '2024-03-01',
    myRating: 4,
    myNote: 'Personnel très aidant et compréhensif'
  }
];

// Catégories avec icônes
const categories = [
  { id: 'all', label: 'Tous', icon: '🏢' },
  { id: 'restaurant', label: 'Restaurants', icon: '🍽️' },
  { id: 'culture', label: 'Culture', icon: '🎭' },
  { id: 'shopping', label: 'Shopping', icon: '🛍️' },
  { id: 'health', label: 'Santé', icon: '🏥' },
  { id: 'sport', label: 'Sport', icon: '🏃' },
];

export default function FavoritePlacesScreen({ navigation }) {
  const theme = useTheme();
  const { textSizes } = useTextSize();
  
  const [favorites, setFavorites] = useState(sampleFavorites);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState('recent'); // recent, name, rating, distance

  // Fonction pour rafraîchir les favoris
  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    // Simuler le chargement des données depuis le serveur
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  }, []);

  // Filtrer et trier les favoris
  const filteredAndSortedFavorites = useCallback(() => {
    let filtered = favorites;

    // Filtrer par recherche
    if (searchQuery) {
      filtered = filtered.filter(place =>
        place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        place.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtrer par catégorie
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(place => place.category === selectedCategory);
    }

    // Trier
    switch (sortBy) {
      case 'recent':
        return filtered.sort((a, b) => new Date(b.savedDate) - new Date(a.savedDate));
      case 'name':
        return filtered.sort((a, b) => a.name.localeCompare(b.name));
      case 'rating':
        return filtered.sort((a, b) => b.rating - a.rating);
      case 'distance':
        return filtered.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
      default:
        return filtered;
    }
  }, [favorites, searchQuery, selectedCategory, sortBy]);

  // Fonction pour supprimer un favori
  const handleRemoveFavorite = useCallback((placeId) => {
    Alert.alert(
      "Retirer des favoris",
      "Voulez-vous retirer ce lieu de vos favoris ?",
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Retirer", 
          style: "destructive",
          onPress: () => {
            setFavorites(prev => prev.filter(place => place.id !== placeId));
            Alert.alert("Succès", "Le lieu a été retiré de vos favoris");
          }
        }
      ]
    );
  }, []);

  // Fonction pour naviguer vers les détails
  const handleViewDetails = useCallback((place) => {
    navigation.navigate('PlaceDetail', { place });
  }, [navigation]);

  // Obtenir l'icône de catégorie
  const getCategoryIcon = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.icon : '🏢';
  };

  // Obtenir le niveau d'accessibilité
  const getAccessibilityLevel = (accessibility) => {
    // Vérifier si accessibility existe
    if (!accessibility) {
      return { level: 'Accessibilité limitée', color: '#F44336', icon: '⚠️' };
    }
    
    const features = [accessibility.ramp, accessibility.elevator, accessibility.parking, accessibility.toilets];
    const trueCount = features.filter(Boolean).length;
    
    if (trueCount === 4) return { level: 'Totalement accessible', color: '#4CAF50', icon: '♿' };
    if (trueCount >= 2) return { level: 'Partiellement accessible', color: '#FF9800', icon: '⚡' };
    return { level: 'Accessibilité limitée', color: '#F44336', icon: '⚠️' };
  };

  // Formater la date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      day: 'numeric',
      month: 'short',
      year: 'numeric' 
    });
  };

  // Composant FavoriteCard
  const FavoriteCard = ({ place }) => {
    const accessibilityInfo = getAccessibilityLevel(place.accessibility);
    
    return (
      <Card style={styles.favoriteCard}>
        <Card.Content>
          {/* En-tête */}
          <View style={styles.cardHeader}>
            <View style={styles.placeInfo}>
              <View style={styles.titleRow}>
                <Text style={styles.categoryIcon}>
                  {getCategoryIcon(place.category)}
                </Text>
                <Title style={[styles.placeName, { fontSize: textSizes.subtitle }]} numberOfLines={1}>
                  {place.name}
                </Title>
              </View>
              <Text style={[styles.placeAddress, { fontSize: textSizes.caption }]} numberOfLines={1}>
                {place.address}
              </Text>
            </View>
            <IconButton
              icon="heart"
              iconColor="#E91E63"
              size={24}
              onPress={() => handleRemoveFavorite(place.id)}
            />
          </View>

          {/* Informations */}
          <View style={styles.infoRow}>
                          <View style={styles.ratingContainer}>
                <CustomRating
                  rating={place.rating}
                  readonly={true}
                  size={16}
                  style={styles.rating}
                />
                <Text style={[styles.ratingText, { fontSize: textSizes.caption }]}>
                  {place.rating} ({place.reviewCount})
                </Text>
              </View>
            <Text style={[styles.distance, { fontSize: textSizes.caption }]}>
              📍 {place.distance}
            </Text>
          </View>

          {/* Accessibilité */}
          <View style={styles.accessibilityRow}>
            <Chip 
              icon={() => <Text>{accessibilityInfo.icon}</Text>}
              style={[styles.accessibilityChip, { backgroundColor: accessibilityInfo.color + '20' }]}
              textStyle={[styles.accessibilityText, { color: accessibilityInfo.color }]}
            >
              {accessibilityInfo.level}
            </Chip>
            {place.openNow && (
              <Chip style={styles.openChip} textStyle={styles.openText}>
                🟢 Ouvert
              </Chip>
            )}
          </View>

          {/* Ma note personnelle */}
          {place.myNote && (
            <View style={styles.noteContainer}>
              <Text style={[styles.noteLabel, { fontSize: textSizes.caption }]}>Ma note :</Text>
              <Text style={[styles.noteText, { fontSize: textSizes.caption }]}>"{place.myNote}"</Text>
            </View>
          )}

          {/* Informations supplémentaires */}
          <View style={styles.metaInfo}>
            <Text style={[styles.metaText, { fontSize: textSizes.caption }]}>
              💾 Ajouté le {formatDate(place.savedDate)}
            </Text>
            {place.lastVisited && (
              <Text style={[styles.metaText, { fontSize: textSizes.caption }]}>
                🕐 Dernière visite le {formatDate(place.lastVisited)}
              </Text>
            )}
          </View>
        </Card.Content>

        <Card.Actions>
          <Button 
            mode="outlined" 
            onPress={() => handleViewDetails(place)}
            style={styles.actionButton}
            labelStyle={{ fontSize: textSizes.caption }}
            icon="information"
          >
            Détails
          </Button>
          {place.phone && (
            <Button 
              mode="text" 
              onPress={() => Alert.alert("Appel", `Appeler ${place.phone} ?`)}
              style={styles.actionButton}
              labelStyle={{ fontSize: textSizes.caption }}
              icon="phone"
            >
              Appeler
            </Button>
          )}
        </Card.Actions>
      </Card>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* En-tête avec statistiques */}
      <Surface style={[styles.headerSurface, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.headerContent}>
          <View style={styles.statContainer}>
            <Text style={[styles.statNumber, { fontSize: textSizes.title }]}>
              {favorites.length}
            </Text>
            <Text style={[styles.statLabel, { fontSize: textSizes.body }]}>
              Lieux favoris
            </Text>
          </View>
          
          <View style={styles.statContainer}>
            <Text style={[styles.statNumber, { fontSize: textSizes.title }]}>
              {(favorites.reduce((sum, place) => sum + place.rating, 0) / favorites.length).toFixed(1)}
            </Text>
            <Text style={[styles.statLabel, { fontSize: textSizes.body }]}>
              Note moyenne
            </Text>
          </View>
          
          <View style={styles.statContainer}>
            <Text style={[styles.statNumber, { fontSize: textSizes.title }]}>
              {favorites.filter(place => place.lastVisited).length}
            </Text>
            <Text style={[styles.statLabel, { fontSize: textSizes.body }]}>
              Déjà visités
            </Text>
          </View>
        </View>
      </Surface>

      {/* Barre de recherche */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Rechercher dans mes favoris..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
      </View>

      {/* Filtres par catégorie */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categories}
      >
        {categories.map(category => (
          <Chip
            key={category.id}
            selected={selectedCategory === category.id}
            onPress={() => setSelectedCategory(category.id)}
            style={styles.categoryChip}
            textStyle={{ fontSize: textSizes.caption }}
            icon={() => <Text>{category.icon}</Text>}
          >
            {category.label}
          </Chip>
        ))}
      </ScrollView>

      {/* Options de tri */}
      <View style={styles.sortContainer}>
        <Text style={[styles.sortLabel, { fontSize: textSizes.body }]}>Trier par :</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sortScroll}>
          <Chip 
            selected={sortBy === 'recent'} 
            onPress={() => setSortBy('recent')}
            style={styles.sortChip}
            textStyle={{ fontSize: textSizes.caption }}
          >
            📅 Récents
          </Chip>
          <Chip 
            selected={sortBy === 'name'} 
            onPress={() => setSortBy('name')}
            style={styles.sortChip}
            textStyle={{ fontSize: textSizes.caption }}
          >
            🔤 Nom
          </Chip>
          <Chip 
            selected={sortBy === 'rating'} 
            onPress={() => setSortBy('rating')}
            style={styles.sortChip}
            textStyle={{ fontSize: textSizes.caption }}
          >
            ⭐ Note
          </Chip>
          <Chip 
            selected={sortBy === 'distance'} 
            onPress={() => setSortBy('distance')}
            style={styles.sortChip}
            textStyle={{ fontSize: textSizes.caption }}
          >
            📍 Distance
          </Chip>
        </ScrollView>
      </View>

      {/* Liste des favoris */}
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        {filteredAndSortedFavorites().map((place) => (
          <FavoriteCard key={place.id} place={place} />
        ))}

        {filteredAndSortedFavorites().length === 0 && (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Text style={[styles.emptyText, { fontSize: textSizes.title }]}>
                {searchQuery || selectedCategory !== 'all' ? '🔍' : '❤️'}
              </Text>
              <Title style={[styles.emptyTitle, { fontSize: textSizes.subtitle }]}>
                {searchQuery || selectedCategory !== 'all' 
                  ? 'Aucun résultat trouvé'
                  : 'Aucun lieu favori'
                }
              </Title>
              <Text style={[styles.emptyDescription, { fontSize: textSizes.body }]}>
                {searchQuery || selectedCategory !== 'all'
                  ? 'Essayez d\'ajuster vos filtres de recherche'
                  : 'Commencez à explorer et ajoutez vos premiers lieux favoris !'
                }
              </Text>
              {!searchQuery && selectedCategory === 'all' && (
                <Button 
                  mode="contained" 
                  onPress={() => navigation.navigate('Home')}
                  style={styles.exploreButton}
                  icon="map-search"
                >
                  Explorer les lieux
                </Button>
              )}
            </Card.Content>
          </Card>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerSurface: {
    margin: 16,
    borderRadius: 12,
    elevation: 4,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
  },
  statContainer: {
    alignItems: 'center',
  },
  statNumber: {
    fontWeight: 'bold',
    color: '#E91E63',
  },
  statLabel: {
    color: '#666',
    marginTop: 4,
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  searchBar: {
    elevation: 0,
    borderRadius: 12,
  },
  categoriesContainer: {
    paddingLeft: 16,
    marginBottom: 8,
  },
  categories: {
    paddingRight: 16,
    gap: 8,
  },
  categoryChip: {
    marginRight: 8,
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sortLabel: {
    marginRight: 12,
    fontWeight: '500',
  },
  sortScroll: {
    flex: 1,
  },
  sortChip: {
    marginRight: 8,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  favoriteCard: {
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  placeInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  placeName: {
    fontWeight: 'bold',
    flex: 1,
  },
  placeAddress: {
    color: '#666',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    alignSelf: 'flex-start',
  },
  ratingText: {
    marginLeft: 4,
    color: '#666',
  },
  distance: {
    color: '#666',
  },
  accessibilityRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  accessibilityChip: {
    paddingHorizontal: 8,
  },
  accessibilityText: {
    fontSize: 12,
    fontWeight: '500',
  },
  openChip: {
    backgroundColor: '#E8F5E8',
  },
  openText: {
    fontSize: 12,
    color: '#2E7D32',
  },
  noteContainer: {
    backgroundColor: '#F5F5F5',
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  noteLabel: {
    fontWeight: '500',
    color: '#666',
    marginBottom: 2,
  },
  noteText: {
    fontStyle: 'italic',
    color: '#333',
  },
  metaInfo: {
    gap: 2,
  },
  metaText: {
    color: '#999',
  },
  actionButton: {
    marginRight: 8,
  },
  emptyCard: {
    marginTop: 32,
  },
  emptyContent: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyDescription: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 24,
  },
  exploreButton: {
    paddingHorizontal: 24,
  },
}); 