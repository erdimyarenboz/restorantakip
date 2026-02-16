import { Router, Response, Request } from 'express';
import { supabase } from '../config/supabase';

const router = Router();

// =================== CRM DASHBOARD STATS ===================

router.get('/stats', async (req: Request, res: Response) => {
    try {
        const { data: restaurants, error } = await supabase
            .from('restaurants')
            .select('id, contract_status, monthly_fee, is_active');

        if (error) throw error;

        const stats = {
            total: restaurants?.length || 0,
            active: restaurants?.filter(r => r.contract_status === 'active').length || 0,
            trial: restaurants?.filter(r => r.contract_status === 'trial').length || 0,
            leads: restaurants?.filter(r => r.contract_status === 'lead').length || 0,
            expired: restaurants?.filter(r => r.contract_status === 'expired').length || 0,
            monthlyRevenue: restaurants
                ?.filter(r => r.contract_status === 'active' || r.contract_status === 'trial')
                .reduce((sum, r) => sum + (parseFloat(r.monthly_fee) || 0), 0) || 0,
        };

        res.json(stats);
    } catch (error) {
        console.error('CRM stats error:', error);
        res.status(500).json({ error: 'İstatistikler yüklenemedi' });
    }
});

// =================== RESTAURANT LIST (CRM) ===================

router.get('/restaurants', async (req: Request, res: Response) => {
    try {
        const status = req.query.status as string | undefined;

        let query = supabase
            .from('restaurants')
            .select('id, name, slug, phone, address, is_active, subscription_plan, contract_months, contract_start_date, contract_status, contact_person, contact_phone, notes, monthly_fee, created_at')
            .order('created_at', { ascending: false });

        if (status) {
            query = query.eq('contract_status', status);
        }

        const { data, error } = await query;

        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('CRM restaurants error:', error);
        res.status(500).json({ error: 'Restoranlar yüklenemedi' });
    }
});

// =================== ADD RESTAURANT ===================

router.post('/restaurants', async (req: Request, res: Response) => {
    try {
        const {
            name,
            slug,
            phone,
            address,
            contact_person,
            contact_phone,
            contract_months,
            contract_start_date,
            contract_status,
            monthly_fee,
            subscription_plan,
            notes,
        } = req.body;

        if (!name || !slug) {
            res.status(400).json({ error: 'Restoran adı ve slug gereklidir' });
            return;
        }

        const id = `rest-${Date.now().toString(36)}`;

        const { data, error } = await supabase
            .from('restaurants')
            .insert({
                id,
                name,
                slug,
                phone: phone || null,
                address: address || null,
                contact_person: contact_person || null,
                contact_phone: contact_phone || null,
                contract_months: contract_months || 0,
                contract_start_date: contract_start_date || null,
                contract_status: contract_status || 'lead',
                monthly_fee: monthly_fee || 0,
                subscription_plan: subscription_plan || 'free',
                notes: notes || null,
                is_active: true,
                updated_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(data);
    } catch (error: any) {
        console.error('CRM add restaurant error:', error);
        if (error?.code === '23505') {
            res.status(409).json({ error: 'Bu slug zaten kullanılıyor' });
            return;
        }
        res.status(500).json({ error: 'Restoran eklenemedi' });
    }
});

// =================== UPDATE RESTAURANT ===================

router.put('/restaurants/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Only allow specific fields to be updated
        const allowedFields = [
            'name', 'phone', 'address', 'is_active', 'subscription_plan',
            'contract_months', 'contract_start_date', 'contract_status',
            'contact_person', 'contact_phone', 'notes', 'monthly_fee',
        ];

        const safeUpdates: Record<string, any> = { updated_at: new Date().toISOString() };
        for (const key of allowedFields) {
            if (updates[key] !== undefined) {
                safeUpdates[key] = updates[key];
            }
        }

        const { data, error } = await supabase
            .from('restaurants')
            .update(safeUpdates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('CRM update restaurant error:', error);
        res.status(500).json({ error: 'Restoran güncellenemedi' });
    }
});

export default router;
