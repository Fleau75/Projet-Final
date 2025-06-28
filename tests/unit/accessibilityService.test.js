// Forcer l'utilisation du vrai module AccessibilityService
jest.unmock('../../services/accessibilityService');

// Import AccessibilityService après les mocks
import { AccessibilityService } from '../../services/accessibilityService';

describe('AccessibilityService', () => {
  describe('meetsAccessibilityPreferences', () => {
    it('retourne true si aucune préférence n\'est activée', () => {
      const place = { name: 'Test Place' };
      const prefs = {
        requireRamp: false,
        requireElevator: false,
        requireAccessibleParking: false,
        requireAccessibleToilets: false,
      };

      const result = AccessibilityService.meetsAccessibilityPreferences(place, prefs);
      
      expect(result).toBe(true);
    });

    it('retourne true si le lieu respecte toutes les préférences', () => {
      const place = {
        name: 'Test Place',
        accessibility: {
          ramp: true,
          elevator: true,
          parking: true,
          toilets: true,
        },
      };
      const prefs = {
        requireRamp: true,
        requireElevator: true,
        requireAccessibleParking: true,
        requireAccessibleToilets: true,
      };

      const result = AccessibilityService.meetsAccessibilityPreferences(place, prefs);
      
      expect(result).toBe(true);
    });

    it('retourne false si le lieu ne respecte pas une préférence', () => {
      const place = {
        name: 'Test Place',
        accessibility: {
          ramp: true,
          elevator: false, // Manquant
          parking: true,
          toilets: true,
        },
      };
      const prefs = {
        requireRamp: true,
        requireElevator: true, // Requis
        requireAccessibleParking: true,
        requireAccessibleToilets: true,
      };

      const result = AccessibilityService.meetsAccessibilityPreferences(place, prefs);
      
      expect(result).toBe(false);
    });
  });

  describe('getActivePreferencesText', () => {
    it('retourne une chaîne vide si aucune préférence active', () => {
      const prefs = {
        requireRamp: false,
        requireElevator: false,
        requireAccessibleParking: false,
        requireAccessibleToilets: false,
      };

      const result = AccessibilityService.getActivePreferencesText(prefs);
      
      expect(result).toBe('');
    });

    it('retourne les préférences actives en texte', () => {
      const prefs = {
        requireRamp: true,
        requireElevator: false,
        requireAccessibleParking: true,
        requireAccessibleToilets: false,
      };

      const result = AccessibilityService.getActivePreferencesText(prefs);
      
      expect(result).toBe('Rampe, Parking');
    });
  });

  describe('hasActivePreferences', () => {
    it('retourne false si aucune préférence active', () => {
      const prefs = {
        requireRamp: false,
        requireElevator: false,
        requireAccessibleParking: false,
        requireAccessibleToilets: false,
      };

      const result = AccessibilityService.hasActivePreferences(prefs);
      
      expect(result).toBe(false);
    });

    it('retourne true si au moins une préférence active', () => {
      const prefs = {
        requireRamp: false,
        requireElevator: true,
        requireAccessibleParking: false,
        requireAccessibleToilets: false,
      };

      const result = AccessibilityService.hasActivePreferences(prefs);
      
      expect(result).toBe(true);
    });
  });
}); 