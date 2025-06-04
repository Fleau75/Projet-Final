/**
 * Point d'entrée principal de l'application AccessPlus
 * Cette application aide les utilisateurs à trouver et évaluer des lieux accessibles
 */

import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { theme } from './theme';
import LoadingOverlay from './components/LoadingOverlay';

// Import des différents écrans de l'application
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import MapScreen from './screens/MapScreen';
import PlaceDetailScreen from './screens/PlaceDetailScreen';
import AddReviewScreen from './screens/AddReviewScreen';

// Création du navigateur Stack pour la gestion de la navigation
const Stack = createStackNavigator();

/**
 * Composant principal de l'application
 * Configure la navigation et les thèmes de l'application
 */
export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simuler un temps de chargement initial
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaProvider>
      {/* Configuration du thème pour React Native Paper */}
      <PaperProvider theme={theme}>
        {/* Conteneur principal de navigation */}
        <NavigationContainer>
          {isLoading ? (
            <LoadingOverlay />
          ) : (
            <Stack.Navigator
              initialRouteName="Login"
              screenOptions={{
                headerStyle: {
                  backgroundColor: theme.colors.primary,
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                  fontWeight: 'bold',
                },
              }}
            >
              {/* Écran de connexion */}
              <Stack.Screen 
                name="Login" 
                component={LoginScreen}
                options={{ headerShown: false }}
              />
              
              {/* Écran d'accueil */}
              <Stack.Screen 
                name="Home" 
                component={HomeScreen}
                options={{ 
                  title: 'AccessPlus',
                  headerTransparent: true,
                  headerTintColor: '#000',
                  headerTitle: '',
                }}
              />
              
              {/* Écran de carte */}
              <Stack.Screen 
                name="Map" 
                component={MapScreen}
                options={{ 
                  title: 'Carte',
                }}
              />
              
              {/* Écran de détails d'un lieu */}
              <Stack.Screen 
                name="PlaceDetail" 
                component={PlaceDetailScreen}
                options={({ route }) => ({ 
                  title: route.params?.place?.name || 'Détails du lieu',
                })}
              />
              
              {/* Écran d'ajout d'avis */}
              <Stack.Screen 
                name="AddReview" 
                component={AddReviewScreen}
                options={{ 
                  title: 'Ajouter un avis',
                  presentation: 'modal',
                }}
              />
            </Stack.Navigator>
          )}
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
