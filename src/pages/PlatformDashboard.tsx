import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { crmAPI, staffUsersAPI, emailAPI } from '../services/api';
import styles from '../styles/PlatformDashboard.module.css';

type CrmTab = 'dashboard' | 'active' | 'leads' | 'add' | 'users' | 'email';

interface StaffUser {
    id: string;
    restaurant_id: string;
    username: string;
    role: string;
    display_name: string | null;
    is_active: boolean;
    created_at: string;
}

const ROLE_LABELS: Record<string, string> = {
    admin: '👨‍💼 Yönetici',
    waiter: '🧑‍🍳 Garson',
    kitchen: '🍳 Mutfak',
};

interface CrmStats {
    total: number;
    active: number;
    trial: number;
    leads: number;
    expired: number;
    monthlyRevenue: number;
}

interface Restaurant {
    id: string;
    name: string;
    slug: string;
    phone: string | null;
    address: string | null;
    is_active: boolean;
    subscription_plan: string;
    contract_months: number;
    contract_start_date: string | null;
    contract_status: string;
    contact_person: string | null;
    contact_phone: string | null;
    contact_email: string | null;
    notes: string | null;
    monthly_fee: string;
    created_at: string;
}

const STATUS_LABELS: Record<string, string> = {
    active: 'Aktif',
    trial: 'Deneme',
    lead: 'Potansiyel',
    expired: 'Süresi Dolmuş',
    cancelled: 'İptal',
};

const STATUS_CLASS: Record<string, string> = {
    active: styles.statusActive,
    trial: styles.statusTrial,
    lead: styles.statusLead,
    expired: styles.statusExpired,
    cancelled: styles.statusCancelled,
};

function getContractProgress(startDate: string | null, months: number): { current: number; percent: number } {
    if (!startDate || months <= 0) return { current: 0, percent: 0 };
    const start = new Date(startDate);
    const now = new Date();
    const diffMs = now.getTime() - start.getTime();
    const diffMonths = Math.floor(diffMs / (30.44 * 24 * 60 * 60 * 1000));
    const current = Math.min(Math.max(diffMonths + 1, 1), months);
    const percent = Math.min((current / months) * 100, 100);
    return { current, percent };
}

