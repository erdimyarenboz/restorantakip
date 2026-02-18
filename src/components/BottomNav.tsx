import { NavLink } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { useLanguage } from '../i18n/i18n';
import styles from '../styles/BottomNav.module.css';

export default function BottomNav() {
    const { role, logout } = useAuth();
    const { t } = useLanguage();

    // Only show for customer role
    if (role !== 'customer') return null;

    return (
        <nav className={styles.nav}>
            <NavLink
                to="/"
                className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
            >
                <span className={styles.icon}>🏠</span>
                <span className={styles.label}>{t('menu')}</span>
            </NavLink>

            <NavLink
                to="/cart"
                className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
            >
                <span className={styles.icon}>🛒</span>
                <span className={styles.label}>{t('order')}</span>
            </NavLink>

            <NavLink
                to="/orders"
                className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
            >
                <span className={styles.icon}>📋</span>
                <span className={styles.label}>{t('orders')}</span>
            </NavLink>

            <button onClick={logout} className={`${styles.link} ${styles.logoutLink}`}>
                <span className={styles.icon}>🚪</span>
                <span className={styles.label}>{t('logout')}</span>
            </button>
        </nav>
    );
}
