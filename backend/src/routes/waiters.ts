import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase';

const router = Router();

// Get all waiters
router.get('/', async (req: Request, res: Response) => {
    try {
        const { data, error } = await supabase
            .from('waiters')
            .select('*')
            .order('created_at', { ascending: true });

        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Get waiters error:', error);
        res.status(500).json({ error: 'Failed to fetch waiters' });
    }
});

// Create a new waiter
router.post('/', async (req: Request, res: Response) => {
    try {
        const { full_name, phone } = req.body;

        if (!full_name || full_name.trim().length < 2) {
            return res.status(400).json({ error: 'Garson adı en az 2 karakter olmalıdır' });
        }

        const id = `waiter-${Date.now().toString(36)}`;

        const { data, error } = await supabase
            .from('waiters')
            .insert({
                id,
                restaurant_id: 'rest-001',
                full_name: full_name.trim(),
                phone: phone?.trim() || null,
                is_active: true,
            })
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(data);
    } catch (error) {
        console.error('Create waiter error:', error);
        res.status(500).json({ error: 'Failed to create waiter' });
    }
});

// Update a waiter
router.patch('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { full_name, phone, is_active } = req.body;

        const updates: Record<string, any> = {};
        if (full_name !== undefined) updates.full_name = full_name.trim();
        if (phone !== undefined) updates.phone = phone?.trim() || null;
        if (is_active !== undefined) updates.is_active = is_active;

        const { data, error } = await supabase
            .from('waiters')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Update waiter error:', error);
        res.status(500).json({ error: 'Failed to update waiter' });
    }
});

// Delete a waiter
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from('waiters')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.json({ success: true });
    } catch (error) {
        console.error('Delete waiter error:', error);
        res.status(500).json({ error: 'Failed to delete waiter' });
    }
});

export default router;
