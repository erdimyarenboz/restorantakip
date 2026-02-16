import { useToast } from '../store/ToastContext';
import styles from '../styles/ToastContainer.module.css';

export default function ToastContainer() {
    const { toasts, removeToast } = useToast();

    return (
        <div className={styles.container}>
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`${styles.toast} ${styles[toast.type]}`}
                    onClick={() => removeToast(toast.id)}
                >
                    <span className={styles.icon}>
                        {toast.type === 'success' && '✓'}
                        {toast.type === 'error' && '✕'}
                        {toast.type === 'info' && 'ℹ'}
                    </span>
                    <span className={styles.message}>{toast.message}</span>
                </div>
            ))}
        </div>
    );
}
