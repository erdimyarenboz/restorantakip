import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { useToast } from '../store/ToastContext';
import styles from '../styles/LoginPage.module.css';

// Demo credentials — in production, this would be an API call
const CREDENTIALS: { username: string; password: string; role: 'admin' | 'waiter' | 'kitchen' | 'customer' }[] = [
    { username: 'admin@kofteci.com', password: 'admin123', role: 'admin' },
    { username: 'garson', password: '12345', role: 'waiter' },
    { username: 'mutfak', password: '12345', role: 'kitchen' },
];

export default function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const { showToast } = useToast();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Check credentials
        const match = CREDENTIALS.find(c => c.username === username && c.password === password);

        setTimeout(() => {
            if (match) {
                login(match.role);
                if (match.role === 'admin') navigate('/admin');
                else if (match.role === 'waiter') navigate('/waiter');
                else if (match.role === 'kitchen') navigate('/kitchen');
                else navigate('/menu');
            } else {
                showToast('Kullanıcı adı veya şifre hatalı!', 'error');
                setPassword('');
            }
            setLoading(false);
        }, 400);
    };

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <div className={styles.card}>
                    {/* Header */}
                    <div className={styles.header}>
                        <Link to="/" className={styles.backToHome}>← Ana Sayfa</Link>
                        <div className={styles.logoIcon}>🍽️</div>
                        <h1 className={styles.title}>Hoş Geldiniz</h1>
                        <p className={styles.subtitle}>Restoran panelinize giriş yapın</p>
                    </div>

                    {/* Login Form */}
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
                                placeholder="E-posta veya kullanıcı adı"
                                className={styles.passwordInput}
                                autoFocus
                                required
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
                                placeholder="Şifrenizi girin"
                                className={styles.passwordInput}
                                required
                            />
                        </div>

                        <button type="submit" className={styles.continueButton} disabled={loading}>
                            {loading ? '⏳ Giriş yapılıyor...' : '🔐 Giriş Yap'}
                        </button>
                    </form>

                    {/* Demo info */}
                    <div className={styles.demoInfo}>
                        <p className={styles.demoTitle}>📋 Demo Hesaplar</p>
                        <div className={styles.demoGrid}>
                            <div className={styles.demoItem}>
                                <span className={styles.demoRole}>👨‍💼 Yönetici</span>
                                <span className={styles.demoCred}>admin@kofteci.com / admin123</span>
                            </div>
                            <div className={styles.demoItem}>
                                <span className={styles.demoRole}>🧑‍🍳 Garson</span>
                                <span className={styles.demoCred}>garson / 12345</span>
                            </div>
                            <div className={styles.demoItem}>
                                <span className={styles.demoRole}>🍳 Mutfak</span>
                                <span className={styles.demoCred}>mutfak / 12345</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
