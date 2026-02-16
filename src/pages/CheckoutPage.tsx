import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../store/CartContext';
import { useOrders } from '../store/OrdersContext';
import { useToast } from '../store/ToastContext';
import CartSummary from '../components/CartSummary';
import type { TableOrder } from '../types';
import styles from '../styles/CheckoutPage.module.css';

export default function CheckoutPage() {
    const navigate = useNavigate();
    const { items, subtotal, total, clearCart } = useCart();
    const { createOrder } = useOrders();
    const { showToast } = useToast();

    const [formData, setFormData] = useState<TableOrder>({
        tableNumber: 1,
        waiterName: 'Garson', // Default value, not editable by customer
        note: '',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Redirect if cart is empty
    if (items.length === 0) {
        navigate('/cart');
        return null;
    }


    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Create order via backend API
            const order = await createOrder(formData, items, { subtotal, total });
            clearCart();

            // Show success notification
            showToast('✅ Siparişiniz alındı, hazırlanma aşamasında!', 'success');

            navigate(`/orders/${order.orderId}`);
        } catch (error) {
            console.error('Order creation failed:', error);
            showToast('❌ Sipariş oluşturulamadı. Lütfen tekrar deneyin.', 'error');
            setIsSubmitting(false);
        }
    };


    return (
        <div className={styles.page}>
            <h1 className={styles.title}>Sipariş Onayı</h1>

            <form onSubmit={handleSubmit} className={styles.form}>
                <h2 className={styles.sectionTitle}>Masa Bilgileri</h2>

                <div className={styles.field}>
                    <label htmlFor="tableNumber" className={styles.label}>
                        Masa Numarası *
                    </label>
                    <select
                        id="tableNumber"
                        value={formData.tableNumber}
                        onChange={(e) =>
                            setFormData({ ...formData, tableNumber: Number(e.target.value) })
                        }
                        className={styles.select}
                        disabled={isSubmitting}
                    >
                        {Array.from({ length: 20 }, (_, i) => i + 1).map((num) => (
                            <option key={num} value={num}>
                                Masa {num}
                            </option>
                        ))}
                    </select>
                </div>

                <div className={styles.field}>
                    <label htmlFor="note" className={styles.label}>
                        Not (Opsiyonel)
                    </label>
                    <textarea
                        id="note"
                        value={formData.note}
                        onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                        placeholder="Özel istek veya not..."
                        className={styles.textarea}
                        rows={3}
                        disabled={isSubmitting}
                    />
                </div>

                <CartSummary
                    subtotal={subtotal}
                    total={total}
                    checkoutLabel={isSubmitting ? 'İşleniyor...' : 'Sipariş Oluştur'}
                    checkoutDisabled={isSubmitting}
                />
            </form>
        </div>
    );
}
