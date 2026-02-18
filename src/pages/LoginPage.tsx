import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { useToast } from '../store/ToastContext';
import { staffUsersAPI } from '../services/api';
import styles from '../styles/LoginPage.module.css';

export default function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const { showToast } = useToast();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data } = await staffUsersAPI.login(username, password);

            if (data.success && data.user) {
                login(data.user.role);
                if (data.user.role === 'admin') navigate('/admin');
                else if (data.user.role === 'waiter') navigate('/waiter');
                else if (data.user.role === 'kitchen') navigate('/kitchen');
                else navigate('/menu');
            }
        } catch (err: any) {
            const msg = err.response?.data?.error || 'Kullanıcı adı veya şifre hatalı!';
            showToast(msg, 'error');
            setPassword('');
        }

        setLoading(false);
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
                </div>
            </div>
        </div>
    );
}
