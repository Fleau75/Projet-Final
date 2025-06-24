// Service Firebase pour gérer les opérations de base de données
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy, limit } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { AuthService } from './authService';
import ConfigService from './configService';
import { firebaseConfig, devConfig } from '../firebase.config';

// Configuration Firebase depuis les variables d'environnement ou le fichier de config
const config = {
  apiKey: ConfigService.get('FIREBASE_API_KEY') || firebaseConfig.apiKey,
  authDomain: ConfigService.get('FIREBASE_AUTH_DOMAIN') || firebaseConfig.authDomain,
  projectId: ConfigService.get('FIREBASE_PROJECT_ID') || firebaseConfig.projectId,
  storageBucket: ConfigService.get('FIREBASE_STORAGE_BUCKET') || firebaseConfig.storageBucket,
  messagingSenderId: ConfigService.get('FIREBASE_MESSAGING_SENDER_ID') || firebaseConfig.messagingSenderId,
  appId: ConfigService.get('FIREBASE_APP_ID') || firebaseConfig.appId,
  measurementId: ConfigService.get('FIREBASE_MEASUREMENT_ID') || firebaseConfig.measurementId
};

// Initialiser Firebase seulement si ce n'est pas déjà fait
let app;
if (getApps().length === 0) {
  app = initializeApp(config);
} else {
  app = getApps()[0];
}

// Initialiser Firestore et Storage
export const db = getFirestore(app);
export const storage = getStorage(app);

// Collections references
const PLACES_COLLECTION = 'places';
const REVIEWS_COLLECTION = 'reviews';

/**
 * Service pour gérer les lieux dans Firestore
 */
export class PlacesService {
  
  /**
   * Récupérer tous les lieux
   */
  static async getAllPlaces() {
    try {
      const placesRef = collection(db, PLACES_COLLECTION);
      const snapshot = await getDocs(placesRef);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des lieux:', error);
      throw error;
    }
  }

  /**
   * Récupérer les lieux par catégorie
   */
  static async getPlacesByCategory(category) {
    try {
      const placesRef = collection(db, PLACES_COLLECTION);
      const q = query(placesRef, where('type', '==', category));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des lieux par catégorie:', error);
      throw error;
    }
  }

  /**
   * Récupérer les lieux les mieux notés
   */
  static async getTopRatedPlaces(limitCount = 5) {
    try {
      const placesRef = collection(db, PLACES_COLLECTION);
      const q = query(placesRef, orderBy('rating', 'desc'), limit(limitCount));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des lieux les mieux notés:', error);
      throw error;
    }
  }

