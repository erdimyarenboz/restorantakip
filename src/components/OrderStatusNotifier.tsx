import { useEffect, useRef } from 'react';
import { useOrders } from '../store/OrdersContext';
import { useToast } from '../store/ToastContext';
import { useAuth } from '../store/AuthContext';
import { useLanguage } from '../i18n/i18n';

export default function OrderStatusNotifier() {
    const { orders } = useOrders();
    const { showToast } = useToast();
    const { role } = useAuth();
    const { t } = useLanguage();
    const prevOrdersRef = useRef(orders);

    useEffect(() => {
        if (role !== 'customer') return;

        const prevOrders = prevOrdersRef.current;

        orders.forEach(order => {
            const prevOrder = prevOrders.find(o => o.orderId === order.orderId);

            if (prevOrder && prevOrder.status !== order.status) {
                if (order.status === 'Hazır') {
                    showToast(
                        `${t('orderReady')} (#${order.orderId})`,
                        'success'
                    );
                }
            }
        });

        prevOrdersRef.current = orders;
    }, [orders, role, showToast, t]);

    return null;
}
