import React, { createContext, useContext, useState, useEffect } from 'react';
import { AccessibilityInfo } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ScreenReaderContext = createContext();
const SCREEN_READER_KEY = '@AccessPlus:screenReader';

export const useScreenReader = () => {
  const context = useContext(ScreenReaderContext);
  if (!context) {
    throw new Error('useScreenReader doit être utilisé dans un ScreenReaderProvider');
  }
  return context;
};

export const ScreenReaderProvider = ({ children }) => {
  const [isScreenReaderEnabled, setIsScreenReaderEnabled] = useState(false);

  useEffect(() => {
    // Charger la préférence sauvegardée
    loadScreenReaderPreference();
    
    // Écouter les changements du lecteur d'écran du système
    const subscription = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      handleScreenReaderChange
    );

    // Vérifier l'état initial du lecteur d'écran
    AccessibilityInfo.isScreenReaderEnabled().then(
      screenReaderEnabled => {
        setIsScreenReaderEnabled(screenReaderEnabled);
      }
    );

    return () => {
      subscription.remove();
    };
  }, []);

  const loadScreenReaderPreference = async () => {
    try {
      const savedPreference = await AsyncStorage.getItem(SCREEN_READER_KEY);
      if (savedPreference !== null) {
        setIsScreenReaderEnabled(savedPreference === 'true');
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la préférence du lecteur d\'écran:', error);
    }
  };

  const handleScreenReaderChange = (isEnabled) => {
    setIsScreenReaderEnabled(isEnabled);
    saveScreenReaderPreference(isEnabled);
  };

  const saveScreenReaderPreference = async (isEnabled) => {
    try {
      await AsyncStorage.setItem(SCREEN_READER_KEY, isEnabled.toString());
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la préférence du lecteur d\'écran:', error);
    }
  };

  // Fonction utilitaire pour lire un texte
  const speak = (text) => {
    if (isScreenReaderEnabled) {
      AccessibilityInfo.announceForAccessibility(text);
    }
  };

  return (
    <ScreenReaderContext.Provider value={{ 
      isScreenReaderEnabled,
      speak
    }}>
      {children}
    </ScreenReaderContext.Provider>
  );
}; 