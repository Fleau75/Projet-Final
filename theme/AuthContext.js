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

  // Initialisation - ne plus restaurer automatiquement l'état d'authentification
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      console.log('🔍 Initialisation de l\'authentification...');
      
      // Ne plus restaurer automatiquement l'état d'authentification au démarrage
      // L'utilisateur devra toujours se reconnecter (via biométrie ou manuellement)
      console.log('🔐 Aucune restauration automatique - retour à l\'écran de connexion');
      
      // Nettoyer l'état d'authentification pour forcer la reconnexion
      setUser(null);
      
      // Nettoyer les données d'authentification stockées pour éviter les conflits
      await AuthService.logout();
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation de l\'authentification:', error);
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
      console.log('🔧 AuthContext.register - Début avec:', { email, userData });
      
      const result = await AuthService.register(email, password, userData);
      console.log('🔧 AuthService.register résultat:', result);
      
      if (result.success) {
        // Attendre un peu pour s'assurer que les données sont bien sauvegardées
        await new Promise(resolve => setTimeout(resolve, 100));
        
      const userProfile = await AuthService.getCurrentUser();
        console.log('🔧 getCurrentUser après inscription:', userProfile);
        
        if (userProfile) {
      setUser(userProfile);
          console.log('✅ Utilisateur mis à jour dans le contexte:', userProfile);
        } else {
          console.warn('⚠️ getCurrentUser retourne null après inscription');
        }
      }
      
      return result;
    } catch (error) {
      console.error('❌ Erreur dans AuthContext.register:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('🔓 Début de la déconnexion...');
      await AuthService.logout();
      setUser(null);
      console.log('✅ Déconnexion réussie - utilisateur mis à null');
      
      // Forcer la redirection vers l'écran de connexion
      // L'App.js va automatiquement basculer vers le navigateur d'authentification
      // car user est maintenant null
      
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