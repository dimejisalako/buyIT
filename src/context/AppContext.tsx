"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  email: string;
  name: string;
  joinDate: Date;
  isAdmin?: boolean;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  status: OrderStatus;
  totalAmount: number;
  serviceFeesTotal: number;
  estimatedShippingCost: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  title: string;
  link: string;
  image?: string;
  price?: string;
  serviceFee: number;
}

export type OrderStatus = 
  | 'ordered' 
  | 'shipped' 
  | 'received' 
  | 'waiting_international_shipping' 
  | 'internationally_shipped' 
  | 'arrived_nigeria' 
  | 'awaiting_pickup'
  | 'completed';

export const OrderStatusLabels: Record<OrderStatus, string> = {
  ordered: 'Ordered',
  shipped: 'Shipped from Amazon',
  received: 'Received at US Facility',
  waiting_international_shipping: 'Waiting on International Shipping',
  internationally_shipped: 'Internationally Shipped',
  arrived_nigeria: 'Arrived in Nigeria',
  awaiting_pickup: 'Awaiting Pickup',
  completed: 'Completed'
};

interface AppContextType {
  // Users
  users: User[];
  currentUser: User | null;
  adminUser: User | null;
  registerUser: (userData: Omit<User, 'id' | 'joinDate'>) => User;
  loginUser: (email: string, password: string) => User | null;
  loginAdmin: (username: string, password: string) => User | null;
  logoutUser: () => void;
  
  // Orders
  orders: Order[];
  createOrder: (userId: string, items: OrderItem[]) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  getUserOrders: (userId: string) => Order[];
  
  // Stats
  getUserStats: (userId: string) => {
    totalOrders: number;
    totalSpent: number;
    totalSavings: number;
    totalItems: number;
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Mock database with sample data
const MOCK_USERS: User[] = [
  {
    id: 'user_001',
    email: 'john.doe@example.com',
    name: 'John Doe',
    joinDate: new Date('2024-01-15'),
  },
  {
    id: 'user_002',
    email: 'sarah.williams@example.com',
    name: 'Sarah Williams',
    joinDate: new Date('2024-02-20'),
  },
  {
    id: 'admin_001',
    email: 'admin@buyit.com',
    name: 'Uncle Kunski',
    joinDate: new Date('2024-01-01'),
    isAdmin: true,
  }
];

const MOCK_ORDERS: Order[] = [
  {
    id: 'order_001',
    userId: 'user_001',
    items: [
      {
        id: 'item_001',
        title: 'Apple iPhone 15 Pro Max (256GB, Natural Titanium)',
        link: 'https://www.amazon.com/dp/B0CHX1F7J6',
        image: 'https://m.media-amazon.com/images/I/81Os1SDWpcL._AC_SX679_.jpg',
        price: '$1,199.00',
        serviceFee: 1.50
      },
      {
        id: 'item_002',
        title: 'Sony WH-1000XM5 Wireless Headphones',
        link: 'https://www.amazon.com/dp/B09XS7JWHH',
        image: 'https://m.media-amazon.com/images/I/71o8Q5XJS5L._AC_SX679_.jpg',
        price: '$399.99',
        serviceFee: 1.50
      }
    ],
    status: 'internationally_shipped',
    totalAmount: 1598.99,
    serviceFeesTotal: 3.00,
    estimatedShippingCost: 45.00,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-25')
  },
  {
    id: 'order_002',
    userId: 'user_002',
    items: [
      {
        id: 'item_003',
        title: 'Canon EOS R50 Mirrorless Camera',
        link: 'https://www.amazon.com/dp/B0BWK8WJ6T',
        image: 'https://m.media-amazon.com/images/I/81Q2zQ2Q2QL._AC_SX679_.jpg',
        price: '$679.99',
        serviceFee: 1.50
      }
    ],
    status: 'awaiting_pickup',
    totalAmount: 679.99,
    serviceFeesTotal: 1.50,
    estimatedShippingCost: 25.00,
    createdAt: new Date('2024-02-25'),
    updatedAt: new Date('2024-03-01')
  }
];

export function AppProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [adminUser, setAdminUser] = useState<User | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('buyit_current_user');
    const savedAdmin = localStorage.getItem('buyit_admin_user');
    const savedUsers = localStorage.getItem('buyit_users');
    const savedOrders = localStorage.getItem('buyit_orders');

    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    if (savedAdmin) {
      setAdminUser(JSON.parse(savedAdmin));
    }
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    }
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    }
  }, []);

  // Save to localStorage when data changes
  useEffect(() => {
    localStorage.setItem('buyit_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('buyit_orders', JSON.stringify(orders));
  }, [orders]);

  const registerUser = (userData: Omit<User, 'id' | 'joinDate'>): User => {
    const newUser: User = {
      ...userData,
      id: `user_${Date.now()}`,
      joinDate: new Date()
    };
    setUsers(prev => [...prev, newUser]);
    return newUser;
  };

  const loginUser = (email: string, password: string): User | null => {
    // Simple mock authentication - in real app, this would validate against backend
    const user = users.find(u => u.email === email && !u.isAdmin);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('buyit_current_user', JSON.stringify(user));
      return user;
    }
    return null;
  };

  const loginAdmin = (username: string, password: string): User | null => {
    if (username === 'unclekunski' && password === '12345') {
      const admin = users.find(u => u.isAdmin);
      if (admin) {
        setAdminUser(admin);
        localStorage.setItem('buyit_admin_user', JSON.stringify(admin));
        return admin;
      }
    }
    return null;
  };

  const logoutUser = () => {
    setCurrentUser(null);
    setAdminUser(null);
    localStorage.removeItem('buyit_current_user');
    localStorage.removeItem('buyit_admin_user');
  };

  const createOrder = (userId: string, items: OrderItem[]): Order => {
    const serviceFeesTotal = items.length * 1.50;
    const estimatedShippingCost = Math.max(15, items.length * 8); // Minimum $15, $8 per item
    const totalAmount = serviceFeesTotal + estimatedShippingCost;

    const newOrder: Order = {
      id: `order_${Date.now()}`,
      userId,
      items,
      status: 'ordered',
      totalAmount,
      serviceFeesTotal,
      estimatedShippingCost,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setOrders(prev => [...prev, newOrder]);
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { ...order, status, updatedAt: new Date() }
        : order
    ));
  };

  const getUserOrders = (userId: string): Order[] => {
    return orders.filter(order => order.userId === userId);
  };

  const getUserStats = (userId: string) => {
    const userOrders = getUserOrders(userId);
    const totalOrders = userOrders.length;
    const totalSpent = userOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalItems = userOrders.reduce((sum, order) => sum + order.items.length, 0);
    const totalServiceFees = userOrders.reduce((sum, order) => sum + order.serviceFeesTotal, 0);
    const totalEstimatedShipping = userOrders.reduce((sum, order) => sum + order.estimatedShippingCost, 0);
    const totalSavings = totalEstimatedShipping - totalServiceFees;

    return {
      totalOrders,
      totalSpent,
      totalSavings: Math.max(0, totalSavings),
      totalItems
    };
  };

  return (
    <AppContext.Provider value={{
      users,
      currentUser,
      adminUser,
      registerUser,
      loginUser,
      loginAdmin,
      logoutUser,
      orders,
      createOrder,
      updateOrderStatus,
      getUserOrders,
      getUserStats
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};


