import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { UpdateReviewStatusDto } from './dto/update-review-status.dto';
import { ReviewStatus } from '../common/enums/review-status.enum';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';

export interface ProductReviewSummary {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
  ) {}

  async create(userId: string, createReviewDto: CreateReviewDto): Promise<Review> {
    const existing = await this.reviewRepository.findOne({
      where: { userId, productId: createReviewDto.productId },
    });

    if (existing) {
      throw new ConflictException('You have already submitted a review for this product');
    }

    // Check if user has purchased this product (Verified Purchase)
    const purchasedItem = await this.orderItemRepository.findOne({
      where: { productId: createReviewDto.productId, order: { userId } },
      relations: { order: true },
    });

    const isVerifiedPurchase = !!purchasedItem;

    const review = this.reviewRepository.create({
      ...createReviewDto,
      userId,
      isVerifiedPurchase,
      status: ReviewStatus.APPROVED,
    });

    return this.reviewRepository.save(review);
  }

  async findByProduct(productId: string, paginationQuery: PaginationQueryDto): Promise<PaginatedResult<Review>> {
    const { page = 1, limit = 10 } = paginationQuery;
    const [data, total] = await this.reviewRepository.findAndCount({
      where: { productId, status: ReviewStatus.APPROVED },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: { user: true },
    });

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getProductReviewSummary(productId: string): Promise<ProductReviewSummary> {
    const reviews = await this.reviewRepository.find({
      where: { productId, status: ReviewStatus.APPROVED },
    });

    const totalReviews = reviews.length;
    if (totalReviews === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };
    }

    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    const averageRating = Number((sum / totalReviews).toFixed(1));

    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach(r => {
      if (r.rating >= 1 && r.rating <= 5) {
        ratingDistribution[r.rating as 1 | 2 | 3 | 4 | 5] += 1;
      }
    });

    return {
      averageRating,
      totalReviews,
      ratingDistribution,
    };
  }

  async findAll(paginationQuery: PaginationQueryDto, status?: ReviewStatus): Promise<PaginatedResult<Review>> {
    const { page = 1, limit = 10 } = paginationQuery;
    const where: any = {};
    if (status) {
      where.status = status;
    }

    const [data, total] = await this.reviewRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: { user: true, product: true },
    });

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string): Promise<Review> {
    const review = await this.reviewRepository.findOne({
      where: { id },
      relations: { user: true, product: true },
    });

    if (!review) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }

    return review;
  }

  async update(id: string, userId: string, updateReviewDto: UpdateReviewDto): Promise<Review> {
    const review = await this.findOne(id);
    if (review.userId !== userId) {
      throw new ForbiddenException('You can only update your own review');
    }

    Object.assign(review, updateReviewDto);
    return this.reviewRepository.save(review);
  }

  async updateStatus(id: string, updateReviewStatusDto: UpdateReviewStatusDto): Promise<Review> {
    const review = await this.findOne(id);
    review.status = updateReviewStatusDto.status;
    return this.reviewRepository.save(review);
  }

  async remove(id: string, userId: string, isAdmin: boolean): Promise<void> {
    const review = await this.findOne(id);
    if (review.userId !== userId && !isAdmin) {
      throw new ForbiddenException('You can only delete your own review');
    }
    await this.reviewRepository.remove(review);
  }

  async getAverageRating(productId: string): Promise<number> {
    const result = await this.reviewRepository
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'avg')
      .where('review.productId = :productId AND review.status = :status', { productId, status: ReviewStatus.APPROVED })
      .getRawOne();

    return parseFloat(result.avg || '0');
  }
}
