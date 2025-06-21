import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Text, Button, TextInput, Surface, useTheme, HelperText } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTextSize } from '../theme/TextSizeContext';
import { AuthService } from '../services/authService';

export default function ForgotPasswordScreen({ navigation }) {
  const theme = useTheme();
  const { textSizes } = useTextSize();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Validation de l'email
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleResetPassword = async () => {
    // Validation
    if (!email.trim()) {
      setError('Veuillez entrer votre adresse email');
      return;
    }

    if (!validateEmail(email)) {
      setError('Veuillez entrer une adresse email valide');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess(false);

    try {
      console.log('🔍 Tentative de réinitialisation pour:', email);
      
      // Vérifier si l'utilisateur existe
      const userExists = await AuthService.checkUserExists(email);
      
      if (!userExists) {
        setError('Aucun compte trouvé avec cette adresse email');
        setIsLoading(false);
        return;
      }

      // Simuler l'envoi d'email de réinitialisation
      await AuthService.sendPasswordResetEmail(email);
      
      console.log('✅ Email de réinitialisation envoyé');
      setSuccess(true);
      
      Alert.alert(
        "Email envoyé ! 📧",
        "Si un compte existe avec cette adresse email, vous recevrez un lien de réinitialisation.",
        [
          {
            text: "Retour à la connexion",
            onPress: () => navigation.navigate('Login')
          }
        ]
      );
      
    } catch (err) {
      console.error('❌ Erreur lors de la réinitialisation:', err);
      setError(err.message || 'Erreur lors de l\'envoi de l\'email. Veuillez réessayer.');
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
            Mot de passe oublié
          </Text>
          <Text style={[styles.subtitle, { fontSize: textSizes.body, color: theme.colors.onSurfaceVariant }]}>
            Entrez votre adresse email pour recevoir un lien de réinitialisation
          </Text>
        </View>

        <Surface style={[styles.surface, { backgroundColor: theme.colors.surface }]}>
          <TextInput
            label="Adresse email"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (error) setError('');
            }}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
            left={<TextInput.Icon icon="email" />}
            error={!!error}
            theme={{ fonts: { bodyLarge: { fontSize: textSizes.body } } }}
          />

          {error ? (
            <HelperText type="error" style={{ fontSize: textSizes.caption }}>
              {error}
            </HelperText>
          ) : null}

          {success ? (
            <HelperText type="info" style={{ fontSize: textSizes.caption, color: theme.colors.primary }}>
              Email envoyé avec succès !
            </HelperText>
          ) : null}

          <Button
            mode="contained"
            onPress={handleResetPassword}
            loading={isLoading}
            disabled={isLoading}
            style={styles.button}
            labelStyle={{ fontSize: textSizes.body }}
            icon="email-send"
          >
            Envoyer le lien de réinitialisation
          </Button>

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