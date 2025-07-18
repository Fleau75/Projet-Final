module.exports = {
  name: 'AccessPlus',
  slug: 'accessplus',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/logo-new.png',
  userInterfaceStyle: 'light',
  splash: {
    image: './assets/logo-new.png',
    resizeMode: 'contain',
    backgroundColor: '#2563EB'
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.accessplus.app',
    config: {
      googleMapsApiKey: 'AlzaSyDf5RU9u0v6zBLabWGsxex-BIIdfe0jdHA'
    }
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/logo-new.png',
      backgroundColor: '#2563EB'
    },
    package: 'com.accessplus.app',
    config: {
      googleMaps: {
        apiKey: 'AlzaSyDf5RU9u0v6zBLabWGsxex-BIIdfe0jdHA'
      }
    }
  },
  web: {
    favicon: './assets/logo-new.png'
  },
  plugins: [
    [
      'expo-image-picker',
      {
        photosPermission: 'L\'application souhaite accéder à vos photos pour les avis.',
        cameraPermission: 'L\'application souhaite accéder à votre appareil photo.'
      }
    ],
    [
      'expo-location',
      {
        locationAlwaysAndWhenInUsePermission: 'Permettez à AccessPlus d\'utiliser votre position pour trouver les lieux accessibles autour de vous.'
      }
    ]
  ]
}; 