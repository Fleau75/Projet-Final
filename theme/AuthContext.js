import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthService } from '../services/authService';

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
      
      // MODIFICATION : Suppression de la persistance
      // L'application redémarre toujours sur l'écran de connexion
      console.log('🔄 Mode sans persistance activé - redémarrage sur écran de connexion');
      
      // Nettoyer toute session existante
      await AuthService.logout();
      setUser(null);
      
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
      const userProfile = await AuthService.getCurrentUser();
      setUser(userProfile);
      return result;
    } catch (error) {
      throw error;
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
      await AuthService.logout();
      setUser(null);
    } catch (error) {
      throw error;
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