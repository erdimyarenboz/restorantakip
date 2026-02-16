import { useParams, useNavigate } from 'react-router-dom';
import { useOrders } from '../store/OrdersContext';
import { formatCurrency, formatDate } from '../utils/format';
import styles from '../styles/OrderDetailPage.module.css';

const statusColors: Record<string, string> = {
    'Mutfakta': 'orange',
    'Hazır': 'green',
    'Teslim Edildi': 'blue',
    'İptal': 'red',
};

export default function OrderDetailPage() {
    const { orderId } = useParams<{ orderId: string }>();
    const navigate = useNavigate();
    const { getOrderById } = useOrders();

    const order = orderId ? getOrderById(orderId) : undefined;

    if (!order) {
        return (
            <div className={styles.page}>
                <h1 className={styles.title}>Sipariş Bulunamadı</h1>
                <button onClick={() => navigate('/orders')} className={styles.backButton}>
                    ← Siparişlere Dön
                </button>
            </div>
        );
    }

    const statusColor = statusColors[order.status] || 'gray';

    return (
        <div className={styles.page}>
            <button onClick={() => navigate('/orders')} className={styles.backButton}>
                ← Siparişlere Dön
            </button>

            <div className={styles.header}>
                <h1 className={styles.title}>Sipariş #{order.orderId}</h1>
                <span className={`${styles.status} ${styles[statusColor]}`}>
                    {order.status}
                </span>
            </div>

            <div className={styles.date}>{formatDate(order.createdAt)}</div>

            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Masa Bilgileri</h2>
                <div className={styles.info}>
                    <p><strong>Masa Numarası:</strong> {order.table.tableNumber}</p>
                    <p><strong>Garson:</strong> {order.table.waiterName}</p>
                    {order.table.note && (
                        <p><strong>Not:</strong> {order.table.note}</p>
                    )}
                </div>
            </section>

            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Sipariş Detayları</h2>
                <div className={styles.items}>
                    {order.items.map((item) => (
                        <div key={item.id} className={styles.item}>
                            <div className={styles.itemName}>
                                {item.name} <span className={styles.itemQty}>x{item.quantity}</span>
                            </div>
                            <div className={styles.itemPrice}>
                                {formatCurrency(item.price * item.quantity)}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Ödeme Özeti</h2>
                <div className={styles.totals}>
                    <div className={styles.totalRow}>
                        <span>Ara Toplam:</span>
                        <span>{formatCurrency(order.totals.subtotal)}</span>
                    </div>
                    <div className={`${styles.totalRow} ${styles.grandTotal}`}>
                        <span>Toplam:</span>
                        <span>{formatCurrency(order.totals.total)}</span>
                    </div>
                </div>
            </section>
        </div>
    );
}
