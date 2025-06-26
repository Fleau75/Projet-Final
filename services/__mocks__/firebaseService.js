module.exports = {
  ReviewsService: {
    getReviewsByUserId: jest.fn().mockResolvedValue([]),
    addReview: jest.fn().mockResolvedValue('new-review-id'),
    deleteReview: jest.fn().mockResolvedValue(),
    uploadImage: jest.fn().mockResolvedValue('new-image-url')
  },
  AuthService: {
    getUserStatsByEmail: jest.fn().mockResolvedValue({}),
    updateUserVerificationStatusByEmail: jest.fn().mockResolvedValue()
  }
}; 