import React, { useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { Text, Button, TextInput, Surface, useTheme, Checkbox, HelperText } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTextSize } from '../theme/TextSizeContext';
import { useAuth } from '../theme/AuthContext';
import StorageService from '../services/storageService';

export default function RegisterScreen({ navigation }) {
  const theme = useTheme();
  const { textSizes } = useTextSize();
  const { register, user, logout } = useAuth();
  
  // États pour les champs du formulaire
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Effet pour détecter quand l'utilisateur est connecté et naviguer
  useEffect(() => {
    console.log('🔧 RegisterScreen.useEffect - user changé:', user);
    if (user && !user.isVisitor) {
      console.log('✅ Utilisateur non-visiteur détecté, redirection vers MainTabs...');
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
    }
  }, [user, navigation]);

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

    // Validation du prénom
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Le prénom est obligatoire';
    } else if (formData.firstName.length < 2) {
      newErrors.firstName = 'Le prénom doit contenir au moins 2 caractères';
    }

    // Validation du nom
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Le nom est obligatoire';
    } else if (formData.lastName.length < 2) {
      newErrors.lastName = 'Le nom doit contenir au moins 2 caractères';
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est obligatoire';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Veuillez entrer un email valide';
    }

    // Validation du téléphone (optionnel)
    if (formData.phone && formData.phone.length < 10) {
      newErrors.phone = 'Le numéro de téléphone doit contenir au moins 10 chiffres';
    }

    // Validation du mot de passe
    if (!formData.password) {
      newErrors.password = 'Le mot de passe est obligatoire';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }

    // Validation de la confirmation du mot de passe
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Veuillez confirmer votre mot de passe';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    // Validation des conditions d'utilisation
    if (!acceptTerms) {
      newErrors.terms = 'Vous devez accepter les conditions d\'utilisation';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Gestion de l'inscription
  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      console.log('🔧 RegisterScreen.handleRegister - Début avec:', { 
        email: formData.email, 
        firstName: formData.firstName,
        lastName: formData.lastName 
      });
      
      // Inscription avec le contexte d'authentification
      const result = await register(formData.email, formData.password, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone
      });

      console.log('✅ Inscription réussie ! Résultat:', result);
      console.log('🔧 État user après inscription:', user);
      setIsLoading(false);

      // La migration se fait maintenant automatiquement dans authService.js
      console.log('✅ Inscription terminée, migration automatique effectuée si nécessaire');
      
      // La navigation se fait automatiquement via le contexte
    } catch (err) {
      console.error('❌ Erreur lors de l\'inscription:', err);
      setIsLoading(false);
      Alert.alert(
        "Erreur d'inscription",
        err.message || "Une erreur est survenue. Veuillez réessayer.",
        [{ text: "OK" }]
      );
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerContainer}>
            <Text style={[styles.title, { color: theme.colors.primary, fontSize: textSizes.headline }]}>
              Rejoignez AccessPlus
            </Text>
            <Text style={[styles.subtitle, { fontSize: textSizes.body, color: theme.colors.onSurfaceVariant }]}>
              Créez votre compte pour partager et découvrir des lieux accessibles
            </Text>
          </View>

          <Surface style={[styles.surface, { backgroundColor: theme.colors.surface }]}>
            {/* Prénom */}
            <TextInput
              label="Prénom *"
              value={formData.firstName}
              onChangeText={(value) => updateField('firstName', value)}
              mode="outlined"
              style={styles.input}
              left={<TextInput.Icon icon="account" />}
              error={!!errors.firstName}
            />
            {errors.firstName && (
              <HelperText type="error" style={{ fontSize: textSizes.caption }}>
                {errors.firstName}
              </HelperText>
            )}

            {/* Nom */}
            <TextInput
              label="Nom *"
              value={formData.lastName}
              onChangeText={(value) => updateField('lastName', value)}
              mode="outlined"
              style={styles.input}
              left={<TextInput.Icon icon="account" />}
              error={!!errors.lastName}
            />
            {errors.lastName && (
              <HelperText type="error" style={{ fontSize: textSizes.caption }}>
                {errors.lastName}
              </HelperText>
            )}

            {/* Email */}
            <TextInput
              label="Email *"
              value={formData.email}
              onChangeText={(value) => updateField('email', value)}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
              left={<TextInput.Icon icon="email" />}
              error={!!errors.email}
            />
            {errors.email && (
              <HelperText type="error" style={{ fontSize: textSizes.caption }}>
                {errors.email}
              </HelperText>
            )}

            {/* Téléphone */}
            <TextInput
              label="Téléphone (optionnel)"
              value={formData.phone}
              onChangeText={(value) => updateField('phone', value)}
              mode="outlined"
              keyboardType="phone-pad"
              style={styles.input}
              left={<TextInput.Icon icon="phone" />}
              error={!!errors.phone}
            />
            {errors.phone && (
              <HelperText type="error" style={{ fontSize: textSizes.caption }}>
                {errors.phone}
              </HelperText>
            )}

            {/* Mot de passe */}
            <TextInput
              label="Mot de passe *"
              value={formData.password}
              onChangeText={(value) => updateField('password', value)}
              mode="outlined"
              secureTextEntry={!showPassword}
              style={styles.input}
              left={<TextInput.Icon icon="lock" />}
              right={
                <TextInput.Icon 
                  icon={showPassword ? "eye-off" : "eye"} 
                  onPress={() => setShowPassword(!showPassword)}
                  forceTextInputFocus={false}
                  accessibilityRole="button"
                  accessibilityLabel={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                />
              }
              error={!!errors.password}
              accessible={true}
              accessibilityLabel="Champ mot de passe"
              accessibilityHint="Entrez votre mot de passe"
            />
            {errors.password && (
              <HelperText type="error" style={{ fontSize: textSizes.caption }}>
                {errors.password}
              </HelperText>
            )}

            {/* Confirmation mot de passe */}
            <TextInput
              label="Confirmer le mot de passe *"
              value={formData.confirmPassword}
              onChangeText={(value) => updateField('confirmPassword', value)}
              mode="outlined"
              secureTextEntry={!showConfirmPassword}
              style={styles.input}
              left={<TextInput.Icon icon="lock" />}
              right={
                <TextInput.Icon 
                  icon={showConfirmPassword ? "eye-off" : "eye"} 
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  forceTextInputFocus={false}
                  accessibilityRole="button"
                  accessibilityLabel={showConfirmPassword ? "Masquer la confirmation" : "Afficher la confirmation"}
                />
              }
              error={!!errors.confirmPassword}
              accessible={true}
              accessibilityLabel="Champ confirmation mot de passe"
              accessibilityHint="Confirmez votre mot de passe"
            />
            {errors.confirmPassword && (
              <HelperText type="error" style={{ fontSize: textSizes.caption }}>
                {errors.confirmPassword}
              </HelperText>
            )}

            {/* Conditions d'utilisation */}
            <View style={styles.termsContainer}>
              <Checkbox
                status={acceptTerms ? 'checked' : 'unchecked'}
                onPress={() => setAcceptTerms(!acceptTerms)}
                uncheckedColor={errors.terms ? theme.colors.error : undefined}
              />
              <Text style={[styles.termsText, { fontSize: textSizes.body }]}>
                J'accepte les{' '}
                <Text style={{ color: theme.colors.primary, textDecorationLine: 'underline' }}>
                  conditions d'utilisation
                </Text>
                {' '}et la{' '}
                <Text style={{ color: theme.colors.primary, textDecorationLine: 'underline' }}>
                  politique de confidentialité
                </Text>
              </Text>
            </View>
            {errors.terms && (
              <HelperText type="error" style={{ fontSize: textSizes.caption }}>
                {errors.terms}
              </HelperText>
            )}

            {/* Bouton d'inscription */}
            <Button
              mode="contained"
              onPress={handleRegister}
              loading={isLoading}
              disabled={isLoading}
              style={styles.button}
              labelStyle={{ fontSize: textSizes.body }}
              icon="account-plus"
            >
              Créer mon compte
            </Button>

            {/* Lien vers la connexion */}
            <View style={styles.loginContainer}>
              <Text style={{ fontSize: textSizes.body, color: theme.colors.onSurfaceVariant }}>
                Vous avez déjà un compte ?
              </Text>
              <Button
                mode="text"
                onPress={async () => {
                  try {
                    console.log('🔓 Déconnexion depuis RegisterScreen...');
                    // Toujours déconnecter pour retourner à l'écran de connexion
                    await logout();
                    console.log('✅ Déconnexion réussie');
                    
                    // Attendre que la déconnexion soit complètement terminée
                    // et que l'App.js ait basculé vers le navigateur d'authentification
                    setTimeout(() => {
                      console.log('🔄 Redirection vers Login...');
                      navigation.reset({
                        index: 0,
                        routes: [{ name: 'Login' }],
                      });
                    }, 100);
                    
                  } catch (error) {
                    console.error('❌ Erreur lors de la déconnexion:', error);
                    // En cas d'erreur, forcer la redirection quand même
                    setTimeout(() => {
                      navigation.reset({
                        index: 0,
                        routes: [{ name: 'Login' }],
                      });
                    }, 100);
                  }
                }}
                style={styles.loginButton}
                labelStyle={{ fontSize: textSizes.body }}
              >
                Se connecter
              </Button>
            </View>
          </Surface>
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
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.8,
    marginHorizontal: 20,
    lineHeight: 22,
  },
  surface: {
    padding: 24,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  input: {
    marginBottom: 8,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 16,
    paddingHorizontal: 8,
  },
  termsText: {
    flex: 1,
    marginLeft: 8,
    lineHeight: 20,
  },
  button: {
    marginTop: 16,
    marginBottom: 16,
    paddingVertical: 4,
  },
  loginContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  loginButton: {
    marginLeft: 4,
  },
}); 