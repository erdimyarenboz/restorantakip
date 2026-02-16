import type { CartItem as CartItemType } from '../types';
import { useCart } from '../store/CartContext';
import { formatCurrency } from '../utils/format';
import styles from '../styles/CartItem.module.css';

interface CartItemProps {
    item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
    const { updateQuantity, removeItem } = useCart();

    const handleDecrease = () => {
        updateQuantity(item.product.id, item.quantity - 1);
    };

    const handleIncrease = () => {
        updateQuantity(item.product.id, item.quantity + 1);
    };

    const handleRemove = () => {
        removeItem(item.product.id);
    };

    const lineTotal = item.product.price * item.quantity;

    return (
        <div className={styles.item}>
            <img
                src={item.product.image}
                alt={item.product.name}
                className={styles.image}
            />
            <div className={styles.details}>
                <h3 className={styles.name}>{item.product.name}</h3>
                <p className={styles.price}>{formatCurrency(item.product.price)}</p>
            </div>
            <div className={styles.controls}>
                <div className={styles.quantity}>
                    <button
                        onClick={handleDecrease}
                        className={styles.quantityButton}
                        aria-label="Azalt"
                    >
                        -
                    </button>
                    <span className={styles.quantityValue}>{item.quantity}</span>
                    <button
                        onClick={handleIncrease}
                        className={styles.quantityButton}
                        aria-label="Artır"
                    >
                        +
                    </button>
                </div>
                <div className={styles.lineTotal}>{formatCurrency(lineTotal)}</div>
                <button
                    onClick={handleRemove}
                    className={styles.removeButton}
                    aria-label="Sil"
                >
                    🗑️
                </button>
            </div>
        </div>
    );
}
