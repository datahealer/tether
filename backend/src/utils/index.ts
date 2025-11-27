// src/utils/index.ts

export const formatDate = (date: Date, format: string): string => {
    // Implementation for formatting date
    // Example: return date.toISOString().split('T')[0]; // YYYY-MM-DD
    return ''; // Placeholder return
};

export const generateRandomString = (length: number): string => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
};

export const isEmpty = (value: any): boolean => {
    return value === null || value === undefined || (typeof value === 'string' && value.trim() === '');
};