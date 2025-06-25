import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthService } from '../../services/authService';
import CryptoService from '../../services/cryptoService';
import StorageService from '../../services/storageService';

// Mock des services dépendants
jest.mock('../../services/cryptoService');
jest.mock('../../services/storageService');

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.clear();
  });

  describe('initialize', () => {
    it('devrait initialiser le service avec succès', async () => {
      CryptoService.migrateToEncryption.mockResolvedValue();
      
      await AuthService.initialize();
      
      expect(CryptoService.migrateToEncryption).toHaveBeenCalled();
    });

    it('devrait gérer les erreurs d\'initialisation', async () => {
      const error = new Error('Erreur de migration');
      CryptoService.migrateToEncryption.mockRejectedValue(error);
      
      await AuthService.initialize();
      
      expect(CryptoService.migrateToEncryption).toHaveBeenCalled();
    });
  });

  describe('register', () => {
    const mockUserData = {
      email: 'test@example.com',
      name: 'Test User',
      migrateVisitorData: true,
    };

    it('devrait enregistrer un nouvel utilisateur avec succès', async () => {
      AsyncStorage.getItem.mockResolvedValue(null);
      StorageService.getAllUserData.mockResolvedValue({});
      StorageService.migrateVisitorDataToUser.mockResolvedValue({ migrated: true });
      
      const result = await AuthService.register('test@example.com', 'password123', mockUserData);
      
      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe('test@example.com');
    });

    it('devrait rejeter l\'inscription si l\'email existe déjà', async () => {
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify({ email: 'test@example.com' }));
      
      await expect(AuthService.register('test@example.com', 'password123', mockUserData))
        .rejects.toThrow('Cette adresse email est déjà utilisée');
    });

    it('devrait migrer les données visiteur si demandé', async () => {
      AsyncStorage.getItem.mockResolvedValue(null);
      StorageService.getAllUserData.mockResolvedValue({ favorites: ['place1'] });
      StorageService.migrateVisitorDataToUser.mockResolvedValue({ migrated: true });
      
      await AuthService.register('test@example.com', 'password123', mockUserData);
      
      expect(StorageService.getAllUserData).toHaveBeenCalledWith('visitor');
      expect(StorageService.migrateVisitorDataToUser).toHaveBeenCalledWith('test@example.com', true);
    });

    it('devrait nettoyer les données visiteur si la migration est refusée', async () => {
      AsyncStorage.getItem.mockResolvedValue(null);
      StorageService.getAllUserData.mockResolvedValue({});
      StorageService.clearUserData.mockResolvedValue();
      
      const userDataWithoutMigration = { ...mockUserData, migrateVisitorData: false };
      
      await AuthService.register('test@example.com', 'password123', userDataWithoutMigration);
      
      expect(StorageService.clearUserData).toHaveBeenCalledWith('visitor');
    });

    it('devrait gérer le compte visiteur spécial', async () => {
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
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockUser));
      
      const result = await AuthService.login('test@example.com', 'password123');
      
      expect(result.success).toBe(true);
    });

    it('devrait rejeter la connexion avec un email invalide', async () => {
      AsyncStorage.getItem.mockResolvedValue(null);
      
      await expect(AuthService.login('invalid@example.com', 'password123'))
        .rejects.toThrow('Email ou mot de passe incorrect');
    });

    it('devrait rejeter la connexion avec un mot de passe incorrect', async () => {
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockUser));
      
      await expect(AuthService.login('test@example.com', 'wrongpassword'))
        .rejects.toThrow('Email ou mot de passe incorrect');
    });

    it('devrait gérer les utilisateurs de test', async () => {
      const testUser = {
        email: 'test@example.com',
        password: '123456',
        name: 'Utilisateur Test',
      };
      
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(testUser));
      
      const result = await AuthService.login('test@example.com', '123456');
      
      expect(result.success).toBe(true);
    });
  });

  describe('logout', () => {
    it('devrait déconnecter l\'utilisateur avec succès', async () => {
      AsyncStorage.removeItem.mockResolvedValue();
      const result = await AuthService.logout();
      expect(result.success).toBe(true);
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('isAuthenticated');
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('currentUser');
    });

    it('devrait gérer les erreurs de déconnexion', async () => {
      AsyncStorage.removeItem.mockRejectedValue(new Error('Erreur de suppression'));
      const result = await AuthService.logout();
      expect(result.success).toBe(true); // Le service retourne toujours success: true
      AsyncStorage.removeItem.mockReset(); // <-- Ajouté pour éviter que le mock d'erreur ne pollue les autres tests
    });
  });

  describe('isAuthenticated', () => {
    it('devrait retourner true si l\'utilisateur est connecté', async () => {
      AsyncStorage.getItem.mockImplementation((key) => {
        if (key === 'isAuthenticated') return Promise.resolve('true');
        if (key === 'userProfile') return Promise.resolve(JSON.stringify({ email: 'test@example.com', name: 'Test User' }));
        return Promise.resolve(null);
      });
      const result = await AuthService.isAuthenticated();
      expect(result).toBe(true);
    });

    it('devrait retourner false si l\'utilisateur n\'est pas connecté', async () => {
      AsyncStorage.getItem.mockResolvedValue(null);
      
      const result = await AuthService.isAuthenticated();
      
      expect(result).toBe(false);
    });
  });

  describe('getCurrentUser', () => {
    it('devrait retourner l\'utilisateur connecté', async () => {
      AsyncStorage.getItem.mockImplementation((key) => {
        if (key === 'isAuthenticated') return Promise.resolve('true');
        if (key === 'userProfile') return Promise.resolve(JSON.stringify({ email: 'test@example.com', name: 'Test User' }));
        return Promise.resolve(null);
      });
      const result = await AuthService.getCurrentUser();
      expect(result).toEqual({ email: 'test@example.com', name: 'Test User' });
    });

    it('devrait retourner null si aucun utilisateur connecté', async () => {
      AsyncStorage.getItem.mockResolvedValue(null);
      
      const result = await AuthService.getCurrentUser();
      
      expect(result).toBeNull();
    });
  });

  describe('isCurrentUserVisitor', () => {
    it('devrait retourner true pour un utilisateur visiteur', async () => {
      const mockUser = { email: 'visiteur@accessplus.com', isVisitor: true };
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockUser));
      
      const result = await AuthService.isCurrentUserVisitor();
      
      expect(result).toBe(true);
    });

    it('devrait retourner false pour un utilisateur normal', async () => {
      const mockUser = { email: 'test@example.com', isVisitor: false };
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockUser));
      
      const result = await AuthService.isCurrentUserVisitor();
      
      expect(result).toBe(false);
    });
  });

  describe('checkUserExists', () => {
    it('devrait retourner true si l\'utilisateur existe', async () => {
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify({ email: 'test@example.com' }));
      
      const result = await AuthService.checkUserExists('test@example.com');
      
      expect(result).toBe(true);
    });

    it('devrait retourner false si l\'utilisateur n\'existe pas', async () => {
      AsyncStorage.getItem.mockResolvedValue(null);
      
      const result = await AuthService.checkUserExists('nonexistent@example.com');
      
      expect(result).toBe(false);
    });
  });

  describe('sendPasswordResetEmail', () => {
    it('devrait envoyer un email de réinitialisation avec succès', async () => {
      const mockUser = { email: 'test@example.com' };
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockUser));
      
      const result = await AuthService.sendPasswordResetEmail('test@example.com');
      
      expect(result.success).toBe(true);
    });

    it('devrait toujours retourner un succès même si l\'utilisateur n\'existe pas', async () => {
      AsyncStorage.getItem.mockResolvedValue(null);
      
      const result = await AuthService.sendPasswordResetEmail('nonexistent@example.com');
      expect(result.success).toBe(true);
    });
  });

  describe('verifyResetToken', () => {
    it('devrait vérifier un token valide', async () => {
      const mockToken = 'valid-token';
      StorageService.getUserData.mockResolvedValue({
        token: mockToken,
        expiresAt: Date.now() + 3600000 // 1 heure dans le futur
      });
      
      const result = await AuthService.verifyResetToken('test@example.com');
      
      expect(result).toBe(true);
    });

    it('devrait rejeter un token invalide', async () => {
      StorageService.getUserData.mockResolvedValue(null);
      
      const result = await AuthService.verifyResetToken('test@example.com');
      
      expect(result).toBe(false);
    });
  });

  describe('updatePassword', () => {
    it('devrait mettre à jour le mot de passe avec succès', async () => {
      // Mock token valide
      StorageService.getUserData.mockResolvedValue({
        token: 'valid-token',
        expiresAt: Date.now() + 3600000
      });
      // Mock utilisateur de test
      AsyncStorage.getItem.mockImplementation((key) => {
        if (key === 'user_test@example.com') return Promise.resolve(JSON.stringify({ email: 'test@example.com', password: 'oldpassword' }));
        return Promise.resolve(null);
      });
      AsyncStorage.setItem.mockResolvedValue();
      const result = await AuthService.updatePassword('test@example.com', 'newpassword');
      expect(result.success).toBe(true);
    });

    it('devrait rejeter si le token est invalide', async () => {
      StorageService.getUserData.mockResolvedValue(null);
      
      await expect(AuthService.updatePassword('nonexistent@example.com', 'newpassword'))
        .rejects.toThrow('Token de réinitialisation invalide ou expiré');
    });
  });

  describe('changePassword', () => {
    it('devrait changer le mot de passe avec succès', async () => {
      // Mock utilisateur connecté avec le bon mot de passe
      AsyncStorage.getItem.mockImplementation((key) => {
        if (key === 'isAuthenticated') return Promise.resolve('true');
        if (key === 'userProfile') return Promise.resolve(JSON.stringify({ email: 'test@example.com', name: 'Test User', password: 'currentpassword' }));
        if (key === 'user_test@example.com') return Promise.resolve(JSON.stringify({ email: 'test@example.com', password: 'currentpassword' }));
        return Promise.resolve(null);
      });
      AsyncStorage.setItem.mockResolvedValue();
      const result = await AuthService.changePassword('currentpassword', 'newpassword');
      expect(result.success).toBe(true);
    });

    it('devrait rejeter si aucun utilisateur connecté', async () => {
      AsyncStorage.getItem.mockResolvedValue(null);
      
      await expect(AuthService.changePassword('wrongpassword', 'newpassword'))
        .rejects.toThrow('Aucun utilisateur connecté');
    });
  });

  describe('getErrorMessage', () => {
    it('devrait retourner le message d\'erreur approprié', () => {
      const networkError = new Error('Network Error');
      const authError = new Error('Email ou mot de passe incorrect');
      
      expect(AuthService.getErrorMessage(networkError)).toBe('Network Error');
      expect(AuthService.getErrorMessage(authError)).toBe('Email ou mot de passe incorrect');
    });

    it('devrait retourner un message par défaut pour les erreurs inconnues', () => {
      const unknownError = new Error('Unknown error');
      
      expect(AuthService.getErrorMessage(unknownError)).toBe('Unknown error');
    });
  });

  describe('Gestion des utilisateurs de test', () => {
    it('devrait reconnaître les utilisateurs de test', async () => {
      const testUsers = [
        'test@example.com',
        'demo@accessplus.com',
        'admin@accessplus.com'
      ];
      AsyncStorage.getItem.mockImplementation((key) => {
        if (key.startsWith('user_')) return Promise.resolve(JSON.stringify({ email: key.replace('user_', '') }));
        return Promise.resolve(null);
      });
      for (const email of testUsers) {
        const exists = await AuthService.checkUserExists(email);
        expect(exists).toBe(true);
      }
    });

    it('devrait permettre la connexion avec les utilisateurs de test', async () => {
      const testUser = {
        email: 'test@example.com',
        password: '123456',
        name: 'Utilisateur Test',
      };
      
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(testUser));
      
      const result = await AuthService.login('test@example.com', '123456');
      
      expect(result.success).toBe(true);
    });
  });
}); 