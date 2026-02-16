import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { crmAPI } from '../services/api';
import styles from '../styles/PlatformDashboard.module.css';

type CrmTab = 'dashboard' | 'active' | 'leads' | 'add';

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

    // Form state
    const [formData, setFormData] = useState({
        name: '', slug: '', phone: '', address: '',
        contact_person: '', contact_phone: '',
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
                contact_person: '', contact_phone: '',
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
