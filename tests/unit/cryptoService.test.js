// Forcer l'utilisation du vrai module CryptoService
jest.unmock('../../services/cryptoService');

// Import CryptoService après les mocks
import CryptoService from '../../services/cryptoService';

describe('CryptoService', () => {
  describe('isEncrypted', () => {
    it('retourne true pour un texte chiffré commençant par U2F', () => {
      const result = CryptoService.isEncrypted('U2Fencrypted_text');
      expect(result).toBe(true);
    });

    it('retourne false pour un texte non chiffré', () => {
      const result = CryptoService.isEncrypted('plain_text');
      expect(result).toBe(false);
    });

    it('retourne la chaîne vide pour un texte vide', () => {
      const result = CryptoService.isEncrypted('');
      expect(result).toBe('');
    });

    it('retourne null pour null', () => {
      const result = CryptoService.isEncrypted(null);
      expect(result).toBe(null);
    });

    it('retourne undefined pour undefined', () => {
      const result = CryptoService.isEncrypted(undefined);
      expect(result).toBe(undefined);
    });

    it('retourne false pour un texte commençant par autre chose que U2F', () => {
      const result = CryptoService.isEncrypted('ABCencrypted_text');
      expect(result).toBe(false);
    });
  });
}); 