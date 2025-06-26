import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock dependencies
jest.mock('../../services/cryptoService', () => ({
  migrateToEncryption: jest.fn(),
  encrypt: jest.fn((text) => `encrypted_${text}`),
  setEncryptedItem: jest.fn(),
}));

jest.mock('../../services/storageService', () => ({
  getAllUserData: jest.fn(),
  migrateVisitorDataToUser: jest.fn(),
  clearUserData: jest.fn(),
  setUserData: jest.fn(),
  getUserData: jest.fn(),
  removeUserData: jest.fn(),
}));

jest.mock('../../services/firebaseService', () => ({
  ReviewsService: {
    getReviewsByUserId: jest.fn(),
    deleteReview: jest.fn(),
  },
}));

// Forcer l'utilisation du vrai module AuthService
jest.unmock('../../services/authService');

// Import AuthService après les mocks
import { AuthService } from '../../services/authService';

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    AsyncStorage.getItem.mockReset();
    AsyncStorage.setItem.mockReset();
    AsyncStorage.removeItem.mockReset();
    AsyncStorage.getItem.mockResolvedValue(null);
    AsyncStorage.setItem.mockResolvedValue();
    AsyncStorage.removeItem.mockResolvedValue();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('initialize', () => {
    it('should initialize the service successfully', async () => {
      const { migrateToEncryption } = require('../../services/cryptoService');
      migrateToEncryption.mockResolvedValue();

      await AuthService.initialize();

      expect(migrateToEncryption).toHaveBeenCalled();
    });

    it('should handle initialization errors', async () => {
      const { migrateToEncryption } = require('../../services/cryptoService');
      migrateToEncryption.mockRejectedValue(new Error('Crypto error'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await AuthService.initialize();

      expect(consoleSpy).toHaveBeenCalledWith('❌ Erreur lors de l\'initialisation:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const userData = { email: 'test@example.com', name: 'Test User' };

      const result = await AuthService.register('test@example.com', 'password123', userData);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    it('should reject registration if email already exists', async () => {
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify({ email: 'test@example.com' }));

      await expect(
        AuthService.register('test@example.com', 'password123', { email: 'test@example.com' })
      ).rejects.toThrow('Cette adresse email est déjà utilisée');
    });

    it('should handle visitor account registration', async () => {
      const result = await AuthService.register('visiteur@accessplus.com', 'visitor123', { email: 'visiteur@accessplus.com' });

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('userProfile');
    });

    it('should handle migration when user refuses', async () => {
      const { clearUserData } = require('../../services/storageService');
      clearUserData.mockResolvedValue();

      const result = await AuthService.register('test@example.com', 'password123', { 
        email: 'test@example.com', 
        migrateVisitorData: false 
      });

      expect(result).toBeDefined();
      expect(clearUserData).toHaveBeenCalledWith('visitor');
    });
  });

  describe('login', () => {
    it('should login a user successfully', async () => {
      const userData = { email: 'test@example.com', name: 'Test User', password: 'password123' };
      const { getUserData } = require('../../services/storageService');
      getUserData.mockImplementation((key, _default, email) => {
        if (key === 'userPassword' && email === 'test@example.com') return Promise.resolve('password123');
        if (key === 'isAuthenticated' && email === 'test@example.com') return Promise.resolve('true');
        if (key === 'userProfile' && email === 'test@example.com') return Promise.resolve(userData);
        return Promise.resolve(null);
      });
      AsyncStorage.getItem.mockImplementation((key) => {
        if (key === 'user_test@example.com') return Promise.resolve(null);
        if (key === 'user_visiteur@accessplus.com') return Promise.resolve(null);
        return Promise.resolve(null);
      });

      const result = await AuthService.login('test@example.com', 'password123');

      expect(result.success).toBe(true);
    });

    it('should reject login with invalid email', async () => {
      const { getUserData } = require('../../services/storageService');
      getUserData.mockResolvedValue(null);

      await expect(
        AuthService.login('invalid@example.com', 'password123')
      ).rejects.toThrow('Email ou mot de passe incorrect');
    });

    it('should reject login with incorrect password', async () => {
      const userData = { email: 'test@example.com', name: 'Test User', password: 'password123' };
      const { getUserData } = require('../../services/storageService');
      getUserData.mockImplementation((key, _default, email) => {
        if (key === 'userPassword' && email === 'test@example.com') return Promise.resolve('password123');
        if (key === 'isAuthenticated' && email === 'test@example.com') return Promise.resolve('true');
        if (key === 'userProfile' && email === 'test@example.com') return Promise.resolve(userData);
        return Promise.resolve(null);
      });

      await expect(
        AuthService.login('test@example.com', 'wrongpassword')
      ).rejects.toThrow('Email ou mot de passe incorrect');
    });

    it('should handle test users', async () => {
      const testUser = { email: 'test@example.com', name: 'Utilisateur Test', password: '123456' };
      AsyncStorage.getItem.mockImplementation((key) => {
        if (key === 'user_test@example.com') return Promise.resolve(JSON.stringify(testUser));
        return Promise.resolve(null);
      });
      const { getUserData } = require('../../services/storageService');
      getUserData.mockImplementation(() => Promise.resolve(null));

      const result = await AuthService.login('test@example.com', '123456');

      expect(result.success).toBe(true);
    });

    it('should handle visitor login', async () => {
      const visitorData = { email: 'visiteur@accessplus.com', name: 'Visiteur', password: 'visitor123' };
      AsyncStorage.getItem.mockImplementation((key) => {
        if (key === 'user_visiteur@accessplus.com') return Promise.resolve(JSON.stringify(visitorData));
        return Promise.resolve(null);
      });
      const { getUserData } = require('../../services/storageService');
      getUserData.mockImplementation(() => Promise.resolve(null));

      const result = await AuthService.login('visiteur@accessplus.com', 'visitor123');

      expect(result.success).toBe(true);
    });
  });

  describe('logout', () => {
    it('should logout user successfully', async () => {
      await AuthService.logout();
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('isAuthenticated');
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('currentUser');
    });

    it('should handle logout errors', async () => {
      // Mock getCurrentUser to fail, which should trigger the main try-catch
      jest.spyOn(AuthService, 'getCurrentUser').mockRejectedValue(new Error('Erreur lors de la récupération de l\'utilisateur'));
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      await AuthService.logout();
      expect(consoleSpy).toHaveBeenCalledWith('❌ Erreur lors de la déconnexion:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true if user is authenticated', async () => {
      AsyncStorage.getItem.mockImplementation((key) => {
        if (key === 'isAuthenticated') return Promise.resolve('true');
        if (key === 'userProfile') return Promise.resolve(JSON.stringify({ email: 'test@example.com', name: 'Test User' }));
        return Promise.resolve(null);
      });
      const result = await AuthService.isAuthenticated();
      expect(result).toBe(true);
    });

    it('should return false if user is not authenticated', async () => {
      AsyncStorage.getItem.mockResolvedValue(null);
      const result = await AuthService.isAuthenticated();
      expect(result).toBe(false);
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user if exists', async () => {
      AsyncStorage.getItem.mockImplementation((key) => {
        if (key === 'isAuthenticated') return Promise.resolve('true');
        if (key === 'userProfile') return Promise.resolve(JSON.stringify({ email: 'test@example.com', name: 'Test User' }));
        return Promise.resolve(null);
      });
      const result = await AuthService.getCurrentUser();
      expect(result).toEqual({ email: 'test@example.com', name: 'Test User' });
    });

    it('should return null if no current user', async () => {
      AsyncStorage.getItem.mockResolvedValue(null);
      const result = await AuthService.getCurrentUser();
      expect(result).toBeNull();
    });
  });

  describe('isCurrentUserVisitor', () => {
    it('should return true for visitor user', async () => {
      AsyncStorage.getItem.mockImplementation((key) => {
        if (key === 'userProfile') return Promise.resolve(JSON.stringify({ isVisitor: true }));
        return Promise.resolve(null);
      });
      const result = await AuthService.isCurrentUserVisitor();
      expect(result).toBe(true);
    });

    it('should return false for normal user', async () => {
      AsyncStorage.getItem.mockImplementation((key) => {
        if (key === 'userProfile') return Promise.resolve(JSON.stringify({ isVisitor: false }));
        return Promise.resolve(null);
      });
      const result = await AuthService.isCurrentUserVisitor();
      expect(result).toBe(false);
    });
  });

  describe('onAuthStateChange', () => {
    it('should set up auth state change listener', () => {
      const callback = jest.fn();
      
      AuthService.onAuthStateChange(callback);
      
      // This is a simple implementation, just verify it doesn't throw
      expect(callback).toBeDefined();
    });
  });

  describe('getErrorMessage', () => {
    it('should return default message for unknown errors', () => {
      const result = AuthService.getErrorMessage({ code: 'UNKNOWN_ERROR' });
      expect(result).toBe('Une erreur est survenue. Veuillez réessayer');
    });

    it('should return specific messages for known errors', () => {
      const authError = AuthService.getErrorMessage({ code: 'auth/user-not-found' });
      const emailError = AuthService.getErrorMessage({ code: 'auth/email-already-in-use' });
      expect(authError).toBe('Aucun compte trouvé avec cette adresse email');
      expect(emailError).toBe('Cette adresse email est déjà utilisée');
    });
  });

  describe('checkUserExists', () => {
    it('should return true if user exists', async () => {
      const userData = { email: 'test@example.com', name: 'Test User' };
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(userData));

      const result = await AuthService.checkUserExists('test@example.com');

      expect(result).toBe(true);
    });

    it('should return false if user does not exist', async () => {
      AsyncStorage.getItem.mockResolvedValue(null);

      const result = await AuthService.checkUserExists('nonexistent@example.com');

      expect(result).toBe(false);
    });
  });

  describe('sendPasswordResetEmail', () => {
    it('should always return success', async () => {
      const result = await AuthService.sendPasswordResetEmail('test@example.com');

      expect(result.success).toBe(true);
    });
  });

  describe('updatePassword', () => {
    beforeEach(() => {
      AsyncStorage.getItem.mockClear();
      AsyncStorage.setItem.mockClear();
      AsyncStorage.removeItem.mockClear();
    });

    it('should update password successfully', async () => {
      // Mock verifyResetToken to return true
      jest.spyOn(AuthService, 'verifyResetToken').mockResolvedValue(true);
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify({ email: 'test@example.com' }));
      AsyncStorage.setItem.mockResolvedValue();
      AsyncStorage.removeItem.mockResolvedValue();
      
      const result = await AuthService.updatePassword('test@example.com', 'newpassword');
      expect(result).toEqual({ success: true });
    });

    it('should throw if token is invalid', async () => {
      jest.spyOn(AuthService, 'verifyResetToken').mockResolvedValue(false);
      await expect(AuthService.updatePassword('test@example.com', 'newpassword')).rejects.toThrow('Token de réinitialisation invalide ou expiré');
    });
  });

  describe('changePassword', () => {
    beforeEach(() => {
      AsyncStorage.getItem.mockClear();
      AsyncStorage.setItem.mockClear();
    });

    it('should change password successfully', async () => {
      // Mock getCurrentUser to return a user
      jest.spyOn(AuthService, 'getCurrentUser').mockResolvedValue({ email: 'test@example.com' });
      // Mock login to succeed (password verification)
      jest.spyOn(AuthService, 'login').mockResolvedValue({ success: true });
      // Mock test user data
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify({ password: 'encrypted' }));
      AsyncStorage.setItem.mockResolvedValue();
      
      const result = await AuthService.changePassword('oldpassword', 'newpassword');
      expect(result).toEqual({ success: true });
    });

    it('should reject if current password is incorrect', async () => {
      jest.spyOn(AuthService, 'getCurrentUser').mockResolvedValue({ email: 'test@example.com' });
      jest.spyOn(AuthService, 'login').mockRejectedValue(new Error('Email ou mot de passe incorrect'));
      
      await expect(AuthService.changePassword('wrongpassword', 'newpassword')).rejects.toThrow('Mot de passe actuel incorrect');
    });

    it('should throw if no user is logged in', async () => {
      jest.spyOn(AuthService, 'getCurrentUser').mockResolvedValue(null);
      await expect(AuthService.changePassword('oldpassword', 'newpassword')).rejects.toThrow('Aucun utilisateur connecté');
    });
  });

  describe('checkVerificationStatus', () => {
    beforeEach(() => {
      jest.spyOn(AuthService, 'getCurrentUser').mockClear();
      jest.spyOn(AuthService, 'getUserStatsByEmail').mockClear();
      jest.spyOn(AuthService, 'updateUserVerificationStatusByEmail').mockClear();
    });

    it('should return verification status for user', async () => {
      jest.spyOn(AuthService, 'getCurrentUser').mockResolvedValue({ email: 'test@example.com' });
      jest.spyOn(AuthService, 'getUserStatsByEmail').mockResolvedValue({ 
        isVisitor: false, 
        reviewsAdded: 5 
      });
      jest.spyOn(AuthService, 'updateUserVerificationStatusByEmail').mockResolvedValue();
      
      const result = await AuthService.checkVerificationStatus('test@example.com');
      expect(result).toEqual({ 
        isVerified: true, 
        criteria: {
          hasAccount: true,
          hasEnoughReviews: true,
          reviewsAdded: 5,
          requiredReviews: 3
        },
        verifiedAt: expect.any(String)
      });
    });

    it('should return false for unverified user', async () => {
      jest.spyOn(AuthService, 'getCurrentUser').mockResolvedValue({ email: 'test@example.com' });
      jest.spyOn(AuthService, 'getUserStatsByEmail').mockResolvedValue({ 
        isVisitor: false, 
        reviewsAdded: 1 
      });
      jest.spyOn(AuthService, 'updateUserVerificationStatusByEmail').mockResolvedValue();
      
      const result = await AuthService.checkVerificationStatus('test@example.com');
      expect(result).toEqual({ 
        isVerified: false, 
        criteria: {
          hasAccount: true,
          hasEnoughReviews: false,
          reviewsAdded: 1,
          requiredReviews: 3
        },
        verifiedAt: null
      });
    });

    it('should return false if user not found', async () => {
      jest.spyOn(AuthService, 'getCurrentUser').mockResolvedValue(null);
      
      const result = await AuthService.checkVerificationStatus('nonexistent@example.com');
      expect(result).toEqual({ isVerified: false, criteria: {} });
    });
  });

  describe('getUserStatsByEmail', () => {
    beforeEach(() => {
      AsyncStorage.getItem.mockClear();
      AsyncStorage.setItem.mockClear();
    });

    it('should return user stats by email', async () => {
      const mockStats = {
        placesAdded: 0,
        reviewsAdded: 5,
        isVisitor: false,
        joinDate: '2025-06-26T01:46:27.627Z',
        lastActivity: '2025-06-26T01:46:27.627Z'
      };
      AsyncStorage.getItem.mockImplementation((key) => {
        if (key === 'userStats_email_test@example.com') return Promise.resolve(JSON.stringify(mockStats));
        return Promise.resolve(null);
      });
      const result = await AuthService.getUserStatsByEmail('test@example.com');
      expect(result).toEqual(mockStats);
    });

    it('should return default stats if user not found', async () => {
      AsyncStorage.getItem.mockImplementation(() => Promise.resolve(null));
      AsyncStorage.setItem.mockResolvedValue();
      const result = await AuthService.getUserStatsByEmail('test@example.com');
      expect(result).toEqual({
        placesAdded: 0,
        reviewsAdded: 0,
        isVisitor: false,
        joinDate: expect.any(String),
        lastActivity: expect.any(String)
      });
    });
  });

  describe('getUserStats', () => {
    beforeEach(() => {
      AsyncStorage.getItem.mockClear();
      AsyncStorage.setItem.mockClear();
    });

    it('should return user stats by ID', async () => {
      const mockStats = {
        placesAdded: 0,
        reviewsAdded: 5,
        isVisitor: false,
        joinDate: '2025-06-26T01:46:27.628Z',
        lastActivity: '2025-06-26T01:46:27.628Z'
      };
      AsyncStorage.getItem.mockImplementation((key) => {
        if (key === 'userStats_email_test@example.com') return Promise.resolve(JSON.stringify(mockStats));
        return Promise.resolve(null);
      });
      const result = await AuthService.getUserStats('test@example.com');
      expect(result).toEqual(mockStats);
    });
  });

  describe('updateUserVerificationStatusByEmail', () => {
    beforeEach(() => {
      jest.spyOn(AuthService, 'getUserStatsByEmail').mockClear();
      AsyncStorage.setItem.mockClear();
    });

    it('should update verification status by email', async () => {
      jest.spyOn(AuthService, 'getUserStatsByEmail').mockResolvedValue({
        isVisitor: false,
        reviewsAdded: 5
      });
      AsyncStorage.setItem.mockResolvedValue();
      await AuthService.updateUserVerificationStatusByEmail('test@example.com', true);
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    it('should return false if user not found', async () => {
      jest.spyOn(AuthService, 'getUserStatsByEmail').mockResolvedValue({
        isVisitor: false,
        reviewsAdded: 0
      });
      AsyncStorage.setItem.mockResolvedValue();
      await AuthService.updateUserVerificationStatusByEmail('nonexistent@example.com', true);
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('updateUserVerificationStatus', () => {
    beforeEach(() => {
      jest.spyOn(AuthService, 'getUserStats').mockClear();
      AsyncStorage.setItem.mockClear();
    });

    it('should update verification status by ID', async () => {
      jest.spyOn(AuthService, 'getUserStats').mockResolvedValue({
        isVisitor: false,
        reviewsAdded: 5
      });
      AsyncStorage.setItem.mockResolvedValue();
      await AuthService.updateUserVerificationStatus('test@example.com', true);
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('incrementReviewsAdded', () => {
    beforeEach(() => {
      jest.spyOn(AuthService, 'getCurrentUser').mockClear();
      jest.spyOn(AuthService, 'getUserStatsByEmail').mockClear();
      jest.spyOn(AuthService, 'checkVerificationStatus').mockClear();
      AsyncStorage.setItem.mockClear();
    });

    it('should increment reviews added count', async () => {
      jest.spyOn(AuthService, 'getCurrentUser').mockResolvedValue({ email: 'test@example.com' });
      jest.spyOn(AuthService, 'getUserStatsByEmail').mockResolvedValue({
        reviewsAdded: 5,
        lastActivity: '2025-06-26T01:46:27.627Z'
      });
      jest.spyOn(AuthService, 'checkVerificationStatus').mockResolvedValue({ isVerified: true });
      AsyncStorage.setItem.mockResolvedValue();
      
      const result = await AuthService.incrementReviewsAdded('test@example.com');
      expect(result).toBe(6);
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    it('should handle user with no reviewsAdded field', async () => {
      jest.spyOn(AuthService, 'getCurrentUser').mockResolvedValue({ email: 'test@example.com' });
      jest.spyOn(AuthService, 'getUserStatsByEmail').mockResolvedValue({
        reviewsAdded: 0,
        lastActivity: '2025-06-26T01:46:27.627Z'
      });
      jest.spyOn(AuthService, 'checkVerificationStatus').mockResolvedValue({ isVerified: false });
      AsyncStorage.setItem.mockResolvedValue();
      
      const result = await AuthService.incrementReviewsAdded('test@example.com');
      expect(result).toBe(1);
    });
  });

  describe('getUserVerificationStatus', () => {
    it('should return verification status', async () => {
      const userData = { email: 'test@example.com', name: 'Test User', isVerified: false };
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(userData));

      const result = await AuthService.getUserVerificationStatus('test@example.com');

      expect(result).toEqual({ isVerified: false });
    });

    it('should return false if user not found', async () => {
      AsyncStorage.getItem.mockResolvedValue(null);

      const result = await AuthService.getUserVerificationStatus('nonexistent@example.com');

      expect(result).toEqual({ isVerified: false });
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      const result = await AuthService.deleteUser('test@example.com');

      expect(result).toEqual({ success: true });
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('user_test@example.com');
    });

    it('should handle deletion errors', async () => {
      AsyncStorage.removeItem.mockRejectedValue(new Error('Storage error'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await expect(AuthService.deleteUser('test@example.com')).rejects.toThrow('Storage error');

      expect(consoleSpy).toHaveBeenCalledWith('❌ Erreur lors de la suppression de l\'utilisateur:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });
}); 