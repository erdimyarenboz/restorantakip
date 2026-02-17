import { Link } from 'react-router-dom';
import type { Order, OrderStatus } from '../types';
import { formatCurrency, formatDateShort } from '../utils/format';
import styles from '../styles/OrderCard.module.css';

interface OrderCardProps {
    order: Order;
}

const getStatusDisplay = (status: OrderStatus) => {
    const statusConfig: Record<OrderStatus, { label: string; color: string }> = {
        'Mutfakta': { label: '👨‍🍳 Hazırlanıyor', color: '#f59e0b' },
        'Hazır': { label: '✅ Hazır', color: '#10b981' },
        'Teslim Edildi': { label: '🚀 Teslim Edildi', color: '#3b82f6' },
        'Kuryeye Teslim Edildi': { label: '🏍️ Kuryeye Teslim', color: '#8b5cf6' },
        'Ödendi': { label: '✓ Ödendi', color: '#6b7280' },
        'İptal': { label: '✕ İptal', color: '#ef4444' },
    };

    return statusConfig[status] || { label: status, color: '#6b7280' };
};

export default function OrderCard({ order }: OrderCardProps) {
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
                {order.items.length} ürün
            </div>
        </Link>
    );
}
