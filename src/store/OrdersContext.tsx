import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Order, OrderStatus, OrderSource, TableOrder, OrderTotals, CartItem } from '../types';
import { ordersAPI } from '../services/api';

interface OrdersContextType {
    orders: Order[];
    loading: boolean;
    createOrder: (table: TableOrder, items: CartItem[], totals: OrderTotals) => Promise<Order>;
    getOrderById: (orderId: string) => Order | undefined;
    updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
    clearPaidOrders: (orderIds: string[]) => Promise<void>;
    getKitchenOrders: () => Order[];
    getReadyOrders: () => Order[];
    getDeliveredOrders: () => Order[];
    getTodayOrderCount: () => number;
    getTotalRevenue: () => number;
    getOrdersByTable: (tableNumber: number) => Order[];
    getPendingPaymentOrders: () => Order[];
    getTablePaymentSummary: () => Record<number, { orders: Order[]; total: number }>;
    getThirdPartyOrders: () => Order[];
    getCourierOrders: () => Order[];
    createThirdPartyOrder: (source: OrderSource, items: { id: string; name: string; price: number; quantity: number }[], note?: string) => Promise<Order>;
    refreshOrders: () => Promise<void>;
}

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

// Map order_code -> database UUID for API calls
const orderIdMap = new Map<string, string>();

