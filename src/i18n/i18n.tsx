import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { tr, trCategoryNames, type TranslationKeys, type Translations } from './tr';
import { en, enCategoryNames } from './en';
import { ar, arCategoryNames } from './ar';
import { de, deCategoryNames } from './de';

export type Language = 'tr' | 'en' | 'ar' | 'de';

export interface LanguageOption {
    code: Language;
    label: string;
    flag: string;
}

export const LANGUAGES: LanguageOption[] = [
    { code: 'tr', label: 'Türkçe', flag: '🇹🇷' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'ar', label: 'العربية', flag: '🇸🇦' },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
];

const dictionaries: Record<Language, Translations> = { tr, en, ar, de };

// Category name translation maps per language
const categoryDictionaries: Record<Language, Record<string, string>> = {
    tr: trCategoryNames,
    en: enCategoryNames,
    ar: arCategoryNames,
    de: deCategoryNames,
};

const STORAGE_KEY = 'app_language';

function getInitialLanguage(): Language {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored && stored in dictionaries) return stored as Language;
    } catch { }
    return 'tr';
}

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: TranslationKeys) => string;
    tc: (categoryName: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<Language>(getInitialLanguage);

    const setLanguage = useCallback((lang: Language) => {
        setLanguageState(lang);
        try { localStorage.setItem(STORAGE_KEY, lang); } catch { }
    }, []);

    const t = useCallback((key: TranslationKeys): string => {
        return dictionaries[language]?.[key] || dictionaries.tr[key] || key;
    }, [language]);

    // Translate category names (from Turkish DB names to current language)
    const tc = useCallback((categoryName: string): string => {
        return categoryDictionaries[language]?.[categoryName] || categoryName;
    }, [language]);

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, tc }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within LanguageProvider');
    }
    return context;
}
