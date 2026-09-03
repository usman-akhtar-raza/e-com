import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { Category } from '../../categories/entities/category.entity';
import { Brand } from '../../brands/entities/brand.entity';
import { ProductVariant } from './product-variant.entity';
import { ProductImage } from './product-image.entity';
import { Review } from '../../reviews/entities/review.entity';
import { ProductStatus } from '../../common/enums/product-status.enum';

@Entity('products')
@Index(['slug'])
@Index(['categoryId'])
@Index(['brandId'])
@Index(['status'])
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text', nullable: true })
  shortDescription?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  compareAtPrice?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  costPrice?: number;

  @Column({ nullable: true })
  sku?: string;

  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({ type: 'enum', enum: ProductStatus, default: ProductStatus.ACTIVE })
  status: ProductStatus;

  @Column({ type: 'simple-array', nullable: true })
  images?: string[];

  @Column({ nullable: true })
  brandId?: string;

  @ManyToOne(() => Brand, brand => brand.products, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'brandId' })
  brand?: Brand;

  @Column()
  categoryId: string;

  @ManyToOne(() => Category, category => category.products)
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @OneToMany(() => ProductVariant, variant => variant.product, { cascade: true })
  variants: ProductVariant[];

  @OneToMany(() => ProductImage, image => image.product, { cascade: true })
  productImages: ProductImage[];

  @OneToMany(() => Review, review => review.product)
  reviews: Review[];

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
