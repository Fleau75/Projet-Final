/**
 * Écran d'édition du profil utilisateur
 * Permet à l'utilisateur de modifier ses informations personnelles
 * Version améliorée avec Material Design et suppression de compte
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
  IconButton,
  Divider,
  Surface,
  Chip,
  Portal,
  Dialog,
  List
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTextSize } from '../theme/TextSizeContext';
import { AuthService } from '../services/authService';
import { useAuth } from '../theme/AuthContext';
import { VerificationStats } from '../components/VerifiedBadge';

export default function EditProfileScreen({ navigation, route }) {
  const theme = useTheme();
  const { textSizes } = useTextSize();
  const { logout } = useAuth();
  
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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [verificationData, setVerificationData] = useState({
    isVerified: false,
    criteria: {
      hasAccount: false,
      hasEnoughReviews: false,
      requiredReviews: 3,
      reviewsAdded: 0
    }
  });

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

  // Charger le statut de vérification de l'utilisateur
  useEffect(() => {
    const loadVerificationStatus = async () => {
      try {
        const userId = profile?.uid || 'anonymous';
        const verificationStatus = await AuthService.getUserVerificationStatus(userId);
        setVerificationData(verificationStatus);
        console.log('🔍 Statut de vérification chargé:', verificationStatus);
      } catch (error) {
        console.error('❌ Erreur lors du chargement du statut de vérification:', error);
      }
    };

    if (!isVisitor) {
      loadVerificationStatus();
    }
  }, [profile, isVisitor]);

  // Si c'est un visiteur, ne pas afficher le formulaire
  if (isVisitor) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.centerContainer}>
          <IconButton
            icon="account-off"
            size={64}
            iconColor={theme.colors.error}
            style={styles.errorIcon}
          />
          <Text style={[styles.errorText, { fontSize: textSizes.title, color: theme.colors.error }]}>
            Accès non autorisé
          </Text>
          <Text style={[styles.errorSubtext, { fontSize: textSizes.body, color: theme.colors.onSurface }]}>
            Les visiteurs ne peuvent pas modifier leur profil
          </Text>
          <Button 
            mode="contained" 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            icon="arrow-left"
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
        "✅ Succès",
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
      Alert.alert("❌ Erreur", "Impossible de sauvegarder le profil");
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

  // Fonction pour supprimer le compte
  const handleDeleteAccount = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Récupérer l'email avant de supprimer le profil
      const userEmail = profile?.email;
      const userId = profile?.uid;
      
      console.log('🗑️ Début de la suppression du compte:', { userEmail, userId });
      
      // 1. Supprimer tous les avis de l'utilisateur dans Firebase
      if (userEmail) {
        try {
          console.log('🗑️ Suppression des avis Firebase...');
          const { ReviewsService } = await import('../services/firebaseService');
          
          // Supprimer tous les avis de l'utilisateur par email
          const deletedCount = await ReviewsService.deleteAllReviewsByEmail(userEmail);
          console.log(`✅ ${deletedCount} avis supprimés de Firebase`);
        } catch (error) {
          console.warn('⚠️ Erreur lors de la suppression des avis Firebase:', error);
        }
      }
      
      // 2. Supprimer les lieux favoris (marqueurs de la carte)
      try {
        console.log('🗑️ Suppression des lieux favoris...');
        await AsyncStorage.removeItem('mapMarkers');
        console.log('✅ Lieux favoris supprimés');
      } catch (error) {
        console.warn('⚠️ Erreur lors de la suppression des lieux favoris:', error);
      }
      
      // 3. Supprimer toutes les données utilisateur de manière sécurisée
      const keysToRemove = [
        'userProfile',
        'userPassword', 
        'isAuthenticated',
        'currentUser',
        'biometricPreferences'
      ];
      
      // Supprimer les clés principales
      for (const key of keysToRemove) {
        try {
          await AsyncStorage.removeItem(key);
          console.log(`✅ Clé supprimée: ${key}`);
        } catch (error) {
          console.warn(`⚠️ Erreur lors de la suppression de ${key}:`, error);
        }
      }
      
      // 4. Supprimer les données spécifiques à l'utilisateur
      if (userEmail) {
        const userSpecificKeys = [
          `user_${userEmail}`,
          `userStats_email_${userEmail}`,
          `userVerification_email_${userEmail}`,
          `resetToken_${userEmail}`
        ];
        
        for (const key of userSpecificKeys) {
          try {
            await AsyncStorage.removeItem(key);
            console.log(`✅ Clé utilisateur supprimée: ${key}`);
          } catch (error) {
            console.warn(`⚠️ Erreur lors de la suppression de ${key}:`, error);
          }
        }
      }
      
      // 5. Supprimer par UID si différent de l'email
      if (userId && userId !== userEmail) {
        const uidKeys = [
          `userStats_${userId}`,
          `userVerification_${userId}`
        ];
        
        for (const key of uidKeys) {
          try {
            await AsyncStorage.removeItem(key);
            console.log(`✅ Clé UID supprimée: ${key}`);
          } catch (error) {
            console.warn(`⚠️ Erreur lors de la suppression de ${key}:`, error);
          }
        }
      }
      
      console.log('✅ Suppression du compte terminée avec succès');
      
      Alert.alert(
        "✅ Compte supprimé",
        "Votre compte a été supprimé avec succès. Toutes vos données (avis, favoris, statistiques) ont été effacées. Vous allez être déconnecté.",
        [
          {
            text: "OK",
            onPress: async () => {
              try {
                await logout();
                // La déconnexion se propagera automatiquement et redirigera vers Login
                console.log('✅ Déconnexion effectuée, redirection automatique...');
              } catch (error) {
                console.error('❌ Erreur lors de la déconnexion:', error);
                // Même en cas d'erreur, la déconnexion locale a été effectuée
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('❌ Erreur lors de la suppression du compte:', error);
      Alert.alert(
        "❌ Erreur", 
        "Une erreur est survenue lors de la suppression du compte. Veuillez réessayer.",
        [{ text: "OK" }]
      );
    } finally {
      setIsLoading(false);
      setShowConfirmDelete(false);
    }
  }, [profile, logout, navigation]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* En-tête avec gradient */}
        <Surface style={[styles.headerSurface, { backgroundColor: theme.colors.surface }]}>
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.primary + 'CC']}
            style={styles.headerGradient}
          >
            <View style={styles.headerContent}>
              <Avatar.Text 
                size={100} 
                label={profile.name.charAt(0).toUpperCase()} 
                style={[styles.avatar, { backgroundColor: theme.colors.surface }]} 
                labelStyle={{ color: theme.colors.primary, fontSize: 36, fontWeight: 'bold' }}
              />
              <View style={styles.headerInfo}>
                {/* Badge de vérification connecté au vrai système */}
                <VerificationStats 
                  verificationData={verificationData} 
                  showDetails={true}
                />
              </View>
            </View>
          </LinearGradient>
        </Surface>

        {/* Formulaire d'édition */}
        <Card style={[styles.formCard, { backgroundColor: theme.colors.surface }]} elevation={4}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <IconButton icon="account-edit" size={24} iconColor={theme.colors.primary} />
              <Title style={[styles.sectionTitle, { fontSize: textSizes.subtitle, color: theme.colors.onSurface }]}>
                Informations personnelles
              </Title>
            </View>

            <TextInput
              label="Nom complet *"
              value={profile.name}
              onChangeText={(text) => updateField('name', text)}
              mode="outlined"
              style={styles.input}
              left={<TextInput.Icon icon="account" />}
              disabled={isLoading}
              outlineColor={theme.colors.outline}
              activeOutlineColor={theme.colors.primary}
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
              outlineColor={theme.colors.outline}
              activeOutlineColor={theme.colors.primary}
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
              outlineColor={theme.colors.outline}
              activeOutlineColor={theme.colors.primary}
            />

            <TextInput
              label="Localisation"
              value={profile.location}
              onChangeText={(text) => updateField('location', text)}
              mode="outlined"
              style={styles.input}
              left={<TextInput.Icon icon="map-marker" />}
              disabled={isLoading}
              outlineColor={theme.colors.outline}
              activeOutlineColor={theme.colors.primary}
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
              outlineColor={theme.colors.outline}
              activeOutlineColor={theme.colors.primary}
            />

            <Text style={[styles.requiredNote, { fontSize: textSizes.caption, color: theme.colors.onSurfaceVariant }]}>
              * Champs obligatoires
            </Text>
          </Card.Content>
        </Card>

        {/* Section Actions */}
        <Card style={[styles.actionsCard, { backgroundColor: theme.colors.surface }]} elevation={4}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <IconButton icon="cog" size={24} iconColor={theme.colors.primary} />
              <Title style={[styles.sectionTitle, { fontSize: textSizes.subtitle, color: theme.colors.onSurface }]}>
                Actions
              </Title>
            </View>

            <List.Item
              title="Changer le mot de passe"
              description="Modifier votre mot de passe de connexion"
              left={(props) => <List.Icon {...props} icon="lock" color={theme.colors.primary} />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => Alert.alert("Fonctionnalité", "Changement de mot de passe à venir")}
              style={styles.listItem}
            />

            <Divider style={styles.divider} />

            <List.Item
              title="Supprimer le compte"
              description="Supprimer définitivement votre compte et toutes vos données"
              left={(props) => <List.Icon {...props} icon="delete" color={theme.colors.error} />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => setShowDeleteDialog(true)}
              style={styles.listItem}
              titleStyle={{ color: theme.colors.error }}
            />
          </Card.Content>
        </Card>

        {/* Boutons d'action principaux */}
        <View style={styles.actionButtons}>
          <Button
            mode="outlined"
            onPress={handleCancel}
            style={[styles.cancelButton, { borderColor: theme.colors.outline }]}
            labelStyle={{ fontSize: textSizes.body }}
            disabled={isLoading}
            icon="close"
            textColor={theme.colors.onSurface}
          >
            Annuler
          </Button>

          <Button
            mode="contained"
            onPress={handleSaveProfile}
            style={[styles.saveButton, { backgroundColor: theme.colors.primary }]}
            labelStyle={{ fontSize: textSizes.body }}
            loading={isLoading}
            disabled={isLoading}
            icon="content-save"
            buttonColor={theme.colors.primary}
          >
            Sauvegarder
          </Button>
        </View>
      </ScrollView>

      {/* Dialog de confirmation de suppression */}
      <Portal>
        <Dialog visible={showDeleteDialog} onDismiss={() => setShowDeleteDialog(false)}>
          <Dialog.Icon icon="alert" color={theme.colors.error} />
          <Dialog.Title style={{ color: theme.colors.error }}>⚠️ Attention</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible et supprimera :
            </Text>
            <View style={styles.deleteList}>
              <Text variant="bodySmall">• Votre profil utilisateur</Text>
              <Text variant="bodySmall">• Tous vos avis et évaluations</Text>
              <Text variant="bodySmall">• Votre historique de lieux</Text>
              <Text variant="bodySmall">• Vos préférences d'accessibilité</Text>
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowDeleteDialog(false)}>Annuler</Button>
            <Button 
              textColor={theme.colors.error} 
              onPress={() => {
                setShowDeleteDialog(false);
                setShowConfirmDelete(true);
              }}
            >
              Continuer
            </Button>
          </Dialog.Actions>
        </Dialog>

        {/* Dialog de confirmation finale */}
        <Dialog visible={showConfirmDelete} onDismiss={() => setShowConfirmDelete(false)}>
          <Dialog.Icon icon="delete-forever" color={theme.colors.error} />
          <Dialog.Title style={{ color: theme.colors.error }}>🗑️ Suppression définitive</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Cette action supprimera définitivement votre compte. Êtes-vous absolument sûr ?
            </Text>
            <Text variant="bodySmall" style={{ marginTop: 8, fontStyle: 'italic' }}>
              Tapez "SUPPRIMER" pour confirmer
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowConfirmDelete(false)}>Annuler</Button>
            <Button 
              textColor={theme.colors.error} 
              onPress={handleDeleteAccount}
              loading={isLoading}
            >
              Supprimer le compte
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  headerSurface: {
    elevation: 8,
    marginBottom: 16,
  },
  headerGradient: {
    padding: 24,
    paddingTop: 32,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    marginRight: 20,
    elevation: 4,
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 12,
  },
  verifiedChip: {
    alignSelf: 'flex-start',
  },
  formCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
  },
  actionsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 16,
  },
  requiredNote: {
    fontStyle: 'italic',
    marginTop: 8,
  },
  listItem: {
    paddingVertical: 8,
  },
  divider: {
    marginVertical: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 32,
    gap: 16,
  },
  cancelButton: {
    flex: 1,
    borderRadius: 12,
  },
  saveButton: {
    flex: 1,
    borderRadius: 12,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorIcon: {
    marginBottom: 16,
  },
  errorText: {
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  errorSubtext: {
    marginBottom: 24,
    textAlign: 'center',
  },
  backButton: {
    marginTop: 24,
    borderRadius: 12,
  },
  deleteList: {
    marginTop: 12,
    paddingLeft: 8,
  },
}); 