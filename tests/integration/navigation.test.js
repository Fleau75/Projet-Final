import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

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

// Mock des écrans
const MockLoginScreen = ({ navigation }) => (
  <React.Fragment>
    <Text testID="login-screen">Login Screen</Text>
    <TouchableOpacity 
      testID="login-button" 
      onPress={() => navigation.navigate('Register')}
    >
      <Text>Go to Register</Text>
    </TouchableOpacity>
    <TouchableOpacity 
      testID="forgot-password-button" 
      onPress={() => navigation.navigate('ForgotPassword')}
    >
      <Text>Forgot Password</Text>
    </TouchableOpacity>
  </React.Fragment>
);

const MockRegisterScreen = ({ navigation }) => (
  <React.Fragment>
    <Text testID="register-screen">Register Screen</Text>
    <TouchableOpacity 
      testID="back-to-login-button" 
      onPress={() => navigation.goBack()}
    >
      <Text>Back to Login</Text>
    </TouchableOpacity>
  </React.Fragment>
);

const MockForgotPasswordScreen = ({ navigation }) => (
  <React.Fragment>
    <Text testID="forgot-password-screen">Forgot Password Screen</Text>
    <TouchableOpacity 
      testID="back-to-login-button" 
      onPress={() => navigation.goBack()}
    >
      <Text>Back to Login</Text>
    </TouchableOpacity>
  </React.Fragment>
);

const MockHomeScreen = ({ navigation }) => (
  <React.Fragment>
    <Text testID="home-screen">Home Screen</Text>
    <TouchableOpacity 
      testID="go-to-map-button" 
      onPress={() => navigation.navigate('Map')}
    >
      <Text>Go to Map</Text>
    </TouchableOpacity>
    <TouchableOpacity 
      testID="go-to-profile-button" 
      onPress={() => navigation.navigate('Profile')}
    >
      <Text>Go to Profile</Text>
    </TouchableOpacity>
  </React.Fragment>
);

const MockMapScreen = ({ navigation }) => (
  <React.Fragment>
    <Text testID="map-screen">Map Screen</Text>
    <TouchableOpacity 
      testID="back-to-home-button" 
      onPress={() => navigation.goBack()}
    >
      <Text>Back to Home</Text>
    </TouchableOpacity>
  </React.Fragment>
);

const MockProfileScreen = ({ navigation }) => (
  <React.Fragment>
    <Text testID="profile-screen">Profile Screen</Text>
    <TouchableOpacity 
      testID="go-to-settings-button" 
      onPress={() => navigation.navigate('Settings')}
    >
      <Text>Go to Settings</Text>
    </TouchableOpacity>
  </React.Fragment>
);

const MockSettingsScreen = ({ navigation }) => (
  <React.Fragment>
    <Text testID="settings-screen">Settings Screen</Text>
    <TouchableOpacity 
      testID="back-to-profile-button" 
      onPress={() => navigation.goBack()}
    >
      <Text>Back to Profile</Text>
    </TouchableOpacity>
  </React.Fragment>
);

// Composants nécessaires pour les mocks
const { Text, TouchableOpacity } = require('react-native');

