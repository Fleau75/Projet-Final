import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';

const LoadingOverlay = () => {
  return (
    <View style={styles.container}>
      <BlurView intensity={50} style={styles.blurContainer}>
        <ActivityIndicator size="large" color="#007AFF" testID="loading-indicator" />
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  blurContainer: {
    padding: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
});

export default LoadingOverlay; 