import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthService } from '../services/authService';
import { forceCleanStart, shouldForceCleanStart } from '../scripts/force-clean-start';

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
      
      // Vérifier si un nettoyage forcé est nécessaire
      const needsCleanStart = await shouldForceCleanStart();
      if (needsCleanStart) {
        console.log('🧹 Nettoyage forcé nécessaire...');
        await forceCleanStart();
        setUser(null);
        setIsLoading(false);
        return;
      }
      
      // Vérifier si l'utilisateur est authentifié
      const isAuthenticated = await AuthService.isAuthenticated();
      console.log('🔧 isAuthenticated:', isAuthenticated);
      
      if (isAuthenticated) {
        const userProfile = await AuthService.getCurrentUser();
        console.log('🔧 userProfile trouvé:', userProfile ? 'Oui' : 'Non');
        
        if (userProfile && userProfile.email && userProfile.name) {
          console.log('✅ Utilisateur authentifié valide:', userProfile.email);
          setUser(userProfile);
        } else {
          console.log('❌ Profil utilisateur invalide, nettoyage...');
          // Nettoyer l'état d'authentification si le profil est invalide
          await AuthService.logout();
          setUser(null);
        }
      } else {
        console.log('❌ Aucun utilisateur authentifié');
        setUser(null);
      }
    } catch (error) {
      console.error('❌ Erreur lors de la vérification de l\'état d\'authentification:', error);
      // En cas d'erreur, on considère qu'il n'y a pas d'utilisateur authentifié
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