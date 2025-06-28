// Mock des dépendances
jest.mock('../../services/placesApi', () => ({
  default: {
    getPlaceDetails: jest.fn(),
  },
}));

// Mock fetch globalement
global.fetch = jest.fn();

// Forcer l'utilisation du vrai module placesSearch
jest.unmock('../../services/placesSearch');

// Import placesSearch après les mocks
import { searchPlaces, searchPlacesByText } from '../../services/placesSearch';

describe('placesSearch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fetch.mockClear();
  });

  describe('searchPlaces', () => {
    it('retourne un tableau vide en cas d\'erreur de l\'API', async () => {
      fetch.mockRejectedValue(new Error('Network error'));

      const result = await searchPlaces('restaurant');
      
      expect(result).toEqual([]);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('maps.googleapis.com/maps/api/place/textsearch/json')
      );
    });

    it('retourne un tableau vide si le statut de l\'API n\'est pas OK', async () => {
      fetch.mockResolvedValue({
        json: jest.fn().mockResolvedValue({
          status: 'ZERO_RESULTS',
          results: []
        })
      });

      const result = await searchPlaces('restaurant');
      
      expect(result).toEqual([]);
    });

    it('retourne un tableau vide si l\'API retourne une erreur', async () => {
      fetch.mockResolvedValue({
        json: jest.fn().mockResolvedValue({
          status: 'REQUEST_DENIED',
          error_message: 'API key invalid'
        })
      });

      const result = await searchPlaces('restaurant');
      
      expect(result).toEqual([]);
    });
  });

  describe('searchPlacesByText', () => {
    it('retourne un tableau vide en cas d\'erreur de l\'API', async () => {
      fetch.mockRejectedValue(new Error('Network error'));

      const result = await searchPlacesByText('restaurant');
      
      expect(result).toEqual([]);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('maps.googleapis.com/maps/api/place/textsearch/json')
      );
    });

    it('retourne un tableau vide si le statut de l\'API n\'est pas OK', async () => {
      fetch.mockResolvedValue({
        json: jest.fn().mockResolvedValue({
          status: 'ZERO_RESULTS',
          results: []
        })
      });

      const result = await searchPlacesByText('restaurant');
      
      expect(result).toEqual([]);
    });

    it('utilise les coordonnées par défaut si aucune localisation n\'est fournie', async () => {
      fetch.mockResolvedValue({
        json: jest.fn().mockResolvedValue({
          status: 'OK',
          results: []
        })
      });

      await searchPlacesByText('restaurant');
      
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('location=48.8566,2.3522')
      );
    });

    it('utilise les coordonnées fournies si une localisation est spécifiée', async () => {
      fetch.mockResolvedValue({
        json: jest.fn().mockResolvedValue({
          status: 'OK',
          results: []
        })
      });

      const location = { latitude: 43.2965, longitude: 5.3698 };
      await searchPlacesByText('restaurant', location);
      
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('location=43.2965,5.3698')
      );
    });

    it('utilise le rayon fourni si spécifié', async () => {
      fetch.mockResolvedValue({
        json: jest.fn().mockResolvedValue({
          status: 'OK',
          results: []
        })
      });

      const location = { latitude: 43.2965, longitude: 5.3698, radius: 5000 };
      await searchPlacesByText('restaurant', location);
      
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('radius=5000')
      );
    });

    it('limite les résultats au nombre maximum spécifié', async () => {
      const mockResults = Array(30).fill(null).map((_, i) => ({
        place_id: `place_${i}`,
        name: `Restaurant ${i}`,
        formatted_address: `Address ${i}`,
        geometry: { location: { lat: 0, lng: 0 } },
        rating: 4.0,
        user_ratings_total: 100,
        types: ['restaurant']
      }));

      fetch.mockResolvedValue({
        json: jest.fn().mockResolvedValue({
          status: 'OK',
          results: mockResults
        })
      });

      const { default: PlacesApiService } = require('../../services/placesApi');
      PlacesApiService.getPlaceDetails.mockResolvedValue({
        formatted_phone_number: '0123456789',
        website: 'https://example.com',
        opening_hours: { open_now: true },
        price_level: 2,
        reviews: []
      });

      const result = await searchPlacesByText('restaurant', null, 10);
      
      expect(result.length).toBeLessThanOrEqual(10);
    });
  });
}); 