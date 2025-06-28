// Forcer l'utilisation du vrai module SimplePlacesService
jest.unmock('../../services/simplePlacesService');

// Import SimplePlacesService après les mocks
import SimplePlacesService from '../../services/simplePlacesService';

global.fetch = jest.fn();

describe('SimplePlacesService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    SimplePlacesService.resetApiStatus();
  });

  describe('getPhotoUrl', () => {
    it('retourne une URL valide avec photo_reference', () => {
      const photoRef = 'test-photo-ref';
      const url = SimplePlacesService.getPhotoUrl(photoRef);
      
      expect(url).toContain('https://maps.googleapis.com/maps/api/place/photo');
      expect(url).toContain('maxwidth=400');
      expect(url).toContain('photo_reference=test-photo-ref');
      expect(url).toContain('key=');
    });

    it('retourne null si photo_reference est vide', () => {
      const url = SimplePlacesService.getPhotoUrl('');
      expect(url).toBeNull();
    });

    it('retourne null si photo_reference est null', () => {
      const url = SimplePlacesService.getPhotoUrl(null);
      expect(url).toBeNull();
    });

    it('utilise la largeur personnalisée', () => {
      const photoRef = 'test-photo-ref';
      const url = SimplePlacesService.getPhotoUrl(photoRef, 800);
      
      expect(url).toContain('https://maps.googleapis.com/maps/api/place/photo');
      expect(url).toContain('maxwidth=800');
      expect(url).toContain('photo_reference=test-photo-ref');
      expect(url).toContain('key=');
    });
  });

  describe('resetApiStatus', () => {
    it('réinitialise le cache de statut API', () => {
      // Forcer un statut
      SimplePlacesService.isApiEnabled = true;
      
      SimplePlacesService.resetApiStatus();
      
      expect(SimplePlacesService.isApiEnabled).toBeNull();
    });
  });

  describe('checkApiStatus', () => {
    it('retourne false si l\'API est désactivée', async () => {
      global.fetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ status: 'REQUEST_DENIED', error_message: 'API key invalid' })
      });

      const result = await SimplePlacesService.checkApiStatus();
      
      expect(result).toBe(false);
      expect(SimplePlacesService.isApiEnabled).toBe(false);
    });

    it('retourne true si l\'API est accessible', async () => {
      global.fetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ status: 'OK', results: [] })
      });

      const result = await SimplePlacesService.checkApiStatus();
      
      expect(result).toBe(true);
      expect(SimplePlacesService.isApiEnabled).toBe(true);
    });
  });
}); 