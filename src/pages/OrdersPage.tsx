import { useNavigate } from 'react-router-dom';
import { useOrders } from '../store/OrdersContext';
import { useLanguage } from '../i18n/i18n';
import OrderCard from '../components/OrderCard';
import EmptyState from '../components/EmptyState';
import styles from '../styles/OrdersPage.module.css';

export default function OrdersPage() {
    const navigate = useNavigate();
    const { orders } = useOrders();
    const { t } = useLanguage();

    // Sadece aktif siparişleri göster (Mutfakta veya Hazır olanlar)
    const completedStatuses = ['Ödendi', 'Teslim Edildi', 'Kuryeye Teslim Edildi', 'İptal'];
    const activeOrders = orders.filter((order) => !completedStatuses.includes(order.status));

    if (activeOrders.length === 0) {
        return (
            <div className={styles.page}>
                <h1 className={styles.title}>{t('myOrders')}</h1>
                <EmptyState
                    icon="📦"
                    title={t('noOrdersYet')}
                    message={t('noOrdersMsg')}
                    actionLabel={t('startShopping')}
                    onAction={() => navigate('/menu')}
                />
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <h1 className={styles.title}>{t('myOrders')}</h1>

            <div className={styles.list}>
                {activeOrders.map((order) => (
                    <OrderCard key={order.orderId} order={order} />
                ))}
            </div>
        </div>
    );
}
