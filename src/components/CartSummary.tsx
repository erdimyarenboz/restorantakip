import { formatCurrency } from '../utils/format';
import styles from '../styles/CartSummary.module.css';

interface CartSummaryProps {
    subtotal: number;
    total: number;
    checkoutDisabled?: boolean;
    checkoutLabel?: string;
}

export default function CartSummary({
    subtotal,
    total,
    checkoutDisabled = false,
    checkoutLabel = 'Toplam',
}: CartSummaryProps) {
    const isDisabled = checkoutDisabled;

    return (
        <div className={styles.summary}>
            <div className={styles.row}>
                <span>Ara Toplam:</span>
                <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className={`${styles.row} ${styles.total}`}>
                <span>Toplam:</span>
                <span>{formatCurrency(total)}</span>
            </div>

            {checkoutLabel && (
                <button
                    type="submit"
                    className={styles.checkoutButton}
                    disabled={isDisabled}
                    aria-label={checkoutLabel}
                >
                    {checkoutLabel}
                </button>
            )}
        </div>
    );
}
