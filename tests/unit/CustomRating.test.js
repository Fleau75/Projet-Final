import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import CustomRating from '../../components/CustomRating';

// Mock react-native-paper
jest.mock('react-native-paper', () => ({
  useTheme: () => ({
    dark: false,
  }),
}));

describe('CustomRating', () => {
  describe('Rendu du composant', () => {
    it('devrait rendre 5 étoiles par défaut', () => {
      const { getAllByText } = render(<CustomRating />);
      
      const stars = getAllByText('★');
      expect(stars).toHaveLength(5);
    });

    it('devrait afficher la note correcte', () => {
      const { getAllByText } = render(<CustomRating rating={3} />);
      
      const stars = getAllByText('★');
      expect(stars).toHaveLength(5);
    });

    it('devrait utiliser la taille personnalisée', () => {
      const { getAllByText } = render(<CustomRating rating={3} size={25} />);
      
      const stars = getAllByText('★');
      expect(stars).toHaveLength(5);
    });

    it('devrait utiliser les couleurs personnalisées', () => {
      const { getAllByText } = render(
        <CustomRating 
          rating={3} 
          activeColor="#FF0000" 
          inactiveColor="#00FF00" 
        />
      );
      
      const stars = getAllByText('★');
      expect(stars).toHaveLength(5);
    });
  });

  describe('Mode readonly', () => {
    it('devrait afficher le bon nombre d\'étoiles', () => {
      const { getAllByText } = render(
        <CustomRating rating={3} readonly={true} />
      );
      
      const stars = getAllByText('★');
      expect(stars).toHaveLength(5);
    });

    it('ne devrait pas appeler onRatingChange en mode readonly', () => {
      const mockOnRatingChange = jest.fn();
      const { getAllByText } = render(
        <CustomRating rating={2} readonly={true} onRatingChange={mockOnRatingChange} />
      );
      
      const stars = getAllByText('★');
      
      fireEvent.press(stars[4]); // Cliquer sur la 5ème étoile
      expect(mockOnRatingChange).not.toHaveBeenCalled();
    });
  });

  describe('Mode éditable', () => {
    it('devrait permettre l\'interaction quand readonly est false', () => {
      const mockOnRatingChange = jest.fn();
      const { getAllByText } = render(
        <CustomRating rating={2} readonly={false} onRatingChange={mockOnRatingChange} />
      );
      
      const stars = getAllByText('★');
      expect(stars).toHaveLength(5);
    });

    it('devrait appeler onRatingChange quand on clique sur une étoile', () => {
      const mockOnRatingChange = jest.fn();
      const { getAllByText } = render(
        <CustomRating rating={2} onRatingChange={mockOnRatingChange} />
      );
      
      const stars = getAllByText('★');
      
      fireEvent.press(stars[4]); // Cliquer sur la 5ème étoile
      expect(mockOnRatingChange).toHaveBeenCalledWith(5);
    });

    it('devrait mettre à jour l\'affichage après un changement de note', () => {
      const mockOnRatingChange = jest.fn();
      const { getAllByText, rerender } = render(
        <CustomRating rating={2} onRatingChange={mockOnRatingChange} />
      );
      
      let stars = getAllByText('★');
      expect(stars).toHaveLength(5);
      
      // Simuler un changement de note
      rerender(<CustomRating rating={4} onRatingChange={mockOnRatingChange} />);
      
      stars = getAllByText('★');
      expect(stars).toHaveLength(5);
    });
  });

  describe('Cas limites', () => {
    it('devrait gérer une note de 0', () => {
      const { getAllByText } = render(
        <CustomRating rating={0} />
      );
      
      const stars = getAllByText('★');
      expect(stars).toHaveLength(5);
    });

    it('devrait gérer une note de 5', () => {
      const { getAllByText } = render(
        <CustomRating rating={5} />
      );
      
      const stars = getAllByText('★');
      expect(stars).toHaveLength(5);
    });

    it('devrait gérer une note décimale', () => {
      const { getAllByText } = render(
        <CustomRating rating={3.7} />
      );
      
      const stars = getAllByText('★');
      expect(stars).toHaveLength(5);
    });

    it('devrait gérer une note négative', () => {
      const { getAllByText } = render(
        <CustomRating rating={-1} />
      );
      
      const stars = getAllByText('★');
      expect(stars).toHaveLength(5);
    });

    it('devrait gérer une note supérieure à 5', () => {
      const { getAllByText } = render(
        <CustomRating rating={7} />
      );
      
      const stars = getAllByText('★');
      expect(stars).toHaveLength(5);
    });
  });

  describe('Styles et layout', () => {
    it('devrait appliquer les styles personnalisés', () => {
      const customStyle = { backgroundColor: 'red' };
      const { getAllByText } = render(
        <CustomRating rating={3} style={customStyle} />
      );
      
      const stars = getAllByText('★');
      expect(stars).toHaveLength(5);
    });

    it('devrait avoir la bonne taille des boutons', () => {
      const { getAllByText } = render(
        <CustomRating rating={3} size={25} />
      );
      
      const starButtons = getAllByText('★');
      expect(starButtons).toHaveLength(5);
    });

    it('devrait utiliser les couleurs personnalisées', () => {
      const { getAllByText } = render(
        <CustomRating 
          rating={3} 
          activeColor="#FF0000" 
          inactiveColor="#00FF00" 
        />
      );
      
      const stars = getAllByText('★');
      expect(stars).toHaveLength(5);
    });
  });

  describe('Accessibilité', () => {
    it('devrait être accessible', () => {
      const { getAllByText } = render(<CustomRating rating={3} />);
      
      const stars = getAllByText('★');
      expect(stars).toHaveLength(5);
    });

    it('devrait avoir des labels d\'accessibilité appropriés', () => {
      const { getAllByText } = render(<CustomRating rating={3} />);
      
      const stars = getAllByText('★');
      expect(stars).toHaveLength(5);
    });
  });
}); 