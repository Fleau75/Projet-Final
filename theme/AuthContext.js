import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthService } from '../services/authService';
import { BiometricService } from '../services/biometricService';

// Création du contexte
const AuthContext = createContext();

// Hook personnalisé pour utiliser l'authentification
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};

// Provider de l'authentification
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Vérifier l'état d'authentification au démarrage
  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      console.log('🔍 Vérification de l\'état d\'authentification au démarrage...');
      
      // Vérifier si l'utilisateur est déjà connecté
      const isAuthenticated = await AuthService.isAuthenticated();
      
      if (isAuthenticated) {
        const userProfile = await AuthService.getCurrentUser();
        
        if (userProfile) {
          console.log('✅ Utilisateur déjà connecté:', userProfile.email);
          
          // Vérifier si la biométrie est activée pour cet utilisateur
          const biometricPrefs = await BiometricService.loadBiometricPreferences();
          const isBiometricEnabled = biometricPrefs.enabled && biometricPrefs.email === userProfile.email;
          
          if (isBiometricEnabled) {
            console.log('🔐 Biométrie activée pour cet utilisateur');
            // L'utilisateur peut utiliser la biométrie pour se reconnecter
            // mais on le connecte directement pour l'instant
            setUser(userProfile);
          } else {
            console.log('🔐 Biométrie non activée, connexion directe');
            setUser(userProfile);
          }
        } else {
          console.log('❌ Profil utilisateur invalide, nettoyage nécessaire');
          await AuthService.logout();
          setUser(null);
        }
      } else {
        console.log('❌ Aucun utilisateur connecté');
        setUser(null);
      }
      
    } catch (error) {
      console.error('❌ Erreur lors de la vérification de l\'état d\'authentification:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const result = await AuthService.login(email, password);
      if (result.success) {
        const userProfile = await AuthService.getCurrentUser();
        setUser(userProfile);
      }
      return result;
    } catch (error) {
      // Ne pas propager l'erreur, mais la retourner pour que l'UI puisse la gérer
      return { success: false, error: error.message };
    }
  };

  const register = async (email, password, userData) => {
    try {
      const result = await AuthService.register(email, password, userData);
      const userProfile = await AuthService.getCurrentUser();
      setUser(userProfile);
      return result;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('🔓 Début de la déconnexion...');
      await AuthService.logout();
      setUser(null);
      console.log('✅ Déconnexion réussie');
    } catch (error) {
      console.error('❌ Erreur lors de la déconnexion:', error);
      // Même en cas d'erreur, on force la déconnexion dans l'état local
      setUser(null);
      // Ne pas propager l'erreur pour éviter les crashs
    }
  };

  const value = {
    user,
    isLoading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 