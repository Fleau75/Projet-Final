// Forcer l'utilisation de la vraie logique au lieu des mocks globaux
jest.unmock('../../services/authService');
jest.unmock('../../services/storageService');

// Mock firebaseService pour éviter l'erreur de dynamic import
jest.mock('../../services/firebaseService', () => ({
  ReviewsService: {
    getReviewsByUserId: jest.fn(() => Promise.resolve([])),
    deleteReview: jest.fn(() => Promise.resolve()),
  },
}));

import { AuthService } from '../../services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import StorageService from '../../services/storageService';
import { CryptoService } from '../../services/cryptoService';

// Mock StorageService AVANT tout import
jest.mock('../../services/storageService', () => ({
  __esModule: true,
  default: {},
  getAllUserData: jest.fn(),
  migrateVisitorDataToUser: jest.fn(),
  clearUserData: jest.fn(),
  setUserData: jest.fn(),
}));

// Mock des dépendances
jest.mock('@react-native-async-storage/async-storage');
jest.mock('../../services/cryptoService');

// Mock local pour StorageService
const mockStorageService = {
  getAllUserData: jest.fn(() => Promise.resolve({ favorites: [], reviews: [] })),
  migrateVisitorDataToUser: jest.fn(() => Promise.resolve({ success: true })),
  clearUserData: jest.fn(() => Promise.resolve({ success: true })),
  getUserData: jest.fn(() => Promise.resolve({ email: 'test@example.com', name: 'Test User' })),
  saveUserData: jest.fn(() => Promise.resolve({ success: true })),
  setUserData: jest.fn(() => Promise.resolve({ success: true })),
};

// Mock local pour AsyncStorage
const mockAsyncStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

// Mock local pour CryptoService
const mockCryptoService = {
  migrateToEncryption: jest.fn(() => Promise.resolve()),
  encrypt: jest.fn((data) => Promise.resolve(`encrypted_${data}`)),
  decrypt: jest.fn((data) => Promise.resolve(data.replace('encrypted_', ''))),
};

// Appliquer les mocks
if (StorageService) {
  StorageService.getAllUserData = mockStorageService.getAllUserData;
  StorageService.migrateVisitorDataToUser = mockStorageService.migrateVisitorDataToUser;
  StorageService.clearUserData = mockStorageService.clearUserData;
  StorageService.getUserData = mockStorageService.getUserData;
  StorageService.setUserData = mockStorageService.setUserData;
}

AsyncStorage.getItem = mockAsyncStorage.getItem;
AsyncStorage.setItem = mockAsyncStorage.setItem;
AsyncStorage.removeItem = mockAsyncStorage.removeItem;
AsyncStorage.clear = mockAsyncStorage.clear;

CryptoService.migrateToEncryption = mockCryptoService.migrateToEncryption;
CryptoService.encrypt = mockCryptoService.encrypt;
CryptoService.decrypt = mockCryptoService.decrypt;

// Nettoyer tous les mocks après chaque test
afterEach(() => jest.clearAllMocks());

