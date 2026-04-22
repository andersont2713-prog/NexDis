/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  id: string;
  name: string;
  sku: string;
  stock: number;
  minStock: number;
  maxStock: number;
  warehouse: string;
  lot: string;
  expiry: string;
  price: number;
  category: string;
  imageUrl?: string;
}

export interface Customer {
  id: string;
  name: string;
  contact: string;
  creditLimit: number;
  currentBalance: number;
  lat: number;
  lng: number;
  email: string;
  phone: string;
  address: string;
  history: Order[];
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'processed' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: Date;
  sellerId: string;
  gps?: { lat: number; lng: number };
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface User {
  id: string;
  name: string;
  role: 'admin' | 'seller' | 'warehouse';
  email: string;
}

export interface Zone {
  id: string;
  name: string;
  customers: string[]; // IDs of customers in this zone
  sellerId?: string; // Assigned seller
}

export type Currency = {
  code: string;
  symbol: string;
  name: string;
  country: string;
};

export const CURRENCIES: Currency[] = [
  { code: 'PEN', symbol: 'S/', name: 'Sol Peruano', country: 'Perú' },
  { code: 'COP', symbol: '$', name: 'Peso Colombiano', country: 'Colombia' },
  { code: 'MXN', symbol: '$', name: 'Peso Mexicano', country: 'México' },
  { code: 'CLP', symbol: '$', name: 'Peso Chileno', country: 'Chile' },
  { code: 'USD', symbol: '$', name: 'Dólar Estadounidense', country: 'EE.UU.' },
];
