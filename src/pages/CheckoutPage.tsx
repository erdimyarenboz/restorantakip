import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../store/CartContext';
import { useOrders } from '../store/OrdersContext';
import { useToast } from '../store/ToastContext';
import { useLanguage } from '../i18n/i18n';
import { tablesAPI } from '../services/api';
import CartSummary from '../components/CartSummary';
import type { TableOrder } from '../types';
import styles from '../styles/CheckoutPage.module.css';

interface TableItem {
    id: string;
    table_number: number;
    is_active: boolean;
}

export default function CheckoutPage() {
    const navigate = useNavigate();
    const { items, subtotal, total, clearCart } = useCart();
    const { createOrder } = useOrders();
    const { showToast } = useToast();
    const { t } = useLanguage();

    const [tables, setTables] = useState<TableItem[]>([]);
    const [tablesLoading, setTablesLoading] = useState(true);

    const [formData, setFormData] = useState<TableOrder>({
        tableNumber: 1,
        waiterName: 'Garson',
        note: '',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch tables from API
    useEffect(() => {
        const loadTables = async () => {
            try {
                const { data } = await tablesAPI.getAll();
                const activeTables = (data as TableItem[])
                    .filter(t => t.is_active)
                    .sort((a, b) => a.table_number - b.table_number);
                setTables(activeTables);
                if (activeTables.length > 0) {
                    setFormData(prev => ({ ...prev, tableNumber: activeTables[0].table_number }));
                }
            } catch {
                // Fallback: 10 tables if API unavailable
                const fallback = Array.from({ length: 10 }, (_, i) => ({
                    id: `fallback-${i + 1}`,
                    table_number: i + 1,
                    is_active: true,
                }));
                setTables(fallback);
            } finally {
                setTablesLoading(false);
            }
        };
        loadTables();
    }, []);

    // Redirect if cart is empty
    if (items.length === 0) {
        navigate('/cart');
        return null;
    }


    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const order = await createOrder(formData, items, { subtotal, total });
            clearCart();
            showToast(t('orderSuccess'), 'success');
            navigate(`/orders/${order.orderId}`);
        } catch (error) {
            console.error('Order creation failed:', error);
            showToast(t('orderError'), 'error');
            setIsSubmitting(false);
        }
    };


    return (
        <div className={styles.page}>
            <h1 className={styles.title}>{t('orderConfirmation')}</h1>

            <form onSubmit={handleSubmit} className={styles.form}>
                <h2 className={styles.sectionTitle}>{t('tableInfo')}</h2>

                <div className={styles.field}>
                    <label htmlFor="tableNumber" className={styles.label}>
                        {t('tableNumberRequired')}
                    </label>
                    {tablesLoading ? (
                        <div style={{ padding: '0.5rem', color: 'var(--color-text-secondary)' }}>⏳ {t('tablesLoading')}</div>
                    ) : tables.length === 0 ? (
                        <div style={{ padding: '0.5rem', color: '#EF4444' }}>{t('noTablesAvailable')}</div>
                    ) : (
                        <select
                            id="tableNumber"
                            value={formData.tableNumber}
                            onChange={(e) =>
                                setFormData({ ...formData, tableNumber: Number(e.target.value) })
                            }
                            className={styles.select}
                            disabled={isSubmitting}
                        >
                            {tables.map((tbl) => (
                                <option key={tbl.id} value={tbl.table_number}>
                                    {t('table')} {tbl.table_number}
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                <div className={styles.field}>
                    <label htmlFor="note" className={styles.label}>
                        {t('noteOptional')}
                    </label>
                    <textarea
                        id="note"
                        value={formData.note}
                        onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                        placeholder={t('notePlaceholder')}
                        className={styles.textarea}
                        rows={3}
                        disabled={isSubmitting}
                    />
                </div>

                <CartSummary
                    subtotal={subtotal}
                    total={total}
                    checkoutLabel={isSubmitting ? t('processing') : t('createOrder')}
                    checkoutDisabled={isSubmitting || tables.length === 0}
                />
            </form>
        </div>
    );
}
