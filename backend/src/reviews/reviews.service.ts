import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review) private reviewRepository: Repository<Review>,
  ) {}

  async create(userId: string, createReviewDto: CreateReviewDto): Promise<Review> {
    const existing = await this.reviewRepository.findOne({ 
      where: { userId, productId: createReviewDto.productId } 
    });
    
    if (existing) {
      throw new ConflictException('You have already reviewed this product');
    }

    const review = this.reviewRepository.create({ ...createReviewDto, userId });
    return this.reviewRepository.save(review);
  }

  async findByProduct(productId: string, paginationQuery: PaginationQueryDto): Promise<PaginatedResult<Review>> {
    const { page = 1, limit = 10 } = paginationQuery;
    const [data, total] = await this.reviewRepository.findAndCount({
      where: { productId },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: { user: true }
    });

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string): Promise<Review> {
    const review = await this.reviewRepository.findOne({ where: { id }, relations: { user: true, product: true } });
    if (!review) throw new NotFoundException('Review not found');
    return review;
  }

  async update(id: string, userId: string, updateReviewDto: UpdateReviewDto): Promise<Review> {
    const review = await this.findOne(id);
    if (review.userId !== userId) {
      throw new ConflictException('You can only update your own review');
    }
    Object.assign(review, updateReviewDto);
    return this.reviewRepository.save(review);
  }

  async remove(id: string, userId: string, isAdmin: boolean): Promise<void> {
    const review = await this.findOne(id);
    if (review.userId !== userId && !isAdmin) {
      throw new ConflictException('You can only delete your own review');
    }
    await this.reviewRepository.remove(review);
  }

  async getAverageRating(productId: string): Promise<number> {
    const result = await this.reviewRepository
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'avg')
      .where('review.productId = :productId', { productId })
      .getRawOne();
      
    return parseFloat(result.avg || '0');
  }
}
