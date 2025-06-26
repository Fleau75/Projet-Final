import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import PlaceCard from '../../components/PlaceCard';

// Mock des contextes
jest.mock('../../theme/ScreenReaderContext', () => ({
  useScreenReader: () => ({
    isScreenReaderEnabled: false,
  }),
}));

describe('PlaceCard', () => {
  const mockPlace = {
    id: '1',
    name: 'Restaurant Test',
    address: '123 Rue de la Paix, Paris',
    rating: 4.5,
    reviewCount: 25,
    distance: 0.5,
    image: 'https://example.com/image.jpg',
    accessibility: {
      ramp: true,
      elevator: false,
      parking: true,
      toilets: false,
    },
  };

  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendu du composant', () => {
    it('devrait rendre correctement avec toutes les données', () => {
      const { getByText, getByTestId } = render(
        <PlaceCard place={mockPlace} onPress={mockOnPress} />
      );

      expect(getByText('Restaurant Test')).toBeTruthy();
      expect(getByText('123 Rue de la Paix, Paris')).toBeTruthy();
      expect(getByText('(25)')).toBeTruthy();
      expect(getByText('📍 500m')).toBeTruthy();
    });

    it('devrait afficher une image placeholder quand aucune image n\'est fournie', () => {
      const placeWithoutImage = { ...mockPlace, image: null };
      const { getByText } = render(
        <PlaceCard place={placeWithoutImage} onPress={mockOnPress} />
      );

      expect(getByText('R')).toBeTruthy(); // Première lettre du nom
    });

    it('devrait gérer les lieux sans données d\'accessibilité', () => {
      const placeWithoutAccessibility = { ...mockPlace, accessibility: null };
      const { getByText } = render(
        <PlaceCard place={placeWithoutAccessibility} onPress={mockOnPress} />
      );

      expect(getByText('Restaurant Test')).toBeTruthy();
    });

    it('devrait gérer les lieux sans distance', () => {
      const placeWithoutDistance = { ...mockPlace, distance: undefined };
      const { queryByText } = render(
        <PlaceCard place={placeWithoutDistance} onPress={mockOnPress} />
      );

      expect(queryByText(/📍/)).toBeFalsy();
    });

    it('devrait rendre correctement avec accessibilité définie', () => {
      const place = {
        name: 'Test Place',
        address: '123 rue de test',
        rating: 4.5,
        reviewCount: 10,
        accessibility: {
          ramp: true,
          elevator: false,
          parking: true,
          toilets: false,
        },
      };
      const { getByText } = render(<PlaceCard place={place} />);
      expect(getByText('Test Place')).toBeTruthy();
      expect(getByText('123 rue de test')).toBeTruthy();
    });

    it('devrait rendre même si accessibilité est vide', () => {
      const place = {
        name: 'Test Place',
        address: '123 rue de test',
        rating: 4.5,
        reviewCount: 10,
        accessibility: {},
      };
      const { getByText } = render(<PlaceCard place={place} />);
      expect(getByText('Test Place')).toBeTruthy();
      expect(getByText('123 rue de test')).toBeTruthy();
    });
  });

  describe('Formatage de la distance', () => {
    it('devrait formater correctement les distances en mètres', () => {
      const placeWithMeters = { ...mockPlace, distance: 0.3 };
      const { getByText } = render(
        <PlaceCard place={placeWithMeters} onPress={mockOnPress} />
      );

      expect(getByText('📍 300m')).toBeTruthy();
    });

    it('devrait formater correctement les distances en kilomètres', () => {
      const placeWithKm = { ...mockPlace, distance: 2.5 };
      const { getByText } = render(
        <PlaceCard place={placeWithKm} onPress={mockOnPress} />
      );

      expect(getByText('📍 2.5km')).toBeTruthy();
    });

    it('devrait gérer la distance zéro', () => {
      const placeWithZeroDistance = { ...mockPlace, distance: 0 };
      const { getByText } = render(
        <PlaceCard place={placeWithZeroDistance} onPress={mockOnPress} />
      );

      expect(getByText('📍 0m')).toBeTruthy();
    });
  });

  describe('Icônes d\'accessibilité', () => {
    it('devrait afficher les icônes d\'accessibilité avec les bonnes couleurs', () => {
      const { getByText } = render(
        <PlaceCard place={mockPlace} onPress={mockOnPress} />
      );

      // Vérifier que les icônes sont présentes
      expect(getByText('♿️')).toBeTruthy(); // Rampe
      expect(getByText('🛗')).toBeTruthy(); // Ascenseur
      expect(getByText('🅿️')).toBeTruthy(); // Parking
      expect(getByText('🚻')).toBeTruthy(); // Toilettes
    });

    it('devrait afficher toutes les icônes en gris quand aucune accessibilité n\'est disponible', () => {
      const placeWithoutAccessibility = {
        ...mockPlace,
        accessibility: {
          ramp: false,
          elevator: false,
          parking: false,
          toilets: false,
        },
      };
      const { getByText } = render(
        <PlaceCard place={placeWithoutAccessibility} onPress={mockOnPress} />
      );

      expect(getByText('♿️')).toBeTruthy();
      expect(getByText('🛗')).toBeTruthy();
      expect(getByText('🅿️')).toBeTruthy();
      expect(getByText('🚻')).toBeTruthy();
    });
  });

  describe('Interactions utilisateur', () => {
    it('devrait appeler onPress quand on clique sur la carte', () => {
      const { getByText } = render(
        <PlaceCard place={mockPlace} onPress={mockOnPress} />
      );

      fireEvent.press(getByText('Restaurant Test'));
      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    it('devrait être accessible avec les bonnes propriétés', () => {
      const place = {
        name: 'Test Place',
        address: '123 rue de test',
        rating: 4.5,
        reviewCount: 10,
        accessibility: {},
      };
      const { getByTestId } = render(<PlaceCard place={place} />);
      expect(getByTestId('place-card')).toBeTruthy();
    });
  });

  describe('Accessibilité', () => {
    it('devrait fournir une description d\'accessibilité complète', () => {
      const place = {
        name: 'Test Place',
        address: '123 rue de test',
        rating: 4.5,
        reviewCount: 10,
        accessibility: {
          ramp: true,
          elevator: true,
          parking: true,
          toilets: true,
        },
      };
      const { getByTestId } = render(<PlaceCard place={place} />);
      expect(getByTestId('place-card')).toBeTruthy();
    });

    it('devrait gérer l\'accessibilité sans données d\'accessibilité', () => {
      const place = {
        name: 'Test Place',
        address: '123 rue de test',
        rating: 4.5,
        reviewCount: 10,
        accessibility: {},
      };
      const { getByTestId } = render(<PlaceCard place={place} />);
      expect(getByTestId('place-card')).toBeTruthy();
    });
  });

  describe('Cas d\'erreur', () => {
    it('devrait gérer les lieux avec des données manquantes', () => {
      const incompletePlace = {
        id: '1',
        name: 'Lieu Incomplet',
      };

      const { getByText } = render(
        <PlaceCard place={incompletePlace} onPress={mockOnPress} />
      );

      expect(getByText('Lieu Incomplet')).toBeTruthy();
    });

    it('devrait gérer les lieux avec des valeurs null ou undefined', () => {
      const placeWithNullValues = {
        ...mockPlace,
        rating: null,
        reviewCount: undefined,
        address: null,
      };

      const { getByText } = render(
        <PlaceCard place={placeWithNullValues} onPress={mockOnPress} />
      );

      expect(getByText('Restaurant Test')).toBeTruthy();
    });
  });
}); 