export default function PlatformDashboard() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [tab, setTab] = useState<CrmTab>('dashboard');
    const [stats, setStats] = useState<CrmStats | null>(null);
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [loading, setLoading] = useState(true);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    // Staff users state
    const [staffUsers, setStaffUsers] = useState<StaffUser[]>([]);
    const [selectedRestaurant, setSelectedRestaurant] = useState('');
    const [userForm, setUserForm] = useState({
        restaurant_id: '', username: '', password: '', role: 'admin', display_name: '',
    });
    const [userMsg, setUserMsg] = useState('');
    const [userErr, setUserErr] = useState('');

    // Email state
    const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
    const [emailSubject, setEmailSubject] = useState('🍽️ SipTakip — Restoranınızı Dijital Çağa Taşıyın');
    const [emailSending, setEmailSending] = useState(false);
    const [emailResult, setEmailResult] = useState<{ sent: number; failed: number } | null>(null);
    const [emailHtml, setEmailHtml] = useState('');
    const [showPreview, setShowPreview] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: '', slug: '', phone: '', address: '',
        contact_person: '', contact_phone: '', contact_email: '',
        contract_months: 0, contract_start_date: '',
        contract_status: 'lead', monthly_fee: 0,
        subscription_plan: 'free', notes: '',
    });

    const loadStats = useCallback(async () => {
        try {
            const { data } = await crmAPI.getStats();
            setStats(data);
        } catch { /* silently fail */ }
    }, []);

    const loadRestaurants = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await crmAPI.getRestaurants();
            setRestaurants(data);
        } catch { /* silently fail */ }
        setLoading(false);
    }, []);

    useEffect(() => {
        loadStats();
        loadRestaurants();
    }, [loadStats, loadRestaurants]);

    // Load email template when switching to email tab
    useEffect(() => {
        if (tab === 'email' && !emailHtml) {
            emailAPI.getTemplate().then(({ data }) => {
                setEmailHtml(data.html);
            }).catch(() => { /* silently fail */ });
        }
    }, [tab, emailHtml]);

    const handleLogout = () => {
        logout();
        navigate('/platform');
    };

    const handleAddRestaurant = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');

        if (!formData.name.trim() || !formData.slug.trim()) {
            setErrorMsg('Restoran adı ve slug zorunludur');
            return;
        }

        try {
            await crmAPI.addRestaurant({
                ...formData,
                monthly_fee: Number(formData.monthly_fee),
                contract_months: Number(formData.contract_months),
            });
            setSuccessMsg(`✅ "${formData.name}" başarıyla eklendi!`);
            setFormData({
                name: '', slug: '', phone: '', address: '',
                contact_person: '', contact_phone: '', contact_email: '',
                contract_months: 0, contract_start_date: '',
                contract_status: 'lead', monthly_fee: 0,
                subscription_plan: 'free', notes: '',
            });
            loadStats();
            loadRestaurants();
        } catch (err: any) {
            setErrorMsg(err.response?.data?.error || 'Restoran eklenirken hata oluştu');
        }
    };

    const loadStaffUsers = useCallback(async (restId?: string) => {
        try {
            const { data } = await staffUsersAPI.getAll(restId);
            setStaffUsers(data);
        } catch { /* silently fail */ }
    }, []);

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setUserMsg('');
        setUserErr('');

        if (!userForm.restaurant_id || !userForm.username || !userForm.password) {
            setUserErr('Restoran, kullanıcı adı ve şifre zorunludur');
            return;
        }

        try {
            await staffUsersAPI.create(userForm);
            setUserMsg(`✅ "${userForm.username}" başarıyla oluşturuldu!`);
            setUserForm(prev => ({ ...prev, username: '', password: '', display_name: '' }));
            loadStaffUsers(selectedRestaurant || undefined);
        } catch (err: any) {
            setUserErr(err.response?.data?.error || 'Kullanıcı oluşturulamadı');
        }
    };

    const handleDeleteUser = async (id: string, username: string) => {
        if (!confirm(`"${username}" kullanıcısını silmek istediğinizden emin misiniz?`)) return;
        try {
            await staffUsersAPI.remove(id);
            loadStaffUsers(selectedRestaurant || undefined);
        } catch { /* silently fail */ }
    };

    const handleToggleUser = async (id: string, isActive: boolean) => {
        try {
            await staffUsersAPI.update(id, { is_active: !isActive });
            loadStaffUsers(selectedRestaurant || undefined);
        } catch { /* silently fail */ }
    };

    const handleStatusChange = async (id: string, newStatus: string) => {
        try {
            await crmAPI.updateRestaurant(id, { contract_status: newStatus });
            loadRestaurants();
            loadStats();
        } catch { /* silently fail */ }
    };

    const activeRestaurants = restaurants.filter(r => r.contract_status === 'active' || r.contract_status === 'trial');
    const leadRestaurants = restaurants.filter(r => r.contract_status === 'lead');

    return (
        <div className={styles.dashboardContainer}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <span className={styles.headerIcon}>🛡️</span>
                    <div>
                        <div className={styles.headerTitle}>Platform Yönetimi</div>
                        <div className={styles.headerSubtitle}>CRM Dashboard</div>
                    </div>
                </div>
                <button onClick={handleLogout} className={styles.logoutBtn}>
                    Çıkış
                </button>
            </div>

            {/* Stats */}
            {stats && (
                <div className={styles.statsRow}>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon}>🏪</div>
                        <div className={styles.statValue}>{stats.total}</div>
                        <div className={styles.statLabel}>Toplam Restoran</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon}>✅</div>
                        <div className={styles.statValue}>{stats.active}</div>
                        <div className={styles.statLabel}>Aktif Anlaşma</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon}>🎯</div>
                        <div className={styles.statValue}>{stats.leads}</div>
                        <div className={styles.statLabel}>Potansiyel</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon}>💰</div>
                        <div className={styles.statValue}>₺{stats.monthlyRevenue.toLocaleString('tr-TR')}</div>
                        <div className={styles.statLabel}>Aylık Gelir</div>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className={styles.tabsNav}>
                <button className={`${styles.tab} ${tab === 'dashboard' ? styles.tabActive : ''}`} onClick={() => setTab('dashboard')}>
                    📊 Genel Bakış
                </button>
                <button className={`${styles.tab} ${tab === 'active' ? styles.tabActive : ''}`} onClick={() => setTab('active')}>
                    🤝 Anlaşmalı ({activeRestaurants.length})
                </button>
                <button className={`${styles.tab} ${tab === 'leads' ? styles.tabActive : ''}`} onClick={() => setTab('leads')}>
                    🎯 Potansiyel ({leadRestaurants.length})
                </button>
                <button className={`${styles.tab} ${tab === 'add' ? styles.tabActive : ''}`} onClick={() => setTab('add')}>
                    ➕ Restoran Ekle
                </button>
                <button className={`${styles.tab} ${tab === 'users' ? styles.tabActive : ''}`} onClick={() => { setTab('users'); loadStaffUsers(); }}>
                    👥 Kullanıcılar
                </button>
                <button className={`${styles.tab} ${tab === 'email' ? styles.tabActive : ''}`} onClick={() => { setTab('email'); setEmailResult(null); }}>
                    📧 Toplu E-posta
                </button>
            </div>

            {/* Content */}
            <div className={styles.content}>
                {loading && tab !== 'add' ? (
                    <div className={styles.loading}>Yükleniyor...</div>
                ) : (
                    <>
                        {/* Dashboard / All restaurants */}
                        {tab === 'dashboard' && (
                            <div className={styles.restaurantGrid}>
                                {restaurants.length === 0 ? (
                                    <div className={styles.emptyState}>
                                        <div className={styles.emptyIcon}>🏪</div>
                                        <div className={styles.emptyText}>Henüz restoran bulunmuyor</div>
                                    </div>
                                ) : (
                                    restaurants.map(r => (
                                        <RestaurantCard
                                            key={r.id}
                                            restaurant={r}
                                            onStatusChange={handleStatusChange}
                                        />
                                    ))
                                )}
                            </div>
                        )}

                        {/* Active contracts */}
                        {tab === 'active' && (
                            <div className={styles.restaurantGrid}>
                                {activeRestaurants.length === 0 ? (
                                    <div className={styles.emptyState}>
                                        <div className={styles.emptyIcon}>🤝</div>
                                        <div className={styles.emptyText}>Aktif anlaşma bulunmuyor</div>
                                    </div>
                                ) : (
                                    activeRestaurants.map(r => (
                                        <RestaurantCard
                                            key={r.id}
                                            restaurant={r}
                                            onStatusChange={handleStatusChange}
                                            showProgress
                                        />
                                    ))
                                )}
                            </div>
                        )}

                        {/* Leads */}
                        {tab === 'leads' && (
                            <div className={styles.restaurantGrid}>
                                {leadRestaurants.length === 0 ? (
                                    <div className={styles.emptyState}>
                                        <div className={styles.emptyIcon}>🎯</div>
                                        <div className={styles.emptyText}>Potansiyel müşteri bulunmuyor</div>
                                    </div>
                                ) : (
                                    leadRestaurants.map(r => (
                                        <RestaurantCard
                                            key={r.id}
                                            restaurant={r}
                                            onStatusChange={handleStatusChange}
                                        />
                                    ))
                                )}
                            </div>
                        )}

                        {/* Add restaurant form */}
                        {tab === 'add' && (
                            <div className={styles.formSection}>
                                <div className={styles.formTitle}>➕ Yeni Restoran Ekle</div>

                                {successMsg && <div className={styles.successMsg}>{successMsg}</div>}
                                {errorMsg && <div className={styles.errorMsg}>{errorMsg}</div>}

                                <form onSubmit={handleAddRestaurant} className={styles.formGrid}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Restoran Adı *</label>
                                        <input
                                            className={styles.formInput}
                                            value={formData.name}
                                            onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                                            placeholder="Örn: Lezzet Durağı"
                                            required
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Slug *</label>
                                        <input
                                            className={styles.formInput}
                                            value={formData.slug}
                                            onChange={e => setFormData(p => ({ ...p, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
                                            placeholder="Örn: lezzet-duragi"
                                            required
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>İletişim Kişisi</label>
                                        <input
                                            className={styles.formInput}
                                            value={formData.contact_person}
                                            onChange={e => setFormData(p => ({ ...p, contact_person: e.target.value }))}
                                            placeholder="İsim Soyisim"
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>İletişim Telefon</label>
                                        <input
                                            className={styles.formInput}
                                            value={formData.contact_phone}
                                            onChange={e => setFormData(p => ({ ...p, contact_phone: e.target.value }))}
                                            placeholder="0532 xxx xxxx"
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>E-posta Adresi 📧</label>
                                        <input
                                            type="email"
                                            className={styles.formInput}
                                            value={formData.contact_email}
                                            onChange={e => setFormData(p => ({ ...p, contact_email: e.target.value }))}
                                            placeholder="restoran@ornek.com"
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Telefon</label>
                                        <input
                                            className={styles.formInput}
                                            value={formData.phone}
                                            onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                                            placeholder="Restoran telefonu"
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Adres</label>
                                        <input
                                            className={styles.formInput}
                                            value={formData.address}
                                            onChange={e => setFormData(p => ({ ...p, address: e.target.value }))}
                                            placeholder="Restoran adresi"
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Durum</label>
                                        <select
                                            className={styles.formSelect}
                                            value={formData.contract_status}
                                            onChange={e => setFormData(p => ({ ...p, contract_status: e.target.value }))}
                                        >
                                            <option value="lead">🎯 Potansiyel</option>
                                            <option value="trial">⏳ Deneme</option>
                                            <option value="active">✅ Aktif</option>
                                        </select>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Plan</label>
                                        <select
                                            className={styles.formSelect}
                                            value={formData.subscription_plan}
                                            onChange={e => setFormData(p => ({ ...p, subscription_plan: e.target.value }))}
                                        >
                                            <option value="free">Ücretsiz</option>
                                            <option value="basic">Basic</option>
                                            <option value="premium">Premium</option>
                                        </select>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Anlaşma Süresi (Ay)</label>
                                        <input
                                            className={styles.formInput}
                                            type="number"
                                            min="0"
                                            value={formData.contract_months || ''}
                                            onChange={e => setFormData(p => ({ ...p, contract_months: parseInt(e.target.value) || 0 }))}
                                            placeholder="12"
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Anlaşma Başlangıcı</label>
                                        <input
                                            className={styles.formInput}
                                            type="date"
                                            value={formData.contract_start_date}
                                            onChange={e => setFormData(p => ({ ...p, contract_start_date: e.target.value }))}
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Aylık Ücret (₺)</label>
                                        <input
                                            className={styles.formInput}
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={formData.monthly_fee || ''}
                                            onChange={e => setFormData(p => ({ ...p, monthly_fee: parseFloat(e.target.value) || 0 }))}
                                            placeholder="499"
                                        />
                                    </div>
                                    <div className={styles.formGroupFull}>
                                        <label className={styles.formLabel}>Notlar</label>
                                        <textarea
                                            className={styles.formTextarea}
                                            value={formData.notes}
                                            onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))}
                                            placeholder="Ek notlar..."
                                        />
                                    </div>
                                    <button type="submit" className={styles.submitBtn}>
                                        ➕ Restoran Ekle
                                    </button>
                                </form>
                            </div>
                        )}

                        {/* Users management */}
                        {tab === 'users' && (
                            <div className={styles.formSection}>
                                <div className={styles.formTitle}>👥 Kullanıcı Yönetimi</div>
                                <p style={{ color: '#94a3b8', marginBottom: '24px', fontSize: '0.9rem' }}>
                                    Her restoran için garson, mutfak ve yönetici hesapları oluşturun.
                                </p>

                                {/* Filter by restaurant */}
                                <div style={{ marginBottom: '24px' }}>
                                    <label className={styles.formLabel}>Restoran Filtrele</label>
                                    <select
                                        className={styles.formSelect}
                                        value={selectedRestaurant}
                                        onChange={(e) => {
                                            setSelectedRestaurant(e.target.value);
                                            loadStaffUsers(e.target.value || undefined);
                                        }}
                                    >
                                        <option value="">Tüm Restoranlar</option>
                                        {restaurants.map(r => (
                                            <option key={r.id} value={r.id}>{r.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Add user form */}
                                <div style={{ background: 'rgba(124, 58, 237, 0.08)', border: '1px solid rgba(124, 58, 237, 0.2)', borderRadius: '16px', padding: '20px', marginBottom: '24px' }}>
                                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#a78bfa', marginBottom: '16px' }}>➕ Yeni Kullanıcı Ekle</div>

                                    {userMsg && <div className={styles.successMsg}>{userMsg}</div>}
                                    {userErr && <div className={styles.errorMsg}>{userErr}</div>}

                                    <form onSubmit={handleAddUser} className={styles.formGrid}>
                                        <div className={styles.formGroup}>
                                            <label className={styles.formLabel}>Restoran *</label>
                                            <select
                                                className={styles.formSelect}
                                                value={userForm.restaurant_id}
                                                onChange={e => setUserForm(p => ({ ...p, restaurant_id: e.target.value }))}
                                                required
                                            >
                                                <option value="">Restoran seçin</option>
                                                {restaurants.map(r => (
                                                    <option key={r.id} value={r.id}>{r.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label className={styles.formLabel}>Rol *</label>
                                            <select
                                                className={styles.formSelect}
                                                value={userForm.role}
                                                onChange={e => setUserForm(p => ({ ...p, role: e.target.value }))}
                                            >
                                                <option value="admin">👨‍💼 Yönetici</option>
                                                <option value="waiter">🧑‍🍳 Garson</option>
                                                <option value="kitchen">🍳 Mutfak</option>
                                            </select>
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label className={styles.formLabel}>Kullanıcı Adı *</label>
                                            <input
                                                className={styles.formInput}
                                                value={userForm.username}
                                                onChange={e => setUserForm(p => ({ ...p, username: e.target.value }))}
                                                placeholder="garson1"
                                                required
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label className={styles.formLabel}>Şifre *</label>
                                            <input
                                                className={styles.formInput}
                                                value={userForm.password}
                                                onChange={e => setUserForm(p => ({ ...p, password: e.target.value }))}
                                                placeholder="••••••"
                                                required
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label className={styles.formLabel}>Görünen Ad</label>
                                            <input
                                                className={styles.formInput}
                                                value={userForm.display_name}
                                                onChange={e => setUserForm(p => ({ ...p, display_name: e.target.value }))}
                                                placeholder="Ahmet Yılmaz"
                                            />
                                        </div>
                                        <div className={styles.formGroup} style={{ display: 'flex', alignItems: 'flex-end' }}>
                                            <button type="submit" className={styles.submitBtn} style={{ margin: 0, width: '100%' }}>
                                                ➕ Kullanıcı Ekle
                                            </button>
                                        </div>
                                    </form>
                                </div>

                                {/* Users list */}
                                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '12px' }}>
                                    📋 Mevcut Kullanıcılar ({staffUsers.length})
                                </div>
                                {staffUsers.length === 0 ? (
                                    <div className={styles.emptyState}>
                                        <div className={styles.emptyIcon}>👥</div>
                                        <div className={styles.emptyText}>Henüz kullanıcı oluşturulmamış</div>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {staffUsers.map(u => {
                                            const rest = restaurants.find(r => r.id === u.restaurant_id);
                                            return (
                                                <div key={u.id} style={{
                                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                    padding: '12px 16px', borderRadius: '12px',
                                                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                                                    opacity: u.is_active ? 1 : 0.5,
                                                }}>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '0.95rem' }}>
                                                            {u.display_name || u.username}
                                                            <span style={{ marginLeft: '8px', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '6px', background: u.role === 'admin' ? '#7c3aed22' : u.role === 'waiter' ? '#10b98122' : '#f59e0b22', color: u.role === 'admin' ? '#a78bfa' : u.role === 'waiter' ? '#34d399' : '#fbbf24' }}>
                                                                {ROLE_LABELS[u.role] || u.role}
                                                            </span>
                                                        </div>
                                                        <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>
                                                            @{u.username} • {rest?.name || u.restaurant_id}
                                                        </div>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <button
                                                            onClick={() => handleToggleUser(u.id, u.is_active)}
                                                            style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: u.is_active ? '#fbbf24' : '#34d399', cursor: 'pointer', fontSize: '0.8rem' }}
                                                        >
                                                            {u.is_active ? '⏸️ Pasif' : '▶️ Aktif'}
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteUser(u.id, u.username)}
                                                            style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.1)', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem' }}
                                                        >
                                                            🗑️ Sil
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Bulk Email */}
                        {tab === 'email' && (
                            <div className={styles.formSection}>
                                <div className={styles.formTitle}>📧 Toplu E-posta Gönder</div>
                                <p style={{ color: '#94a3b8', marginBottom: '24px', fontSize: '0.9rem' }}>
                                    Potansiyel müşterilere tanıtım e-postası gönderin. İçeriği düzenleyip önizleme yapabilirsiniz.
                                </p>

                                {/* Subject */}
                                <div style={{ marginBottom: '20px' }}>
                                    <label className={styles.formLabel}>E-posta Konusu</label>
                                    <input
                                        className={styles.formInput}
                                        value={emailSubject}
                                        onChange={e => setEmailSubject(e.target.value)}
                                    />
                                </div>

                                {/* Editor / Preview Toggle */}
                                <div style={{ marginBottom: '20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                                        <label className={styles.formLabel} style={{ margin: 0 }}>E-posta İçeriği</label>
                                        <div style={{ display: 'flex', gap: '6px' }}>
                                            <button
                                                type="button"
                                                onClick={() => setShowPreview(false)}
                                                style={{
                                                    padding: '6px 14px', borderRadius: '8px', fontSize: '0.8rem', cursor: 'pointer',
                                                    border: `1px solid ${!showPreview ? 'rgba(124,58,237,0.5)' : 'rgba(255,255,255,0.1)'}`,
                                                    background: !showPreview ? 'rgba(124,58,237,0.15)' : 'transparent',
                                                    color: !showPreview ? '#a78bfa' : '#94a3b8',
                                                }}
                                            >
                                                ✏️ Düzenle
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setShowPreview(true)}
                                                style={{
                                                    padding: '6px 14px', borderRadius: '8px', fontSize: '0.8rem', cursor: 'pointer',
                                                    border: `1px solid ${showPreview ? 'rgba(124,58,237,0.5)' : 'rgba(255,255,255,0.1)'}`,
                                                    background: showPreview ? 'rgba(124,58,237,0.15)' : 'transparent',
                                                    color: showPreview ? '#a78bfa' : '#94a3b8',
                                                }}
                                            >
                                                👁️ Önizleme
                                            </button>
                                            <button
                                                type="button"
                                                onClick={async () => {
                                                    try {
                                                        const { data } = await emailAPI.getTemplate();
                                                        setEmailHtml(data.html);
                                                    } catch { /* */ }
                                                }}
                                                style={{
                                                    padding: '6px 14px', borderRadius: '8px', fontSize: '0.8rem', cursor: 'pointer',
                                                    border: '1px solid rgba(245,158,11,0.3)',
                                                    background: 'rgba(245,158,11,0.08)',
                                                    color: '#fbbf24',
                                                }}
                                            >
                                                🔄 Varsayılana Dön
                                            </button>
                                        </div>
                                    </div>

                                    {!showPreview ? (
                                        <textarea
                                            value={emailHtml}
                                            onChange={e => setEmailHtml(e.target.value)}
                                            style={{
                                                width: '100%', minHeight: '400px', padding: '16px',
                                                background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: '12px', color: '#e2e8f0', fontSize: '0.85rem',
                                                fontFamily: '"Fira Code", "Cascadia Code", monospace',
                                                lineHeight: '1.6', resize: 'vertical', outline: 'none',
                                                boxSizing: 'border-box',
                                            }}
                                            placeholder="HTML e-posta içeriğini buraya yazın..."
                                        />
                                    ) : (
                                        <div style={{
                                            border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px',
                                            overflow: 'hidden', background: '#fff',
                                        }}>
                                            <iframe
                                                srcDoc={emailHtml}
                                                style={{
                                                    width: '100%', minHeight: '600px', border: 'none',
                                                    display: 'block',
                                                }}
                                                title="E-posta Önizleme"
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Recipients */}
                                <div style={{ marginBottom: '20px' }}>
                                    <label className={styles.formLabel}>Alıcıları Seçin</label>
                                    {(() => {
                                        const withEmail = restaurants.filter(r => r.contact_email);
                                        if (withEmail.length === 0) {
                                            return (
                                                <div className={styles.emptyState}>
                                                    <div className={styles.emptyIcon}>📧</div>
                                                    <div className={styles.emptyText}>
                                                        Hiçbir restoranın e-posta adresi yok.<br />
                                                        Önce "Restoran Ekle" sekmesinden e-posta bilgisi girin.
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return (
                                            <>
                                                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedEmails(withEmail.map(r => r.contact_email!))}
                                                        style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid rgba(124,58,237,0.3)', background: 'rgba(124,58,237,0.1)', color: '#a78bfa', cursor: 'pointer', fontSize: '0.8rem' }}
                                                    >
                                                        ☑️ Tümünü Seç
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedEmails([])}
                                                        style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontSize: '0.8rem' }}
                                                    >
                                                        Temizle
                                                    </button>
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '300px', overflowY: 'auto' }}>
                                                    {withEmail.map(r => (
                                                        <label key={r.id} style={{
                                                            display: 'flex', alignItems: 'center', gap: '12px',
                                                            padding: '10px 14px', borderRadius: '10px',
                                                            background: selectedEmails.includes(r.contact_email!) ? 'rgba(124,58,237,0.12)' : 'rgba(255,255,255,0.03)',
                                                            border: `1px solid ${selectedEmails.includes(r.contact_email!) ? 'rgba(124,58,237,0.3)' : 'rgba(255,255,255,0.06)'}`,
                                                            cursor: 'pointer', transition: 'all 0.2s',
                                                        }}>
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedEmails.includes(r.contact_email!)}
                                                                onChange={e => {
                                                                    if (e.target.checked) setSelectedEmails(p => [...p, r.contact_email!]);
                                                                    else setSelectedEmails(p => p.filter(em => em !== r.contact_email));
                                                                }}
                                                                style={{ accentColor: '#7c3aed', width: '16px', height: '16px' }}
                                                            />
                                                            <div style={{ flex: 1 }}>
                                                                <div style={{ color: '#f1f5f9', fontWeight: 600, fontSize: '0.9rem' }}>{r.name}</div>
                                                                <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{r.contact_email}</div>
                                                            </div>
                                                            <span style={{
                                                                fontSize: '0.7rem', padding: '2px 8px', borderRadius: '6px',
                                                                background: r.contract_status === 'lead' ? '#f59e0b22' : '#10b98122',
                                                                color: r.contract_status === 'lead' ? '#fbbf24' : '#34d399',
                                                            }}>
                                                                {r.contract_status === 'lead' ? 'Potansiyel' : r.contract_status}
                                                            </span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </>
                                        );
                                    })()}
                                </div>

                                {/* Send button */}
                                {selectedEmails.length > 0 && (
                                    <button
                                        className={styles.submitBtn}
                                        disabled={emailSending}
                                        onClick={async () => {
                                            setEmailSending(true);
                                            setEmailResult(null);
                                            try {
                                                const { data } = await emailAPI.sendBulk(
                                                    selectedEmails,
                                                    emailSubject,
                                                    emailHtml || undefined
                                                );
                                                const sent = data.results?.filter((r: any) => r.success).length || 0;
                                                const failed = data.results?.filter((r: any) => !r.success).length || 0;
                                                setEmailResult({ sent, failed });
                                                if (sent > 0) setSelectedEmails([]);
                                            } catch {
                                                setEmailResult({ sent: 0, failed: selectedEmails.length });
                                            }
                                            setEmailSending(false);
                                        }}
                                    >
                                        {emailSending
                                            ? `⏳ Gönderiliyor... (${selectedEmails.length} alıcı)`
                                            : `📨 ${selectedEmails.length} Kişiye E-posta Gönder`
                                        }
                                    </button>
                                )}

                                {/* Results */}
                                {emailResult && (
                                    <div style={{
                                        marginTop: '16px', padding: '16px', borderRadius: '12px',
                                        background: emailResult.failed === 0 ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                                        border: `1px solid ${emailResult.failed === 0 ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}`,
                                    }}>
                                        <div style={{ color: '#f1f5f9', fontWeight: 700, marginBottom: '4px' }}>
                                            {emailResult.failed === 0 ? '✅ Tüm E-postalar Gönderildi!' : '⚠️ Kısmi Gönderim'}
                                        </div>
                                        <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                                            {emailResult.sent} başarılı{emailResult.failed > 0 ? `, ${emailResult.failed} başarısız` : ''}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

// Restaurant Card Component
function RestaurantCard({
    restaurant: r,
    onStatusChange,
    showProgress = false,
}: {
    restaurant: Restaurant;
    onStatusChange: (id: string, status: string) => void;
    showProgress?: boolean;
}) {
    const { current, percent } = getContractProgress(r.contract_start_date, r.contract_months);

    return (
        <div className={styles.restaurantCard}>
            <div className={styles.cardHeader}>
                <div>
                    <div className={styles.restaurantName}>🏪 {r.name}</div>
                    <div className={styles.restaurantSlug}>/{r.slug}</div>
                </div>
                <span className={`${styles.statusBadge} ${STATUS_CLASS[r.contract_status] || styles.statusLead}`}>
                    {STATUS_LABELS[r.contract_status] || r.contract_status}
                </span>
            </div>

            <div className={styles.cardDetails}>
                <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Anlaşma</span>
                    <span className={styles.detailValue}>
                        {r.contract_months > 0 ? `${r.contract_months} ay` : '—'}
                    </span>
                </div>
                <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Aylık Ücret</span>
                    <span className={styles.detailValue}>
                        {parseFloat(r.monthly_fee) > 0 ? `₺${parseFloat(r.monthly_fee).toLocaleString('tr-TR')}` : '—'}
                    </span>
                </div>
                <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>İletişim</span>
                    <span className={styles.detailValue}>{r.contact_person || '—'}</span>
                </div>
                <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Telefon</span>
                    <span className={styles.detailValue}>{r.contact_phone || r.phone || '—'}</span>
                </div>
            </div>

            {r.notes && (
                <div className={styles.cardNotes}>📝 {r.notes}</div>
            )}

            {showProgress && r.contract_months > 0 && r.contract_start_date && (
                <div className={styles.progressBarWrapper}>
                    <div className={styles.progressLabel}>
                        <span>{current}. ay / {r.contract_months} ay</span>
                        <span>{Math.round(percent)}%</span>
                    </div>
                    <div className={styles.progressBar}>
                        <div className={styles.progressFill} style={{ width: `${percent}%` }} />
                    </div>
                </div>
            )}

            <div className={styles.cardActions}>
                {r.contract_status === 'lead' && (
                    <>
                        <button className={styles.editBtn} onClick={() => onStatusChange(r.id, 'trial')}>
                            ⏳ Denemeye Al
                        </button>
                        <button className={styles.editBtn} onClick={() => onStatusChange(r.id, 'active')}>
                            ✅ Aktif Yap
                        </button>
                    </>
                )}
                {r.contract_status === 'trial' && (
                    <button className={styles.editBtn} onClick={() => onStatusChange(r.id, 'active')}>
                        ✅ Aktif Yap
                    </button>
                )}
                {r.contract_status === 'active' && (
                    <button className={styles.editBtn} onClick={() => onStatusChange(r.id, 'expired')}>
                        ⏸️ Duraklat
                    </button>
                )}
                {(r.contract_status === 'expired' || r.contract_status === 'cancelled') && (
                    <button className={styles.editBtn} onClick={() => onStatusChange(r.id, 'active')}>
                        🔄 Yeniden Aktif Et
                    </button>
                )}
            </div>
        </div>
    );
}
