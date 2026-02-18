import { formatCurrency } from '../utils/format';
import { useLanguage } from '../i18n/i18n';
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
    checkoutLabel,
}: CartSummaryProps) {
    const { t } = useLanguage();
    const isDisabled = checkoutDisabled;
    const label = checkoutLabel || t('total');

    return (
        <div className={styles.summary}>
            <div className={styles.row}>
                <span>{t('subtotal')}:</span>
                <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className={`${styles.row} ${styles.total}`}>
                <span>{t('total')}:</span>
                <span>{formatCurrency(total)}</span>
            </div>

            {label && (
                <button
                    type="submit"
                    className={styles.checkoutButton}
                    disabled={isDisabled}
                    aria-label={label}
                >
                    {label}
                </button>
            )}
        </div>
    );
}
