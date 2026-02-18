import { useState, useEffect, useCallback } from 'react';
import { useOrders } from '../store/OrdersContext';
import { useAuth } from '../store/AuthContext';
import { useToast } from '../store/ToastContext';
import { useMenu } from '../store/MenuContext';
import { useLanguage } from '../i18n/i18n';
import { formatCurrency, formatDate } from '../utils/format';
import { tablesAPI, waitersAPI, reportAPI, menuAPI, integrationsAPI } from '../services/api';
import { getStorageItem, setStorageItem } from '../utils/storage';
import type { OrderSource } from '../types';
import styles from '../styles/AdminPage.module.css';

// ─── localStorage keys for offline mode ────────────────────────────────
const TABLES_STORAGE_KEY = 'admin_tables_v1';
const WAITERS_STORAGE_KEY = 'admin_waiters_v1';
const TABLE_COUNTER_KEY = 'admin_table_counter_v1';
const WAITER_COUNTER_KEY = 'admin_waiter_counter_v1';

// ─── Demo menu items (matching MenuContext) for dış sipariş ────────────
const DEMO_MENU_PRODUCTS = [
    { id: 'p-1', name: 'Adana Kebap', price: 320, category_id: 'cat-1', is_available: true },
    { id: 'p-2', name: 'Iskender Kebap', price: 350, category_id: 'cat-1', is_available: true },
    { id: 'p-3', name: 'Karışık Izgara', price: 450, category_id: 'cat-1', is_available: true },
    { id: 'p-4', name: 'Lahmacun', price: 85, category_id: 'cat-1', is_available: true },
    { id: 'p-5', name: 'Pide (Kaşarlı)', price: 150, category_id: 'cat-1', is_available: true },
    { id: 'p-6', name: 'Mercimek Çorbası', price: 75, category_id: 'cat-1', is_available: true },
    { id: 'p-7', name: 'Türk Kahvesi', price: 45, category_id: 'cat-2', is_available: true },
    { id: 'p-8', name: 'Çay', price: 20, category_id: 'cat-2', is_available: true },
    { id: 'p-9', name: 'Ayran', price: 30, category_id: 'cat-2', is_available: true },
    { id: 'p-10', name: 'Limonata', price: 45, category_id: 'cat-2', is_available: true },
    { id: 'p-11', name: 'Serpme Kahvaltı', price: 350, category_id: 'cat-3', is_available: true },
    { id: 'p-12', name: 'Menemen', price: 90, category_id: 'cat-3', is_available: true },
    { id: 'p-13', name: 'Künefe', price: 120, category_id: 'cat-4', is_available: true },
    { id: 'p-14', name: 'Sütlaç', price: 75, category_id: 'cat-4', is_available: true },
    { id: 'p-15', name: 'Baklava', price: 180, category_id: 'cat-4', is_available: true },
    { id: 'p-16', name: 'Akdeniz Salata', price: 95, category_id: 'cat-5', is_available: true },
    { id: 'p-17', name: 'Çoban Salata', price: 70, category_id: 'cat-5', is_available: true },
];

const DEMO_CATEGORIES_ADMIN = [
    { id: 'cat-1', name: 'Ana Yemek', icon: '🍖', sort_order: 1 },
    { id: 'cat-2', name: 'İçecekler', icon: '☕', sort_order: 2 },
    { id: 'cat-3', name: 'Kahvaltı', icon: '🍳', sort_order: 3 },
    { id: 'cat-4', name: 'Tatlılar', icon: '🍰', sort_order: 4 },
    { id: 'cat-5', name: 'Salatalar', icon: '🥗', sort_order: 5 },
];

// ─── Default demo tables & waiters ─────────────────────────────────────
const DEFAULT_TABLES: TableData[] = [
    { id: 'tbl-1', table_number: 1, is_active: true },
    { id: 'tbl-2', table_number: 2, is_active: true },
    { id: 'tbl-3', table_number: 3, is_active: true },
    { id: 'tbl-4', table_number: 4, is_active: true },
    { id: 'tbl-5', table_number: 5, is_active: true },
    { id: 'tbl-6', table_number: 6, is_active: true },
    { id: 'tbl-7', table_number: 7, is_active: true },
    { id: 'tbl-8', table_number: 8, is_active: true },
    { id: 'tbl-9', table_number: 9, is_active: true },
    { id: 'tbl-10', table_number: 10, is_active: true },
];

const DEFAULT_WAITERS: WaiterData[] = [
    { id: 'w-1', full_name: 'Ahmet Yılmaz', phone: '0532 111 22 33', is_active: true },
    { id: 'w-2', full_name: 'Mehmet Demir', phone: '0533 444 55 66', is_active: true },
    { id: 'w-3', full_name: 'Ayşe Kaya', phone: '0534 777 88 99', is_active: true },
];

type AdminTab = 'dashboard' | 'kasa' | 'raporlar' | 'masalar' | 'garsonlar' | 'dis_siparis' | 'entegrasyonlar' | 'menu';

interface PlatformIntegration {
    id: string;
    restaurant_id: string;
    platform: string;
    seller_id: string | null;
    store_name: string | null;
    store_link: string | null;
    api_key: string | null;
    api_secret: string | null;
    token: string | null;
    is_active: boolean;
}

const PLATFORM_INFO: Record<string, { name: string; color: string; emoji: string }> = {
    trendyol_go: { name: 'Trendyol Go', color: '#F27A1A', emoji: '🟠' },
    getir: { name: 'Getir', color: '#5D3EBC', emoji: '🟣' },
    migros: { name: 'Migros Yemek', color: '#F58220', emoji: '🟠' },
    yemeksepeti: { name: 'Yemek Sepeti', color: '#FA0050', emoji: '🔴' },
};

const ALL_PLATFORMS = ['trendyol_go', 'getir', 'migros', 'yemeksepeti'];

interface RestaurantData {
    id: string;
    name: string;
    slug: string;
    is_active: boolean;
    subscription_plan: string;
    logo_url?: string | null;
}

interface CategoryData {
    id: string;
    name: string;
    icon: string;
    sort_order: number;
    image_url?: string | null;
}

interface ProductData {
    id: string;
    name: string;
    price: number;
    description: string | null;
    category_id: string;
    is_available: boolean;
    image_url?: string | null;
    category?: CategoryData;
}

const KASA_PASSWORD = 'kasa123';
const KASA_AUTH_KEY = 'kasa_auth_session';

interface TableData {
    id: string;
    table_number: number;
    is_active: boolean;
}

interface WaiterData {
    id: string;
    full_name: string;
    phone: string | null;
    is_active: boolean;
}

interface ReportData {
    totalRevenue: number;
    totalOrders: number;
    averageOrder: number;
    restaurantRevenue: number;
    restaurantOrders: number;
    thirdPartyRevenue: number;
    thirdPartyOrders: number;
    orders: any[];
}

