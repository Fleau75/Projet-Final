import React from 'react';
import { render } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';

// Mock services
jest.mock('../../services/firebaseService', () => ({
  getAllPlaces: jest.fn(),
  getPlacesByCategory: jest.fn(),
}));

jest.mock('../../services/placesApi', () => ({
  searchNearbyPlaces: jest.fn(),
}));

jest.mock('../../services/simplePlacesService', () => ({
  getPlaces: jest.fn(),
}));

jest.mock('../../services/storageService', () => ({
  getSearchRadius: jest.fn(),
  getAccessibilityPreferences: jest.fn(),
}));

jest.mock('../../services/accessibilityService', () => ({
  AccessibilityService: {
    loadAccessibilityPreferences: jest.fn(),
    hasActivePreferences: jest.fn(),
    meetsAccessibilityPreferences: jest.fn(),
  },
}));

jest.mock('expo-location', () => ({
  hasServicesEnabledAsync: jest.fn(),
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  Accuracy: {
    Balanced: 'balanced',
  },
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Use the real HomeScreen
import HomeScreen from '../../screens/HomeScreen';

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};

describe('HomeScreen (integration)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default: no accessibility preferences
    const { AccessibilityService } = require('../../services/accessibilityService');
    AccessibilityService.loadAccessibilityPreferences.mockResolvedValue({
      requireRamp: false,
      requireElevator: false,
      requireAccessibleParking: false,
      requireAccessibleToilets: false,
    });
    AccessibilityService.hasActivePreferences.mockReturnValue(false);
    AccessibilityService.meetsAccessibilityPreferences.mockReturnValue(true);
    // Default: search radius
    const StorageService = require('../../services/storageService');
    StorageService.getSearchRadius.mockResolvedValue('1000');
    // Default: location enabled and granted
    const Location = require('expo-location');
    Location.hasServicesEnabledAsync.mockResolvedValue(true);
    Location.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
    Location.getCurrentPositionAsync.mockResolvedValue({
      coords: { latitude: 48.8566, longitude: 2.3522 }
    });
  });

  it('should render successfully with mocked services', async () => {
    // Mock services to return some data
    require('../../services/firebaseService').getAllPlaces.mockResolvedValueOnce([]);
    require('../../services/placesApi').searchNearbyPlaces.mockResolvedValueOnce([]);

    const { findByTestId } = render(
      <NavigationContainer>
        <HomeScreen navigation={mockNavigation} />
      </NavigationContainer>
    );
    
    // Just verify the component renders without crashing
    expect(await findByTestId('home-screen')).toBeTruthy();
  });

  it('should fallback to staticPlaces if both services fail', async () => {
    require('../../services/firebaseService').getAllPlaces.mockRejectedValueOnce(new Error('Firebase error'));
    require('../../services/placesApi').searchNearbyPlaces.mockRejectedValueOnce(new Error('Google error'));
    // Assert on a real staticPlaces value (e.g., 'Restaurant Le Marais')
    const { findByText } = render(
      <NavigationContainer>
        <HomeScreen navigation={mockNavigation} />
      </NavigationContainer>
    );
    expect(await findByText('Restaurant Le Marais')).toBeTruthy();
  });
}); 