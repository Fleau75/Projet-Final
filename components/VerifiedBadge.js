/**
 * Composant VerifiedBadge
 * Affiche un badge de vérification pour les utilisateurs qui ont créé un compte
 * et ajouté au moins 3 lieux à l'application
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

/**
 * Composant pour afficher le badge de vérification
 * @param {Object} props - Les propriétés du composant
 * @param {boolean} props.isVerified - Si l'utilisateur est vérifié
 * @param {number} props.size - Taille du badge (défaut: 16)
 * @param {boolean} props.showTooltip - Si on doit afficher une info-bulle
 * @param {string} props.tooltipText - Texte de l'info-bulle personnalisé
 */
export default function VerifiedBadge({ 
  isVerified, 
  size = 16, 
  showTooltip = false,
  tooltipText = null 
}) {
  const theme = useTheme();

  if (!isVerified) {
    return null;
  }

  const defaultTooltipText = "Utilisateur vérifié - Compte créé et au moins 3 avis ajoutés";

  return (
    <View 
      style={styles.container}
      accessible={true}
      accessibilityLabel={tooltipText || defaultTooltipText}
      accessibilityRole="image"
    >
      <MaterialCommunityIcons
        name="check-decagram"
        size={size}
        color={theme.colors.primary}
        style={styles.icon}
      />
      
      {showTooltip && (
        <View style={[styles.tooltip, { backgroundColor: theme.colors.surface }]}>
          <Text 
            variant="bodySmall" 
            style={[styles.tooltipText, { color: theme.colors.onSurface }]}
          >
            {tooltipText || defaultTooltipText}
          </Text>
        </View>
      )}
    </View>
  );
}

/**
 * Composant pour afficher le badge avec le nom d'utilisateur
 * @param {Object} props - Les propriétés du composant
 * @param {string} props.userName - Nom de l'utilisateur
 * @param {boolean} props.isVerified - Si l'utilisateur est vérifié
 * @param {string} props.variant - Variante du texte (title, body, etc.)
 * @param {Object} props.style - Styles supplémentaires
 */
export function UserNameWithBadge({ 
  userName, 
  isVerified, 
  variant = "titleMedium",
  style 
}) {
  const theme = useTheme();

  return (
    <View style={[styles.userNameContainer, style]}>
      <Text 
        variant={variant} 
        style={[styles.userName, { color: theme.colors.onSurface }]}
        accessible={true}
        accessibilityLabel={`${userName}${isVerified ? ', utilisateur vérifié' : ''}`}
      >
        {userName}
      </Text>
      <VerifiedBadge isVerified={isVerified} size={16} />
    </View>
  );
}

/**
 * Composant pour afficher les statistiques de vérification
 * @param {Object} props - Les propriétés du composant
 * @param {Object} props.verificationData - Données de vérification
 * @param {boolean} props.showDetails - Si on doit afficher les détails
 */
export function VerificationStats({ verificationData, showDetails = false }) {
  const theme = useTheme();
  const { isVerified, criteria } = verificationData;

  if (!showDetails) {
    return <VerifiedBadge isVerified={isVerified} />;
  }

  return (
    <View style={styles.statsContainer}>
      <VerifiedBadge isVerified={isVerified} size={20} />
      
      <View style={styles.statsText}>
        <Text 
          variant="bodySmall" 
          style={[styles.statusText, { 
            color: isVerified ? theme.colors.success : theme.colors.disabled 
          }]}
        >
          {isVerified ? '✅ Vérifié' : '⏳ En cours de vérification'}
        </Text>
        
        <Text variant="bodySmall" style={styles.criteriaText}>
          {criteria?.reviewsAdded || 0} / {criteria?.requiredReviews || 3} avis ajoutés
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  tooltip: {
    position: 'absolute',
    bottom: -30,
    left: -50,
    right: -50,
    padding: 8,
    borderRadius: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    zIndex: 1000,
  },
  tooltipText: {
    textAlign: 'center',
    fontSize: 12,
  },
  userNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  userName: {
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statsText: {
    flex: 1,
  },
  statusText: {
    fontWeight: '600',
    marginBottom: 2,
  },
  criteriaText: {
    opacity: 0.7,
  },
}); 