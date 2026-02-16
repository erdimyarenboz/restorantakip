import { useNavigate } from 'react-router-dom';
import { useCart } from '../store/CartContext';
import CartItem from '../components/CartItem';
import CartSummary from '../components/CartSummary';
import EmptyState from '../components/EmptyState';
import styles from '../styles/CartPage.module.css';

export default function CartPage() {
    const navigate = useNavigate();
    const { items, subtotal, total } = useCart();

    if (items.length === 0) {
        return (
            <div className={styles.page}>
                <h1 className={styles.title}>Masa Siparişi</h1>
                <EmptyState
                    icon="🍽️"
                    title="Sepetiniz Boş"
                    message="Henüz sepetinize ürün eklemediniz."
                    actionLabel="Menüye Dön"
                    onAction={() => navigate('/')}
                />
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <h1 className={styles.title}>Masa Siparişi</h1>

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
                        checkoutLabel="Toplam"
                    />
                    <button
                        className={styles.checkoutButton}
                        onClick={() => navigate('/checkout')}
                    >
                        Sipariş Oluştur
                    </button>
                </div>
            </div>
        </div>
    );
}
