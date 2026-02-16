import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // 1. Create Restaurant
    const restaurant = await prisma.restaurant.upsert({
        where: { slug: 'kofteci-ramiz' },
        update: {},
        create: {
            name: 'Köfteci Ramiz',
            slug: 'kofteci-ramiz',
            phone: '+90 555 123 4567',
            address: 'Kadıköy, İstanbul',
            isActive: true,
            subscriptionPlan: 'pro',
        },
    });

    console.log('✅ Restaurant created:', restaurant.name);

    // 2. Create Admin User
    const passwordHash = await bcrypt.hash('12345', 10);
    const adminUser = await prisma.user.upsert({
        where: { id: 'admin-user-id' },
        update: {},
        create: {
            id: 'admin-user-id',
            restaurantId: restaurant.id,
            email: 'admin@kofteci.com',
            passwordHash,
            role: 'admin',
            fullName: 'Admin Kullanıcı',
            isActive: true,
        },
    });

    console.log('✅ Admin user created:', adminUser.email);

    // 3. Create Categories
    const categories = await Promise.all([
        prisma.category.create({
            data: {
                restaurantId: restaurant.id,
                name: 'İçecekler',
                icon: '☕',
                sortOrder: 1,
            },
        }),
        prisma.category.create({
            data: {
                restaurantId: restaurant.id,
                name: 'Kahvaltı',
                icon: '🍳',
                sortOrder: 2,
            },
        }),
        prisma.category.create({
            data: {
                restaurantId: restaurant.id,
                name: 'Ana Yemek',
                icon: '🍽️',
                sortOrder: 3,
            },
        }),
    ]);

    console.log('✅ Categories created:', categories.length);

    // 4. Create Products
    const products = await Promise.all([
        // İçecekler
        prisma.product.create({
            data: {
                restaurantId: restaurant.id,
                categoryId: categories[0].id,
                name: 'Türk Kahvesi',
                description: 'Geleneksel Türk kahvesi',
                price: 45.00,
                isAvailable: true,
            },
        }),
        prisma.product.create({
            data: {
                restaurantId: restaurant.id,
                categoryId: categories[0].id,
                name: 'Çay',
                description: 'Demli çay',
                price: 15.00,
                isAvailable: true,
            },
        }),
        prisma.product.create({
            data: {
                restaurantId: restaurant.id,
                categoryId: categories[0].id,
                name: 'Ayran',
                description: 'Ev yapımı ayran',
                price: 20.00,
                isAvailable: true,
            },
        }),
        // Kahvaltı
        prisma.product.create({
            data: {
                restaurantId: restaurant.id,
                categoryId: categories[1].id,
                name: 'Serpme Kahvaltı',
                description: '2 kişilik serpme kahvaltı',
                price: 350.00,
                isAvailable: true,
            },
        }),
        prisma.product.create({
            data: {
                restaurantId: restaurant.id,
                categoryId: categories[1].id,
                name: 'Menemen',
                description: 'Domates, biber, yumurta',
                price: 85.00,
                isAvailable: true,
            },
        }),
        // Ana Yemek
        prisma.product.create({
            data: {
                restaurantId: restaurant.id,
                categoryId: categories[2].id,
                name: 'İnegöl Köfte',
                description: 'Porsiyon köfte, pilav, salata',
                price: 180.00,
                isAvailable: true,
            },
        }),
        prisma.product.create({
            data: {
                restaurantId: restaurant.id,
                categoryId: categories[2].id,
                name: 'Adana Kebap',
                description: 'Acılı kebap, pilav, salata',
                price: 220.00,
                isAvailable: true,
            },
        }),
        prisma.product.create({
            data: {
                restaurantId: restaurant.id,
                categoryId: categories[2].id,
                name: 'Tavuk Şiş',
                description: 'Marineli tavuk, pilav, salata',
                price: 170.00,
                isAvailable: true,
            },
        }),
    ]);

    console.log('✅ Products created:', products.length);

    // 5. Create Tables
    const tables = await Promise.all([
        prisma.table.create({
            data: {
                restaurantId: restaurant.id,
                tableNumber: 1,
                isActive: true,
            },
        }),
        prisma.table.create({
            data: {
                restaurantId: restaurant.id,
                tableNumber: 2,
                isActive: true,
            },
        }),
        prisma.table.create({
            data: {
                restaurantId: restaurant.id,
                tableNumber: 3,
                isActive: true,
            },
        }),
        prisma.table.create({
            data: {
                restaurantId: restaurant.id,
                tableNumber: 4,
                isActive: true,
            },
        }),
        prisma.table.create({
            data: {
                restaurantId: restaurant.id,
                tableNumber: 5,
                isActive: true,
            },
        }),
    ]);

    console.log('✅ Tables created:', tables.length);

    console.log('');
    console.log('🎉 Seeding completed!');
    console.log('');
    console.log('📝 Login credentials:');
    console.log('   Email: admin@kofteci.com');
    console.log('   Password: 12345');
    console.log('   Restaurant Slug: kofteci-ramiz');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
