import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { theme } from './theme';

// Écrans
import LoginScreen from './screens/LoginScreen';
import MapScreen from './screens/MapScreen';
import PlaceDetailScreen from './screens/PlaceDetailScreen';
import AddReviewScreen from './screens/AddReviewScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <NavigationContainer>
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
            <Stack.Screen 
              name="Login" 
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            
            <Stack.Screen 
              name="Home" 
              component={MapScreen}
              options={{ 
                title: 'AccessPlus',
                headerTransparent: true,
              }}
            />
            
            <Stack.Screen 
              name="PlaceDetail" 
              component={PlaceDetailScreen}
              options={({ route }) => ({ 
                title: route.params?.place?.name || 'Détails du lieu',
                headerTransparent: true,
              })}
            />
            
            <Stack.Screen 
              name="AddReview" 
              component={AddReviewScreen}
              options={{ 
                title: 'Ajouter un avis',
                presentation: 'modal',
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
