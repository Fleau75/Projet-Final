/**
 * Écran d'édition du profil utilisateur
 * Permet à l'utilisateur de modifier ses informations personnelles
 */

import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { 
  Card, 
  Title, 
  TextInput, 
  Button,
  Avatar,
  Text,
  useTheme,
  IconButton 
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTextSize } from '../theme/TextSizeContext';
import { AuthService } from '../services/authService';

export default function EditProfileScreen({ navigation, route }) {
  const theme = useTheme();
  const { textSizes } = useTextSize();
  
  // Récupérer les données du profil depuis les params ou utiliser des valeurs par défaut
  const currentProfile = route?.params?.profile || {
    name: 'Utilisateur AccessPlus',
    email: 'user@accessplus.com',
    phone: '',
    bio: '',
    location: '',
  };

  const [profile, setProfile] = useState(currentProfile);
  const [isLoading, setIsLoading] = useState(false);
  const [isVisitor, setIsVisitor] = useState(false);

  // Vérifier si l'utilisateur est un visiteur au montage
  useEffect(() => {
    const checkVisitorStatus = async () => {
      const visitorStatus = await AuthService.isCurrentUserVisitor();
      setIsVisitor(visitorStatus);
      
      if (visitorStatus) {
        Alert.alert(
          "Mode visiteur",
          "Les visiteurs ne peuvent pas modifier leur profil. Veuillez créer un compte pour accéder à cette fonctionnalité.",
          [
            {
              text: "OK",
              onPress: () => navigation.goBack()
            }
          ]
        );
      }
    };
    
    checkVisitorStatus();
  }, [navigation]);

  // Si c'est un visiteur, ne pas afficher le formulaire
  if (isVisitor) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.centerContainer}>
          <Text style={[styles.errorText, { fontSize: textSizes.title }]}>
            Accès non autorisé
          </Text>
          <Text style={[styles.errorSubtext, { fontSize: textSizes.body }]}>
            Les visiteurs ne peuvent pas modifier leur profil
          </Text>
          <Button 
            mode="contained" 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            Retour
          </Button>
        </View>
      </View>
    );
  }

  // Fonction pour mettre à jour un champ du profil
  const updateField = useCallback((field, value) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Fonction pour sauvegarder le profil
  const handleSaveProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Validation basique
      if (!profile.name.trim()) {
        Alert.alert("Erreur", "Le nom est obligatoire");
        return;
      }
      
      if (!profile.email.trim()) {
        Alert.alert("Erreur", "L'email est obligatoire");
        return;
      }

      // Validation de l'email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(profile.email)) {
        Alert.alert("Erreur", "L'email n'est pas valide");
        return;
      }

      // Sauvegarder dans AsyncStorage
      await AsyncStorage.setItem('userProfile', JSON.stringify(profile));

      Alert.alert(
        "Succès",
        "Votre profil a été mis à jour avec succès",
        [
          {
            text: "OK",
            onPress: () => {
              // Retourner à l'écran profil avec les nouvelles données
              navigation.navigate('Profile', { updatedProfile: profile });
            }
          }
        ]
      );
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du profil:', error);
      Alert.alert("Erreur", "Impossible de sauvegarder le profil");
    } finally {
      setIsLoading(false);
    }
  }, [profile, navigation]);

  // Fonction pour annuler et revenir en arrière
  const handleCancel = useCallback(() => {
    Alert.alert(
      "Annuler les modifications",
      "Êtes-vous sûr de vouloir annuler ? Toutes les modifications seront perdues.",
      [
        { text: "Continuer l'édition", style: "cancel" },
        { 
          text: "Annuler", 
          style: "destructive",
          onPress: () => navigation.goBack()
        }
      ]
    );
  }, [navigation]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView}>
        {/* En-tête avec avatar */}
        <Card style={styles.headerCard}>
          <Card.Content style={styles.headerContent}>
            <Avatar.Text 
              size={80} 
              label={profile.name.charAt(0).toUpperCase()} 
              style={[styles.avatar, { backgroundColor: theme.colors.primary }]} 
            />
            <View style={styles.headerInfo}>
              <Title style={[styles.title, { fontSize: textSizes.title }]}>
                Éditer le profil
              </Title>
              <Text style={[styles.subtitle, { fontSize: textSizes.body }]}>
                Modifiez vos informations personnelles
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Formulaire d'édition */}
        <Card style={styles.formCard}>
          <Card.Content>
            <Title style={[styles.sectionTitle, { fontSize: textSizes.subtitle }]}>
              Informations personnelles
            </Title>

            <TextInput
              label="Nom complet *"
              value={profile.name}
              onChangeText={(text) => updateField('name', text)}
              mode="outlined"
              style={styles.input}
              left={<TextInput.Icon icon="account" />}
              disabled={isLoading}
            />

            <TextInput
              label="Email *"
              value={profile.email}
              onChangeText={(text) => updateField('email', text)}
              mode="outlined"
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              left={<TextInput.Icon icon="email" />}
              disabled={isLoading}
            />

            <TextInput
              label="Téléphone"
              value={profile.phone}
              onChangeText={(text) => updateField('phone', text)}
              mode="outlined"
              style={styles.input}
              keyboardType="phone-pad"
              left={<TextInput.Icon icon="phone" />}
              disabled={isLoading}
            />

            <TextInput
              label="Localisation"
              value={profile.location}
              onChangeText={(text) => updateField('location', text)}
              mode="outlined"
              style={styles.input}
              left={<TextInput.Icon icon="map-marker" />}
              disabled={isLoading}
            />

            <TextInput
              label="Bio"
              value={profile.bio}
              onChangeText={(text) => updateField('bio', text)}
              mode="outlined"
              style={styles.input}
              multiline
              numberOfLines={4}
              left={<TextInput.Icon icon="text" />}
              disabled={isLoading}
            />

            <Text style={[styles.requiredNote, { fontSize: textSizes.caption }]}>
              * Champs obligatoires
            </Text>
          </Card.Content>
        </Card>

        {/* Boutons d'action */}
        <View style={styles.actionButtons}>
          <Button
            mode="outlined"
            onPress={handleCancel}
            style={styles.cancelButton}
            labelStyle={{ fontSize: textSizes.body }}
            disabled={isLoading}
            icon="close"
          >
            Annuler
          </Button>

          <Button
            mode="contained"
            onPress={handleSaveProfile}
            style={styles.saveButton}
            labelStyle={{ fontSize: textSizes.body }}
            loading={isLoading}
            disabled={isLoading}
            icon="content-save"
          >
            Sauvegarder
          </Button>
        </View>
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
    paddingTop: 8,
  },
  headerCard: {
    marginBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    marginRight: 16,
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    color: '#666',
  },
  formCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  requiredNote: {
    color: '#666',
    fontStyle: 'italic',
    marginTop: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    gap: 16,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  errorSubtext: {
    color: '#666',
    marginBottom: 24,
  },
  backButton: {
    marginTop: 24,
  },
}); 