export function OrdersProvider({ children }: { children: ReactNode }) {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    // Load orders from backend
    const loadOrders = async () => {
        try {
            const response = await ordersAPI.getAll();

            // Transform backend orders to frontend format
            const backendOrders = response.data;
            const transformedOrders: Order[] = backendOrders.map((order: any) => {
                // Store the mapping: order_code -> database UUID
                orderIdMap.set(order.order_code, order.id);

                return {
                    orderId: order.order_code,
                    createdAt: order.created_at,
                    items: (order.items || []).map((item: any) => ({
                        id: item.product_id,
                        name: item.product_name,
                        price: parseFloat(item.unit_price),
                        quantity: item.quantity,
                    })),
                    table: {
                        tableNumber: order.table?.table_number || 0,
                        waiterName: 'Çevrimiçi',
                        note: order.customer_note || '',
                    },
                    totals: {
                        subtotal: parseFloat(order.subtotal),
                        total: parseFloat(order.total),
                    },
                    status: order.status as OrderStatus,
                    source: (order.order_source || 'restaurant') as OrderSource,
                };
            });

            // Only update if data has changed (prevent infinite re-renders)
            setOrders(prev => {
                if (JSON.stringify(prev) === JSON.stringify(transformedOrders)) {
                    return prev;
                }
                return transformedOrders;
            });
        } catch (error) {
            console.error('Failed to load orders:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();

        // Poll for updates every 5 seconds
        const interval = setInterval(loadOrders, 5000);
        return () => clearInterval(interval);
    }, []);

    const createOrder = async (
        table: TableOrder,
        items: CartItem[],
        totals: OrderTotals
    ): Promise<Order> => {
        const response = await ordersAPI.create({
            tableNumber: table.tableNumber,
            items: items.map(item => ({
                id: item.product.id,
                name: item.product.name,
                quantity: item.quantity,
                price: item.product.price,
            })),
            customerNote: table.note || '',
        });

        const backendOrder = response.data;

        // Store the ID mapping
        orderIdMap.set(backendOrder.order_code, backendOrder.id);

        const newOrder: Order = {
            orderId: backendOrder.order_code,
            createdAt: backendOrder.created_at,
            items: items.map(item => ({
                id: item.product.id,
                name: item.product.name,
                price: item.product.price,
                quantity: item.quantity,
            })),
            table,
            totals,
            status: backendOrder.status as OrderStatus,
            source: (backendOrder.order_source || 'restaurant') as OrderSource,
        };

        setOrders((prev) => [newOrder, ...prev]);
        return newOrder;
    };

    const getOrderById = (orderId: string): Order | undefined => {
        return orders.find((order) => order.orderId === orderId);
    };

    const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
        // Get the real database UUID from the map
        const dbId = orderIdMap.get(orderId);
        if (!dbId) {
            console.error('No database ID found for order:', orderId);
            return;
        }

        try {
            await ordersAPI.updateStatus(dbId, status);

            // Update local state immediately for responsive UI
            setOrders((prev) =>
                prev.map((order) =>
                    order.orderId === orderId ? { ...order, status } : order
                )
            );
        } catch (error) {
            console.error('Failed to update order status:', error);
        }
    };

    const clearPaidOrders = async (_orderIds: string[]) => {
        // Do NOT delete paid orders from database - keep them for revenue tracking and future reporting.
        // Orders remain with 'Ödendi' status in DB. The next poll will pick them up and
        // they'll be filtered out of the active kasa view by getPendingPaymentOrders().
        // Revenue calculation (getTotalRevenue / getDailyRevenue) will still include them.
    };

    const getKitchenOrders = (): Order[] => {
        return orders.filter((order) => order.status === 'Mutfakta');
    };

    const getReadyOrders = (): Order[] => {
        return orders.filter((order) => order.status === 'Hazır');
    };

    const getDeliveredOrders = (): Order[] => {
        return orders.filter((order) => order.status === 'Teslim Edildi');
    };

    const getTodayOrderCount = (): number => {
        const today = new Date().toDateString();
        return orders.filter((order) => {
            const orderDate = new Date(order.createdAt).toDateString();
            return orderDate === today;
        }).length;
    };

    const getTotalRevenue = (): number => {
        return orders
            .filter((order) => order.status === 'Ödendi')
            .reduce((sum, order) => sum + order.totals.total, 0);
    };

    const getOrdersByTable = (tableNumber: number): Order[] => {
        return orders.filter((order) => order.table.tableNumber === tableNumber);
    };

    const getPendingPaymentOrders = (): Order[] => {
        return orders.filter((order) => order.status === 'Teslim Edildi');
    };

    const getTablePaymentSummary = (): Record<number, { orders: Order[]; total: number }> => {
        const summary: Record<number, { orders: Order[]; total: number }> = {};

        const pendingPaymentOrders = getPendingPaymentOrders();

        pendingPaymentOrders.forEach((order) => {
            const tableNum = order.table.tableNumber;
            if (!summary[tableNum]) {
                summary[tableNum] = {
                    orders: [],
                    total: 0,
                };
            }
            summary[tableNum].orders.push(order);
            summary[tableNum].total += order.totals.total;
        });

        return summary;
    };

    const getThirdPartyOrders = (): Order[] => {
        return orders.filter((order) => order.source !== 'restaurant');
    };

    const getCourierOrders = (): Order[] => {
        return orders.filter((order) => order.status === 'Kuryeye Teslim Edildi');
    };

    const createThirdPartyOrder = async (
        source: OrderSource,
        items: { id: string; name: string; price: number; quantity: number }[],
        note?: string
    ): Promise<Order> => {
        const response = await ordersAPI.createThirdParty({
            items: items.map(item => ({
                id: item.id,
                name: item.name,
                quantity: item.quantity,
                price: item.price,
            })),
            customerNote: note || '',
            orderSource: source,
        });

        const backendOrder = response.data;
        orderIdMap.set(backendOrder.order_code, backendOrder.id);

        const sourceLabels: Record<string, string> = {
            yemeksepeti: 'Yemeksepeti',
            trendyol: 'Trendyol Go',
            getir: 'Getir',
        };

        const newOrder: Order = {
            orderId: backendOrder.order_code,
            createdAt: backendOrder.created_at,
            items,
            table: {
                tableNumber: 0,
                waiterName: sourceLabels[source] || source,
                note: note || '',
            },
            totals: {
                subtotal: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
                total: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
            },
            status: backendOrder.status as OrderStatus,
            source,
        };

        setOrders((prev) => [newOrder, ...prev]);
        return newOrder;
    };

    const refreshOrders = async () => {
        await loadOrders();
    };

    return (
        <OrdersContext.Provider
            value={{
                orders,
                loading,
                createOrder,
                getOrderById,
                updateOrderStatus,
                clearPaidOrders,
                getKitchenOrders,
                getReadyOrders,
                getDeliveredOrders,
                getTodayOrderCount,
                getTotalRevenue,
                getOrdersByTable,
                getPendingPaymentOrders,
                getTablePaymentSummary,
                getThirdPartyOrders,
                getCourierOrders,
                createThirdPartyOrder,
                refreshOrders,
            }}
        >
            {children}
        </OrdersContext.Provider>
    );
}

export function useOrders() {
    const context = useContext(OrdersContext);
    if (!context) {
        throw new Error('useOrders must be used within OrdersProvider');
    }
    return context;
}
