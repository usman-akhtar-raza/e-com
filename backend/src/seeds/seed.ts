import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { User } from '../users/entities/user.entity';
import { Category } from '../categories/entities/category.entity';
import { Brand } from '../brands/entities/brand.entity';
import { Product } from '../products/entities/product.entity';
import { ProductVariant } from '../products/entities/product-variant.entity';
import { Inventory } from '../inventory/entities/inventory.entity';
import { Address } from '../addresses/entities/address.entity';
import { Coupon } from '../coupons/entities/coupon.entity';
import { Role } from '../common/enums/role.enum';
import { ProductStatus } from '../common/enums/product-status.enum';
import { DiscountType } from '../common/enums/discount-type.enum';
import { AddressType } from '../common/enums/address-type.enum';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'ecom',
  entities: [User, Category, Brand, Product, ProductVariant, Inventory, Address, Coupon, __dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: true,
});

async function runSeed() {
  console.log('Connecting to DB...');
  await AppDataSource.initialize();
  console.log('Connected.');

  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const userRepo = queryRunner.manager.getRepository(User);
    const categoryRepo = queryRunner.manager.getRepository(Category);
    const brandRepo = queryRunner.manager.getRepository(Brand);
    const productRepo = queryRunner.manager.getRepository(Product);
    const inventoryRepo = queryRunner.manager.getRepository(Inventory);
    const addressRepo = queryRunner.manager.getRepository(Address);
    const couponRepo = queryRunner.manager.getRepository(Coupon);

    // 1. Admin & Customer Users
    const adminEmail = 'admin@example.com';
    let admin = await userRepo.findOne({ where: { email: adminEmail } });
    if (!admin) {
      admin = userRepo.create({
        email: adminEmail,
        password: await bcrypt.hash('admin123', 10),
        firstName: 'Admin',
        lastName: 'User',
        role: Role.ADMIN,
      });
      await userRepo.save(admin);
      console.log('Admin user created');
    }

    const customerEmail = 'customer@example.com';
    let customer = await userRepo.findOne({ where: { email: customerEmail } });
    if (!customer) {
      customer = userRepo.create({
        email: customerEmail,
        password: await bcrypt.hash('customer123', 10),
        firstName: 'Customer',
        lastName: 'User',
        role: Role.CUSTOMER,
      });
      await userRepo.save(customer);
      console.log('Customer user created');
    }

    // 2. Customer Address
    if (customer) {
      let addr = await addressRepo.findOne({ where: { userId: customer.id } });
      if (!addr) {
        addr = addressRepo.create({
          userId: customer.id,
          fullName: 'Customer User',
          phone: '+1234567890',
          addressLine1: '123 Main Street',
          city: 'New York',
          state: 'NY',
          postalCode: '10001',
          country: 'USA',
          addressType: AddressType.SHIPPING,
          isDefault: true,
        });
        await addressRepo.save(addr);
        console.log('Customer address seeded');
      }
    }

    // 3. Coupons
    const couponsData = [
      {
        code: 'SAVE10',
        discountType: DiscountType.PERCENTAGE,
        discountValue: 10,
        minOrderAmount: 50,
        maxDiscountAmount: 100,
        userUsageLimit: 5,
        isActive: true,
      },
      {
        code: 'FLAT50',
        discountType: DiscountType.FIXED,
        discountValue: 50,
        minOrderAmount: 200,
        userUsageLimit: 1,
        isActive: true,
      },
    ];

    for (const cData of couponsData) {
      let coupon = await couponRepo.findOne({ where: { code: cData.code } });
      if (!coupon) {
        coupon = couponRepo.create(cData);
        await couponRepo.save(coupon);
      }
    }
    console.log('Coupons seeded');

    // 4. Categories
    const categoriesData = [
      { name: 'Electronics', slug: 'electronics' },
      { name: 'Clothing', slug: 'clothing' },
      { name: 'Books', slug: 'books' },
      { name: 'Home & Garden', slug: 'home-garden' },
      { name: 'Sports', slug: 'sports' },
    ];

    const savedCategories: Category[] = [];
    for (const catData of categoriesData) {
      let cat = await categoryRepo.findOne({ where: { slug: catData.slug } });
      if (!cat) {
        cat = categoryRepo.create(catData);
        await categoryRepo.save(cat);
      }
      savedCategories.push(cat);
    }
    console.log('Categories seeded');

    // 5. Brands
    const brandsData = [
      { name: 'Apple', slug: 'apple', description: 'Innovative tech brand' },
      { name: 'Nike', slug: 'nike', description: 'Athletic footwear & apparel' },
      { name: 'Penguin', slug: 'penguin', description: 'Renowned book publisher' },
      { name: 'IKEA', slug: 'ikea', description: 'Home furnishings' },
      { name: 'Wilson', slug: 'wilson', description: 'Sports equipment brand' },
    ];

    const savedBrands: Brand[] = [];
    for (const bData of brandsData) {
      let brand = await brandRepo.findOne({ where: { slug: bData.slug } });
      if (!brand) {
        brand = brandRepo.create(bData);
        await brandRepo.save(brand);
      }
      savedBrands.push(brand);
    }
    console.log('Brands seeded');

    // 6. Products
    const productsData = [
      { name: 'Smartphone X', slug: 'smartphone-x', price: 999.99, stock: 50, sku: 'SPX-001', description: 'Latest smartphone with OLED display', categoryId: savedCategories[0].id, brandId: savedBrands[0].id, status: ProductStatus.ACTIVE },
      { name: 'Laptop Pro', slug: 'laptop-pro', price: 1499.99, stock: 30, sku: 'LTP-001', description: 'High performance laptop with M-series chip', categoryId: savedCategories[0].id, brandId: savedBrands[0].id, status: ProductStatus.ACTIVE },
      { name: 'Cotton T-Shirt', slug: 'cotton-tshirt', price: 19.99, stock: 100, sku: 'CTS-001', description: 'Comfortable 100% cotton t-shirt', categoryId: savedCategories[1].id, brandId: savedBrands[1].id, status: ProductStatus.ACTIVE },
      { name: 'Jeans Classic', slug: 'jeans-classic', price: 49.99, stock: 80, sku: 'JNC-001', description: 'Classic blue denim jeans', categoryId: savedCategories[1].id, brandId: savedBrands[1].id, status: ProductStatus.ACTIVE },
      { name: 'Sci-Fi Novel', slug: 'scifi-novel', price: 14.99, stock: 200, sku: 'SFN-001', description: 'Bestselling sci-fi space opera novel', categoryId: savedCategories[2].id, brandId: savedBrands[2].id, status: ProductStatus.ACTIVE },
      { name: 'Cookbook', slug: 'cookbook', price: 24.99, stock: 150, sku: 'CKB-001', description: '100 easy recipes for everyday cooking', categoryId: savedCategories[2].id, brandId: savedBrands[2].id, status: ProductStatus.ACTIVE },
      { name: 'Garden Hose', slug: 'garden-hose', price: 34.99, stock: 60, sku: 'GDH-001', description: 'Durable garden hose 50ft', categoryId: savedCategories[3].id, brandId: savedBrands[3].id, status: ProductStatus.ACTIVE },
      { name: 'Coffee Maker', slug: 'coffee-maker', price: 79.99, stock: 40, sku: 'CFM-001', description: 'Programmable drip coffee maker', categoryId: savedCategories[3].id, brandId: savedBrands[3].id, status: ProductStatus.ACTIVE },
      { name: 'Yoga Mat', slug: 'yoga-mat', price: 29.99, stock: 120, sku: 'YGM-001', description: 'Non-slip eco-friendly yoga mat', categoryId: savedCategories[4].id, brandId: savedBrands[4].id, status: ProductStatus.ACTIVE },
      { name: 'Tennis Racket', slug: 'tennis-racket', price: 89.99, stock: 25, sku: 'TNR-001', description: 'Professional carbon fiber tennis racket', categoryId: savedCategories[4].id, brandId: savedBrands[4].id, status: ProductStatus.ACTIVE },
    ];

    for (const prodData of productsData) {
      let prod = await productRepo.findOne({ where: { slug: prodData.slug } });
      if (!prod) {
        prod = productRepo.create(prodData);
        await productRepo.save(prod);
      }

      let inv = await inventoryRepo.findOne({ where: { productId: prod.id } });
      if (!inv) {
        inv = inventoryRepo.create({
          productId: prod.id,
          sku: prodData.sku,
          quantity: prodData.stock,
          reservedQuantity: 0,
          lowStockThreshold: 5,
        });
        await inventoryRepo.save(inv);
      }
    }
    console.log('Products & Inventory seeded');

    await queryRunner.commitTransaction();
    console.log('Seeding completed successfully!');
  } catch (err) {
    console.error('Error during seeding:', err);
    await queryRunner.rollbackTransaction();
  } finally {
    await queryRunner.release();
    await AppDataSource.destroy();
  }
}

runSeed();
