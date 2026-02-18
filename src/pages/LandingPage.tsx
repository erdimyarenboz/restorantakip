import { Link } from 'react-router-dom';
import styles from '../styles/LandingPage.module.css';

const FEATURES = [
    {
        icon: '📱',
        title: 'QR Menü & Sipariş',
        desc: 'Müşterileriniz QR kod okutarak dijital menünüzü görüntüler ve anında sipariş verir. Kağıt menüye veda edin.',
    },
    {
        icon: '👨‍🍳',
        title: 'Mutfak Ekranı',
        desc: 'Gelen siparişler anlık olarak mutfak ekranına düşer. Hazırlık süreci takip edilir, garsonlar bilgilendirilir.',
    },
    {
        icon: '🍴',
        title: 'Garson Takip',
        desc: 'Garsonlar masaları ve siparişleri mobil üzerinden yönetir. Hangi masada ne olduğunu tek ekrandan görün.',
    },
    {
        icon: '📊',
        title: 'Anlık Raporlama',
        desc: 'Günlük, haftalık, aylık gelir raporları. Hangi ürünler çok satıyor, doluluk oranları anlık takip.',
    },
    {
        icon: '🔗',
        title: 'Pazar Yeri Entegrasyonu',
        desc: 'Trendyol Go, Getir, Migros Yemek ve Yemek Sepeti siparişlerini tek panelden yönetin.',
    },
    {
        icon: '🌍',
        title: 'Çok Dilli Destek',
        desc: 'Türkçe, İngilizce, Arapça ve Farsça menü desteği. Turistlere kendi dillerinde hizmet verin.',
    },
];

const INTEGRATIONS = [
    { emoji: '🟠', name: 'Trendyol Go', color: '#F27A1A' },
    { emoji: '🟣', name: 'Getir', color: '#5D3EBC' },
    { emoji: '🟠', name: 'Migros Yemek', color: '#F58220' },
    { emoji: '🔴', name: 'Yemek Sepeti', color: '#FA0050' },
];

const PRICING = [
    {
        name: 'Başlangıç',
        price: '₺499',
        period: '/ay',
        features: [
            'QR Menü & Sipariş',
            'Mutfak Ekranı',
            'Garson Paneli',
            '1 Restoran',
            '10 Masa',
            'E-posta Destek',
        ],
        disabledFeatures: ['Pazar Yeri Entegrasyonu', 'Çok Dilli Menü', 'API Erişimi'],
        popular: false,
    },
    {
        name: 'Profesyonel',
        price: '₺999',
        period: '/ay',
        features: [
            'QR Menü & Sipariş',
            'Mutfak Ekranı',
            'Garson Paneli',
            '1 Restoran',
            'Sınırsız Masa',
            'Pazar Yeri Entegrasyonu',
            'Çok Dilli Menü',
            'Öncelikli Destek',
        ],
        disabledFeatures: ['API Erişimi'],
        popular: true,
    },
    {
        name: 'Kurumsal',
        price: '₺1.999',
        period: '/ay',
        features: [
            'Tüm Profesyonel Özellikler',
            'Sınırsız Restoran (Zincir)',
            'Sınırsız Masa',
            'Pazar Yeri Entegrasyonu',
            'Çok Dilli Menü',
            'API Erişimi',
            'Özel Destek Yöneticisi',
            'Özel Entegrasyon Geliştirme',
        ],
        disabledFeatures: [],
        popular: false,
    },
];

