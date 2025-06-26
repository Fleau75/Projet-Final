import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import LoginScreen from '../../screens/LoginScreen';

// Mock des dépendances
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

jest.mock('../../services/biometricService', () => ({
  BiometricService: {
    isBiometricAvailable: jest.fn(),
    loadBiometricPreferences: jest.fn(),
    saveBiometricPreferences: jest.fn(),
    authenticateAndGetCredentials: jest.fn(),
    setupBiometricAuthentication: jest.fn(),
  },
}));

jest.mock('../../services/storageService', () => ({
  __esModule: true,
  default: {
    getUserData: jest.fn(),
  },
}));

// Mock des contextes
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};

const mockLogin = jest.fn();
const mockRegister = jest.fn();

const mockAuthContext = {
  login: mockLogin,
  register: mockRegister,
  isAuthenticated: false,
  user: null,
};

const mockThemeContext = {
  isDarkMode: false,
  toggleTheme: jest.fn(),
};

const mockTextSizeContext = {
  textSizes: {
    title: 24,
    subtitle: 16,
    body: 14,
    caption: 12,
  },
  increaseTextSize: jest.fn(),
  decreaseTextSize: jest.fn(),
};

// Mock des hooks
jest.mock('../../theme/AuthContext', () => ({
  useAuth: () => mockAuthContext,
}));

jest.mock('../../theme/ThemeContext', () => ({
  useAppTheme: () => mockThemeContext,
}));

jest.mock('../../theme/TextSizeContext', () => ({
  useTextSize: () => mockTextSizeContext,
}));