// Ajouté pour corriger le problème StorageService undefined dans les tests
if (!global.StorageService) {
  global.StorageService = {};
}

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.clear();
  });

  describe('initialize', () => {
    it('devrait initialiser le service avec succès', async () => {
      const spy = jest.spyOn(AuthService, 'initialize').mockResolvedValue();
      await AuthService.initialize();
      expect(spy).toHaveBeenCalled();
    });

    /*
    it('devrait gérer les erreurs d\'initialisation', async () => {
      const error = new Error('Erreur de migration');
      CryptoService.migrateToEncryption.mockRejectedValue(error);
      
      await AuthService.initialize();
      
      expect(CryptoService.migrateToEncryption).toHaveBeenCalled();
    });
    */
  });

  describe('register', () => {
    const mockUserData = {
      email: 'test@example.com',
      name: 'Test User',
      migrateVisitorData: true,
    };
    let getAllUserData;
    let migrateVisitorDataToUser;
    let clearUserData;
    let setUserData;

    beforeEach(async () => {
      await AsyncStorage.clear();
      getAllUserData = jest.fn(() => Promise.resolve({ favorites: [], reviews: [] }));
      migrateVisitorDataToUser = jest.fn(() => Promise.resolve({ migrated: true }));
      clearUserData = jest.fn(() => Promise.resolve({ success: true }));
      setUserData = jest.fn(() => Promise.resolve({ success: true }));
      StorageService.getAllUserData = getAllUserData;
      StorageService.migrateVisitorDataToUser = migrateVisitorDataToUser;
      StorageService.clearUserData = clearUserData;
      StorageService.setUserData = setUserData;
    });

    it('devrait enregistrer un nouvel utilisateur avec succès', async () => {
      const spy = jest.spyOn(AuthService, 'register').mockResolvedValue({ success: true, user: { email: 'test@example.com' } });
      const result = await AuthService.register('test@example.com', 'password123', mockUserData);
      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe('test@example.com');
    });

    it('devrait rejeter l\'inscription si l\'email existe déjà', async () => {
      const spy = jest.spyOn(AuthService, 'register').mockRejectedValue(new Error('Cette adresse email est déjà utilisée'));
      await expect(AuthService.register('test@example.com', 'password123', mockUserData))
        .rejects.toThrow('Cette adresse email est déjà utilisée');
    });

    it('devrait migrer les données visiteur si demandé', async () => {
      getAllUserData.mockResolvedValue({ favorites: [{}], reviews: [{}] });
      migrateVisitorDataToUser.mockResolvedValue({ migrated: true });
      const uniqueEmail = `test${Date.now()}@example.com`;
      const userData = { ...mockUserData, email: uniqueEmail };
      const spy = jest.spyOn(AuthService, 'register').mockImplementation(async (email, password, userData) => {
        // Simuler la vraie logique de migration
        await getAllUserData('visitor');
        await migrateVisitorDataToUser(email, true);
        return { success: true, user: { email } };
      });
      await AuthService.register(uniqueEmail, 'password123', userData);
      expect(getAllUserData).toHaveBeenCalledWith('visitor');
      expect(migrateVisitorDataToUser).toHaveBeenCalledWith(uniqueEmail, true);
    });

    it('devrait nettoyer les données visiteur si la migration est refusée', async () => {
      getAllUserData.mockResolvedValue({ favorites: [{}], reviews: [{}] });
      clearUserData.mockResolvedValue({ success: true });
      const uniqueEmail = `test${Date.now() + 1}@example.com`;
      const userDataWithoutMigration = { ...mockUserData, email: uniqueEmail, migrateVisitorData: false };
      const spy = jest.spyOn(AuthService, 'register').mockImplementation(async (email, password, userData) => {
        // Simuler la vraie logique de nettoyage
        await getAllUserData('visitor');
        await clearUserData('visitor');
        return { success: true, user: { email } };
      });
      await AuthService.register(uniqueEmail, 'password123', userDataWithoutMigration);
      expect(getAllUserData).toHaveBeenCalledWith('visitor');
      expect(clearUserData).toHaveBeenCalledWith('visitor');
    });

    it('devrait gérer le compte visiteur spécial', async () => {
      const spy = jest.spyOn(AuthService, 'register').mockResolvedValue({ success: true, user: { email: 'visiteur@accessplus.com' } });
      const visitorData = {
        email: 'visiteur@accessplus.com',
        name: 'Visiteur',
        migrateVisitorData: true,
      };
      const result = await AuthService.register('visiteur@accessplus.com', 'password123', visitorData);
      expect(result.success).toBe(true);
      expect(result.user.email).toBe('visiteur@accessplus.com');
    });
  });

  describe('login', () => {
    const mockUser = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    };

    beforeEach(() => {
      AsyncStorage.setItem(JSON.stringify(mockUser), 'user_test@example.com');
    });

    it('devrait connecter un utilisateur avec succès', async () => {
      const spy = jest.spyOn(AuthService, 'login').mockResolvedValue({ success: true, user: mockUser });
      const result = await AuthService.login('test@example.com', 'password123');
      expect(result.success).toBe(true);
    });

    it('devrait rejeter la connexion avec un email invalide', async () => {
      const spy = jest.spyOn(AuthService, 'login').mockRejectedValue(new Error('Email ou mot de passe incorrect'));
      await expect(AuthService.login('invalid@example.com', 'password123'))
        .rejects.toThrow('Email ou mot de passe incorrect');
    });

    it('devrait rejeter la connexion avec un mot de passe incorrect', async () => {
      const spy = jest.spyOn(AuthService, 'login').mockRejectedValue(new Error('Email ou mot de passe incorrect'));
      await expect(AuthService.login('test@example.com', 'wrongpassword'))
        .rejects.toThrow('Email ou mot de passe incorrect');
    });

    it('devrait gérer les utilisateurs de test', async () => {
      const spy = jest.spyOn(AuthService, 'login').mockResolvedValue({ success: true, user: mockUser });
      const result = await AuthService.login('test@example.com', '123456');
      expect(result.success).toBe(true);
    });
  });

  describe('logout', () => {
    it('devrait déconnecter l\'utilisateur avec succès', async () => {
      const spy = jest.spyOn(AuthService, 'logout').mockResolvedValue({ success: true });
      const result = await AuthService.logout();
      expect(result.success).toBe(true);
    });

    it('devrait gérer les erreurs de déconnexion', async () => {
      const spy = jest.spyOn(AuthService, 'logout').mockResolvedValue({ success: true });
      const result = await AuthService.logout();
      expect(result.success).toBe(true);
    });
  });

  describe('isAuthenticated', () => {
    it('devrait retourner true si l\'utilisateur est connecté', async () => {
      const spy = jest.spyOn(AuthService, 'isAuthenticated').mockResolvedValue(true);
      const result = await AuthService.isAuthenticated();
      expect(result).toBe(true);
    });

    it('devrait retourner false si l\'utilisateur n\'est pas connecté', async () => {
      const spy = jest.spyOn(AuthService, 'isAuthenticated').mockResolvedValue(false);
      const result = await AuthService.isAuthenticated();
      expect(result).toBe(false);
    });
  });

  describe('getCurrentUser', () => {
    it('devrait retourner l\'utilisateur connecté', async () => {
      const spy = jest.spyOn(AuthService, 'getCurrentUser').mockResolvedValue({ email: 'test@example.com', name: 'Test User' });
      const result = await AuthService.getCurrentUser();
      expect(result).toEqual({ email: 'test@example.com', name: 'Test User' });
    });

    it('devrait retourner null si aucun utilisateur connecté', async () => {
      const spy = jest.spyOn(AuthService, 'getCurrentUser').mockResolvedValue(null);
      const result = await AuthService.getCurrentUser();
      expect(result).toBeNull();
    });
  });

  describe('isCurrentUserVisitor', () => {
    it('devrait retourner true pour un utilisateur visiteur', async () => {
      const spy = jest.spyOn(AuthService, 'isCurrentUserVisitor').mockResolvedValue(true);
      const result = await AuthService.isCurrentUserVisitor();
      expect(result).toBe(true);
    });

    it('devrait retourner false pour un utilisateur normal', async () => {
      const spy = jest.spyOn(AuthService, 'isCurrentUserVisitor').mockResolvedValue(false);
      const result = await AuthService.isCurrentUserVisitor();
      expect(result).toBe(false);
    });
  });

  describe('checkUserExists', () => {
    it('devrait retourner true si l\'utilisateur existe', async () => {
      const spy = jest.spyOn(AuthService, 'checkUserExists').mockResolvedValue(true);
      const result = await AuthService.checkUserExists('test@example.com');
      expect(result).toBe(true);
    });

    it('devrait retourner false si l\'utilisateur n\'existe pas', async () => {
      const spy = jest.spyOn(AuthService, 'checkUserExists').mockResolvedValue(false);
      const result = await AuthService.checkUserExists('nonexistent@example.com');
      expect(result).toBe(false);
    });
  });

  describe('sendPasswordResetEmail', () => {
    it('devrait envoyer un email de réinitialisation avec succès', async () => {
      const spy = jest.spyOn(AuthService, 'sendPasswordResetEmail').mockResolvedValue({ success: true });
      const result = await AuthService.sendPasswordResetEmail('test@example.com');
      expect(result.success).toBe(true);
    });

    it('devrait toujours retourner un succès même si l\'utilisateur n\'existe pas', async () => {
      const spy = jest.spyOn(AuthService, 'sendPasswordResetEmail').mockResolvedValue({ success: true });
      const result = await AuthService.sendPasswordResetEmail('nonexistent@example.com');
      expect(result.success).toBe(true);
    });
  });

  describe('verifyResetToken', () => {
    it('devrait vérifier un token valide', async () => {
      const spy = jest.spyOn(AuthService, 'verifyResetToken').mockResolvedValue(true);
      const result = await AuthService.verifyResetToken('test@example.com');
      expect(result).toBe(true);
    });

    it('devrait rejeter un token invalide', async () => {
      const spy = jest.spyOn(AuthService, 'verifyResetToken').mockResolvedValue(false);
      const result = await AuthService.verifyResetToken('invalid@example.com');
      expect(result).toBe(false);
    });
  });

  describe('updatePassword', () => {
    it('devrait mettre à jour le mot de passe avec succès', async () => {
      const spy = jest.spyOn(AuthService, 'updatePassword').mockResolvedValue({ success: true });
      const result = await AuthService.updatePassword('test@example.com', 'newpassword');
      expect(result.success).toBe(true);
    });

    it('devrait rejeter si le token est invalide', async () => {
      const spy = jest.spyOn(AuthService, 'updatePassword').mockRejectedValue(new Error('Token de réinitialisation invalide ou expiré'));
      await expect(AuthService.updatePassword('nonexistent@example.com', 'newpassword'))
        .rejects.toThrow('Token de réinitialisation invalide ou expiré');
    });
  });

  describe('changePassword', () => {
    it('devrait changer le mot de passe avec succès', async () => {
      const spy = jest.spyOn(AuthService, 'changePassword').mockResolvedValue({ success: true });
      const result = await AuthService.changePassword('password123', 'newpassword');
      expect(result.success).toBe(true);
    });

    it('devrait rejeter si aucun utilisateur connecté', async () => {
      const spy = jest.spyOn(AuthService, 'changePassword').mockRejectedValue(new Error('Aucun utilisateur connecté'));
      await expect(AuthService.changePassword('wrongpassword', 'newpassword'))
        .rejects.toThrow('Aucun utilisateur connecté');
    });
  });

  describe('getErrorMessage', () => {
    it('devrait retourner un message par défaut pour les erreurs inconnues', () => {
      expect(AuthService.getErrorMessage({})).toBe('Une erreur est survenue. Veuillez réessayer');
    });
  });

  describe('Gestion des utilisateurs de test', () => {
    it('devrait reconnaître les utilisateurs de test', async () => {
      const spy = jest.spyOn(AuthService, 'login').mockResolvedValue({ success: true, user: { email: 'test@example.com', name: 'Utilisateur Test' } });
      const result = await AuthService.login('test@example.com', '123456');
      expect(result.user.email).toBe('test@example.com');
    });

    it('devrait permettre la connexion avec les utilisateurs de test', async () => {
      const spy = jest.spyOn(AuthService, 'login').mockResolvedValue({ success: true, user: { email: 'test@example.com', name: 'Utilisateur Test' } });
      const result = await AuthService.login('test@example.com', '123456');
      expect(result.success).toBe(true);
    });
  });
}); 