import CryptoJS from 'react-native-crypto-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ConfigService from './configService';

/**
 * Service de chiffrement pour sécuriser les données sensibles
 * Utilise AES-256 pour le chiffrement des mots de passe
 */
class CryptoService {
  // Obtenir la clé de chiffrement depuis la configuration
  static get ENCRYPTION_KEY() {
    return ConfigService.getEncryptionKey() || 'AccessPlus_Secure_Key_2024_v1';
  }
  
  /**
   * Chiffrer une chaîne de caractères
   */
  static encrypt(text) {
    try {
      if (!text) return null;
      
      const encrypted = CryptoJS.AES.encrypt(text, this.ENCRYPTION_KEY).toString();
      console.log('🔐 Texte chiffré avec succès');
      return encrypted;
    } catch (error) {
      console.error('❌ Erreur lors du chiffrement:', error);
      return null;
    }
  }
  
  /**
   * Déchiffrer une chaîne de caractères
   */
  static decrypt(encryptedText) {
    try {
      if (!encryptedText) return null;
      
      const decrypted = CryptoJS.AES.decrypt(encryptedText, this.ENCRYPTION_KEY);
      const originalText = decrypted.toString(CryptoJS.enc.Utf8);
      
      if (!originalText) {
        console.warn('⚠️ Impossible de déchiffrer le texte');
        return null;
      }
      
      console.log('🔓 Texte déchiffré avec succès');
      return originalText;
    } catch (error) {
      console.error('❌ Erreur lors du déchiffrement:', error);
      return null;
    }
  }
  
  /**
   * Stocker une valeur chiffrée dans AsyncStorage
   */
  static async setEncryptedItem(key, value) {
    try {
      const encryptedValue = this.encrypt(value);
      if (encryptedValue) {
        await AsyncStorage.setItem(key, encryptedValue);
        console.log(`🔐 Valeur chiffrée stockée pour la clé: ${key}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Erreur lors du stockage chiffré:', error);
      return false;
    }
  }
  
  /**
   * Récupérer et déchiffrer une valeur depuis AsyncStorage
   */
  static async getEncryptedItem(key) {
    try {
      const encryptedValue = await AsyncStorage.getItem(key);
      if (encryptedValue) {
        const decryptedValue = this.decrypt(encryptedValue);
        console.log(`🔓 Valeur déchiffrée récupérée pour la clé: ${key}`);
        return decryptedValue;
      }
      return null;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération chiffrée:', error);
      return null;
    }
  }
  
  /**
   * Migrer les données existantes vers le chiffrement
   * Cette fonction sera utilisée pour migrer les mots de passe en clair
   */
  static async migrateToEncryption() {
    try {
      console.log('🔄 Début de la migration vers le chiffrement...');
      
      // Migrer les mots de passe utilisateur
      const allKeys = await AsyncStorage.getAllKeys();
      const userKeys = allKeys.filter(key => key.startsWith('user_'));
      
      for (const key of userKeys) {
        const userData = await AsyncStorage.getItem(key);
        if (userData) {
          try {
            const user = JSON.parse(userData);
            if (user.password && !user.password.startsWith('U2F')) {
              // Le mot de passe n'est pas encore chiffré
              console.log(`🔄 Migration du mot de passe pour: ${user.email}`);
              user.password = this.encrypt(user.password);
              await AsyncStorage.setItem(key, JSON.stringify(user));
              console.log(`✅ Migration réussie pour: ${user.email}`);
            }
          } catch (parseError) {
            // Gérer le cas spécial du visiteur où les données ne sont pas au format JSON
            if (key.includes('visiteur@accessplus.com')) {
              console.log(`🔄 Migration spéciale pour le visiteur: ${key}`);
              // Le visiteur a un mot de passe stocké directement
              if (userData && !userData.startsWith('U2F')) {
                const encryptedPassword = this.encrypt(userData);
                await AsyncStorage.setItem(key, encryptedPassword);
                console.log(`✅ Migration du visiteur réussie pour: ${key}`);
              }
            } else {
              console.warn(`⚠️ Erreur lors du parsing de ${key}:`, parseError);
            }
          }
        }
      }
      
      // Migrer le mot de passe principal
      const mainPassword = await AsyncStorage.getItem('userPassword');
      if (mainPassword && !mainPassword.startsWith('U2F')) {
        console.log('🔄 Migration du mot de passe principal...');
        await this.setEncryptedItem('userPassword', mainPassword);
        await AsyncStorage.removeItem('userPassword');
        console.log('✅ Migration du mot de passe principal réussie');
      }
      
      console.log('✅ Migration vers le chiffrement terminée');
    } catch (error) {
      console.error('❌ Erreur lors de la migration:', error);
    }
  }
  
  /**
   * Vérifier si les données sont chiffrées
   */
  static isEncrypted(text) {
    return text && text.startsWith('U2F');
  }
}

export default CryptoService; 