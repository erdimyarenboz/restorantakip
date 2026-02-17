import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { useToast } from '../store/ToastContext';
import styles from '../styles/LoginPage.module.css';

type UserRole = 'customer' | 'admin' | 'waiter' | 'kitchen';

interface RoleOption {
    id: UserRole;
    label: string;
    description: string;
    icon: string;
    requiresAuth: boolean;
    demoUsername: string;
    demoPassword: string;
}

const roles: RoleOption[] = [
    { id: 'customer', label: 'Müşteri', description: 'Sipariş vermek için', icon: '👤', requiresAuth: false, demoUsername: '', demoPassword: '' },
    { id: 'admin', label: 'Restoran Yönetici', description: 'Tam yönetim erişimi', icon: '👨‍💼', requiresAuth: true, demoUsername: 'admin@kofteci.com', demoPassword: 'admin123' },
    { id: 'waiter', label: 'Garson', description: 'Sipariş yönetimi', icon: '🧑‍🍳', requiresAuth: true, demoUsername: 'garson', demoPassword: '12345' },
    { id: 'kitchen', label: 'Mutfak', description: 'Sipariş hazırlama', icon: '🍳', requiresAuth: true, demoUsername: 'mutfak', demoPassword: '12345' },
];

export default function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const { showToast } = useToast();
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
            // Müşteri — direct access
            login('customer');
            navigate('/');
        }
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        const role = roles.find(r => r.id === selectedRole)!;

        if (username === role.demoUsername && password === role.demoPassword) {
            login('admin');
            if (selectedRole === 'admin') navigate('/admin');
            if (selectedRole === 'waiter') navigate('/waiter');
            if (selectedRole === 'kitchen') navigate('/kitchen');
        } else {
            showToast('Kullanıcı adı veya şifre hatalı!', 'error');
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
                {!showLoginForm ? (
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
                                {selectedRole === 'admin' && 'Yönetici Girişi'}
                                {selectedRole === 'waiter' && 'Garson Girişi'}
                                {selectedRole === 'kitchen' && 'Mutfak Girişi'}
                            </h1>
                            <p className={styles.subtitle}>Devam etmek için bilgilerinizi girin</p>
                        </div>

                        <form onSubmit={handleLogin} className={styles.passwordForm}>
                            <div className={styles.passwordField}>
                                <label htmlFor="username" className={styles.passwordLabel}>
                                    Kullanıcı Adı
                                </label>
                                <input
                                    id="username"
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Kullanıcı adı girin"
                                    className={styles.passwordInput}
                                    autoFocus
                                />
                            </div>

                            <div className={styles.passwordField}>
                                <label htmlFor="password" className={styles.passwordLabel}>
                                    Şifre
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Şifre girin"
                                    className={styles.passwordInput}
                                />
                            </div>

                            <button type="submit" className={styles.continueButton}>
                                Giriş Yap
                            </button>

                            <button
                                type="button"
                                onClick={handleBack}
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
