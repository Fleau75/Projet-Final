/**
 * Écran de réglages/paramètres
 * Permet à l'utilisateur de configurer ses préférences d'accessibilité et l'application
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
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

export default function SettingsScreen({ navigation }) {
  const theme = useTheme();
  const { isDarkMode, toggleTheme } = useAppTheme();
  const { isLargeText, toggleTextSize, textSizes } = useTextSize();
  
  // États pour les préférences d'accessibilité
  const [accessibilityPrefs, setAccessibilityPrefs] = useState({
    requireRamp: false,
    requireElevator: false,
    requireAccessibleParking: false,
    requireAccessibleToilets: false,
    screenReader: false,
    speechRate: 1.0,
    autoDescriptions: false,
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
      screenReader: false,
      speechRate: 1.0,
      autoDescriptions: false,
    });
    setNotifications({
      newPlaces: true,
      reviews: true,
      updates: false,
    });
    setSearchRadius(1500);
    setMapStyle('standard');
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

        {/* Lecture d'écran pour malvoyants */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>🔊 Lecture d'écran</Title>
            <Text style={styles.sectionDescription}>
              Fonctionnalités d'assistance vocale pour les malvoyants
            </Text>
            
            <List.Item
              title="Activer la lecture d'écran"
              description="Lecture automatique des éléments sélectionnés"
              right={() => (
                <Switch
                  value={accessibilityPrefs.screenReader}
                  onValueChange={() => toggleAccessibilityPref('screenReader')}
                />
              )}
            />
            
            <List.Item
              title="Descriptions automatiques"
              description="Décrit automatiquement les images et boutons"
              right={() => (
                <Switch
                  value={accessibilityPrefs.autoDescriptions}
                  onValueChange={() => toggleAccessibilityPref('autoDescriptions')}
                />
              )}
            />
            
            {accessibilityPrefs.screenReader && (
              <>
                <Divider style={styles.divider} />
                <Text style={styles.settingLabel}>
                  Vitesse de lecture: {accessibilityPrefs.speechRate.toFixed(1)}x
                </Text>
                <View style={styles.speechRateContainer}>
                  <Button 
                    mode="outlined" 
                    compact
                    onPress={() => {
                      const newRate = Math.max(0.5, accessibilityPrefs.speechRate - 0.1);
                      setAccessibilityPrefs(prev => ({...prev, speechRate: newRate}));
                    }}
                    style={styles.rateButton}
                  >
                    - Lent
                  </Button>
                  
                  <Text style={styles.rateDisplay}>
                    {accessibilityPrefs.speechRate === 0.5 ? 'Très lent' :
                     accessibilityPrefs.speechRate === 1.0 ? 'Normal' :
                     accessibilityPrefs.speechRate === 1.5 ? 'Rapide' : 
                     'Très rapide'}
                  </Text>
                  
                  <Button 
                    mode="outlined" 
                    compact
                    onPress={() => {
                      const newRate = Math.min(2.0, accessibilityPrefs.speechRate + 0.1);
                      setAccessibilityPrefs(prev => ({...prev, speechRate: newRate}));
                    }}
                    style={styles.rateButton}
                  >
                    + Rapide
                  </Button>
                </View>
                
                <Button 
                  mode="contained" 
                  onPress={() => {
                    // Test de la lecture d'écran
                    // TODO: Intégrer une vraie synthèse vocale
                    // Texte test: `Bonjour, bienvenue dans AccessPlus. Vitesse de lecture: ${accessibilityPrefs.speechRate}`
                  }}
                  style={styles.testButton}
                >
                  🎤 Tester la lecture
                </Button>
              </>
            )}
          </Card.Content>
        </Card>

        {/* Note d'information lecture d'écran */}
        {accessibilityPrefs.screenReader && (
          <Card style={[styles.card, { backgroundColor: '#E3F2FD' }]}>
            <Card.Content>
              <Title style={[styles.infoTitle, { color: '#1976D2' }]}>💡 Comment utiliser la lecture d'écran</Title>
              <Text style={[styles.infoText, { color: '#1976D2' }]}>
                • Touchez un élément pour l'entendre{'\n'}
                • Balayez vers la droite pour naviguer{'\n'}
                • Double-touchez pour activer{'\n'}
                • Utilisez les gestes de votre lecteur d'écran habituel
              </Text>
            </Card.Content>
          </Card>
        )}

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
}); 