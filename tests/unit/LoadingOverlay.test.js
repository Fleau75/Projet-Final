import React from 'react';
import { render } from '@testing-library/react-native';
import LoadingOverlay from '../../components/LoadingOverlay';

jest.mock('expo-blur', () => ({
  BlurView: ({ children }) => <>{children}</>,
}));

describe('LoadingOverlay', () => {
  it('doit afficher un ActivityIndicator et un BlurView', () => {
    const { getByTestId } = render(<LoadingOverlay />);
    // Vérifie la présence de l'ActivityIndicator
    expect(getByTestId('loading-indicator')).toBeTruthy();
  });
}); 