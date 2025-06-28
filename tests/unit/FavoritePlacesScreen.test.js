import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Alert } from 'react-native';
import FavoritePlacesScreen from '../../screens/FavoritePlacesScreen';

jest.mock('../../theme/TextSizeContext', () => ({
  useTextSize: () => ({ textSizes: { title: 20, subtitle: 16, body: 14, caption: 12 } }),
}));

jest.mock('react-native-paper', () => {
  const real = jest.requireActual('react-native-paper');
  return {
    ...real,
    useTheme: () => ({ colors: { background: '#fff', surface: '#f5f5f5' } }),
  };
});

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

jest.spyOn(Alert, 'alert').mockImplementation(() => {});

describe('FavoritePlacesScreen', () => {
  const mockNavigation = {
    navigate: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('affiche le titre et les statistiques', () => {
    const { getByText } = render(<FavoritePlacesScreen navigation={mockNavigation} />);
    
    expect(getByText('Lieux favoris')).toBeTruthy();
    expect(getByText('Note moyenne')).toBeTruthy();
  });

  it('affiche la liste des favoris', () => {
    const { getByText } = render(<FavoritePlacesScreen navigation={mockNavigation} />);
    
    expect(getByText('Restaurant Le Jardin Accessible')).toBeTruthy();
    expect(getByText('Cinéma Gaumont Opéra')).toBeTruthy();
    expect(getByText('Musée d\'Orsay')).toBeTruthy();
  });

  it('affiche la barre de recherche', () => {
    const { getByPlaceholderText } = render(<FavoritePlacesScreen navigation={mockNavigation} />);
    
    expect(getByPlaceholderText('Rechercher dans mes favoris...')).toBeTruthy();
  });

  it('affiche les catégories de filtres', () => {
    const { getByText } = render(<FavoritePlacesScreen navigation={mockNavigation} />);
    
    expect(getByText('Tous')).toBeTruthy();
    expect(getByText('Restaurants')).toBeTruthy();
    expect(getByText('Culture')).toBeTruthy();
  });
}); 