// Utility functions for formatting currency and dates

/**
 * Format a number as Turkish Lira
 * Example: 1234.56 -> ₺1.234,56
 */
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
    }).format(amount);
}

/**
 * Format an ISO date string to Turkish readable format
 * Example: "2026-02-15T15:30:00" -> "15 Şubat 2026, 15:30"
 */
export function formatDate(isoString: string): string {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
}

/**
 * Generate a unique order ID
 * Format: ORD-2026-XXXX
 */
export function generateOrderId(): string {
    const year = new Date().getFullYear();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `ORD-${year}-${random}`;
}

/**
 * Format date for display in order lists (shorter)
 * Example: "15 Şub 2026"
 */
export function formatDateShort(isoString: string): string {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('tr-TR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    }).format(date);
}
