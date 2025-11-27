// src/types/index.ts

export interface User {
    id: string;
    name: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface Order {
    id: string;
    userId: string;
    productIds: string[];
    totalAmount: number;
    createdAt: Date;
    updatedAt: Date;
}

export type Response<T> = {
    success: boolean;
    data?: T;
    error?: string;
};