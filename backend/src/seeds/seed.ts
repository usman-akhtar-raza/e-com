import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { User } from '../users/entities/user.entity';
import { Category } from '../categories/entities/category.entity';
import { Product } from '../products/entities/product.entity';
import { Role } from '../common/enums/role.enum';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'ecom',
  entities: [User, Category, Product, __dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: true, // Will sync DB
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
    const productRepo = queryRunner.manager.getRepository(Product);

    // 1. Admin User
    const adminEmail = 'admin@example.com';
    let admin = await userRepo.findOne({ where: { email: adminEmail } });
    if (!admin) {
      admin = userRepo.create({
        email: adminEmail,
        password: await bcrypt.hash('admin123', 10),
        firstName: 'Admin',
        lastName: 'User',
        role: Role.ADMIN
      });
      await userRepo.save(admin);
      console.log('Admin user created');
    }

    // 2. Categories
    const categoriesData = [
      { name: 'Electronics', slug: 'electronics' },
      { name: 'Clothing', slug: 'clothing' },
      { name: 'Books', slug: 'books' },
      { name: 'Home & Garden', slug: 'home-garden' },
      { name: 'Sports', slug: 'sports' }
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

    // 3. Products
    const productsData = [
      { name: 'Smartphone X', slug: 'smartphone-x', price: 999.99, stock: 50, description: 'Latest smartphone', categoryId: savedCategories[0].id },
      { name: 'Laptop Pro', slug: 'laptop-pro', price: 1499.99, stock: 30, description: 'High performance laptop', categoryId: savedCategories[0].id },
      { name: 'Cotton T-Shirt', slug: 'cotton-tshirt', price: 19.99, stock: 100, description: 'Comfortable cotton t-shirt', categoryId: savedCategories[1].id },
      { name: 'Jeans Classic', slug: 'jeans-classic', price: 49.99, stock: 80, description: 'Classic blue jeans', categoryId: savedCategories[1].id },
      { name: 'Sci-Fi Novel', slug: 'scifi-novel', price: 14.99, stock: 200, description: 'Bestselling sci-fi novel', categoryId: savedCategories[2].id },
      { name: 'Cookbook', slug: 'cookbook', price: 24.99, stock: 150, description: '100 easy recipes', categoryId: savedCategories[2].id },
      { name: 'Garden Hose', slug: 'garden-hose', price: 34.99, stock: 60, description: 'Durable garden hose 50ft', categoryId: savedCategories[3].id },
      { name: 'Coffee Maker', slug: 'coffee-maker', price: 79.99, stock: 40, description: 'Programmable coffee maker', categoryId: savedCategories[3].id },
      { name: 'Yoga Mat', slug: 'yoga-mat', price: 29.99, stock: 120, description: 'Non-slip yoga mat', categoryId: savedCategories[4].id },
      { name: 'Tennis Racket', slug: 'tennis-racket', price: 89.99, stock: 25, description: 'Professional tennis racket', categoryId: savedCategories[4].id }
    ];

    for (const prodData of productsData) {
      let prod = await productRepo.findOne({ where: { slug: prodData.slug } });
      if (!prod) {
        prod = productRepo.create(prodData);
        await productRepo.save(prod);
      }
    }
    console.log('Products seeded');

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
