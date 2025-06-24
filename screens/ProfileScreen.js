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
import { useAuth } from '../theme/AuthContext';
import { AuthService } from '../services/authService';
import { UserNameWithBadge, VerificationStats } from '../components/VerifiedBadge';

export default function ProfileScreen({ navigation, route }) {
  const theme = useTheme();
  const { textSizes } = useTextSize();
  const { user, logout } = useAuth();
  
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
  const [verificationData, setVerificationData] = useState({
    isVerified: false,
    criteria: {
      hasAccount: false,
      hasEnoughPlaces: false,
      placesAdded: 0,
      requiredPlaces: 3
    }
  });

  // Charger le profil depuis le contexte d'authentification
  const loadProfile = useCallback(async () => {
    try {
      if (user) {
        setUserInfo(prev => ({
          ...prev,
          ...user
        }));
      } else {
        // Fallback vers AsyncStorage si pas d'utilisateur dans le contexte
        const savedProfile = await AsyncStorage.getItem('userProfile');
        if (savedProfile) {
          const profileData = JSON.parse(savedProfile);
          setUserInfo(prev => ({
            ...prev,
            ...profileData
          }));
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
    }
  }, [user]);

  // Charger le statut de vérification de l'utilisateur
  const loadVerificationStatus = useCallback(async () => {
    try {
      const userId = user?.uid || 'anonymous';
      const verificationStatus = await AuthService.getUserVerificationStatus(userId);
      setVerificationData(verificationStatus);
      
      console.log('🔍 Statut de vérification:', verificationStatus);
    } catch (error) {
      console.error('❌ Erreur lors du chargement du statut de vérification:', error);
    }
  }, [user]);

  // Charger les statistiques réelles depuis Firebase ET AsyncStorage
  const loadUserStats = useCallback(async () => {
    setIsLoadingStats(true);
    try {
      const userId = user?.uid || 'anonymous';
      
      // 🔥 Charger les avis Firebase
      const reviews = await ReviewsService.getReviewsByUserId(userId);
      
      // 🗺️ Charger les lieux ajoutés depuis AsyncStorage
      const savedMarkers = await AsyncStorage.getItem('mapMarkers');
      const mapPlaces = savedMarkers ? JSON.parse(savedMarkers) : [];
      
      console.log(`📊 Stats: ${reviews?.length || 0} avis, ${mapPlaces.length} lieux ajoutés`);
      
      // Mettre à jour les statistiques AsyncStorage avec les vraies données
      if (userId !== 'anonymous') {
        const currentStats = await AuthService.getUserStats(userId);
        const updatedStats = {
          ...currentStats,
          reviewsAdded: reviews?.length || 0,
          lastActivity: new Date().toISOString()
        };
        
        const statsKey = `userStats_${userId}`;
        await AsyncStorage.setItem(statsKey, JSON.stringify(updatedStats));
        console.log(`✅ Statistiques mises à jour: ${updatedStats.reviewsAdded} avis`);
      }
      
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

      // Mettre à jour le statut de vérification après avoir chargé les stats
      await loadVerificationStatus();
    } catch (error) {
      console.error('❌ Erreur lors du chargement des statistiques:', error);
    } finally {
      setIsLoadingStats(false);
    }
  }, [user, loadVerificationStatus]);

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
    // Vérifier si l'utilisateur est un visiteur
    if (userInfo.isVisitor) {
      Alert.alert(
        "Mode visiteur",
        "Les visiteurs ne peuvent pas modifier leur profil. Veuillez créer un compte pour accéder à cette fonctionnalité.",
        [
          {
            text: "Créer un compte",
            onPress: () => navigation.navigate('Login')
          },
          {
            text: "Annuler",
            style: "cancel"
          }
        ]
      );
      return;
    }

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

  const handleLogout = async () => {
    try {
      // Vérifier si l'utilisateur est un visiteur
      if (userInfo.isVisitor) {
        Alert.alert(
          "Retour au menu",
          "Voulez-vous retourner à l'écran de connexion ?",
          [
            {
              text: "Annuler",
              style: "cancel"
            },
            {
              text: "Retour au menu",
              style: "default",
              onPress: async () => {
                try {
                  await logout();
                  // La navigation se fait automatiquement via le contexte
                } catch (error) {
                  console.error('Erreur lors du retour au menu:', error);
                  Alert.alert("Erreur", "Impossible de retourner au menu");
                }
              }
            }
          ]
        );
      } else {
        Alert.alert(
          "Déconnexion",
          "Êtes-vous sûr de vouloir vous déconnecter ?",
          [
            {
              text: "Annuler",
              style: "cancel"
            },
            {
              text: "Se déconnecter",
              style: "destructive",
              onPress: async () => {
                try {
                  await logout();
                  // La navigation se fait automatiquement via le contexte
                } catch (error) {
                  console.error('Erreur lors de la déconnexion:', error);
                  Alert.alert("Erreur", "Impossible de se déconnecter");
                }
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  // Nouvelle fonction pour gérer la création de compte depuis le mode visiteur
  const handleCreateAccount = async () => {
    // Pour les visiteurs, on se déconnecte silencieusement puis on navigue vers l'inscription
    if (userInfo.isVisitor) {
      try {
        // Se déconnecter silencieusement du mode visiteur
        await logout();
        // Navigation directe vers Register après un court délai
        setTimeout(() => {
          navigation.navigate('Register');
        }, 100);
      } catch (error) {
        console.error('Erreur lors de la transition vers l\'inscription:', error);
        // En cas d'erreur, essayer quand même la navigation
        navigation.navigate('Register');
      }
    } else {
      // Pour les utilisateurs normaux, navigation directe
      navigation.navigate('Register');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView}>
        {/* Section profil utilisateur */}
        <Card style={styles.profileCard}>
          <Card.Content style={styles.profileContent}>
            <View style={userInfo.isVisitor ? styles.visitorAvatarContainer : null}>
              <Avatar.Text 
                size={80} 
                label={userInfo.name.charAt(0).toUpperCase()} 
                style={[
                  styles.avatar, 
                  { 
                    backgroundColor: theme.colors.primary
                  }
                ]} 
              />
            </View>
            <View style={styles.userInfo}>
              {userInfo.isVisitor ? (
                <View style={styles.visitorInfoContainer}>
                  <View style={[styles.visitorBadgeContainer, { 
                    backgroundColor: theme.colors.primaryContainer,
                    borderColor: theme.colors.primary
                  }]}>
                    <Text style={[styles.visitorBadgeIcon, { 
                      fontSize: textSizes.body,
                      color: theme.colors.primary
                    }]}>
                      👤
                    </Text>
                    <Text style={[styles.visitorBadgeText, { 
                      fontSize: textSizes.body,
                      color: theme.colors.primary,
                      fontWeight: '600'
                    }]}>
                      Mode visiteur
                    </Text>
                  </View>
                </View>
              ) : (
                <UserNameWithBadge 
                  userName={userInfo.name}
                  isVerified={verificationData.isVerified}
                  variant="titleLarge"
                  style={{ marginBottom: 4 }}
                />
              )}
              
              {/* Afficher l'email seulement pour les utilisateurs non-visiteurs */}
              {!userInfo.isVisitor && (
                <Paragraph style={[styles.userEmail, { fontSize: textSizes.body }]}>
                  {userInfo.email}
                </Paragraph>
              )}
              
              {userInfo.location && (
                <Text style={[styles.userLocation, { fontSize: textSizes.caption }]}>
                  📍 {userInfo.location}
                </Text>
              )}
              {userInfo.bio && (
                <Text style={[styles.userBio, { fontSize: textSizes.body }]}>
                  {userInfo.bio}
                </Text>
              )}
            </View>
          </Card.Content>
          {/* Afficher le bouton "Éditer le profil" seulement pour les utilisateurs non-visiteurs */}
          {!userInfo.isVisitor && (
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
          )}
        </Card>

        {/* Statistiques utilisateur */}
        <Card style={styles.statsCard}>
          <Card.Content>
            <Title style={{ fontSize: textSizes.title }}>Mes statistiques</Title>
            
            {/* Statut de vérification */}
            {!userInfo.isVisitor && (
              <View style={styles.verificationSection}>
                <VerificationStats 
                  verificationData={verificationData} 
                  showDetails={true}
                />
                {!verificationData.isVerified && (
                  <Text style={[styles.verificationHint, { 
                    fontSize: textSizes.caption,
                    color: theme.colors.onSurfaceVariant,
                    marginTop: 8
                  }]}>
                    💡 Ajoutez au moins 3 avis pour obtenir le badge vérifié !
                  </Text>
                )}
              </View>
            )}
            
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { 
                  fontSize: textSizes.title,
                  color: theme.colors.primary
                }]}>
                  {isLoadingStats ? '...' : userInfo.favoritePlaces}
                </Text>
                <Text style={[styles.statLabel, { 
                  fontSize: textSizes.caption,
                  color: theme.colors.onSurfaceVariant
                }]}>Lieux ajoutés</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { 
                  fontSize: textSizes.title,
                  color: theme.colors.primary
                }]}>
                  {isLoadingStats ? '...' : userInfo.reviewCount}
                </Text>
                <Text style={[styles.statLabel, { 
                  fontSize: textSizes.caption,
                  color: theme.colors.onSurfaceVariant
                }]}>Avis donnés</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { 
                  fontSize: textSizes.title,
                  color: theme.colors.primary
                }]}>
                  {isLoadingStats ? '...' : (userInfo.averageRating || '0.0')}
                </Text>
                <Text style={[styles.statLabel, { 
                  fontSize: textSizes.caption,
                  color: theme.colors.onSurfaceVariant
                }]}>Note moyenne</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Options du profil */}
        <Card style={styles.optionsCard}>
          <Card.Content>
            {/* Option "Créer un compte" pour les visiteurs */}
            {userInfo.isVisitor && (
              <>
                <List.Item
                  title="Créer un compte"
                  description="Synchroniser vos données et accéder à toutes les fonctionnalités"
                  left={props => <List.Icon {...props} icon="account-plus" />}
                  right={props => <List.Icon {...props} icon="chevron-right" />}
                  onPress={handleCreateAccount}
                  titleStyle={{ fontSize: textSizes.body }}
                  descriptionStyle={{ fontSize: textSizes.caption }}
                />
                <Divider />
              </>
            )}
            
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
              icon={userInfo.isVisitor ? "home" : "logout"}
              buttonColor={userInfo.isVisitor ? theme.colors.primary : "#ff4444"}
              textColor="white"
            >
              {userInfo.isVisitor ? 'Retour au menu' : 'Se déconnecter'}
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
    marginBottom: 4,
  },
  userLocation: {
    fontSize: 14,
  },
  userBio: {
    fontSize: 14,
  },
  visitorBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginVertical: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  visitorBadgeIcon: {
    marginRight: 6,
  },
  visitorBadgeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statsCard: {
    marginBottom: 16,
  },
  verificationSection: {
    marginBottom: 16,
  },
  verificationHint: {
    fontSize: 14,
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
  },
  statLabel: {
    fontSize: 14,
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
  visitorInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 16,
  },
  visitorAvatarContainer: {
    marginTop: -16,
    paddingBottom: 8,
  },
}); 