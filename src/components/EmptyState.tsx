import styles from '../styles/EmptyState.module.css';

interface EmptyStateProps {
    icon?: string;
    title: string;
    message: string;
    actionLabel?: string;
    onAction?: () => void;
}

export default function EmptyState({
    icon = '📦',
    title,
    message,
    actionLabel,
    onAction,
}: EmptyStateProps) {
    return (
        <div className={styles.container}>
            <div className={styles.icon}>{icon}</div>
            <h2 className={styles.title}>{title}</h2>
            <p className={styles.message}>{message}</p>
            {actionLabel && onAction && (
                <button className={styles.button} onClick={onAction}>
                    {actionLabel}
                </button>
            )}
        </div>
    );
}
