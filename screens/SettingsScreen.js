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

export default function SettingsScreen({ navigation }) {
  const theme = useTheme();
  
  // États pour les préférences d'accessibilité
  const [accessibilityPrefs, setAccessibilityPrefs] = useState({
    requireRamp: false,
    requireElevator: false,
    requireAccessibleParking: false,
    requireAccessibleToilets: false,
    highContrast: false,
    largeText: false,
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
    console.log('Paramètres sauvegardés');
    // Vous pouvez ici sauvegarder dans AsyncStorage ou une base de données
  };

  const handleResetSettings = () => {
    // Réinitialiser tous les paramètres
    setAccessibilityPrefs({
      requireRamp: false,
      requireElevator: false,
      requireAccessibleParking: false,
      requireAccessibleToilets: false,
      highContrast: false,
      largeText: false,
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
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView}>
        
        {/* Préférences d'accessibilité */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>♿ Préférences d'accessibilité</Title>
            <Text style={styles.sectionDescription}>
              Filtrez automatiquement les lieux selon vos besoins d'accessibilité
            </Text>
            
            <List.Item
              title="Rampe d'accès requise"
              description="Afficher uniquement les lieux avec rampe"
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
            <Title style={styles.sectionTitle}>🎨 Affichage</Title>
            
            <List.Item
              title="Contraste élevé"
              description="Améliore la lisibilité pour les malvoyants"
              right={() => (
                <Switch
                  value={accessibilityPrefs.highContrast}
                  onValueChange={() => toggleAccessibilityPref('highContrast')}
                />
              )}
            />
            
            <List.Item
              title="Texte agrandi"
              description="Augmente la taille du texte"
              right={() => (
                <Switch
                  value={accessibilityPrefs.largeText}
                  onValueChange={() => toggleAccessibilityPref('largeText')}
                />
              )}
            />
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 16,
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
}); 