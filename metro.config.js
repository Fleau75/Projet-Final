const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ajout des extensions de fichiers à gérer
config.resolver.assetExts.push('png', 'svg', 'jpg', 'jpeg');
config.resolver.sourceExts = ['jsx', 'js', 'ts', 'tsx', 'json'];

// Configuration pour les assets
config.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer');

module.exports = config; 