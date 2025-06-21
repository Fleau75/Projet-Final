import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Button, TextInput, Surface, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTextSize } from '../theme/TextSizeContext';
import { useAuth } from '../theme/AuthContext';

export default function LoginScreen({ navigation }) {
  const theme = useTheme();
  const { textSizes } = useTextSize();
  const { login, register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      console.log('🔍 Tentative de connexion avec:', { email, password });
      
      // Connexion avec le contexte d'authentification
      await login(email, password);
      console.log('✅ Connexion réussie !');
      // La navigation se fait automatiquement via le contexte
    } catch (err) {
      console.error('❌ Erreur lors de la connexion:', err);
      setError(err.message || 'Erreur de connexion. Veuillez réessayer.');
      setIsLoading(false);
    }
  };

  const handleContinueWithoutAccount = async () => {
    setIsLoading(true);
    try {
      // Créer un utilisateur temporaire pour le mode "sans compte"
      await register('visiteur@accessplus.com', '123456', {
        firstName: 'Visiteur',
        lastName: 'AccessPlus',
        email: 'visiteur@accessplus.com',
        phone: ''
      });
      // La navigation se fait automatiquement via le contexte
    } catch (err) {
      console.error('Erreur lors de la création du compte visiteur:', err);
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
          <Text style={[styles.title, { color: theme.colors.primary, fontSize: 42 }]}>
            AccessPlus
          </Text>
          <Text style={[styles.subtitle, { fontSize: textSizes.subtitle }]}>
            Trouvez facilement des lieux accessibles
          </Text>
        </View>

        <Surface style={[styles.surface, { backgroundColor: theme.colors.surface }]}>
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
            left={<TextInput.Icon icon="email" />}
            theme={{ fonts: { bodyLarge: { fontSize: textSizes.body } } }}
          />

          <TextInput
            label="Mot de passe"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            secureTextEntry
            style={styles.input}
            left={<TextInput.Icon icon="lock" />}
            theme={{ fonts: { bodyLarge: { fontSize: textSizes.body } } }}
          />

          {error ? (
            <Text style={[styles.error, { color: theme.colors.error, fontSize: textSizes.body }]}>
              {error}
            </Text>
          ) : null}

          <Button
            mode="contained"
            onPress={handleLogin}
            loading={isLoading}
            style={styles.button}
            labelStyle={{ fontSize: textSizes.body }}
          >
            Se connecter
          </Button>

          <Button
            mode="outlined"
            onPress={handleContinueWithoutAccount}
            loading={isLoading}
            style={styles.button}
            labelStyle={{ fontSize: textSizes.body }}
          >
            Continuer sans compte
          </Button>

          <View style={styles.registerContainer}>
            <Text style={{ fontSize: textSizes.body }}>
              Vous n'avez pas de compte ?
            </Text>
            <Button
              mode="text"
              onPress={() => navigation.navigate('Register')}
              style={styles.registerButton}
              labelStyle={{ fontSize: textSizes.body }}
            >
              S'inscrire
            </Button>
          </View>
        </Surface>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
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
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.7,
  },
  surface: {
    padding: 20,
    borderRadius: 12,
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
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
    marginBottom: 8,
  },
  registerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  registerButton: {
    marginLeft: 4,
  },
  error: {
    textAlign: 'center',
    marginBottom: 16,
  },
});
