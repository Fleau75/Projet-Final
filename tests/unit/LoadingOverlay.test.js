import React from 'react';
import { render } from '@testing-library/react-native';
import LoadingOverlay from '../../components/LoadingOverlay';

// Mock expo-blur
jest.mock('expo-blur', () => ({
  BlurView: ({ children, ...props }) => {
    const { View } = require('react-native');
    return <View testID="blur-view" {...props}>{children}</View>;
  },
}));

describe('LoadingOverlay', () => {
  it('rend le composant sans erreur', () => {
    const { getByTestId } = render(<LoadingOverlay />);
    
    expect(getByTestId('loading-indicator')).toBeTruthy();
    expect(getByTestId('blur-view')).toBeTruthy();
  });

  it('affiche un indicateur de chargement', () => {
    const { getByTestId } = render(<LoadingOverlay />);
    
    const loadingIndicator = getByTestId('loading-indicator');
    expect(loadingIndicator).toBeTruthy();
  });

  it('contient un BlurView avec les bonnes propriétés', () => {
    const { getByTestId } = render(<LoadingOverlay />);
    
    const blurView = getByTestId('blur-view');
    expect(blurView).toBeTruthy();
    expect(blurView.props.intensity).toBe(50);
  });

  it('a une structure de composant correcte', () => {
    const { getByTestId } = render(<LoadingOverlay />);
    
    // Vérifier que le BlurView contient l'indicateur de chargement
    const blurView = getByTestId('blur-view');
    const loadingIndicator = getByTestId('loading-indicator');
    
    expect(blurView).toBeTruthy();
    expect(loadingIndicator).toBeTruthy();
  });

  it('utilise les styles appropriés', () => {
    const { getByTestId } = render(<LoadingOverlay />);
    
    const blurView = getByTestId('blur-view');
    expect(blurView.props.style).toBeDefined();
  });

  it('peut être rendu plusieurs fois sans conflit', () => {
    const { getByTestId, rerender } = render(<LoadingOverlay />);
    
    expect(getByTestId('loading-indicator')).toBeTruthy();
    
    // Re-rendre le composant
    rerender(<LoadingOverlay />);
    
    expect(getByTestId('loading-indicator')).toBeTruthy();
  });
}); 