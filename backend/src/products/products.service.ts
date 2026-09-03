import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { ProductImage } from './entities/product-image.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductFilterDto } from './dto/product-filter.dto';
import { CreateVariantDto } from './dto/create-variant.dto';
import { CreateImageDto } from './dto/create-image.dto';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';
import { ProductStatus } from '../common/enums/product-status.enum';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductVariant)
    private readonly variantRepository: Repository<ProductVariant>,
    @InjectRepository(ProductImage)
    private readonly imageRepository: Repository<ProductImage>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const existing = await this.productRepository.findOne({ where: { slug: createProductDto.slug } });
    if (existing) {
      throw new ConflictException('Product with this slug already exists');
    }

    const { variants, productImages, ...productData } = createProductDto;
    const product = this.productRepository.create(productData);
    const savedProduct = await this.productRepository.save(product);

    if (variants && variants.length > 0) {
      const variantEntities = variants.map(v =>
        this.variantRepository.create({
          ...v,
          productId: savedProduct.id,
        })
      );
      await this.variantRepository.save(variantEntities);
    }

    if (productImages && productImages.length > 0) {
      const imageEntities = productImages.map(img =>
        this.imageRepository.create({
          ...img,
          productId: savedProduct.id,
        })
      );
      await this.imageRepository.save(imageEntities);
    }

    return this.findOne(savedProduct.id);
  }

  async findAll(filterDto: ProductFilterDto): Promise<PaginatedResult<Product>> {
    const {
      page = 1,
      limit = 10,
      category,
      categoryId,
      brand,
      brandId,
      minPrice,
      maxPrice,
      status,
      availability,
      search,
      sortBy = 'newest',
      sortOrder,
    } = filterDto;

    const query = this.productRepository.createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.brand', 'brand')
      .leftJoinAndSelect('product.variants', 'variants')
      .leftJoinAndSelect('product.productImages', 'productImages');

    // Status filter
    if (status) {
      query.andWhere('product.status = :status', { status });
    } else {
      query.andWhere('product.status = :activeStatus', { activeStatus: ProductStatus.ACTIVE });
    }

    query.andWhere('product.isActive = :isActive', { isActive: true });

    // Category filter (by ID or Slug)
    const targetCategory = category || categoryId;
    if (targetCategory) {
      query.andWhere('(product.categoryId = :targetCategory OR category.slug = :targetCategory)', { targetCategory });
    }

    // Brand filter (by ID or Slug)
    const targetBrand = brand || brandId;
    if (targetBrand) {
      query.andWhere('(product.brandId = :targetBrand OR brand.slug = :targetBrand)', { targetBrand });
    }

    // Price range
    if (minPrice !== undefined) {
      query.andWhere('product.price >= :minPrice', { minPrice });
    }
    if (maxPrice !== undefined) {
      query.andWhere('product.price <= :maxPrice', { maxPrice });
    }

    // Availability
    if (availability) {
      query.andWhere('product.stock > 0');
    }

    // Server-side multi-field Search (name, SKU, description, category name, brand name)
    if (search) {
      const searchTerm = `%${search}%`;
      query.andWhere(
        '(product.name ILIKE :search OR product.description ILIKE :search OR product.sku ILIKE :search OR category.name ILIKE :search OR brand.name ILIKE :search)',
        { search: searchTerm },
      );
    }

    // Sorting
    switch (sortBy) {
      case 'price_asc':
        query.orderBy('product.price', 'ASC');
        break;
      case 'price_desc':
        query.orderBy('product.price', 'DESC');
        break;
      case 'oldest':
        query.orderBy('product.createdAt', 'ASC');
        break;
      case 'newest':
      default:
        const order = sortOrder ? sortOrder : 'DESC';
        query.orderBy('product.createdAt', order);
        break;
    }

    query.skip((page - 1) * limit).take(limit);

    const [data, total] = await query.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: {
        category: true,
        brand: true,
        variants: true,
        productImages: true,
        reviews: { user: true },
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async findBySlug(slug: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { slug },
      relations: {
        category: true,
        brand: true,
        variants: true,
        productImages: true,
        reviews: { user: true },
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with slug ${slug} not found`);
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);
    const { variants, productImages, ...updateData } = updateProductDto;

    Object.assign(product, updateData);
    await this.productRepository.save(product);

    return this.findOne(id);
  }

  async addVariant(productId: string, createVariantDto: CreateVariantDto): Promise<ProductVariant> {
    await this.findOne(productId);
    const variant = this.variantRepository.create({
      ...createVariantDto,
      productId,
    });
    return this.variantRepository.save(variant);
  }

  async addImage(productId: string, createImageDto: CreateImageDto): Promise<ProductImage> {
    await this.findOne(productId);
    const image = this.imageRepository.create({
      ...createImageDto,
      productId,
    });
    return this.imageRepository.save(image);
  }

  async updateStock(id: string, quantity: number): Promise<Product> {
    const product = await this.findOne(id);
    if (product.stock + quantity < 0) {
      throw new ConflictException('Insufficient stock');
    }
    product.stock += quantity;
    return this.productRepository.save(product);
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
  }
}
