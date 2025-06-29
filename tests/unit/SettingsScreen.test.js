/**
 * Tests unitaires pour SettingsScreen
 * Focus sur la fonctionnalité "Signaler un problème"
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import SettingsScreen from '../../screens/SettingsScreen';
import * as RN from 'react-native';

// Mock des services et contextes
jest.mock('../../services/storageService', () => ({
  getAccessibilityPrefs: jest.fn().mockResolvedValue({
    requireRamp: false,
    requireElevator: false,
    requireAccessibleParking: false,
    requireAccessibleToilets: false,
  }),
  getNotificationPrefs: jest.fn().mockResolvedValue({
    newPlaces: false,
    reviews: false,
    updates: false,
  }),
  getSearchRadius: jest.fn().mockResolvedValue('800'),
  getMapStyle: jest.fn().mockResolvedValue('standard'),
  setAccessibilityPrefs: jest.fn(),
  setNotificationPrefs: jest.fn(),
  setSearchRadius: jest.fn(),
  setMapStyle: jest.fn(),
}));

jest.mock('../../services/biometricService', () => ({
  BiometricService: {
    isBiometricAvailable: jest.fn().mockResolvedValue(false),
    getSupportedTypes: jest.fn().mockResolvedValue({ names: [] }),
    loadBiometricPreferences: jest.fn().mockResolvedValue({ enabled: false }),
  },
}));

jest.mock('../../theme/ThemeContext', () => ({
  useAppTheme: () => ({
    isDarkMode: false,
    toggleTheme: jest.fn(),
    resetToDefault: jest.fn(),
  }),
}));

jest.mock('../../theme/TextSizeContext', () => ({
  useTextSize: () => ({
    isLargeText: false,
    toggleTextSize: jest.fn(),
    resetToDefault: jest.fn(),
    textSizes: {
      title: 18,
      subtitle: 16,
      body: 14,
      caption: 12,
    },
  }),
}));

jest.mock('../../theme/ScreenReaderContext', () => ({
  useScreenReader: () => ({
    isScreenReaderEnabled: false,
  }),
}));

jest.mock('../../theme/AuthContext', () => ({
  useAuth: () => ({
    user: {
      email: 'test@example.com',
      name: 'Test User',
    },
  }),
}));

describe('SettingsScreen - Signalement de problème', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('Fonctionnalité "Signaler un problème"', () => {
    it('devrait afficher le bouton de signalement', async () => {
      const { getByTestId } = render(<SettingsScreen navigation={{ navigate: jest.fn() }} />);
      
      await waitFor(() => {
        expect(getByTestId('settings-screen')).toBeTruthy();
      });
      
      const reportButton = getByTestId('report-problem-button');
      expect(reportButton).toBeTruthy();
    });

    it('devrait ouvrir la boîte de dialogue au clic', async () => {
      const mockAlert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
      
      const { getByTestId } = render(<SettingsScreen navigation={{ navigate: jest.fn() }} />);
      
      await waitFor(() => {
        expect(getByTestId('settings-screen')).toBeTruthy();
      });
      
      const reportButton = getByTestId('report-problem-button');
      fireEvent.press(reportButton);
      
      expect(mockAlert).toHaveBeenCalledWith(
        'Signaler un problème',
        'Comment souhaitez-vous nous contacter ?',
        expect.any(Array)
      );
      
      mockAlert.mockRestore();
    });

    it('devrait avoir exactement 2 options dans la boîte de dialogue', async () => {
      const mockAlert = jest.spyOn(Alert, 'alert').mockImplementation((title, message, buttons) => {
        expect(buttons).toHaveLength(2);
      });
      
      const { getByTestId } = render(<SettingsScreen navigation={{ navigate: jest.fn() }} />);
      
      await waitFor(() => {
        expect(getByTestId('settings-screen')).toBeTruthy();
      });
      
      const reportButton = getByTestId('report-problem-button');
      fireEvent.press(reportButton);
      
      mockAlert.mockRestore();
    });

    it('devrait avoir l\'option "Annuler" avec le bon style', async () => {
      const mockAlert = jest.spyOn(Alert, 'alert').mockImplementation((title, message, buttons) => {
        const cancelButton = buttons.find(btn => btn.text === 'Annuler');
        expect(cancelButton).toBeDefined();
        expect(cancelButton.style).toBe('cancel');
      });
      
      const { getByTestId } = render(<SettingsScreen navigation={{ navigate: jest.fn() }} />);
      
      await waitFor(() => {
        expect(getByTestId('settings-screen')).toBeTruthy();
      });
      
      const reportButton = getByTestId('report-problem-button');
      fireEvent.press(reportButton);
      
      mockAlert.mockRestore();
    });

    it('devrait avoir l\'option "Envoyer un email" avec une fonction onPress', async () => {
      const mockAlert = jest.spyOn(Alert, 'alert').mockImplementation((title, message, buttons) => {
        const emailButton = buttons.find(btn => btn.text === 'Envoyer un email');
        expect(emailButton).toBeDefined();
        expect(typeof emailButton.onPress).toBe('function');
      });
      
      const { getByTestId } = render(<SettingsScreen navigation={{ navigate: jest.fn() }} />);
      
      await waitFor(() => {
        expect(getByTestId('settings-screen')).toBeTruthy();
      });
      
      const reportButton = getByTestId('report-problem-button');
      fireEvent.press(reportButton);
      
      mockAlert.mockRestore();
    });

    it('devrait avoir les bonnes propriétés pour chaque bouton', async () => {
      const mockAlert = jest.spyOn(Alert, 'alert').mockImplementation((title, message, buttons) => {
        // Vérifier le bouton Annuler
        const cancelButton = buttons[0];
        expect(cancelButton.text).toBe('Annuler');
        expect(cancelButton.style).toBe('cancel');
        
        // Vérifier le bouton Email
        const emailButton = buttons[1];
        expect(emailButton.text).toBe('Envoyer un email');
        expect(typeof emailButton.onPress).toBe('function');
      });
      
      const { getByTestId } = render(<SettingsScreen navigation={{ navigate: jest.fn() }} />);
      
      await waitFor(() => {
        expect(getByTestId('settings-screen')).toBeTruthy();
      });
      
      const reportButton = getByTestId('report-problem-button');
      fireEvent.press(reportButton);
      
      mockAlert.mockRestore();
    });

    it('devrait afficher le bouton d\'aide et support', async () => {
      const { getByTestId } = render(<SettingsScreen navigation={{ navigate: jest.fn() }} />);
      
      await waitFor(() => {
        expect(getByTestId('settings-screen')).toBeTruthy();
      });
      
      const helpButton = getByTestId('help-support-button');
      expect(helpButton).toBeTruthy();
    });

    it('devrait ouvrir la boîte de dialogue d\'aide au clic', async () => {
      const mockAlert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
      
      const { getByTestId } = render(<SettingsScreen navigation={{ navigate: jest.fn() }} />);
      
      await waitFor(() => {
        expect(getByTestId('settings-screen')).toBeTruthy();
      });
      
      const helpButton = getByTestId('help-support-button');
      fireEvent.press(helpButton);
      
      expect(mockAlert).toHaveBeenCalledWith(
        'Aide et Support',
        'Que souhaitez-vous faire ?',
        expect.any(Array)
      );
      
      mockAlert.mockRestore();
    });

    it('devrait avoir 3 options dans la boîte de dialogue d\'aide', async () => {
      const mockAlert = jest.spyOn(Alert, 'alert').mockImplementation((title, message, buttons) => {
        expect(buttons).toHaveLength(3);
      });
      
      const { getByTestId } = render(<SettingsScreen navigation={{ navigate: jest.fn() }} />);
      
      await waitFor(() => {
        expect(getByTestId('settings-screen')).toBeTruthy();
      });
      
      const helpButton = getByTestId('help-support-button');
      fireEvent.press(helpButton);
      
      mockAlert.mockRestore();
    });

    it('devrait avoir les bonnes options dans la boîte de dialogue d\'aide', async () => {
      const mockAlert = jest.spyOn(Alert, 'alert').mockImplementation((title, message, buttons) => {
        const expectedOptions = ['Annuler', 'Guide d\'utilisation', 'FAQ'];
        
        buttons.forEach((button, index) => {
          expect(button.text).toBe(expectedOptions[index]);
          if (index === 0) {
            expect(button.style).toBe('cancel');
          } else {
            expect(typeof button.onPress).toBe('function');
          }
        });
      });
      
      const { getByTestId } = render(<SettingsScreen navigation={{ navigate: jest.fn() }} />);
      
      await waitFor(() => {
        expect(getByTestId('settings-screen')).toBeTruthy();
      });
      
      const helpButton = getByTestId('help-support-button');
      fireEvent.press(helpButton);
      
      mockAlert.mockRestore();
    });

    it('devrait afficher le bouton "À propos de l\'application"', async () => {
      const { getByTestId } = render(<SettingsScreen navigation={{ navigate: jest.fn() }} />);
      await waitFor(() => {
        expect(getByTestId('settings-screen')).toBeTruthy();
      });
      const aboutButton = getByTestId('about-app-button');
      expect(aboutButton).toBeTruthy();
    });

    it('devrait ouvrir la landing page au clic sur "À propos de l\'application"', async () => {
      jest.spyOn(RN.Linking, 'canOpenURL').mockResolvedValue(true);
      const openURLSpy = jest.spyOn(RN.Linking, 'openURL').mockResolvedValue();
      const { getByTestId } = render(<SettingsScreen navigation={{ navigate: jest.fn() }} />);
      await waitFor(() => {
        expect(getByTestId('settings-screen')).toBeTruthy();
      });
      const aboutButton = getByTestId('about-app-button');
      fireEvent.press(aboutButton);
      await waitFor(() => {
        expect(RN.Linking.canOpenURL).toHaveBeenCalledWith('https://fleau75.github.io/Landing-Business-AccessPlus/');
        expect(openURLSpy).toHaveBeenCalledWith('https://fleau75.github.io/Landing-Business-AccessPlus/');
      });
    });

    it('affiche une alerte si la page web ne peut pas être ouverte', async () => {
      jest.spyOn(RN.Linking, 'canOpenURL').mockResolvedValue(false);
      const mockAlert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
      const { getByTestId } = render(<SettingsScreen navigation={{ navigate: jest.fn() }} />);
      await waitFor(() => {
        expect(getByTestId('settings-screen')).toBeTruthy();
      });
      const aboutButton = getByTestId('about-app-button');
      fireEvent.press(aboutButton);
      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith(
          'Erreur',
          "Impossible d'ouvrir la page web",
          [{ text: 'OK' }]
        );
      });
      mockAlert.mockRestore();
    });
  });
}); 