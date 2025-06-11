/**
 * Contexte pour gérer le thème (mode sombre/clair) dans l'application
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightTheme, darkTheme } from './index';

// Création du contexte
const ThemeContext = createContext();

// Hook personnalisé pour utiliser le thème
export const useAppTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAppTheme doit être utilisé dans un ThemeProvider');
  }
  return context;
};

// Provider du thème
export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(true); // Thème sombre par défaut
  const [isLoading, setIsLoading] = useState(true);

  // Charger la préférence de thème sauvegardée
  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme_preference');
      if (savedTheme !== null) {
        setIsDarkMode(savedTheme === 'dark');
      } else {
        // Si aucune préférence sauvegardée, utiliser le thème sombre par défaut
        setIsDarkMode(true);
        await AsyncStorage.setItem('theme_preference', 'dark');
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la préférence de thème:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = async () => {
    try {
      const newTheme = !isDarkMode;
      setIsDarkMode(newTheme);
      await AsyncStorage.setItem('theme_preference', newTheme ? 'dark' : 'light');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la préférence de thème:', error);
    }
  };

  const resetToDefault = async () => {
    try {
      setIsDarkMode(false); // Revenir au thème clair par défaut
      await AsyncStorage.setItem('theme_preference', 'light');
    } catch (error) {
      console.error('Erreur lors de la réinitialisation du thème:', error);
    }
  };

  const currentTheme = isDarkMode ? darkTheme : lightTheme;

  const value = {
    isDarkMode,
    toggleTheme,
    resetToDefault,
    theme: currentTheme,
    isLoading,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}; 