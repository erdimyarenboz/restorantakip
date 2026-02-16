import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import { config } from '../config/env';

const router = Router();

// Login
router.post('/login', async (req: Request, res: Response) => {
    try {
        const { email, password, restaurantSlug } = req.body;

        // Find user
        const user = await prisma.user.findFirst({
            where: {
                email,
                restaurant: {
                    slug: restaurantSlug,
                },
            },
            include: {
                restaurant: true,
            },
        });

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Verify password
        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT
        const token = jwt.sign(
            {
                userId: user.id,
                restaurantId: user.restaurantId,
                role: user.role,
            },
            config.jwt.secret,
            { expiresIn: config.jwt.expiresIn } as jwt.SignOptions
        );

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
                restaurant: {
                    id: user.restaurant.id,
                    name: user.restaurant.name,
                    slug: user.restaurant.slug,
                },
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Customer login (no auth)
router.post('/customer-login', async (req: Request, res: Response) => {
    try {
        const { restaurantSlug, tableNumber } = req.body;

        const restaurant = await prisma.restaurant.findUnique({
            where: { slug: restaurantSlug },
        });

        if (!restaurant) {
            return res.status(404).json({ error: 'Restaurant not found' });
        }

        // Generate temporary token for customer
        const token = jwt.sign(
            {
                userId: 'customer',
                restaurantId: restaurant.id,
                role: 'customer',
                tableNumber,
            },
            config.jwt.secret,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            restaurant: {
                id: restaurant.id,
                name: restaurant.name,
                slug: restaurant.slug,
            },
        });
    } catch (error) {
        console.error('Customer login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

export default router;
