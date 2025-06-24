import AsyncStorage from '@react-native-async-storage/async-storage';
import StorageService from './storageService';

/**
 * Service pour gérer les préférences d'accessibilité de l'utilisateur
 */
export class AccessibilityService {
  
  /**
   * Charger les préférences d'accessibilité depuis AsyncStorage
   */
  static async loadAccessibilityPreferences() {
    try {
      const savedPrefs = await StorageService.getAccessibilityPrefs();
      if (savedPrefs !== null) {
        return savedPrefs;
      }
      return {
        requireRamp: false,
        requireElevator: false,
        requireAccessibleParking: false,
        requireAccessibleToilets: false,
      };
    } catch (error) {
      console.error('Erreur lors du chargement des préférences d\'accessibilité:', error);
      return {
        requireRamp: false,
        requireElevator: false,
        requireAccessibleParking: false,
        requireAccessibleToilets: false,
      };
    }
  }

  /**
   * Vérifie si un lieu respecte les préférences d'accessibilité de l'utilisateur
   */
  static meetsAccessibilityPreferences(place, accessibilityPrefs) {
    // Si aucune préférence n'est activée, le lieu est valide
    const hasActivePrefs = Object.values(accessibilityPrefs).some(pref => pref);
    if (!hasActivePrefs) {
      return true;
    }

    // Vérifier chaque préférence activée
    const accessibility = place.accessibility || {};
    
    if (accessibilityPrefs.requireRamp && !accessibility.ramp) {
      return false;
    }
    
    if (accessibilityPrefs.requireElevator && !accessibility.elevator) {
      return false;
    }
    
    if (accessibilityPrefs.requireAccessibleParking && !accessibility.parking) {
      return false;
    }
    
    if (accessibilityPrefs.requireAccessibleToilets && !accessibility.toilets) {
      return false;
    }

    return true;
  }

  /**
   * Filtre une liste de lieux selon les préférences d'accessibilité
   */
  static async filterPlacesByPreferences(places) {
    const preferences = await this.loadAccessibilityPreferences();
    return places.filter(place => this.meetsAccessibilityPreferences(place, preferences));
  }

  /**
   * Obtient les préférences actives sous forme de texte lisible
   */
  static getActivePreferencesText(accessibilityPrefs) {
    const activePrefs = Object.entries(accessibilityPrefs)
      .filter(([key, value]) => value)
      .map(([key]) => {
        switch(key) {
          case 'requireRamp': return 'Rampe';
          case 'requireElevator': return 'Ascenseur';
          case 'requireAccessibleParking': return 'Parking';
          case 'requireAccessibleToilets': return 'Toilettes';
          default: return key;
        }
      });
    
    return activePrefs.length > 0 ? activePrefs.join(', ') : '';
  }

  /**
   * Vérifie si des préférences sont actives
   */
  static hasActivePreferences(accessibilityPrefs) {
    return Object.values(accessibilityPrefs).some(pref => pref);
  }
} 