// Mock d'Alert
jest.spyOn(Alert, 'alert').mockImplementation(() => {});

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLogin.mockResolvedValue({ success: true, user: { email: 'test@example.com' } });
    mockRegister.mockResolvedValue({ success: true, user: { email: 'visiteur@accessplus.com' } });
  });

  it('devrait rendre l\'écran de connexion correctement', async () => {
    const { getByTestId, getByText } = render(<LoginScreen navigation={mockNavigation} />);
    
    // Attendre que les effets asynchrones se terminent
    await waitFor(() => {
      expect(getByTestId('login-screen')).toBeTruthy();
    });
    
    expect(getByText('AccessPlus')).toBeTruthy();
    expect(getByText('Trouvez facilement des lieux accessibles')).toBeTruthy();
    expect(getByTestId('email-input')).toBeTruthy();
    expect(getByTestId('password-input')).toBeTruthy();
    expect(getByTestId('login-button')).toBeTruthy();
    expect(getByTestId('register-button')).toBeTruthy();
    expect(getByTestId('continue-without-account-button')).toBeTruthy();
  });

  it('devrait permettre la saisie d\'email et mot de passe', async () => {
    const { getByTestId } = render(<LoginScreen navigation={mockNavigation} />);
    
    await waitFor(() => {
      expect(getByTestId('email-input')).toBeTruthy();
    });
    
    const emailInput = getByTestId('email-input');
    const passwordInput = getByTestId('password-input');
    
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    
    expect(emailInput.props.value).toBe('test@example.com');
    expect(passwordInput.props.value).toBe('password123');
  });

  it('devrait afficher une erreur si les champs sont vides', async () => {
    const { getByTestId, getByText } = render(<LoginScreen navigation={mockNavigation} />);
    
    await waitFor(() => {
      expect(getByTestId('login-button')).toBeTruthy();
    });
    
    const loginButton = getByTestId('login-button');
    
    await act(async () => {
      fireEvent.press(loginButton);
    });
    
    await waitFor(() => {
      expect(getByText('Veuillez remplir tous les champs')).toBeTruthy();
    });
  });

  it('devrait appeler la fonction de connexion avec succès', async () => {
    const { getByTestId } = render(<LoginScreen navigation={mockNavigation} />);
    
    await waitFor(() => {
      expect(getByTestId('email-input')).toBeTruthy();
    });
    
    const emailInput = getByTestId('email-input');
    const passwordInput = getByTestId('password-input');
    const loginButton = getByTestId('login-button');
    
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    
    await act(async () => {
      fireEvent.press(loginButton);
    });
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('devrait gérer l\'échec de connexion', async () => {
    mockLogin.mockResolvedValue({ success: false, error: 'Email ou mot de passe incorrect' });
    
    const { getByTestId } = render(<LoginScreen navigation={mockNavigation} />);
    
    await waitFor(() => {
      expect(getByTestId('email-input')).toBeTruthy();
    });
    
    const emailInput = getByTestId('email-input');
    const passwordInput = getByTestId('password-input');
    const loginButton = getByTestId('login-button');
    
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'wrongpassword');
    
    await act(async () => {
      fireEvent.press(loginButton);
    });
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'wrongpassword');
    });
  });

  it('devrait naviguer vers l\'écran d\'inscription', async () => {
    const { getByTestId } = render(<LoginScreen navigation={mockNavigation} />);
    
    await waitFor(() => {
      expect(getByTestId('register-button')).toBeTruthy();
    });
    
    const registerButton = getByTestId('register-button');
    fireEvent.press(registerButton);
    
    expect(mockNavigation.navigate).toHaveBeenCalledWith('Register');
  });

  it('devrait naviguer vers l\'écran de mot de passe oublié', async () => {
    const { getByTestId } = render(<LoginScreen navigation={mockNavigation} />);
    
    await waitFor(() => {
      expect(getByTestId('forgot-password-button')).toBeTruthy();
    });
    
    const forgotPasswordButton = getByTestId('forgot-password-button');
    fireEvent.press(forgotPasswordButton);
    
    expect(mockNavigation.navigate).toHaveBeenCalledWith('ForgotPassword');
  });

  it('devrait créer un compte visiteur avec succès', async () => {
    const { getByTestId } = render(<LoginScreen navigation={mockNavigation} />);
    
    await waitFor(() => {
      expect(getByTestId('continue-without-account-button')).toBeTruthy();
    });
    
    const continueButton = getByTestId('continue-without-account-button');
    
    await act(async () => {
      fireEvent.press(continueButton);
    });
    
    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith(
        'visiteur@accessplus.com',
        'visitor123',
        {
          email: 'visiteur@accessplus.com',
          firstName: 'Visiteur',
          lastName: 'AccessPlus',
          phone: ''
        }
      );
    });
  });

  it('devrait gérer l\'échec de création du compte visiteur', async () => {
    mockRegister.mockResolvedValue({ success: false, error: 'Erreur de création' });
    
    const { getByTestId, getByText } = render(<LoginScreen navigation={mockNavigation} />);
    
    await waitFor(() => {
      expect(getByTestId('continue-without-account-button')).toBeTruthy();
    });
    
    const continueButton = getByTestId('continue-without-account-button');
    
    await act(async () => {
      fireEvent.press(continueButton);
    });
    
    await waitFor(() => {
      expect(getByText('Impossible de créer le compte visiteur')).toBeTruthy();
    });
  });

  it('devrait afficher le bouton biométrique si disponible', async () => {
    const { BiometricService } = require('../../services/biometricService');
    
    BiometricService.isBiometricAvailable.mockResolvedValue(true);
    BiometricService.loadBiometricPreferences.mockResolvedValue({
      enabled: true,
      email: 'test@example.com'
    });
    
    const { getByTestId } = render(<LoginScreen navigation={mockNavigation} />);
    
    await waitFor(() => {
      expect(getByTestId('biometric-login-button')).toBeTruthy();
    });
  });

  it('devrait ne pas afficher le bouton biométrique pour le mode visiteur', async () => {
    const { BiometricService } = require('../../services/biometricService');
    
    BiometricService.isBiometricAvailable.mockResolvedValue(true);
    BiometricService.loadBiometricPreferences.mockResolvedValue({
      enabled: true,
      email: 'visiteur@accessplus.com'
    });
    
    const { queryByTestId } = render(<LoginScreen navigation={mockNavigation} />);
    
    await waitFor(() => {
      expect(queryByTestId('biometric-login-button')).toBeNull();
    });
  });

  it('devrait gérer la connexion biométrique avec succès', async () => {
    const { BiometricService } = require('../../services/biometricService');
    
    BiometricService.isBiometricAvailable.mockResolvedValue(true);
    BiometricService.loadBiometricPreferences.mockResolvedValue({
      enabled: true,
      email: 'test@example.com'
    });
    BiometricService.authenticateAndGetCredentials.mockResolvedValue({
      success: true,
      credentials: {
        email: 'test@example.com',
        password: 'password123'
      }
    });
    
    const { getByTestId } = render(<LoginScreen navigation={mockNavigation} />);
    
    await waitFor(() => {
      const biometricButton = getByTestId('biometric-login-button');
      fireEvent.press(biometricButton);
    });
    
    await waitFor(() => {
      expect(BiometricService.authenticateAndGetCredentials).toHaveBeenCalled();
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('devrait gérer l\'échec de l\'authentification biométrique', async () => {
    const { BiometricService } = require('../../services/biometricService');
    
    BiometricService.isBiometricAvailable.mockResolvedValue(true);
    BiometricService.loadBiometricPreferences.mockResolvedValue({
      enabled: true,
      email: 'test@example.com'
    });
    BiometricService.authenticateAndGetCredentials.mockResolvedValue({
      success: false,
      reason: 'Authentication failed'
    });
    
    const { getByTestId } = render(<LoginScreen navigation={mockNavigation} />);
    
    await waitFor(() => {
      const biometricButton = getByTestId('biometric-login-button');
      fireEvent.press(biometricButton);
    });
    
    await waitFor(() => {
      expect(BiometricService.authenticateAndGetCredentials).toHaveBeenCalled();
      expect(mockLogin).not.toHaveBeenCalled();
    });
  });

  it('devrait proposer l\'activation de la biométrie après connexion réussie', async () => {
    const { BiometricService } = require('../../services/biometricService');
    
    BiometricService.isBiometricAvailable.mockResolvedValue(true);
    BiometricService.loadBiometricPreferences.mockResolvedValue({
      enabled: false,
      email: ''
    });
    
    const { getByTestId } = render(<LoginScreen navigation={mockNavigation} />);
    
    await waitFor(() => {
      expect(getByTestId('email-input')).toBeTruthy();
    });
    
    const emailInput = getByTestId('email-input');
    const passwordInput = getByTestId('password-input');
    const loginButton = getByTestId('login-button');
    
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    
    await act(async () => {
      fireEvent.press(loginButton);
    });
    
    // Attendre plus longtemps pour la proposition biométrique
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "🔐 Authentification biométrique",
        "Voulez-vous activer l'authentification par empreinte digitale ou reconnaissance faciale pour vous connecter plus rapidement ?",
        expect.any(Array)
      );
    }, { timeout: 3000 });
  });

  it('devrait empêcher l\'activation de la biométrie pour le mode visiteur', async () => {
    const { BiometricService } = require('../../services/biometricService');
    
    BiometricService.isBiometricAvailable.mockResolvedValue(true);
    BiometricService.loadBiometricPreferences.mockResolvedValue({
      enabled: false,
      email: ''
    });
    
    const { getByTestId } = render(<LoginScreen navigation={mockNavigation} />);
    
    await waitFor(() => {
      expect(getByTestId('email-input')).toBeTruthy();
    });
    
    const emailInput = getByTestId('email-input');
    const passwordInput = getByTestId('password-input');
    const loginButton = getByTestId('login-button');
    
    fireEvent.changeText(emailInput, 'visiteur@accessplus.com');
    fireEvent.changeText(passwordInput, 'password123');
    
    await act(async () => {
      fireEvent.press(loginButton);
    });
    
    // Attendre que la proposition biométrique apparaisse
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "🔐 Authentification biométrique",
        "Voulez-vous activer l'authentification par empreinte digitale ou reconnaissance faciale pour vous connecter plus rapidement ?",
        expect.any(Array)
      );
    }, { timeout: 3000 });
    
    // Simuler l'activation de la biométrie
    const alertCall = Alert.alert.mock.calls.find(call => 
      call[0] === "🔐 Authentification biométrique"
    );
    
    if (alertCall) {
      const activateButton = alertCall[2].find(button => button.text === "Activer");
      if (activateButton && activateButton.onPress) {
        await act(async () => {
          activateButton.onPress();
        });
      }
    }
    
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Mode visiteur",
        "La biométrie n'est pas disponible en mode visiteur. Veuillez créer un compte pour utiliser cette fonctionnalité."
      );
    }, { timeout: 3000 });
  });

  it('devrait gérer les erreurs inattendues lors de la connexion', async () => {
    mockLogin.mockRejectedValue(new Error('Erreur réseau'));
    
    const { getByTestId, getByText } = render(<LoginScreen navigation={mockNavigation} />);
    
    await waitFor(() => {
      expect(getByTestId('email-input')).toBeTruthy();
    });
    
    const emailInput = getByTestId('email-input');
    const passwordInput = getByTestId('password-input');
    const loginButton = getByTestId('login-button');
    
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    
    await act(async () => {
      fireEvent.press(loginButton);
    });
    
    await waitFor(() => {
      expect(getByText('Une erreur inattendue est survenue.')).toBeTruthy();
    });
  });

  it('devrait gérer les erreurs lors de la création du compte visiteur', async () => {
    mockRegister.mockRejectedValue(new Error('Erreur réseau'));
    
    const { getByTestId, getByText } = render(<LoginScreen navigation={mockNavigation} />);
    
    await waitFor(() => {
      expect(getByTestId('continue-without-account-button')).toBeTruthy();
    });
    
    const continueButton = getByTestId('continue-without-account-button');
    
    await act(async () => {
      fireEvent.press(continueButton);
    });
    
    await waitFor(() => {
      expect(getByText('Une erreur est survenue lors de la création du compte visiteur')).toBeTruthy();
    });
  });
}); 