import type { Product } from '../types';
import { useCart } from '../store/CartContext';
import { useLanguage } from '../i18n/i18n';
import { formatCurrency } from '../utils/format';
import styles from '../styles/ProductCard.module.css';

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    const { addItem } = useCart();
    const { t } = useLanguage();

    const handleAddToCart = () => {
        addItem(product);
    };

    return (
        <div className={styles.card}>
            <img
                src={product.image}
                alt={product.name}
                className={styles.image}
            />
            <div className={styles.content}>
                <h3 className={styles.name}>{product.name}</h3>
                <p className={styles.description}>{product.description}</p>
                <div className={styles.footer}>
                    <span className={styles.price}>{formatCurrency(product.price)}</span>
                    <button
                        className={styles.button}
                        onClick={handleAddToCart}
                        aria-label={`${product.name} ${t('addToCart')}`}
                    >
                        {t('addToCart')}
                    </button>
                </div>
            </div>
        </div>
    );
}
