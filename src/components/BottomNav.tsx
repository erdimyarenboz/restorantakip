import { NavLink } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import styles from '../styles/BottomNav.module.css';

export default function BottomNav() {
    const { role, logout } = useAuth();

    // Only show for customer role
    if (role !== 'customer') return null;

    return (
        <nav className={styles.nav}>
            <NavLink
                to="/"
                className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
            >
                <span className={styles.icon}>🏠</span>
                <span className={styles.label}>Menü</span>
            </NavLink>

            <NavLink
                to="/cart"
                className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
            >
                <span className={styles.icon}>🛒</span>
                <span className={styles.label}>Sipariş</span>
            </NavLink>

            <NavLink
                to="/orders"
                className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
            >
                <span className={styles.icon}>📋</span>
                <span className={styles.label}>Siparişlerim</span>
            </NavLink>

            <button onClick={logout} className={`${styles.link} ${styles.logoutLink}`}>
                <span className={styles.icon}>🚪</span>
                <span className={styles.label}>Çıkış</span>
            </button>
        </nav>
    );
}
