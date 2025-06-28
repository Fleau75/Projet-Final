import React from 'react';
import { render } from '@testing-library/react-native';
import VerifiedBadge, { UserNameWithBadge, VerificationStats } from '../../components/VerifiedBadge';

jest.mock('@expo/vector-icons', () => ({
  MaterialCommunityIcons: (props) => <mock-icon {...props} />,
}));

jest.mock('react-native-paper', () => {
  const real = jest.requireActual('react-native-paper');
  return {
    ...real,
    useTheme: () => ({ colors: { primary: '#007AFF', surface: '#fff', onSurface: '#000', success: 'green', disabled: 'gray' } }),
  };
});

describe('VerifiedBadge', () => {
  it('ne doit rien afficher si non vérifié', () => {
    const { toJSON } = render(<VerifiedBadge isVerified={false} />);
    expect(toJSON()).toBeNull();
  });

  it('affiche l\'icône si vérifié', () => {
    const { getByLabelText } = render(<VerifiedBadge isVerified={true} />);
    expect(getByLabelText(/Utilisateur vérifié/)).toBeTruthy();
  });

  it('affiche la tooltip si showTooltip=true', () => {
    const { getByText } = render(<VerifiedBadge isVerified={true} showTooltip={true} tooltipText="Coucou" />);
    expect(getByText('Coucou')).toBeTruthy();
  });
});

describe('UserNameWithBadge', () => {
  it('affiche le nom et le badge si vérifié', () => {
    const { getByText, getByLabelText } = render(<UserNameWithBadge userName="Alice" isVerified={true} />);
    expect(getByText('Alice')).toBeTruthy();
    expect(getByLabelText(/utilisateur vérifié/)).toBeTruthy();
  });

  it('affiche seulement le nom si non vérifié', () => {
    const { getByText, queryByLabelText } = render(<UserNameWithBadge userName="Bob" isVerified={false} />);
    expect(getByText('Bob')).toBeTruthy();
    expect(queryByLabelText(/utilisateur vérifié/)).toBeNull();
  });
});

describe('VerificationStats', () => {
  it('affiche juste le badge si showDetails=false', () => {
    const { getByLabelText } = render(<VerificationStats verificationData={{ isVerified: true }} showDetails={false} />);
    expect(getByLabelText(/Utilisateur vérifié/)).toBeTruthy();
  });

  it('affiche les détails si showDetails=true', () => {
    const { getByText } = render(
      <VerificationStats verificationData={{ isVerified: true, criteria: { reviewsAdded: 5, requiredReviews: 3 } }} showDetails={true} />
    );
    expect(getByText('✅ Vérifié')).toBeTruthy();
    expect(getByText('5 / 3 avis ajoutés')).toBeTruthy();
  });

  it('affiche "En cours de vérification" si non vérifié', () => {
    const { getByText } = render(
      <VerificationStats verificationData={{ isVerified: false, criteria: { reviewsAdded: 1, requiredReviews: 3 } }} showDetails={true} />
    );
    expect(getByText('⏳ En cours de vérification')).toBeTruthy();
    expect(getByText('1 / 3 avis ajoutés')).toBeTruthy();
  });
}); 