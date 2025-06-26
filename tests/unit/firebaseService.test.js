import { PlacesService, ReviewsService } from '../../services/firebaseService';

// Mock Firebase
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(),
  getApps: jest.fn(() => [])
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(),
  getDocs: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn()
}));

// Mock l'export storage de firebaseService et firebase/storage AVANT tout import
jest.mock('../../services/firebaseService', () => {
  const original = jest.requireActual('../../services/firebaseService');
  return {
    ...original,
    storage: { __mock: true },
  };
});

jest.mock('firebase/storage', () => ({
  getStorage: jest.fn(() => ({ __mock: true })),
  ref: jest.fn(),
  uploadBytes: jest.fn(),
  getDownloadURL: jest.fn()
}));

// Mock des services dépendants
jest.mock('../../services/authService', () => ({
  AuthService: {
    incrementPlacesAdded: jest.fn(),
    incrementReviewsAdded: jest.fn(),
    getCurrentUser: jest.fn(() => Promise.resolve({ email: 'test@example.com' }))
  }
}));

jest.mock('../../services/configService', () => ({
  __esModule: true,
  default: {
    get: jest.fn()
  }
}));

// Mock fetch et blob pour les tests d'upload
global.fetch = jest.fn();
global.Blob = class MockBlob {
  constructor() {
    this.size = 1024;
  }
};

// Mock du mode développement
jest.mock('../../firebase.config', () => ({
  firebaseConfig: {},
  devConfig: { useMockStorage: false }
}));