describe('Navigation Integration', () => {
  let Stack;
  let navigation;

  beforeEach(() => {
    Stack = createStackNavigator();
  });

  const renderWithNavigation = (initialRouteName = 'Login') => {
    const TestNavigator = () => (
      <SafeAreaProvider>
        <PaperProvider>
          <NavigationContainer>
            <Stack.Navigator initialRouteName={initialRouteName}>
              <Stack.Screen name="Login" component={MockLoginScreen} />
              <Stack.Screen name="Register" component={MockRegisterScreen} />
              <Stack.Screen name="ForgotPassword" component={MockForgotPasswordScreen} />
              <Stack.Screen name="Home" component={MockHomeScreen} />
              <Stack.Screen name="Map" component={MockMapScreen} />
              <Stack.Screen name="Profile" component={MockProfileScreen} />
              <Stack.Screen name="Settings" component={MockSettingsScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </PaperProvider>
      </SafeAreaProvider>
    );

    const { getByTestId } = render(<TestNavigator />);
    
    // Récupérer la navigation depuis le premier écran
    const loginScreen = getByTestId('login-screen');
    navigation = loginScreen.parent.parent.props.navigation;

    return { getByTestId };
  };

  describe('Navigation entre écrans d\'authentification', () => {
    it('devrait naviguer de Login vers Register', async () => {
      const { getByTestId } = renderWithNavigation();

      fireEvent.press(getByTestId('login-button'));

      await waitFor(() => {
        expect(getByTestId('register-screen')).toBeTruthy();
      });
    });

    it('devrait naviguer de Login vers ForgotPassword', async () => {
      const { getByTestId } = renderWithNavigation();

      fireEvent.press(getByTestId('forgot-password-button'));

      await waitFor(() => {
        expect(getByTestId('forgot-password-screen')).toBeTruthy();
      });
    });

    it('devrait revenir de Register vers Login', async () => {
      const { getByTestId } = renderWithNavigation();

      // Aller d'abord à Register
      fireEvent.press(getByTestId('login-button'));
      await waitFor(() => {
        expect(getByTestId('register-screen')).toBeTruthy();
      });

      // Revenir à Login
      fireEvent.press(getByTestId('back-to-login-button'));

      await waitFor(() => {
        expect(getByTestId('login-screen')).toBeTruthy();
      });
    });

    it('devrait revenir de ForgotPassword vers Login', async () => {
      const { getByTestId } = renderWithNavigation();

      // Aller d'abord à ForgotPassword
      fireEvent.press(getByTestId('forgot-password-button'));
      await waitFor(() => {
        expect(getByTestId('forgot-password-screen')).toBeTruthy();
      });

      // Revenir à Login
      fireEvent.press(getByTestId('back-to-login-button'));

      await waitFor(() => {
        expect(getByTestId('login-screen')).toBeTruthy();
      });
    });
  });

  describe('Navigation dans l\'application principale', () => {
    it('devrait naviguer de Home vers Map', async () => {
      const { getByTestId } = renderWithNavigation('Home');

      fireEvent.press(getByTestId('go-to-map-button'));

      await waitFor(() => {
        expect(getByTestId('map-screen')).toBeTruthy();
      });
    });

    it('devrait naviguer de Home vers Profile', async () => {
      const { getByTestId } = renderWithNavigation('Home');

      fireEvent.press(getByTestId('go-to-profile-button'));

      await waitFor(() => {
        expect(getByTestId('profile-screen')).toBeTruthy();
      });
    });

    it('devrait revenir de Map vers Home', async () => {
      const { getByTestId } = renderWithNavigation('Home');

      // Aller d'abord à Map
      fireEvent.press(getByTestId('go-to-map-button'));
      await waitFor(() => {
        expect(getByTestId('map-screen')).toBeTruthy();
      });

      // Revenir à Home
      fireEvent.press(getByTestId('back-to-home-button'));

      await waitFor(() => {
        expect(getByTestId('home-screen')).toBeTruthy();
      });
    });

    it('devrait naviguer de Profile vers Settings', async () => {
      const { getByTestId } = renderWithNavigation('Profile');

      fireEvent.press(getByTestId('go-to-settings-button'));

      await waitFor(() => {
        expect(getByTestId('settings-screen')).toBeTruthy();
      });
    });

    it('devrait revenir de Settings vers Profile', async () => {
      const { getByTestId } = renderWithNavigation('Profile');

      // Aller d'abord à Settings
      fireEvent.press(getByTestId('go-to-settings-button'));
      await waitFor(() => {
        expect(getByTestId('settings-screen')).toBeTruthy();
      });

      // Revenir à Profile
      fireEvent.press(getByTestId('back-to-profile-button'));

      await waitFor(() => {
        expect(getByTestId('profile-screen')).toBeTruthy();
      });
    });
  });

  describe('Navigation complexe', () => {
    it('devrait permettre une navigation en chaîne', async () => {
      const { getByTestId } = renderWithNavigation('Home');

      // Home -> Map
      fireEvent.press(getByTestId('go-to-map-button'));
      await waitFor(() => {
        expect(getByTestId('map-screen')).toBeTruthy();
      });

      // Map -> Home (retour)
      fireEvent.press(getByTestId('back-to-home-button'));
      await waitFor(() => {
        expect(getByTestId('home-screen')).toBeTruthy();
      });

      // Home -> Profile
      fireEvent.press(getByTestId('go-to-profile-button'));
      await waitFor(() => {
        expect(getByTestId('profile-screen')).toBeTruthy();
      });

      // Profile -> Settings
      fireEvent.press(getByTestId('go-to-settings-button'));
      await waitFor(() => {
        expect(getByTestId('settings-screen')).toBeTruthy();
      });

      // Settings -> Profile (retour)
      fireEvent.press(getByTestId('back-to-profile-button'));
      await waitFor(() => {
        expect(getByTestId('profile-screen')).toBeTruthy();
      });
    });

    it('devrait maintenir l\'état de navigation correct', async () => {
      const { getByTestId } = renderWithNavigation('Home');

      // Vérifier que nous sommes bien sur Home au début
      expect(getByTestId('home-screen')).toBeTruthy();

      // Naviguer vers Map
      fireEvent.press(getByTestId('go-to-map-button'));
      await waitFor(() => {
        expect(getByTestId('map-screen')).toBeTruthy();
      });

      // Vérifier que Home n'est plus visible
      expect(() => getByTestId('home-screen')).toThrow();

      // Revenir à Home
      fireEvent.press(getByTestId('back-to-home-button'));
      await waitFor(() => {
        expect(getByTestId('home-screen')).toBeTruthy();
      });

      // Vérifier que Map n'est plus visible
      expect(() => getByTestId('map-screen')).toThrow();
    });
  });

  describe('Gestion des erreurs de navigation', () => {
    it('devrait gérer les tentatives de navigation vers des écrans inexistants', () => {
      const { getByTestId } = renderWithNavigation('Home');

      // Tenter de naviguer vers un écran inexistant
      expect(() => {
        navigation.navigate('NonExistentScreen');
      }).not.toThrow();
    });

    it('devrait gérer les tentatives de retour quand il n\'y a pas d\'historique', () => {
      const { getByTestId } = renderWithNavigation('Home');

      // Tenter de revenir en arrière depuis l'écran initial
      expect(() => {
        navigation.goBack();
      }).not.toThrow();
    });
  });

  describe('Accessibilité de la navigation', () => {
    it('devrait avoir des éléments accessibles dans chaque écran', () => {
      const { getByTestId } = renderWithNavigation('Home');

      const homeScreen = getByTestId('home-screen');
      const mapButton = getByTestId('go-to-map-button');
      const profileButton = getByTestId('go-to-profile-button');

      expect(homeScreen).toBeTruthy();
      expect(mapButton).toBeTruthy();
      expect(profileButton).toBeTruthy();
    });

    it('devrait permettre la navigation par les boutons d\'accessibilité', async () => {
      const { getByTestId } = renderWithNavigation('Home');

      // Naviguer vers Map en utilisant le bouton
      const mapButton = getByTestId('go-to-map-button');
      fireEvent.press(mapButton);

      await waitFor(() => {
        expect(getByTestId('map-screen')).toBeTruthy();
      });
    });
  });
}); 