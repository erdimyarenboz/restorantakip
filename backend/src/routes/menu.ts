import { Router, Response, Request } from 'express';
import { supabase } from '../config/supabase';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// =================== RESTAURANTS ===================

// Get all restaurants
router.get('/restaurants', async (req: Request, res: Response) => {
    try {
        const { data, error } = await supabase
            .from('restaurants')
            .select('id, name, slug, is_active, subscription_plan')
            .order('name', { ascending: true });

        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Get restaurants error:', error);
        res.status(500).json({ error: 'Restoranlar yüklenemedi' });
    }
});

// Get restaurant by slug (slug resolver for multi-tenant)
router.get('/restaurants/:slug', async (req: Request, res: Response) => {
    try {
        const { slug } = req.params;
        const { data, error } = await supabase
            .from('restaurants')
            .select('id, name, slug, phone, address, logo_url, is_active')
            .eq('slug', slug)
            .eq('is_active', true)
            .single();

        if (error || !data) {
            return res.status(404).json({ error: 'Restoran bulunamadı' });
        }
        res.json(data);
    } catch (error) {
        console.error('Get restaurant by slug error:', error);
        res.status(500).json({ error: 'Restoran yüklenemedi' });
    }
});

// =================== CATEGORIES ===================

// Get categories (filtered by restaurant_id)
router.get('/categories', async (req: Request, res: Response) => {
    try {
        let restaurant_id = req.query.restaurant_id as string;

        if (!restaurant_id) {
            const { data: firstRestaurant } = await supabase
                .from('restaurants')
                .select('id')
                .eq('is_active', true)
                .order('created_at', { ascending: true })
                .limit(1)
                .single();
            restaurant_id = firstRestaurant?.id || 'rest-001';
        }

        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .eq('restaurant_id', restaurant_id)
            .order('sort_order', { ascending: true });

        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

// Create category
router.post('/categories', async (req: Request, res: Response) => {
    try {
        const { name, icon, sort_order, restaurant_id, image_url } = req.body;
        if (!name) return res.status(400).json({ error: 'Kategori adı gerekli' });

        // Use provided restaurant_id or fallback
        let rid = restaurant_id;
        if (!rid) {
            const { data: existingCat } = await supabase.from('categories').select('restaurant_id').limit(1).single();
            rid = existingCat?.restaurant_id;
        }
        if (!rid) {
            const { data: existingTable } = await supabase.from('tables').select('restaurant_id').limit(1).single();
            rid = existingTable?.restaurant_id;
        }
        if (!rid) return res.status(400).json({ error: 'Restaurant bulunamadı' });

        const id = `cat-${Date.now()}`;
        const insertData: any = { id, restaurant_id: rid, name, icon: icon || '', sort_order: sort_order || 0 };
        if (image_url) insertData.image_url = image_url;

        const { data, error } = await supabase
            .from('categories')
            .insert(insertData)
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(data);
    } catch (error) {
        console.error('Create category error:', error);
        res.status(500).json({ error: 'Kategori eklenemedi' });
    }
});

// Update category
router.patch('/categories/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, icon, sort_order, image_url } = req.body;

        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (icon !== undefined) updateData.icon = icon;
        if (sort_order !== undefined) updateData.sort_order = sort_order;
        if (image_url !== undefined) updateData.image_url = image_url;

        const { data, error } = await supabase
            .from('categories')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Update category error:', error);
        res.status(500).json({ error: 'Kategori güncellenemedi' });
    }
});

// Delete category
router.delete('/categories/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // First delete all products in this category
        await supabase.from('products').delete().eq('category_id', id);

        const { error } = await supabase.from('categories').delete().eq('id', id);
        if (error) throw error;
        res.status(204).send();
    } catch (error) {
        console.error('Delete category error:', error);
        res.status(500).json({ error: 'Kategori silinemedi' });
    }
});

// =================== PRODUCTS ===================

