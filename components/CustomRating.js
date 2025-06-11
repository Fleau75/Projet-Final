import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';

/**
 * Composant d'étoiles personnalisé réutilisable
 * @param {Object} props
 * @param {number} props.rating - Note actuelle (0-5)
 * @param {boolean} props.readonly - Si true, les étoiles ne sont pas cliquables
 * @param {function} props.onRatingChange - Callback appelé quand la note change (mode éditable)
 * @param {number} props.size - Taille des étoiles (défaut: 20)
 * @param {string} props.activeColor - Couleur des étoiles actives (défaut: #FFD700)
 * @param {string} props.inactiveColor - Couleur des étoiles inactives (défaut: #E0E0E0)
 */
export default function CustomRating({
  rating = 0,
  readonly = false,
  onRatingChange,
  size = 20,
  activeColor = '#FFD700',
  inactiveColor,
  style
}) {
  const theme = useTheme();
  
  // Utiliser les couleurs du thème si inactiveColor n'est pas spécifiée
  const finalInactiveColor = inactiveColor || (theme.dark ? '#666666' : '#E0E0E0');
  const handleStarPress = (star) => {
    if (!readonly && onRatingChange) {
      onRatingChange(star);
    }
  };

  return (
    <View style={[styles.container, style]}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity 
          key={star}
          onPress={() => handleStarPress(star)}
          style={[styles.starButton, { width: size + 10, height: size + 10 }]}
          activeOpacity={readonly ? 1 : 0.7}
          disabled={readonly}
          accessible={true}
          accessibilityRole={readonly ? "text" : "button"}
          accessibilityLabel={readonly ? 
            `${star} étoile${star > 1 ? 's' : ''} sur 5` : 
            `Donner ${star} étoile${star > 1 ? 's' : ''} sur 5`
          }
        >
          <Text style={[
            styles.starText, 
            { 
              color: star <= rating ? activeColor : finalInactiveColor,
              fontSize: size
            }
          ]}>
            ★
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starButton: {
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 2,
  },
  starText: {
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
}); 