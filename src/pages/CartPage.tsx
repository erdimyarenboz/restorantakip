import { useNavigate } from 'react-router-dom';
import { useCart } from '../store/CartContext';
import { useLanguage } from '../i18n/i18n';
import CartItem from '../components/CartItem';
import CartSummary from '../components/CartSummary';
import EmptyState from '../components/EmptyState';
import styles from '../styles/CartPage.module.css';

export default function CartPage() {
    const navigate = useNavigate();
    const { items, subtotal, total } = useCart();
    const { t } = useLanguage();

    if (items.length === 0) {
        return (
            <div className={styles.page}>
                <h1 className={styles.title}>{t('tableOrder')}</h1>
                <EmptyState
                    icon="🍽️"
                    title={t('emptyCart')}
                    message={t('emptyCartMsg')}
                    actionLabel={t('goToMenu')}
                    onAction={() => navigate('/menu')}
                />
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <h1 className={styles.title}>{t('tableOrder')}</h1>

            <div className={styles.content}>
                <div className={styles.items}>
                    {items.map((item) => (
                        <CartItem key={item.product.id} item={item} />
                    ))}
                </div>

                <div className={styles.summaryWrapper}>
                    <CartSummary
                        subtotal={subtotal}
                        total={total}
                        checkoutLabel={t('total')}
                    />
                    <button
                        className={styles.checkoutButton}
                        onClick={() => navigate('/checkout')}
                    >
                        {t('createOrder')}
                    </button>
                </div>
            </div>
        </div>
    );
}
