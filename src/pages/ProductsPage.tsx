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

// Category emoji/color mappings for placeholder images
const categoryStyles: Record<string, { emoji: string; colors: string[] }> = {
    'İçecekler': { emoji: '☕', colors: ['#D97706', '#92400E', '#78350F', '#DC2626', '#E0F2FE', '#3B82F6'] },
    'Kahvaltı': { emoji: '🍳', colors: ['#F59E0B', '#FBBF24'] },
    'Ana Yemek': { emoji: '🍖', colors: ['#B91C1C', '#F59E0B', '#DC2626', '#EF4444'] },
    'Tatlılar': { emoji: '🍰', colors: ['#F59E0B', '#FBBF24', '#FEF3C7', '#92400E'] },
    'Aperatifler': { emoji: '🥗', colors: ['#FDE68A', '#DBEAFE', '#FDE047', '#FBBF24'] },
    'Salatalar': { emoji: '🥗', colors: ['#10B981', '#22C55E', '#16A34A'] },
};

export default function ProductsPage() {
    const { categories, menuItems, loading, error } = useMenu();
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Transform menu items to Product format with generated images
    const products = useMemo(() => {
        return menuItems.map((item, index) => {
            // Find category name for this item
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
    }, [menuItems, categories]);

    const filteredProducts = useMemo(() => {
        return products.filter((product) => {
            const matchesCategory =
                selectedCategory === 'all' || product.category === categories.find(c => c.id === selectedCategory)?.name;
            const matchesSearch = product.name
                .toLowerCase()
                .includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [selectedCategory, searchQuery, products, categories]);

    if (loading) {
        return (
            <div className={styles.page}>
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                    ⏳ Menü yükleniyor...
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

    return (
        <div className={styles.page}>
            <div className={styles.filters}>
                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className={styles.categorySelect}
                    aria-label="Kategori seç"
                >
                    <option value="all">Tüm Kategoriler</option>
                    {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                            {cat.icon} {cat.name}
                        </option>
                    ))}
                </select>

                <input
                    type="search"
                    placeholder="Ürün ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={styles.searchInput}
                    aria-label="Ürün ara"
                />
            </div>

            {filteredProducts.length === 0 ? (
                <EmptyState
                    icon="🔍"
                    title="Ürün Bulunamadı"
                    message="Aradığınız kriterlere uygun ürün bulunamadı."
                    actionLabel="Filtreyi Temizle"
                    onAction={() => {
                        setSelectedCategory('all');
                        setSearchQuery('');
                    }}
                />
            ) : (
                <div className={styles.grid}>
                    {filteredProducts.map((product) => (
                        <ProductCard key={product.id} product={product as any} />
                    ))}
                </div>
            )}
        </div>
    );
}
