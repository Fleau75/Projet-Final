import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, Alert, ScrollView } from 'react-native';
import { 
  Text, 
  Button, 
  TextInput, 
  Surface, 
  useTheme, 
  HelperText,
  Card,
  Title,
  IconButton,
  Divider
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTextSize } from '../theme/TextSizeContext';
import { useAppTheme } from '../theme/ThemeContext';
import { AuthService } from '../services/authService';
import { useAuth } from '../theme/AuthContext';

export default function ChangePasswordScreen({ navigation }) {
  const theme = useTheme();
  const { isDarkMode } = useAppTheme();
  const { textSizes } = useTextSize();
  const { user, logout } = useAuth();
  
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Fonction pour mettre à jour les champs
  const updateField = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Nettoyer l'erreur du champ en cours d'édition
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Validation du formulaire
  const validateForm = () => {
    const newErrors = {};

    // Validation du mot de passe actuel
    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Le mot de passe actuel est obligatoire';
    }

    // Validation du nouveau mot de passe
    if (!formData.newPassword) {
      newErrors.newPassword = 'Le nouveau mot de passe est obligatoire';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Le mot de passe doit contenir au moins 6 caractères';
    } else if (formData.newPassword === formData.currentPassword) {
      newErrors.newPassword = 'Le nouveau mot de passe doit être différent de l\'actuel';
    }

    // Validation de la confirmation du mot de passe
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Veuillez confirmer votre nouveau mot de passe';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      console.log('🔧 Tentative de changement de mot de passe...');
      await AuthService.changePassword(formData.currentPassword, formData.newPassword);
      
      Alert.alert(
        'Succès',
        'Votre mot de passe a été changé avec succès. Vous devrez vous reconnecter avec votre nouveau mot de passe.',
        [
          {
            text: 'OK',
            onPress: async () => {
              // Déconnecter l'utilisateur pour qu'il se reconnecte avec le nouveau mot de passe
              try {
                await logout();
                console.log('✅ Déconnexion effectuée via le contexte d\'authentification');
                
                // Attendre un peu pour que la déconnexion se propage
                setTimeout(() => {
                  // Forcer la navigation vers l'écran de connexion si nécessaire
                  if (navigation.canGoBack()) {
                    navigation.navigate('Login');
                  }
                }, 500);
                
              } catch (error) {
                console.error('❌ Erreur lors de la déconnexion:', error);
                // Même en cas d'erreur, forcer la navigation vers la connexion
                navigation.navigate('Login');
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('❌ Erreur lors du changement de mot de passe:', error);
      setErrors({ general: error.message || 'Une erreur est survenue lors du changement de mot de passe' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? '#121212' : '#F1F5F9' }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* En-tête */}
          <View style={styles.headerContainer}>
            <Text style={[styles.title, { 
              color: isDarkMode ? '#FFFFFF' : theme.colors.primary, 
              fontSize: textSizes.headline 
            }]}>
              Changer le mot de passe
            </Text>
            <Text style={[styles.subtitle, { 
              fontSize: textSizes.body, 
              color: isDarkMode ? '#B0B0B0' : theme.colors.onSurfaceVariant 
            }]}>
              Modifiez votre mot de passe de connexion pour sécuriser votre compte
            </Text>
            {user?.email && (
              <Text style={[styles.email, { 
                fontSize: textSizes.caption, 
                color: theme.colors.primary 
              }]}>
                {user.email}
              </Text>
            )}
          </View>

          {/* Formulaire */}
          <Card style={[styles.formCard, { 
            backgroundColor: isDarkMode ? '#1E1E1E' : theme.colors.surface,
            borderColor: isDarkMode ? '#333333' : 'transparent',
            borderWidth: isDarkMode ? 1 : 0
          }]} elevation={4}>
            <Card.Content>
              <View style={styles.sectionHeader}>
                <IconButton icon="lock" size={24} iconColor={theme.colors.primary} />
                <Title style={[styles.sectionTitle, { 
                  fontSize: textSizes.subtitle, 
                  color: theme.colors.onSurface 
                }]}>
                  Informations de sécurité
                </Title>
              </View>

              {/* Mot de passe actuel */}
              <TextInput
                label="Mot de passe actuel *"
                value={formData.currentPassword}
                onChangeText={(value) => updateField('currentPassword', value)}
                mode="outlined"
                secureTextEntry={!showCurrentPassword}
                style={styles.input}
                left={<TextInput.Icon icon="lock" />}
                right={
                  <TextInput.Icon 
                    icon={showCurrentPassword ? "eye-off" : "eye"} 
                    onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                  />
                }
                error={!!errors.currentPassword}
                theme={{ 
                  fonts: { bodyLarge: { fontSize: textSizes.body } },
                  colors: {
                    primary: theme.colors.primary,
                    background: isDarkMode ? '#2D2D2D' : theme.colors.surface,
                    surface: isDarkMode ? '#2D2D2D' : theme.colors.surface,
                    text: isDarkMode ? '#FFFFFF' : theme.colors.onSurface,
                    placeholder: isDarkMode ? '#888888' : theme.colors.onSurfaceVariant,
                  }
                }}
              />
              {errors.currentPassword && (
                <HelperText type="error" style={{ fontSize: textSizes.caption }}>
                  {errors.currentPassword}
                </HelperText>
              )}

              <Divider style={styles.divider} />

              {/* Nouveau mot de passe */}
              <TextInput
                label="Nouveau mot de passe *"
                value={formData.newPassword}
                onChangeText={(value) => updateField('newPassword', value)}
                mode="outlined"
                secureTextEntry={!showNewPassword}
                style={styles.input}
                left={<TextInput.Icon icon="lock-plus" />}
                right={
                  <TextInput.Icon 
                    icon={showNewPassword ? "eye-off" : "eye"} 
                    onPress={() => setShowNewPassword(!showNewPassword)}
                  />
                }
                error={!!errors.newPassword}
                theme={{ 
                  fonts: { bodyLarge: { fontSize: textSizes.body } },
                  colors: {
                    primary: theme.colors.primary,
                    background: isDarkMode ? '#2D2D2D' : theme.colors.surface,
                    surface: isDarkMode ? '#2D2D2D' : theme.colors.surface,
                    text: isDarkMode ? '#FFFFFF' : theme.colors.onSurface,
                    placeholder: isDarkMode ? '#888888' : theme.colors.onSurfaceVariant,
                  }
                }}
              />
              {errors.newPassword && (
                <HelperText type="error" style={{ fontSize: textSizes.caption }}>
                  {errors.newPassword}
                </HelperText>
              )}

              {/* Confirmation du nouveau mot de passe */}
              <TextInput
                label="Confirmer le nouveau mot de passe *"
                value={formData.confirmPassword}
                onChangeText={(value) => updateField('confirmPassword', value)}
                mode="outlined"
                secureTextEntry={!showConfirmPassword}
                style={styles.input}
                left={<TextInput.Icon icon="lock-check" />}
                right={
                  <TextInput.Icon 
                    icon={showConfirmPassword ? "eye-off" : "eye"} 
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  />
                }
                error={!!errors.confirmPassword}
                theme={{ 
                  fonts: { bodyLarge: { fontSize: textSizes.body } },
                  colors: {
                    primary: theme.colors.primary,
                    background: isDarkMode ? '#2D2D2D' : theme.colors.surface,
                    surface: isDarkMode ? '#2D2D2D' : theme.colors.surface,
                    text: isDarkMode ? '#FFFFFF' : theme.colors.onSurface,
                    placeholder: isDarkMode ? '#888888' : theme.colors.onSurfaceVariant,
                  }
                }}
              />
              {errors.confirmPassword && (
                <HelperText type="error" style={{ fontSize: textSizes.caption }}>
                  {errors.confirmPassword}
                </HelperText>
              )}

              {/* Conseils de sécurité */}
              <Surface style={[styles.securityTips, { 
                backgroundColor: isDarkMode ? '#2A2A2A' : '#F8F9FA',
                borderColor: isDarkMode ? '#444444' : '#E9ECEF'
              }]}>
                <Text style={[styles.tipsTitle, { 
                  fontSize: textSizes.body, 
                  color: theme.colors.primary,
                  fontWeight: 'bold'
                }]}>
                  Conseils pour un mot de passe sécurisé :
                </Text>
                <Text style={[styles.tip, { fontSize: textSizes.caption }]}>
                  • Au moins 6 caractères
                </Text>
                <Text style={[styles.tip, { fontSize: textSizes.caption }]}>
                  • Combinez lettres, chiffres et symboles
                </Text>
                <Text style={[styles.tip, { fontSize: textSizes.caption }]}>
                  • Évitez les informations personnelles
                </Text>
                <Text style={[styles.tip, { fontSize: textSizes.caption }]}>
                  • Utilisez un mot de passe unique
                </Text>
              </Surface>
            </Card.Content>
          </Card>

          {/* Affichage de l'erreur générale */}
          {errors.general && (
            <Surface style={[styles.errorContainer, { 
              backgroundColor: isDarkMode ? '#3A1A1A' : '#FFEBEE',
              borderColor: isDarkMode ? '#5D2A2A' : '#FFCDD2'
            }]}>
              <Text style={[styles.errorText, { 
                fontSize: textSizes.body,
                color: isDarkMode ? '#FF8A80' : '#D32F2F'
              }]}>
                {errors.general}
              </Text>
            </Surface>
          )}

          {/* Boutons d'action */}
          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={handleChangePassword}
              loading={isLoading}
              disabled={isLoading}
              style={[styles.button, {
                backgroundColor: theme.colors.primary
              }]}
              labelStyle={{ fontSize: textSizes.body }}
              icon="lock-reset"
              buttonColor={theme.colors.primary}
            >
              Changer le mot de passe
            </Button>

            <Button
              mode="outlined"
              onPress={() => navigation.goBack()}
              style={[styles.button, {
                borderColor: theme.colors.primary
              }]}
              labelStyle={{ 
                fontSize: textSizes.body,
                color: theme.colors.primary
              }}
              icon="arrow-left"
              textColor={theme.colors.primary}
            >
              Annuler
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  title: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 8,
  },
  email: {
    fontWeight: '500',
    textAlign: 'center',
  },
  formCard: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    marginLeft: 8,
  },
  input: {
    marginBottom: 8,
  },
  divider: {
    marginVertical: 16,
  },
  securityTips: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 16,
  },
  tipsTitle: {
    marginBottom: 8,
  },
  tip: {
    marginBottom: 4,
    color: '#666',
  },
  buttonContainer: {
    gap: 12,
  },
  button: {
    marginBottom: 8,
  },
  errorContainer: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 16,
  },
  errorText: {
    fontWeight: 'bold',
  },
}); 