import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { useToast } from '../store/ToastContext';
import styles from '../styles/LoginPage.module.css';

const ADMIN_PASSWORD = '12345';

type UserRole = 'customer' | 'admin' | 'waiter' | 'kitchen';

interface RoleOption {
    id: UserRole;
    label: string;
    description: string;
    icon: string;
    requiresPassword: boolean;
}

const roles: RoleOption[] = [
    { id: 'customer', label: 'Müşteri', description: 'Sipariş vermek için', icon: '👤', requiresPassword: false },
    { id: 'admin', label: 'Restoran Yönetici', description: 'Tam yönetim erişimi', icon: '👨‍💼', requiresPassword: true },
    { id: 'waiter', label: 'Garson', description: 'Sipariş yönetimi', icon: '🧑‍🍳', requiresPassword: true },
    { id: 'kitchen', label: 'Mutfak', description: 'Sipariş hazırlama', icon: '🍳', requiresPassword: false },
];

export default function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const { showToast } = useToast();
    const [selectedRole, setSelectedRole] = useState<UserRole>('customer');
    const [adminPassword, setAdminPassword] = useState('');
    const [showPasswordInput, setShowPasswordInput] = useState(false);

    const handleRoleSelect = (role: UserRole) => {
        setSelectedRole(role);
    };

    const handleContinue = () => {
        const role = roles.find(r => r.id === selectedRole);
        if (role?.requiresPassword) {
            setShowPasswordInput(true);
        } else {
            handleDirectLogin(selectedRole);
        }
    };

    const handleDirectLogin = (role: UserRole) => {
        if (role === 'customer') {
            login('customer');
            navigate('/');
        } else if (role === 'kitchen') {
            login('admin');
            navigate('/kitchen');
        }
    };

    const handlePasswordLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (adminPassword === ADMIN_PASSWORD) {
            if (selectedRole === 'admin') {
                login('admin');
                navigate('/admin');
            } else if (selectedRole === 'waiter') {
                login('admin');
                navigate('/waiter');
            }
        } else {
            showToast('Hatalı şifre!', 'error');
            setAdminPassword('');
        }
    };

    const handleBackToSelection = () => {
        setShowPasswordInput(false);
        setAdminPassword('');
    };

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                {!showPasswordInput ? (
                    <div className={styles.card}>
                        <div className={styles.header}>
                            <div className={styles.logoIcon}>📋</div>
                            <h1 className={styles.title}>Hoş Geldiniz</h1>
                            <p className={styles.subtitle}>Devam etmek için giriş yapın</p>
                        </div>

                        <div className={styles.roleSection}>
                            <p className={styles.roleLabel}>Rol Seçimi</p>
                            <div className={styles.roleGrid}>
                                {roles.map((role) => (
                                    <button
                                        key={role.id}
                                        className={`${styles.roleButton} ${selectedRole === role.id ? styles.roleActive : ''}`}
                                        onClick={() => handleRoleSelect(role.id)}
                                    >
                                        <span className={styles.roleIcon}>{role.icon}</span>
                                        <span className={styles.roleName}>{role.label}</span>
                                        <span className={styles.roleDesc}>{role.description}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button className={styles.continueButton} onClick={handleContinue}>
                            <span>→</span> Devam Et
                        </button>
                    </div>
                ) : (
                    <div className={styles.card}>
                        <div className={styles.header}>
                            <div className={styles.logoIcon}>🔐</div>
                            <h1 className={styles.title}>
                                {selectedRole === 'admin' ? 'Yönetici Girişi' : 'Garson Girişi'}
                            </h1>
                            <p className={styles.subtitle}>Devam etmek için şifre girin</p>
                        </div>

                        <form onSubmit={handlePasswordLogin} className={styles.passwordForm}>
                            <div className={styles.passwordField}>
                                <label htmlFor="password" className={styles.passwordLabel}>
                                    Şifre
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    value={adminPassword}
                                    onChange={(e) => setAdminPassword(e.target.value)}
                                    placeholder="Şifre girin"
                                    className={styles.passwordInput}
                                    autoFocus
                                />
                            </div>

                            <button type="submit" className={styles.continueButton}>
                                Giriş Yap
                            </button>

                            <button
                                type="button"
                                onClick={handleBackToSelection}
                                className={styles.backButton}
                            >
                                ← Geri Dön
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
