import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase';

const router = Router();

// Get all tables (filtered by restaurant_id)
router.get('/', async (req: Request, res: Response) => {
    try {
        const restaurant_id = req.query.restaurant_id as string;

        let query = supabase
            .from('tables')
            .select('*')
            .order('table_number', { ascending: true });

        if (restaurant_id) {
            query = query.eq('restaurant_id', restaurant_id);
        }

        const { data, error } = await query;

        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Get tables error:', error);
        res.status(500).json({ error: 'Failed to fetch tables' });
    }
});

// Create a new table
router.post('/', async (req: Request, res: Response) => {
    try {
        const { table_number, restaurant_id } = req.body;
        const rid = restaurant_id || 'rest-001';

        if (!table_number || table_number < 1) {
            return res.status(400).json({ error: 'Geçerli bir masa numarası girin' });
        }

        // Check if table number already exists
        const { data: existing } = await supabase
            .from('tables')
            .select('id')
            .eq('table_number', table_number)
            .eq('restaurant_id', rid)
            .single();

        if (existing) {
            return res.status(409).json({ error: `Masa ${table_number} zaten mevcut` });
        }

        const id = `table-${rid}-${String(table_number).padStart(3, '0')}`;

        const { data, error } = await supabase
            .from('tables')
            .insert({
                id,
                restaurant_id: rid,
                table_number,
                is_active: true,
            })
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(data);
    } catch (error) {
        console.error('Create table error:', error);
        res.status(500).json({ error: 'Failed to create table' });
    }
});

// Delete a table
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Check for active orders on this table
        const { data: activeOrders } = await supabase
            .from('orders')
            .select('id')
            .eq('table_id', id)
            .not('status', 'in', '("Ödendi","İptal")')
            .limit(1);

        if (activeOrders && activeOrders.length > 0) {
            return res.status(400).json({ error: 'Bu masada aktif sipariş var, silinemez' });
        }

        const { error } = await supabase
            .from('tables')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.json({ success: true });
    } catch (error) {
        console.error('Delete table error:', error);
        res.status(500).json({ error: 'Failed to delete table' });
    }
});

export default router;
