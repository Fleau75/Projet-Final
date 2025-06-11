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

export default function ProfileScreen({ navigation, route }) {
  const theme = useTheme();
  const { textSizes } = useTextSize();
  
  const [userInfo, setUserInfo] = useState({
    name: 'Utilisateur AccessPlus',
    email: 'user@accessplus.com',
    phone: '',
    bio: '',
    location: '',
    reviewCount: 12,
    favoritePlaces: 8,
    joinDate: 'Mars 2024'
  });

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

  // Charger le profil au montage et quand on revient sur l'écran
  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile])
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

  const handleViewFavorites = () => {
    // Navigation vers les lieux favoris
    navigation.navigate('FavoritePlaces');
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
      {/* En-tête personnalisé */}
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <Title style={[styles.headerTitle, { fontSize: textSizes.title }]}>
          Mon Profil
        </Title>
      </View>
      
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
            <Title>Mes statistiques</Title>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{userInfo.reviewCount}</Text>
                <Text style={styles.statLabel}>Avis donnés</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{userInfo.favoritePlaces}</Text>
                <Text style={styles.statLabel}>Lieux favoris</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Options du profil */}
        <Card style={styles.optionsCard}>
          <Card.Content>
            <List.Item
              title="Mes avis"
              description="Voir tous mes avis postés"
              left={props => <List.Icon {...props} icon="comment-text" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={handleViewReviews}
            />
            <Divider />
            <List.Item
              title="Lieux favoris"
              description="Mes lieux sauvegardés"
              left={props => <List.Icon {...props} icon="heart" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={handleViewFavorites}
            />
            <Divider />
            <List.Item
              title="Notifications"
              description="Gérer les notifications"
              left={props => <List.Icon {...props} icon="bell" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => navigation.navigate('Settings')}
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
  header: {
    paddingTop: 44, // Pour l'encoche iPhone
    paddingBottom: 16,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerTitle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
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