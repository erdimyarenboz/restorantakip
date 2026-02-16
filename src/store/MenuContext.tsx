import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { menuAPI } from '../services/api';
import type { Product, MenuCategory } from '../types';

interface Category {
    id: string;
    name: string;
    icon: string;
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
    getItemsByCategory: (categoryId: string) => MenuItem[];
    getItemById: (id: string) => MenuItem | undefined;
    refreshMenu: () => Promise<void>;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export function MenuProvider({ children }: { children: ReactNode }) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadMenu = async () => {
        try {
            setLoading(true);
            setError(null);

            const [categoriesRes, productsRes] = await Promise.all([
                menuAPI.getCategories(),
                menuAPI.getProducts(),
            ]);

            // Transform backend data to frontend format
            const backendCategories = categoriesRes.data;
            const backendProducts = productsRes.data;

            const transformedCategories: Category[] = backendCategories.map((cat: any) => ({
                id: cat.id,
                name: cat.name,
                icon: cat.icon as any,
            }));

            const transformedItems: MenuItem[] = backendProducts.map((product: any) => ({
                id: product.id,
                name: product.name,
                description: product.description || '',
                price: parseFloat(product.price),
                categoryId: product.category_id,
                image: product.image_url || '',
            }));

            setCategories(transformedCategories);
            setMenuItems(transformedItems);
        } catch (err: any) {
            console.error('Failed to load menu:', err);
            setError('Menü yüklenemedi. Lütfen tekrar deneyin.');
            // Fallback to empty data
            setCategories([]);
            setMenuItems([]);
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
