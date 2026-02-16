import { useEffect, useRef } from 'react';
import { useOrders } from '../store/OrdersContext';
import { useToast } from '../store/ToastContext';
import { useAuth } from '../store/AuthContext';

export default function OrderStatusNotifier() {
    const { orders } = useOrders();
    const { showToast } = useToast();
    const { role } = useAuth();
    const prevOrdersRef = useRef(orders);

    useEffect(() => {
        // Sadece customer için
        if (role !== 'customer') return;

        const prevOrders = prevOrdersRef.current;

        // Sipariş durumu değişikliklerini kontrol et
        orders.forEach(order => {
            const prevOrder = prevOrders.find(o => o.orderId === order.orderId);

            if (prevOrder && prevOrder.status !== order.status) {
                // Duruma göre toast göster
                if (order.status === 'Hazır') {
                    showToast(
                        `🎉 Siparişiniz hazır! (#${order.orderId})`,
                        'success'
                    );
                }
            }
        });

        prevOrdersRef.current = orders;
    }, [orders, role, showToast]);

    return null; // Görsel component değil
}
