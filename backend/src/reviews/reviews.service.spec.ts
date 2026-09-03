import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsService } from './reviews.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { ReviewStatus } from '../common/enums/review-status.enum';
import { Repository } from 'typeorm';
import { NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';

describe('ReviewsService', () => {
  let service: ReviewsService;
  let reviewRepo: jest.Mocked<Partial<Repository<Review>>>;
  let orderItemRepo: jest.Mocked<Partial<Repository<OrderItem>>>;

  const mockReview: Review = {
    id: 'review-uuid-1',
    userId: 'user-uuid-1',
    user: {} as any,
    productId: 'prod-uuid-1',
    product: {} as any,
    rating: 5,
    title: 'Great product',
    comment: 'Very satisfied with this purchase',
    isVerifiedPurchase: true,
    status: ReviewStatus.APPROVED,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    reviewRepo = {
      find: jest.fn().mockResolvedValue([mockReview]),
      findOne: jest.fn().mockResolvedValue(mockReview),
      findAndCount: jest.fn().mockResolvedValue([[mockReview], 1]),
      create: jest.fn().mockImplementation(dto => ({ id: 'review-uuid-1', ...dto })),
      save: jest.fn().mockImplementation(r => Promise.resolve(r)),
      remove: jest.fn().mockResolvedValue(undefined),
      createQueryBuilder: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ avg: '4.8' }),
      }),
    };

    orderItemRepo = {
      findOne: jest.fn().mockResolvedValue({ id: 'item-1' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewsService,
        { provide: getRepositoryToken(Review), useValue: reviewRepo },
        { provide: getRepositoryToken(OrderItem), useValue: orderItemRepo },
      ],
    }).compile();

    service = module.get<ReviewsService>(ReviewsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create review and set isVerifiedPurchase = true when user has purchased item', async () => {
      (reviewRepo.findOne as jest.Mock).mockResolvedValue(null);
      const dto = { productId: 'prod-uuid-1', rating: 5, title: 'Awesome', comment: 'Loved it' };
      const review = await service.create('user-uuid-1', dto);
      expect(review).toBeDefined();
      expect(reviewRepo.save).toHaveBeenCalledWith(expect.objectContaining({ isVerifiedPurchase: true }));
    });

    it('should throw ConflictException if user has already reviewed product', async () => {
      (reviewRepo.findOne as jest.Mock).mockResolvedValue(mockReview);
      const dto = { productId: 'prod-uuid-1', rating: 4, comment: 'Good' };
      await expect(service.create('user-uuid-1', dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('getProductReviewSummary', () => {
    it('should return review summary and star distribution', async () => {
      const summary = await service.getProductReviewSummary('prod-uuid-1');
      expect(summary.totalReviews).toEqual(1);
      expect(summary.averageRating).toEqual(5.0);
      expect(summary.ratingDistribution[5]).toEqual(1);
    });
  });

  describe('update', () => {
    it('should update review when user owns it', async () => {
      const updated = await service.update('review-uuid-1', 'user-uuid-1', { rating: 4, comment: 'Updated comment' });
      expect(reviewRepo.save).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if user tries to update another user review', async () => {
      await expect(service.update('review-uuid-1', 'other-user', { rating: 4 })).rejects.toThrow(ForbiddenException);
    });
  });

  describe('updateStatus', () => {
    it('should update review status (Admin)', async () => {
      const res = await service.updateStatus('review-uuid-1', { status: ReviewStatus.REJECTED });
      expect(res.status).toEqual(ReviewStatus.REJECTED);
    });
  });
});
