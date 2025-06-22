/**
 * Service de configuration pour gérer les variables d'environnement
 * et les clés API de manière sécurisée
 */

// Configuration par défaut (fallback si les variables d'environnement ne sont pas définies)
const DEFAULT_CONFIG = {
  // Google Places API - Clé de test temporaire
  GOOGLE_PLACES_API_KEY: 'AIzaSyDf5RU9u0v6zBLabWGsxex-BIIdfe0jdHA', // Clé de test temporaire
  
  // Clé de chiffrement
  ENCRYPTION_KEY: 'AccessPlus_Secure_Key_2024_v1',
  
  // Configuration de sécurité
  MAX_LOGIN_ATTEMPTS: 5,
  LOGIN_TIMEOUT_MINUTES: 15,
  SESSION_TIMEOUT_HOURS: 24,
  
  // Configuration Firebase (si nécessaire)
  FIREBASE_API_KEY: null,
  FIREBASE_AUTH_DOMAIN: null,
  FIREBASE_PROJECT_ID: null,
};

class ConfigService {
  static config = { ...DEFAULT_CONFIG };
  
  /**
   * Initialiser la configuration
   */
  static initialize() {
    try {
      console.log('🔧 Initialisation de la configuration...');
      
      // En production, on pourrait charger depuis un fichier .env
      // Pour l'instant, on utilise la configuration par défaut
      this.config = { ...DEFAULT_CONFIG };
      
      // Valider la configuration
      this.validateConfig();
      
      console.log('✅ Configuration initialisée avec succès');
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation de la configuration:', error);
      // Utiliser la configuration par défaut en cas d'erreur
      this.config = { ...DEFAULT_CONFIG };
    }
  }
  
  /**
   * Valider la configuration
   */
  static validateConfig() {
    const requiredKeys = ['GOOGLE_PLACES_API_KEY', 'ENCRYPTION_KEY'];
    
    for (const key of requiredKeys) {
      if (!this.config[key]) {
        console.warn(`⚠️ Clé de configuration manquante: ${key}`);
      }
    }
  }
  
  /**
   * Obtenir une valeur de configuration
   */
  static get(key, defaultValue = null) {
    return this.config[key] || defaultValue;
  }
  
  /**
   * Définir une valeur de configuration
   */
  static set(key, value) {
    this.config[key] = value;
    console.log(`🔧 Configuration mise à jour: ${key}`);
  }
  
  /**
   * Obtenir la clé API Google Places
   */
  static getGooglePlacesApiKey() {
    const key = this.get('GOOGLE_PLACES_API_KEY');
    if (!key || key === 'API_KEY_HIDDEN') {
      console.warn('⚠️ Clé API Google Places non configurée');
      return null;
    }
    return key;
  }
  
  /**
   * Obtenir la clé de chiffrement
   */
  static getEncryptionKey() {
    return this.get('ENCRYPTION_KEY');
  }
  
  /**
   * Obtenir la configuration de sécurité
   */
  static getSecurityConfig() {
    return {
      maxLoginAttempts: this.get('MAX_LOGIN_ATTEMPTS', 5),
      loginTimeoutMinutes: this.get('LOGIN_TIMEOUT_MINUTES', 15),
      sessionTimeoutHours: this.get('SESSION_TIMEOUT_HOURS', 24),
    };
  }
  
  /**
   * Vérifier si la configuration est valide
   */
  static isValid() {
    const googleKey = this.getGooglePlacesApiKey();
    const encryptionKey = this.getEncryptionKey();
    
    return !!(googleKey && encryptionKey);
  }
}

export default ConfigService; 