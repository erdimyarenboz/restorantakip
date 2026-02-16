import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { useToast } from '../store/ToastContext';
import styles from '../styles/LoginPage.module.css';

const ADMIN_PASSWORD = '12345';

export default function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const { showToast } = useToast();
    const [adminPassword, setAdminPassword] = useState('');
    const [showPasswordInput, setShowPasswordInput] = useState(false);

    const handleAdminClick = () => {
        setShowPasswordInput(true);
    };

    const handleAdminLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (adminPassword === ADMIN_PASSWORD) {
            login('admin');
            navigate('/kitchen');
        } else {
            showToast('Hatalı şifre! (Şifre: 12345)', 'error');
            setAdminPassword('');
        }
    };

    const handleCustomerLogin = () => {
        login('customer');
        navigate('/');
    };

    const handleBackToSelection = () => {
        setShowPasswordInput(false);
        setAdminPassword('');
    };

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <div className={styles.card}>
                    <div className={styles.header}>
                        <div className={styles.logo}>🍽️</div>
                        <h1 className={styles.title}>Restoran Sipariş Sistemi</h1>
                        <p className={styles.subtitle}>Giriş yaparak devam edin</p>
                    </div>

                    {!showPasswordInput ? (
                        <div className={styles.buttons}>
                            <button
                                className={`${styles.loginButton} ${styles.admin}`}
                                onClick={handleAdminClick}
                            >
                                <span className={styles.buttonIcon}>👨‍🍳</span>
                                <div className={styles.buttonContent}>
                                    <span className={styles.buttonTitle}>Restoran Admin</span>
                                    <span className={styles.buttonDesc}>Mutfak, Garson, Kasa</span>
                                </div>
                            </button>

                            <button
                                className={`${styles.loginButton} ${styles.customer}`}
                                onClick={handleCustomerLogin}
                            >
                                <span className={styles.buttonIcon}>📱</span>
                                <div className={styles.buttonContent}>
                                    <span className={styles.buttonTitle}>Sipariş Girişi</span>
                                    <span className={styles.buttonDesc}>Menü, Sepet, Siparişler</span>
                                </div>
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleAdminLogin} className={styles.passwordForm}>
                            <div className={styles.passwordHeader}>
                                <button
                                    type="button"
                                    onClick={handleBackToSelection}
                                    className={styles.backButton}
                                >
                                    ← Geri
                                </button>
                                <span className={styles.passwordTitle}>👨‍🍳 Admin Girişi</span>
                            </div>

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

                            <button type="submit" className={styles.submitButton}>
                                Giriş Yap
                            </button>
                        </form>
                    )}

                    <div className={styles.footer}>
                        <p className={styles.note}>
                            ⚠️ Demo sistem - Admin şifresi: 12345
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
