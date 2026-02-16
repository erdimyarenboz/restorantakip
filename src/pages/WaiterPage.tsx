import { useOrders } from '../store/OrdersContext';
import { formatCurrency, formatDate } from '../utils/format';
import type { Order, OrderSource } from '../types';
import styles from '../styles/WaiterPage.module.css';

const SOURCE_CONFIG: Record<OrderSource, { label: string; emoji: string }> = {
    restaurant: { label: 'Restoran', emoji: '🏠' },
    yemeksepeti: { label: 'Yemeksepeti', emoji: '🔴' },
    trendyol: { label: 'Trendyol Go', emoji: '🟣' },
    getir: { label: 'Getir', emoji: '🟢' },
};

export default function WaiterPage() {
    const { orders, updateOrderStatus } = useOrders();

    const handleMarkDelivered = (order: Order) => {
        const isThirdParty = order.source !== 'restaurant';
        updateOrderStatus(order.orderId, isThirdParty ? 'Kuryeye Teslim Edildi' : 'Teslim Edildi');
    };

    // Show only active orders (in kitchen or ready) - hide delivered
    const activeOrders = orders.filter((order) =>
        order.status === 'Mutfakta' || order.status === 'Hazır'
    );

    // Separate restaurant and third-party orders
    const restaurantOrders = activeOrders.filter((o) => o.source === 'restaurant');
    const courierOrders = activeOrders.filter((o) => o.source !== 'restaurant');

    // Group restaurant orders by table number
    const ordersByTable = restaurantOrders.reduce((acc, order) => {
        const tableNum = order.table.tableNumber;
        if (!acc[tableNum]) acc[tableNum] = [];
        acc[tableNum].push(order);
        return acc;
    }, {} as Record<number, typeof restaurantOrders>);

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h1 className={styles.title}>🍴 Garson Siparişleri</h1>
                <div className={styles.badge}>{activeOrders.length} Sipariş</div>
            </div>

            {activeOrders.length === 0 ? (
                <div className={styles.empty}>
                    <div className={styles.emptyIcon}>📝</div>
                    <p className={styles.emptyText}>Henüz sipariş yok</p>
                    <p className={styles.emptySubtext}>Siparişler burada görünecek</p>
                </div>
            ) : (
                <>
                    {/* ===== COURIER ORDERS ===== */}
                    {courierOrders.length > 0 && (
                        <div className={styles.courierSection}>
                            <div className={styles.courierHeader}>
                                <span className={styles.courierTitle}>🛵 Kurye Siparişleri</span>
                                <span className={styles.courierCount}>{courierOrders.length} sipariş</span>
                            </div>
                            <div className={styles.courierGrid}>
                                {courierOrders.map((order) => {
                                    const sourceConfig = SOURCE_CONFIG[order.source] || SOURCE_CONFIG.restaurant;
                                    return (
                                        <div key={order.orderId} className={`${styles.orderCard} ${styles.courierCard}`}>
                                            <div className={styles.orderHeader}>
                                                <div className={styles.courierSource}>
                                                    <span className={`${styles.sourceBadge} ${styles[`badge_${order.source}`]}`}>
                                                        {sourceConfig.emoji} {sourceConfig.label}
                                                    </span>
                                                    <span className={styles.orderId}>#{order.orderId}</span>
                                                </div>
                                                <span className={`${styles.statusBadge} ${order.status === 'Hazır' ? styles.statusReady : styles.statusKitchen}`}>
                                                    {order.status === 'Hazır' ? '✅ Hazır' : '🍳 Mutfakta'}
                                                </span>
                                            </div>

                                            <div className={styles.items}>
                                                {order.items.map((item) => (
                                                    <div key={item.id} className={styles.item}>
                                                        <span className={styles.itemQuantity}>{item.quantity}x</span>
                                                        <span className={styles.itemName}>{item.name}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            {order.table.note && (
                                                <div className={styles.note}>
                                                    📝 <em>{order.table.note}</em>
                                                </div>
                                            )}

                                            <div className={styles.orderFooter}>
                                                <div className={styles.total}>
                                                    {formatCurrency(order.totals.total)}
                                                </div>
                                                {order.status === 'Hazır' && (
                                                    <button
                                                        className={styles.courierButton}
                                                        onClick={() => handleMarkDelivered(order)}
                                                    >
                                                        🛵 Kuryeye Teslim Edildi
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* ===== RESTAURANT ORDERS ===== */}
                    <div className={styles.tables}>
                        {Object.entries(ordersByTable)
                            .sort(([a], [b]) => Number(a) - Number(b))
                            .map(([tableNum, tableOrders]) => (
                                <div key={tableNum} className={styles.tableGroup}>
                                    <div className={styles.tableHeader}>
                                        <span className={styles.tableBadge}>Masa {tableNum}</span>
                                        <span className={styles.tableCount}>{tableOrders.length} sipariş</span>
                                    </div>

                                    {tableOrders.map((order) => (
                                        <div key={order.orderId} className={styles.orderCard}>
                                            <div className={styles.orderHeader}>
                                                <span className={styles.orderId}>#{order.orderId}</span>
                                                <span className={styles.orderTime}>
                                                    {formatDate(order.createdAt)}
                                                </span>
                                            </div>

                                            <div className={styles.waiter}>
                                                Garson: <strong>{order.table.waiterName}</strong>
                                            </div>

                                            <div className={styles.items}>
                                                {order.items.map((item) => (
                                                    <div key={item.id} className={styles.item}>
                                                        <span className={styles.itemQuantity}>{item.quantity}x</span>
                                                        <span className={styles.itemName}>{item.name}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            {order.table.note && (
                                                <div className={styles.note}>
                                                    📝 <em>{order.table.note}</em>
                                                </div>
                                            )}

                                            <div className={styles.orderFooter}>
                                                <div className={styles.total}>
                                                    {formatCurrency(order.totals.total)}
                                                </div>
                                                <button
                                                    className={styles.deliverButton}
                                                    onClick={() => handleMarkDelivered(order)}
                                                >
                                                    ✓ Teslim Edildi
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ))}
                    </div>
                </>
            )}
        </div>
    );
}