export default function LandingPage() {
    const scrollTo = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className={styles.landingPage}>
            {/* ─── Navbar ─── */}
            <nav className={styles.navbar}>
                <div className={styles.navContainer}>
                    <div className={styles.navBrand}>
                        <span className={styles.navBrandIcon}>🍽️</span>
                        <span className={styles.navBrandGradient}>SipTakip</span>
                    </div>

                    <div className={styles.navLinks}>
                        <button className={styles.navLink} onClick={() => scrollTo('features')}>Özellikler</button>
                        <button className={styles.navLink} onClick={() => scrollTo('integrations')}>Entegrasyonlar</button>
                        <button className={styles.navLink} onClick={() => scrollTo('pricing')}>Fiyatlandırma</button>
                    </div>

                    <div className={styles.navCta}>
                        <Link to="/login" className={styles.btnOutline}>Giriş Yap</Link>
                        <Link to="/login" className={styles.btnGradient}>Ücretsiz Dene</Link>
                    </div>
                </div>
            </nav>

            {/* ─── Hero ─── */}
            <section className={styles.hero}>
                <div className={styles.heroContent}>
                    <div className={styles.heroBadge}>
                        🚀 14 Gün Ücretsiz Deneme — Kredi Kartı Gerekmez
                    </div>
                    <h1 className={styles.heroTitle}>
                        Yeni Nesil{' '}
                        <span className={styles.heroGradient}>Restoran Yönetimi</span>
                    </h1>
                    <p className={styles.heroSubtitle}>
                        QR menü, dijital sipariş, mutfak ekranı, garson takibi ve pazar yeri entegrasyonları
                        ile restoranınızı dijital çağa taşıyın.
                    </p>
                    <div className={styles.heroActions}>
                        <Link to="/login" className={styles.btnHeroPrimary}>
                            Ücretsiz Başla →
                        </Link>
                        <button className={styles.btnHeroSecondary} onClick={() => scrollTo('features')}>
                            Keşfet
                        </button>
                    </div>

                    <div className={styles.heroStats}>
                        <div className={styles.heroStat}>
                            <div className={styles.heroStatValue}>100+</div>
                            <div className={styles.heroStatLabel}>Aktif Restoran</div>
                        </div>
                        <div className={styles.heroStat}>
                            <div className={styles.heroStatValue}>50K+</div>
                            <div className={styles.heroStatLabel}>İşlenen Sipariş</div>
                        </div>
                        <div className={styles.heroStat}>
                            <div className={styles.heroStatValue}>81</div>
                            <div className={styles.heroStatLabel}>İl</div>
                        </div>
                        <div className={styles.heroStat}>
                            <div className={styles.heroStatValue}>%99.9</div>
                            <div className={styles.heroStatLabel}>Uptime</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Features ─── */}
            <section id="features" className={styles.section}>
                <div className={styles.sectionTag}>✨ Özellikler</div>
                <h2 className={styles.sectionTitle}>
                    Restoranınız İçin Her Şey <span className={styles.heroGradient}>Tek Panelde</span>
                </h2>
                <p className={styles.sectionSubtitle}>
                    Sipariş almaktan mutfak yönetimine, raporlamadan pazar yeri entegrasyonlarına kadar
                    tüm ihtiyaçlarınız tek bir platformda.
                </p>
                <div className={styles.featuresGrid}>
                    {FEATURES.map((f, i) => (
                        <div key={i} className={styles.featureCard}>
                            <div className={styles.featureIcon}>{f.icon}</div>
                            <h3 className={styles.featureTitle}>{f.title}</h3>
                            <p className={styles.featureDesc}>{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ─── Integrations ─── */}
            <section id="integrations" className={styles.integrationsSection}>
                <div className={styles.sectionTag}>🔗 Entegrasyonlar</div>
                <h2 className={styles.sectionTitle}>Pazar Yerleri İle Bağlantınız</h2>
                <p className={styles.sectionSubtitle} style={{ margin: '0 auto 0' }}>
                    Popüler teslimat platformlarından gelen siparişleri otomatik olarak sisteminize aktarın.
                </p>
                <div className={styles.intLogos}>
                    {INTEGRATIONS.map((int, i) => (
                        <div key={i} className={styles.intLogo}>
                            <span className={styles.intLogoEmoji}>{int.emoji}</span>
                            <span className={styles.intLogoName} style={{ color: int.color }}>{int.name}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* ─── Pricing ─── */}
            <section id="pricing" className={`${styles.section} ${styles.pricingSection}`}>
                <div style={{ textAlign: 'center' }}>
                    <div className={styles.sectionTag}>💰 Fiyatlandırma</div>
                    <h2 className={styles.sectionTitle} style={{ textAlign: 'center' }}>
                        Her Bütçeye Uygun <span className={styles.heroGradient}>Planlar</span>
                    </h2>
                    <p className={styles.sectionSubtitle} style={{ margin: '0 auto 48px', textAlign: 'center' }}>
                        14 gün ücretsiz deneyin, kredi kartı gerekmez.
                    </p>
                </div>
                <div className={styles.pricingGrid}>
                    {PRICING.map((plan, i) => (
                        <div
                            key={i}
                            className={`${styles.pricingCard} ${plan.popular ? styles.pricingCardPopular : ''}`}
                        >
                            {plan.popular && <div className={styles.pricingBadge}>En Popüler</div>}
                            <h3 className={styles.pricingName}>{plan.name}</h3>
                            <div className={styles.pricingPrice}>{plan.price}</div>
                            <div className={styles.pricingPeriod}>{plan.period}</div>
                            <ul className={styles.pricingFeatures}>
                                {plan.features.map((f, j) => (
                                    <li key={j}>{f}</li>
                                ))}
                                {plan.disabledFeatures.map((f, j) => (
                                    <li key={`d-${j}`} className={styles.pricingFeatureDisabled}>{f}</li>
                                ))}
                            </ul>
                            <button className={`${styles.pricingBtn} ${plan.popular ? styles.pricingBtnPrimary : ''}`}>
                                Ücretsiz Başla
                            </button>
                        </div>
                    ))}
                </div>
                <p className={styles.pricingTrial}>🎁 Tüm planlar 14 gün ücretsiz deneme ile başlar</p>
            </section>

            {/* ─── Footer ─── */}
            <footer className={styles.footer}>
                <div className={styles.footerContent}>
                    <div>
                        <div className={styles.footerBrand}>
                            <span>🍽️</span>
                            <span className={styles.navBrandGradient}>SipTakip</span>
                        </div>
                        <p className={styles.footerDesc}>
                            Yeni nesil restoran yönetim platformu. QR menüden mutfak ekranına,
                            garson takibinden pazar yeri entegrasyonlarına kadar her şey tek panelde.
                        </p>
                    </div>
                    <div>
                        <h4 className={styles.footerTitle}>Ürün</h4>
                        <div className={styles.footerLinks}>
                            <button className={styles.footerLink} onClick={() => scrollTo('features')}>Özellikler</button>
                            <button className={styles.footerLink} onClick={() => scrollTo('pricing')}>Fiyatlandırma</button>
                            <button className={styles.footerLink} onClick={() => scrollTo('integrations')}>Entegrasyonlar</button>
                        </div>
                    </div>
                    <div>
                        <h4 className={styles.footerTitle}>Destek</h4>
                        <div className={styles.footerLinks}>
                            <a href="mailto:destek@siptakip.com" className={styles.footerLink}>E-posta Destek</a>
                            <a href="tel:+905001234567" className={styles.footerLink}>Telefon</a>
                        </div>
                    </div>
                    <div>
                        <h4 className={styles.footerTitle}>Yasal</h4>
                        <div className={styles.footerLinks}>
                            <a href="#" className={styles.footerLink}>Gizlilik Politikası</a>
                            <a href="#" className={styles.footerLink}>Kullanım Şartları</a>
                            <a href="#" className={styles.footerLink}>KVKK</a>
                        </div>
                    </div>
                </div>
                <div className={styles.footerBottom}>
                    <p className={styles.footerCopy}>© 2026 SipTakip. Tüm hakları saklıdır.</p>
                </div>
            </footer>
        </div>
    );
}
