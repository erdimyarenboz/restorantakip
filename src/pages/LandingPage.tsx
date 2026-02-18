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
        price: '₺750',
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
        price: '₺1.300',
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
        price: '₺2.000',
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
                <p className={styles.pricingTrial} style={{ marginTop: '8px', fontSize: '0.85rem', opacity: 0.8 }}>
                    🎁 İlk kurulum ücreti bir kereye mahsus 30.000₺ — QR menü hediyedir.
                </p>
            </section>

            {/* ─── FAQ ─── */}
            <section id="faq" className={styles.section}>
                <div style={{ textAlign: 'center' }}>
                    <div className={styles.sectionTag}>❓ Sıkça Sorulan Sorular</div>
                    <h2 className={styles.sectionTitle} style={{ textAlign: 'center' }}>
                        Kurulum Ücreti <span className={styles.heroGradient}>Neleri Kapsar?</span>
                    </h2>
                    <p className={styles.sectionSubtitle} style={{ margin: '0 auto 48px', textAlign: 'center' }}>
                        30.000₺'lik kurulum ücreti tek seferlik bir iş değil; restoranınızın canlı operasyonunu açan
                        kapsamlı bir <strong style={{ color: '#a78bfa' }}>devreye alma projesidir</strong>.
                    </p>
                </div>

                <div className={styles.faqGrid}>
                    {[
                        {
                            icon: '🔍',
                            title: 'İhtiyaç Analizi & Akış Tasarımı',
                            desc: 'Sipariş akışı, mutfak, kasa, kurye, iptal/iade ve vardiya süreçleriniz analiz edilir ve operasyonunuza özel akışlar netleştirilir.',
                        },
                        {
                            icon: '🔗',
                            title: 'Pazar Yeri Entegrasyonları',
                            desc: 'Trendyol Go, Getir, Migros Yemek, Yemek Sepeti gibi platformların kurulum ve eşleştirme işlemleri yapılır.',
                        },
                        {
                            icon: '📦',
                            title: 'Ürün Eşleştirme (SKU / Varyasyon)',
                            desc: 'Tüm ürünleriniz platform bazında SKU ve varyasyon eşleştirmesi yapılarak senkronize edilir.',
                        },
                        {
                            icon: '📂',
                            title: 'Kategori & Menü Mapping',
                            desc: 'Menünüz tüm kanallarda tutarlı görünmesi için kategori eşleştirmesi ve menü düzenlemesi yapılır.',
                        },
                        {
                            icon: '💰',
                            title: 'Fiyat, Stok & Seçenek Senkronizasyonu',
                            desc: 'Fiyat güncellemeleri, stok takibi ve ekstra seçenekler (sos, boy, garnitür) tüm kanallarda otomatik senkronize edilir.',
                        },
                        {
                            icon: '👥',
                            title: 'Şube, Roller & Yetkilendirme',
                            desc: 'Şube yapınız, kullanıcı rolleri (yönetici, garson, mutfak, kurye) ve erişim yetkileri tanımlanır.',
                        },
                        {
                            icon: '🖨️',
                            title: 'Yazıcı, Mutfak Ekranı & Bildirimler',
                            desc: 'Fiş/adisyon yazıcıları, mutfak ekranları kurulur. Sipariş bildirimleri ve sesli uyarılar yapılandırılır.',
                        },
                        {
                            icon: '💳',
                            title: 'POS, Ödeme & Cihaz Kurulumu',
                            desc: 'POS entegrasyonu, ödeme altyapısı, kurye atama sistemi ve gerekli cihazların kurulumu yapılır.',
                        },
                        {
                            icon: '🧪',
                            title: 'Test & Pilot Gün',
                            desc: 'Tüm senaryolar test edilir. 1 gün gözetimli pilot açılış yapılarak sistemin sorunsuz çalıştığı doğrulanır.',
                        },
                        {
                            icon: '🎓',
                            title: 'Eğitim & Dokümantasyon',
                            desc: 'Ekibinize uygulamalı eğitim verilir. Eğitim dökümanları ve kısa eğitim videoları hazırlanarak teslim edilir.',
                        },
                        {
                            icon: '🛡️',
                            title: 'Go-Live Sonrası Stabilizasyon Desteği',
                            desc: 'Canlıya geçişten sonra 7–14 gün boyunca stabilizasyon desteği sağlanır. Hızlı müdahale ile sorunsuz operasyon garanti edilir.',
                        },
                        {
                            icon: '🎁',
                            title: 'QR Menü Hediye',
                            desc: 'Kurulum kapsamında restoranınız için tasarlanmış QR menü materyalleri ücretsiz olarak hazırlanır ve teslim edilir.',
                        },
                        {
                            icon: '🤖',
                            title: 'Rezervasyon Chat Botu Hediye',
                            desc: 'Restoranınız için yapay zeka destekli rezervasyon chat botu ücretsiz kurulur. Müşterileriniz 7/24 otomatik masa rezervasyonu yapabilir.',
                        },
                    ].map((item, i) => (
                        <div key={i} className={styles.faqItem}>
                            <div className={styles.faqIcon}>{item.icon}</div>
                            <div>
                                <div className={styles.faqItemTitle}>{item.title}</div>
                                <div className={styles.faqItemDesc}>{item.desc}</div>
                            </div>
                        </div>
                    ))}
                </div>
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
                            <button className={styles.footerLink} onClick={() => scrollTo('integrations')}>Entegrasyonlar</button>
                            <button className={styles.footerLink} onClick={() => scrollTo('pricing')}>Fiyatlandırma</button>
                            <button className={styles.footerLink} onClick={() => scrollTo('faq')}>SSS</button>
                        </div>
                    </div>
                    <div>
                        <h4 className={styles.footerTitle}>Destek</h4>
                        <div className={styles.footerLinks}>
                            <a href="mailto:destek@siptakip.com" className={styles.footerLink}>E-posta Destek</a>
                            <a href="tel:+905077605747" className={styles.footerLink}>Telefon</a>
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
                    <p className={styles.footerAgency}>Bir <strong>Newant Agency</strong> yazılımıdır.</p>
                </div>
            </footer>

            {/* ─── WhatsApp FAB ─── */}
            <a
                href="https://wa.me/905077605747"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.whatsappFab}
                title="WhatsApp ile iletişime geçin"
            >
                <svg viewBox="0 0 32 32" width="28" height="28" fill="white">
                    <path d="M16.004 0h-.008C7.174 0 0 7.176 0 16.004c0 3.502 1.13 6.746 3.05 9.382L1.054 31.2l6.02-1.932A15.91 15.91 0 0016.004 32C24.826 32 32 24.826 32 16.004 32 7.176 24.826 0 16.004 0zm9.314 22.594c-.39 1.1-1.932 2.014-3.148 2.28-.832.178-1.918.32-5.574-1.198-4.678-1.94-7.69-6.692-7.924-7.002-.226-.31-1.846-2.46-1.846-4.692 0-2.232 1.168-3.33 1.584-3.784.39-.424.862-.532 1.15-.532.286 0 .572.002.822.016.264.012.618-.1 .968.738.36.862 1.224 2.984 1.332 3.2.108.218.18.47.036.758-.144.294-.216.47-.43.726-.216.256-.452.572-.646.768-.216.216-.44.45-.19.884.252.434 1.12 1.848 2.404 2.994 1.652 1.476 3.044 1.934 3.476 2.15.432.216.684.18.936-.108.252-.288 1.08-1.26 1.368-1.692.288-.432.576-.36.972-.216.396.144 2.516 1.188 2.948 1.404.432.216.72.324.828.504.108.18.108 1.044-.282 2.144z" />
                </svg>
            </a>
        </div>
    );
}
