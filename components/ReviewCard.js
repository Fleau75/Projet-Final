import React from 'react';
import { View, StyleSheet, Image, ScrollView } from 'react-native';
import { Surface, Text, useTheme } from 'react-native-paper';
import CustomRating from './CustomRating';
import { useTextSize } from '../theme/TextSizeContext';

export default function ReviewCard({ review }) {
  const { textSizes } = useTextSize();
  const theme = useTheme();
  
  return (
    <Surface style={[styles.reviewCard, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewUser}>
          <Image
            source={review.userPhoto ? { uri: review.userPhoto } : require('../assets/default-avatar.png')}
            style={styles.userPhoto}
          />
          <Text style={[styles.userName, { fontSize: textSizes.subtitle, color: theme.colors.onSurface }]}>
            {review.userName}
          </Text>
        </View>
        <Text style={[styles.reviewDate, { fontSize: textSizes.caption, color: theme.colors.onSurfaceVariant }]}>
          {new Date(review.date).toLocaleDateString()}
        </Text>
      </View>

      <CustomRating
        rating={review.rating}
        readonly={true}
        size={20}
        style={styles.reviewRating}
      />

      <Text style={[styles.reviewComment, { fontSize: textSizes.body, color: theme.colors.onSurface }]}>
        {review.comment}
      </Text>

      {review.photos && review.photos.length > 0 && (
        <ScrollView horizontal style={styles.photoScroll}>
          {review.photos.map((photo, index) => (
            <Image key={index} source={{ uri: photo }} style={styles.reviewPhoto} />
          ))}
        </ScrollView>
      )}
    </Surface>
  );
}

const styles = StyleSheet.create({
  reviewCard: {
    padding: 16,
    borderRadius: 8,
    elevation: 2,
    marginBottom: 16,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewUser: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userPhoto: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  userName: {
    fontWeight: '500',
  },
  reviewDate: {
    // opacity gérée par theme.colors.onSurfaceVariant
  },
  reviewRating: {
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  reviewComment: {
    marginBottom: 12,
  },
  photoScroll: {
    marginTop: 8,
  },
  reviewPhoto: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginRight: 8,
  },
}); 