import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { useToast } from '../store/ToastContext';
import styles from '../styles/PlatformLogin.module.css';

const SUPER_ADMIN_PASSWORD = 'super2026';

export default function PlatformLoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const { showToast } = useToast();
    const [password, setPassword] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === SUPER_ADMIN_PASSWORD) {
            login('super_admin');
            navigate('/admin');
        } else {
            showToast('Hatalı platform yönetici şifresi!', 'error');
            setPassword('');
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <div className={styles.card}>
                    <div className={styles.header}>
                        <div className={styles.logo}>🛡️</div>
                        <h1 className={styles.title}>Platform Yönetimi</h1>
                        <p className={styles.subtitle}>Tüm restoran ve cafeleri yönetin</p>
                    </div>

                    <form onSubmit={handleLogin} className={styles.form}>
                        <div className={styles.field}>
                            <label htmlFor="platform-password" className={styles.label}>
                                Yönetici Şifresi
                            </label>
                            <input
                                id="platform-password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Platform şifresini girin"
                                className={styles.input}
                                autoFocus
                            />
                        </div>

                        <button type="submit" className={styles.submitBtn}>
                            🔐 Giriş Yap
                        </button>
                    </form>

                    <div className={styles.footer}>
                        <p className={styles.footerText}>
                            Bu sayfa sadece platform yöneticileri içindir.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
