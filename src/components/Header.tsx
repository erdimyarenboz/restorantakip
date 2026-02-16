import { Link, useLocation, NavLink } from 'react-router-dom';
import { useCart } from '../store/CartContext';
import { useAuth } from '../store/AuthContext';
import styles from '../styles/Header.module.css';

interface HeaderProps {
    onSearch?: (query: string) => void;
    searchQuery?: string;
}

export default function Header({ onSearch, searchQuery = '' }: HeaderProps) {
    const { itemCount } = useCart();
    const { role, logout } = useAuth();
    const location = useLocation();
    const isAdminLike = role === 'admin' || role === 'super_admin';
    const showSearch = location.pathname === '/' && role === 'customer';

    return (
        <header className={styles.header}>
            <div className={styles.container}>
                <Link to={isAdminLike ? '/kitchen' : '/'} className={styles.logo}>
                    🍽️ Restoran Sipariş
                </Link>

                {showSearch && onSearch && (
                    <div className={styles.searchWrapper}>
                        <input
                            type="text"
                            placeholder="Menüde ara..."
                            value={searchQuery}
                            onChange={(e) => onSearch(e.target.value)}
                            className={styles.searchInput}
                            aria-label="Menüde ara"
                        />
                    </div>
                )}

                <div className={styles.rightSection}>
                    {isAdminLike && (
                        <nav className={styles.adminNav}>
                            <NavLink
                                to="/kitchen"
                                className={({ isActive }) =>
                                    `${styles.adminLink} ${isActive ? styles.active : ''}`
                                }
                            >
                                👨‍🍳 Mutfak
                            </NavLink>
                            <NavLink
                                to="/waiter"
                                className={({ isActive }) =>
                                    `${styles.adminLink} ${isActive ? styles.active : ''}`
                                }
                            >
                                🍴 Garson
                            </NavLink>
                            <NavLink
                                to="/admin"
                                className={({ isActive }) =>
                                    `${styles.adminLink} ${isActive ? styles.active : ''}`
                                }
                            >
                                💰 Kasa
                            </NavLink>
                            <button onClick={logout} className={styles.logoutButton}>
                                Çıkış
                            </button>
                        </nav>
                    )}

                    {role === 'customer' && (
                        <Link to="/cart" className={styles.cartLink} aria-label="Sepet">
                            <span className={styles.cartIcon}>🛒</span>
                            {itemCount > 0 && <span className={styles.cartBadge}>{itemCount}</span>}
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}
