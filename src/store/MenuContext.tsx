import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { menuAPI } from '../services/api';

interface Category {
    id: string;
    name: string;
    icon: string;
    image_url?: string | null;
}

interface MenuItem {
    id: string;
    name: string;
    description: string;
    price: number;
    categoryId: string;
    image: string;
}

interface MenuContextType {
    categories: Category[];
    menuItems: MenuItem[];
    loading: boolean;
    error: string | null;
    restaurantName: string;
    restaurantLogo: string | null;
    getItemsByCategory: (categoryId: string) => MenuItem[];
    getItemById: (id: string) => MenuItem | undefined;
    refreshMenu: () => Promise<void>;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

// ─── Demo / Fallback Data (matches Bolt.new) ───────────────────────────
const DEMO_CATEGORIES: Category[] = [
    { id: 'cat-1', name: 'Ana Yemek', icon: '🍖' },
    { id: 'cat-2', name: 'İçecekler', icon: '☕' },
    { id: 'cat-3', name: 'Kahvaltı', icon: '🍳' },
    { id: 'cat-4', name: 'Tatlılar', icon: '🍰' },
    { id: 'cat-5', name: 'Salatalar', icon: '🥗' },
];

const DEMO_ITEMS: MenuItem[] = [
    { id: 'p-1', name: 'Adana Kebap', description: 'Acılı el yapımı kebap, lavaş ve közlenmiş sebze ile', price: 320, categoryId: 'cat-1', image: '' },
    { id: 'p-2', name: 'Iskender Kebap', description: 'Yoğurt ve tereyağı sos ile döner kebap', price: 350, categoryId: 'cat-1', image: '' },
    { id: 'p-3', name: 'Karışık Izgara', description: 'Kuzu pirzola, tavuk kanat, köfte ve Adana kebap', price: 450, categoryId: 'cat-1', image: '' },
    { id: 'p-4', name: 'Lahmacun', description: 'İnce hamur üzerine kıymalı harç, maydanoz ve limon ile', price: 85, categoryId: 'cat-1', image: '' },
    { id: 'p-5', name: 'Pide (Kaşarlı)', description: 'Fırında kaşar peynirli pide', price: 150, categoryId: 'cat-1', image: '' },
    { id: 'p-6', name: 'Mercimek Çorbası', description: 'Geleneksel kırmızı mercimek çorbası', price: 75, categoryId: 'cat-1', image: '' },
    { id: 'p-7', name: 'Türk Kahvesi', description: 'Geleneksel Türk kahvesi, orta şekerli', price: 45, categoryId: 'cat-2', image: '' },
    { id: 'p-8', name: 'Çay', description: 'Demli Türk çayı', price: 20, categoryId: 'cat-2', image: '' },
    { id: 'p-9', name: 'Ayran', description: 'Taze ev yapımı ayran', price: 30, categoryId: 'cat-2', image: '' },
    { id: 'p-10', name: 'Limonata', description: 'Taze sıkılmış limonata', price: 45, categoryId: 'cat-2', image: '' },
    { id: 'p-11', name: 'Serpme Kahvaltı', description: 'Zengin serpme kahvaltı tabağı, 2 kişilik', price: 350, categoryId: 'cat-3', image: '' },
    { id: 'p-12', name: 'Menemen', description: 'Domatesli, biberli yumurta', price: 90, categoryId: 'cat-3', image: '' },
    { id: 'p-13', name: 'Künefe', description: 'Sıcak künefe, kaymak ve antep fıstığı ile', price: 120, categoryId: 'cat-4', image: '' },
    { id: 'p-14', name: 'Sütlaç', description: 'Fırında sütlaç', price: 75, categoryId: 'cat-4', image: '' },
    { id: 'p-15', name: 'Baklava', description: 'El açması fıstıklı baklava (6 dilim)', price: 180, categoryId: 'cat-4', image: '' },
    { id: 'p-16', name: 'Akdeniz Salata', description: 'Domates, salatalık, zeytin, beyaz peynir', price: 95, categoryId: 'cat-5', image: '' },
    { id: 'p-17', name: 'Çoban Salata', description: 'Domates, biber, soğan, maydanoz', price: 70, categoryId: 'cat-5', image: '' },
];

export function MenuProvider({ children }: { children: ReactNode }) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [restaurantName, setRestaurantName] = useState('Restoran Sipariş');
    const [restaurantLogo, setRestaurantLogo] = useState<string | null>(null);

    const loadMenu = async () => {
        try {
            setLoading(true);
            setError(null);

            const [categoriesRes, productsRes, restaurantsRes] = await Promise.all([
                menuAPI.getCategories(),
                menuAPI.getProducts(),
                menuAPI.getRestaurants().catch(() => ({ data: [] })),
            ]);

            // Set restaurant info from the first active restaurant
            const restaurants = restaurantsRes.data;
            if (restaurants && restaurants.length > 0) {
                const rest = restaurants[0];
                setRestaurantName(rest.name || 'Restoran Sipariş');
                setRestaurantLogo(rest.logo_url || null);
            }

            // Transform backend data to frontend format
            const backendCategories = categoriesRes.data;
            const backendProducts = productsRes.data;

            console.log(`[MenuContext] API loaded: ${backendCategories.length} categories, ${backendProducts.length} products`);

            const transformedCategories: Category[] = backendCategories.map((cat: any) => ({
                id: cat.id,
                name: cat.name,
                icon: cat.icon as any,
                image_url: cat.image_url || null,
            }));

            const transformedItems: MenuItem[] = backendProducts.map((product: any) => ({
                id: product.id,
                name: product.name,
                description: product.description || '',
                price: parseFloat(product.price),
                categoryId: product.category_id,
                image: product.image_url || '',
            }));

            // Always use API data — even if empty (admin may not have added products yet)
            setCategories(transformedCategories);
            setMenuItems(transformedItems);
        } catch (err: any) {
            console.warn('[MenuContext] API unavailable, using demo menu data.', err?.message || err);
            // Fallback to demo data so the app works without a backend
            setCategories(DEMO_CATEGORIES);
            setMenuItems(DEMO_ITEMS);
            setError(null);          // clear error — demo data is valid
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMenu();
    }, []);

    const getItemsByCategory = (categoryId: string) => {
        return menuItems.filter((item) => item.categoryId === categoryId);
    };

    const getItemById = (id: string) => {
        return menuItems.find((item) => item.id === id);
    };

    const refreshMenu = async () => {
        await loadMenu();
    };

    return (
        <MenuContext.Provider
            value={{
                categories,
                menuItems,
                loading,
                error,
                restaurantName,
                restaurantLogo,
                getItemsByCategory,
                getItemById,
                refreshMenu,
            }}
        >
            {children}
        </MenuContext.Provider>
    );
}

export function useMenu() {
    const context = useContext(MenuContext);
    if (!context) {
        throw new Error('useMenu must be used within MenuProvider');
    }
    return context;
}
