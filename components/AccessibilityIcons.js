import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export const AccessibilityIcon = ({ type, size = 24, color = '#4169E1' }) => {
  const getIconName = () => {
    switch (type) {
      case 'ramp':
        return 'wheelchair-accessibility';
      case 'toilet':
        return 'toilet';
      case 'elevator':
        return 'elevator';
      case 'parking':
        return 'parking';
      case 'restaurant':
        return 'silverware-fork-knife';
      case 'pharmacy':
        return 'pharmacy';
      case 'park':
        return 'tree';
      case 'cinema':
        return 'movie';
      case 'wide-path':
        return 'gate';
      case 'bench':
        return 'seat';
      default:
        return 'help-circle';
    }
  };

  return (
    <MaterialCommunityIcons
      name={getIconName()}
      size={size}
      color={color}
    />
  );
};

export const AccessibilityFeatureRow = ({ feature, value }) => {
  return (
    <View style={styles.featureRow}>
      <AccessibilityIcon
        type={feature}
        color={value ? '#4CAF50' : '#F44336'}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
}); 