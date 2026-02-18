import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { getStorageItem, setStorageItem } from '../utils/storage';

const AUTH_STORAGE_KEY = 'user_role_v1';

export type UserRole = 'admin' | 'customer' | 'waiter' | 'kitchen' | 'super_admin';

interface AuthContextType {
    role: UserRole | null;
    isAuthenticated: boolean;
    login: (role: UserRole) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [role, setRole] = useState<UserRole | null>(() => {
        return getStorageItem<UserRole | null>(AUTH_STORAGE_KEY, null);
    });

    // Sync to localStorage whenever role changes
    useEffect(() => {
        if (role) {
            setStorageItem(AUTH_STORAGE_KEY, role);
        } else {
            localStorage.removeItem(AUTH_STORAGE_KEY);
        }
    }, [role]);

    const login = (userRole: UserRole) => {
        setRole(userRole);
    };

    const logout = () => {
        setRole(null);
    };

    const isAuthenticated = role !== null;

    return (
        <AuthContext.Provider
            value={{
                role,
                isAuthenticated,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}
