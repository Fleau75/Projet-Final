import React, { useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { TextInput, Button, Checkbox, Title, HelperText } from 'react-native-paper';

export default function ReviewFormScreen({ route, navigation }) {
  const { placeId } = route.params;
  const [review, setReview] = useState({
    comment: '',
    hasRamp: false,
    hasAdaptedToilets: false,
    hasWideCorridors: false,
    hasElevator: false,
    rating: '',
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!review.comment) {
      newErrors.comment = 'Veuillez ajouter un commentaire';
    }
    if (!review.rating || isNaN(review.rating) || review.rating < 1 || review.rating > 5) {
      newErrors.rating = 'Veuillez donner une note entre 1 et 5';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      // TODO: Envoyer les données à Firebase
      console.log('Avis soumis:', { placeId, ...review });
      navigation.goBack();
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Title style={styles.title}>Ajouter un avis</Title>

      <TextInput
        label="Votre commentaire"
        value={review.comment}
        onChangeText={(text) => setReview({ ...review, comment: text })}
        multiline
        numberOfLines={4}
        style={styles.input}
        error={!!errors.comment}
      />
      <HelperText type="error" visible={!!errors.comment}>
        {errors.comment}
      </HelperText>

      <TextInput
        label="Note (1-5)"
        value={review.rating}
        onChangeText={(text) => setReview({ ...review, rating: text })}
        keyboardType="numeric"
        style={styles.input}
        error={!!errors.rating}
      />
      <HelperText type="error" visible={!!errors.rating}>
        {errors.rating}
      </HelperText>

      <View style={styles.checkboxContainer}>
        <Checkbox.Item
          label="Rampe d'accès"
          status={review.hasRamp ? 'checked' : 'unchecked'}
          onPress={() => setReview({ ...review, hasRamp: !review.hasRamp })}
        />

        <Checkbox.Item
          label="Toilettes adaptées"
          status={review.hasAdaptedToilets ? 'checked' : 'unchecked'}
          onPress={() => setReview({ ...review, hasAdaptedToilets: !review.hasAdaptedToilets })}
        />

        <Checkbox.Item
          label="Couloirs larges"
          status={review.hasWideCorridors ? 'checked' : 'unchecked'}
          onPress={() => setReview({ ...review, hasWideCorridors: !review.hasWideCorridors })}
        />

        <Checkbox.Item
          label="Ascenseur"
          status={review.hasElevator ? 'checked' : 'unchecked'}
          onPress={() => setReview({ ...review, hasElevator: !review.hasElevator })}
        />
      </View>

      <Button
        mode="contained"
        onPress={handleSubmit}
        style={styles.button}
      >
        Soumettre l'avis
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    marginBottom: 8,
  },
  checkboxContainer: {
    marginVertical: 16,
  },
  button: {
    marginTop: 16,
    marginBottom: 32,
    backgroundColor: '#4169E1',
  },
});
