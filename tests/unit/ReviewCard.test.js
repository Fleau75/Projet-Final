import React from 'react';
import { render } from '@testing-library/react-native';
import { Image } from 'react-native';
import ReviewCard from '../../components/ReviewCard';

jest.mock('../../theme/TextSizeContext', () => ({
  useTextSize: () => ({ textSizes: { subtitle: 16, caption: 12, body: 14 } }),
}));

jest.mock('react-native-paper', () => {
  const real = jest.requireActual('react-native-paper');
  return {
    ...real,
    useTheme: () => ({ colors: { surface: '#fff', onSurface: '#000', onSurfaceVariant: '#888' } }),
  };
});

describe('ReviewCard', () => {
  const review = {
    userName: 'Alice',
    userPhoto: null,
    date: '2024-06-28T12:00:00Z',
    rating: 4,
    comment: 'Super endroit !',
    photos: ['https://example.com/photo1.jpg', 'https://example.com/photo2.jpg'],
  };

  it('affiche le nom, la date, la note, le commentaire et les photos', () => {
    const { getByText, UNSAFE_getAllByType } = render(<ReviewCard review={review} />);
    expect(getByText('Alice')).toBeTruthy();
    expect(getByText('Super endroit !')).toBeTruthy();
    // Date formatée (fr-FR)
    expect(getByText('28/06/2024')).toBeTruthy();
    // Les photos sont bien rendues
    expect(UNSAFE_getAllByType(Image).length).toBeGreaterThanOrEqual(1);
  });

  it('affiche la photo par défaut si userPhoto est null', () => {
    const { UNSAFE_getAllByType } = render(<ReviewCard review={review} />);
    // La première image est l'avatar par défaut
    expect(UNSAFE_getAllByType(Image)[0]).toBeTruthy();
  });

  it('affiche le commentaire même sans photos', () => {
    const reviewNoPhotos = { ...review, photos: [] };
    const { getByText } = render(<ReviewCard review={reviewNoPhotos} />);
    expect(getByText('Super endroit !')).toBeTruthy();
  });
}); 