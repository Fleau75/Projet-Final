// Mock du ConfigService
jest.mock('../../services/configService', () => ({
  __esModule: true,
  default: {
    getGooglePlacesApiKey: jest.fn(() => null),
  },
}));

// Forcer l'utilisation du vrai module PlacesApiService
jest.unmock('../../services/placesApi');

// Import PlacesApiService après les mocks
import PlacesApiService from '../../services/placesApi';

global.fetch = jest.fn();

describe('PlacesApiService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('searchPlaces retourne [] si la clé API est absente', async () => {
    const result = await PlacesApiService.searchPlaces('paris');
    expect(result).toEqual([]);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('getPlaceDetails retourne null si la clé API est absente', async () => {
    const result = await PlacesApiService.getPlaceDetails('fake-id');
    expect(result).toBeNull();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('searchNearbyPlaces retourne [] si la clé API est absente', async () => {
    const result = await PlacesApiService.searchNearbyPlaces({ lat: 0, lng: 0 });
    expect(result).toEqual([]);
    expect(global.fetch).not.toHaveBeenCalled();
  });
}); 