import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { useToast } from '../store/ToastContext';
import { useLanguage, LANGUAGES } from '../i18n/i18n';
import styles from '../styles/LoginPage.module.css';

type UserRole = 'customer' | 'admin' | 'waiter' | 'kitchen';

interface RoleOption {
    id: UserRole;
    labelKey: string;
    descKey: string;
    icon: string;
    requiresAuth: boolean;
    demoUsername: string;
    demoPassword: string;
}

const roles: RoleOption[] = [
    { id: 'customer', labelKey: 'roleCustomer', descKey: 'roleCustomerDesc', icon: '👤', requiresAuth: false, demoUsername: '', demoPassword: '' },
    { id: 'admin', labelKey: 'roleAdmin', descKey: 'roleAdminDesc', icon: '👨‍💼', requiresAuth: true, demoUsername: 'admin@kofteci.com', demoPassword: 'admin123' },
    { id: 'waiter', labelKey: 'roleWaiter', descKey: 'roleWaiterDesc', icon: '🧑‍🍳', requiresAuth: true, demoUsername: 'garson', demoPassword: '12345' },
    { id: 'kitchen', labelKey: 'roleKitchen', descKey: 'roleKitchenDesc', icon: '🍳', requiresAuth: true, demoUsername: 'mutfak', demoPassword: '12345' },
];

export default function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const { showToast } = useToast();
    const { t, language, setLanguage } = useLanguage();
    const [selectedRole, setSelectedRole] = useState<UserRole>('customer');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showLoginForm, setShowLoginForm] = useState(false);

    const handleRoleSelect = (role: UserRole) => {
        setSelectedRole(role);
    };

    const handleContinue = () => {
        const role = roles.find(r => r.id === selectedRole);
        if (role?.requiresAuth) {
            setShowLoginForm(true);
        } else {
            login('customer');
            navigate('/');
        }
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        const role = roles.find(r => r.id === selectedRole)!;

        if (username === role.demoUsername && password === role.demoPassword) {
            login(selectedRole);
            if (selectedRole === 'admin') navigate('/admin');
            if (selectedRole === 'waiter') navigate('/waiter');
            if (selectedRole === 'kitchen') navigate('/kitchen');
        } else {
            showToast(t('loginError'), 'error');
            setPassword('');
        }
    };

    const handleBack = () => {
        setShowLoginForm(false);
        setUsername('');
        setPassword('');
    };

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                {/* Language Selector */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
                    {LANGUAGES.map(lang => (
                        <button
                            key={lang.code}
                            onClick={() => setLanguage(lang.code)}
                            style={{
                                padding: '6px 12px',
                                borderRadius: '8px',
                                border: language === lang.code ? '2px solid #10B981' : '1px solid rgba(255,255,255,0.1)',
                                background: language === lang.code ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.05)',
                                color: language === lang.code ? '#10B981' : 'var(--color-text-secondary)',
                                cursor: 'pointer',
                                fontSize: '1rem',
                                transition: 'all 0.2s',
                            }}
                        >
                            {lang.flag}
                        </button>
                    ))}
                </div>

                {!showLoginForm ? (
                    <div className={styles.card}>
                        <div className={styles.header}>
                            <div className={styles.logoIcon}>📋</div>
                            <h1 className={styles.title}>{t('welcome')}</h1>
                            <p className={styles.subtitle}>{t('continueToLogin')}</p>
                        </div>

                        <div className={styles.roleSection}>
                            <p className={styles.roleLabel}>{t('roleSelection')}</p>
                            <div className={styles.roleGrid}>
                                {roles.map((role) => (
                                    <button
                                        key={role.id}
                                        className={`${styles.roleButton} ${selectedRole === role.id ? styles.roleActive : ''}`}
                                        onClick={() => handleRoleSelect(role.id)}
                                    >
                                        <span className={styles.roleIcon}>{role.icon}</span>
                                        <span className={styles.roleName}>{t(role.labelKey as any)}</span>
                                        <span className={styles.roleDesc}>{t(role.descKey as any)}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button className={styles.continueButton} onClick={handleContinue}>
                            <span>→</span> {t('continueBtn')}
                        </button>
                    </div>
                ) : (
                    <div className={styles.card}>
                        <div className={styles.header}>
                            <div className={styles.logoIcon}>🔐</div>
                            <h1 className={styles.title}>
                                {selectedRole === 'admin' && t('adminLogin')}
                                {selectedRole === 'waiter' && t('waiterLogin')}
                                {selectedRole === 'kitchen' && t('kitchenLogin')}
                            </h1>
                            <p className={styles.subtitle}>{t('enterCredentials')}</p>
                        </div>

                        <form onSubmit={handleLogin} className={styles.passwordForm}>
                            <div className={styles.passwordField}>
                                <label htmlFor="username" className={styles.passwordLabel}>
                                    {t('username')}
                                </label>
                                <input
                                    id="username"
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder={t('usernamePlaceholder')}
                                    className={styles.passwordInput}
                                    autoFocus
                                />
                            </div>

                            <div className={styles.passwordField}>
                                <label htmlFor="password" className={styles.passwordLabel}>
                                    {t('password')}
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder={t('passwordPlaceholder')}
                                    className={styles.passwordInput}
                                />
                            </div>

                            <button type="submit" className={styles.continueButton}>
                                {t('loginBtn')}
                            </button>

                            <button
                                type="button"
                                onClick={handleBack}
                                className={styles.backButton}
                            >
                                {t('backBtn')}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
