import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import RegisterScreen from '../../screens/RegisterScreen';

// Mock des dépendances
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// Mock de StorageService
const mockGetAllUserData = jest.fn();
jest.mock('../../services/storageService', () => ({
  __esModule: true,
  default: {
    getAllUserData: mockGetAllUserData,
  },
}));

// Mock de firebaseService
const mockGetReviewsByUserId = jest.fn();
jest.mock('../../services/firebaseService', () => ({
  ReviewsService: {
    getReviewsByUserId: mockGetReviewsByUserId,
  },
}));

// Mock des contextes
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  reset: jest.fn(),
};

const mockRegister = jest.fn();
const mockLogout = jest.fn();

const mockAuthContext = {
  register: mockRegister,
  logout: mockLogout,
  user: null,
};

const mockTextSizeContext = {
  textSizes: {
    headline: 24,
    title: 20,
    body: 16,
    caption: 12,
  },
  increaseTextSize: jest.fn(),
  decreaseTextSize: jest.fn(),
};

// Mock des hooks
jest.mock('../../theme/AuthContext', () => ({
  useAuth: () => mockAuthContext,
}));

jest.mock('../../theme/TextSizeContext', () => ({
  useTextSize: () => mockTextSizeContext,
}));

// Mock de useFocusEffect pour ne rien faire
jest.mock('@react-navigation/native', () => ({
  useFocusEffect: jest.fn(() => {}),
}));

// Mock d'Alert
jest.spyOn(Alert, 'alert').mockImplementation(() => {});

