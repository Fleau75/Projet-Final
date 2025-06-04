/**
 * Écran de profil utilisateur
 * Affiche les informations de l'utilisateur et ses préférences d'accessibilité
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
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

export default function ProfileScreen({ navigation }) {
  const theme = useTheme();
  const [userInfo, setUserInfo] = useState({
    name: 'Utilisateur AccessPlus',
    email: 'user@accessplus.com',
    reviewCount: 12,
    favoritePlaces: 8,
    joinDate: 'Mars 2024'
  });

  const handleEditProfile = () => {
    // Navigation vers l'écran d'édition du profil
    console.log('Éditer le profil');
  };

  const handleViewReviews = () => {
    // Navigation vers les avis de l'utilisateur
    console.log('Voir mes avis');
  };

  const handleViewFavorites = () => {
    // Navigation vers les lieux favoris
    console.log('Voir mes favoris');
  };

  const handleLogout = () => {
    // Déconnexion et retour à l'écran de login
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView}>
        {/* Section profil utilisateur */}
        <Card style={styles.profileCard}>
          <Card.Content style={styles.profileContent}>
            <Avatar.Text 
              size={80} 
              label="U" 
              style={[styles.avatar, { backgroundColor: theme.colors.primary }]} 
            />
            <View style={styles.userInfo}>
              <Title style={styles.userName}>{userInfo.name}</Title>
              <Paragraph style={styles.userEmail}>{userInfo.email}</Paragraph>
              <Text style={styles.joinDate}>Membre depuis {userInfo.joinDate}</Text>
            </View>
          </Card.Content>
          <Card.Actions>
            <Button mode="outlined" onPress={handleEditProfile}>
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
        <View style={styles.logoutSection}>
          <Button 
            mode="contained" 
            onPress={handleLogout}
            style={[styles.logoutButton, { backgroundColor: theme.colors.error }]}
            labelStyle={{ color: 'white' }}
          >
            Se déconnecter
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 16,
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
  joinDate: {
    fontSize: 14,
    color: '#888',
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
  logoutSection: {
    marginTop: 32,
    marginBottom: 32,
  },
  logoutButton: {
    paddingVertical: 8,
  },
}); 