export default function AdminPage() {
    const { getTablePaymentSummary, updateOrderStatus, clearPaidOrders, orders, createThirdPartyOrder } = useOrders();
    const { role } = useAuth();
    const { showToast } = useToast();
    const { refreshMenu } = useMenu();
    const { t } = useLanguage();
    const isSuperAdmin = role === 'super_admin';

    // Tab state
    const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

    // Custom confirm dialog (replaces window.confirm which closes too fast)
    const [confirmDialog, setConfirmDialog] = useState<{ message: string; onConfirm: () => void } | null>(null);

    // Kasa password
    const [kasaUnlocked, setKasaUnlocked] = useState(() => {
        return sessionStorage.getItem(KASA_AUTH_KEY) === 'true';
    });
    const [kasaPassword, setKasaPassword] = useState('');

    // Kasa payment
    const [selectedTable, setSelectedTable] = useState<number | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Reports
    const [reportPeriod, setReportPeriod] = useState('daily');
    const [reportSource, setReportSource] = useState('all');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [reportData, setReportData] = useState<ReportData | null>(null);
    const [reportLoading, setReportLoading] = useState(false);

    // Tables management
    const [tablesList, setTablesList] = useState<TableData[]>([]);
    const [newTableNumber, setNewTableNumber] = useState('');
    const [tablesLoading, setTablesLoading] = useState(false);

    // Waiters management
    const [waitersList, setWaitersList] = useState<WaiterData[]>([]);
    const [newWaiterName, setNewWaiterName] = useState('');
    const [newWaiterPhone, setNewWaiterPhone] = useState('');
    const [waitersLoading, setWaitersLoading] = useState(false);

    // Dış Sipariş (Third-party order)
    const [disPlatform, setDisPlatform] = useState<OrderSource>('yemeksepeti');
    const [disMenuProducts, setDisMenuProducts] = useState<any[]>([]);
    const [disCart, setDisCart] = useState<Record<string, { id: string; name: string; price: number; quantity: number }>>({});
    const [disNote, setDisNote] = useState('');
    const [disSubmitting, setDisSubmitting] = useState(false);

    // Menu management
    const [menuRestaurants, setMenuRestaurants] = useState<RestaurantData[]>([]);
    const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>('');
    const [menuCategories, setMenuCategories] = useState<CategoryData[]>([]);
    const [menuProducts, setMenuProducts] = useState<ProductData[]>([]);
    const [menuLoading, setMenuLoading] = useState(false);
    const [menuSelectedCat, setMenuSelectedCat] = useState<string>('all');
    const [showAddCategory, setShowAddCategory] = useState(false);
    const [newCatName, setNewCatName] = useState('');
    const [editingCategory, setEditingCategory] = useState<CategoryData | null>(null);
    // Category image states
    const [newCatImageFile, setNewCatImageFile] = useState<File | null>(null);
    const [newCatImagePreview, setNewCatImagePreview] = useState<string>('');
    const [editCatImageFile, setEditCatImageFile] = useState<File | null>(null);
    const [editCatImagePreview, setEditCatImagePreview] = useState<string>('');
    const [showAddProduct, setShowAddProduct] = useState(false);
    const [newProdName, setNewProdName] = useState('');
    const [newProdPrice, setNewProdPrice] = useState('');
    const [newProdDesc, setNewProdDesc] = useState('');
    const [newProdCatId, setNewProdCatId] = useState('');
    const [editingProduct, setEditingProduct] = useState<ProductData | null>(null);

    // Platform integrations
    const [integrations, setIntegrations] = useState<PlatformIntegration[]>([]);
    const [intLoading, setIntLoading] = useState(false);
    const [editingIntegration, setEditingIntegration] = useState<string | null>(null); // platform slug being edited
    const [intForm, setIntForm] = useState({ seller_id: '', store_name: '', store_link: '', api_key: '', api_secret: '', token: '' });
    const [intTestResult, setIntTestResult] = useState<{ platform: string; success: boolean; message: string } | null>(null);
    const [intSaving, setIntSaving] = useState(false);

    // Image upload states
    const [newProdImageFile, setNewProdImageFile] = useState<File | null>(null);
    const [newProdImagePreview, setNewProdImagePreview] = useState<string>('');
    const [editProdImageFile, setEditProdImageFile] = useState<File | null>(null);
    const [editProdImagePreview, setEditProdImagePreview] = useState<string>('');
    const [imageUploading, setImageUploading] = useState(false);

    // Image upload helper
    const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

    const handleImageSelect = (file: File | null, mode: 'add' | 'edit') => {
        if (!file) {
            if (mode === 'add') { setNewProdImageFile(null); setNewProdImagePreview(''); }
            else { setEditProdImageFile(null); setEditProdImagePreview(''); }
            return;
        }
        if (file.size > MAX_IMAGE_SIZE) {
            showToast('Görsel boyutu max 5MB olmalı', 'error');
            return;
        }
        if (mode === 'add') { setNewProdImageFile(file); } else { setEditProdImageFile(file); }
        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result as string;
            if (mode === 'add') setNewProdImagePreview(result);
            else setEditProdImagePreview(result);
        };
        reader.readAsDataURL(file);
    };

    const uploadImageFile = async (file: File): Promise<string | null> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const base64 = e.target?.result as string;
                try {
                    const { data } = await menuAPI.uploadImage(base64, `${Date.now()}-${file.name}`);
                    resolve(data.url);
                } catch (err: any) {
                    const msg = err?.response?.data?.error || 'Görsel yüklenemedi';
                    console.error('Image upload failed:', msg);
                    showToast(msg, 'error');
                    resolve(null);
                }
            };
            reader.readAsDataURL(file);
        });
    };

    // --- Kasa Logic ---
    const tableSummary = getTablePaymentSummary();
    const tables = Object.keys(tableSummary).map(Number).sort((a, b) => a - b);

    const getTotalPaidRevenue = () => {
        const paidOrders = orders.filter((order) => order.status === 'Ödendi' || order.status === 'Kuryeye Teslim Edildi');
        return paidOrders.reduce((sum, order) => sum + order.totals.total, 0);
    };
    const dailyRevenue = getTotalPaidRevenue();

    const getRestaurantRevenue = () => {
        const restaurantPaid = orders.filter((order) => (order.status === 'Ödendi' || order.status === 'Kuryeye Teslim Edildi') && (!order.source || order.source === 'restaurant'));
        return restaurantPaid.reduce((sum, order) => sum + order.totals.total, 0);
    };
    const getThirdPartyRevenue = () => {
        const thirdPartyPaid = orders.filter((order) => (order.status === 'Ödendi' || order.status === 'Kuryeye Teslim Edildi') && order.source && order.source !== 'restaurant');
        return thirdPartyPaid.reduce((sum, order) => sum + order.totals.total, 0);
    };

    const handleKasaLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (kasaPassword === KASA_PASSWORD) {
            setKasaUnlocked(true);
            sessionStorage.setItem(KASA_AUTH_KEY, 'true');
            setKasaPassword('');
            showToast('Kasa erişimi açıldı', 'success');
        } else {
            showToast('Hatalı kasa parolası!', 'error');
            setKasaPassword('');
        }
    };

    const processPOSPayment = async (amount: number, _tableNumber: number) => {
        await new Promise(resolve => setTimeout(resolve, 1500));
        return { success: true, transactionId: `TXN-${Date.now()}`, amount, timestamp: new Date().toISOString() };
    };

    const handlePayment = async (tableNumber: number) => {
        const tableData = tableSummary[tableNumber];
        if (!tableData) return;
        setIsProcessing(true);
        try {
            const result = await processPOSPayment(tableData.total, tableNumber);
            if (result.success) {
                const orderIds = tableData.orders.map(order => order.orderId);
                tableData.orders.forEach(order => { updateOrderStatus(order.orderId, 'Ödendi'); });
                showToast(`Masa ${tableNumber} - ${formatCurrency(tableData.total)} ödeme alındı!`, 'success');
                setSelectedTable(null);
                setTimeout(() => { clearPaidOrders(orderIds); }, 500);
            }
        } catch {
            showToast('Ödeme işlemi başarısız!', 'error');
        } finally {
            setIsProcessing(false);
        }
    };

    // --- Reports Logic ---
    const generateLocalReport = useCallback((): ReportData => {
        // Filter orders by date range
        const now = new Date();
        let startDate: Date;
        let endDate = now;

        switch (reportPeriod) {
            case 'daily':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                break;
            case 'weekly':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'monthly':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'custom':
                startDate = customStartDate ? new Date(customStartDate) : new Date(0);
                endDate = customEndDate ? new Date(customEndDate + 'T23:59:59') : now;
                break;
            default:
                startDate = new Date(0);
        }

        const paidStatuses = ['Ödendi', 'Kuryeye Teslim Edildi', 'Teslim Edildi', 'Hazır', 'Mutfakta'];
        let filtered = orders.filter(o => {
            const d = new Date(o.createdAt);
            return d >= startDate && d <= endDate && paidStatuses.includes(o.status);
        });

        // Filter by source
        if (reportSource !== 'all') {
            filtered = filtered.filter(o => (o.source || 'restaurant') === reportSource);
        }

        const totalRevenue = filtered.reduce((s, o) => s + o.totals.total, 0);
        const restaurantFiltered = filtered.filter(o => !o.source || o.source === 'restaurant');
        const thirdPartyFiltered = filtered.filter(o => o.source && o.source !== 'restaurant');

        return {
            totalRevenue,
            totalOrders: filtered.length,
            averageOrder: filtered.length > 0 ? totalRevenue / filtered.length : 0,
            restaurantRevenue: restaurantFiltered.reduce((s, o) => s + o.totals.total, 0),
            restaurantOrders: restaurantFiltered.length,
            thirdPartyRevenue: thirdPartyFiltered.reduce((s, o) => s + o.totals.total, 0),
            thirdPartyOrders: thirdPartyFiltered.length,
            orders: filtered.map(o => ({
                id: o.orderId,
                order_code: o.orderId,
                total: o.totals.total,
                order_source: o.source || 'restaurant',
                table: { table_number: o.table.tableNumber },
                paid_at: o.createdAt,
            })),
        };
    }, [orders, reportPeriod, reportSource, customStartDate, customEndDate]);

    const loadReport = useCallback(async () => {
        setReportLoading(true);
        try {
            const params: any = { source: reportSource };
            if (reportPeriod === 'custom') {
                if (!customStartDate || !customEndDate) {
                    setReportLoading(false);
                    return;
                }
                params.startDate = customStartDate;
                params.endDate = customEndDate;
            } else {
                params.period = reportPeriod;
            }
            const { data } = await reportAPI.get(params);
            setReportData(data);
        } catch {
            // Offline fallback: generate report from local orders
            const localReport = generateLocalReport();
            setReportData(localReport);
        } finally {
            setReportLoading(false);
        }
    }, [reportPeriod, reportSource, customStartDate, customEndDate, showToast, generateLocalReport]);

    useEffect(() => {
        if (activeTab === 'raporlar') {
            loadReport();
        }
    }, [activeTab, loadReport]);

    // --- Tables Logic ---
    const loadTables = useCallback(async () => {
        setTablesLoading(true);
        try {
            const { data } = await tablesAPI.getAll();
            setTablesList(data);
        } catch {
            // Offline fallback
            const local = getStorageItem<TableData[]>(TABLES_STORAGE_KEY, DEFAULT_TABLES);
            setTablesList(local);
        } finally {
            setTablesLoading(false);
        }
    }, []);

    useEffect(() => {
        if (activeTab === 'masalar' || activeTab === 'dashboard') loadTables();
    }, [activeTab, loadTables]);

    const handleAddTable = async (e: React.FormEvent) => {
        e.preventDefault();
        const num = parseInt(newTableNumber);
        if (!num || num < 1) { showToast('Geçerli bir masa numarası girin', 'error'); return; }
        // Check duplicate
        if (tablesList.some(t => t.table_number === num)) {
            showToast(`Masa ${num} zaten mevcut`, 'error');
            return;
        }
        try {
            await tablesAPI.create(num);
            showToast(`Masa ${num} eklendi`, 'success');
            setNewTableNumber('');
            loadTables();
        } catch {
            // Offline fallback: add locally
            const counter = getStorageItem<number>(TABLE_COUNTER_KEY, 100) + 1;
            setStorageItem(TABLE_COUNTER_KEY, counter);
            const newTable: TableData = { id: `tbl-local-${counter}`, table_number: num, is_active: true };
            const updated = [...tablesList, newTable].sort((a, b) => a.table_number - b.table_number);
            setTablesList(updated);
            setStorageItem(TABLES_STORAGE_KEY, updated);
            showToast(`Masa ${num} eklendi`, 'success');
            setNewTableNumber('');
        }
    };

    const handleDeleteTable = async (table: TableData) => {
        setConfirmDialog({
            message: `Masa ${table.table_number} silinecek. Emin misiniz?`,
            onConfirm: async () => {
                setConfirmDialog(null);
                try {
                    await tablesAPI.remove(table.id);
                    showToast(`Masa ${table.table_number} silindi`, 'success');
                    loadTables();
                } catch {
                    const updated = tablesList.filter(t => t.id !== table.id);
                    setTablesList(updated);
                    setStorageItem(TABLES_STORAGE_KEY, updated);
                    showToast(`Masa ${table.table_number} silindi`, 'success');
                }
            }
        });
    };

    // --- Waiters Logic ---
    const loadWaiters = useCallback(async () => {
        setWaitersLoading(true);
        try {
            const { data } = await waitersAPI.getAll();
            setWaitersList(data);
        } catch {
            // Offline fallback
            const local = getStorageItem<WaiterData[]>(WAITERS_STORAGE_KEY, DEFAULT_WAITERS);
            setWaitersList(local);
        } finally {
            setWaitersLoading(false);
        }
    }, []);

    useEffect(() => {
        if (activeTab === 'garsonlar') loadWaiters();
    }, [activeTab, loadWaiters]);

    // --- Menu Data ---
    const loadRestaurants = useCallback(async () => {
        try {
            const { data } = await menuAPI.getRestaurants();
            setMenuRestaurants(data);
            // Auto-select the first restaurant if none selected yet
            if (data && data.length > 0 && !selectedRestaurantId) {
                setSelectedRestaurantId(data[0].id);
            }
        } catch {
            // silently use empty list
        }
    }, [selectedRestaurantId]);

    const loadMenuData = useCallback(async () => {
        setMenuLoading(true);
        try {
            const [catRes, prodRes] = await Promise.all([
                menuAPI.getCategories(selectedRestaurantId),
                menuAPI.getAllProducts(selectedRestaurantId),
            ]);
            setMenuCategories(catRes.data);
            setMenuProducts(prodRes.data);
        } catch {
            // Offline fallback
            setMenuCategories(DEMO_CATEGORIES_ADMIN);
            setMenuProducts(DEMO_MENU_PRODUCTS.map(p => ({ ...p, description: null })));
        } finally {
            setMenuLoading(false);
        }
    }, [selectedRestaurantId]);

    // Load restaurants on mount for all admin users (needed for logo upload)
    useEffect(() => {
        loadRestaurants();
    }, [loadRestaurants]);

    useEffect(() => {
        if (activeTab === 'menu') {
            loadMenuData();
        }
    }, [activeTab, loadMenuData]);

    const handleAddWaiter = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newWaiterName.trim()) { showToast('Garson adı girin', 'error'); return; }
        try {
            await waitersAPI.create(newWaiterName, newWaiterPhone || undefined);
            showToast(`${newWaiterName} eklendi`, 'success');
            setNewWaiterName('');
            setNewWaiterPhone('');
            loadWaiters();
        } catch {
            // Offline fallback: add locally
            const counter = getStorageItem<number>(WAITER_COUNTER_KEY, 100) + 1;
            setStorageItem(WAITER_COUNTER_KEY, counter);
            const newWaiter: WaiterData = {
                id: `w-local-${counter}`,
                full_name: newWaiterName.trim(),
                phone: newWaiterPhone || null,
                is_active: true,
            };
            const updated = [...waitersList, newWaiter];
            setWaitersList(updated);
            setStorageItem(WAITERS_STORAGE_KEY, updated);
            showToast(`${newWaiterName} eklendi`, 'success');
            setNewWaiterName('');
            setNewWaiterPhone('');
        }
    };

    const handleDeleteWaiter = async (waiter: WaiterData) => {
        setConfirmDialog({
            message: `${waiter.full_name} silinecek. Emin misiniz?`,
            onConfirm: async () => {
                setConfirmDialog(null);
                try {
                    await waitersAPI.remove(waiter.id);
                    showToast(`${waiter.full_name} silindi`, 'success');
                    loadWaiters();
                } catch {
                    const updated = waitersList.filter(w => w.id !== waiter.id);
                    setWaitersList(updated);
                    setStorageItem(WAITERS_STORAGE_KEY, updated);
                    showToast(`${waiter.full_name} silindi`, 'success');
                }
            }
        });
    };

    // --- Period Label ---
    const getPeriodLabel = () => {
        switch (reportPeriod) {
            case 'daily': return 'Bugün';
            case 'weekly': return 'Bu Hafta';
            case 'monthly': return 'Bu Ay';
            case 'custom': return 'Özel Tarih';
            default: return '';
        }
    };

    // --- Dış Sipariş Logic ---
    const loadMenuProducts = useCallback(async () => {
        try {
            const { data } = await menuAPI.getProducts();
            setDisMenuProducts(data);
        } catch {
            // Offline fallback: use demo menu
            setDisMenuProducts(DEMO_MENU_PRODUCTS);
        }
    }, []);

    useEffect(() => {
        if (activeTab === 'dis_siparis' && disMenuProducts.length === 0) loadMenuProducts();
    }, [activeTab, disMenuProducts.length, loadMenuProducts]);

    const addToDisCart = (product: any) => {
        setDisCart(prev => {
            const existing = prev[product.id];
            if (existing) {
                return { ...prev, [product.id]: { ...existing, quantity: existing.quantity + 1 } };
            }
            return { ...prev, [product.id]: { id: product.id, name: product.name, price: product.price, quantity: 1 } };
        });
    };

    const removeFromDisCart = (productId: string) => {
        setDisCart(prev => {
            const existing = prev[productId];
            if (!existing) return prev;
            if (existing.quantity <= 1) {
                const next = { ...prev };
                delete next[productId];
                return next;
            }
            return { ...prev, [productId]: { ...existing, quantity: existing.quantity - 1 } };
        });
    };

    const disCartItems = Object.values(disCart);
    const disCartTotal = disCartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const handleDisSubmit = async () => {
        if (disCartItems.length === 0) { showToast('En az 1 ürün ekleyin', 'error'); return; }
        setDisSubmitting(true);
        try {
            await createThirdPartyOrder(disPlatform, disCartItems, disNote || undefined);
            showToast(`${disPlatform === 'yemeksepeti' ? 'Yemeksepeti' : disPlatform === 'trendyol' ? 'Trendyol Go' : 'Getir'} siparişi mutfağa gönderildi!`, 'success');
            setDisCart({});
            setDisNote('');
        } catch (err: any) {
            showToast(err.response?.data?.error || 'Sipariş gönderilemedi', 'error');
        } finally {
            setDisSubmitting(false);
        }
    };

    // ======================
    // RENDER
    // ======================
    return (
        <div className={styles.page}>

            {/* Tab Navigation */}
            < div className={styles.tabNav} >
                <button className={`${styles.tabBtn} ${activeTab === 'dashboard' ? styles.tabActive : ''}`} onClick={() => setActiveTab('dashboard')}>
                    📊 Anlık Durum
                </button>
                <button className={`${styles.tabBtn} ${activeTab === 'kasa' ? styles.tabActive : ''}`} onClick={() => setActiveTab('kasa')}>
                    {t('adminCashier')}
                </button>
                <button className={`${styles.tabBtn} ${activeTab === 'raporlar' ? styles.tabActive : ''}`} onClick={() => setActiveTab('raporlar')}>
                    {t('adminReports')}
                </button>
                <button className={`${styles.tabBtn} ${activeTab === 'masalar' ? styles.tabActive : ''}`} onClick={() => setActiveTab('masalar')}>
                    {t('adminTables')}
                </button>
                <button className={`${styles.tabBtn} ${activeTab === 'garsonlar' ? styles.tabActive : ''}`} onClick={() => setActiveTab('garsonlar')}>
                    {t('adminWaiters')}
                </button>
                <button className={`${styles.tabBtn} ${activeTab === 'dis_siparis' ? styles.tabActive : ''}`} onClick={() => setActiveTab('dis_siparis')}>
                    {t('adminThirdParty')}
                </button>
                <button className={`${styles.tabBtn} ${activeTab === 'entegrasyonlar' ? styles.tabActive : ''}`} onClick={() => setActiveTab('entegrasyonlar')}>
                    🔗 Entegrasyonlar
                </button>
                <button className={`${styles.tabBtn} ${activeTab === 'menu' ? styles.tabActive : ''}`} onClick={() => setActiveTab('menu')}>
                    {t('adminMenu')}
                </button>
            </div >

            {/* ======================== DASHBOARD TAB ======================== */}
            {activeTab === 'dashboard' && (() => {
                // Compute dashboard stats from orders & tablesList
                const allTableNumbers = tablesList.map(t => t.table_number).sort((a, b) => a - b);
                const occupiedTables = new Set<number>();
                const tablesWithPendingPayment = new Set<number>();
                const tableGuestCount: Record<number, number> = {};
                const tableOpenAmount: Record<number, number> = {};

                // Analyze all active orders
                orders.forEach(order => {
                    const tNum = order.table.tableNumber;
                    if (tNum === 0) return; // skip third-party orders

                    if (order.status !== 'Ödendi' && order.status !== 'İptal' && order.status !== 'Kuryeye Teslim Edildi') {
                        occupiedTables.add(tNum);
                        tableOpenAmount[tNum] = (tableOpenAmount[tNum] || 0) + order.totals.total;
                        tableGuestCount[tNum] = (tableGuestCount[tNum] || 0) + (order.items?.length || 1);
                    }
                    if (order.status === 'Hazır' || order.status === 'Teslim Edildi') {
                        tablesWithPendingPayment.add(tNum);
                    }
                });

                const totalTables = allTableNumbers.length || 12;
                const occupiedCount = occupiedTables.size;
                const emptyCount = totalTables - occupiedCount;
                const occupancyRate = totalTables > 0 ? Math.round((occupiedCount / totalTables) * 100) : 0;
                const totalOpenBill = Object.values(tableOpenAmount).reduce((s, v) => s + v, 0);
                const pendingPaymentCount = tablesWithPendingPayment.size;

                // Generate table cards (use tablesList if loaded, otherwise generate 1-12)
                const displayTables = allTableNumbers.length > 0 ? allTableNumbers : Array.from({ length: 12 }, (_, i) => i + 1);

                return (
                    <>
                        <h1 className={styles.title} style={{ marginBottom: 16 }}>📊 Anlık Kontrol Paneli</h1>

                        {/* Table Grid */}
                        <div className={styles.dashGrid}>
                            {displayTables.map(tNum => {
                                const isOccupied = occupiedTables.has(tNum);
                                const isPendingPayment = tablesWithPendingPayment.has(tNum);
                                const guests = tableGuestCount[tNum] || 0;
                                const amount = tableOpenAmount[tNum] || 0;

                                let statusClass = styles.dashTableEmpty;
                                if (isPendingPayment) statusClass = styles.dashTablePending;
                                else if (isOccupied) statusClass = styles.dashTableOccupied;

                                return (
                                    <div key={tNum} className={`${styles.dashTableCard} ${statusClass}`}>
                                        {isPendingPayment && <span className={styles.dashPaymentBadge}>💰</span>}
                                        <div className={styles.dashTableNumber}>{tNum}</div>
                                        {isOccupied && (
                                            <>
                                                <div className={styles.dashTableGuests}>{guests} kişi</div>
                                                <div className={styles.dashTableAmount}>₺{amount.toLocaleString('tr-TR')}</div>
                                            </>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Summary Stats */}
                        <div className={styles.dashStats}>
                            <div className={`${styles.dashStatCard} ${styles.dashStatOccupancy}`}>
                                <div className={styles.dashStatValue}>%{occupancyRate}</div>
                                <div className={styles.dashStatLabel}>Doluluk Oranı</div>
                            </div>
                            <div className={`${styles.dashStatCard} ${styles.dashStatBill}`}>
                                <div className={styles.dashStatValue}>₺{totalOpenBill.toLocaleString('tr-TR')}</div>
                                <div className={styles.dashStatLabel}>Açık Adisyon</div>
                            </div>
                            <div className={`${styles.dashStatCard} ${styles.dashStatEmpty}`}>
                                <div className={styles.dashStatValue}>{emptyCount}</div>
                                <div className={styles.dashStatLabel}>Boş Masa</div>
                            </div>
                            <div className={`${styles.dashStatCard} ${styles.dashStatPending}`}>
                                <div className={styles.dashStatValue}>{pendingPaymentCount}</div>
                                <div className={styles.dashStatLabel}>Ödeme Bekliyor</div>
                            </div>
                        </div>

                        {/* Legend */}
                        <div className={styles.dashLegend}>
                            <span className={styles.dashLegendItem}>
                                <span className={`${styles.dashLegendDot} ${styles.dashDotEmpty}`} /> Boş
                            </span>
                            <span className={styles.dashLegendItem}>
                                <span className={`${styles.dashLegendDot} ${styles.dashDotOccupied}`} /> Dolu
                            </span>
                            <span className={styles.dashLegendItem}>
                                <span className={`${styles.dashLegendDot} ${styles.dashDotPending}`} /> Ödeme Bekliyor
                            </span>
                        </div>
                    </>
                );
            })()}

            {/* ======================== KASA TAB ======================== */}
            {
                activeTab === 'kasa' && (
                    !kasaUnlocked ? (
                        <div className={styles.passwordGate}>
                            <div className={styles.lockIcon}>🔒</div>
                            <h2>Kasa Erişimi</h2>
                            <p className={styles.lockDesc}>Kasa işlemleri için parolayı girin</p>
                            <form onSubmit={handleKasaLogin} className={styles.passwordGateForm}>
                                <input
                                    type="password"
                                    value={kasaPassword}
                                    onChange={(e) => setKasaPassword(e.target.value)}
                                    placeholder="Kasa parolası"
                                    className={styles.gateInput}
                                    autoFocus
                                />
                                <button type="submit" className={styles.gateButton}>Giriş Yap</button>
                            </form>
                        </div>
                    ) : (
                        <>
                            <div className={styles.header}>
                                <div>
                                    <h1 className={styles.title}>💰 Kasa</h1>
                                    <div className={styles.revenue}>
                                        Toplam Ciro: <strong>{formatCurrency(dailyRevenue)}</strong>
                                    </div>
                                    <div className={styles.revenueBreakdown}>
                                        <span>🏠 Restoran: {formatCurrency(getRestaurantRevenue())}</span>
                                        <span className={styles.breakdownDivider}>|</span>
                                        <span>📦 Dış Sipariş: {formatCurrency(getThirdPartyRevenue())}</span>
                                    </div>
                                </div>
                                <div className={styles.badge}>{tables.length} Masa</div>
                            </div>

                            {tables.length === 0 ? (
                                <div className={styles.empty}>
                                    <div className={styles.emptyIcon}>✅</div>
                                    <p className={styles.emptyText}>Tüm ödemeler tamamlandı!</p>
                                    <p className={styles.emptySubtext}>Ödeme bekleyen masa yok</p>
                                </div>
                            ) : (
                                <div className={styles.tables}>
                                    {tables.map((tableNum) => {
                                        const tableData = tableSummary[tableNum];
                                        return (
                                            <div key={tableNum} className={styles.tableCard} onClick={() => setSelectedTable(tableNum)}>
                                                <div className={styles.tableHeader}>
                                                    <span className={styles.tableBadge}>Masa {tableNum}</span>
                                                    <span className={styles.orderCount}>{tableData.orders.length} sipariş</span>
                                                </div>
                                                <div className={styles.tableTotal}>{formatCurrency(tableData.total)}</div>
                                                <button className={styles.viewButton}>Detay Gör →</button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Payment Detail Modal */}
                            {selectedTable !== null && tableSummary[selectedTable] && (
                                <div className={styles.modal} onClick={() => setSelectedTable(null)}>
                                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                                        <div className={styles.modalHeader}>
                                            <h2>Masa {selectedTable}</h2>
                                            <button className={styles.closeButton} onClick={() => setSelectedTable(null)}>✕</button>
                                        </div>
                                        <div className={styles.orders}>
                                            {tableSummary[selectedTable].orders.map((order) => (
                                                <div key={order.orderId} className={styles.orderCard}>
                                                    <div className={styles.orderHeader}>
                                                        <span className={styles.orderId}>#{order.orderId}</span>
                                                        <span className={styles.orderTime}>{formatDate(order.createdAt)}</span>
                                                    </div>
                                                    <div className={styles.items}>
                                                        {order.items.map((item) => (
                                                            <div key={item.id} className={styles.item}>
                                                                <span className={styles.itemQuantity}>{item.quantity}x</span>
                                                                <span className={styles.itemName}>{item.name}</span>
                                                                <span className={styles.itemPrice}>{formatCurrency(item.price * item.quantity)}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className={styles.orderTotal}>Toplam: {formatCurrency(order.totals.total)}</div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className={styles.modalFooter}>
                                            <div className={styles.totalSection}>
                                                <span className={styles.totalLabel}>Toplam Tutar:</span>
                                                <span className={styles.totalAmount}>{formatCurrency(tableSummary[selectedTable].total)}</span>
                                            </div>
                                            <button className={styles.paymentButton} onClick={() => handlePayment(selectedTable)} disabled={isProcessing}>
                                                {isProcessing ? <>🔄 İşlem yapılıyor...</> : <>💳 Ödeme Al</>}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )
                )
            }

            {/* ======================== RAPORLAR TAB ======================== */}
            {
                activeTab === 'raporlar' && (
                    <div className={styles.reportSection}>
                        <h2 className={styles.sectionTitle}>📊 Ciro Raporu</h2>

                        <div className={styles.periodSelector}>
                            {['daily', 'weekly', 'monthly', 'custom'].map((p) => (
                                <button
                                    key={p}
                                    className={`${styles.periodBtn} ${reportPeriod === p ? styles.periodActive : ''}`}
                                    onClick={() => setReportPeriod(p)}
                                >
                                    {p === 'daily' ? 'Bugün' : p === 'weekly' ? 'Bu Hafta' : p === 'monthly' ? 'Bu Ay' : 'Özel Tarih'}
                                </button>
                            ))}
                        </div>

                        {/* Source Filter */}
                        <div className={styles.sourceSelector}>
                            {[
                                { key: 'all', label: '📊 Tümü' },
                                { key: 'restaurant', label: '🏠 Restoran' },
                                { key: 'yemeksepeti', label: '🔴 Yemeksepeti' },
                                { key: 'trendyol', label: '🟣 Trendyol' },
                                { key: 'getir', label: '🟢 Getir' },
                            ].map((s) => (
                                <button
                                    key={s.key}
                                    className={`${styles.sourceBtn} ${reportSource === s.key ? styles.sourceActive : ''}`}
                                    onClick={() => setReportSource(s.key)}
                                >
                                    {s.label}
                                </button>
                            ))}
                        </div>

                        {reportPeriod === 'custom' && (
                            <div className={styles.dateRange}>
                                <div className={styles.dateField}>
                                    <label>Başlangıç</label>
                                    <input type="date" value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)} className={styles.dateInput} />
                                </div>
                                <div className={styles.dateField}>
                                    <label>Bitiş</label>
                                    <input type="date" value={customEndDate} onChange={(e) => setCustomEndDate(e.target.value)} className={styles.dateInput} />
                                </div>
                                <button className={styles.dateSearchBtn} onClick={loadReport} disabled={!customStartDate || !customEndDate}>
                                    🔍 Ara
                                </button>
                            </div>
                        )}

                        {reportLoading ? (
                            <div className={styles.loading}>⏳ Rapor yükleniyor...</div>
                        ) : reportData ? (
                            <>
                                <div className={styles.statsGrid}>
                                    <div className={styles.statCard}>
                                        <div className={styles.statLabel}>Toplam Ciro</div>
                                        <div className={styles.statValue} style={{ color: '#10b981' }}>{formatCurrency(reportData.totalRevenue)}</div>
                                        <div className={styles.statCount}>{reportData.totalOrders} sipariş</div>
                                    </div>
                                    <div className={styles.statCard}>
                                        <div className={styles.statLabel}>🏠 Restoran</div>
                                        <div className={styles.statValue} style={{ color: '#3b82f6' }}>{formatCurrency(reportData.restaurantRevenue)}</div>
                                        <div className={styles.statCount}>{reportData.restaurantOrders} sipariş</div>
                                    </div>
                                    <div className={styles.statCard}>
                                        <div className={styles.statLabel}>📦 Dış Sipariş</div>
                                        <div className={styles.statValue} style={{ color: '#f59e0b' }}>{formatCurrency(reportData.thirdPartyRevenue)}</div>
                                        <div className={styles.statCount}>{reportData.thirdPartyOrders} sipariş</div>
                                    </div>
                                    <div className={styles.statCard}>
                                        <div className={styles.statLabel}>Ort. Sipariş</div>
                                        <div className={styles.statValue}>{formatCurrency(reportData.averageOrder)}</div>
                                    </div>
                                </div>

                                <h3 className={styles.subTitle}>{getPeriodLabel()} — Sipariş Detayları ({reportData.orders.length})</h3>

                                {reportData.orders.length === 0 ? (
                                    <div className={styles.emptyReport}>Bu dönemde tamamlanan sipariş bulunmuyor.</div>
                                ) : (
                                    <div className={styles.reportTable}>
                                        <div className={styles.reportRow} style={{ fontWeight: 700, borderBottom: '2px solid var(--color-border)' }}>
                                            <span>Sipariş</span>
                                            <span>Kaynak</span>
                                            <span>Tutar</span>
                                            <span>Tarih</span>
                                        </div>
                                        {reportData.orders.map((o: any) => {
                                            const sourceLabels: Record<string, string> = {
                                                restaurant: `🏠 Masa ${o.table?.table_number || '-'}`,
                                                yemeksepeti: '🔴 Yemeksepeti',
                                                trendyol: '🟣 Trendyol Go',
                                                getir: '🟢 Getir',
                                            };
                                            const sourceLabel = sourceLabels[o.order_source] || `🏠 Masa ${o.table?.table_number || '-'}`;
                                            return (
                                                <div key={o.id} className={styles.reportRow}>
                                                    <span className={styles.reportCode}>{o.order_code}</span>
                                                    <span className={styles.reportSource}>{sourceLabel}</span>
                                                    <span className={styles.reportAmount}>{formatCurrency(Number(o.total))}</span>
                                                    <span className={styles.reportDate}>{o.paid_at ? new Date(o.paid_at).toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' }) : '-'}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </>
                        ) : null}
                    </div>
                )
            }

            {/* ======================== MASALAR TAB ======================== */}
            {
                activeTab === 'masalar' && (
                    <div className={styles.mgmtSection}>
                        <h2 className={styles.sectionTitle}>🪑 Masa Yönetimi</h2>

                        <form onSubmit={handleAddTable} className={styles.addForm}>
                            <input
                                type="number"
                                min="1"
                                value={newTableNumber}
                                onChange={(e) => setNewTableNumber(e.target.value)}
                                placeholder="Masa numarası"
                                className={styles.addInput}
                            />
                            <button type="submit" className={styles.addBtn}>+ Masa Ekle</button>
                        </form>

                        {tablesLoading ? (
                            <div className={styles.loading}>⏳ Yükleniyor...</div>
                        ) : (
                            <div className={styles.mgmtList}>
                                {tablesList.map((t) => (
                                    <div key={t.id} className={styles.mgmtCard}>
                                        <div className={styles.mgmtInfo}>
                                            <span className={styles.mgmtIcon}>🪑</span>
                                            <div>
                                                <div className={styles.mgmtName}>Masa {t.table_number}</div>
                                                <div className={styles.mgmtSub}>{t.is_active ? '✅ Aktif' : '⛔ Pasif'}</div>
                                            </div>
                                        </div>
                                        <button className={styles.deleteBtn} onClick={() => handleDeleteTable(t)}>🗑️ Sil</button>
                                    </div>
                                ))}
                                {tablesList.length === 0 && <div className={styles.emptyReport}>Henüz masa eklenmedi.</div>}
                            </div>
                        )}
                    </div>
                )
            }

            {/* ======================== GARSONLAR TAB ======================== */}
            {
                activeTab === 'garsonlar' && (
                    <div className={styles.mgmtSection}>
                        <h2 className={styles.sectionTitle}>👨‍🍳 Garson Yönetimi</h2>

                        <form onSubmit={handleAddWaiter} className={styles.addForm}>
                            <input
                                type="text"
                                value={newWaiterName}
                                onChange={(e) => setNewWaiterName(e.target.value)}
                                placeholder="Ad Soyad"
                                className={styles.addInput}
                            />
                            <input
                                type="text"
                                value={newWaiterPhone}
                                onChange={(e) => setNewWaiterPhone(e.target.value)}
                                placeholder="Telefon (opsiyonel)"
                                className={styles.addInputSmall}
                            />
                            <button type="submit" className={styles.addBtn}>+ Garson Ekle</button>
                        </form>

                        {waitersLoading ? (
                            <div className={styles.loading}>⏳ Yükleniyor...</div>
                        ) : (
                            <div className={styles.mgmtList}>
                                {waitersList.map((w) => (
                                    <div key={w.id} className={styles.mgmtCard}>
                                        <div className={styles.mgmtInfo}>
                                            <span className={styles.mgmtIcon}>👤</span>
                                            <div>
                                                <div className={styles.mgmtName}>{w.full_name}</div>
                                                <div className={styles.mgmtSub}>{w.phone || 'Telefon yok'}</div>
                                            </div>
                                        </div>
                                        <button className={styles.deleteBtn} onClick={() => handleDeleteWaiter(w)}>🗑️ Sil</button>
                                    </div>
                                ))}
                                {waitersList.length === 0 && <div className={styles.emptyReport}>Henüz garson eklenmedi.</div>}
                            </div>
                        )}
                    </div>
                )
            }

            {/* ======================== DIŞ SİPARİŞ TAB ======================== */}
            {
                activeTab === 'dis_siparis' && (
                    <div className={styles.mgmtSection}>
                        <h2 className={styles.sectionTitle}>📦 Dış Sipariş Girişi</h2>

                        {/* Platform Selection */}
                        <div className={styles.platformSelector}>
                            <label className={styles.platformLabel}>Platform:</label>
                            <div className={styles.platformButtons}>
                                {[
                                    { key: 'yemeksepeti' as OrderSource, label: '🔴 Yemeksepeti', color: '#e31e24' },
                                    { key: 'trendyol' as OrderSource, label: '🟣 Trendyol Go', color: '#6b3fa0' },
                                    { key: 'getir' as OrderSource, label: '🟢 Getir', color: '#5d3ebc' },
                                ].map((p) => (
                                    <button
                                        key={p.key}
                                        className={`${styles.platformBtn} ${disPlatform === p.key ? styles.platformActive : ''}`}
                                        style={disPlatform === p.key ? { background: p.color, color: 'white' } : {}}
                                        onClick={() => setDisPlatform(p.key)}
                                    >
                                        {p.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Product Picker */}
                        <div className={styles.disLayout}>
                            <div className={styles.disMenu}>
                                <h3 className={styles.disSubtitle}>Menü</h3>
                                <div className={styles.disProductGrid}>
                                    {disMenuProducts.map((product: any) => (
                                        <button
                                            key={product.id}
                                            className={`${styles.disProductCard} ${disCart[product.id] ? styles.disProductSelected : ''}`}
                                            onClick={() => addToDisCart(product)}
                                        >
                                            <span className={styles.disProductName}>{product.name}</span>
                                            <span className={styles.disProductPrice}>{formatCurrency(product.price)}</span>
                                            {disCart[product.id] && (
                                                <span className={styles.disProductQty}>{disCart[product.id].quantity}</span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className={styles.disCartPanel}>
                                <h3 className={styles.disSubtitle}>Sipariş ({disCartItems.length} ürün)</h3>
                                {disCartItems.length === 0 ? (
                                    <div className={styles.emptyReport}>Ürün ekleyin</div>
                                ) : (
                                    <>
                                        <div className={styles.disCartList}>
                                            {disCartItems.map((item) => (
                                                <div key={item.id} className={styles.disCartItem}>
                                                    <div className={styles.disCartItemInfo}>
                                                        <span className={styles.disCartItemName}>{item.name}</span>
                                                        <span className={styles.disCartItemPrice}>{formatCurrency(item.price * item.quantity)}</span>
                                                    </div>
                                                    <div className={styles.disCartControls}>
                                                        <button className={styles.disQtyBtn} onClick={() => removeFromDisCart(item.id)}>−</button>
                                                        <span className={styles.disQtyValue}>{item.quantity}</span>
                                                        <button className={styles.disQtyBtn} onClick={() => addToDisCart({ id: item.id, name: item.name, price: item.price })}>+</button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <textarea
                                            value={disNote}
                                            onChange={(e) => setDisNote(e.target.value)}
                                            placeholder="Sipariş notu (opsiyonel)"
                                            className={styles.disNoteInput}
                                            rows={2}
                                        />

                                        <div className={styles.disCartFooter}>
                                            <div className={styles.disCartTotal}>Toplam: {formatCurrency(disCartTotal)}</div>
                                            <button
                                                className={styles.disSubmitBtn}
                                                onClick={handleDisSubmit}
                                                disabled={disSubmitting}
                                            >
                                                {disSubmitting ? '⏳ Gönderiliyor...' : '🛵 Mutfağa Gönder'}
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }

            {/* ======================== ENTEGRASYONLAR TAB ======================== */}
            {activeTab === 'entegrasyonlar' && (() => {
                // Load integrations when tab is active
                const loadIntegrations = async () => {
                    if (intLoading) return;
                    setIntLoading(true);
                    try {
                        const { data } = await integrationsAPI.getAll(selectedRestaurantId || undefined);
                        setIntegrations(data);
                    } catch {
                        setIntegrations([]);
                    } finally {
                        setIntLoading(false);
                    }
                };

                const handleSave = async (platform: string) => {
                    setIntSaving(true);
                    try {
                        const existing = integrations.find(i => i.platform === platform);
                        if (existing) {
                            const { data } = await integrationsAPI.update(existing.id, intForm);
                            setIntegrations(prev => prev.map(i => i.id === existing.id ? data : i));
                        } else {
                            const { data } = await integrationsAPI.create({
                                restaurant_id: selectedRestaurantId || 'rest-002',
                                platform,
                                ...intForm,
                            });
                            setIntegrations(prev => [...prev, data]);
                        }
                        showToast('Entegrasyon kaydedildi!', 'success');
                        setEditingIntegration(null);
                    } catch {
                        showToast('Entegrasyon kaydedilemedi', 'error');
                    } finally {
                        setIntSaving(false);
                    }
                };

                const handleDelete = async (id: string) => {
                    if (!confirm('Bu entegrasyonu silmek istediğinize emin misiniz?')) return;
                    try {
                        await integrationsAPI.remove(id);
                        setIntegrations(prev => prev.filter(i => i.id !== id));
                        showToast('Entegrasyon silindi', 'success');
                    } catch {
                        showToast('Entegrasyon silinemedi', 'error');
                    }
                };

                const handleTest = async (id: string, platform: string) => {
                    try {
                        const { data } = await integrationsAPI.test(id);
                        setIntTestResult({ platform, success: data.success, message: data.message });
                        showToast(data.message, data.success ? 'success' : 'error');
                    } catch {
                        setIntTestResult({ platform, success: false, message: 'Bağlantı testi başarısız' });
                        showToast('Bağlantı testi başarısız', 'error');
                    }
                };

                const handleToggle = async (id: string, currentState: boolean) => {
                    try {
                        const { data } = await integrationsAPI.update(id, { is_active: !currentState });
                        setIntegrations(prev => prev.map(i => i.id === id ? data : i));
                        showToast(!currentState ? 'Entegrasyon aktif edildi' : 'Entegrasyon pasif yapıldı', 'success');
                    } catch {
                        showToast('Durum değiştirilemedi', 'error');
                    }
                };

                const openEdit = (platform: string) => {
                    const existing = integrations.find(i => i.platform === platform);
                    setIntForm({
                        seller_id: existing?.seller_id || '',
                        store_name: existing?.store_name || '',
                        store_link: existing?.store_link || '',
                        api_key: existing?.api_key || '',
                        api_secret: existing?.api_secret || '',
                        token: existing?.token || '',
                    });
                    setEditingIntegration(platform);
                    setIntTestResult(null);
                };

                // Auto-load on first render
                if (integrations.length === 0 && !intLoading) {
                    loadIntegrations();
                }

                return (
                    <>
                        <h1 className={styles.title} style={{ marginBottom: 16 }}>🔗 Platform Entegrasyonları</h1>
                        <p style={{ color: 'var(--color-text-muted)', marginBottom: 24, fontSize: '0.9rem' }}>
                            Trendyol Go, Getir, Migros Yemek ve Yemek Sepeti için API bilgilerinizi girerek gerçek zamanlı entegrasyon sağlayın.
                        </p>

                        {/* Platform Grid */}
                        <div className={styles.intGrid}>
                            {ALL_PLATFORMS.map(platform => {
                                const info = PLATFORM_INFO[platform];
                                const existing = integrations.find(i => i.platform === platform);
                                const isEditing = editingIntegration === platform;

                                return (
                                    <div key={platform} className={styles.intCard} style={{ borderColor: existing ? info.color : 'var(--color-border)' }}>
                                        {/* Card Header */}
                                        <div className={styles.intCardHeader} style={{ background: `${info.color}15` }}>
                                            <div className={styles.intCardTitle}>
                                                <span style={{ fontSize: '1.5rem' }}>{info.emoji}</span>
                                                <h3 style={{ color: info.color }}>{info.name}</h3>
                                            </div>
                                            {existing && (
                                                <div className={styles.intStatusBadge} style={{ background: existing.is_active ? '#22c55e20' : '#ef444420', color: existing.is_active ? '#22c55e' : '#ef4444' }}>
                                                    {existing.is_active ? '✅ Aktif' : '⏸️ Pasif'}
                                                </div>
                                            )}
                                            {!existing && (
                                                <div className={styles.intStatusBadge} style={{ background: '#64748b20', color: '#94a3b8' }}>
                                                    Bağlı Değil
                                                </div>
                                            )}
                                        </div>

                                        {/* Card Body */}
                                        {!isEditing ? (
                                            <div className={styles.intCardBody}>
                                                {existing ? (
                                                    <>
                                                        <div className={styles.intFieldRow}>
                                                            <span className={styles.intFieldLabel}>Satıcı ID:</span>
                                                            <span className={styles.intFieldValue}>{existing.seller_id || '—'}</span>
                                                        </div>
                                                        <div className={styles.intFieldRow}>
                                                            <span className={styles.intFieldLabel}>Mağaza:</span>
                                                            <span className={styles.intFieldValue}>{existing.store_name || '—'}</span>
                                                        </div>
                                                        <div className={styles.intFieldRow}>
                                                            <span className={styles.intFieldLabel}>API Key:</span>
                                                            <span className={styles.intFieldValue}>{existing.api_key ? '••••••••' : '—'}</span>
                                                        </div>
                                                        <div className={styles.intCardActions}>
                                                            <button className={styles.intBtnEdit} onClick={() => openEdit(platform)}>✏️ Düzenle</button>
                                                            <button className={styles.intBtnTest} onClick={() => handleTest(existing.id, platform)}>🔌 Test</button>
                                                            <button className={styles.intBtnToggle} onClick={() => handleToggle(existing.id, existing.is_active)} style={{ color: existing.is_active ? '#ef4444' : '#22c55e' }}>
                                                                {existing.is_active ? '⏸️ Pasif' : '▶️ Aktif'}
                                                            </button>
                                                            <button className={styles.intBtnDelete} onClick={() => handleDelete(existing.id)}>🗑️</button>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                                                        <p style={{ color: 'var(--color-text-muted)', marginBottom: 12 }}>Henüz bağlanmadı</p>
                                                        <button className={styles.intBtnConnect} style={{ background: info.color }} onClick={() => openEdit(platform)}>
                                                            ➕ Bağlan
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            /* Edit Form */
                                            <div className={styles.intCardBody}>
                                                <div className={styles.intFormGroup}>
                                                    <label>Satıcı ID</label>
                                                    <input type="text" value={intForm.seller_id} onChange={e => setIntForm(f => ({ ...f, seller_id: e.target.value }))} placeholder="Satıcı/Vendor ID" />
                                                </div>
                                                <div className={styles.intFormGroup}>
                                                    <label>Mağaza Adı</label>
                                                    <input type="text" value={intForm.store_name} onChange={e => setIntForm(f => ({ ...f, store_name: e.target.value }))} placeholder="Mağaza adınız" />
                                                </div>
                                                <div className={styles.intFormGroup}>
                                                    <label>Mağaza Linki</label>
                                                    <input type="url" value={intForm.store_link} onChange={e => setIntForm(f => ({ ...f, store_link: e.target.value }))} placeholder="https://..." />
                                                </div>
                                                <div className={styles.intFormGroup}>
                                                    <label>API Key</label>
                                                    <input type="text" value={intForm.api_key} onChange={e => setIntForm(f => ({ ...f, api_key: e.target.value }))} placeholder="API Key" />
                                                </div>
                                                <div className={styles.intFormGroup}>
                                                    <label>API Secret</label>
                                                    <input type="password" value={intForm.api_secret} onChange={e => setIntForm(f => ({ ...f, api_secret: e.target.value }))} placeholder="API Secret" />
                                                </div>
                                                <div className={styles.intFormGroup}>
                                                    <label>Token</label>
                                                    <input type="password" value={intForm.token} onChange={e => setIntForm(f => ({ ...f, token: e.target.value }))} placeholder="Erişim Token" />
                                                </div>
                                                <div className={styles.intCardActions}>
                                                    <button className={styles.intBtnSave} onClick={() => handleSave(platform)} disabled={intSaving}>
                                                        {intSaving ? '⏳ Kaydediliyor...' : '💾 Kaydet'}
                                                    </button>
                                                    <button className={styles.intBtnCancel} onClick={() => setEditingIntegration(null)}>İptal</button>
                                                </div>
                                                {intTestResult && intTestResult.platform === platform && (
                                                    <div className={styles.intTestResult} style={{ background: intTestResult.success ? '#22c55e15' : '#ef444415', color: intTestResult.success ? '#22c55e' : '#ef4444' }}>
                                                        {intTestResult.success ? '✅' : '❌'} {intTestResult.message}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Info Note */}
                        <div style={{ marginTop: 24, padding: '12px 16px', background: 'var(--color-surface-elevated)', borderRadius: 12, border: '1px solid var(--color-border)' }}>
                            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                                💡 <strong>Not:</strong> Platform API bilgilerinizi girdikten sonra siparişler otomatik olarak sisteme düşecektir.
                                Her platform için gerekli bilgilere ilgili platformun satıcı panelinden ulaşabilirsiniz.
                            </p>
                        </div>
                    </>
                );
            })()}

            {/* ======================== MENÜ TAB ======================== */}
            {
                activeTab === 'menu' && (
                    !kasaUnlocked ? (
                        <div className={styles.passwordGate}>
                            <div className={styles.lockIcon}>🔒</div>
                            <h2>Menü Yönetimi</h2>
                            <p className={styles.lockDesc}>Menü düzenlemek için kasa parolasını girin</p>
                            <form onSubmit={handleKasaLogin} className={styles.passwordGateForm}>
                                <input
                                    type="password"
                                    value={kasaPassword}
                                    onChange={(e) => setKasaPassword(e.target.value)}
                                    placeholder="Kasa parolası"
                                    className={styles.gateInput}
                                    autoFocus
                                />
                                <button type="submit" className={styles.gateBtn}>Giriş Yap</button>
                            </form>
                        </div>
                    ) : (
                        <div className={styles.mgmtSection}>
                            <h2 className={styles.sectionTitle}>🍽️ Menü Yönetimi</h2>

                            {/* Restaurant Selector — only for super admin */}
                            {isSuperAdmin && menuRestaurants.length > 0 && (
                                <div className={styles.restaurantSelector}>
                                    <label className={styles.restaurantLabel}>🏪 Restoran:</label>
                                    <select
                                        className={styles.restaurantSelect}
                                        value={selectedRestaurantId}
                                        onChange={(e) => {
                                            setSelectedRestaurantId(e.target.value);
                                            setMenuSelectedCat('all');
                                            setShowAddCategory(false);
                                            setShowAddProduct(false);
                                            setEditingCategory(null);
                                            setEditingProduct(null);
                                        }}
                                    >
                                        {menuRestaurants.map(r => (
                                            <option key={r.id} value={r.id}>{r.name} {r.is_active ? '' : '(Pasif)'}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Logo Yükleme */}
                            <div className={styles.menuMgmtBlock}>
                                <div className={styles.menuBlockHeader}>
                                    <h3>🖼️ Restoran Logosu</h3>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 0', flexWrap: 'wrap' }}>
                                    {(() => {
                                        const currentRest = menuRestaurants.find(r => r.id === selectedRestaurantId);
                                        return currentRest?.logo_url ? (
                                            <img src={currentRest.logo_url} alt="Logo" style={{ width: 64, height: 64, borderRadius: '12px', objectFit: 'cover', border: '2px solid var(--color-border)' }} />
                                        ) : (
                                            <div style={{ width: 64, height: 64, borderRadius: '12px', background: 'var(--color-surface-elevated)', border: '2px dashed var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: 'var(--color-text-muted)' }}>🍽️</div>
                                        );
                                    })()}
                                    <div style={{ flex: 1, minWidth: 200 }}>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            id="logo-upload"
                                            style={{ display: 'none' }}
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (!file) return;
                                                showToast('Logo yükleniyor...', 'info');
                                                const reader = new FileReader();
                                                reader.onload = async () => {
                                                    try {
                                                        const base64 = reader.result as string;
                                                        // Include file extension in the filename
                                                        const ext = file.name.split('.').pop() || 'png';
                                                        const uploadRes = await menuAPI.uploadImage(base64, `logo_${selectedRestaurantId}.${ext}`);
                                                        const logoUrl = uploadRes.data.url;
                                                        console.log('[Logo] Uploaded URL:', logoUrl);
                                                        await menuAPI.updateRestaurant(selectedRestaurantId, { logo_url: logoUrl });
                                                        console.log('[Logo] Restaurant updated with logo_url');
                                                        setMenuRestaurants(prev => prev.map(r => r.id === selectedRestaurantId ? { ...r, logo_url: logoUrl } : r));
                                                        await refreshMenu();
                                                        showToast('Logo güncellendi!', 'success');
                                                    } catch (err) {
                                                        console.error('[Logo] Upload failed:', err);
                                                        showToast('Logo yüklenemedi', 'error');
                                                    }
                                                };
                                                reader.readAsDataURL(file);
                                                e.target.value = '';
                                            }}
                                        />
                                        <button
                                            className={styles.addBtnSmall}
                                            onClick={() => document.getElementById('logo-upload')?.click()}
                                        >
                                            📤 Logo Yükle
                                        </button>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: 6 }}>
                                            Önerilen boyut: 200x200 px, PNG veya JPG
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Kategori Yönetimi */}
                            <div className={styles.menuMgmtBlock}>
                                <div className={styles.menuBlockHeader}>
                                    <h3>📁 Kategoriler</h3>
                                    <button className={styles.addBtnSmall} onClick={() => { setShowAddCategory(!showAddCategory); setEditingCategory(null); setNewCatImageFile(null); setNewCatImagePreview(''); }}>
                                        {showAddCategory ? '✕ İptal' : '+ Kategori Ekle'}
                                    </button>
                                </div>

                                {showAddCategory && (
                                    <form className={styles.menuForm} onSubmit={async (e) => {
                                        e.preventDefault();
                                        if (!newCatName.trim()) return;
                                        try {
                                            let catImageUrl: string | undefined;
                                            if (newCatImageFile) {
                                                setImageUploading(true);
                                                catImageUrl = await uploadImageFile(newCatImageFile) || undefined;
                                                setImageUploading(false);
                                            }
                                            await menuAPI.createCategory({ name: newCatName.trim(), icon: '', sort_order: menuCategories.length + 1, restaurant_id: selectedRestaurantId, image_url: catImageUrl });
                                            showToast('Kategori eklendi!', 'success');
                                            setNewCatName(''); setShowAddCategory(false); setNewCatImageFile(null); setNewCatImagePreview('');
                                            loadMenuData();
                                        } catch { setImageUploading(false); showToast('Kategori eklenemedi', 'error'); }
                                    }}>
                                        <div className={styles.menuFormRow} style={{ flexDirection: 'column', gap: '12px' }}>
                                            <input className={styles.menuInput} value={newCatName} onChange={(e) => setNewCatName(e.target.value)} placeholder="Kategori adı" required />
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <label style={{ cursor: 'pointer', padding: '8px 16px', background: 'rgba(16, 185, 129, 0.15)', borderRadius: '8px', color: 'var(--color-primary)', fontSize: '0.85rem', fontWeight: 600 }}>
                                                    📷 Görsel Seç
                                                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => {
                                                        const file = e.target.files?.[0] || null;
                                                        if (file) {
                                                            if (file.size > MAX_IMAGE_SIZE) { showToast('Görsel en fazla 5MB olmalı', 'error'); return; }
                                                            setNewCatImageFile(file);
                                                            const reader = new FileReader();
                                                            reader.onload = (ev) => setNewCatImagePreview(ev.target?.result as string);
                                                            reader.readAsDataURL(file);
                                                        }
                                                    }} />
                                                </label>
                                                {newCatImagePreview && <img src={newCatImagePreview} alt="Preview" style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover' }} />}
                                            </div>
                                            <button type="submit" className={styles.menuSaveBtn} disabled={imageUploading}>{imageUploading ? 'Yükleniyor...' : 'Ekle'}</button>
                                        </div>
                                    </form>
                                )}

                                {editingCategory && (
                                    <form className={styles.menuForm} onSubmit={async (e) => {
                                        e.preventDefault();
                                        try {
                                            let catImageUrl: string | undefined;
                                            if (editCatImageFile) {
                                                setImageUploading(true);
                                                catImageUrl = await uploadImageFile(editCatImageFile) || undefined;
                                                setImageUploading(false);
                                            }
                                            await menuAPI.updateCategory(editingCategory.id, { name: editingCategory.name, icon: '', image_url: catImageUrl || editingCategory.image_url || undefined });
                                            showToast('Kategori güncellendi!', 'success');
                                            setEditingCategory(null); setEditCatImageFile(null); setEditCatImagePreview('');
                                            loadMenuData();
                                        } catch { setImageUploading(false); showToast('Güncellenemedi', 'error'); }
                                    }}>
                                        <div className={styles.menuFormRow} style={{ flexDirection: 'column', gap: '12px' }}>
                                            <input className={styles.menuInput} value={editingCategory.name} onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })} required />
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <label style={{ cursor: 'pointer', padding: '8px 16px', background: 'rgba(16, 185, 129, 0.15)', borderRadius: '8px', color: 'var(--color-primary)', fontSize: '0.85rem', fontWeight: 600 }}>
                                                    📷 Görsel Değiştir
                                                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => {
                                                        const file = e.target.files?.[0] || null;
                                                        if (file) {
                                                            if (file.size > MAX_IMAGE_SIZE) { showToast('Görsel en fazla 5MB olmalı', 'error'); return; }
                                                            setEditCatImageFile(file);
                                                            const reader = new FileReader();
                                                            reader.onload = (ev) => setEditCatImagePreview(ev.target?.result as string);
                                                            reader.readAsDataURL(file);
                                                        }
                                                    }} />
                                                </label>
                                                {(editCatImagePreview || editingCategory.image_url) && (
                                                    <img src={editCatImagePreview || editingCategory.image_url || ''} alt="Preview" style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover' }} />
                                                )}
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button type="submit" className={styles.menuSaveBtn} disabled={imageUploading}>{imageUploading ? 'Yükleniyor...' : 'Kaydet'}</button>
                                                <button type="button" className={styles.menuCancelBtn} onClick={() => { setEditingCategory(null); setEditCatImageFile(null); setEditCatImagePreview(''); }}>İptal</button>
                                            </div>
                                        </div>
                                    </form>
                                )}

                                <div className={styles.menuCatList}>
                                    {menuCategories.map((cat) => (
                                        <div key={cat.id} className={styles.menuCatItem}>
                                            <span className={styles.menuCatInfo} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                {cat.image_url ? (
                                                    <img src={cat.image_url} alt={cat.name} style={{ width: 32, height: 32, borderRadius: 6, objectFit: 'cover' }} />
                                                ) : (
                                                    <span style={{ width: 32, height: 32, borderRadius: 6, background: 'var(--color-surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>📁</span>
                                                )}
                                                {cat.name}
                                            </span>
                                            <span className={styles.menuCatCount}>{menuProducts.filter(p => p.category_id === cat.id).length} ürün</span>
                                            <div className={styles.menuCatActions}>
                                                <button className={styles.editBtnSmall} onClick={() => { setEditingCategory(cat); setShowAddCategory(false); setEditCatImageFile(null); setEditCatImagePreview(''); }}>✏️</button>
                                                <button className={styles.deleteBtnSmall} onClick={() => {
                                                    setConfirmDialog({
                                                        message: `"${cat.name}" kategorisi ve tüm ürünleri silinecek. Emin misiniz?`,
                                                        onConfirm: async () => {
                                                            setConfirmDialog(null);
                                                            try {
                                                                await menuAPI.deleteCategory(cat.id);
                                                                showToast('Kategori silindi', 'success');
                                                                loadMenuData();
                                                            } catch { showToast('Silinemedi', 'error'); }
                                                        }
                                                    });
                                                }}>🗑️</button>
                                            </div>
                                        </div>
                                    ))}
                                    {menuLoading && <div className={styles.emptyReport}>Yükleniyor...</div>}
                                    {!menuLoading && menuCategories.length === 0 && <div className={styles.emptyReport}>Henüz kategori yok.</div>}
                                </div>
                            </div>

                            {/* Ürün Yönetimi */}
                            <div className={styles.menuMgmtBlock}>
                                <div className={styles.menuBlockHeader}>
                                    <h3>🛒 Ürünler</h3>
                                    <button className={styles.addBtnSmall} onClick={() => { setShowAddProduct(!showAddProduct); setEditingProduct(null); if (!newProdCatId && menuCategories.length > 0) setNewProdCatId(menuCategories[0].id); }}>
                                        {showAddProduct ? '✕ İptal' : '+ Ürün Ekle'}
                                    </button>
                                </div>

                                {/* Category filter for products */}
                                <div className={styles.menuCatFilter}>
                                    <button className={`${styles.menuFilterBtn} ${menuSelectedCat === 'all' ? styles.menuFilterActive : ''}`} onClick={() => setMenuSelectedCat('all')}>Tümü</button>
                                    {menuCategories.map(cat => (
                                        <button key={cat.id} className={`${styles.menuFilterBtn} ${menuSelectedCat === cat.id ? styles.menuFilterActive : ''}`} onClick={() => setMenuSelectedCat(cat.id)}>
                                            {cat.icon} {cat.name}
                                        </button>
                                    ))}
                                </div>

                                {showAddProduct && (
                                    <form className={styles.menuForm} onSubmit={async (e) => {
                                        e.preventDefault();
                                        if (!newProdName.trim() || !newProdPrice || !newProdCatId) return;
                                        try {
                                            setImageUploading(true);
                                            let imageUrl: string | undefined;
                                            if (newProdImageFile) {
                                                const url = await uploadImageFile(newProdImageFile);
                                                if (url) imageUrl = url;
                                            }
                                            await menuAPI.createProduct({ name: newProdName.trim(), price: Number(newProdPrice), category_id: newProdCatId, description: newProdDesc.trim() || undefined, restaurant_id: selectedRestaurantId, image_url: imageUrl });
                                            showToast('Ürün eklendi!', 'success');
                                            setNewProdName(''); setNewProdPrice(''); setNewProdDesc(''); setNewProdImageFile(null); setNewProdImagePreview(''); setShowAddProduct(false);
                                            loadMenuData();
                                        } catch { showToast('Ürün eklenemedi', 'error'); } finally { setImageUploading(false); }
                                    }}>
                                        <div className={styles.menuFormGrid}>
                                            <input className={styles.menuInput} value={newProdName} onChange={(e) => setNewProdName(e.target.value)} placeholder="Ürün adı" required />
                                            <input className={styles.menuInput} type="number" step="0.01" min="0" value={newProdPrice} onChange={(e) => setNewProdPrice(e.target.value)} placeholder="Fiyat (₺)" required />
                                            <select className={styles.menuInput} value={newProdCatId} onChange={(e) => setNewProdCatId(e.target.value)} required>
                                                <option value="">Kategori seçin</option>
                                                {menuCategories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                                            </select>
                                            <input className={styles.menuInput} value={newProdDesc} onChange={(e) => setNewProdDesc(e.target.value)} placeholder="Açıklama (opsiyonel)" />
                                        </div>
                                        {/* Image Upload */}
                                        <div className={styles.imageUploadArea}>
                                            <label className={styles.imageUploadLabel}>
                                                📷 Görsel Seç
                                                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleImageSelect(e.target.files?.[0] || null, 'add')} />
                                            </label>
                                            {newProdImagePreview && (
                                                <div className={styles.imagePreviewWrap}>
                                                    <img src={newProdImagePreview} alt="Önizleme" className={styles.imagePreview} />
                                                    <button type="button" className={styles.imageRemoveBtn} onClick={() => handleImageSelect(null, 'add')}>✕</button>
                                                </div>
                                            )}
                                        </div>
                                        <button type="submit" className={styles.menuSaveBtn} style={{ marginTop: '0.5rem' }} disabled={imageUploading}>
                                            {imageUploading ? '⏳ Yükleniyor...' : 'Ürün Ekle'}
                                        </button>
                                    </form>
                                )}

                                {editingProduct && (
                                    <form className={styles.menuForm} onSubmit={async (e) => {
                                        e.preventDefault();
                                        try {
                                            setImageUploading(true);
                                            let imageUrl: string | undefined;
                                            if (editProdImageFile) {
                                                const url = await uploadImageFile(editProdImageFile);
                                                if (url) imageUrl = url;
                                            }
                                            await menuAPI.updateProduct(editingProduct.id, {
                                                name: editingProduct.name,
                                                price: editingProduct.price,
                                                category_id: editingProduct.category_id,
                                                description: editingProduct.description || undefined,
                                                ...(imageUrl ? { image_url: imageUrl } : {}),
                                            });
                                            showToast('Ürün güncellendi!', 'success');
                                            setEditingProduct(null); setEditProdImageFile(null); setEditProdImagePreview('');
                                            loadMenuData();
                                        } catch { showToast('Güncellenemedi', 'error'); } finally { setImageUploading(false); }
                                    }}>
                                        <div className={styles.menuFormGrid}>
                                            <input className={styles.menuInput} value={editingProduct.name} onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })} required />
                                            <input className={styles.menuInput} type="number" step="0.01" min="0" value={editingProduct.price} onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })} required />
                                            <select className={styles.menuInput} value={editingProduct.category_id} onChange={(e) => setEditingProduct({ ...editingProduct, category_id: e.target.value })}>
                                                {menuCategories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                                            </select>
                                            <input className={styles.menuInput} value={editingProduct.description || ''} onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })} placeholder="Açıklama" />
                                        </div>
                                        {/* Image Upload for Edit */}
                                        <div className={styles.imageUploadArea}>
                                            <label className={styles.imageUploadLabel}>
                                                📷 {editingProduct.image_url ? 'Görseli Değiştir' : 'Görsel Ekle'}
                                                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleImageSelect(e.target.files?.[0] || null, 'edit')} />
                                            </label>
                                            {(editProdImagePreview || editingProduct.image_url) && (
                                                <div className={styles.imagePreviewWrap}>
                                                    <img src={editProdImagePreview || editingProduct.image_url || ''} alt="Önizleme" className={styles.imagePreview} />
                                                    {editProdImagePreview && <button type="button" className={styles.imageRemoveBtn} onClick={() => handleImageSelect(null, 'edit')}>✕</button>}
                                                </div>
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                            <button type="submit" className={styles.menuSaveBtn} disabled={imageUploading}>
                                                {imageUploading ? '⏳ Yükleniyor...' : 'Kaydet'}
                                            </button>
                                            <button type="button" className={styles.menuCancelBtn} onClick={() => { setEditingProduct(null); setEditProdImageFile(null); setEditProdImagePreview(''); }}>İptal</button>
                                        </div>
                                    </form>
                                )}

                                <div className={styles.menuProductList}>
                                    {(menuSelectedCat === 'all' ? menuProducts : menuProducts.filter(p => p.category_id === menuSelectedCat)).map((prod) => (
                                        <div key={prod.id} className={`${styles.menuProductItem} ${!prod.is_available ? styles.menuProductUnavailable : ''}`}>
                                            {prod.image_url ? (
                                                <img src={prod.image_url} alt={prod.name} className={styles.menuProductThumb} />
                                            ) : (
                                                <div className={styles.menuProductThumbPlaceholder}>🍽️</div>
                                            )}
                                            <div className={styles.menuProductInfo}>
                                                <span className={styles.menuProductName}>{prod.name}</span>
                                                {prod.description && <span className={styles.menuProductDesc}>{prod.description}</span>}
                                                <span className={styles.menuProductCat}>{prod.category?.icon} {prod.category?.name}</span>
                                            </div>
                                            <span className={styles.menuProductPrice}>{formatCurrency(prod.price)}</span>
                                            <div className={styles.menuProductActions}>
                                                <button
                                                    className={`${styles.toggleBtn} ${prod.is_available ? styles.toggleOn : styles.toggleOff}`}
                                                    title={prod.is_available ? 'Aktif — kapatmak için tıkla' : 'Pasif — açmak için tıkla'}
                                                    onClick={async () => {
                                                        try {
                                                            await menuAPI.updateProduct(prod.id, { is_available: !prod.is_available });
                                                            showToast(prod.is_available ? 'Ürün pasife alındı' : 'Ürün aktife alındı', 'success');
                                                            loadMenuData();
                                                        } catch { showToast('Değiştirilemedi', 'error'); }
                                                    }}
                                                >
                                                    {prod.is_available ? '✅' : '⛔'}
                                                </button>
                                                <button className={styles.editBtnSmall} onClick={() => { setEditingProduct(prod); setShowAddProduct(false); }}>✏️</button>
                                                <button className={styles.deleteBtnSmall} onClick={() => {
                                                    setConfirmDialog({
                                                        message: `"${prod.name}" ürünü silinecek. Emin misiniz?`,
                                                        onConfirm: async () => {
                                                            setConfirmDialog(null);
                                                            try {
                                                                await menuAPI.deleteProduct(prod.id);
                                                                showToast('Ürün silindi', 'success');
                                                                loadMenuData();
                                                            } catch { showToast('Silinemedi', 'error'); }
                                                        }
                                                    });
                                                }}>🗑️</button>
                                            </div>
                                        </div>
                                    ))}
                                    {menuLoading && <div className={styles.emptyReport}>Yükleniyor...</div>}
                                    {!menuLoading && menuProducts.length === 0 && <div className={styles.emptyReport}>Henüz ürün yok.</div>}
                                </div>
                            </div>
                        </div>
                    )
                )}

            {/* Custom Confirm Dialog */}
            {confirmDialog && (
                <div className={styles.modal} onClick={() => setConfirmDialog(null)}>
                    <div className={styles.modalContent} style={{ maxWidth: 420, textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader} style={{ justifyContent: 'center', borderBottom: 'none', paddingBottom: 0 }}>
                            <h2 style={{ fontSize: '1.25rem' }}>⚠️ Onay</h2>
                        </div>
                        <div style={{ padding: '16px 24px 8px', color: 'var(--color-text-secondary)', fontSize: '1rem', lineHeight: 1.5 }}>
                            {confirmDialog.message}
                        </div>
                        <div style={{ padding: '16px 24px 24px', display: 'flex', gap: '12px', justifyContent: 'center' }}>
                            <button
                                onClick={() => setConfirmDialog(null)}
                                style={{ padding: '10px 28px', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-primary)', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 600 }}
                            >
                                İptal
                            </button>
                            <button
                                onClick={confirmDialog.onConfirm}
                                style={{ padding: '10px 28px', borderRadius: '8px', border: 'none', background: '#DC2626', color: 'white', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 600 }}
                            >
                                Evet, Sil
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
