import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Unauthorized - clear token and redirect to login
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_data');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;

// API methods
export const authAPI = {
    login: (email: string, password: string, restaurantSlug: string) =>
        api.post('/auth/login', { email, password, restaurantSlug }),

    customerLogin: (restaurantSlug: string, tableNumber: number) =>
        api.post('/auth/customer-login', { restaurantSlug, tableNumber }),
};

export const ordersAPI = {
    getAll: () => api.get('/orders'),
    create: (data: any) => api.post('/orders', data),
    createThirdParty: (data: { items: any[]; customerNote?: string; orderSource: string }) =>
        api.post('/orders', { ...data, tableNumber: 0 }),
    updateStatus: (id: string, status: string) => api.patch(`/orders/${id}/status`, { status }),
    delete: (id: string) => api.delete(`/orders/${id}`),
};

export const menuAPI = {
    getRestaurants: () => api.get('/menu/restaurants'),
    getCategories: (restaurantId?: string) => api.get('/menu/categories', { params: restaurantId ? { restaurant_id: restaurantId } : {} }),
    getProducts: (restaurantId?: string) => api.get('/menu/products', { params: restaurantId ? { restaurant_id: restaurantId } : {} }),
    getAllProducts: (restaurantId?: string) => api.get('/menu/products/all', { params: restaurantId ? { restaurant_id: restaurantId } : {} }),
    createCategory: (data: { name: string; icon?: string; sort_order?: number; restaurant_id?: string; image_url?: string }) => api.post('/menu/categories', data),
    updateCategory: (id: string, data: { name?: string; icon?: string; sort_order?: number; image_url?: string }) => api.patch(`/menu/categories/${id}`, data),
    deleteCategory: (id: string) => api.delete(`/menu/categories/${id}`),
    createProduct: (data: { name: string; price: number; category_id: string; description?: string; restaurant_id?: string; image_url?: string }) => api.post('/menu/products', data),
    updateProduct: (id: string, data: { name?: string; price?: number; category_id?: string; description?: string; is_available?: boolean; image_url?: string }) => api.patch(`/menu/products/${id}`, data),
    deleteProduct: (id: string) => api.delete(`/menu/products/${id}`),
    uploadImage: (image: string, fileName?: string) => api.post('/menu/upload-image', { image, fileName }),
};

export const tablesAPI = {
    getAll: () => api.get('/tables'),
    create: (table_number: number) => api.post('/tables', { table_number }),
    remove: (id: string) => api.delete(`/tables/${id}`),
};

export const waitersAPI = {
    getAll: () => api.get('/waiters'),
    create: (full_name: string, phone?: string) => api.post('/waiters', { full_name, phone }),
    update: (id: string, data: { full_name?: string; phone?: string; is_active?: boolean }) => api.patch(`/waiters/${id}`, data),
    remove: (id: string) => api.delete(`/waiters/${id}`),
};

export const reportAPI = {
    get: (params: { period?: string; startDate?: string; endDate?: string; source?: string }) =>
        api.get('/orders/report', { params }),
};

export const crmAPI = {
    getStats: () => api.get('/crm/stats'),
    getRestaurants: (status?: string) => api.get('/crm/restaurants', { params: status ? { status } : {} }),
    addRestaurant: (data: {
        name: string; slug: string; phone?: string; address?: string;
        contact_person?: string; contact_phone?: string;
        contract_months?: number; contract_start_date?: string;
        contract_status?: string; monthly_fee?: number;
        subscription_plan?: string; notes?: string;
    }) => api.post('/crm/restaurants', data),
    updateRestaurant: (id: string, data: Record<string, any>) => api.put(`/crm/restaurants/${id}`, data),
};
