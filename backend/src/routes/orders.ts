import { Router, Response, Request } from 'express';
import { supabase } from '../config/supabase';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Get all orders (using Supabase client)
router.get('/', async (req: Request, res: Response) => {
    try {
        const { data, error } = await supabase
            .from('orders')
            .select(`
                *,
                table:tables(*),
                items:order_items(
                    *,
                    product:products(*)
                )
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// Create order (using Supabase client)
router.post('/', async (req: Request, res: Response) => {
    try {
        const { tableNumber, items, customerNote, orderSource = 'restaurant' } = req.body;

        console.log('📝 Creating order:', { tableNumber, itemsCount: items?.length, customerNote, orderSource });

        let table: any = null;
        const isThirdParty = orderSource !== 'restaurant';

        if (!isThirdParty) {
            // Find table for restaurant orders
            const { data: tableData, error: tableError } = await supabase
                .from('tables')
                .select('*')
                .eq('table_number', parseInt(tableNumber))
                .single();

            console.log('🔍 Table lookup result:', {
                found: !!tableData,
                error: tableError ? JSON.stringify(tableError) : null,
                tableNumber: parseInt(tableNumber)
            });

            if (tableError || !tableData) {
                console.error('❌ Table not found:', { tableNumber, error: tableError });
                return res.status(404).json({ error: 'Table not found', details: tableError });
            }
            table = tableData;
        } else {
            // For third-party orders, get restaurant_id from first table (no specific table)
            const { data: firstTable } = await supabase
                .from('tables')
                .select('restaurant_id')
                .limit(1)
                .single();
            table = { restaurant_id: firstTable?.restaurant_id || 'rest-001', id: null };
        }

        // Calculate totals
        const subtotal = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
        const total = subtotal;

        // Generate order code and UUID
        const year = new Date().getFullYear();
        const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
        const orderCode = `ORD-${year}-${randomPart}`;
        const orderId = uuidv4();

        // Create order with explicit ID
        const orderInsert: any = {
            id: orderId,
            order_code: orderCode,
            restaurant_id: table.restaurant_id,
            customer_note: customerNote,
            status: 'Mutfakta',
            subtotal,
            total,
            order_source: orderSource,
        };
        // Only set table_id for restaurant orders
        if (table.id) {
            orderInsert.table_id = table.id;
        }

        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert(orderInsert)
            .select()
            .single();

        if (orderError) throw orderError;

        // Create order items with UUIDs
        const orderItems = items.map((item: any) => ({
            id: uuidv4(), // Generate UUID for each item
            order_id: order.id,
            product_id: item.id,
            product_name: item.name,
            quantity: item.quantity,
            unit_price: item.price,
            subtotal: item.price * item.quantity,
        }));

        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItems);

        if (itemsError) throw itemsError;

        // Fetch complete order with relations
        const { data: completeOrder, error: fetchError } = await supabase
            .from('orders')
            .select(`
                *,
                table:tables(*),
                items:order_items(*)
            `)
            .eq('id', order.id)
            .single();

        if (fetchError) throw fetchError;

        res.status(201).json(completeOrder);
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ error: 'Failed to create order' });
    }
});

// Update order status (using Supabase client)
router.patch('/:id/status', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const updateData: any = { status };
        if (status === 'Ödendi' || status === 'Kuryeye Teslim Edildi') {
            updateData.paid_at = new Date().toISOString();
        }

        const { data, error } = await supabase
            .from('orders')
            .update(updateData)
            .eq('id', id)
            .select(`
                *,
                table:tables(*),
                items:order_items(*)
            `)
            .single();

        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({ error: 'Failed to update order status' });
    }
});

// Delete order (using Supabase client)
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from('orders')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.status(204).send();
    } catch (error) {
        console.error('Delete order error:', error);
        res.status(500).json({ error: 'Failed to delete order' });
    }
});

// Report endpoint — revenue by period with source filtering
router.get('/report', async (req: Request, res: Response) => {
    try {
        const { period, startDate, endDate, source } = req.query;

        // Use Istanbul timezone (UTC+3) for date calculations
        const toIstanbul = (d: Date) => {
            const offset = 3 * 60 * 60 * 1000; // GMT+3
            return new Date(d.getTime() + offset);
        };
        const istanbulNow = toIstanbul(new Date());
        const year = istanbulNow.getUTCFullYear();
        const month = istanbulNow.getUTCMonth();
        const day = istanbulNow.getUTCDate();

        let fromDate: string;
        let toDate: string;

        if (period === 'daily') {
            // Today in Istanbul = midnight Istanbul time = 21:00 UTC prev day
            fromDate = new Date(Date.UTC(year, month, day) - 3 * 60 * 60 * 1000).toISOString();
            toDate = new Date(Date.UTC(year, month, day + 1) - 3 * 60 * 60 * 1000).toISOString();
        } else if (period === 'weekly') {
            const dayOfWeek = istanbulNow.getUTCDay() || 7; // Monday = 1
            const mondayDate = day - dayOfWeek + 1;
            fromDate = new Date(Date.UTC(year, month, mondayDate) - 3 * 60 * 60 * 1000).toISOString();
            toDate = new Date(Date.UTC(year, month, day + 1) - 3 * 60 * 60 * 1000).toISOString();
        } else if (period === 'monthly') {
            fromDate = new Date(Date.UTC(year, month, 1) - 3 * 60 * 60 * 1000).toISOString();
            toDate = new Date(Date.UTC(year, month + 1, 1) - 3 * 60 * 60 * 1000).toISOString();
        } else if (startDate && endDate) {
            // Custom date range — dates are in Istanbul local time
            const start = new Date(startDate as string);
            fromDate = new Date(start.getTime() - 3 * 60 * 60 * 1000).toISOString();
            const end = new Date(endDate as string);
            end.setDate(end.getDate() + 1);
            toDate = new Date(end.getTime() - 3 * 60 * 60 * 1000).toISOString();
        } else {
            // Default: today in Istanbul
            fromDate = new Date(Date.UTC(year, month, day) - 3 * 60 * 60 * 1000).toISOString();
            toDate = new Date(Date.UTC(year, month, day + 1) - 3 * 60 * 60 * 1000).toISOString();
        }

        // Build query — include both paid statuses
        let query = supabase
            .from('orders')
            .select(`
                id, order_code, status, total, created_at, paid_at, order_source,
                table:tables(table_number),
                items:order_items(quantity, product_name, unit_price)
            `)
            .in('status', ['Ödendi', 'Kuryeye Teslim Edildi'])
            .gte('paid_at', fromDate)
            .lt('paid_at', toDate)
            .order('paid_at', { ascending: false });

        // Source filter
        if (source && source !== 'all') {
            query = query.eq('order_source', source as string);
        }

        const { data, error } = await query;

        if (error) throw error;

        const orders = data || [];
        const totalRevenue = orders.reduce((sum: number, o: any) => sum + Number(o.total), 0);
        const totalOrders = orders.length;
        const averageOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        // Calculate breakdown by source
        const restaurantOrders = orders.filter((o: any) => o.order_source === 'restaurant' || !o.order_source);
        const thirdPartyOrders = orders.filter((o: any) => o.order_source && o.order_source !== 'restaurant');
        const restaurantRevenue = restaurantOrders.reduce((sum: number, o: any) => sum + Number(o.total), 0);
        const thirdPartyRevenue = thirdPartyOrders.reduce((sum: number, o: any) => sum + Number(o.total), 0);

        res.json({
            period: period || 'custom',
            fromDate,
            toDate,
            totalRevenue,
            totalOrders,
            averageOrder,
            restaurantRevenue,
            restaurantOrders: restaurantOrders.length,
            thirdPartyRevenue,
            thirdPartyOrders: thirdPartyOrders.length,
            orders,
        });
    } catch (error) {
        console.error('Report error:', error);
        res.status(500).json({ error: 'Failed to generate report' });
    }
});

export default router;