describe('RegisterScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRegister.mockResolvedValue({ success: true, user: { email: 'test@example.com' } });
    mockGetAllUserData.mockResolvedValue({});
    mockGetReviewsByUserId.mockResolvedValue([]);
  });

  it('devrait rendre l\'écran d\'inscription correctement', async () => {
    const { getByTestId, getByText } = render(<RegisterScreen navigation={mockNavigation} />);
    
    await waitFor(() => {
      expect(getByTestId('register-screen')).toBeTruthy();
    });
    
    expect(getByText('Rejoignez AccessPlus')).toBeTruthy();
    expect(getByText('Créez votre compte pour partager et découvrir des lieux accessibles')).toBeTruthy();
    expect(getByTestId('name-input')).toBeTruthy();
    expect(getByTestId('lastname-input')).toBeTruthy();
    expect(getByTestId('email-input')).toBeTruthy();
    expect(getByTestId('phone-input')).toBeTruthy();
    expect(getByTestId('password-input')).toBeTruthy();
    expect(getByTestId('confirm-password-input')).toBeTruthy();
    expect(getByTestId('terms-checkbox')).toBeTruthy();
    expect(getByTestId('submit-button')).toBeTruthy();
  });

  it('devrait permettre la saisie dans tous les champs', async () => {
    const { getByTestId } = render(<RegisterScreen navigation={mockNavigation} />);
    
    await waitFor(() => {
      expect(getByTestId('name-input')).toBeTruthy();
    });
    
    const nameInput = getByTestId('name-input');
    const lastnameInput = getByTestId('lastname-input');
    const emailInput = getByTestId('email-input');
    const phoneInput = getByTestId('phone-input');
    const passwordInput = getByTestId('password-input');
    const confirmPasswordInput = getByTestId('confirm-password-input');
    
    fireEvent.changeText(nameInput, 'John');
    fireEvent.changeText(lastnameInput, 'Doe');
    fireEvent.changeText(emailInput, 'john@example.com');
    fireEvent.changeText(phoneInput, '0123456789');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.changeText(confirmPasswordInput, 'password123');
    
    expect(nameInput.props.value).toBe('John');
    expect(lastnameInput.props.value).toBe('Doe');
    expect(emailInput.props.value).toBe('john@example.com');
    expect(phoneInput.props.value).toBe('0123456789');
    expect(passwordInput.props.value).toBe('password123');
    expect(confirmPasswordInput.props.value).toBe('password123');
  });

  it('devrait valider le formulaire et afficher des erreurs pour des champs vides', async () => {
    const { getByTestId, getByText } = render(<RegisterScreen navigation={mockNavigation} />);
    
    await waitFor(() => {
      expect(getByTestId('submit-button')).toBeTruthy();
    });
    
    const submitButton = getByTestId('submit-button');
    
    await act(async () => {
      fireEvent.press(submitButton);
    });
    
    await waitFor(() => {
      expect(getByText('Le prénom est obligatoire')).toBeTruthy();
      expect(getByText('Le nom est obligatoire')).toBeTruthy();
      expect(getByText('L\'email est obligatoire')).toBeTruthy();
      expect(getByText('Le mot de passe est obligatoire')).toBeTruthy();
      expect(getByText('Veuillez confirmer votre mot de passe')).toBeTruthy();
      expect(getByText('Vous devez accepter les conditions d\'utilisation')).toBeTruthy();
    });
  });

  it('devrait valider le format de l\'email', async () => {
    const { getByTestId, getByText } = render(<RegisterScreen navigation={mockNavigation} />);
    
    await waitFor(() => {
      expect(getByTestId('email-input')).toBeTruthy();
    });
    
    const emailInput = getByTestId('email-input');
    const submitButton = getByTestId('submit-button');
    
    fireEvent.changeText(emailInput, 'invalid-email');
    
    await act(async () => {
      fireEvent.press(submitButton);
    });
    
    await waitFor(() => {
      expect(getByText('Veuillez entrer un email valide')).toBeTruthy();
    });
  });

  it('devrait valider la longueur du mot de passe', async () => {
    const { getByTestId, getByText } = render(<RegisterScreen navigation={mockNavigation} />);
    
    await waitFor(() => {
      expect(getByTestId('password-input')).toBeTruthy();
    });
    
    const passwordInput = getByTestId('password-input');
    const submitButton = getByTestId('submit-button');
    
    fireEvent.changeText(passwordInput, '123');
    
    await act(async () => {
      fireEvent.press(submitButton);
    });
    
    await waitFor(() => {
      expect(getByText('Le mot de passe doit contenir au moins 6 caractères')).toBeTruthy();
    });
  });

  it('devrait valider la correspondance des mots de passe', async () => {
    const { getByTestId, getByText } = render(<RegisterScreen navigation={mockNavigation} />);
    
    await waitFor(() => {
      expect(getByTestId('password-input')).toBeTruthy();
    });
    
    const passwordInput = getByTestId('password-input');
    const confirmPasswordInput = getByTestId('confirm-password-input');
    const submitButton = getByTestId('submit-button');
    
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.changeText(confirmPasswordInput, 'differentpassword');
    
    await act(async () => {
      fireEvent.press(submitButton);
    });
    
    await waitFor(() => {
      expect(getByText('Les mots de passe ne correspondent pas')).toBeTruthy();
    });
  });

  it('devrait valider la longueur du téléphone', async () => {
    const { getByTestId, getByText } = render(<RegisterScreen navigation={mockNavigation} />);
    
    await waitFor(() => {
      expect(getByTestId('phone-input')).toBeTruthy();
    });
    
    const phoneInput = getByTestId('phone-input');
    const submitButton = getByTestId('submit-button');
    
    fireEvent.changeText(phoneInput, '123');
    
    await act(async () => {
      fireEvent.press(submitButton);
    });
    
    await waitFor(() => {
      expect(getByText('Le numéro de téléphone doit contenir au moins 10 chiffres')).toBeTruthy();
    });
  });

  it('devrait appeler la fonction d\'inscription avec succès', async () => {
    const { getByTestId } = render(<RegisterScreen navigation={mockNavigation} />);
    
    await waitFor(() => {
      expect(getByTestId('name-input')).toBeTruthy();
    });
    
    // Remplir le formulaire
    fireEvent.changeText(getByTestId('name-input'), 'John');
    fireEvent.changeText(getByTestId('lastname-input'), 'Doe');
    fireEvent.changeText(getByTestId('email-input'), 'john@example.com');
    fireEvent.changeText(getByTestId('phone-input'), '0123456789');
    fireEvent.changeText(getByTestId('password-input'), 'password123');
    fireEvent.changeText(getByTestId('confirm-password-input'), 'password123');
    
    // Accepter les conditions
    fireEvent.press(getByTestId('terms-checkbox'));
    
    // Soumettre
    await act(async () => {
      fireEvent.press(getByTestId('submit-button'));
    });
    
    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith('john@example.com', 'password123', {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '0123456789',
        migrateVisitorData: false // Par défaut false car pas de données visiteur
      });
    });
  });

  it('devrait gérer l\'échec d\'inscription', async () => {
    mockRegister.mockRejectedValue(new Error('Email déjà utilisé'));
    
    const { getByTestId } = render(<RegisterScreen navigation={mockNavigation} />);
    
    await waitFor(() => {
      expect(getByTestId('name-input')).toBeTruthy();
    });
    
    // Remplir le formulaire
    fireEvent.changeText(getByTestId('name-input'), 'John');
    fireEvent.changeText(getByTestId('lastname-input'), 'Doe');
    fireEvent.changeText(getByTestId('email-input'), 'existing@example.com');
    fireEvent.changeText(getByTestId('password-input'), 'password123');
    fireEvent.changeText(getByTestId('confirm-password-input'), 'password123');
    fireEvent.press(getByTestId('terms-checkbox'));
    
    await act(async () => {
      fireEvent.press(getByTestId('submit-button'));
    });
    
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Erreur d'inscription",
        "Email déjà utilisé",
        [{ text: "OK" }]
      );
    });
  });

  it('devrait naviguer vers MainTabs après inscription réussie', async () => {
    // Simuler un utilisateur connecté
    mockAuthContext.user = { email: 'test@example.com', isVisitor: false };
    
    const { rerender } = render(<RegisterScreen navigation={mockNavigation} />);
    
    // Re-render pour déclencher useEffect
    rerender(<RegisterScreen navigation={mockNavigation} />);
    
    await waitFor(() => {
      expect(mockNavigation.reset).toHaveBeenCalledWith({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
    });
  });

  it('devrait nettoyer les erreurs lors de la saisie', async () => {
    const { getByTestId, getByText, queryByText } = render(<RegisterScreen navigation={mockNavigation} />);
    
    await waitFor(() => {
      expect(getByTestId('name-input')).toBeTruthy();
    });
    
    const nameInput = getByTestId('name-input');
    const submitButton = getByTestId('submit-button');
    
    // Soumettre avec un champ vide pour créer une erreur
    await act(async () => {
      fireEvent.press(submitButton);
    });
    
    await waitFor(() => {
      expect(getByText('Le prénom est obligatoire')).toBeTruthy();
    });
    
    // Saisir dans le champ pour nettoyer l'erreur
    fireEvent.changeText(nameInput, 'John');
    
    await waitFor(() => {
      expect(queryByText('Le prénom est obligatoire')).toBeNull();
    });
  });

  it('devrait avoir des champs de mot de passe sécurisés par défaut', async () => {
    const { getByTestId } = render(<RegisterScreen navigation={mockNavigation} />);
    
    await waitFor(() => {
      expect(getByTestId('password-input')).toBeTruthy();
    });
    
    const passwordInput = getByTestId('password-input');
    const confirmPasswordInput = getByTestId('confirm-password-input');
    
    // Par défaut, les mots de passe sont masqués
    expect(passwordInput.props.secureTextEntry).toBe(true);
    expect(confirmPasswordInput.props.secureTextEntry).toBe(true);
  });

  it('devrait afficher le message de recherche de données visiteur au chargement', async () => {
    const { getByText } = render(<RegisterScreen navigation={mockNavigation} />);
    
    await waitFor(() => {
      expect(getByText('Recherche de données visiteur...')).toBeTruthy();
    });
  });

  it('devrait valider la longueur minimale des noms', async () => {
    const { getByTestId, getByText } = render(<RegisterScreen navigation={mockNavigation} />);
    
    await waitFor(() => {
      expect(getByTestId('name-input')).toBeTruthy();
    });
    
    const nameInput = getByTestId('name-input');
    const lastnameInput = getByTestId('lastname-input');
    const submitButton = getByTestId('submit-button');
    
    // Tester avec des noms trop courts
    fireEvent.changeText(nameInput, 'J');
    fireEvent.changeText(lastnameInput, 'D');
    
    await act(async () => {
      fireEvent.press(submitButton);
    });
    
    await waitFor(() => {
      expect(getByText('Le prénom doit contenir au moins 2 caractères')).toBeTruthy();
      expect(getByText('Le nom doit contenir au moins 2 caractères')).toBeTruthy();
    });
  });

  it('devrait nettoyer les erreurs lors de la saisie dans n\'importe quel champ', async () => {
    const { getByTestId, getByText, queryByText } = render(<RegisterScreen navigation={mockNavigation} />);
    
    await waitFor(() => {
      expect(getByTestId('submit-button')).toBeTruthy();
    });
    
    const submitButton = getByTestId('submit-button');
    
    // Soumettre avec des champs vides pour créer des erreurs
    await act(async () => {
      fireEvent.press(submitButton);
    });
    
    await waitFor(() => {
      expect(getByText('Le prénom est obligatoire')).toBeTruthy();
      expect(getByText('Le nom est obligatoire')).toBeTruthy();
      expect(getByText('L\'email est obligatoire')).toBeTruthy();
    });
    
    // Saisir dans les champs pour nettoyer les erreurs
    fireEvent.changeText(getByTestId('name-input'), 'John');
    fireEvent.changeText(getByTestId('lastname-input'), 'Doe');
    fireEvent.changeText(getByTestId('email-input'), 'john@example.com');
    
    await waitFor(() => {
      expect(queryByText('Le prénom est obligatoire')).toBeNull();
      expect(queryByText('Le nom est obligatoire')).toBeNull();
      expect(queryByText('L\'email est obligatoire')).toBeNull();
    });
  });

  it('devrait valider que les champs ont les bons types de clavier', async () => {
    const { getByTestId } = render(<RegisterScreen navigation={mockNavigation} />);
    
    await waitFor(() => {
      expect(getByTestId('email-input')).toBeTruthy();
    });
    
    const emailInput = getByTestId('email-input');
    const phoneInput = getByTestId('phone-input');
    
    // Vérifier que l'email a le bon type de clavier
    expect(emailInput.props.keyboardType).toBe('email-address');
    expect(emailInput.props.autoCapitalize).toBe('none');
    
    // Vérifier que le téléphone a le bon type de clavier
    expect(phoneInput.props.keyboardType).toBe('phone-pad');
  });
}); 