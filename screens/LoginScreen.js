import React, { useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Text, Button, TextInput, Surface, useTheme, Switch } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTextSize } from '../theme/TextSizeContext';
import { useAuth } from '../theme/AuthContext';
import { BiometricService } from '../services/biometricService';
import { useAppTheme } from '../theme/ThemeContext';

export default function LoginScreen({ navigation }) {
  const theme = useTheme();
  const { isDarkMode } = useAppTheme();
  const { textSizes } = useTextSize();
  const { login, register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [lastEmail, setLastEmail] = useState('');

  // Vérifier la disponibilité de la biométrie au montage
  useEffect(() => {
    checkBiometricAvailability();
  }, []);

  const checkBiometricAvailability = async () => {
    try {
      const isAvailable = await BiometricService.isBiometricAvailable();
      setBiometricAvailable(isAvailable);
      
      if (isAvailable) {
        const prefs = await BiometricService.loadBiometricPreferences();
        setBiometricEnabled(prefs.enabled);
        setLastEmail(prefs.email || '');
        
        // Si la biométrie est activée, proposer l'authentification automatique
        if (prefs.enabled && prefs.email) {
          setTimeout(() => {
            handleBiometricLogin();
          }, 1000); // Délai pour laisser l'écran se charger
        }
      }
    } catch (error) {
      console.error('Erreur lors de la vérification biométrie:', error);
    }
  };

  const handleBiometricLogin = async () => {
    if (!biometricAvailable || !biometricEnabled) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await BiometricService.autoAuthenticateWithBiometrics(lastEmail);
      
      if (result.success) {
        // Récupérer les informations de connexion sauvegardées
        const storedPassword = await getStoredPassword(lastEmail);
        
        if (storedPassword) {
          await login(lastEmail, storedPassword);
          console.log('✅ Connexion biométrique réussie');
        } else {
          setError('Impossible de récupérer les informations de connexion');
        }
      } else {
        console.log('❌ Authentification biométrique échouée:', result.reason);
        // Ne pas afficher d'erreur, l'utilisateur peut toujours utiliser le mot de passe
      }
    } catch (error) {
      console.error('Erreur lors de la connexion biométrique:', error);
      setError('Erreur lors de l\'authentification biométrique');
    } finally {
      setIsLoading(false);
    }
  };

  const getStoredPassword = async (email) => {
    try {
      // Pour les utilisateurs de test
      const testUserKey = `user_${email}`;
      const testUser = await AsyncStorage.getItem(testUserKey);
      
      if (testUser) {
        const userData = JSON.parse(testUser);
        return userData.password;
      }
      
      // Pour les utilisateurs normaux
      const userProfile = await AsyncStorage.getItem('userProfile');
      if (userProfile) {
        const profile = JSON.parse(userProfile);
        if (profile.email === email) {
          return await AsyncStorage.getItem('userPassword');
        }
      }
      
      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération du mot de passe:', error);
      return null;
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      console.log('🔍 Tentative de connexion avec:', { email, password });
      
      // Connexion avec le contexte d'authentification
      const result = await login(email, password);

      if (!result.success) {
        setError(result.error || 'Erreur de connexion. Veuillez réessayer.');
        setIsLoading(false);
        return;
      }
      
      console.log('✅ Connexion réussie !');
      
      // Proposer d'activer la biométrie après une connexion réussie
      if (biometricAvailable && !biometricEnabled) {
        setTimeout(() => {
          showBiometricSetupDialog();
        }, 500);
      }
      
      // La navigation se fait automatiquement via le contexte
    } catch (err) {
      // Ce bloc ne devrait plus être atteint pour les erreurs de login,
      // mais on le garde pour les erreurs inattendues.
      setError('Une erreur inattendue est survenue.');
      setIsLoading(false);
    }
  };

  const showBiometricSetupDialog = () => {
    Alert.alert(
      "🔐 Authentification biométrique",
      "Voulez-vous activer l'authentification par empreinte digitale ou reconnaissance faciale pour vous connecter plus rapidement ?",
      [
        {
          text: "Plus tard",
          style: "cancel"
        },
        {
          text: "Activer",
          onPress: () => setupBiometricAuthentication()
        }
      ]
    );
  };

  const setupBiometricAuthentication = async () => {
    try {
      const result = await BiometricService.authenticateWithBiometrics(
        'Configurez l\'authentification biométrique'
      );
      
      if (result.success) {
        await BiometricService.saveBiometricPreferences(true, email);
        setBiometricEnabled(true);
        setLastEmail(email);
        
        Alert.alert(
          "✅ Biométrie activée",
          "Vous pouvez maintenant vous connecter avec votre empreinte digitale ou reconnaissance faciale !"
        );
      } else {
        Alert.alert(
          "❌ Échec de la configuration",
          BiometricService.getErrorMessage(result.error)
        );
      }
    } catch (error) {
      console.error('Erreur lors de la configuration biométrie:', error);
      Alert.alert("Erreur", "Impossible de configurer l'authentification biométrique");
    }
  };

  const handleContinueWithoutAccount = async () => {
    setIsLoading(true);
    try {
      // Créer un utilisateur temporaire pour le mode "sans compte"
      await register('visiteur@accessplus.com', '123456', {
        firstName: 'Visiteur',
        lastName: 'AccessPlus',
        email: 'visiteur@accessplus.com',
        phone: ''
      });
      // La navigation se fait automatiquement via le contexte
    } catch (err) {
      console.error('Erreur lors de la création du compte visiteur:', err);
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? '#121212' : '#F1F5F9' }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.headerContainer}>
          <Text style={[styles.title, { 
            color: isDarkMode ? '#FFFFFF' : theme.colors.primary, 
            fontSize: 42 
          }]}>
            AccessPlus
          </Text>
          <Text style={[styles.subtitle, { 
            fontSize: textSizes.subtitle,
            color: isDarkMode ? '#B0B0B0' : '#666666'
          }]}>
            Trouvez facilement des lieux accessibles
          </Text>
        </View>

        <Surface style={[styles.surface, { 
          backgroundColor: isDarkMode ? '#1E1E1E' : theme.colors.surface,
          borderColor: isDarkMode ? '#333333' : 'transparent',
          borderWidth: isDarkMode ? 1 : 0
        }]}>
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
            left={<TextInput.Icon icon="email" />}
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

          <TextInput
            label="Mot de passe"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            secureTextEntry
            style={styles.input}
            left={<TextInput.Icon icon="lock" />}
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

          {/* Bouton mot de passe oublié */}
          <Button
            mode="text"
            onPress={() => navigation.navigate('ForgotPassword')}
            style={styles.forgotPasswordButton}
            labelStyle={{ 
              fontSize: textSizes.caption,
              color: theme.colors.primary
            }}
            compact
          >
            Mot de passe oublié ?
          </Button>

          {error ? (
            <Text style={[styles.error, { 
              color: isDarkMode ? '#CF6679' : theme.colors.error, 
              fontSize: textSizes.body 
            }]}>
              {error}
            </Text>
          ) : null}

          <Button
            mode="contained"
            onPress={handleLogin}
            loading={isLoading}
            style={[styles.button, {
              backgroundColor: theme.colors.primary
            }]}
            labelStyle={{ fontSize: textSizes.body }}
            buttonColor={theme.colors.primary}
          >
            Se connecter
          </Button>

          {/* Bouton d'authentification biométrique */}
          {biometricAvailable && biometricEnabled && (
            <Button
              mode="outlined"
              onPress={handleBiometricLogin}
              loading={isLoading}
              style={[styles.button, {
                borderColor: theme.colors.primary
              }]}
              labelStyle={{ 
                fontSize: textSizes.body,
                color: theme.colors.primary
              }}
              icon="fingerprint"
              textColor={theme.colors.primary}
            >
              Se connecter avec la biométrie
            </Button>
          )}

          <Button
            mode="outlined"
            onPress={handleContinueWithoutAccount}
            loading={isLoading}
            style={[styles.button, {
              borderColor: theme.colors.primary
            }]}
            labelStyle={{ 
              fontSize: textSizes.body,
              color: theme.colors.primary
            }}
            textColor={theme.colors.primary}
          >
            Continuer sans compte
          </Button>

          <View style={styles.registerContainer}>
            <Text style={{ 
              fontSize: textSizes.body,
              color: isDarkMode ? '#B0B0B0' : theme.colors.onSurface
            }}>
              Vous n'avez pas de compte ?
            </Text>
            <Button
              mode="text"
              onPress={() => navigation.navigate('Register')}
              style={styles.registerButton}
              labelStyle={{ 
                fontSize: textSizes.body,
                color: theme.colors.primary
              }}
            >
              S'inscrire
            </Button>
          </View>
        </Surface>
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
    justifyContent: 'center',
    padding: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.7,
  },
  surface: {
    padding: 20,
    borderRadius: 12,
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
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
    marginBottom: 8,
  },
  registerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  registerButton: {
    marginLeft: 4,
  },
  error: {
    textAlign: 'center',
    marginBottom: 16,
  },
  forgotPasswordButton: {
    marginBottom: 8,
  },
});
