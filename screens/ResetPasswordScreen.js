import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Text, Button, TextInput, Surface, useTheme, HelperText } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTextSize } from '../theme/TextSizeContext';
import { AuthService } from '../services/authService';

export default function ResetPasswordScreen({ navigation, route }) {
  const theme = useTheme();
  const { textSizes } = useTextSize();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Récupérer l'email depuis les paramètres de route
  const email = route?.params?.email || '';

  // Fonction pour mettre à jour les champs
  const updateField = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Nettoyer l'erreur du champ en cours d'édition
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Validation du formulaire
  const validateForm = () => {
    const newErrors = {};

    // Validation du mot de passe
    if (!formData.password) {
      newErrors.password = 'Le mot de passe est obligatoire';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }

    // Validation de la confirmation du mot de passe
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Veuillez confirmer votre mot de passe';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResetPassword = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      console.log('🔍 Tentative de réinitialisation du mot de passe pour:', email);
      
      // Vérifier si le token de réinitialisation est valide
      const isValidToken = await AuthService.verifyResetToken(email);
      
      if (!isValidToken) {
        Alert.alert(
          "Lien expiré",
          "Ce lien de réinitialisation a expiré. Veuillez demander un nouveau lien.",
          [
            {
              text: "OK",
              onPress: () => navigation.navigate('ForgotPassword')
            }
          ]
        );
        return;
      }

      // Mettre à jour le mot de passe
      await AuthService.updatePassword(email, formData.password);
      
      console.log('✅ Mot de passe mis à jour avec succès');
      
      Alert.alert(
        "Mot de passe mis à jour ! ✅",
        "Votre mot de passe a été modifié avec succès. Vous pouvez maintenant vous connecter.",
        [
          {
            text: "Se connecter",
            onPress: () => navigation.navigate('Login')
          }
        ]
      );
      
    } catch (err) {
      console.error('❌ Erreur lors de la réinitialisation:', err);
      Alert.alert(
        "Erreur",
        err.message || "Une erreur est survenue lors de la réinitialisation. Veuillez réessayer.",
        [{ text: "OK" }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.headerContainer}>
          <Text style={[styles.title, { color: theme.colors.primary, fontSize: textSizes.headline }]}>
            Nouveau mot de passe
          </Text>
          <Text style={[styles.subtitle, { fontSize: textSizes.body, color: theme.colors.onSurfaceVariant }]}>
            Définissez votre nouveau mot de passe
          </Text>
          {email && (
            <Text style={[styles.email, { fontSize: textSizes.caption, color: theme.colors.primary }]}>
              {email}
            </Text>
          )}
        </View>

        <Surface style={[styles.surface, { backgroundColor: theme.colors.surface }]}>
          {/* Nouveau mot de passe */}
          <TextInput
            label="Nouveau mot de passe *"
            value={formData.password}
            onChangeText={(value) => updateField('password', value)}
            mode="outlined"
            secureTextEntry={!showPassword}
            style={styles.input}
            left={<TextInput.Icon icon="lock" />}
            right={
              <TextInput.Icon 
                icon={showPassword ? "eye-off" : "eye"} 
                onPress={() => setShowPassword(!showPassword)}
              />
            }
            error={!!errors.password}
          />
          {errors.password && (
            <HelperText type="error" style={{ fontSize: textSizes.caption }}>
              {errors.password}
            </HelperText>
          )}

          {/* Confirmation du nouveau mot de passe */}
          <TextInput
            label="Confirmer le nouveau mot de passe *"
            value={formData.confirmPassword}
            onChangeText={(value) => updateField('confirmPassword', value)}
            mode="outlined"
            secureTextEntry={!showConfirmPassword}
            style={styles.input}
            left={<TextInput.Icon icon="lock-check" />}
            right={
              <TextInput.Icon 
                icon={showConfirmPassword ? "eye-off" : "eye"} 
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              />
            }
            error={!!errors.confirmPassword}
          />
          {errors.confirmPassword && (
            <HelperText type="error" style={{ fontSize: textSizes.caption }}>
              {errors.confirmPassword}
            </HelperText>
          )}

          {/* Bouton de réinitialisation */}
          <Button
            mode="contained"
            onPress={handleResetPassword}
            loading={isLoading}
            disabled={isLoading}
            style={styles.button}
            labelStyle={{ fontSize: textSizes.body }}
            icon="lock-reset"
          >
            Réinitialiser le mot de passe
          </Button>

          {/* Bouton retour */}
          <Button
            mode="outlined"
            onPress={() => navigation.navigate('Login')}
            style={styles.button}
            labelStyle={{ fontSize: textSizes.body }}
            icon="arrow-left"
          >
            Retour à la connexion
          </Button>
        </Surface>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.8,
    marginHorizontal: 20,
    lineHeight: 22,
  },
  email: {
    marginTop: 8,
    fontWeight: '500',
  },
  surface: {
    padding: 24,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  input: {
    marginBottom: 8,
  },
  button: {
    marginTop: 8,
    marginBottom: 8,
  },
}); 