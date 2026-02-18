import { Link, useLocation, NavLink } from 'react-router-dom';
import { useCart } from '../store/CartContext';
import { useAuth } from '../store/AuthContext';
import { useMenu } from '../store/MenuContext';
import { useLanguage, LANGUAGES } from '../i18n/i18n';
import styles from '../styles/Header.module.css';

interface HeaderProps {
    onSearch?: (query: string) => void;
    searchQuery?: string;
}

export default function Header({ onSearch, searchQuery = '' }: HeaderProps) {
    const { itemCount } = useCart();
    const { role, logout } = useAuth();
    const { restaurantName, restaurantLogo } = useMenu();
    const { t, language, setLanguage } = useLanguage();
    const location = useLocation();
    const isStaff = role === 'admin' || role === 'waiter' || role === 'kitchen' || role === 'super_admin';
    const showSearch = location.pathname === '/' && role === 'customer';

    // Determine home path per role
    const homePath = role === 'waiter' ? '/waiter' : role === 'kitchen' ? '/kitchen' : isStaff ? '/kitchen' : '/';

    return (
        <header className={styles.header}>
            <div className={styles.container}>
                <Link to={homePath} className={styles.logo}>
                    {restaurantLogo ? (
                        <img src={restaurantLogo} alt={restaurantName} className={styles.logoImage} />
                    ) : (
                        <>🍽️ </>
                    )}
                    {restaurantName}
                </Link>

                {showSearch && onSearch && (
                    <div className={styles.searchWrapper}>
                        <input
                            type="text"
                            placeholder={t('search')}
                            value={searchQuery}
                            onChange={(e) => onSearch(e.target.value)}
                            className={styles.searchInput}
                            aria-label={t('search')}
                        />
                    </div>
                )}

                <div className={styles.rightSection}>
                    {/* Language Selector */}
                    <div className={styles.langSelector}>
                        {LANGUAGES.map(lang => (
                            <button
                                key={lang.code}
                                onClick={() => setLanguage(lang.code)}
                                className={`${styles.langBtn} ${language === lang.code ? styles.langActive : ''}`}
                                title={lang.label}
                            >
                                {lang.flag}
                            </button>
                        ))}
                    </div>

                    {isStaff && (
                        <nav className={styles.adminNav}>
                            {/* Admin sees all links */}
                            {role === 'admin' && (
                                <>
                                    <NavLink
                                        to="/kitchen"
                                        className={({ isActive }) =>
                                            `${styles.adminLink} ${isActive ? styles.active : ''}`
                                        }
                                    >
                                        👨‍🍳 {t('roleKitchen')}
                                    </NavLink>
                                    <NavLink
                                        to="/waiter"
                                        className={({ isActive }) =>
                                            `${styles.adminLink} ${isActive ? styles.active : ''}`
                                        }
                                    >
                                        🍴 {t('roleWaiter')}
                                    </NavLink>
                                    <NavLink
                                        to="/admin"
                                        className={({ isActive }) =>
                                            `${styles.adminLink} ${isActive ? styles.active : ''}`
                                        }
                                    >
                                        💰 {t('adminCashier')}
                                    </NavLink>
                                </>
                            )}
                            {/* Kitchen only sees Mutfak */}
                            {role === 'kitchen' && (
                                <NavLink
                                    to="/kitchen"
                                    className={({ isActive }) =>
                                        `${styles.adminLink} ${isActive ? styles.active : ''}`
                                    }
                                >
                                    👨‍🍳 {t('roleKitchen')}
                                </NavLink>
                            )}
                            {/* Waiter only sees Garson */}
                            {role === 'waiter' && (
                                <NavLink
                                    to="/waiter"
                                    className={({ isActive }) =>
                                        `${styles.adminLink} ${isActive ? styles.active : ''}`
                                    }
                                >
                                    🍴 {t('roleWaiter')}
                                </NavLink>
                            )}
                            <button onClick={logout} className={styles.logoutButton}>
                                🚪 {t('logout')}
                            </button>
                        </nav>
                    )}

                    {role === 'customer' && (
                        <Link to="/cart" className={styles.cartLink} aria-label={t('cart')}>
                            <span className={styles.cartIcon}>🛒</span>
                            {itemCount > 0 && <span className={styles.cartBadge}>{itemCount}</span>}
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}