describe('PlacesService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllPlaces', () => {
    it('devrait récupérer tous les lieux avec succès', async () => {
      const mockDocs = [
        { id: '1', data: () => ({ name: 'Place 1' }) },
        { id: '2', data: () => ({ name: 'Place 2' }) }
      ];
      const mockSnapshot = { docs: mockDocs };
      
      const { getDocs, collection } = require('firebase/firestore');
      getDocs.mockResolvedValue(mockSnapshot);
      collection.mockReturnValue('placesRef');

      const result = await PlacesService.getAllPlaces();
      
      expect(collection).toHaveBeenCalled();
      expect(getDocs).toHaveBeenCalledWith('placesRef');
      expect(result).toEqual([
        { id: '1', name: 'Place 1' },
        { id: '2', name: 'Place 2' }
      ]);
    });

    it('devrait gérer les erreurs lors de la récupération', async () => {
      const { getDocs, collection } = require('firebase/firestore');
      const error = new Error('Erreur Firebase');
      getDocs.mockRejectedValue(error);
      collection.mockReturnValue('placesRef');

      await expect(PlacesService.getAllPlaces()).rejects.toThrow('Erreur Firebase');
    });
  });

  describe('getPlacesByCategory', () => {
    it('devrait récupérer les lieux par catégorie', async () => {
      const mockDocs = [{ id: '1', data: () => ({ name: 'Restaurant', type: 'restaurant' }) }];
      const mockSnapshot = { docs: mockDocs };
      
      const { getDocs, collection, query, where } = require('firebase/firestore');
      getDocs.mockResolvedValue(mockSnapshot);
      collection.mockReturnValue('placesRef');
      query.mockReturnValue('queryRef');
      where.mockReturnValue('whereRef');

      const result = await PlacesService.getPlacesByCategory('restaurant');
      
      expect(collection).toHaveBeenCalled();
      expect(where).toHaveBeenCalledWith('type', '==', 'restaurant');
      expect(query).toHaveBeenCalled();
      expect(result).toEqual([{ id: '1', name: 'Restaurant', type: 'restaurant' }]);
    });
  });

  describe('getTopRatedPlaces', () => {
    it('devrait récupérer les lieux les mieux notés', async () => {
      const mockDocs = [{ id: '1', data: () => ({ name: 'Top Place', rating: 5 }) }];
      const mockSnapshot = { docs: mockDocs };
      
      const { getDocs, collection, query, orderBy, limit } = require('firebase/firestore');
      getDocs.mockResolvedValue(mockSnapshot);
      collection.mockReturnValue('placesRef');
      query.mockReturnValue('queryRef');
      orderBy.mockReturnValue('orderByRef');
      limit.mockReturnValue('limitRef');

      const result = await PlacesService.getTopRatedPlaces(3);
      
      expect(orderBy).toHaveBeenCalledWith('rating', 'desc');
      expect(limit).toHaveBeenCalledWith(3);
      expect(result).toEqual([{ id: '1', name: 'Top Place', rating: 5 }]);
    });
  });

  describe('getPlaceById', () => {
    it('devrait récupérer un lieu par ID avec succès', async () => {
      const mockDoc = { id: '1', data: () => ({ name: 'Place 1' }) };
      const mockSnapshot = { exists: () => true, id: '1', data: () => ({ name: 'Place 1' }) };
      
      const { getDoc, doc } = require('firebase/firestore');
      getDoc.mockResolvedValue(mockSnapshot);
      doc.mockReturnValue('placeRef');

      const result = await PlacesService.getPlaceById('1');
      
      expect(doc).toHaveBeenCalled();
      expect(getDoc).toHaveBeenCalledWith('placeRef');
      expect(result).toEqual({ id: '1', name: 'Place 1' });
    });

    it('devrait lancer une erreur si le lieu n\'existe pas', async () => {
      const mockSnapshot = { exists: () => false };
      
      const { getDoc, doc } = require('firebase/firestore');
      getDoc.mockResolvedValue(mockSnapshot);
      doc.mockReturnValue('placeRef');

      await expect(PlacesService.getPlaceById('999')).rejects.toThrow('Lieu non trouvé');
    });
  });

  describe('addPlace', () => {
    it('devrait ajouter un lieu avec succès', async () => {
      const placeData = { name: 'New Place', address: '123 Street' };
      const mockDocRef = { id: 'newId' };
      
      const { addDoc, collection } = require('firebase/firestore');
      addDoc.mockResolvedValue(mockDocRef);
      collection.mockReturnValue('placesRef');

      const { AuthService } = require('../../services/authService');
      AuthService.incrementPlacesAdded.mockResolvedValue();

      const result = await PlacesService.addPlace(placeData, 'user123');
      
      expect(addDoc).toHaveBeenCalledWith('placesRef', expect.objectContaining({
        name: 'New Place',
        address: '123 Street',
        addedBy: 'user123'
      }));
      expect(AuthService.incrementPlacesAdded).toHaveBeenCalledWith('user123');
      expect(result).toBe('newId');
    });

    it('devrait ajouter un lieu anonyme sans incrémenter le compteur', async () => {
      const placeData = { name: 'Anonymous Place' };
      const mockDocRef = { id: 'newId' };
      
      const { addDoc, collection } = require('firebase/firestore');
      addDoc.mockResolvedValue(mockDocRef);
      collection.mockReturnValue('placesRef');

      const { AuthService } = require('../../services/authService');

      const result = await PlacesService.addPlace(placeData);
      
      expect(addDoc).toHaveBeenCalledWith('placesRef', expect.objectContaining({
        addedBy: 'anonymous'
      }));
      expect(AuthService.incrementPlacesAdded).not.toHaveBeenCalled();
      expect(result).toBe('newId');
    });
  });

  describe('updatePlace', () => {
    it('devrait mettre à jour un lieu avec succès', async () => {
      const updateData = { name: 'Updated Place' };
      
      const { updateDoc, doc } = require('firebase/firestore');
      updateDoc.mockResolvedValue();
      doc.mockReturnValue('placeRef');

      await PlacesService.updatePlace('1', updateData);
      
      expect(doc).toHaveBeenCalled();
      expect(updateDoc).toHaveBeenCalledWith('placeRef', expect.objectContaining({
        name: 'Updated Place',
        updatedAt: expect.any(Date)
      }));
    });
  });

  describe('deletePlace', () => {
    it('devrait supprimer un lieu avec succès', async () => {
      const { deleteDoc, doc } = require('firebase/firestore');
      deleteDoc.mockResolvedValue();
      doc.mockReturnValue('placeRef');

      await PlacesService.deletePlace('1');
      
      expect(doc).toHaveBeenCalled();
      expect(deleteDoc).toHaveBeenCalledWith('placeRef');
    });
  });

  describe('searchPlacesByName', () => {
    it('devrait rechercher des lieux par nom', async () => {
      const mockDocs = [
        { id: '1', data: () => ({ name: 'Restaurant ABC', address: '123 Main St' }) },
        { id: '2', data: () => ({ name: 'Cafe XYZ', address: '456 Oak Ave' }) }
      ];
      const mockSnapshot = { docs: mockDocs };
      
      const { getDocs, collection } = require('firebase/firestore');
      getDocs.mockResolvedValue(mockSnapshot);
      collection.mockReturnValue('placesRef');

      const result = await PlacesService.searchPlacesByName('restaurant');
      
      expect(result).toEqual([{ id: '1', name: 'Restaurant ABC', address: '123 Main St' }]);
    });

    it('devrait rechercher par adresse aussi', async () => {
      const mockDocs = [
        { id: '1', data: () => ({ name: 'Place 1', address: 'Main Street' }) }
      ];
      const mockSnapshot = { docs: mockDocs };
      
      const { getDocs, collection } = require('firebase/firestore');
      getDocs.mockResolvedValue(mockSnapshot);
      collection.mockReturnValue('placesRef');

      const result = await PlacesService.searchPlacesByName('main');
      
      expect(result).toEqual([{ id: '1', name: 'Place 1', address: 'Main Street' }]);
    });
  });
});

