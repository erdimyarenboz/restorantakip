import { Link } from 'react-router-dom';
import type { Order, OrderStatus } from '../types';
import { useLanguage } from '../i18n/i18n';
import { formatCurrency, formatDateShort } from '../utils/format';
import styles from '../styles/OrderCard.module.css';

interface OrderCardProps {
    order: Order;
}

export default function OrderCard({ order }: OrderCardProps) {
    const { t } = useLanguage();

    const getStatusDisplay = (status: OrderStatus) => {
        const statusConfig: Record<OrderStatus, { label: string; color: string }> = {
            'Mutfakta': { label: t('statusPreparing'), color: '#f59e0b' },
            'Hazır': { label: t('statusReady'), color: '#10b981' },
            'Teslim Edildi': { label: t('statusDelivered'), color: '#3b82f6' },
            'Kuryeye Teslim Edildi': { label: t('statusCourierDelivered'), color: '#8b5cf6' },
            'Ödendi': { label: t('statusPaid'), color: '#6b7280' },
            'İptal': { label: t('statusCancelled'), color: '#ef4444' },
        };
        return statusConfig[status] || { label: status, color: '#6b7280' };
    };

    const statusDisplay = getStatusDisplay(order.status);

    return (
        <Link to={`/orders/${order.orderId}`} className={styles.card}>
            <div className={styles.header}>
                <span className={styles.orderId}>#{order.orderId}</span>
                <span
                    className={styles.statusBadge}
                    style={{ backgroundColor: statusDisplay.color }}
                >
                    {statusDisplay.label}
                </span>
            </div>
            <div className={styles.date}>{formatDateShort(order.createdAt)}</div>
            <div className={styles.total}>{formatCurrency(order.totals.total)}</div>
            <div className={styles.items}>
                {order.items.length} {t('itemCount')}
            </div>
        </Link>
    );
}
