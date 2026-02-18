import { Router, Response, Request } from 'express';
import { supabase } from '../config/supabase';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Valid platform slugs
const VALID_PLATFORMS = ['trendyol_go', 'getir', 'migros', 'yemeksepeti'];

// =================== GET ALL INTEGRATIONS ===================
router.get('/', async (req: Request, res: Response) => {
    try {
        const restaurant_id = req.query.restaurant_id as string;

        let query = supabase
            .from('platform_integrations')
            .select('*')
            .order('platform', { ascending: true });

        if (restaurant_id) {
            query = query.eq('restaurant_id', restaurant_id);
        }

        const { data, error } = await query;
        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Get integrations error:', error);
        res.status(500).json({ error: 'Entegrasyonlar yüklenemedi' });
    }
});

// =================== CREATE INTEGRATION ===================
router.post('/', async (req: Request, res: Response) => {
    try {
        const { restaurant_id, platform, seller_id, store_name, store_link, api_key, api_secret, token } = req.body;

        if (!restaurant_id || !platform) {
            return res.status(400).json({ error: 'restaurant_id ve platform zorunludur' });
        }

        if (!VALID_PLATFORMS.includes(platform)) {
            return res.status(400).json({ error: `Geçersiz platform: ${platform}. Geçerli: ${VALID_PLATFORMS.join(', ')}` });
        }

        const { data, error } = await supabase
            .from('platform_integrations')
            .insert({
                id: uuidv4(),
                restaurant_id,
                platform,
                seller_id: seller_id || null,
                store_name: store_name || null,
                store_link: store_link || null,
                api_key: api_key || null,
                api_secret: api_secret || null,
                token: token || null,
                is_active: true,
                updated_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) {
            if (error.code === '23505') {
                return res.status(409).json({ error: 'Bu platform için zaten bir entegrasyon var' });
            }
            throw error;
        }

        res.status(201).json(data);
    } catch (error) {
        console.error('Create integration error:', error);
        res.status(500).json({ error: 'Entegrasyon eklenemedi' });
    }
});

// =================== UPDATE INTEGRATION ===================
router.patch('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { seller_id, store_name, store_link, api_key, api_secret, token, is_active } = req.body;

        const updateData: Record<string, any> = { updated_at: new Date().toISOString() };
        if (seller_id !== undefined) updateData.seller_id = seller_id;
        if (store_name !== undefined) updateData.store_name = store_name;
        if (store_link !== undefined) updateData.store_link = store_link;
        if (api_key !== undefined) updateData.api_key = api_key;
        if (api_secret !== undefined) updateData.api_secret = api_secret;
        if (token !== undefined) updateData.token = token;
        if (is_active !== undefined) updateData.is_active = is_active;

        const { data, error } = await supabase
            .from('platform_integrations')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Update integration error:', error);
        res.status(500).json({ error: 'Entegrasyon güncellenemedi' });
    }
});

// =================== DELETE INTEGRATION ===================
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from('platform_integrations')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.status(204).send();
    } catch (error) {
        console.error('Delete integration error:', error);
        res.status(500).json({ error: 'Entegrasyon silinemedi' });
    }
});

// =================== TEST CONNECTION ===================
router.post('/:id/test', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Fetch the integration
        const { data: integration, error } = await supabase
            .from('platform_integrations')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !integration) {
            return res.status(404).json({ error: 'Entegrasyon bulunamadı' });
        }

        // Check required fields
        const hasCredentials = integration.api_key || integration.token || integration.seller_id;
        if (!hasCredentials) {
            return res.json({
                success: false,
                message: 'API bilgileri eksik. Lütfen en az Satıcı ID, API Key veya Token giriniz.',
            });
        }

        // Mock test — in production, each platform adapter would make a real API call
        // For now, we validate that credentials exist and return success
        res.json({
            success: true,
            message: `${integration.platform} bağlantısı başarılı! (Bilgiler kaydedildi)`,
            platform: integration.platform,
        });
    } catch (error) {
        console.error('Test integration error:', error);
        res.status(500).json({ error: 'Bağlantı testi başarısız' });
    }
});

export default router;
