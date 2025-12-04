// data/platform/erpData.ts
export const orderVolumeData = [
    { name: 'Jan', orders: 230 },
    { name: 'Feb', orders: 280 },
    { name: 'Mar', orders: 350 },
    { name: 'Apr', orders: 320 },
    { name: 'May', orders: 410 },
    { name: 'Jun', orders: 450 },
];

export const inventoryStatusData = [
    { name: 'In Stock', value: 8500 },
    { name: 'Low Stock', value: 1200 },
    { name: 'Out of Stock', value: 300 },
];
export const COLORS_ERP = ['#10b981', '#f59e0b', '#ef4444'];

export const recentSalesOrders = [
    { id: 'SO-00125', customer: 'Quantum Corp', amount: 15000, status: 'Shipped', date: '2024-07-23' },
    { id: 'SO-00124', customer: 'Cyberdyne Systems', amount: 22500, status: 'Processing', date: '2024-07-23' },
    { id: 'SO-00123', customer: 'NeuroLink Inc.', amount: 8000, status: 'Delivered', date: '2024-07-21' },
];