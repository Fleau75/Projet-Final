/**
 * Écran de profil utilisateur
 * Affiche les informations de l'utilisateur et ses préférences d'accessibilité
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { 
  Avatar, 
  Card, 
  Title, 
  Paragraph, 
  List, 
  Divider, 
  Button,
  Text,
  useTheme 
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTextSize } from '../theme/TextSizeContext';
import { useFocusEffect } from '@react-navigation/native';
import { ReviewsService } from '../services/firebaseService';

export default function ProfileScreen({ navigation, route }) {
  const theme = useTheme();
  const { textSizes } = useTextSize();
  
  const [userInfo, setUserInfo] = useState({
    name: 'Utilisateur AccessPlus',
    email: 'user@accessplus.com',
    phone: '',
    bio: '',
    location: '',
    reviewCount: 0,
    favoritePlaces: 0,
    joinDate: 'Mars 2024',
    averageRating: 0
  });

  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // Charger le profil depuis AsyncStorage
  const loadProfile = useCallback(async () => {
    try {
      const savedProfile = await AsyncStorage.getItem('userProfile');
      if (savedProfile) {
        const profileData = JSON.parse(savedProfile);
        setUserInfo(prev => ({
          ...prev,
          ...profileData
        }));
      }
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
    }
  }, []);

  // Charger les statistiques réelles depuis Firebase ET AsyncStorage
  const loadUserStats = useCallback(async () => {
    setIsLoadingStats(true);
    try {
      const userId = 'anonymous'; // TODO: Remplacer par l'ID utilisateur réel
      
      // 🔥 Charger les avis Firebase
      const reviews = await ReviewsService.getReviewsByUserId(userId);
      
      // 🗺️ Charger les lieux ajoutés depuis AsyncStorage
      const savedMarkers = await AsyncStorage.getItem('mapMarkers');
      const mapPlaces = savedMarkers ? JSON.parse(savedMarkers) : [];
      
      console.log(`📊 Stats: ${reviews?.length || 0} avis, ${mapPlaces.length} lieux ajoutés`);
      
      if (reviews && reviews.length > 0) {
        // Calculer la note moyenne des avis
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = totalRating / reviews.length;
        
        setUserInfo(prev => ({
          ...prev,
          reviewCount: reviews.length,
          averageRating: Math.round(averageRating * 10) / 10,
          favoritePlaces: mapPlaces.length // 🎯 Vrais lieux ajoutés
        }));
      } else {
        setUserInfo(prev => ({
          ...prev,
          reviewCount: 0,
          averageRating: 0,
          favoritePlaces: mapPlaces.length // 🎯 Vrais lieux ajoutés même sans avis
        }));
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des statistiques:', error);
    } finally {
      setIsLoadingStats(false);
    }
  }, []);

  // Charger le profil au montage et quand on revient sur l'écran  
  useFocusEffect(
    useCallback(() => {
      loadProfile();
      loadUserStats();
      console.log('🔄 ProfileScreen: Rechargement des statistiques...');
    }, [loadProfile, loadUserStats])
  );

  // Mettre à jour le profil si on revient avec des nouvelles données
  useEffect(() => {
    if (route?.params?.updatedProfile) {
      setUserInfo(prev => ({
        ...prev,
        ...route.params.updatedProfile
      }));
      // Nettoyer les params pour éviter les réactualisations multiples
      navigation.setParams({ updatedProfile: null });
    }
  }, [route?.params?.updatedProfile, navigation]);

  const handleEditProfile = () => {
    // Navigation vers l'écran d'édition du profil avec les données actuelles
    navigation.navigate('EditProfile', { 
      profile: {
        name: userInfo.name,
        email: userInfo.email,
        phone: userInfo.phone || '',
        bio: userInfo.bio || '',
        location: userInfo.location || '',
      }
    });
  };

  const handleViewReviews = () => {
    // Navigation vers les avis de l'utilisateur
    navigation.navigate('MyReviews');
  };

  const handleViewLocationHistory = () => {
    // Navigation vers l'historique de lieu
    navigation.navigate('LocationHistory');
  };

  const handleClearMapMarkers = () => {
    Alert.alert(
      "🗺️ Vider la carte",
      "Supprimer tous vos marqueurs ?",
      [
        {
          text: "Annuler",
          style: "cancel"
        },
        {
          text: "Vider",
          style: "destructive",
          onPress: async () => {
            try {
              // Supprimer les marqueurs de AsyncStorage
              await AsyncStorage.removeItem('mapMarkers');
              console.log('🗑️ Tous les marqueurs supprimés du profil');
              Alert.alert("✅ Fait !", "Carte vidée avec succès");
              
              // Recharger les statistiques immédiatement
              loadUserStats();
            } catch (error) {
              console.error('Erreur lors de la suppression des marqueurs:', error);
              Alert.alert("❌ Erreur", "Impossible de vider la carte");
            }
          }
        }
      ]
    );
  };

  const handleLogout = () => {
    // Déconnexion et retour à l'écran de login
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView}>
        {/* Section profil utilisateur */}
        <Card style={styles.profileCard}>
          <Card.Content style={styles.profileContent}>
            <Avatar.Text 
              size={80} 
              label={userInfo.name.charAt(0).toUpperCase()} 
              style={[styles.avatar, { backgroundColor: theme.colors.primary }]} 
            />
            <View style={styles.userInfo}>
              <Title style={[styles.userName, { fontSize: textSizes.title }]}>
                {userInfo.name}
              </Title>
              <Paragraph style={[styles.userEmail, { fontSize: textSizes.body }]}>
                {userInfo.email}
              </Paragraph>
              {userInfo.location && (
                <Text style={[styles.userLocation, { fontSize: textSizes.caption }]}>
                  📍 {userInfo.location}
                </Text>
              )}
              <Text style={[styles.joinDate, { fontSize: textSizes.caption }]}>
                Membre depuis {userInfo.joinDate}
              </Text>
              {userInfo.bio && (
                <Text style={[styles.userBio, { fontSize: textSizes.body }]}>
                  {userInfo.bio}
                </Text>
              )}
            </View>
          </Card.Content>
          <Card.Actions>
            <Button 
              mode="outlined" 
              onPress={handleEditProfile}
              labelStyle={{ fontSize: textSizes.body }}
              icon="pencil"
            >
              Éditer le profil
            </Button>
          </Card.Actions>
        </Card>

        {/* Statistiques utilisateur */}
        <Card style={styles.statsCard}>
          <Card.Content>
            <Title style={{ fontSize: textSizes.title }}>Mes statistiques</Title>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { fontSize: textSizes.title }]}>
                  {isLoadingStats ? '...' : userInfo.favoritePlaces}
                </Text>
                <Text style={[styles.statLabel, { fontSize: textSizes.caption }]}>Lieux ajoutés</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { fontSize: textSizes.title }]}>
                  {isLoadingStats ? '...' : userInfo.reviewCount}
                </Text>
                <Text style={[styles.statLabel, { fontSize: textSizes.caption }]}>Avis donnés</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { fontSize: textSizes.title }]}>
                  {isLoadingStats ? '...' : (userInfo.averageRating || '0.0')}
                </Text>
                <Text style={[styles.statLabel, { fontSize: textSizes.caption }]}>Note moyenne</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Options du profil */}
        <Card style={styles.optionsCard}>
          <Card.Content>
            <List.Item
              title="Vider la carte"
              description="Supprimer tous mes marqueurs"
              left={props => <List.Icon {...props} icon="map-marker-remove" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => handleClearMapMarkers()}
              titleStyle={{ fontSize: textSizes.body }}
              descriptionStyle={{ fontSize: textSizes.caption }}
            />
            <Divider />
            <List.Item
              title="Mes avis"
              description="Voir tous mes avis postés"
              left={props => <List.Icon {...props} icon="comment-text" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={handleViewReviews}
              titleStyle={{ fontSize: textSizes.body }}
              descriptionStyle={{ fontSize: textSizes.caption }}
            />
            <Divider />
            <List.Item
              title="Historique de lieu"
              description="Lieux ajoutés sur la carte"
              left={props => <List.Icon {...props} icon="map-marker" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={handleViewLocationHistory}
              titleStyle={{ fontSize: textSizes.body }}
              descriptionStyle={{ fontSize: textSizes.caption }}
            />
            <Divider />
            <List.Item
              title="Notifications"
              description="Gérer les notifications"
              left={props => <List.Icon {...props} icon="bell" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => navigation.navigate('Settings', { scrollToNotifications: true })}
              titleStyle={{ fontSize: textSizes.body }}
              descriptionStyle={{ fontSize: textSizes.caption }}
            />
          </Card.Content>
        </Card>

        {/* Section déconnexion */}
        <Card style={styles.logoutCard}>
          <Card.Content>
            <Button 
              mode="contained" 
              onPress={handleLogout}
              style={styles.logoutButton}
              labelStyle={[styles.logoutLabel, { fontSize: textSizes.body }]}
              icon="logout"
              buttonColor="#ff4444"
              textColor="white"
            >
              Se déconnecter
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  profileCard: {
    marginBottom: 16,
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  userLocation: {
    fontSize: 14,
    color: '#888',
  },
  joinDate: {
    fontSize: 14,
    color: '#888',
  },
  userBio: {
    fontSize: 14,
    color: '#666',
  },
  statsCard: {
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  optionsCard: {
    marginBottom: 16,
  },
  logoutCard: {
    marginTop: 16,
    marginBottom: 32,
  },
  logoutButton: {
    paddingVertical: 8,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#ff4444',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  logoutLabel: {
    fontWeight: 'bold',
  },
}); 