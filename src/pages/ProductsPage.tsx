import { useState, useMemo } from 'react';
import { useMenu } from '../store/MenuContext';
import ProductCard from '../components/ProductCard';
import EmptyState from '../components/EmptyState';
import styles from '../styles/ProductsPage.module.css';

// SVG placeholder image generator for products without images
const createMenuImage = (emoji: string, color: string): string => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
    <rect width="300" height="300" fill="${color}"/>
    <text x="50%" y="50%" font-size="80" text-anchor="middle" dominant-baseline="middle">${emoji}</text>
  </svg>`;
    return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
};

// ─── Category card configuration ───────────────────────────────────────
interface CategoryCard {
    id: string;
    name: string;
    emoji: string;
    gradient: string;
    image?: string;
    subcategories?: CategoryCard[];
}

// Default categories with visuals — used when no API categories available
const DEFAULT_CATEGORIES: CategoryCard[] = [
    {
        id: 'burgerler',
        name: 'Burgerler',
        emoji: '🍔',
        gradient: 'linear-gradient(135deg, #D97706 0%, #92400E 100%)',
        image: '/images/cat-burgers.png',
    },
    {
        id: 'pizzalar',
        name: 'Pizzalar',
        emoji: '🍕',
        gradient: 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)',
        image: '/images/cat-pizzas.png',
    },
    {
        id: 'ana-yemekler',
        name: 'Ana Yemekler',
        emoji: '🍖',
        gradient: 'linear-gradient(135deg, #B91C1C 0%, #7F1D1D 100%)',
    },
    {
        id: 'corbalar',
        name: 'Çorbalar',
        emoji: '🍲',
        gradient: 'linear-gradient(135deg, #EA580C 0%, #9A3412 100%)',
    },
    {
        id: 'icecekler',
        name: 'İçecekler',
        emoji: '🥤',
        gradient: 'linear-gradient(135deg, #0EA5E9 0%, #0369A1 100%)',
    },
    {
        id: 'alkoller',
        name: 'Alkoller',
        emoji: '🍷',
        gradient: 'linear-gradient(135deg, #7C3AED 0%, #4C1D95 100%)',
    },
    {
        id: 'kahveler',
        name: 'Kahveler',
        emoji: '☕',
        gradient: 'linear-gradient(135deg, #78350F 0%, #451A03 100%)',
        subcategories: [
            {
                id: 'sicak-kahveler',
                name: 'Sıcak Kahveler',
                emoji: '☕',
                gradient: 'linear-gradient(135deg, #92400E 0%, #78350F 100%)',
            },
            {
                id: 'soguk-kahveler',
                name: 'Soğuk Kahveler',
                emoji: '🧊',
                gradient: 'linear-gradient(135deg, #0284C7 0%, #0C4A6E 100%)',
            },
        ],
    },
    {
        id: 'mesubatlar',
        name: 'Meşrubatlar',
        emoji: '🥤',
        gradient: 'linear-gradient(135deg, #059669 0%, #065F46 100%)',
        image: '/images/cat-soft-drinks.png',
    },
];

// Map API category names to our visual config
const CATEGORY_VISUALS: Record<string, { emoji: string; gradient: string; image?: string }> = {
    'Burgerler': { emoji: '🍔', gradient: 'linear-gradient(135deg, #D97706 0%, #92400E 100%)', image: '/images/cat-burgers.png' },
    'Pizzalar': { emoji: '🍕', gradient: 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)', image: '/images/cat-pizzas.png' },
    'Ana Yemekler': { emoji: '🍖', gradient: 'linear-gradient(135deg, #B91C1C 0%, #7F1D1D 100%)' },
    'Ana Yemek': { emoji: '🍖', gradient: 'linear-gradient(135deg, #B91C1C 0%, #7F1D1D 100%)' },
    'Çorbalar': { emoji: '🍲', gradient: 'linear-gradient(135deg, #EA580C 0%, #9A3412 100%)' },
    'İçecekler': { emoji: '🥤', gradient: 'linear-gradient(135deg, #0EA5E9 0%, #0369A1 100%)' },
    'Alkoller': { emoji: '🍷', gradient: 'linear-gradient(135deg, #7C3AED 0%, #4C1D95 100%)' },
    'Kahveler': { emoji: '☕', gradient: 'linear-gradient(135deg, #78350F 0%, #451A03 100%)' },
    'Sıcak Kahveler': { emoji: '☕', gradient: 'linear-gradient(135deg, #92400E 0%, #78350F 100%)' },
    'Soğuk Kahveler': { emoji: '🧊', gradient: 'linear-gradient(135deg, #0284C7 0%, #0C4A6E 100%)' },
    'Meşrubatlar': { emoji: '🥤', gradient: 'linear-gradient(135deg, #059669 0%, #065F46 100%)', image: '/images/cat-soft-drinks.png' },
    'Kahvaltı': { emoji: '🍳', gradient: 'linear-gradient(135deg, #F59E0B 0%, #B45309 100%)' },
    'Tatlılar': { emoji: '🍰', gradient: 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)' },
    'Salatalar': { emoji: '🥗', gradient: 'linear-gradient(135deg, #10B981 0%, #047857 100%)' },
    'Aperatifler': { emoji: '🥟', gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' },
};

const DEFAULT_VISUAL = { emoji: '🍽️', gradient: 'linear-gradient(135deg, #6B7280 0%, #374151 100%)' };

// Category emoji/color mappings for placeholder product images
const categoryStyles: Record<string, { emoji: string; colors: string[] }> = {
    'İçecekler': { emoji: '☕', colors: ['#D97706', '#92400E', '#78350F', '#DC2626', '#E0F2FE', '#3B82F6'] },
    'Kahvaltı': { emoji: '🍳', colors: ['#F59E0B', '#FBBF24'] },
    'Ana Yemek': { emoji: '🍖', colors: ['#B91C1C', '#F59E0B', '#DC2626', '#EF4444'] },
    'Ana Yemekler': { emoji: '🍖', colors: ['#B91C1C', '#F59E0B', '#DC2626', '#EF4444'] },
    'Tatlılar': { emoji: '🍰', colors: ['#F59E0B', '#FBBF24', '#FEF3C7', '#92400E'] },
    'Aperatifler': { emoji: '🥗', colors: ['#FDE68A', '#DBEAFE', '#FDE047', '#FBBF24'] },
    'Salatalar': { emoji: '🥗', colors: ['#10B981', '#22C55E', '#16A34A'] },
    'Burgerler': { emoji: '🍔', colors: ['#D97706', '#92400E', '#B45309'] },
    'Pizzalar': { emoji: '🍕', colors: ['#DC2626', '#EF4444', '#B91C1C'] },
    'Çorbalar': { emoji: '🍲', colors: ['#EA580C', '#F97316', '#C2410C'] },
    'Alkoller': { emoji: '🍷', colors: ['#7C3AED', '#8B5CF6', '#6D28D9'] },
    'Kahveler': { emoji: '☕', colors: ['#78350F', '#92400E', '#451A03'] },
    'Sıcak Kahveler': { emoji: '☕', colors: ['#92400E', '#78350F'] },
    'Soğuk Kahveler': { emoji: '🧊', colors: ['#0284C7', '#0369A1'] },
    'Meşrubatlar': { emoji: '🥤', colors: ['#059669', '#10B981', '#047857'] },
};

// ─── Navigation breadcrumb type ────────────────────────────────────────
interface BreadcrumbItem {
    label: string;
    categoryId: string | null; // null = home
}

export default function ProductsPage() {
    const { categories, menuItems, loading, error } = useMenu();
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
    const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([
        { label: 'Menü', categoryId: null },
    ]);

    // Subcategory mappings — child category names to their parent
    const SUBCATEGORY_MAP: Record<string, string> = {
        'Sıcak Kahveler': 'Kahveler',
        'Soğuk Kahveler': 'Kahveler',
    };

    // Build category cards from API data or fallback
    const categoryCards = useMemo((): CategoryCard[] => {
        if (categories.length === 0) return DEFAULT_CATEGORIES;

        // Identify parent → children relationships
        const childNames = new Set(Object.keys(SUBCATEGORY_MAP));
        const parentChildMap = new Map<string, CategoryCard[]>();

        // First pass: build all cards
        const allCards: CategoryCard[] = categories.map((cat) => {
            const visual = CATEGORY_VISUALS[cat.name] || DEFAULT_VISUAL;
            return {
                id: cat.id,
                name: cat.name,
                emoji: visual.emoji,
                gradient: visual.gradient,
                image: (visual as any).image,
            };
        });

        // Second pass: group children under parents
        for (const card of allCards) {
            const parentName = SUBCATEGORY_MAP[card.name];
            if (parentName) {
                if (!parentChildMap.has(parentName)) parentChildMap.set(parentName, []);
                parentChildMap.get(parentName)!.push(card);
            }
        }

        // Third pass: build final list — exclude children from top level, attach to parents
        return allCards
            .filter(card => !childNames.has(card.name))
            .map(card => ({
                ...card,
                subcategories: parentChildMap.get(card.name) || undefined,
            }));
    }, [categories]);

    // Find if a selected category has subcategories
    const currentSubcategories = useMemo((): CategoryCard[] | null => {
        if (!selectedCategoryId) return null;

        // Check current categoryCards (works for both API and default)
        const selectedCard = categoryCards.find(c => c.id === selectedCategoryId);
        if (selectedCard?.subcategories && selectedCard.subcategories.length > 0) {
            return selectedCard.subcategories;
        }

        // Check DEFAULT_CATEGORIES for subcategories (fallback)
        for (const cat of DEFAULT_CATEGORIES) {
            if (cat.id === selectedCategoryId && cat.subcategories) {
                return cat.subcategories;
            }
        }

        return null;
    }, [selectedCategoryId, categoryCards]);

    // Products for the selected category
    const categoryProducts = useMemo(() => {
        if (!selectedCategoryId) return [];

        const matchingItems = menuItems.filter((item) => {
            // Direct match
            if (item.categoryId === selectedCategoryId) return true;
            // Match by category name for default categories
            const cat = categories.find(c => c.id === item.categoryId);
            const selectedCard = categoryCards.find(c => c.id === selectedCategoryId);
            if (cat && selectedCard && cat.name === selectedCard.name) return true;
            return false;
        });

        return matchingItems.map((item, index) => {
            const category = categories.find(c => c.id === item.categoryId);
            const categoryName = category?.name || 'Diğer';
            const style = categoryStyles[categoryName] || { emoji: '🍽️', colors: ['#6B7280'] };
            const colorIndex = index % style.colors.length;

            return {
                id: item.id,
                name: item.name,
                description: item.description,
                price: item.price,
                category: categoryName,
                image: item.image || createMenuImage(style.emoji, style.colors[colorIndex]),
            };
        });
    }, [selectedCategoryId, menuItems, categories, categoryCards]);

    // Handle category click
    const handleCategoryClick = (card: CategoryCard) => {
        if (card.subcategories && card.subcategories.length > 0) {
            // Show subcategories
            setSelectedCategoryId(card.id);
            setBreadcrumbs(prev => [...prev, { label: card.name, categoryId: card.id }]);
        } else {
            // Show products directly
            setSelectedCategoryId(card.id);
            setBreadcrumbs(prev => [...prev, { label: card.name, categoryId: card.id }]);
        }
    };

    // Handle breadcrumb click
    const handleBreadcrumbClick = (index: number) => {
        const item = breadcrumbs[index];
        setSelectedCategoryId(item.categoryId);
        setBreadcrumbs(breadcrumbs.slice(0, index + 1));
    };

    // Go back
    const handleGoBack = () => {
        if (breadcrumbs.length > 1) {
            const newBreadcrumbs = breadcrumbs.slice(0, -1);
            setBreadcrumbs(newBreadcrumbs);
            setSelectedCategoryId(newBreadcrumbs[newBreadcrumbs.length - 1].categoryId);
        }
    };

    if (loading) {
        return (
            <div className={styles.page}>
                <div className={styles.loadingContainer}>
                    <div className={styles.loadingSpinner}></div>
                    <p>Menü yükleniyor...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.page}>
                <EmptyState
                    icon="❌"
                    title="Menü Yüklenemedi"
                    message={error}
                    actionLabel="Tekrar Dene"
                    onAction={() => window.location.reload()}
                />
            </div>
        );
    }

    // Determine what to show
    const showCategories = !selectedCategoryId;
    const showSubcategories = selectedCategoryId && currentSubcategories;
    const showProducts = selectedCategoryId && !currentSubcategories;

    return (
        <div className={styles.page}>
            {/* Breadcrumb navigation */}
            {breadcrumbs.length > 1 && (
                <div className={styles.breadcrumbs}>
                    <button className={styles.backButton} onClick={handleGoBack}>
                        ← Geri
                    </button>
                    <div className={styles.breadcrumbTrail}>
                        {breadcrumbs.map((item, index) => (
                            <span key={index}>
                                {index > 0 && <span className={styles.breadcrumbSep}> / </span>}
                                <button
                                    className={`${styles.breadcrumbItem} ${index === breadcrumbs.length - 1 ? styles.breadcrumbActive : ''}`}
                                    onClick={() => handleBreadcrumbClick(index)}
                                >
                                    {item.label}
                                </button>
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Category grid — home view */}
            {showCategories && (
                <>
                    <h1 className={styles.pageTitle}>
                        <span className={styles.titleEmoji}>📋</span>
                        Menümüz
                    </h1>
                    <p className={styles.pageSubtitle}>Kategori seçerek siparişinizi oluşturun</p>
                    <div className={styles.categoryGrid}>
                        {categoryCards.map((card) => (
                            <button
                                key={card.id}
                                className={styles.categoryCard}
                                onClick={() => handleCategoryClick(card)}
                                style={{ background: card.image ? 'none' : card.gradient }}
                            >
                                {card.image && (
                                    <img src={card.image} alt={card.name} className={styles.categoryImage} />
                                )}
                                <div className={styles.categoryOverlay} style={card.image ? {} : { background: 'transparent' }}>
                                    <span className={styles.categoryEmoji}>{card.emoji}</span>
                                    <span className={styles.categoryName}>{card.name}</span>
                                    {card.subcategories && (
                                        <span className={styles.categoryBadge}>{card.subcategories.length} alt kategori</span>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                </>
            )}

            {/* Subcategory grid */}
            {showSubcategories && currentSubcategories && (
                <>
                    <h2 className={styles.sectionTitle}>
                        {categoryCards.find(c => c.id === selectedCategoryId)?.emoji}{' '}
                        {categoryCards.find(c => c.id === selectedCategoryId)?.name}
                    </h2>
                    <p className={styles.pageSubtitle}>Alt kategori seçin</p>
                    <div className={styles.categoryGrid}>
                        {currentSubcategories.map((sub) => (
                            <button
                                key={sub.id}
                                className={styles.categoryCard}
                                onClick={() => handleCategoryClick(sub)}
                                style={{ background: sub.image ? 'none' : sub.gradient }}
                            >
                                {sub.image && (
                                    <img src={sub.image} alt={sub.name} className={styles.categoryImage} />
                                )}
                                <div className={styles.categoryOverlay} style={sub.image ? {} : { background: 'transparent' }}>
                                    <span className={styles.categoryEmoji}>{sub.emoji}</span>
                                    <span className={styles.categoryName}>{sub.name}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </>
            )}

            {/* Products grid */}
            {showProducts && (
                <>
                    <h2 className={styles.sectionTitle}>
                        {categoryCards.find(c => c.id === selectedCategoryId)?.emoji ||
                            DEFAULT_CATEGORIES.flatMap(c => c.subcategories || []).find(s => s.id === selectedCategoryId)?.emoji}{' '}
                        {breadcrumbs[breadcrumbs.length - 1]?.label}
                    </h2>
                    {categoryProducts.length === 0 ? (
                        <EmptyState
                            icon="🍽️"
                            title="Henüz Ürün Eklenmemiş"
                            message="Bu kategoride henüz ürün bulunmamaktadır."
                            actionLabel="← Kategorilere Dön"
                            onAction={handleGoBack}
                        />
                    ) : (
                        <div className={styles.productsGrid}>
                            {categoryProducts.map((product) => (
                                <ProductCard key={product.id} product={product as any} />
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
