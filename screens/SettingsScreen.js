/**
 * Écran de réglages/paramètres
 * Permet à l'utilisateur de configurer ses préférences d'accessibilité et l'application
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Linking, Platform, Alert } from 'react-native';
import { 
  Card, 
  Title, 
  List, 
  Switch, 
  Divider, 
  Button,
  Text,
  useTheme,
} from 'react-native-paper';
import Slider from '@react-native-community/slider';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '../theme/ThemeContext';
import { useTextSize } from '../theme/TextSizeContext';
import { useScreenReader } from '../theme/ScreenReaderContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Constantes pour les valeurs par défaut et les limites
const SEARCH_RADIUS_DEFAULT = 1500;
const SEARCH_RADIUS_MIN = 500;
const SEARCH_RADIUS_MAX = 5000;
const SEARCH_RADIUS_STEP = 100;

export default function SettingsScreen({ navigation }) {
  const theme = useTheme();
  const { isDarkMode, toggleTheme, resetToDefault: resetTheme } = useAppTheme();
  const { isLargeText, toggleTextSize, resetToDefault: resetTextSize, textSizes } = useTextSize();
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
  const [searchRadius, setSearchRadius] = useState(SEARCH_RADIUS_DEFAULT);
  const [mapStyle, setMapStyle] = useState('standard');

  // Charger tous les paramètres au démarrage
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Charger les préférences d'accessibilité
        const savedAccessibilityPrefs = await AsyncStorage.getItem('accessibilityPrefs');
        if (savedAccessibilityPrefs !== null) {
          setAccessibilityPrefs(JSON.parse(savedAccessibilityPrefs));
        }

        // Charger les notifications
        const savedNotifications = await AsyncStorage.getItem('notifications');
        if (savedNotifications !== null) {
          setNotifications(JSON.parse(savedNotifications));
        }

        // Charger le rayon de recherche
        const savedRadius = await AsyncStorage.getItem('searchRadius');
        if (savedRadius !== null) {
          setSearchRadius(parseInt(savedRadius));
        }

        // Charger le style de carte
        const savedMapStyle = await AsyncStorage.getItem('mapStyle');
        if (savedMapStyle !== null) {
          setMapStyle(savedMapStyle);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des paramètres:', error);
      }
    };

    loadSettings();
  }, []);

  // Optimisation des callbacks avec useCallback
  const handleSearchRadiusChange = useCallback(async (value) => {
    try {
      const roundedValue = Math.round(value);
      setSearchRadius(roundedValue);
      await AsyncStorage.setItem('searchRadius', roundedValue.toString());
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du rayon de recherche:', error);
      Alert.alert(
        "Erreur",
        "Impossible de sauvegarder le rayon de recherche",
        [{ text: "OK" }]
      );
    }
  }, []);

  const toggleAccessibilityPref = (key) => {
    setAccessibilityPrefs(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const toggleNotification = useCallback(async (key) => {
    try {
      const newNotifications = {
        ...notifications,
        [key]: !notifications[key]
      };
      setNotifications(newNotifications);
      await AsyncStorage.setItem('notifications', JSON.stringify(newNotifications));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des notifications:', error);
      Alert.alert(
        "Erreur",
        "Impossible de sauvegarder les préférences de notification",
        [{ text: "OK" }]
      );
    }
  }, [notifications]);

  const handleSaveSettings = async () => {
    try {
      // Sauvegarder les préférences d'accessibilité
      await AsyncStorage.setItem('accessibilityPrefs', JSON.stringify(accessibilityPrefs));
      
      // Sauvegarder les notifications
      await AsyncStorage.setItem('notifications', JSON.stringify(notifications));
      
      // Sauvegarder le rayon de recherche
      await AsyncStorage.setItem('searchRadius', searchRadius.toString());
      
      // Sauvegarder le style de carte
      await AsyncStorage.setItem('mapStyle', mapStyle);

      Alert.alert(
        "Succès",
        "Vos paramètres ont été sauvegardés avec succès",
        [{ text: "OK" }]
      );
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des paramètres:', error);
      Alert.alert(
        "Erreur",
        "Une erreur est survenue lors de la sauvegarde des paramètres",
        [{ text: "OK" }]
      );
    }
  };

  const handleResetSettings = useCallback(async () => {
    Alert.alert(
      "Réinitialiser tous les paramètres",
      "Êtes-vous sûr de vouloir réinitialiser TOUS les paramètres de l'application ? Cette action ne peut pas être annulée.",
      [
        {
          text: "Annuler",
          style: "cancel"
        },
        {
          text: "Réinitialiser tout",
          style: "destructive",
          onPress: async () => {
            try {
              // Valeurs par défaut pour les paramètres locaux
              const defaultAccessibilityPrefs = {
                requireRamp: false,
                requireElevator: false,
                requireAccessibleParking: false,
                requireAccessibleToilets: false,
              };
              
              const defaultNotifications = {
                newPlaces: true,
                reviews: true,
                updates: false,
              };
              
              const defaultSearchRadius = SEARCH_RADIUS_DEFAULT;
              const defaultMapStyle = 'standard';

              // Mettre à jour les états locaux
              setAccessibilityPrefs(defaultAccessibilityPrefs);
              setNotifications(defaultNotifications);
              setSearchRadius(defaultSearchRadius);
              setMapStyle(defaultMapStyle);

              // Réinitialiser tous les contextes
              await Promise.all([
                resetTheme(), // Réinitialiser le thème (mode clair)
                resetTextSize(), // Réinitialiser la taille de texte (normale)
                // Sauvegarder les paramètres locaux
                AsyncStorage.setItem('accessibilityPrefs', JSON.stringify(defaultAccessibilityPrefs)),
                AsyncStorage.setItem('notifications', JSON.stringify(defaultNotifications)),
                AsyncStorage.setItem('searchRadius', defaultSearchRadius.toString()),
                AsyncStorage.setItem('mapStyle', defaultMapStyle),
              ]);

              Alert.alert(
                "Succès",
                "Tous les paramètres ont été réinitialisés aux valeurs par défaut",
                [{ text: "OK" }]
              );
            } catch (error) {
              console.error('Erreur lors de la réinitialisation complète:', error);
              Alert.alert(
                "Erreur",
                "Une erreur est survenue lors de la réinitialisation des paramètres",
                [{ text: "OK" }]
              );
            }
          }
        }
      ]
    );
  }, [resetTheme, resetTextSize]);

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
            <Title style={[styles.sectionTitle, { fontSize: textSizes.title }]}>
              🔍 Rayon de recherche
            </Title>
            
            <Text style={[styles.sectionDescription, { fontSize: textSizes.body }]}>
              Ajustez la distance de recherche pour trouver les lieux accessibles autour de vous
            </Text>

            <View style={styles.searchRadiusContainer}>
              <Text style={[styles.valueText, { fontSize: textSizes.subtitle }]}>
                {Math.round(searchRadius)} mètres
              </Text>
              
              <Slider
                style={styles.slider}
                value={searchRadius}
                onValueChange={handleSearchRadiusChange}
                minimumValue={SEARCH_RADIUS_MIN}
                maximumValue={SEARCH_RADIUS_MAX}
                step={SEARCH_RADIUS_STEP}
                minimumTrackTintColor={theme.colors.primary}
                maximumTrackTintColor={theme.colors.onSurfaceDisabled}
                thumbTintColor={theme.colors.primary}
                accessible={true}
                accessibilityLabel={`Rayon de recherche actuel : ${Math.round(searchRadius)} mètres`}
                accessibilityHint="Glissez pour modifier la distance de recherche"
              />

              <View style={styles.sliderLabels}>
                <Text style={[styles.rangeLabel, { color: theme.colors.onSurfaceVariant }]}>
                  {SEARCH_RADIUS_MIN}m
                </Text>
                <Text style={[styles.rangeLabel, { color: theme.colors.onSurfaceVariant }]}>
                  {SEARCH_RADIUS_MAX}m
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Notifications */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={[styles.sectionTitle, { fontSize: textSizes.title }]}>🔔 Notifications</Title>
            
            <Text style={[styles.sectionDescription, { fontSize: textSizes.body }]}>
              Gérez vos préférences de notifications pour rester informé
            </Text>
            
            <List.Item
              title="Nouveaux lieux"
              description="Être notifié des nouveaux lieux accessibles"
              titleStyle={{ fontSize: textSizes.subtitle }}
              descriptionStyle={{ fontSize: textSizes.caption }}
              left={props => <List.Icon {...props} icon="map-marker-plus" />}
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
              titleStyle={{ fontSize: textSizes.subtitle }}
              descriptionStyle={{ fontSize: textSizes.caption }}
              left={props => <List.Icon {...props} icon="star-plus" />}
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
              titleStyle={{ fontSize: textSizes.subtitle }}
              descriptionStyle={{ fontSize: textSizes.caption }}
              left={props => <List.Icon {...props} icon="update" />}
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
            mode="contained" 
            onPress={handleResetSettings}
            style={[styles.resetButton, { backgroundColor: '#ff4444' }]}
            labelStyle={{ fontSize: textSizes.body, color: 'white' }}
            icon="refresh"
            buttonColor="#ff4444"
            textColor="white"
          >
            Réinitialiser TOUS les paramètres
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
  searchRadiusContainer: {
    marginTop: 16,
    paddingHorizontal: 8,
  },
  valueText: {
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 8,
  },
  slider: {
    height: 40,
    width: '100%',
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  rangeLabel: {
    fontSize: 12,
  },
}); 