import React from 'react';
import { View, StyleSheet, Image, ScrollView } from 'react-native';
import { Surface, Text } from 'react-native-paper';
import { Rating } from 'react-native-ratings';
import { useTextSize } from '../theme/TextSizeContext';

export default function ReviewCard({ review }) {
  const { textSizes } = useTextSize();
  
  return (
    <Surface style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewUser}>
          <Image
            source={review.userPhoto ? { uri: review.userPhoto } : require('../assets/default-avatar.png')}
            style={styles.userPhoto}
          />
          <Text style={[styles.userName, { fontSize: textSizes.subtitle }]}>
            {review.userName}
          </Text>
        </View>
        <Text style={[styles.reviewDate, { fontSize: textSizes.caption }]}>
          {new Date(review.date).toLocaleDateString()}
        </Text>
      </View>

      <Rating
        readonly
        startingValue={review.rating}
        imageSize={20}
        style={styles.reviewRating}
      />

      <Text style={[styles.reviewComment, { fontSize: textSizes.body }]}>
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
    opacity: 0.6,
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