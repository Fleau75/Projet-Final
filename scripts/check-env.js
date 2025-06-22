#!/usr/bin/env node

/**
 * Script de vérification des variables d'environnement
 * Vérifie que toutes les clés API nécessaires sont configurées
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Vérification des variables d\'environnement...\n');

// Vérifier si le fichier .env existe
const envPath = path.join(__dirname, '..', '.env');
if (!fs.existsSync(envPath)) {
  console.error('❌ Fichier .env non trouvé !');
  console.log('📝 Créez un fichier .env basé sur .env.example');
  process.exit(1);
}

// Lire le fichier .env
const envContent = fs.readFileSync(envPath, 'utf8');
const envLines = envContent.split('\n');

// Variables requises
const requiredVars = [
  'GOOGLE_PLACES_API_KEY',
  'FIREBASE_API_KEY',
  'FIREBASE_AUTH_DOMAIN',
  'FIREBASE_PROJECT_ID',
  'FIREBASE_STORAGE_BUCKET',
  'FIREBASE_MESSAGING_SENDER_ID',
  'FIREBASE_APP_ID',
  'FIREBASE_MEASUREMENT_ID',
  'ENCRYPTION_KEY'
];

// Variables optionnelles
const optionalVars = [
  'GOOGLE_MAPS_API_KEY',
  'MAX_LOGIN_ATTEMPTS',
  'LOGIN_TIMEOUT_MINUTES',
  'SESSION_TIMEOUT_HOURS',
  'NODE_ENV'
];

console.log('📋 Variables requises :');
let allRequiredPresent = true;

requiredVars.forEach(varName => {
  const line = envLines.find(line => line.startsWith(varName + '='));
  if (line) {
    const value = line.split('=')[1];
    if (value && value !== 'votre_clé_google_places_ici' && value !== 'votre_clé_firebase_api_ici') {
      console.log(`  ✅ ${varName} = ${value.substring(0, 10)}...`);
    } else {
      console.log(`  ⚠️  ${varName} = [VALEUR PAR DÉFAUT]`);
      allRequiredPresent = false;
    }
  } else {
    console.log(`  ❌ ${varName} = [MANQUANT]`);
    allRequiredPresent = false;
  }
});

console.log('\n📋 Variables optionnelles :');
optionalVars.forEach(varName => {
  const line = envLines.find(line => line.startsWith(varName + '='));
  if (line) {
    const value = line.split('=')[1];
    console.log(`  ✅ ${varName} = ${value}`);
  } else {
    console.log(`  ⚪ ${varName} = [NON DÉFINIE]`);
  }
});

console.log('\n🔒 Vérification de sécurité :');

// Vérifier que le fichier .env n'est pas commité
const gitignorePath = path.join(__dirname, '..', '.gitignore');
if (fs.existsSync(gitignorePath)) {
  const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
  if (gitignoreContent.includes('.env')) {
    console.log('  ✅ .env est dans .gitignore');
  } else {
    console.log('  ❌ .env n\'est PAS dans .gitignore');
  }
} else {
  console.log('  ❌ Fichier .gitignore non trouvé');
}

// Vérifier que .env.example existe
const envExamplePath = path.join(__dirname, '..', '.env.example');
if (fs.existsSync(envExamplePath)) {
  console.log('  ✅ .env.example existe');
} else {
  console.log('  ❌ .env.example manquant');
}

console.log('\n📊 Résumé :');
if (allRequiredPresent) {
  console.log('✅ Toutes les variables requises sont configurées');
  console.log('🚀 Votre application devrait fonctionner correctement');
} else {
  console.log('⚠️  Certaines variables requises sont manquantes ou utilisent des valeurs par défaut');
  console.log('📝 Mettez à jour votre fichier .env avec les vraies clés API');
}

console.log('\n💡 Conseils :');
console.log('  - Ne commitez jamais le fichier .env');
console.log('  - Utilisez des clés API différentes pour chaque environnement');
console.log('  - Régénérez régulièrement vos clés API pour la sécurité'); 