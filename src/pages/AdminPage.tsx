import { useState, useEffect, useCallback } from 'react';
import { useOrders } from '../store/OrdersContext';
import { useAuth } from '../store/AuthContext';
import { useToast } from '../store/ToastContext';
import { formatCurrency, formatDate } from '../utils/format';
import { tablesAPI, waitersAPI, reportAPI, menuAPI } from '../services/api';
import type { OrderSource } from '../types';
import styles from '../styles/AdminPage.module.css';

type AdminTab = 'kasa' | 'raporlar' | 'masalar' | 'garsonlar' | 'dis_siparis' | 'menu';

interface RestaurantData {
    id: string;
    name: string;
    slug: string;
    is_active: boolean;
    subscription_plan: string;
}

interface CategoryData {
    id: string;
    name: string;
    icon: string;
    sort_order: number;
}

interface ProductData {
    id: string;
    name: string;
    price: number;
    description: string | null;
    category_id: string;
    is_available: boolean;
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
    const isSuperAdmin = role === 'super_admin';

    // Tab state
    const [activeTab, setActiveTab] = useState<AdminTab>('kasa');

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
    const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>('rest-001');
    const [menuCategories, setMenuCategories] = useState<CategoryData[]>([]);
    const [menuProducts, setMenuProducts] = useState<ProductData[]>([]);
    const [menuLoading, setMenuLoading] = useState(false);
    const [menuSelectedCat, setMenuSelectedCat] = useState<string>('all');
    const [showAddCategory, setShowAddCategory] = useState(false);
    const [newCatName, setNewCatName] = useState('');
    const [newCatIcon, setNewCatIcon] = useState('🍽️');
    const [editingCategory, setEditingCategory] = useState<CategoryData | null>(null);
    const [showAddProduct, setShowAddProduct] = useState(false);
    const [newProdName, setNewProdName] = useState('');
    const [newProdPrice, setNewProdPrice] = useState('');
    const [newProdDesc, setNewProdDesc] = useState('');
    const [newProdCatId, setNewProdCatId] = useState('');
    const [editingProduct, setEditingProduct] = useState<ProductData | null>(null);

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
            showToast('Rapor yüklenemedi', 'error');
        } finally {
            setReportLoading(false);
        }
    }, [reportPeriod, reportSource, customStartDate, customEndDate, showToast]);

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
            showToast('Masalar yüklenemedi', 'error');
        } finally {
            setTablesLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        if (activeTab === 'masalar') loadTables();
    }, [activeTab, loadTables]);

    const handleAddTable = async (e: React.FormEvent) => {
        e.preventDefault();
        const num = parseInt(newTableNumber);
        if (!num || num < 1) { showToast('Geçerli bir masa numarası girin', 'error'); return; }
        try {
            await tablesAPI.create(num);
            showToast(`Masa ${num} eklendi`, 'success');
            setNewTableNumber('');
            loadTables();
        } catch (err: any) {
            showToast(err.response?.data?.error || 'Masa eklenemedi', 'error');
        }
    };

    const handleDeleteTable = async (table: TableData) => {
        if (!confirm(`Masa ${table.table_number} silinecek. Emin misiniz?`)) return;
        try {
            await tablesAPI.remove(table.id);
            showToast(`Masa ${table.table_number} silindi`, 'success');
            loadTables();
        } catch (err: any) {
            showToast(err.response?.data?.error || 'Masa silinemedi', 'error');
        }
    };

    // --- Waiters Logic ---
    const loadWaiters = useCallback(async () => {
        setWaitersLoading(true);
        try {
            const { data } = await waitersAPI.getAll();
            setWaitersList(data);
        } catch {
            showToast('Garsonlar yüklenemedi', 'error');
        } finally {
            setWaitersLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        if (activeTab === 'garsonlar') loadWaiters();
    }, [activeTab, loadWaiters]);

    // --- Menu Data ---
    const loadRestaurants = useCallback(async () => {
        if (!isSuperAdmin) return; // Only super admin loads restaurant list
        try {
            const { data } = await menuAPI.getRestaurants();
            setMenuRestaurants(data);
        } catch {
            // Silently fail
        }
    }, [isSuperAdmin]);

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
            showToast('Menü verileri yüklenemedi', 'error');
        } finally {
            setMenuLoading(false);
        }
    }, [showToast, selectedRestaurantId]);

    useEffect(() => {
        if (activeTab === 'menu') {
            loadRestaurants();
            loadMenuData();
        }
    }, [activeTab, loadMenuData, loadRestaurants]);

    const handleAddWaiter = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newWaiterName.trim()) { showToast('Garson adı girin', 'error'); return; }
        try {
            await waitersAPI.create(newWaiterName, newWaiterPhone || undefined);
            showToast(`${newWaiterName} eklendi`, 'success');
            setNewWaiterName('');
            setNewWaiterPhone('');
            loadWaiters();
        } catch (err: any) {
            showToast(err.response?.data?.error || 'Garson eklenemedi', 'error');
        }
    };

    const handleDeleteWaiter = async (waiter: WaiterData) => {
        if (!confirm(`${waiter.full_name} silinecek. Emin misiniz?`)) return;
        try {
            await waitersAPI.remove(waiter.id);
            showToast(`${waiter.full_name} silindi`, 'success');
            loadWaiters();
        } catch (err: any) {
            showToast(err.response?.data?.error || 'Garson silinemedi', 'error');
        }
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
            showToast('Menü yüklenemedi', 'error');
        }
    }, [showToast]);

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
            <div className={styles.tabNav}>
                <button className={`${styles.tabBtn} ${activeTab === 'kasa' ? styles.tabActive : ''}`} onClick={() => setActiveTab('kasa')}>
                    💰 Kasa
                </button>
                <button className={`${styles.tabBtn} ${activeTab === 'raporlar' ? styles.tabActive : ''}`} onClick={() => setActiveTab('raporlar')}>
                    📊 Raporlar
                </button>
                <button className={`${styles.tabBtn} ${activeTab === 'masalar' ? styles.tabActive : ''}`} onClick={() => setActiveTab('masalar')}>
                    🪑 Masalar
                </button>
                <button className={`${styles.tabBtn} ${activeTab === 'garsonlar' ? styles.tabActive : ''}`} onClick={() => setActiveTab('garsonlar')}>
                    👨‍🍳 Garsonlar
                </button>
                <button className={`${styles.tabBtn} ${activeTab === 'dis_siparis' ? styles.tabActive : ''}`} onClick={() => setActiveTab('dis_siparis')}>
                    📦 Dış Sipariş
                </button>
                <button className={`${styles.tabBtn} ${activeTab === 'menu' ? styles.tabActive : ''}`} onClick={() => setActiveTab('menu')}>
                    🍽️ Menü
                </button>
            </div>

            {/* ======================== KASA TAB ======================== */}
            {activeTab === 'kasa' && (
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
            )}

            {/* ======================== RAPORLAR TAB ======================== */}
            {activeTab === 'raporlar' && (
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
            )}

            {/* ======================== MASALAR TAB ======================== */}
            {activeTab === 'masalar' && (
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
            )}

            {/* ======================== GARSONLAR TAB ======================== */}
            {activeTab === 'garsonlar' && (
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
            )}

            {/* ======================== DIŞ SİPARİŞ TAB ======================== */}
            {activeTab === 'dis_siparis' && (
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
            )}

            {/* ======================== MENÜ TAB ======================== */}
            {activeTab === 'menu' && (
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

                        {/* Kategori Yönetimi */}
                        <div className={styles.menuMgmtBlock}>
                            <div className={styles.menuBlockHeader}>
                                <h3>📁 Kategoriler</h3>
                                <button className={styles.addBtnSmall} onClick={() => { setShowAddCategory(!showAddCategory); setEditingCategory(null); }}>
                                    {showAddCategory ? '✕ İptal' : '+ Kategori Ekle'}
                                </button>
                            </div>

                            {showAddCategory && (
                                <form className={styles.menuForm} onSubmit={async (e) => {
                                    e.preventDefault();
                                    if (!newCatName.trim()) return;
                                    try {
                                        await menuAPI.createCategory({ name: newCatName.trim(), icon: newCatIcon, sort_order: menuCategories.length + 1, restaurant_id: selectedRestaurantId });
                                        showToast('Kategori eklendi!', 'success');
                                        setNewCatName(''); setNewCatIcon('🍽️'); setShowAddCategory(false);
                                        loadMenuData();
                                    } catch { showToast('Kategori eklenemedi', 'error'); }
                                }}>
                                    <div className={styles.menuFormRow}>
                                        <select value={newCatIcon} onChange={(e) => setNewCatIcon(e.target.value)} className={styles.menuIconSelect}>
                                            {['🍽️', '☕', '🍳', '🥗', '🍰', '🍕', '🍔', '🥤', '🍹', '🍖', '🐟', '🍝', '🌮', '🥩', '🧁', '🍜', '🍣'].map(ic => (
                                                <option key={ic} value={ic}>{ic}</option>
                                            ))}
                                        </select>
                                        <input className={styles.menuInput} value={newCatName} onChange={(e) => setNewCatName(e.target.value)} placeholder="Kategori adı" required />
                                        <button type="submit" className={styles.menuSaveBtn}>Ekle</button>
                                    </div>
                                </form>
                            )}

                            {editingCategory && (
                                <form className={styles.menuForm} onSubmit={async (e) => {
                                    e.preventDefault();
                                    try {
                                        await menuAPI.updateCategory(editingCategory.id, { name: editingCategory.name, icon: editingCategory.icon });
                                        showToast('Kategori güncellendi!', 'success');
                                        setEditingCategory(null);
                                        loadMenuData();
                                    } catch { showToast('Güncellenemedi', 'error'); }
                                }}>
                                    <div className={styles.menuFormRow}>
                                        <select value={editingCategory.icon} onChange={(e) => setEditingCategory({ ...editingCategory, icon: e.target.value })} className={styles.menuIconSelect}>
                                            {['🍽️', '☕', '🍳', '🥗', '🍰', '🍕', '🍔', '🥤', '🍹', '🍖', '🐟', '🍝', '🌮', '🥩', '🧁', '🍜', '🍣'].map(ic => (
                                                <option key={ic} value={ic}>{ic}</option>
                                            ))}
                                        </select>
                                        <input className={styles.menuInput} value={editingCategory.name} onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })} required />
                                        <button type="submit" className={styles.menuSaveBtn}>Kaydet</button>
                                        <button type="button" className={styles.menuCancelBtn} onClick={() => setEditingCategory(null)}>İptal</button>
                                    </div>
                                </form>
                            )}

                            <div className={styles.menuCatList}>
                                {menuCategories.map((cat) => (
                                    <div key={cat.id} className={styles.menuCatItem}>
                                        <span className={styles.menuCatInfo}>{cat.icon} {cat.name}</span>
                                        <span className={styles.menuCatCount}>{menuProducts.filter(p => p.category_id === cat.id).length} ürün</span>
                                        <div className={styles.menuCatActions}>
                                            <button className={styles.editBtnSmall} onClick={() => { setEditingCategory(cat); setShowAddCategory(false); }}>✏️</button>
                                            <button className={styles.deleteBtnSmall} onClick={async () => {
                                                if (!window.confirm(`"${cat.name}" kategorisi ve tüm ürünleri silinecek. Emin misiniz?`)) return;
                                                try {
                                                    await menuAPI.deleteCategory(cat.id);
                                                    showToast('Kategori silindi', 'success');
                                                    loadMenuData();
                                                } catch { showToast('Silinemedi', 'error'); }
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
                                        await menuAPI.createProduct({ name: newProdName.trim(), price: Number(newProdPrice), category_id: newProdCatId, description: newProdDesc.trim() || undefined, restaurant_id: selectedRestaurantId });
                                        showToast('Ürün eklendi!', 'success');
                                        setNewProdName(''); setNewProdPrice(''); setNewProdDesc(''); setShowAddProduct(false);
                                        loadMenuData();
                                    } catch { showToast('Ürün eklenemedi', 'error'); }
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
                                    <button type="submit" className={styles.menuSaveBtn} style={{ marginTop: '0.5rem' }}>Ürün Ekle</button>
                                </form>
                            )}

                            {editingProduct && (
                                <form className={styles.menuForm} onSubmit={async (e) => {
                                    e.preventDefault();
                                    try {
                                        await menuAPI.updateProduct(editingProduct.id, {
                                            name: editingProduct.name,
                                            price: editingProduct.price,
                                            category_id: editingProduct.category_id,
                                            description: editingProduct.description || undefined,
                                        });
                                        showToast('Ürün güncellendi!', 'success');
                                        setEditingProduct(null);
                                        loadMenuData();
                                    } catch { showToast('Güncellenemedi', 'error'); }
                                }}>
                                    <div className={styles.menuFormGrid}>
                                        <input className={styles.menuInput} value={editingProduct.name} onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })} required />
                                        <input className={styles.menuInput} type="number" step="0.01" min="0" value={editingProduct.price} onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })} required />
                                        <select className={styles.menuInput} value={editingProduct.category_id} onChange={(e) => setEditingProduct({ ...editingProduct, category_id: e.target.value })}>
                                            {menuCategories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                                        </select>
                                        <input className={styles.menuInput} value={editingProduct.description || ''} onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })} placeholder="Açıklama" />
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                        <button type="submit" className={styles.menuSaveBtn}>Kaydet</button>
                                        <button type="button" className={styles.menuCancelBtn} onClick={() => setEditingProduct(null)}>İptal</button>
                                    </div>
                                </form>
                            )}

                            <div className={styles.menuProductList}>
                                {(menuSelectedCat === 'all' ? menuProducts : menuProducts.filter(p => p.category_id === menuSelectedCat)).map((prod) => (
                                    <div key={prod.id} className={`${styles.menuProductItem} ${!prod.is_available ? styles.menuProductUnavailable : ''}`}>
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
                                            <button className={styles.deleteBtnSmall} onClick={async () => {
                                                if (!window.confirm(`"${prod.name}" ürünü silinecek. Emin misiniz?`)) return;
                                                try {
                                                    await menuAPI.deleteProduct(prod.id);
                                                    showToast('Ürün silindi', 'success');
                                                    loadMenuData();
                                                } catch { showToast('Silinemedi', 'error'); }
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
        </div>
    );
}
