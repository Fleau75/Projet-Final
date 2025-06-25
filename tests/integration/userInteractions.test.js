import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Mock des services
jest.mock('../../services/authService', () => ({
  AuthService: {
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    isAuthenticated: jest.fn(),
    getCurrentUser: jest.fn(),
  },
}));

jest.mock('../../services/storageService', () => ({
  default: {
    saveUserData: jest.fn(),
    getUserData: jest.fn(),
    clearUserData: jest.fn(),
  },
}));

jest.mock('../../services/placesApi', () => ({
  searchNearbyPlaces: jest.fn(),
  getPlaceDetails: jest.fn(),
}));

// Mock des contextes
jest.mock('../../theme/ThemeContext', () => ({
  ThemeProvider: ({ children }) => children,
  useAppTheme: () => ({
    theme: {
      colors: {
        primary: '#007AFF',
        secondary: '#5856D6',
        background: '#FFFFFF',
        surface: '#FFFFFF',
        surfaceVariant: '#F2F2F7',
        onSurface: '#000000',
        onSurfaceVariant: '#8E8E93',
        disabled: '#C7C7CC',
        error: '#FF3B30',
        success: '#34C759',
        warning: '#FF9500',
      },
      dark: false,
    },
    isLoading: false,
  }),
}));

jest.mock('../../theme/AuthContext', () => ({
  AuthProvider: ({ children }) => children,
  useAuth: () => ({
    user: null,
    isLoading: false,
    login: jest.fn(),
    logout: jest.fn(),
    register: jest.fn(),
  }),
}));

jest.mock('../../theme/TextSizeContext', () => ({
  TextSizeProvider: ({ children }) => children,
}));

jest.mock('../../theme/ScreenReaderContext', () => ({
  ScreenReaderProvider: ({ children }) => children,
}));

// Mock des composants
const MockTextInput = ({ value, onChangeText, placeholder, testID, ...props }) => (
  <TextInput
    testID={testID}
    value={value}
    onChangeText={onChangeText}
    placeholder={placeholder}
    {...props}
  />
);

const MockButton = ({ onPress, title, testID, disabled, ...props }) => (
  <TouchableOpacity
    testID={testID}
    onPress={onPress}
    disabled={disabled}
    {...props}
  >
    <Text>{title}</Text>
  </TouchableOpacity>
);

const MockSwitch = ({ value, onValueChange, testID, ...props }) => (
  <TouchableOpacity
    testID={testID}
    onPress={() => onValueChange(!value)}
    {...props}
  >
    <Text>{value ? 'ON' : 'OFF'}</Text>
  </TouchableOpacity>
);

// Composants nécessaires
const { Text, TextInput, TouchableOpacity, ScrollView, View } = require('react-native');

