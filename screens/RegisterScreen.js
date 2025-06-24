import React, { useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { Text, Button, TextInput, Surface, useTheme, Checkbox, HelperText } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTextSize } from '../theme/TextSizeContext';
import { useAuth } from '../theme/AuthContext';
import StorageService from '../services/storageService';
import { useFocusEffect } from '@react-navigation/native';

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
  
  // Nouveaux états pour la migration des données visiteur
  const [hasVisitorData, setHasVisitorData] = useState(false);
  const [migrateVisitorData, setMigrateVisitorData] = useState(true);
  const [visitorDataDetails, setVisitorDataDetails] = useState({
    favorites: 0,
    mapMarkers: 0,
    reviews: 0
  });
  const [isCheckingVisitorData, setIsCheckingVisitorData] = useState(true);
  const [visitorDataError, setVisitorDataError] = useState('');

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

  // Rafraîchir la détection à chaque focus de l'écran
  useFocusEffect(
    React.useCallback(() => {
      checkVisitorData();
    }, [])
  );

  // Fonction pour vérifier les données visiteur disponibles
  const checkVisitorData = async () => {
    setIsCheckingVisitorData(true);
    setVisitorDataError('');
    try {
      console.log('🔍 Vérification des données visiteur...');
      const visitorData = await StorageService.getAllUserData('visitor');
      console.log('📊 Données visiteur brutes:', visitorData);
      console.log('📊 Clés visiteur trouvées:', Object.keys(visitorData));
      
      if (visitorData && Object.keys(visitorData).length > 0) {
        console.log('✅ Données visiteur trouvées:', Object.keys(visitorData));
        
        // Compter les différents types de données
        const details = {
          favorites: visitorData.favorites ? visitorData.favorites.length : 0,
          mapMarkers: visitorData.mapMarkers ? visitorData.mapMarkers.length : 0,
          reviews: 0 // Sera mis à jour plus tard si nécessaire
        };
        
        console.log('📊 Détails calculés:', details);
        
        // Vérifier les avis Firebase du visiteur
        try {
          const { ReviewsService } = await import('../services/firebaseService');
          const visitorReviews = await ReviewsService.getReviewsByUserId('visiteur@accessplus.com', 'visiteur@accessplus.com');
          details.reviews = visitorReviews ? visitorReviews.length : 0;
          console.log(`📝 ${details.reviews} avis Firebase trouvés pour le visiteur`);
        } catch (firebaseError) {
          console.log('⚠️ Impossible de récupérer les avis Firebase:', firebaseError.message);
          details.reviews = 0;
        }
        
        setVisitorDataDetails(details);
        setHasVisitorData(true);
        setMigrateVisitorData(true); // Par défaut, proposer la migration
        
        console.log('📊 Détails finaux des données visiteur:', details);
        console.log('✅ État mis à jour: hasVisitorData=true, migrateVisitorData=true');
      } else {
        console.log('❌ Aucune donnée visiteur trouvée');
        setHasVisitorData(false);
        setMigrateVisitorData(false);
      }
    } catch (error) {
      console.error('❌ Erreur lors de la vérification des données visiteur:', error);
      setHasVisitorData(false);
      setMigrateVisitorData(false);
      setVisitorDataError('Erreur lors de la détection des données visiteur.');
    } finally {
      setIsCheckingVisitorData(false);
    }
  };

  // Fonction pour gérer le changement de la checkbox de migration
  const handleMigrationToggle = () => {
    if (migrateVisitorData) {
      // L'utilisateur veut désactiver la migration - afficher une alerte de confirmation
      Alert.alert(
        "⚠️ Attention",
        "Si vous désactivez la récupération, toutes vos données du mode visiteur seront définitivement supprimées et vous ne pourrez plus les récupérer.\n\nÊtes-vous sûr de vouloir continuer ?",
        [
          {
            text: "Annuler",
            style: "cancel",
            onPress: () => {
              // Garder la migration activée
              console.log('✅ Migration maintenue par l\'utilisateur');
            }
          },
          {
            text: "Supprimer mes données",
            style: "destructive",
            onPress: () => {
              setMigrateVisitorData(false);
              console.log('❌ Migration désactivée par l\'utilisateur - données seront supprimées');
            }
          }
        ]
      );
    } else {
      // L'utilisateur veut activer la migration - pas de confirmation nécessaire
      setMigrateVisitorData(true);
      console.log('✅ Migration activée par l\'utilisateur');
    }
  };

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
        lastName: formData.lastName,
        hasVisitorData,
        migrateVisitorData
      });
      
      // Inscription avec le contexte d'authentification
      const result = await register(formData.email, formData.password, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        migrateVisitorData: hasVisitorData && migrateVisitorData // Passer l'option de migration
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
              style={styles.input}
              left={<TextInput.Icon icon="email" />}
              keyboardType="email-address"
              autoCapitalize="none"
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
              style={styles.input}
              left={<TextInput.Icon icon="phone" />}
              keyboardType="phone-pad"
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
              style={styles.input}
              left={<TextInput.Icon icon="lock" />}
              right={<TextInput.Icon icon={showPassword ? "eye-off" : "eye"} onPress={() => setShowPassword(!showPassword)} />}
              secureTextEntry={!showPassword}
              error={!!errors.password}
            />
            {errors.password && (
              <HelperText type="error" style={{ fontSize: textSizes.caption }}>
                {errors.password}
              </HelperText>
            )}

            {/* Confirmation du mot de passe */}
            <TextInput
              label="Confirmer le mot de passe *"
              value={formData.confirmPassword}
              onChangeText={(value) => updateField('confirmPassword', value)}
              mode="outlined"
              style={styles.input}
              left={<TextInput.Icon icon="lock-check" />}
              right={<TextInput.Icon icon={showConfirmPassword ? "eye-off" : "eye"} onPress={() => setShowConfirmPassword(!showConfirmPassword)} />}
              secureTextEntry={!showConfirmPassword}
              error={!!errors.confirmPassword}
            />
            {errors.confirmPassword && (
              <HelperText type="error" style={{ fontSize: textSizes.caption }}>
                {errors.confirmPassword}
              </HelperText>
            )}

            {/* Section migration des données visiteur */}
            {isCheckingVisitorData ? (
              <View style={{ alignItems: 'center', marginVertical: 16 }}>
                <Text style={{ color: theme.colors.onSurface }}>Recherche de données visiteur...</Text>
              </View>
            ) : visitorDataError ? (
              <View style={{ alignItems: 'center', marginVertical: 16 }}>
                <Text style={{ color: theme.colors.error }}>{visitorDataError}</Text>
              </View>
            ) : hasVisitorData ? (
              <View style={[styles.migrationSection, { 
                borderColor: theme.colors.outline,
                backgroundColor: theme.colors.surfaceVariant 
              }]}>
                <Text style={[styles.migrationTitle, { fontSize: textSizes.title, color: theme.colors.primary }]}>
                  📱 Récupérer vos données ?
                </Text>
                
                <View style={styles.migrationDetails}>
                  {visitorDataDetails.favorites > 0 && (
                    <Text style={[styles.migrationDetail, { fontSize: textSizes.caption, color: theme.colors.onSurface }]}>
                      ❤️ {visitorDataDetails.favorites} lieu(x) favori(s)
                    </Text>
                  )}
                  {visitorDataDetails.mapMarkers > 0 && (
                    <Text style={[styles.migrationDetail, { fontSize: textSizes.caption, color: theme.colors.onSurface }]}>
                      📍 {visitorDataDetails.mapMarkers} marqueur(s) de carte
                    </Text>
                  )}
                  {visitorDataDetails.reviews > 0 && (
                    <Text style={[styles.migrationDetail, { fontSize: textSizes.caption, color: theme.colors.onSurface }]}>
                      ⭐ {visitorDataDetails.reviews} avis
                    </Text>
                  )}
                </View>

                <Checkbox.Item
                  label="Récupérer mes données du mode visiteur"
                  status={migrateVisitorData ? 'checked' : 'unchecked'}
                  onPress={handleMigrationToggle}
                  style={styles.migrationCheckbox}
                  labelStyle={{ color: theme.colors.onSurface }}
                />
                
                {!migrateVisitorData && (
                  <Text style={[styles.migrationWarning, { fontSize: textSizes.caption, color: theme.colors.error }]}>
                    ⚠️ Attention : Vos données seront définitivement supprimées
                  </Text>
                )}
              </View>
            ) : (
              <View style={{ alignItems: 'center', marginVertical: 16 }}>
                <Text style={{ color: theme.colors.onSurfaceVariant, opacity: 0.7 }}>Aucune donnée visiteur détectée.</Text>
              </View>
            )}

            {/* Conditions d'utilisation */}
            <Checkbox.Item
              label="J'accepte les conditions d'utilisation et la politique de confidentialité"
              status={acceptTerms ? 'checked' : 'unchecked'}
              onPress={() => setAcceptTerms(!acceptTerms)}
              style={styles.termsCheckbox}
            />
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
              style={styles.registerButton}
              icon="account-plus"
            >
              {isLoading ? 'Création en cours...' : 'Créer mon compte'}
            </Button>

            {/* Lien vers la connexion */}
            <View style={styles.loginContainer}>
              <Text style={[styles.loginText, { fontSize: textSizes.body, color: theme.colors.onSurfaceVariant }]}>
                Déjà un compte ?
              </Text>
              <Button
                mode="text"
                onPress={() => navigation.navigate('Login')}
                style={styles.loginButton}
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
  migrationSection: {
    marginTop: 20,
    padding: 16,
    borderWidth: 1,
    borderRadius: 8,
  },
  migrationTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  migrationSubtitle: {
    marginBottom: 16,
  },
  migrationDetails: {
    marginBottom: 16,
  },
  migrationDetail: {
    marginBottom: 4,
  },
  migrationCheckbox: {
    marginTop: 8,
  },
  termsCheckbox: {
    marginTop: 8,
  },
  registerButton: {
    marginTop: 16,
    marginBottom: 16,
    paddingVertical: 4,
  },
  loginText: {
    marginRight: 8,
  },
  migrationWarning: {
    marginTop: 8,
  },
}); 