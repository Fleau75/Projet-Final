/**
 * Écran de réglages/paramètres
 * Permet à l'utilisateur de configurer ses préférences d'accessibilité et l'application
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Linking, Platform, Alert } from 'react-native';
import { 
  Card, 
  Title, 
  List, 
  Switch, 
  Divider, 
  Button,
  Text,
  useTheme 
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '../theme/ThemeContext';
import { useTextSize } from '../theme/TextSizeContext';
import { useScreenReader } from '../theme/ScreenReaderContext';

export default function SettingsScreen({ navigation }) {
  const theme = useTheme();
  const { isDarkMode, toggleTheme } = useAppTheme();
  const { isLargeText, toggleTextSize, textSizes } = useTextSize();
  const { isScreenReaderEnabled } = useScreenReader();
  
  // États pour les préférences d'accessibilité
  const [accessibilityPrefs, setAccessibilityPrefs] = useState({
    requireRamp: false,
    requireElevator: false,
    requireAccessibleParking: false,
    requireAccessibleToilets: false,
  });

  // États pour les notifications
  const [notifications, setNotifications] = useState({
    newPlaces: true,
    reviews: true,
    updates: false,
  });

  // États pour les préférences générales
  const [searchRadius, setSearchRadius] = useState(1500);
  const [mapStyle, setMapStyle] = useState('standard');

  const toggleAccessibilityPref = (key) => {
    setAccessibilityPrefs(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const toggleNotification = (key) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSaveSettings = () => {
    // Sauvegarder les paramètres
    // TODO: Sauvegarder dans AsyncStorage ou une base de données
  };

  const handleResetSettings = () => {
    // Réinitialiser tous les paramètres
    setAccessibilityPrefs({
      requireRamp: false,
      requireElevator: false,
      requireAccessibleParking: false,
      requireAccessibleToilets: false,
    });
    setNotifications({
      newPlaces: true,
      reviews: true,
      updates: false,
    });
    setSearchRadius(1500);
    setMapStyle('standard');
  };

  const openAccessibilitySettings = async () => {
    try {
      if (Platform.OS === 'ios') {
        // Sur iOS 13+, on ne peut plus ouvrir directement les paramètres d'accessibilité
        await Linking.openSettings();
        // On affiche un message d'aide
        Alert.alert(
          "Paramètres d'accessibilité",
          "Pour activer la lecture d'écran :\n1. Dans Réglages\n2. Allez dans Accessibilité\n3. Sélectionnez VoiceOver",
          [{ text: "OK", style: "default" }]
        );
      } else {
        await Linking.openSettings();
      }
    } catch (error) {
      console.error('Erreur lors de l\'ouverture des paramètres:', error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView}>
        
        {/* Préférences d'accessibilité */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={[styles.sectionTitle, { fontSize: textSizes.title }]}>♿ Préférences d'accessibilité</Title>
            <Text style={[styles.sectionDescription, { fontSize: textSizes.body }]}>
              Filtrez automatiquement les lieux selon vos besoins d'accessibilité
            </Text>
            
            <List.Item
              title="Rampe d'accès requise"
              description="Afficher uniquement les lieux avec rampe"
              titleStyle={{ fontSize: textSizes.subtitle }}
              descriptionStyle={{ fontSize: textSizes.caption }}
              right={() => (
                <Switch
                  value={accessibilityPrefs.requireRamp}
                  onValueChange={() => toggleAccessibilityPref('requireRamp')}
                />
              )}
            />
            
            <List.Item
              title="Ascenseur requis"
              description="Afficher uniquement les lieux avec ascenseur"
              titleStyle={{ fontSize: textSizes.subtitle }}
              descriptionStyle={{ fontSize: textSizes.caption }}
              right={() => (
                <Switch
                  value={accessibilityPrefs.requireElevator}
                  onValueChange={() => toggleAccessibilityPref('requireElevator')}
                />
              )}
            />
            
            <List.Item
              title="Parking accessible requis"
              description="Afficher uniquement les lieux avec parking PMR"
              titleStyle={{ fontSize: textSizes.subtitle }}
              descriptionStyle={{ fontSize: textSizes.caption }}
              right={() => (
                <Switch
                  value={accessibilityPrefs.requireAccessibleParking}
                  onValueChange={() => toggleAccessibilityPref('requireAccessibleParking')}
                />
              )}
            />
            
            <List.Item
              title="Toilettes accessibles requises"
              description="Afficher uniquement les lieux avec toilettes PMR"
              titleStyle={{ fontSize: textSizes.subtitle }}
              descriptionStyle={{ fontSize: textSizes.caption }}
              right={() => (
                <Switch
                  value={accessibilityPrefs.requireAccessibleToilets}
                  onValueChange={() => toggleAccessibilityPref('requireAccessibleToilets')}
                />
              )}
            />
          </Card.Content>
        </Card>

        {/* Préférences d'affichage */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={[styles.sectionTitle, { fontSize: textSizes.title }]}>🎨 Apparence</Title>
            
            <List.Item
              title="Mode sombre"
              description={isDarkMode ? "Interface sombre activée" : "Interface claire activée"}
              titleStyle={{ fontSize: textSizes.subtitle }}
              descriptionStyle={{ fontSize: textSizes.caption }}
              left={props => <List.Icon {...props} icon={isDarkMode ? "weather-night" : "weather-sunny"} />}
              right={() => (
                <Switch
                  value={isDarkMode}
                  onValueChange={toggleTheme}
                />
              )}
            />
            
            <Divider style={styles.divider} />
            
            <List.Item
              title="Texte agrandi"
              description={isLargeText ? "Grande taille de texte activée" : "Taille de texte normale"}
              titleStyle={{ fontSize: textSizes.subtitle }}
              descriptionStyle={{ fontSize: textSizes.caption }}
              left={props => <List.Icon {...props} icon={isLargeText ? "format-size" : "format-text"} />}
              right={() => (
                <Switch
                  value={isLargeText}
                  onValueChange={toggleTextSize}
                />
              )}
            />
          </Card.Content>
        </Card>

        {/* Lecture d'écran */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={[styles.sectionTitle, { fontSize: textSizes.title }]}>🔊 Lecture d'écran</Title>
            <Text style={[styles.sectionDescription, { fontSize: textSizes.body }]}>
              Utilisez VoiceOver (iOS) ou TalkBack (Android) pour la lecture d'écran
            </Text>
            
            <List.Item
              title="Lecture d'écran"
              description={isScreenReaderEnabled ? "Lecture d'écran activée" : "Lecture d'écran désactivée"}
              titleStyle={{ fontSize: textSizes.subtitle }}
              descriptionStyle={{ fontSize: textSizes.caption }}
              left={props => <List.Icon {...props} icon={isScreenReaderEnabled ? "text-to-speech" : "text-to-speech-off"} />}
              right={() => (
                <Switch
                  value={isScreenReaderEnabled}
                  disabled={true}  // Désactivé car géré par le système
                />
              )}
            />
            
            <Text style={[styles.hint, { fontSize: textSizes.caption, color: theme.colors.primary }]}>
              La lecture d'écran se configure dans les paramètres d'accessibilité de votre appareil
            </Text>

            <Button
              mode="outlined"
              onPress={openAccessibilitySettings}
              style={styles.settingsButton}
              labelStyle={{ fontSize: textSizes.body }}
              icon="cog"
            >
              Ouvrir les paramètres d'accessibilité
            </Button>
          </Card.Content>
        </Card>

        {/* Préférences de recherche */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>🔍 Recherche</Title>
            
            <Text style={styles.settingLabel}>
              Rayon de recherche: {Math.round(searchRadius)}m
            </Text>
            <Text style={styles.sectionDescription}>
              Le rayon de recherche est actuellement fixé à {Math.round(searchRadius)}m
            </Text>
          </Card.Content>
        </Card>

        {/* Notifications */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>🔔 Notifications</Title>
            
            <List.Item
              title="Nouveaux lieux"
              description="Être notifié des nouveaux lieux accessibles"
              right={() => (
                <Switch
                  value={notifications.newPlaces}
                  onValueChange={() => toggleNotification('newPlaces')}
                />
              )}
            />
            
            <List.Item
              title="Nouveaux avis"
              description="Être notifié des avis sur mes lieux favoris"
              right={() => (
                <Switch
                  value={notifications.reviews}
                  onValueChange={() => toggleNotification('reviews')}
                />
              )}
            />
            
            <List.Item
              title="Mises à jour"
              description="Être notifié des mises à jour de l'application"
              right={() => (
                <Switch
                  value={notifications.updates}
                  onValueChange={() => toggleNotification('updates')}
                />
              )}
            />
          </Card.Content>
        </Card>

        {/* Actions */}
        <View style={styles.actionsSection}>
          <Button 
            mode="contained" 
            onPress={handleSaveSettings}
            style={styles.saveButton}
          >
            Sauvegarder les paramètres
          </Button>
          
          <Button 
            mode="outlined" 
            onPress={handleResetSettings}
            style={styles.resetButton}
          >
            Réinitialiser
          </Button>
        </View>

        {/* Informations */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>ℹ️ Informations</Title>
            <List.Item
              title="À propos de l'application"
              description="Version 1.0.0"
              left={props => <List.Icon {...props} icon="information" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
            />
            <List.Item
              title="Aide et support"
              description="Besoin d'aide ?"
              left={props => <List.Icon {...props} icon="help-circle" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
            />
            <List.Item
              title="Signaler un problème"
              description="Nous aider à améliorer l'app"
              left={props => <List.Icon {...props} icon="bug" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
            />
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  card: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
    marginTop: 8,
  },
  divider: {
    marginVertical: 16,
  },
  actionsSection: {
    marginVertical: 24,
  },
  saveButton: {
    marginBottom: 12,
    paddingVertical: 8,
  },
  resetButton: {
    paddingVertical: 8,
  },
  speechRateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  rateButton: {
    minWidth: 80,
  },
  rateDisplay: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
  },
  testButton: {
    marginTop: 16,
    paddingVertical: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
  hint: {
    marginTop: 8,
    fontStyle: 'italic',
    paddingHorizontal: 16,
  },
  settingsButton: {
    marginTop: 16,
    marginHorizontal: 16,
  },
}); 