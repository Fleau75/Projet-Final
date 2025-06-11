import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TextSizeContext = createContext();
const TEXT_SIZE_KEY = '@AccessPlus:textSize';

export const useTextSize = () => {
  const context = useContext(TextSizeContext);
  if (!context) {
    throw new Error('useTextSize doit être utilisé dans un TextSizeProvider');
  }
  return context;
};

export const TextSizeProvider = ({ children }) => {
  const [isLargeText, setIsLargeText] = useState(false);

  useEffect(() => {
    loadTextSizePreference();
  }, []);

  const loadTextSizePreference = async () => {
    try {
      const savedPreference = await AsyncStorage.getItem(TEXT_SIZE_KEY);
      if (savedPreference !== null) {
        setIsLargeText(savedPreference === 'true');
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la préférence de taille de texte:', error);
    }
  };

  const toggleTextSize = async () => {
    try {
      const newValue = !isLargeText;
      setIsLargeText(newValue);
      await AsyncStorage.setItem(TEXT_SIZE_KEY, newValue.toString());
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la préférence de taille de texte:', error);
    }
  };

  const resetToDefault = async () => {
    try {
      setIsLargeText(false); // Revenir à la taille normale par défaut
      await AsyncStorage.setItem(TEXT_SIZE_KEY, 'false');
    } catch (error) {
      console.error('Erreur lors de la réinitialisation de la taille de texte:', error);
    }
  };

  // Facteurs de taille pour différents éléments de texte
  const textSizes = {
    title: isLargeText ? 24 : 18,
    subtitle: isLargeText ? 20 : 16,
    body: isLargeText ? 18 : 14,
    caption: isLargeText ? 16 : 12,
    button: isLargeText ? 18 : 14,
    label: isLargeText ? 16 : 12,
  };

  return (
    <TextSizeContext.Provider value={{ isLargeText, toggleTextSize, resetToDefault, textSizes }}>
      {children}
    </TextSizeContext.Provider>
  );
}; 