import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { UpdateReviewStatusDto } from './dto/update-review-status.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { Role } from '../common/enums/role.enum';
import { ReviewStatus } from '../common/enums/review-status.enum';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('reviews')
@Controller()
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post('reviews')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create review for product (Customer)' })
  create(@CurrentUser() user: User, @Body() createReviewDto: CreateReviewDto) {
    return this.reviewsService.create(user.id, createReviewDto);
  }

  @Get('products/:productId/reviews')
  @ApiOperation({ summary: 'Get product reviews' })
  findByProduct(@Param('productId') productId: string, @Query() paginationQuery: PaginationQueryDto) {
    return this.reviewsService.findByProduct(productId, paginationQuery);
  }

  @Get('reviews/product/:productId')
  @ApiOperation({ summary: 'Get product reviews (alias)' })
  findByProductAlias(@Param('productId') productId: string, @Query() paginationQuery: PaginationQueryDto) {
    return this.reviewsService.findByProduct(productId, paginationQuery);
  }

  @Get('reviews/product/:productId/summary')
  @ApiOperation({ summary: 'Get product review summary and rating distribution' })
  getProductReviewSummary(@Param('productId') productId: string) {
    return this.reviewsService.getProductReviewSummary(productId);
  }

  @Get('reviews')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all reviews with filtering (Admin)' })
  findAll(@Query() paginationQuery: PaginationQueryDto, @Query('status') status?: ReviewStatus) {
    return this.reviewsService.findAll(paginationQuery, status);
  }

  @Get('reviews/:id')
  @ApiOperation({ summary: 'Get review by ID' })
  findOne(@Param('id') id: string) {
    return this.reviewsService.findOne(id);
  }

  @Patch('reviews/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update review (Customer)' })
  update(@Param('id') id: string, @CurrentUser() user: User, @Body() updateReviewDto: UpdateReviewDto) {
    return this.reviewsService.update(id, user.id, updateReviewDto);
  }

  @Patch('reviews/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update review moderation status (Admin)' })
  updateStatus(@Param('id') id: string, @Body() updateReviewStatusDto: UpdateReviewStatusDto) {
    return this.reviewsService.updateStatus(id, updateReviewStatusDto);
  }

  @Delete('reviews/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete review (Customer or Admin)' })
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.reviewsService.remove(id, user.id, user.role === Role.ADMIN);
  }
}
