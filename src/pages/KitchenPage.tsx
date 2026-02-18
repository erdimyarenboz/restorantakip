import { useOrders } from '../store/OrdersContext';
import { useLanguage } from '../i18n/i18n';
import { formatCurrency } from '../utils/format';
import type { OrderSource } from '../types';
import styles from '../styles/KitchenPage.module.css';

const SOURCE_CONFIG: Record<OrderSource, { label: string; emoji: string; className: string }> = {
    restaurant: { label: 'Restoran', emoji: '🏠', className: '' },
    yemeksepeti: { label: 'Yemeksepeti', emoji: '🔴', className: 'yemeksepeti' },
    trendyol: { label: 'Trendyol Go', emoji: '🟣', className: 'trendyol' },
    getir: { label: 'Getir', emoji: '🟢', className: 'getir' },
};

export default function KitchenPage() {
    const { getKitchenOrders, updateOrderStatus } = useOrders();
    const { t } = useLanguage();
    const kitchenOrders = getKitchenOrders();

    const handleMarkReady = (orderId: string) => {
        updateOrderStatus(orderId, 'Hazır');
    };

    const getOrderDuration = (createdAt: string): string => {
        const now = new Date();
        const orderTime = new Date(createdAt);
        const diffMinutes = Math.floor((now.getTime() - orderTime.getTime()) / 1000 / 60);

        if (diffMinutes < 1) return t('justNow');
        if (diffMinutes < 60) return `${diffMinutes} ${t('minutes')}`;
        const hours = Math.floor(diffMinutes / 60);
        const mins = diffMinutes % 60;
        return `${hours} ${t('hours')} ${mins} ${t('minutes')}`;
    };

    const isThirdParty = (source: OrderSource) => source !== 'restaurant';

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h1 className={styles.title}>{t('kitchenOrders')}</h1>
                <div className={styles.badge}>{kitchenOrders.length} {t('orderCount')}</div>
            </div>

            {kitchenOrders.length === 0 ? (
                <div className={styles.empty}>
                    <div className={styles.emptyIcon}>✅</div>
                    <p className={styles.emptyText}>{t('allOrdersReady')}</p>
                </div>
            ) : (
                <div className={styles.orders}>
                    {kitchenOrders.map((order) => {
                        const sourceConfig = SOURCE_CONFIG[order.source] || SOURCE_CONFIG.restaurant;
                        const thirdParty = isThirdParty(order.source);

                        return (
                            <div
                                key={order.orderId}
                                className={`${styles.orderCard} ${thirdParty ? styles[`source_${sourceConfig.className}`] || '' : ''}`}
                            >
                                <div className={styles.orderHeader}>
                                    <div className={styles.tableInfo}>
                                        {thirdParty ? (
                                            <span className={`${styles.sourceBadge} ${styles[`badge_${sourceConfig.className}`] || ''}`}>
                                                {sourceConfig.emoji} {sourceConfig.label}
                                            </span>
                                        ) : (
                                            <span className={styles.tableBadge}>
                                                {t('table')} {order.table.tableNumber}
                                            </span>
                                        )}
                                        <span className={styles.orderId}>#{order.orderId}</span>
                                    </div>
                                    <div className={styles.timeInfo}>
                                        <span className={styles.duration}>
                                            ⏱️ {getOrderDuration(order.createdAt)}
                                        </span>
                                    </div>
                                </div>

                                {!thirdParty && (
                                    <div className={styles.waiter}>
                                        {t('waiter')}: <strong>{order.table.waiterName}</strong>
                                    </div>
                                )}
                                {thirdParty && (
                                    <div className={styles.courierTag}>
                                        {t('courierDelivery')}
                                    </div>
                                )}

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
                                        className={styles.readyButton}
                                        onClick={() => handleMarkReady(order.orderId)}
                                    >
                                        {t('readyBtn')}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