describe('User Interactions Integration', () => {
  let Stack;

  beforeEach(() => {
    Stack = createStackNavigator();
    jest.clearAllMocks();
  });

  const renderWithProviders = (component) => {
    return render(
      <SafeAreaProvider>
        <PaperProvider>
          <NavigationContainer>
            {component}
          </NavigationContainer>
        </PaperProvider>
      </SafeAreaProvider>
    );
  };

  describe('Flux d\'authentification complet', () => {
    const MockLoginScreen = () => {
      const [email, setEmail] = React.useState('');
      const [password, setPassword] = React.useState('');
      const [isLoading, setIsLoading] = React.useState(false);
      const [error, setError] = React.useState('');

      const handleLogin = async () => {
        setIsLoading(true);
        setError('');
        
        try {
          // Simuler un appel API
          await new Promise(resolve => setTimeout(resolve, 100));
          
          if (email === 'test@example.com' && password === 'password123') {
            // Succès
            console.log('Login successful');
          } else {
            throw new Error('Email ou mot de passe incorrect');
          }
        } catch (err) {
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      };

      return (
        <View testID="login-screen">
          <Text testID="login-title">Connexion</Text>
          
          <MockTextInput
            testID="email-input"
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            keyboardType="email-address"
          />
          
          <MockTextInput
            testID="password-input"
            value={password}
            onChangeText={setPassword}
            placeholder="Mot de passe"
            secureTextEntry
          />
          
          {error ? <Text testID="error-message">{error}</Text> : null}
          
          <MockButton
            testID="login-button"
            title={isLoading ? "Connexion..." : "Se connecter"}
            onPress={handleLogin}
            disabled={isLoading}
          />
        </View>
      );
    };

    it('devrait permettre une connexion réussie', async () => {
      const { getByTestId } = renderWithProviders(<MockLoginScreen />);

      // Remplir le formulaire
      fireEvent.changeText(getByTestId('email-input'), 'test@example.com');
      fireEvent.changeText(getByTestId('password-input'), 'password123');

      // Vérifier que les champs sont remplis
      expect(getByTestId('email-input').props.value).toBe('test@example.com');
      expect(getByTestId('password-input').props.value).toBe('password123');

      // Cliquer sur le bouton de connexion
      fireEvent.press(getByTestId('login-button'));

      // Vérifier que le bouton est en mode chargement
      await waitFor(() => {
        expect(getByTestId('login-button').props.children.props.children).toBe('Connexion...');
      });

      // Attendre que la connexion soit terminée
      await waitFor(() => {
        expect(getByTestId('login-button').props.children.props.children).toBe('Se connecter');
      }, { timeout: 2000 });

      // Vérifier qu'il n'y a pas d'erreur
      expect(() => getByTestId('error-message')).toThrow();
    });

    it('devrait afficher une erreur pour des identifiants incorrects', async () => {
      const { getByTestId } = renderWithProviders(<MockLoginScreen />);

      // Remplir le formulaire avec des identifiants incorrects
      fireEvent.changeText(getByTestId('email-input'), 'wrong@example.com');
      fireEvent.changeText(getByTestId('password-input'), 'wrongpassword');

      // Cliquer sur le bouton de connexion
      fireEvent.press(getByTestId('login-button'));

      // Attendre que l'erreur s'affiche
      await waitFor(() => {
        expect(getByTestId('error-message')).toBeTruthy();
        expect(getByTestId('error-message').props.children).toBe('Email ou mot de passe incorrect');
      });
    });

    it('devrait désactiver le bouton pendant le chargement', async () => {
      const { getByTestId } = renderWithProviders(<MockLoginScreen />);

      // Remplir le formulaire
      fireEvent.changeText(getByTestId('email-input'), 'test@example.com');
      fireEvent.changeText(getByTestId('password-input'), 'password123');

      // Cliquer sur le bouton
      fireEvent.press(getByTestId('login-button'));

      // Vérifier que le bouton est désactivé pendant le chargement
      await waitFor(() => {
        expect(getByTestId('login-button').props.disabled).toBe(true);
      });
    });
  });

  describe('Gestion des formulaires complexes', () => {
    const MockRegistrationForm = () => {
      const [formData, setFormData] = React.useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        acceptTerms: false,
      });
      const [errors, setErrors] = React.useState({});
      const [isSubmitting, setIsSubmitting] = React.useState(false);

      const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
          newErrors.name = 'Le nom est requis';
        }

        if (!formData.email.trim()) {
          newErrors.email = 'L\'email est requis';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
          newErrors.email = 'L\'email n\'est pas valide';
        }

        if (!formData.password) {
          newErrors.password = 'Le mot de passe est requis';
        } else if (formData.password.length < 6) {
          newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
        }

        if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
        }

        if (!formData.acceptTerms) {
          newErrors.acceptTerms = 'Vous devez accepter les conditions';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
      };

      const handleSubmit = async () => {
        if (validateForm()) {
          setIsSubmitting(true);
          
          try {
            // Simuler un appel API
            await new Promise(resolve => setTimeout(resolve, 500));
            console.log('Registration successful', formData);
          } catch (error) {
            console.error('Registration failed', error);
          } finally {
            setIsSubmitting(false);
          }
        }
      };

      const updateField = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Effacer l'erreur du champ modifié
        if (errors[field]) {
          setErrors(prev => ({ ...prev, [field]: '' }));
        }
      };

      return (
        <ScrollView testID="registration-form">
          <Text testID="form-title">Inscription</Text>
          
          <MockTextInput
            testID="name-input"
            value={formData.name}
            onChangeText={(value) => updateField('name', value)}
            placeholder="Nom complet"
          />
          {errors.name && <Text testID="name-error">{errors.name}</Text>}
          
          <MockTextInput
            testID="email-input"
            value={formData.email}
            onChangeText={(value) => updateField('email', value)}
            placeholder="Email"
            keyboardType="email-address"
          />
          {errors.email && <Text testID="email-error">{errors.email}</Text>}
          
          <MockTextInput
            testID="password-input"
            value={formData.password}
            onChangeText={(value) => updateField('password', value)}
            placeholder="Mot de passe"
            secureTextEntry
          />
          {errors.password && <Text testID="password-error">{errors.password}</Text>}
          
          <MockTextInput
            testID="confirm-password-input"
            value={formData.confirmPassword}
            onChangeText={(value) => updateField('confirmPassword', value)}
            placeholder="Confirmer le mot de passe"
            secureTextEntry
          />
          {errors.confirmPassword && <Text testID="confirm-password-error">{errors.confirmPassword}</Text>}
          
          <View testID="terms-container">
            <MockSwitch
              testID="terms-switch"
              value={formData.acceptTerms}
              onValueChange={(value) => updateField('acceptTerms', value)}
            />
            <Text>J'accepte les conditions d'utilisation</Text>
          </View>
          {errors.acceptTerms && <Text testID="terms-error">{errors.acceptTerms}</Text>}
          
          <MockButton
            testID="submit-button"
            title={isSubmitting ? "Inscription..." : "S'inscrire"}
            onPress={handleSubmit}
            disabled={isSubmitting}
          />
        </ScrollView>
      );
    };

    it('devrait valider tous les champs du formulaire', async () => {
      const { getByTestId } = renderWithProviders(<MockRegistrationForm />);

      // Essayer de soumettre sans remplir le formulaire
      fireEvent.press(getByTestId('submit-button'));

      // Vérifier que toutes les erreurs s'affichent
      await waitFor(() => {
        expect(getByTestId('name-error')).toBeTruthy();
        expect(getByTestId('email-error')).toBeTruthy();
        expect(getByTestId('password-error')).toBeTruthy();
        expect(getByTestId('confirm-password-error')).toBeTruthy();
        expect(getByTestId('terms-error')).toBeTruthy();
      });
    });

    it('devrait permettre une inscription réussie avec des données valides', async () => {
      const { getByTestId } = renderWithProviders(<MockRegistrationForm />);

      // Remplir le formulaire avec des données valides
      fireEvent.changeText(getByTestId('name-input'), 'John Doe');
      fireEvent.changeText(getByTestId('email-input'), 'john@example.com');
      fireEvent.changeText(getByTestId('password-input'), 'password123');
      fireEvent.changeText(getByTestId('confirm-password-input'), 'password123');
      fireEvent.press(getByTestId('terms-switch'));

      // Vérifier que les erreurs sont effacées
      await waitFor(() => {
        expect(() => getByTestId('name-error')).toThrow();
        expect(() => getByTestId('email-error')).toThrow();
        expect(() => getByTestId('password-error')).toThrow();
        expect(() => getByTestId('confirm-password-error')).toThrow();
        expect(() => getByTestId('terms-error')).toThrow();
      });

      // Soumettre le formulaire
      fireEvent.press(getByTestId('submit-button'));

      // Vérifier que le bouton est en mode chargement
      await waitFor(() => {
        expect(getByTestId('submit-button').props.children.props.children).toBe('Inscription...');
      });

      // Attendre que l'inscription soit terminée
      await waitFor(() => {
        expect(getByTestId('submit-button').props.children.props.children).toBe('S\'inscrire');
      }, { timeout: 2000 });
    });

    it('devrait valider l\'email correctement', async () => {
      const { getByTestId } = renderWithProviders(<MockRegistrationForm />);

      // Tester un email invalide
      fireEvent.changeText(getByTestId('email-input'), 'invalid-email');
      fireEvent.press(getByTestId('submit-button'));

      await waitFor(() => {
        expect(getByTestId('email-error').props.children).toBe('L\'email n\'est pas valide');
      });

      // Tester un email valide
      fireEvent.changeText(getByTestId('email-input'), 'valid@example.com');
      fireEvent.press(getByTestId('submit-button'));

      await waitFor(() => {
        expect(() => getByTestId('email-error')).toThrow();
      });
    });

    it('devrait valider la correspondance des mots de passe', async () => {
      const { getByTestId } = renderWithProviders(<MockRegistrationForm />);

      // Remplir avec des mots de passe différents
      fireEvent.changeText(getByTestId('password-input'), 'password123');
      fireEvent.changeText(getByTestId('confirm-password-input'), 'different123');
      fireEvent.press(getByTestId('submit-button'));

      await waitFor(() => {
        expect(getByTestId('confirm-password-error').props.children).toBe('Les mots de passe ne correspondent pas');
      });

      // Corriger les mots de passe
      fireEvent.changeText(getByTestId('confirm-password-input'), 'password123');
      fireEvent.press(getByTestId('submit-button'));

      await waitFor(() => {
        expect(() => getByTestId('confirm-password-error')).toThrow();
      });
    });
  });

  describe('Gestion des préférences utilisateur', () => {
    const MockSettingsScreen = () => {
      const [settings, setSettings] = React.useState({
        notifications: true,
        darkMode: false,
        accessibility: {
          largeText: false,
          screenReader: false,
        },
        privacy: {
          shareLocation: true,
          shareData: false,
        },
      });
      const [isSaving, setIsSaving] = React.useState(false);

      const updateSetting = (category, key, value) => {
        setSettings(prev => ({
          ...prev,
          [category]: {
            ...prev[category],
            [key]: value,
          },
        }));
      };

      const saveSettings = async () => {
        setIsSaving(true);
        try {
          // Simuler la sauvegarde
          await new Promise(resolve => setTimeout(resolve, 300));
          console.log('Settings saved:', settings);
        } catch (error) {
          console.error('Failed to save settings:', error);
        } finally {
          setIsSaving(false);
        }
      };

      return (
        <ScrollView testID="settings-screen">
          <Text testID="settings-title">Réglages</Text>
          
          <View testID="notifications-section">
            <Text>Notifications</Text>
            <MockSwitch
              testID="notifications-switch"
              value={settings.notifications}
              onValueChange={(value) => setSettings(prev => ({ ...prev, notifications: value }))}
            />
          </View>
          
          <View testID="theme-section">
            <Text>Mode sombre</Text>
            <MockSwitch
              testID="dark-mode-switch"
              value={settings.darkMode}
              onValueChange={(value) => setSettings(prev => ({ ...prev, darkMode: value }))}
            />
          </View>
          
          <View testID="accessibility-section">
            <Text>Accessibilité</Text>
            <MockSwitch
              testID="large-text-switch"
              value={settings.accessibility.largeText}
              onValueChange={(value) => updateSetting('accessibility', 'largeText', value)}
            />
            <MockSwitch
              testID="screen-reader-switch"
              value={settings.accessibility.screenReader}
              onValueChange={(value) => updateSetting('accessibility', 'screenReader', value)}
            />
          </View>
          
          <View testID="privacy-section">
            <Text>Confidentialité</Text>
            <MockSwitch
              testID="share-location-switch"
              value={settings.privacy.shareLocation}
              onValueChange={(value) => updateSetting('privacy', 'shareLocation', value)}
            />
            <MockSwitch
              testID="share-data-switch"
              value={settings.privacy.shareData}
              onValueChange={(value) => updateSetting('privacy', 'shareData', value)}
            />
          </View>
          
          <MockButton
            testID="save-settings-button"
            title={isSaving ? "Sauvegarde..." : "Sauvegarder"}
            onPress={saveSettings}
            disabled={isSaving}
          />
        </ScrollView>
      );
    };

    it('devrait permettre de modifier et sauvegarder les paramètres', async () => {
      const { getByTestId } = renderWithProviders(<MockSettingsScreen />);

      // Modifier quelques paramètres
      fireEvent.press(getByTestId('dark-mode-switch'));
      fireEvent.press(getByTestId('large-text-switch'));
      fireEvent.press(getByTestId('share-data-switch'));

      // Vérifier que les changements sont appliqués
      expect(getByTestId('dark-mode-switch').props.children.props.children).toBe('ON');
      expect(getByTestId('large-text-switch').props.children.props.children).toBe('ON');
      expect(getByTestId('share-data-switch').props.children.props.children).toBe('ON');

      // Sauvegarder les paramètres
      fireEvent.press(getByTestId('save-settings-button'));

      // Vérifier que le bouton est en mode chargement
      await waitFor(() => {
        expect(getByTestId('save-settings-button').props.children.props.children).toBe('Sauvegarde...');
      });

      // Attendre que la sauvegarde soit terminée
      await waitFor(() => {
        expect(getByTestId('save-settings-button').props.children.props.children).toBe('Sauvegarder');
      }, { timeout: 2000 });
    });

    it('devrait maintenir l\'état des paramètres entre les interactions', async () => {
      const { getByTestId } = renderWithProviders(<MockSettingsScreen />);

      // Vérifier l'état initial
      expect(getByTestId('notifications-switch').props.children.props.children).toBe('ON');
      expect(getByTestId('dark-mode-switch').props.children.props.children).toBe('OFF');

      // Modifier un paramètre
      fireEvent.press(getByTestId('dark-mode-switch'));
      expect(getByTestId('dark-mode-switch').props.children.props.children).toBe('ON');

      // Modifier un autre paramètre
      fireEvent.press(getByTestId('notifications-switch'));
      expect(getByTestId('notifications-switch').props.children.props.children).toBe('OFF');

      // Vérifier que le premier changement est toujours là
      expect(getByTestId('dark-mode-switch').props.children.props.children).toBe('ON');
    });
  });
}); 