import { useState, useMemo } from 'react';
import { useMenu } from '../store/MenuContext';
import { useLanguage } from '../i18n/i18n';
import ProductCard from '../components/ProductCard';
import EmptyState from '../components/EmptyState';
import styles from '../styles/ProductsPage.module.css';

// SVG placeholder image generator for products without images
const createMenuImage = (color: string): string => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
    <rect width="300" height="300" fill="${color}"/>
    <text x="50%" y="50%" font-size="80" text-anchor="middle" dominant-baseline="middle">🍽️</text>
  </svg>`;
    return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
};

// ─── Category card configuration ───────────────────────────────────────
interface CategoryCard {
    id: string;
    name: string;
    gradient: string;
    image?: string;        // admin-uploaded image URL
    subcategories?: CategoryCard[];
}

// Gradient palette — assigned dynamically so categories get varied colors
const GRADIENT_PALETTE = [
    'linear-gradient(135deg, #0EA5E9 0%, #0369A1 100%)',
    'linear-gradient(135deg, #F59E0B 0%, #B45309 100%)',
    'linear-gradient(135deg, #B91C1C 0%, #7F1D1D 100%)',
    'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)',
    'linear-gradient(135deg, #10B981 0%, #047857 100%)',
    'linear-gradient(135deg, #D97706 0%, #92400E 100%)',
    'linear-gradient(135deg, #7C3AED 0%, #4C1D95 100%)',
    'linear-gradient(135deg, #EA580C 0%, #9A3412 100%)',
    'linear-gradient(135deg, #78350F 0%, #451A03 100%)',
    'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)',
    'linear-gradient(135deg, #059669 0%, #065F46 100%)',
    'linear-gradient(135deg, #0284C7 0%, #0C4A6E 100%)',
    'linear-gradient(135deg, #6366F1 0%, #4338CA 100%)',
    'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
];

// Placeholder product image colors
const PLACEHOLDER_COLORS = ['#D97706', '#B91C1C', '#0EA5E9', '#10B981', '#7C3AED', '#EA580C', '#EC4899', '#F59E0B'];

// ─── Navigation breadcrumb type ────────────────────────────────────────
interface BreadcrumbItem {
    label: string;
    categoryId: string | null; // null = home
}

export default function ProductsPage() {
    const { categories, menuItems, loading, error } = useMenu();
    const { t, tc } = useLanguage();
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
    const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([
        { label: t('menu'), categoryId: null },
    ]);

    // Subcategory mappings — child category names to their parent
    const SUBCATEGORY_MAP: Record<string, string> = {
        'Sıcak Kahveler': 'Kahveler',
        'Soğuk Kahveler': 'Kahveler',
    };

    // Build category cards from API data
    const categoryCards = useMemo((): CategoryCard[] => {
        if (categories.length === 0) return [];

        // Identify parent → children relationships
        const childNames = new Set(Object.keys(SUBCATEGORY_MAP));
        const parentChildMap = new Map<string, CategoryCard[]>();

        // First pass: build all cards
        const allCards: CategoryCard[] = categories.map((cat, index) => {
            return {
                id: cat.id,
                name: cat.name,
                gradient: GRADIENT_PALETTE[index % GRADIENT_PALETTE.length],
                image: cat.image_url || undefined,
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

        // Check current categoryCards
        const selectedCard = categoryCards.find(c => c.id === selectedCategoryId);
        if (selectedCard?.subcategories && selectedCard.subcategories.length > 0) {
            return selectedCard.subcategories;
        }

        return null;
    }, [selectedCategoryId, categoryCards]);

    // Products for the selected category
    const categoryProducts = useMemo(() => {
        if (!selectedCategoryId) return [];

        const matchingItems = menuItems.filter((item) => {
            if (item.categoryId === selectedCategoryId) return true;
            const cat = categories.find(c => c.id === item.categoryId);
            const selectedCard = categoryCards.find(c => c.id === selectedCategoryId);
            if (cat && selectedCard && cat.name === selectedCard.name) return true;
            return false;
        });

        return matchingItems.map((item, index) => {
            const colorIndex = index % PLACEHOLDER_COLORS.length;
            return {
                id: item.id,
                name: item.name,
                description: item.description,
                price: item.price,
                category: categories.find(c => c.id === item.categoryId)?.name || 'Diğer',
                image: item.image || createMenuImage(PLACEHOLDER_COLORS[colorIndex]),
            };
        });
    }, [selectedCategoryId, menuItems, categories, categoryCards]);

    // Handle category click
    const handleCategoryClick = (card: CategoryCard) => {
        if (card.subcategories && card.subcategories.length > 0) {
            // Show subcategories
            setSelectedCategoryId(card.id);
            setBreadcrumbs(prev => [...prev, { label: tc(card.name), categoryId: card.id }]);
        } else {
            // Show products directly
            setSelectedCategoryId(card.id);
            setBreadcrumbs(prev => [...prev, { label: tc(card.name), categoryId: card.id }]);
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
                    <p>{t('menuLoading')}</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.page}>
                <EmptyState
                    icon="❌"
                    title={t('menuLoadFailed')}
                    message={error}
                    actionLabel={t('tryAgain')}
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
                        {t('goBackShort')}
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
                        {t('ourMenu')}
                    </h1>
                    <p className={styles.pageSubtitle}>{t('selectCategoryToOrder')}</p>
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
                                    <span className={styles.categoryName}>{tc(card.name)}</span>
                                    {card.subcategories && (
                                        <span className={styles.categoryBadge}>{card.subcategories.length} {t('subCategories')}</span>
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
                        {tc(categoryCards.find(c => c.id === selectedCategoryId)?.name || '')}
                    </h2>
                    <p className={styles.pageSubtitle}>{t('selectSubcategory')}</p>
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
                                    <span className={styles.categoryName}>{tc(sub.name)}</span>
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
                        {breadcrumbs[breadcrumbs.length - 1]?.label}
                    </h2>
                    {categoryProducts.length === 0 ? (
                        <EmptyState
                            icon="🍽️"
                            title={t('noProductsInCategory')}
                            message={t('noProductsInCategoryMsg')}
                            actionLabel={t('backToCategories')}
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
