/**
 * Écran d'affichage des avis de l'utilisateur
 * Permet à l'utilisateur de voir tous ses avis postés et de les gérer
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
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
import { Rating } from 'react-native-ratings';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTextSize } from '../theme/TextSizeContext';

// Données d'exemple des avis de l'utilisateur
const sampleReviews = [
  {
    id: '1',
    placeName: 'Restaurant Le Jardin Accessible',
    placeAddress: '15 rue de la Paix, Paris',
    rating: 4.5,
    comment: 'Excellent restaurant avec une rampe d\'accès parfaite et des toilettes adaptées. Le personnel est très accueillant et attentif aux besoins spécifiques. Je recommande vivement !',
    date: '2024-03-15',
    accessibility: {
      ramp: true,
      elevator: false,
      parking: true,
      toilets: true
    },
    photos: [],
    helpful: 8,
    replies: 2
  },
  {
    id: '2',
    placeName: 'Cinéma Gaumont Opéra',
    placeAddress: '2 bd des Capucines, Paris',
    rating: 3.0,
    comment: 'Cinema moderne avec ascenseur, mais les places handicapées sont limitées. Il faut réserver à l\'avance. L\'accès est correct mais peut être amélioré.',
    date: '2024-03-10',
    accessibility: {
      ramp: true,
      elevator: true,
      parking: false,
      toilets: true
    },
    photos: [],
    helpful: 5,
    replies: 1
  },
  {
    id: '3',
    placeName: 'Musée d\'Orsay',
    placeAddress: '1 rue de la Légion d\'Honneur, Paris',
    rating: 5.0,
    comment: 'Musée exceptionnellement bien adapté ! Ascenseurs, rampes, audioguides adaptés, personnel formé. Une référence en matière d\'accessibilité culturelle.',
    date: '2024-02-28',
    accessibility: {
      ramp: true,
      elevator: true,
      parking: true,
      toilets: true
    },
    photos: [],
    helpful: 15,
    replies: 0
  },
  {
    id: '4',
    placeName: 'Pharmacie du Centre',
    placeAddress: '45 avenue Jean Jaurès, Lyon',
    rating: 2.0,
    comment: 'Malheureusement, l\'entrée a une marche qui rend l\'accès difficile en fauteuil. Le personnel est aidant mais les aménagements sont insuffisants.',
    date: '2024-02-20',
    accessibility: {
      ramp: false,
      elevator: false,
      parking: false,
      toilets: false
    },
    photos: [],
    helpful: 3,
    replies: 1
  }
];

export default function MyReviewsScreen({ navigation }) {
  const theme = useTheme();
  const { textSizes } = useTextSize();
  
  const [reviews, setReviews] = useState(sampleReviews);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState('recent'); // recent, oldest, rating

  // Fonction pour rafraîchir les avis
  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    // Simuler le chargement des données depuis le serveur
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  }, []);

  // Fonction pour trier les avis
  const sortedReviews = useCallback(() => {
    const sorted = [...reviews];
    switch (sortBy) {
      case 'recent':
        return sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
      case 'rating':
        return sorted.sort((a, b) => b.rating - a.rating);
      default:
        return sorted;
    }
  }, [reviews, sortBy]);

  // Fonction pour supprimer un avis
  const handleDeleteReview = useCallback((reviewId) => {
    Alert.alert(
      "Supprimer l'avis",
      "Êtes-vous sûr de vouloir supprimer cet avis ? Cette action est irréversible.",
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Supprimer", 
          style: "destructive",
          onPress: () => {
            setReviews(prev => prev.filter(review => review.id !== reviewId));
            Alert.alert("Succès", "Votre avis a été supprimé");
          }
        }
      ]
    );
  }, []);

  // Fonction pour modifier un avis
  const handleEditReview = useCallback((review) => {
    // TODO: Navigation vers l'écran d'édition d'avis
    Alert.alert("Fonctionnalité à venir", "L'édition d'avis sera disponible prochainement");
  }, []);

  // Formater la date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Obtenir la couleur selon la note
  const getRatingColor = (rating) => {
    if (rating >= 4) return '#4CAF50';
    if (rating >= 3) return '#FF9800';
    return '#F44336';
  };

  // Composant pour afficher les équipements d'accessibilité
  const AccessibilityFeatures = ({ accessibility }) => (
    <View style={styles.accessibilityContainer}>
      <Text style={[styles.accessibilityTitle, { fontSize: textSizes.caption }]}>
        Équipements accessibles :
      </Text>
      <View style={styles.featuresRow}>
        {accessibility.ramp && <Chip style={styles.featureChip} textStyle={styles.featureText}>♿ Rampe</Chip>}
        {accessibility.elevator && <Chip style={styles.featureChip} textStyle={styles.featureText}>🛗 Ascenseur</Chip>}
        {accessibility.parking && <Chip style={styles.featureChip} textStyle={styles.featureText}>🅿️ Parking</Chip>}
        {accessibility.toilets && <Chip style={styles.featureChip} textStyle={styles.featureText}>🚻 Toilettes</Chip>}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* En-tête avec statistiques */}
      <Surface style={[styles.headerSurface, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.headerContent}>
          <View style={styles.statContainer}>
            <Text style={[styles.statNumber, { fontSize: textSizes.title }]}>
              {reviews.length}
            </Text>
            <Text style={[styles.statLabel, { fontSize: textSizes.body }]}>
              Avis publiés
            </Text>
          </View>
          
          <View style={styles.statContainer}>
            <Text style={[styles.statNumber, { fontSize: textSizes.title }]}>
              {(reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)}
            </Text>
            <Text style={[styles.statLabel, { fontSize: textSizes.body }]}>
              Note moyenne
            </Text>
          </View>
          
          <View style={styles.statContainer}>
            <Text style={[styles.statNumber, { fontSize: textSizes.title }]}>
              {reviews.reduce((sum, review) => sum + review.helpful, 0)}
            </Text>
            <Text style={[styles.statLabel, { fontSize: textSizes.body }]}>
              Votes utiles
            </Text>
          </View>
        </View>
      </Surface>

      {/* Options de tri */}
      <View style={styles.sortContainer}>
        <Text style={[styles.sortLabel, { fontSize: textSizes.body }]}>Trier par :</Text>
        <View style={styles.sortButtons}>
          <Chip 
            selected={sortBy === 'recent'} 
            onPress={() => setSortBy('recent')}
            style={styles.sortChip}
            textStyle={{ fontSize: textSizes.caption }}
          >
            📅 Récents
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
            selected={sortBy === 'oldest'} 
            onPress={() => setSortBy('oldest')}
            style={styles.sortChip}
            textStyle={{ fontSize: textSizes.caption }}
          >
            🕐 Anciens
          </Chip>
        </View>
      </View>

      {/* Liste des avis */}
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        {sortedReviews().map((review) => (
          <Card key={review.id} style={styles.reviewCard}>
            <Card.Content>
              {/* En-tête de l'avis */}
              <View style={styles.reviewHeader}>
                <View style={styles.placeInfo}>
                  <Title style={[styles.placeName, { fontSize: textSizes.subtitle }]}>
                    {review.placeName}
                  </Title>
                  <Text style={[styles.placeAddress, { fontSize: textSizes.caption }]}>
                    {review.placeAddress}
                  </Text>
                </View>
                <View style={styles.reviewActions}>
                  <IconButton
                    icon="pencil"
                    size={20}
                    onPress={() => handleEditReview(review)}
                  />
                  <IconButton
                    icon="delete"
                    size={20}
                    iconColor="#F44336"
                    onPress={() => handleDeleteReview(review.id)}
                  />
                </View>
              </View>

              {/* Note et date */}
              <View style={styles.ratingContainer}>
                <Rating
                  type="star"
                  ratingCount={5}
                  imageSize={20}
                  readonly
                  startingValue={review.rating}
                  style={styles.rating}
                  tintColor={theme.colors.surface}
                />
                <Text style={[styles.ratingText, { 
                  fontSize: textSizes.body,
                  color: getRatingColor(review.rating)
                }]}>
                  {review.rating}/5
                </Text>
                <Text style={[styles.dateText, { fontSize: textSizes.caption }]}>
                  • {formatDate(review.date)}
                </Text>
              </View>

              {/* Commentaire */}
              <Text style={[styles.commentText, { fontSize: textSizes.body }]}>
                {review.comment}
              </Text>

              {/* Équipements d'accessibilité */}
              <AccessibilityFeatures accessibility={review.accessibility} />

              <Divider style={styles.divider} />

              {/* Statistiques de l'avis */}
              <View style={styles.reviewStats}>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { fontSize: textSizes.caption }]}>
                    👍 {review.helpful} utile{review.helpful > 1 ? 's' : ''}
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { fontSize: textSizes.caption }]}>
                    💬 {review.replies} réponse{review.replies > 1 ? 's' : ''}
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        ))}

        {reviews.length === 0 && (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Text style={[styles.emptyText, { fontSize: textSizes.title }]}>
                📝
              </Text>
              <Title style={[styles.emptyTitle, { fontSize: textSizes.subtitle }]}>
                Aucun avis pour le moment
              </Title>
              <Text style={[styles.emptyDescription, { fontSize: textSizes.body }]}>
                Commencez à partager votre expérience en ajoutant votre premier avis !
              </Text>
              <Button 
                mode="contained" 
                onPress={() => navigation.navigate('AddReview')}
                style={styles.addButton}
                icon="plus"
              >
                Ajouter un avis
              </Button>
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
    color: '#4CAF50',
  },
  statLabel: {
    color: '#666',
    marginTop: 4,
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
  sortButtons: {
    flexDirection: 'row',
    flex: 1,
  },
  sortChip: {
    marginRight: 8,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  reviewCard: {
    marginBottom: 16,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  placeInfo: {
    flex: 1,
  },
  placeName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  placeAddress: {
    color: '#666',
  },
  reviewActions: {
    flexDirection: 'row',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  rating: {
    alignSelf: 'flex-start',
  },
  ratingText: {
    marginLeft: 8,
    fontWeight: 'bold',
  },
  dateText: {
    marginLeft: 8,
    color: '#666',
  },
  commentText: {
    lineHeight: 22,
    marginBottom: 16,
  },
  accessibilityContainer: {
    marginBottom: 16,
  },
  accessibilityTitle: {
    fontWeight: '500',
    marginBottom: 8,
    color: '#666',
  },
  featuresRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  featureChip: {
    backgroundColor: '#E8F5E8',
  },
  featureText: {
    fontSize: 12,
    color: '#2E7D32',
  },
  divider: {
    marginBottom: 12,
  },
  reviewStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
  },
  statValue: {
    color: '#666',
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
  addButton: {
    paddingHorizontal: 24,
  },
}); 