// Get products (customer view - only available, filtered by restaurant_id)
router.get('/products', async (req: Request, res: Response) => {
    try {
        let restaurant_id = req.query.restaurant_id as string;

        if (!restaurant_id) {
            const { data: firstRestaurant } = await supabase
                .from('restaurants')
                .select('id')
                .eq('is_active', true)
                .order('created_at', { ascending: true })
                .limit(1)
                .single();
            restaurant_id = firstRestaurant?.id || 'rest-001';
        }

        const { data, error } = await supabase
            .from('products')
            .select(`
                *,
                category:categories(*)
            `)
            .eq('restaurant_id', restaurant_id)
            .eq('is_available', true)
            .order('name', { ascending: true });

        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// Get all products (admin view - includes unavailable, filtered by restaurant_id)
router.get('/products/all', async (req: Request, res: Response) => {
    try {
        let restaurant_id = req.query.restaurant_id as string;

        if (!restaurant_id) {
            const { data: firstRestaurant } = await supabase
                .from('restaurants')
                .select('id')
                .eq('is_active', true)
                .order('created_at', { ascending: true })
                .limit(1)
                .single();
            restaurant_id = firstRestaurant?.id || 'rest-001';
        }

        const { data, error } = await supabase
            .from('products')
            .select(`
                *,
                category:categories(*)
            `)
            .eq('restaurant_id', restaurant_id)
            .order('name', { ascending: true });

        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Get all products error:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// Create product
router.post('/products', async (req: Request, res: Response) => {
    try {
        const { name, price, category_id, description, is_available, restaurant_id } = req.body;
        if (!name || price === undefined || !category_id) {
            return res.status(400).json({ error: 'Ürün adı, fiyat ve kategori gerekli' });
        }

        // Get restaurant_id from body or from category
        let rid = restaurant_id;
        if (!rid) {
            const { data: cat } = await supabase.from('categories').select('restaurant_id').eq('id', category_id).single();
            if (!cat) return res.status(400).json({ error: 'Kategori bulunamadı' });
            rid = cat.restaurant_id;
        }

        const { image_url } = req.body;
        const id = `prod-${Date.now()}`;
        const { data, error } = await supabase
            .from('products')
            .insert({
                id,
                restaurant_id: rid,
                category_id,
                name,
                price: Number(price),
                description: description || null,
                image_url: image_url || null,
                is_available: is_available !== false,
            })
            .select(`*, category:categories(*)`)
            .single();

        if (error) throw error;
        res.status(201).json(data);
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({ error: 'Ürün eklenemedi' });
    }
});

// Update product
router.patch('/products/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, price, category_id, description, is_available, image_url } = req.body;

        const updateData: any = { updated_at: new Date().toISOString() };
        if (name) updateData.name = name;
        if (price !== undefined) updateData.price = Number(price);
        if (category_id) updateData.category_id = category_id;
        if (description !== undefined) updateData.description = description;
        if (image_url !== undefined) updateData.image_url = image_url;
        if (is_available !== undefined) updateData.is_available = is_available;

        const { data, error } = await supabase
            .from('products')
            .update(updateData)
            .eq('id', id)
            .select(`*, category:categories(*)`)
            .single();

        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({ error: 'Ürün güncellenemedi' });
    }
});

// Delete product
router.delete('/products/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) throw error;
        res.status(204).send();
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({ error: 'Ürün silinemedi' });
    }
});

// =================== IMAGE UPLOAD ===================

// Upload image (base64) to Supabase Storage
router.post('/upload-image', async (req: Request, res: Response) => {
    try {
        const { image, fileName } = req.body;

        if (!image) {
            return res.status(400).json({ error: 'Image data is required' });
        }

        // Parse base64 data
        const matches = image.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
            return res.status(400).json({ error: 'Invalid base64 image format' });
        }

        const contentType = matches[1];
        const base64Data = matches[2];
        const buffer = Buffer.from(base64Data, 'base64');

        // Generate unique filename
        const ext = contentType.split('/')[1] || 'png';
        const uniqueName = fileName || `${uuidv4()}.${ext}`;
        const filePath = `products/${uniqueName}`;

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from('menu-images')
            .upload(filePath, buffer, {
                contentType,
                upsert: true,
            });

        if (error) {
            console.error('Supabase Storage upload error:', error);
            return res.status(500).json({ error: `Görsel yüklenemedi: ${error.message}` });
        }

        // Get public URL
        const { data: publicUrlData } = supabase.storage
            .from('menu-images')
            .getPublicUrl(filePath);

        res.json({
            url: publicUrlData.publicUrl,
            path: filePath,
        });
    } catch (error: any) {
        console.error('Image upload error:', error);
        res.status(500).json({ error: `Görsel yüklenemedi: ${error?.message || 'Bilinmeyen hata'}` });
    }
});

export default router;
