/**
 * Écran de réglages/paramètres
 * Permet à l'utilisateur de configurer ses préférences d'accessibilité et l'application
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import StorageService from '../services/storageService';
import { BiometricService } from '../services/biometricService';
import { useAuth } from '../theme/AuthContext';
import NotificationService from '../services/notificationService';

// Constantes pour les valeurs par défaut et les limites
const SEARCH_RADIUS_DEFAULT = 800;
const SEARCH_RADIUS_MIN = 200;
const SEARCH_RADIUS_MAX = 2000;
const SEARCH_RADIUS_STEP = 50;

export default function SettingsScreen({ navigation, route }) {
  const theme = useTheme();
  const { isDarkMode, toggleTheme, resetToDefault: resetTheme } = useAppTheme();
  const { isLargeText, toggleTextSize, resetToDefault: resetTextSize, textSizes } = useTextSize();
  const { isScreenReaderEnabled } = useScreenReader();
  const { user } = useAuth();
  
  // Référence pour le ScrollView
  const scrollViewRef = useRef(null);
  // Référence pour la section notifications
  const notificationsRef = useRef(null);
  
  // États pour les préférences d'accessibilité
  const [accessibilityPrefs, setAccessibilityPrefs] = useState({
    requireRamp: false,
    requireElevator: false,
    requireAccessibleParking: false,
    requireAccessibleToilets: false,
  });

  // États pour les notifications
  const [notifications, setNotifications] = useState({
    newPlaces: false,
    reviews: false,
    updates: false,
  });

  // États pour les préférences générales
  const [searchRadius, setSearchRadius] = useState(SEARCH_RADIUS_DEFAULT);
  const [mapStyle, setMapStyle] = useState('standard');

  // États pour la biométrie
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricTypes, setBiometricTypes] = useState([]);

  // Charger tous les paramètres au démarrage
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Charger les préférences d'accessibilité
        const savedAccessibilityPrefs = await StorageService.getAccessibilityPrefs();
        if (savedAccessibilityPrefs !== null) {
          setAccessibilityPrefs(savedAccessibilityPrefs);
        }

        // Charger les notifications
        const savedNotifications = await StorageService.getNotificationPrefs();
        if (savedNotifications !== null) {
          setNotifications(savedNotifications);
        }

        // Charger le rayon de recherche
        const savedRadius = await StorageService.getSearchRadius();
        if (savedRadius !== null) {
          setSearchRadius(parseInt(savedRadius));
        }

        // Charger le style de carte
        const savedMapStyle = await StorageService.getMapStyle();
        if (savedMapStyle !== null) {
          setMapStyle(savedMapStyle);
        }

        // Vérifier la disponibilité de la biométrie
        const isAvailable = await BiometricService.isBiometricAvailable();
        setBiometricAvailable(isAvailable);
        
        if (isAvailable) {
          const supportedTypes = await BiometricService.getSupportedTypes();
          setBiometricTypes(supportedTypes.names);
          
          const prefs = await BiometricService.loadBiometricPreferences();
          setBiometricEnabled(prefs.enabled);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des paramètres:', error);
      }
    };

    loadSettings();
  }, []);

  // Gérer le défilement vers la section notifications
  useEffect(() => {
    if (route?.params?.scrollToNotifications) {
      // Délai pour laisser le temps au composant de se rendre
      const timer = setTimeout(() => {
        if (notificationsRef.current && scrollViewRef.current) {
          // Mesurer la position de la section notifications
          notificationsRef.current.measureLayout(
            scrollViewRef.current,
            (x, y) => {
              // Scroller vers la section notifications avec un offset pour le header
              scrollViewRef.current?.scrollTo({ 
                y: Math.max(0, y - 100), // Offset de 100px pour le header
                animated: true 
              });
            },
            () => {
              // Fallback si la mesure échoue
              console.log('Fallback: scroll vers position approximative');
              scrollViewRef.current?.scrollTo({ 
                y: 1200, // Position approximative plus basse
                animated: true 
              });
            }
          );
        } else {
          // Fallback si les refs ne sont pas disponibles
          console.log('Fallback: scroll vers position approximative');
          scrollViewRef.current?.scrollTo({ 
            y: 1200, // Position approximative plus basse
            animated: true 
          });
        }
        
        // Nettoyer le paramètre pour éviter les réactualisations multiples
        navigation.setParams({ scrollToNotifications: false });
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [route?.params?.scrollToNotifications, navigation]);

  // Optimisation des callbacks avec useCallback
  const handleSearchRadiusChange = useCallback(async (value) => {
    try {
      const roundedValue = Math.round(value);
      setSearchRadius(roundedValue);
      await StorageService.setSearchRadius(roundedValue.toString());
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du rayon de recherche:', error);
      Alert.alert(
        "Erreur",
        "Impossible de sauvegarder le rayon de recherche",
        [{ text: "OK" }]
      );
    }
  }, []);

  const toggleAccessibilityPref = async (key) => {
    try {
      const newPrefs = {
        ...accessibilityPrefs,
        [key]: !accessibilityPrefs[key]
      };
      setAccessibilityPrefs(newPrefs);
      await StorageService.setAccessibilityPrefs(newPrefs);
      console.log('🔧 Préférences d\'accessibilité sauvegardées:', newPrefs);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des préférences d\'accessibilité:', error);
    }
  };

  const toggleNotification = useCallback(async (key) => {
    try {
      const newNotifications = {
        ...notifications,
        [key]: !notifications[key]
      };
      setNotifications(newNotifications);
      await StorageService.setNotificationPrefs(newNotifications);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des notifications:', error);
      Alert.alert(
        "Erreur",
        "Impossible de sauvegarder les préférences de notification",
        [{ text: "OK" }]
      );
    }
  }, [notifications]);

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
                newPlaces: false,
                reviews: false,
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
                StorageService.setAccessibilityPrefs(defaultAccessibilityPrefs),
                StorageService.setNotificationPrefs(defaultNotifications),
                StorageService.setSearchRadius(defaultSearchRadius.toString()),
                StorageService.setMapStyle(defaultMapStyle),
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

  // Fonctions pour la biométrie
  const handleBiometricToggle = async () => {
    if (!user) {
      Alert.alert(
        "Connexion requise",
        "Vous devez être connecté pour configurer l'authentification biométrique",
        [{ text: "OK" }]
      );
      return;
    }

    // Empêcher la biométrie pour les visiteurs
    if (user.isVisitor) {
      Alert.alert(
        "Mode visiteur",
        "La biométrie n'est pas disponible en mode visiteur. Veuillez créer un compte pour utiliser cette fonctionnalité.",
        [{ text: "OK" }]
      );
      return;
    }

    if (biometricEnabled) {
      // Désactiver la biométrie
      Alert.alert(
        "Désactiver la biométrie",
        "Êtes-vous sûr de vouloir désactiver l'authentification biométrique ?",
        [
          { text: "Annuler", style: "cancel" },
          {
            text: "Désactiver",
            style: "destructive",
            onPress: async () => {
              try {
                await BiometricService.disableBiometrics();
                setBiometricEnabled(false);
                Alert.alert("✅ Biométrie désactivée", "L'authentification biométrique a été désactivée");
              } catch (error) {
                console.error('Erreur lors de la désactivation:', error);
                Alert.alert("❌ Erreur", "Impossible de désactiver la biométrie");
              }
            }
          }
        ]
      );
    } else {
      // Activer la biométrie
      try {
        const result = await BiometricService.authenticateWithBiometrics(
          'Configurez l\'authentification biométrique'
        );
        
        if (result.success) {
          await BiometricService.saveBiometricPreferences(true, user.email);
          setBiometricEnabled(true);
          Alert.alert(
            "✅ Biométrie activée",
            "Vous pouvez maintenant vous connecter avec votre empreinte digitale ou reconnaissance faciale !"
          );
        } else {
          Alert.alert(
            "❌ Échec de la configuration",
            BiometricService.getErrorMessage(result.error)
          );
        }
      } catch (error) {
        console.error('Erreur lors de la configuration biométrie:', error);
        Alert.alert("Erreur", "Impossible de configurer l'authentification biométrique");
      }
    }
  };

  const openAccessibilitySettings = async () => {
    try {
      if (Platform.OS === 'ios') {
        await Linking.openURL('App-Prefs:ACCESSIBILITY');
      } else {
        await Linking.openURL('android.settings.ACCESSIBILITY_SETTINGS');
      }
    } catch (error) {
      console.error('Erreur lors de l\'ouverture des paramètres d\'accessibilité:', error);
      Alert.alert(
        "Erreur",
        "Impossible d'ouvrir les paramètres d'accessibilité",
        [{ text: "OK" }]
      );
    }
  };

  const handleReportProblem = () => {
    Alert.alert(
      "Signaler un problème",
      "Comment souhaitez-vous nous contacter ?",
      [
        {
          text: "Annuler",
          style: "cancel"
        },
        {
          text: "Envoyer un email",
          onPress: () => {
            const subject = encodeURIComponent("AccessPlus - Signalement de problème");
            const body = encodeURIComponent(
              `Bonjour,\n\nJe souhaite signaler un problème avec l'application AccessPlus.\n\n` +
              `Version de l'app : 1.0.0\n` +
              `Appareil : ${Platform.OS}\n` +
              `Utilisateur : ${user?.email || 'Non connecté'}\n\n` +
              `Description du problème :\n\n` +
              `Merci de votre aide !`
            );
            
            const mailtoUrl = `mailto:support@accessplus.com?subject=${subject}&body=${body}`;
            
            Linking.canOpenURL(mailtoUrl).then(supported => {
              if (supported) {
                Linking.openURL(mailtoUrl);
              } else {
                Alert.alert(
                  "Erreur",
                  "Impossible d'ouvrir l'application email",
                  [{ text: "OK" }]
                );
              }
            });
          }
        }
      ]
    );
  };

  const handleHelpAndSupport = () => {
    Alert.alert(
      "Aide et Support",
      "Que souhaitez-vous faire ?",
      [
        {
          text: "Annuler",
          style: "cancel"
        },
        {
          text: "Guide d'utilisation",
          onPress: () => {
            Alert.alert(
              "📖 Guide d'utilisation",
              "Fonctionnalités principales :\n\n" +
              "🔍 Recherche de lieux accessibles\n" +
              "📍 Géolocalisation automatique\n" +
              "⭐ Système d'avis et notes\n" +
              "🔔 Notifications personnalisées\n" +
              "♿ Filtres d'accessibilité\n" +
              "🗺️ Cartographie interactive\n\n" +
              "Pour plus d'informations, consultez notre site web.",
              [
                { 
                  text: "👍 Compris !", 
                  style: "default"
                }
              ]
            );
          }
        },
        {
          text: "FAQ",
          onPress: () => {
            Alert.alert(
              "❓ Questions fréquentes",
              "FAQ AccessPlus :\n\n" +
              "⚙️ Q: Comment filtrer les lieux selon mes besoins ?\n" +
              "   R: Réglages > Accessibilité\n\n" +
              "➕ Q: Comment ajouter un nouveau lieu ?\n" +
              "   R: Bouton + sur la carte\n\n" +
              "🔔 Q: Comment activer les notifications ?\n" +
              "   R: Réglages > Notifications\n\n" +
              "📱 Q: Fonctionne-t-elle hors ligne ?\n" +
              "   R: Oui, favoris et historique\n\n" +
              "🔒 Q: Mes données sont-elles privées ?\n" +
              "   R: Oui, protégées et anonymisées\n\n" +
              "🤝 Q: Comment contribuer ?\n" +
              "   R: Ajoutez des avis et signalez les problèmes",
              [
                { 
                  text: "✨ Merci !", 
                  style: "default"
                }
              ]
            );
          }
        }
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]} testID="settings-screen">
      <ScrollView ref={scrollViewRef} style={styles.scrollView}>
        
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
                  testID="ramp-switch"
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
                  testID="elevator-switch"
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
                  testID="parking-switch"
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
                  testID="toilets-switch"
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
                  testID="dark-mode-switch"
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
                  testID="large-text-switch"
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
                  testID="screen-reader-switch"
                  value={isScreenReaderEnabled}
                  disabled={true}  // Désactivé car géré par le système
                />
              )}
            />
            
            <Text style={[styles.hint, { fontSize: textSizes.caption, color: theme.colors.primary }]}>
              La lecture d'écran se configure dans les paramètres d'accessibilité de votre appareil
            </Text>

            <Button
              testID="accessibility-settings-button"
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

        {/* Authentification biométrique */}
        {biometricAvailable && user && !user.isVisitor && (
          <Card style={styles.card}>
            <Card.Content>
              <Title style={[styles.sectionTitle, { fontSize: textSizes.title }]}>🔐 Authentification biométrique</Title>
              <Text style={[styles.sectionDescription, { fontSize: textSizes.body }]}>
                Utilisez votre empreinte digitale ou reconnaissance faciale pour vous connecter rapidement
              </Text>
              
              {biometricTypes.length > 0 && (
                <Text style={[styles.hint, { fontSize: textSizes.caption, color: theme.colors.primary }]}>
                  Types supportés : {biometricTypes.join(', ')}
                </Text>
              )}
              
              <List.Item
                title="Authentification biométrique"
                description={biometricEnabled ? "Connectez-vous avec votre empreinte ou visage" : "Activez la connexion biométrique"}
                titleStyle={{ fontSize: textSizes.subtitle }}
                descriptionStyle={{ fontSize: textSizes.caption }}
                left={props => <List.Icon {...props} icon="fingerprint" />}
                right={() => (
                  <Switch
                    testID="biometric-switch"
                    value={biometricEnabled}
                    onValueChange={handleBiometricToggle}
                  />
                )}
              />
              
              {!user && (
                <Text style={[styles.hint, { fontSize: textSizes.caption, color: theme.colors.error }]}>
                  Vous devez être connecté pour configurer l'authentification biométrique
                </Text>
              )}
              
              {biometricEnabled && user && (
                <Text style={[styles.hint, { fontSize: textSizes.caption, color: theme.colors.primary }]}>
                  Configurée pour : {user.email}
                </Text>
              )}
            </Card.Content>
          </Card>
        )}

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
                testID="search-radius-slider"
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
        <Card style={styles.card} ref={notificationsRef}>
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
              left={props => <List.Icon {...props} icon="map-marker" />}
              right={() => (
                <Switch
                  testID="notifications-switch"
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
              left={props => <List.Icon {...props} icon="star" />}
              right={() => (
                <Switch
                  testID="reviews-notifications-switch"
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
                  testID="updates-notifications-switch"
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
            testID="reset-settings-button"
            mode="outlined" 
            onPress={handleResetSettings}
            style={[styles.resetButton, { 
              borderColor: theme.colors.error,
              borderWidth: 2,
              borderRadius: 12,
              paddingVertical: 12,
              marginTop: 8
            }]}
            labelStyle={{ 
              fontSize: textSizes.body, 
              color: theme.colors.error,
              fontWeight: '600',
              letterSpacing: 0.5
            }}
            icon="refresh"
            buttonColor="transparent"
            textColor={theme.colors.error}
          >
            Réinitialiser tous les paramètres
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
              onPress={handleHelpAndSupport}
              testID="help-support-button"
            />
            <List.Item
              title="Signaler un problème"
              description="Nous aider à améliorer l'app"
              left={props => <List.Icon {...props} icon="bug" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={handleReportProblem}
              testID="report-problem-button"
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
    paddingHorizontal: 8,
  },
  resetButton: {
    paddingVertical: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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