  /**
   * Récupérer un lieu par son ID
   */
  static async getPlaceById(placeId) {
    try {
      const placeRef = doc(db, PLACES_COLLECTION, placeId);
      const snapshot = await getDoc(placeRef);
      
      if (snapshot.exists()) {
        return {
          id: snapshot.id,
          ...snapshot.data()
        };
      } else {
        throw new Error('Lieu non trouvé');
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du lieu:', error);
      throw error;
    }
  }

  /**
   * Ajouter un nouveau lieu et incrémenter le compteur utilisateur
   */
  static async addPlace(placeData, userId = null) {
    try {
      const placesRef = collection(db, PLACES_COLLECTION);
      const docRef = await addDoc(placesRef, {
        ...placeData,
        createdAt: new Date(),
        updatedAt: new Date(),
        addedBy: userId || 'anonymous'
      });
      
      // Incrémenter le compteur de lieux ajoutés par l'utilisateur
      if (userId && userId !== 'anonymous') {
        await AuthService.incrementPlacesAdded(userId);
        console.log(`✅ Compteur de lieux incrémenté pour ${userId}`);
      }
      
      return docRef.id;
    } catch (error) {
      console.error('Erreur lors de l\'ajout du lieu:', error);
      throw error;
    }
  }

  /**
   * Mettre à jour un lieu
   */
  static async updatePlace(placeId, updateData) {
    try {
      const placeRef = doc(db, PLACES_COLLECTION, placeId);
      await updateDoc(placeRef, {
        ...updateData,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du lieu:', error);
      throw error;
    }
  }

  /**
   * Supprimer un lieu
   */
  static async deletePlace(placeId) {
    try {
      const placeRef = doc(db, PLACES_COLLECTION, placeId);
      await deleteDoc(placeRef);
    } catch (error) {
      console.error('Erreur lors de la suppression du lieu:', error);
      throw error;
    }
  }

  /**
   * Rechercher des lieux par nom
   */
  static async searchPlacesByName(searchTerm) {
    try {
      const placesRef = collection(db, PLACES_COLLECTION);
      const snapshot = await getDocs(placesRef);
      
      // Filtrage côté client pour la recherche textuelle
      // (Firestore ne supporte pas la recherche full-text native)
      const places = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return places.filter(place => 
        place.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        place.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } catch (error) {
      console.error('Erreur lors de la recherche de lieux:', error);
      throw error;
    }
  }

  /**
   * Initialiser la base de données avec des données d'exemple
   */
  static async initializeWithSampleData() {
    try {
      const samplePlaces = [
        {
          name: 'Restaurant Le Marais',
          address: '35 rue des Archives, 75003 Paris',
          type: 'restaurant',
          rating: 4.5,
          reviewCount: 42,
          image: null,
          coordinates: {
            latitude: 48.8627,
            longitude: 2.3578
          },
          accessibility: {
            ramp: true,
            elevator: true,
            parking: true,
            toilets: true,
          },
        },
        {
          name: 'Musée Carnavalet',
          address: '23 Rue de Sévigné, 75003 Paris',
          type: 'culture',
          rating: 4.8,
          reviewCount: 89,
          image: null,
          coordinates: {
            latitude: 48.8578,
            longitude: 2.3622
          },
          accessibility: {
            ramp: true,
            elevator: true,
            parking: true,
            toilets: true,
          },
        },
        {
          name: 'BHV Marais',
          address: '52 Rue de Rivoli, 75004 Paris',
          type: 'shopping',
          rating: 4.2,
          reviewCount: 156,
          image: null,
          coordinates: {
            latitude: 48.8571,
            longitude: 2.3519
          },
          accessibility: {
            ramp: true,
            elevator: true,
            parking: true,
            toilets: true,
          },
        },
        {
          name: 'Café Saint-Régis',
          address: '6 Rue Jean du Bellay, 75004 Paris',
          type: 'restaurant',
          rating: 4.9,
          reviewCount: 56,
          image: null,
          coordinates: {
            latitude: 48.8524,
            longitude: 2.3568
          },
          accessibility: {
            ramp: true,
            elevator: false,
            parking: true,
            toilets: true,
          },
        },
        {
          name: 'Bibliothèque de l\'Arsenal',
          address: '1 Rue de Sully, 75004 Paris',
          type: 'education',
          rating: 4.7,
          reviewCount: 34,
          image: null,
          coordinates: {
            latitude: 48.8509,
            longitude: 2.3645
          },
          accessibility: {
            ramp: true,
            elevator: true,
            parking: true,
            toilets: true,
          },
        },
        {
          name: 'Place des Vosges',
          address: 'Place des Vosges, 75004 Paris',
          type: 'culture',
          rating: 4.9,
          reviewCount: 245,
          image: null,
          coordinates: {
            latitude: 48.8561,
            longitude: 2.3655
          },
          accessibility: {
            ramp: true,
            elevator: false,
            parking: true,
            toilets: true,
          },
        },
      ];

      // Ajouter tous les lieux d'exemple
      const promises = samplePlaces.map(place => this.addPlace(place));
      await Promise.all(promises);
      
      console.log('Base de données initialisée avec les données d\'exemple');
    } catch (error) {
      console.error('Erreur lors de l\'initialisation:', error);
      throw error;
    }
  }
}

/**
 * Service pour gérer les avis dans Firestore
 */
export class ReviewsService {
  
  /**
   * Ajouter un nouvel avis et incrémenter le compteur utilisateur
   */
  static async addReview(reviewData, userId = null) {
    try {
      // Récupérer l'email de l'utilisateur connecté
      let userEmail = null;
      
      // Si l'email est déjà dans les données, l'utiliser
      if (reviewData.userEmail) {
        userEmail = reviewData.userEmail;
        console.log(`📝 Utilisation de l'email fourni: ${userEmail}`);
      } else if (userId && userId !== 'anonymous') {
        const currentUser = await AuthService.getCurrentUser();
        userEmail = currentUser ? currentUser.email : null;
        console.log(`📝 Utilisation de l'email de l'utilisateur connecté: ${userEmail}`);
      }
      
      const reviewsRef = collection(db, REVIEWS_COLLECTION);
      const docRef = await addDoc(reviewsRef, {
        ...reviewData,
        createdAt: new Date(),
        updatedAt: new Date(),
        addedBy: userId || 'anonymous',
        userEmail: userEmail || null // Ajouter l'email pour la persistance
      });
      
      // Incrémenter le compteur d'avis ajoutés par l'utilisateur
      if (userId && userId !== 'anonymous') {
        await AuthService.incrementReviewsAdded(userId);
        console.log(`✅ Compteur d'avis incrémenté pour ${userId}`);
      }
      
      return docRef.id;
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'avis:', error);
      throw error;
    }
  }

  /**
   * Récupérer les avis d'un lieu
   */
  static async getReviewsByPlaceId(placeId) {
    try {
      const reviewsRef = collection(db, REVIEWS_COLLECTION);
      const q = query(reviewsRef, where('placeId', '==', placeId), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des avis:', error);
      throw error;
    }
  }

  /**
   * Récupérer tous les avis d'un utilisateur
   */
  static async getReviewsByUserId(userId = 'anonymous', userEmail = null) {
    try {
      console.log('📖 Récupération des avis pour l\'utilisateur:', userId);
      
      // Si un email est fourni directement, l'utiliser
      let emailToSearch = userEmail;
      
      // Sinon, si c'est un utilisateur connecté, récupérer son email
      if (!emailToSearch && userId !== 'anonymous') {
        const currentUser = await AuthService.getCurrentUser();
        emailToSearch = currentUser ? currentUser.email : null;
      }
      
      const reviewsRef = collection(db, REVIEWS_COLLECTION);
      
      // Si on a un email, chercher par email, sinon par userId
      let q;
      if (emailToSearch) {
        q = query(reviewsRef, where('userEmail', '==', emailToSearch));
        console.log(`📖 Recherche par email: ${emailToSearch}`);
      } else {
        q = query(reviewsRef, where('userId', '==', userId));
        console.log(`📖 Recherche par userId: ${userId}`);
      }
      
      const snapshot = await getDocs(q);
      
      const reviews = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Convertir les timestamps Firebase en dates
        date: doc.data().createdAt?.toDate?.() || new Date(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
      }));
      
      // Trier côté client par date de création (plus récent en premier)
      reviews.sort((a, b) => b.createdAt - a.createdAt);
      
      console.log(`✅ ${reviews.length} avis trouvés pour l'utilisateur`);
      return reviews;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des avis utilisateur:', error);
      throw error;
    }
  }

  /**
   * Supprimer un avis
   */
  static async deleteReview(reviewId) {
    try {
      console.log('🗑️ Suppression de l\'avis:', reviewId);
      
      const reviewRef = doc(db, REVIEWS_COLLECTION, reviewId);
      await deleteDoc(reviewRef);
      
      console.log('✅ Avis supprimé avec succès');
    } catch (error) {
      console.error('❌ Erreur lors de la suppression de l\'avis:', error);
      throw error;
    }
  }

  /**
   * Supprimer tous les avis d'un utilisateur par email
   */
  static async deleteAllReviewsByEmail(userEmail) {
    try {
      console.log('🗑️ Suppression de tous les avis pour l\'email:', userEmail);
      
      const reviewsRef = collection(db, REVIEWS_COLLECTION);
      const q = query(reviewsRef, where('userEmail', '==', userEmail));
      const snapshot = await getDocs(q);
      
      console.log(`🗑️ ${snapshot.docs.length} avis trouvés à supprimer`);
      
      // Supprimer tous les avis en batch
      const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      
      console.log('✅ Tous les avis supprimés avec succès');
      return snapshot.docs.length;
    } catch (error) {
      console.error('❌ Erreur lors de la suppression des avis:', error);
      throw error;
    }
  }

  /**
   * Upload d'une image vers Firebase Storage
   */
  static async uploadImage(imageUri, path = 'reviews') {
    try {
      console.log(`🖼️ Upload de l'image: ${imageUri}`);
      
      // Mode de développement : retourner l'URI local pour voir les vraies images
      // MAIS seulement si ce n'est pas une migration (on veut forcer l'upload pour la migration)
      if (devConfig.useMockStorage && !imageUri.includes('firebase')) {
        console.log(`🖼️ Mode dev: retour de l'URI local`);
        return imageUri;
      }
      
      // Vérifier que Firebase est configuré
      if (!storage) {
        throw new Error('Firebase Storage non configuré');
      }
      
      console.log(`🖼️ Conversion de l'URI en blob...`);
      // Convertir l'URI en blob
      const response = await fetch(imageUri);
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      const blob = await response.blob();
      console.log(`🖼️ Blob créé, taille: ${blob.size} bytes`);
      
      // Créer une référence unique pour l'image
      const timestamp = Date.now();
      const filename = `${path}/${timestamp}_${Math.random().toString(36).substring(7)}.jpg`;
      const imageRef = ref(storage, filename);
      console.log(`🖼️ Référence créée: ${filename}`);
      
      // Upload du blob
      console.log(`🖼️ Upload vers Firebase Storage...`);
      const snapshot = await uploadBytes(imageRef, blob);
      console.log(`🖼️ Upload terminé, snapshot:`, snapshot);
      
      // Récupérer l'URL de téléchargement
      const downloadURL = await getDownloadURL(snapshot.ref);
      console.log(`🖼️ URL de téléchargement: ${downloadURL}`);
      
      return downloadURL;
    } catch (error) {
      console.error('❌ Erreur lors de l\'upload de l\'image:', error);
      console.error('❌ URI de l\'image:', imageUri);
      
      // Si c'est une erreur Firebase Storage, retourner l'URI local pour continuer
      if (error.code === 'storage/unknown' || error.code === 'storage/unauthorized') {
        console.log(`⚠️ Erreur Firebase Storage, retour de l'URI local`);
        return imageUri;
      }
      
      throw error;
    }
  }

  /**
   * Upload de plusieurs images
   */
  static async uploadMultipleImages(imageUris, path = 'reviews') {
    try {
      const uploadPromises = imageUris.map(uri => this.uploadImage(uri, path));
      const imageUrls = await Promise.all(uploadPromises);
      
      return imageUrls;
    } catch (error) {
      console.error('❌ Erreur lors de l\'upload des images:', error);
      throw error;
    }
  }
}

export default PlacesService; 