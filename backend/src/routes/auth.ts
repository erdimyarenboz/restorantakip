import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase';
import { config } from '../config/env';

const router = Router();

// Login
router.post('/login', async (req: Request, res: Response) => {
    try {
        const { email, username, password, restaurantSlug, restaurantId } = req.body;

        // Support both email and username login
        const loginEmail = email || username;

        if (!loginEmail || !password) {
            return res.status(400).json({ error: 'Email/username and password are required' });
        }

        // Find user via Supabase
        let query = supabase
            .from('users')
            .select('*, restaurants(*)')
            .eq('email', loginEmail)
            .eq('is_active', true)
            .single();

        if (restaurantId) {
            query = supabase
                .from('users')
                .select('*, restaurants(*)')
                .eq('email', loginEmail)
                .eq('restaurant_id', restaurantId)
                .eq('is_active', true)
                .single();
        }

        const { data: user, error: userError } = await query;

        if (userError || !user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // If restaurantSlug was provided, verify it matches
        if (restaurantSlug && user.restaurants?.slug !== restaurantSlug) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Verify password
        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT
        const token = jwt.sign(
            {
                userId: user.id,
                restaurantId: user.restaurant_id,
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
                fullName: user.full_name,
                role: user.role,
                restaurant: {
                    id: user.restaurants?.id,
                    name: user.restaurants?.name,
                    slug: user.restaurants?.slug,
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

        const { data: restaurant, error } = await supabase
            .from('restaurants')
            .select('*')
            .eq('slug', restaurantSlug)
            .single();

        if (error || !restaurant) {
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