describe('ReviewsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('addReview', () => {
    it('devrait ajouter une review avec succès', async () => {
      const reviewData = { text: 'Great place!', rating: 5 };
      const mockDocRef = { id: 'reviewId' };
      
      const { addDoc, collection } = require('firebase/firestore');
      addDoc.mockResolvedValue(mockDocRef);
      collection.mockReturnValue('reviewsRef');

      const { AuthService } = require('../../services/authService');
      AuthService.getCurrentUser.mockResolvedValue({ email: 'test@example.com' });
      AuthService.incrementReviewsAdded.mockResolvedValue();

      const result = await ReviewsService.addReview(reviewData, 'user123');
      
      const callArgs = addDoc.mock.calls[0][1];
      expect(callArgs).toEqual(expect.objectContaining({
        text: 'Great place!',
        rating: 5,
        userEmail: 'test@example.com',
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        addedBy: 'user123'
      }));
      expect(result).toBe('reviewId');
    });
  });

  describe('getReviewsByPlaceId', () => {
    it('devrait récupérer les reviews d\'un lieu', async () => {
      const mockDocs = [
        { id: '1', data: () => ({ text: 'Review 1', rating: 4 }) },
        { id: '2', data: () => ({ text: 'Review 2', rating: 5 }) }
      ];
      const mockSnapshot = { docs: mockDocs };
      
      const { getDocs, collection, query, where } = require('firebase/firestore');
      getDocs.mockResolvedValue(mockSnapshot);
      collection.mockReturnValue('reviewsRef');
      query.mockReturnValue('queryRef');
      where.mockReturnValue('whereRef');

      const result = await ReviewsService.getReviewsByPlaceId('place123');
      
      expect(where).toHaveBeenCalledWith('placeId', '==', 'place123');
      expect(result).toEqual([
        { id: '1', text: 'Review 1', rating: 4 },
        { id: '2', text: 'Review 2', rating: 5 }
      ]);
    });
  });

  describe('getReviewsByUserId', () => {
    it('devrait récupérer les reviews d\'un utilisateur', async () => {
      const mockDocs = [{ id: '1', data: () => ({ text: 'My review', userId: 'user123', userEmail: 'test@example.com', createdAt: { toDate: () => new Date() } }) }];
      const mockSnapshot = { docs: mockDocs };
      
      const { getDocs, collection, query, where } = require('firebase/firestore');
      getDocs.mockResolvedValue(mockSnapshot);
      collection.mockReturnValue('reviewsRef');
      query.mockReturnValue('queryRef');
      where.mockReturnValue('whereRef');

      const { AuthService } = require('../../services/authService');
      AuthService.getCurrentUser.mockResolvedValue({ email: 'test@example.com' });

      const result = await ReviewsService.getReviewsByUserId('user123');
      
      expect(where).toHaveBeenCalledWith('userEmail', '==', 'test@example.com');
      expect(result[0]).toEqual(expect.objectContaining({ id: '1', text: 'My review', userId: 'user123', userEmail: 'test@example.com' }));
    });
  });

  describe('deleteReview', () => {
    it('devrait supprimer une review avec succès', async () => {
      const { deleteDoc, doc } = require('firebase/firestore');
      deleteDoc.mockResolvedValue();
      doc.mockReturnValue('reviewRef');

      await ReviewsService.deleteReview('review123');
      
      expect(doc).toHaveBeenCalled();
      expect(deleteDoc).toHaveBeenCalledWith('reviewRef');
    });
  });

  describe('uploadImage', () => {
    it('devrait uploader une image avec succès', async () => {
      const mockRef = { fullPath: 'reviews/image.jpg' };
      const mockSnapshot = { ref: mockRef };
      const mockDownloadURL = 'https://example.com/image.jpg';
      
      // Mock fetch pour simuler la conversion URI -> blob
      global.fetch.mockResolvedValue({
        ok: true,
        blob: () => Promise.resolve(new global.Blob())
      });
      
      const { ref, uploadBytes, getDownloadURL, getStorage } = require('firebase/storage');
      ref.mockReturnValue(mockRef);
      uploadBytes.mockResolvedValue(mockSnapshot);
      getDownloadURL.mockResolvedValue(mockDownloadURL);
      getStorage.mockReturnValue({});

      const result = await ReviewsService.uploadImage('file://image.jpg');
      
      expect(global.fetch).toHaveBeenCalledWith('file://image.jpg');
      expect(ref).toHaveBeenCalled();
      expect(uploadBytes).toHaveBeenCalled();
      expect(getDownloadURL).toHaveBeenCalledWith(mockRef);
      expect(result).toBe('https://example.com/image.jpg');
    });
  });

  describe('uploadMultipleImages', () => {
    it('devrait uploader plusieurs images avec succès', async () => {
      const mockRef = { fullPath: 'reviews/image.jpg' };
      const mockSnapshot = { ref: mockRef };
      const mockDownloadURL = 'https://example.com/image.jpg';
      
      // Mock fetch pour simuler la conversion URI -> blob
      global.fetch.mockResolvedValue({
        ok: true,
        blob: () => Promise.resolve(new global.Blob())
      });
      
      const { ref, uploadBytes, getDownloadURL, getStorage } = require('firebase/storage');
      ref.mockReturnValue(mockRef);
      uploadBytes.mockResolvedValue(mockSnapshot);
      getDownloadURL.mockResolvedValue(mockDownloadURL);
      getStorage.mockReturnValue({});

      const imageUris = ['file://image1.jpg', 'file://image2.jpg'];
      const result = await ReviewsService.uploadMultipleImages(imageUris);
      
      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(uploadBytes).toHaveBeenCalledTimes(2);
      expect(getDownloadURL).toHaveBeenCalledTimes(2);
      expect(result).toEqual([
        'https://example.com/image.jpg',
        'https://example.com/image.jpg'
      ]);
    });
  });
}); 