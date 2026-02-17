import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Order, OrderStatus, OrderSource, TableOrder, OrderTotals, CartItem } from '../types';
import { ordersAPI } from '../services/api';
import { getStorageItem, setStorageItem } from '../utils/storage';

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

const ORDERS_STORAGE_KEY = 'orders_v1';
const ORDER_COUNTER_KEY = 'order_counter_v1';

// Map order_code -> database UUID for API calls
const orderIdMap = new Map<string, string>();

// ─── Helper: generate local order code ────────────────────────────────
function generateOrderCode(): string {
    const counter = getStorageItem<number>(ORDER_COUNTER_KEY, 0) + 1;
    setStorageItem(ORDER_COUNTER_KEY, counter);
    return `SIP-${String(counter).padStart(4, '0')}`;
}

// ─── Helper: persist orders in localStorage ───────────────────────────
function persistOrders(orders: Order[]) {
    setStorageItem(ORDERS_STORAGE_KEY, orders);
}

// Track whether we're operating in offline (local-only) mode
let isOfflineMode = false;

export function OrdersProvider({ children }: { children: ReactNode }) {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    // Load orders — try API first, fall back to localStorage
    const loadOrders = useCallback(async () => {
        try {
            const response = await ordersAPI.getAll();

            // Transform backend orders to frontend format
            const backendOrders = response.data;
            const transformedOrders: Order[] = backendOrders.map((order: any) => {
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

            setOrders(prev => {
                if (JSON.stringify(prev) === JSON.stringify(transformedOrders)) return prev;
                return transformedOrders;
            });
            isOfflineMode = false;
        } catch {
            // API unavailable — use localStorage
            if (!isOfflineMode) {
                console.warn('API unavailable, using local order storage.');
                isOfflineMode = true;
            }
            const localOrders = getStorageItem<Order[]>(ORDERS_STORAGE_KEY, []);
            setOrders(prev => {
                if (JSON.stringify(prev) === JSON.stringify(localOrders)) return prev;
                return localOrders;
            });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadOrders();
        const interval = setInterval(loadOrders, 5000);
        return () => clearInterval(interval);
    }, [loadOrders]);

    // Persist to localStorage whenever orders change (for offline mode)
    useEffect(() => {
        if (isOfflineMode && orders.length > 0) {
            persistOrders(orders);
        }
    }, [orders]);

    // ─── Create Order ──────────────────────────────────────────────────
    const createOrder = async (
        table: TableOrder,
        items: CartItem[],
        totals: OrderTotals
    ): Promise<Order> => {
        // Try API first
        try {
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

            setOrders(prev => [newOrder, ...prev]);
            return newOrder;
        } catch {
            // Offline fallback — create locally
            const newOrder: Order = {
                orderId: generateOrderCode(),
                createdAt: new Date().toISOString(),
                items: items.map(item => ({
                    id: item.product.id,
                    name: item.product.name,
                    price: item.product.price,
                    quantity: item.quantity,
                })),
                table,
                totals,
                status: 'Mutfakta' as OrderStatus,
                source: 'restaurant' as OrderSource,
            };

            const updated = [newOrder, ...orders];
            setOrders(updated);
            persistOrders(updated);
            return newOrder;
        }
    };

    // ─── Get Order By ID ───────────────────────────────────────────────
    const getOrderById = (orderId: string): Order | undefined => {
        return orders.find((order) => order.orderId === orderId);
    };

    // ─── Update Order Status ───────────────────────────────────────────
    const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
        // Try API first
        const dbId = orderIdMap.get(orderId);
        if (dbId && !isOfflineMode) {
            try {
                await ordersAPI.updateStatus(dbId, status);
            } catch {
                console.warn('API call failed, updating locally only.');
            }
        }

        // Always update local state
        setOrders(prev => {
            const updated = prev.map(order =>
                order.orderId === orderId ? { ...order, status } : order
            );
            if (isOfflineMode) persistOrders(updated);
            return updated;
        });
    };

    // ─── Clear Paid Orders ─────────────────────────────────────────────
    const clearPaidOrders = async (_orderIds: string[]) => {
        // Keep paid orders for revenue tracking
    };

    // ─── Filter helpers ────────────────────────────────────────────────
    const getKitchenOrders = (): Order[] =>
        orders.filter(order => order.status === 'Mutfakta');

    const getReadyOrders = (): Order[] =>
        orders.filter(order => order.status === 'Hazır');

    const getDeliveredOrders = (): Order[] =>
        orders.filter(order => order.status === 'Teslim Edildi');

    const getTodayOrderCount = (): number => {
        const today = new Date().toDateString();
        return orders.filter(order => new Date(order.createdAt).toDateString() === today).length;
    };

    const getTotalRevenue = (): number =>
        orders.filter(order => order.status === 'Ödendi').reduce((sum, order) => sum + order.totals.total, 0);

    const getOrdersByTable = (tableNumber: number): Order[] =>
        orders.filter(order => order.table.tableNumber === tableNumber);

    const getPendingPaymentOrders = (): Order[] =>
        orders.filter(order => order.status === 'Teslim Edildi');

    const getTablePaymentSummary = (): Record<number, { orders: Order[]; total: number }> => {
        const summary: Record<number, { orders: Order[]; total: number }> = {};
        getPendingPaymentOrders().forEach(order => {
            const tableNum = order.table.tableNumber;
            if (!summary[tableNum]) summary[tableNum] = { orders: [], total: 0 };
            summary[tableNum].orders.push(order);
            summary[tableNum].total += order.totals.total;
        });
        return summary;
    };

    const getThirdPartyOrders = (): Order[] =>
        orders.filter(order => order.source !== 'restaurant');

    const getCourierOrders = (): Order[] =>
        orders.filter(order => order.status === 'Kuryeye Teslim Edildi');

    // ─── Create Third-Party Order ──────────────────────────────────────
    const createThirdPartyOrder = async (
        source: OrderSource,
        items: { id: string; name: string; price: number; quantity: number }[],
        note?: string
    ): Promise<Order> => {
        const sourceLabels: Record<string, string> = {
            yemeksepeti: 'Yemeksepeti',
            trendyol: 'Trendyol Go',
            getir: 'Getir',
        };

        // Try API first
        try {
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

            setOrders(prev => [newOrder, ...prev]);
            return newOrder;
        } catch {
            // Offline fallback
            const newOrder: Order = {
                orderId: generateOrderCode(),
                createdAt: new Date().toISOString(),
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
                status: 'Mutfakta' as OrderStatus,
                source,
            };

            const updated = [newOrder, ...orders];
            setOrders(updated);
            persistOrders(updated);
            return newOrder;
        }
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
