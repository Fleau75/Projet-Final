/**
 * Point d'entrée principal de l'application AccessPlus
 * Cette application aide les utilisateurs à trouver et évaluer des lieux accessibles
 */

import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { ThemeProvider, useAppTheme } from './theme/ThemeContext';
import { TextSizeProvider } from './theme/TextSizeContext';
import { ScreenReaderProvider } from './theme/ScreenReaderContext';
import LoadingOverlay from './components/LoadingOverlay';

// Import des différents écrans de l'application
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import MapScreen from './screens/MapScreen';
import AddReviewScreen from './screens/AddReviewScreen';
import ProfileScreen from './screens/ProfileScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import MyReviewsScreen from './screens/MyReviewsScreen';
import FavoritePlacesScreen from './screens/FavoritePlacesScreen';
import SettingsScreen from './screens/SettingsScreen';
import PlaceDetailScreen from './screens/PlaceDetailScreen';

// Création des navigateurs
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Style global pour les headers
const getHeaderStyle = (theme) => ({
  backgroundColor: theme.colors.primary,
  elevation: 8,
  shadowColor: theme.colors.primary,
  shadowOffset: {
    width: 0,
    height: 4,
  },
  shadowOpacity: 0.3,
  shadowRadius: 6,
  borderBottomWidth: 0,
  height: Platform.OS === 'ios' ? 60 : 50,
});

const getHeaderTitleStyle = () => ({
  fontWeight: '700',
  fontSize: 18,
  fontFamily: Platform.select({
    ios: 'SF Pro Display',
    android: 'Roboto',
    default: 'System',
  }),
  letterSpacing: 0.5,
});

/**
 * Composant de navigation par onglets principal
 * Contient les 4 onglets principaux de l'application
 */
function MainTabNavigator() {
  const { theme } = useAppTheme();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Map':
              iconName = focused ? 'map' : 'map-outline';
              break;
            case 'Profile':
              iconName = focused ? 'account' : 'account-outline';
              break;
            case 'Settings':
              iconName = focused ? 'cog' : 'cog-outline';
              break;
            default:
              iconName = 'circle';
          }

          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.disabled,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.primary,
          borderTopWidth: 2,
          paddingBottom: 8,
          paddingTop: 8,
          height: 65,
          elevation: 12,
          shadowColor: theme.colors.primary,
          shadowOffset: {
            width: 0,
            height: -4,
          },
          shadowOpacity: 0.3,
          shadowRadius: 6,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerStyle: getHeaderStyle(theme),
        headerTintColor: '#fff',
        headerTitleStyle: getHeaderTitleStyle(),
        headerTitleAlign: 'center',
        headerBackTitleVisible: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ 
          title: 'Accueil',
          tabBarLabel: 'Accueil',
          headerTitle: 'AccessPlus',
          tabBarHideOnKeyboard: true,
        }}
      />
      
      <Tab.Screen 
        name="Map" 
        component={MapScreen}
        options={{ 
          title: 'Carte',
          tabBarLabel: 'Carte',
        }}
      />
      
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ 
          title: 'Profil',
          tabBarLabel: 'Profil',
          headerTitle: 'Mon Profil',
        }}
      />
      
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ 
          title: 'Réglages',
          tabBarLabel: 'Réglages',
        }}
      />
    </Tab.Navigator>
  );
}

/**
 * Contenu principal de l'application avec thème
 */
function AppContent() {
  const { theme, isLoading: themeLoading } = useAppTheme();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simuler un temps de chargement initial
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Attendre que le thème soit chargé
  if (themeLoading) {
    return <LoadingOverlay />;
  }

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        {isLoading ? (
          <LoadingOverlay />
        ) : (
          <Stack.Navigator
            initialRouteName="Login"
            screenOptions={{
              headerShown: false
            }}
          >
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen 
              name="Register" 
              component={RegisterScreen}
              options={{ 
                title: 'Inscription',
                presentation: 'card',
                headerShown: true,
                headerBackTitle: '',
                headerBackTitleVisible: false,
                headerStyle: getHeaderStyle(theme),
                headerTintColor: '#fff',
                headerTitleStyle: getHeaderTitleStyle(),
                headerTitleAlign: 'center',
              }}
            />
            <Stack.Screen name="MainTabs" component={MainTabNavigator} />
            <Stack.Screen 
              name="PlaceDetail" 
              component={PlaceDetailScreen}
              options={({ route }) => ({ 
                title: route.params?.place?.name || 'Détails du lieu',
                presentation: 'card',
                headerShown: true,
                headerBackTitle: '',
                headerBackTitleVisible: false,
                headerStyle: getHeaderStyle(theme),
                headerTintColor: '#fff',
                headerTitleStyle: getHeaderTitleStyle(),
                headerTitleAlign: 'center',
              })}
            />
            <Stack.Screen 
              name="EditProfile" 
              component={EditProfileScreen}
              options={{ 
                title: 'Éditer le profil',
                presentation: 'card',
                headerShown: true,
                headerBackTitle: '',
                headerBackTitleVisible: false,
                headerStyle: getHeaderStyle(theme),
                headerTintColor: '#fff',
                headerTitleStyle: getHeaderTitleStyle(),
                headerTitleAlign: 'center',
              }}
            />
            <Stack.Screen 
              name="MyReviews" 
              component={MyReviewsScreen}
              options={{ 
                title: 'Mes avis',
                presentation: 'card',
                headerShown: true,
                headerBackTitle: '',
                headerBackTitleVisible: false,
                headerStyle: getHeaderStyle(theme),
                headerTintColor: '#fff',
                headerTitleStyle: getHeaderTitleStyle(),
                headerTitleAlign: 'center',
              }}
            />
            <Stack.Screen 
              name="FavoritePlaces" 
              component={FavoritePlacesScreen}
              options={{ 
                title: 'Lieux favoris',
                presentation: 'card',
                headerShown: true,
                headerBackTitle: '',
                headerBackTitleVisible: false,
                headerStyle: getHeaderStyle(theme),
                headerTintColor: '#fff',
                headerTitleStyle: getHeaderTitleStyle(),
                headerTitleAlign: 'center',
              }}
            />
            <Stack.Screen 
              name="AddReview" 
              component={AddReviewScreen}
              options={{ 
                title: 'Ajouter un avis',
                presentation: 'modal',
                headerShown: true,
                headerBackTitle: '',
                headerBackTitleVisible: false,
                headerStyle: getHeaderStyle(theme),
                headerTintColor: '#fff',
                headerTitleStyle: getHeaderTitleStyle(),
                headerTitleAlign: 'center',
              }}
            />
          </Stack.Navigator>
        )}
      </NavigationContainer>
    </PaperProvider>
  );
}

/**
 * Composant principal de l'application
 * Configure les providers et les thèmes
 */
export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <TextSizeProvider>
          <ScreenReaderProvider>
            <AppContent />
          </ScreenReaderProvider>
        </TextSizeProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
