// components/views/platform/DemoBankSupplyChainView.tsx
import React, { useState, useReducer, useContext, useEffect, useMemo, useCallback, useRef } from 'react';
import Card from '../../Card';
import { GoogleGenAI } from "@google/genai";

// SECTION: ENHANCED TYPE DEFINITIONS FOR A REAL-WORLD APPLICATION

export enum ShipmentStatus {
    PENDING = 'Pending',
    IN_TRANSIT = 'In Transit',
    CUSTOMS_CLEARANCE = 'Customs Clearance',
    WAREHOUSE = 'In Warehouse',
    OUT_FOR_DELIVERY = 'Out for Delivery',
    DELIVERED = 'Delivered',
    DELAYED = 'Delayed',
    CANCELLED = 'Cancelled',
    EXCEPTION = 'Exception',
}

export enum CarrierType {
    OCEAN = 'Oceanic Freight',
    AIR = 'Air Cargo Express',
    RAIL = 'Domestic Rail',
    TRUCK = 'Ground Shipping',
    MULTIMODAL = 'Multimodal',
}

export enum RiskLevel {
    LOW = 'Low',
    MEDIUM = 'Medium',
    HIGH = 'High',
    CRITICAL = 'Critical',
}

export enum DocumentType {
    BILL_OF_LADING = 'Bill of Lading',
    COMMERCIAL_INVOICE = 'Commercial Invoice',
    PACKING_LIST = 'Packing List',
    CERTIFICATE_OF_ORIGIN = 'Certificate of Origin',
    CUSTOMS_DECLARATION = 'Customs Declaration',
    INSURANCE_POLICY = 'Insurance Policy',
}

export interface Geolocation {
    lat: number;
    lng: number;
    city: string;
    country: string;
}

export interface ShipmentLeg {
    legId: string;
    type: CarrierType;
    carrier: string;
    origin: Geolocation;
    destination: Geolocation;
    etd: string; // Estimated Time of Departure
    eta: string; // Estimated Time of Arrival
    atd?: string; // Actual Time of Departure
    ata?: string; // Actual Time of Arrival
    status: ShipmentStatus;
    notes: string;
}

export interface Product {
    sku: string;
    name: string;
    description: string;
    category: string;
    unitPrice: number;
    weightKg: number;
    dimensionsCm: { l: number; w: number; h: number };
    countryOfOrigin: string;
    hsCode: string; // Harmonized System Code for customs
}

export interface ShipmentItem {
    product: Product;
    quantity: number;
    totalValue: number;
    totalWeight: number;
}

export interface ComplianceDocument {
    id: string;
    type: DocumentType;
    url: string;
    uploadedAt: string;
    expiresAt?: string;
    status: 'Verified' | 'Pending' | 'Rejected';
}

export interface Shipment {
    id: string;
    status: ShipmentStatus;
    origin: Geolocation;
    destination: Geolocation;
    carrier: string;
    carrierType: CarrierType;
    bookingDate: string;
    pickupDate: string;
    estimatedDeliveryDate: string;
    actualDeliveryDate?: string;
    items: ShipmentItem[];
    totalValue: number;
    totalWeightKg: number;
    trackingHistory: { timestamp: string; location: string; status: ShipmentStatus; details: string }[];
    legs: ShipmentLeg[];
    documents: ComplianceDocument[];
    riskLevel: RiskLevel;
    assignedAgent: string;
}

export interface SupplierFinancials {
    revenueUSD: number;
    netIncomeUSD: number;
    debtToEquityRatio: number;
    creditRating: 'AAA' | 'AA' | 'A' | 'BBB' | 'BB' | 'B' | 'CCC' | 'Unrated';
    lastAuditDate: string;
}

export interface Supplier {
    id: string;
    name: string;
    country: string;
    address: string;
    contactPerson: string;
    email: string;
    phone: string;
    rating: number; // 1-5
    onTimeDeliveryRate: number; // 0-1
    products: Product[];
    financials: SupplierFinancials;
    riskProfile: {
        geopolitical: RiskLevel;
        financial: RiskLevel;
        operational: RiskLevel;
        compliance: RiskLevel;
    };
    location: Geolocation;
}

export interface PurchaseOrder {
    id: string;
    supplierId: string;
    items: { sku: string; quantity: number; unitPrice: number }[];
    totalAmount: number;
    orderDate: string;
    expectedDeliveryDate: string;
    status: 'Draft' | 'Sent' | 'Acknowledged' | 'Partially Fulfilled' | 'Fulfilled' | 'Cancelled';
    relatedShipmentIds: string[];
}

export interface InventoryItem {
    sku: string;
    productName: string;
    quantity: number;
    warehouseLocation: string;
    lastStockedDate: string;
    reorderPoint: number;
}

export interface AppState {
    shipments: Shipment[];
    suppliers: Supplier[];
    purchaseOrders: PurchaseOrder[];
    inventory: InventoryItem[];
    isLoading: boolean;
    error: string | null;
    selectedShipmentId: string | null;
    selectedSupplierId: string | null;
    viewMode: 'dashboard' | 'shipments' | 'suppliers' | 'orders';
    userRole: 'analyst' | 'manager' | 'coordinator';
    notifications: Notification[];
}

export interface Notification {
    id: string;
    message: string;
    type: 'info' | 'warning' | 'error';
    timestamp: string;
    isRead: boolean;
}

// SECTION: MOCK DATA GENERATION
// In a real app, this would be fetched from an API. For this enhanced demo, we generate it client-side.

export const CITIES: Geolocation[] = [
    { lat: 31.2304, lng: 121.4737, city: 'Shanghai', country: 'CN' },
    { lat: 22.3193, lng: 114.1694, city: 'Hong Kong', country: 'CN' },
    { lat: 22.5431, lng: 114.0579, city: 'Shenzhen', country: 'CN' },
    { lat: 34.0522, lng: -118.2437, city: 'Los Angeles', country: 'USA' },
    { lat: 40.7128, lng: -74.0060, city: 'New York', country: 'USA' },
    { lat: 41.8781, lng: -87.6298, city: 'Chicago', country: 'USA' },
    { lat: 51.5074, lng: -0.1278, city: 'London', country: 'UK' },
    { lat: 53.4808, lng: -2.2426, city: 'Manchester', country: 'UK' },
    { lat: 50.1109, lng: 8.6821, city: 'Frankfurt', country: 'DE' },
    { lat: 52.5200, lng: 13.4050, city: 'Berlin', country: 'DE' },
    { lat: 25.0330, lng: 121.5654, city: 'Taipei', country: 'Taiwan' },
    { lat: 35.6895, lng: 139.6917, city: 'Tokyo', country: 'JP' },
    { lat: 1.3521, lng: 103.8198, city: 'Singapore', country: 'SG' },
    { lat: -33.8688, lng: 151.2093, city: 'Sydney', country: 'AU' },
    { lat: 19.4326, lng: -99.1332, city: 'Mexico City', country: 'MX' },
    { lat: -23.5505, lng: -46.6333, city: 'Sao Paulo', country: 'BR' },
];

export const PRODUCT_CATEGORIES = ['Electronics', 'Automotive Parts', 'Pharmaceuticals', 'Apparel', 'Industrial Machinery'];
export const PRODUCT_NAMES = {
    'Electronics': ['Microprocessor', 'OLED Display', 'Lithium-ion Battery', 'Memory Module'],
    'Automotive Parts': ['Brake Caliper', 'Engine Control Unit', 'Transmission Assembly', 'LED Headlight'],
    'Pharmaceuticals': ['Insulin Vials', 'Vaccine Batch', 'Antibiotic Powder', 'Sterile Syringes'],
    'Apparel': ['Denim Fabric Rolls', 'Finished Garments', 'Leather Hides', 'High-performance Textiles'],
    'Industrial Machinery': ['CNC Milling Head', 'Robotic Arm', 'Conveyor Belt System', 'Hydraulic Pump'],
};
export const CARRIER_NAMES = {
    [CarrierType.OCEAN]: ['Oceanic Freight', 'Sea Serpent Logistics', 'Global Marine Cargo', 'Neptune Shipping'],
    [CarrierType.AIR]: ['Air Cargo Express', 'SkyLink Freight', 'Velocity Air', 'Strato-Logistics'],
    [CarrierType.RAIL]: ['Domestic Rail', 'Continental Rail Co.', 'Iron Horse Express'],
    [CarrierType.TRUCK]: ['Ground Shipping Inc.', 'Cross-Country Movers', 'Road Warrior Transport'],
    [CarrierType.MULTIMODAL]: ['Intermodal Solutions', 'Total Logistics', 'OneWorld Freight'],
};

export const AGENT_NAMES = ['John Doe', 'Jane Smith', 'Carlos Ray', 'Priya Singh', 'Kenji Tanaka'];

const getRandomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getRandomDate = (start: Date, end: Date): Date => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
const randomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;

export const generateMockProducts = (count: number): Product[] => {
    const products: Product[] = [];
    for (let i = 0; i < count; i++) {
        const category = getRandomElement(PRODUCT_CATEGORIES);
        const name = getRandomElement(PRODUCT_NAMES[category as keyof typeof PRODUCT_NAMES]);
        products.push({
            sku: `PROD-${1000 + i}`,
            name: `${name} #${i + 1}`,
            description: `A high-quality ${name.toLowerCase()} for various applications.`,
            category,
            unitPrice: randomInt(50, 5000),
            weightKg: parseFloat((Math.random() * 50).toFixed(2)),
            dimensionsCm: { l: randomInt(10, 100), w: randomInt(10, 100), h: randomInt(10, 100) },
            countryOfOrigin: getRandomElement(['CN', 'DE', 'USA', 'JP', 'KR']),
            hsCode: `${randomInt(8400, 8599)}.${randomInt(10, 99)}.${randomInt(10, 99)}`,
        });
    }
    return products;
};

export const MOCK_PRODUCTS = generateMockProducts(50);

export const generateMockSuppliers = (count: number): Supplier[] => {
    const suppliers: Supplier[] = [];
    const companySuffixes = ['Inc.', 'Co.', 'LLC', 'Global', 'Solutions', 'Technologies'];
    for (let i = 0; i < count; i++) {
        const location = getRandomElement(CITIES);
        suppliers.push({
            id: `SUP-${100 + i}`,
            name: `${location.city} ${getRandomElement(PRODUCT_CATEGORIES)} ${getRandomElement(companySuffixes)}`,
            country: location.country,
            address: `${randomInt(100, 9999)} Main St, ${location.city}`,
            contactPerson: `${getRandomElement(['Alex', 'Maria', 'Chen', 'Samir'])} ${getRandomElement(['Wong', 'Garcia', 'Smith', 'Müller'])}`,
            email: `contact@supplier${100 + i}.com`,
            phone: `+${randomInt(1, 99)}-${randomInt(100, 999)}-${randomInt(1000, 9999)}`,
            rating: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
            onTimeDeliveryRate: parseFloat((0.85 + Math.random() * 0.14).toFixed(2)),
            products: MOCK_PRODUCTS.slice(i * 5, (i + 1) * 5),
            financials: {
                revenueUSD: randomInt(10, 500) * 1_000_000,
                netIncomeUSD: randomInt(-5, 50) * 1_000_000,
                debtToEquityRatio: parseFloat(Math.random().toFixed(2)),
                creditRating: getRandomElement(['AAA', 'AA', 'A', 'BBB', 'BB', 'B', 'CCC']),
                lastAuditDate: getRandomDate(new Date(2023, 0, 1), new Date()).toISOString().split('T')[0],
            },
            riskProfile: {
                geopolitical: getRandomElement(Object.values(RiskLevel)),
                financial: getRandomElement(Object.values(RiskLevel)),
                operational: getRandomElement(Object.values(RiskLevel)),
                compliance: getRandomElement(Object.values(RiskLevel)),
            },
            location,
        });
    }
    return suppliers;
};
export const MOCK_SUPPLIERS = generateMockSuppliers(10);

export const generateMockShipments = (count: number): Shipment[] => {
    const shipments: Shipment[] = [];
    const now = new Date();
    for (let i = 0; i < count; i++) {
        const origin = getRandomElement(CITIES);
        let destination = getRandomElement(CITIES);
        while (destination.city === origin.city) {
            destination = getRandomElement(CITIES);
        }

        const items: ShipmentItem[] = [];
        const numItems = randomInt(1, 5);
        let totalValue = 0;
        let totalWeightKg = 0;
        for (let j = 0; j < numItems; j++) {
            const product = getRandomElement(MOCK_PRODUCTS);
            const quantity = randomInt(10, 200);
            const itemValue = product.unitPrice * quantity;
            const itemWeight = product.weightKg * quantity;
            totalValue += itemValue;
            totalWeightKg += itemWeight;
            items.push({ product, quantity, totalValue: itemValue, totalWeight: itemWeight });
        }

        const bookingDate = getRandomDate(new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000), now);
        const pickupDate = new Date(bookingDate.getTime() + randomInt(1, 3) * 24 * 60 * 60 * 1000);
        const estimatedDeliveryDate = new Date(pickupDate.getTime() + randomInt(5, 30) * 24 * 60 * 60 * 1000);
        const status = getRandomElement(Object.values(ShipmentStatus));
        let actualDeliveryDate = undefined;
        if (status === ShipmentStatus.DELIVERED) {
            actualDeliveryDate = new Date(estimatedDeliveryDate.getTime() - randomInt(-3, 3) * 24 * 60 * 60 * 1000);
        }
        
        const carrierType = getRandomElement(Object.values(CarrierType));

        shipments.push({
            id: `SHP-${2024000 + i}`,
            status,
            origin,
            destination,
            carrier: getRandomElement(CARRIER_NAMES[carrierType]),
            carrierType,
            bookingDate: bookingDate.toISOString(),
            pickupDate: pickupDate.toISOString(),
            estimatedDeliveryDate: estimatedDeliveryDate.toISOString(),
            actualDeliveryDate: actualDeliveryDate?.toISOString(),
            items,
            totalValue,
            totalWeightKg,
            trackingHistory: [
                { timestamp: bookingDate.toISOString(), location: origin.city, status: ShipmentStatus.PENDING, details: 'Booking Confirmed' },
                { timestamp: pickupDate.toISOString(), location: origin.city, status: ShipmentStatus.IN_TRANSIT, details: 'Shipment picked up from origin.' },
            ],
            legs: [{
                legId: `LEG-${2024000 + i}-1`,
                type: carrierType,
                carrier: getRandomElement(CARRIER_NAMES[carrierType]),
                origin: origin,
                destination: destination,
                etd: pickupDate.toISOString(),
                eta: estimatedDeliveryDate.toISOString(),
                status: status,
                notes: 'Primary transport leg.'
            }],
            documents: [
                { id: `DOC-${i}-1`, type: DocumentType.BILL_OF_LADING, url: `/docs/SHP-${2024000 + i}-BOL.pdf`, uploadedAt: bookingDate.toISOString(), status: 'Verified' },
                { id: `DOC-${i}-2`, type: DocumentType.COMMERCIAL_INVOICE, url: `/docs/SHP-${2024000 + i}-INV.pdf`, uploadedAt: bookingDate.toISOString(), status: 'Pending' },
            ],
            riskLevel: getRandomElement(Object.values(RiskLevel)),
            assignedAgent: getRandomElement(AGENT_NAMES),
        });
    }
    return shipments;
};

// SECTION: UTILITY FUNCTIONS

export const formatDate = (dateString?: string, options?: Intl.DateTimeFormatOptions): string => {
    if (!dateString) return 'N/A';
    const defaultOptions: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    };
    try {
        return new Date(dateString).toLocaleDateString(undefined, { ...defaultOptions, ...options });
    } catch (e) {
        return 'Invalid Date';
    }
};

export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
    }).format(amount);
};

export const getStatusChipColor = (status: ShipmentStatus): string => {
    switch (status) {
        case ShipmentStatus.DELIVERED: return 'bg-green-500/20 text-green-300';
        case ShipmentStatus.IN_TRANSIT: return 'bg-cyan-500/20 text-cyan-300';
        case ShipmentStatus.PENDING: return 'bg-yellow-500/20 text-yellow-300';
        case ShipmentStatus.DELAYED: return 'bg-orange-500/20 text-orange-300';
        case ShipmentStatus.EXCEPTION:
        case ShipmentStatus.CANCELLED: return 'bg-red-500/20 text-red-300';
        default: return 'bg-gray-500/20 text-gray-300';
    }
};

export const getRiskChipColor = (risk: RiskLevel): string => {
    switch (risk) {
        case RiskLevel.LOW: return 'bg-green-500/20 text-green-300';
        case RiskLevel.MEDIUM: return 'bg-yellow-500/20 text-yellow-300';
        case RiskLevel.HIGH: return 'bg-orange-500/20 text-orange-300';
        case RiskLevel.CRITICAL: return 'bg-red-500/20 text-red-300';
        default: return 'bg-gray-500/20 text-gray-300';
    }
};

// SECTION: STATE MANAGEMENT (useReducer + Context)

type Action =
    | { type: 'FETCH_START' }
    | { type: 'FETCH_SUCCESS'; payload: { shipments: Shipment[]; suppliers: Supplier[]; purchaseOrders: PurchaseOrder[]; inventory: InventoryItem[] } }
    | { type: 'FETCH_ERROR'; payload: string }
    | { type: 'SELECT_SHIPMENT'; payload: string | null }
    | { type: 'UPDATE_SHIPMENT_STATUS'; payload: { id: string; status: ShipmentStatus } }
    | { type: 'ADD_NOTIFICATION'; payload: Omit<Notification, 'id' | 'timestamp' | 'isRead'> }
    | { type: 'MARK_NOTIFICATION_READ'; payload: string }
    | { type: 'SET_USER_ROLE'; payload: 'analyst' | 'manager' | 'coordinator' };

export const initialState: AppState = {
    shipments: [],
    suppliers: [],
    purchaseOrders: [],
    inventory: [],
    isLoading: true,
    error: null,
    selectedShipmentId: null,
    selectedSupplierId: null,
    viewMode: 'dashboard',
    userRole: 'manager',
    notifications: [],
};

export function appReducer(state: AppState, action: Action): AppState {
    switch (action.type) {
        case 'FETCH_START':
            return { ...state, isLoading: true, error: null };
        case 'FETCH_SUCCESS':
            return { ...state, isLoading: false, ...action.payload };
        case 'FETCH_ERROR':
            return { ...state, isLoading: false, error: action.payload };
        case 'SELECT_SHIPMENT':
            return { ...state, selectedShipmentId: action.payload };
        case 'UPDATE_SHIPMENT_STATUS':
            return {
                ...state,
                shipments: state.shipments.map(s =>
                    s.id === action.payload.id ? { ...s, status: action.payload.status } : s
                ),
            };
        case 'ADD_NOTIFICATION':
            const newNotification: Notification = {
                ...action.payload,
                id: `notif-${Date.now()}`,
                timestamp: new Date().toISOString(),
                isRead: false,
            };
            return { ...state, notifications: [newNotification, ...state.notifications] };
        case 'MARK_NOTIFICATION_READ':
            return {
                ...state,
                notifications: state.notifications.map(n =>
                    n.id === action.payload ? { ...n, isRead: true } : n
                ),
            };
        case 'SET_USER_ROLE':
            return { ...state, userRole: action.payload };
        default:
            return state;
    }
}

export const AppStateContext = React.createContext<{ state: AppState; dispatch: React.Dispatch<Action> } | undefined>(undefined);

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(appReducer, initialState);
    return <AppStateContext.Provider value={{ state, dispatch }}>{children}</AppStateContext.Provider>;
};

export const useAppState = () => {
    const context = useContext(AppStateContext);
    if (context === undefined) {
        throw new Error('useAppState must be used within an AppStateProvider');
    }
    return context;
};


// SECTION: MOCK API SERVICE

export const supplyChainApi = {
    fetchDashboardData: async (): Promise<{ shipments: Shipment[]; suppliers: Supplier[]; purchaseOrders: PurchaseOrder[]; inventory: InventoryItem[] }> => {
        console.log("API: Fetching all dashboard data...");
        return new Promise((resolve) => {
            setTimeout(() => {
                const shipments = generateMockShipments(125);
                const suppliers = MOCK_SUPPLIERS;
                // NOTE: In a real app, POs and Inventory would be generated too
                resolve({ shipments, suppliers, purchaseOrders: [], inventory: [] });
            }, 1500); // Simulate network delay
        });
    },
    updateShipmentStatus: async (id: string, status: ShipmentStatus): Promise<Shipment> => {
        console.log(`API: Updating shipment ${id} to status ${status}`);
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // In a real API, this would find and update the shipment in a DB
                // Here we just simulate a successful response.
                if (Math.random() > 0.05) { // 95% success rate
                    resolve({} as Shipment); // Don't need to return the full object for this mock
                } else {
                    reject(new Error("Failed to update shipment status. Please try again."));
                }
            }, 750);
        });
    }
};


// SECTION: ADVANCED UI COMPONENTS

// Advanced Data Table Component with Sorting and Filtering
export interface Column<T> {
    accessor: keyof T;
    header: string;
    cell?: (value: any) => React.ReactNode;
    sortable?: boolean;
}

export interface AdvancedDataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    onRowClick?: (row: T) => void;
    title: string;
}

export function AdvancedDataTable<T extends { id: string | number }>({ columns, data, onRowClick, title }: AdvancedDataTableProps<T>) {
    const [sortConfig, setSortConfig] = useState<{ key: keyof T, direction: 'ascending' | 'descending' } | null>(null);
    const [filter, setFilter] = useState('');

    const filteredData = useMemo(() => {
        if (!filter) return data;
        return data.filter(item =>
            Object.values(item).some(val =>
                String(val).toLowerCase().includes(filter.toLowerCase())
            )
        );
    }, [data, filter]);

    const sortedData = useMemo(() => {
        let sortableItems = [...filteredData];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [filteredData, sortConfig]);

    const requestSort = (key: keyof T) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortIndicator = (key: keyof T) => {
        if (!sortConfig || sortConfig.key !== key) return null;
        return sortConfig.direction === 'ascending' ? ' ▲' : ' ▼';
    };

    return (
        <Card title={title}>
            <div className="p-4">
                <input
                    type="text"
                    placeholder="Search table..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="w-full md:w-1/3 bg-gray-700/50 p-2 rounded text-white mb-4 placeholder-gray-400"
                />
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-400">
                    <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                        <tr>
                            {columns.map(col => (
                                <th key={String(col.accessor)} className="px-6 py-3 cursor-pointer" onClick={() => col.sortable && requestSort(col.accessor)}>
                                    {col.header}
                                    {col.sortable && getSortIndicator(col.accessor)}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {sortedData.map(item => (
                            <tr key={item.id} className="border-b border-gray-800 hover:bg-gray-800/50 cursor-pointer" onClick={() => onRowClick && onRowClick(item)}>
                                {columns.map(col => (
                                    <td key={String(col.accessor)} className="px-6 py-4">
                                        {col.cell ? col.cell(item[col.accessor]) : String(item[col.accessor])}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
             {sortedData.length === 0 && <p className="text-center p-4 text-gray-500">No data matches your criteria.</p>}
        </Card>
    );
}

// Interactive SVG Map Component
export const InteractiveMapView: React.FC<{ shipments: Shipment[]; suppliers: Supplier[] }> = ({ shipments, suppliers }) => {
    const [tooltip, setTooltip] = useState<{ x: number, y: number, content: string } | null>(null);
    const svgRef = useRef<SVGSVGElement>(null);

    const worldWidth = 1000;
    const worldHeight = 500;

    const project = useCallback((lat: number, lng: number) => {
        const x = (lng + 180) * (worldWidth / 360);
        const latRad = lat * Math.PI / 180;
        const mercN = Math.log(Math.tan((Math.PI / 4) + (latRad / 2)));
        const y = (worldHeight / 2) - (worldWidth * mercN / (2 * Math.PI));
        return { x, y };
    }, [worldHeight, worldWidth]);

    const handleMouseOver = (e: React.MouseEvent, content: string) => {
         if (svgRef.current) {
            const CTM = svgRef.current.getScreenCTM();
            if (CTM) {
                const x = (e.clientX - CTM.e) / CTM.a;
                const y = (e.clientY - CTM.f) / CTM.d;
                setTooltip({ x: x + 10, y: y, content });
            }
        }
    };

    return (
        <Card title="Global Operations Map">
            <div className="relative w-full h-96 bg-gray-800 rounded-b-lg overflow-hidden">
                <svg ref={svgRef} viewBox={`0 0 ${worldWidth} ${worldHeight}`} className="w-full h-full">
                    {/* A simple world map background */}
                    <rect width={worldWidth} height={worldHeight} fill="#374151" />
                    <path d="M..." fill="#4B5563" /> {/* Placeholder for actual map path data */}
                    
                    {/* Render suppliers */}
                    {suppliers.map(supplier => {
                        const { x, y } = project(supplier.location.lat, supplier.location.lng);
                        return (
                            <circle
                                key={supplier.id}
                                cx={x}
                                cy={y}
                                r="4"
                                fill="#f59e0b"
                                className="cursor-pointer"
                                onMouseMove={(e) => handleMouseOver(e, `Supplier: ${supplier.name}`)}
                                onMouseLeave={() => setTooltip(null)}
                            />
                        );
                    })}

                    {/* Render shipment routes */}
                    {shipments.filter(s => s.status === ShipmentStatus.IN_TRANSIT).slice(0, 10).map(shipment => {
                        const origin = project(shipment.origin.lat, shipment.origin.lng);
                        const dest = project(shipment.destination.lat, shipment.destination.lng);
                        const midX = (origin.x + dest.x) / 2;
                        const midY = (origin.y + dest.y) / 2 - 50;

                        return (
                            <g key={shipment.id}>
                                <path
                                    d={`M${origin.x},${origin.y} Q${midX},${midY} ${dest.x},${dest.y}`}
                                    stroke="#06b6d4"
                                    strokeWidth="1"
                                    fill="none"
                                    strokeDasharray="4 2"
                                    className="animate-pulse"
                                />
                                <circle cx={origin.x} cy={origin.y} r="2" fill="#fff" />
                                <circle cx={dest.x} cy={dest.y} r="2" fill="#fff" />
                            </g>
                        );
                    })}
                    
                     {tooltip && (
                        <g transform={`translate(${tooltip.x}, ${tooltip.y})`}>
                            <rect x="0" y="0" width={tooltip.content.length * 7 + 10} height="25" rx="4" fill="rgba(0,0,0,0.7)" />
                            <text x="5" y="17" fill="#fff" fontSize="12">{tooltip.content}</text>
                        </g>
                    )}
                </svg>
            </div>
        </Card>
    );
};

// Shipment Detail Drawer
export const ShipmentDetailDrawer: React.FC<{ shipment: Shipment; onClose: () => void }> = ({ shipment, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/70 flex justify-end z-50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-gray-800 w-full max-w-2xl h-full shadow-2xl border-l border-gray-700 overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-700 flex justify-between items-center sticky top-0 bg-gray-800/80 backdrop-blur-sm">
                    <h3 className="text-xl font-semibold text-white">Shipment Details: <span className="font-mono">{shipment.id}</span></h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
                </div>
                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <InfoItem label="Status" value={shipment.status} valueClassName={getStatusChipColor(shipment.status)} isChip />
                        <InfoItem label="Risk Level" value={shipment.riskLevel} valueClassName={getRiskChipColor(shipment.riskLevel)} isChip />
                        <InfoItem label="Origin" value={`${shipment.origin.city}, ${shipment.origin.country}`} />
                        <InfoItem label="Destination" value={`${shipment.destination.city}, ${shipment.destination.country}`} />
                        <InfoItem label="Carrier" value={shipment.carrier} />
                        <InfoItem label="Carrier Type" value={shipment.carrierType} />
                        <InfoItem label="Total Value" value={formatCurrency(shipment.totalValue)} />
                        <InfoItem label="Total Weight" value={`${shipment.totalWeightKg.toFixed(2)} kg`} />
                        <InfoItem label="Estimated Delivery" value={formatDate(shipment.estimatedDeliveryDate)} />
                        <InfoItem label="Assigned Agent" value={shipment.assignedAgent} />
                    </div>
                    
                    <Card title="Items in Shipment">
                        <ul>
                            {shipment.items.map(item => (
                                <li key={item.product.sku} className="flex justify-between items-center p-2 border-b border-gray-700 last:border-none">
                                    <div>
                                        <p className="text-white font-medium">{item.product.name}</p>
                                        <p className="text-xs text-gray-400">SKU: {item.product.sku}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-white">{item.quantity} units</p>
                                        <p className="text-xs text-gray-400">{formatCurrency(item.totalValue)}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </Card>

                     <Card title="Compliance Documents">
                        <ul className="space-y-2">
                            {shipment.documents.map(doc => (
                                <li key={doc.id} className="flex items-center justify-between p-2 bg-gray-900/50 rounded">
                                    <span className="text-white">{doc.type}</span>
                                    <span className={`px-2 py-1 text-xs rounded-full ${doc.status === 'Verified' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>{doc.status}</span>
                                    <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline text-sm">View</a>
                                </li>
                            ))}
                        </ul>
                    </Card>

                    <Card title="Tracking History">
                        <div className="relative pl-4 border-l border-gray-600">
                            {shipment.trackingHistory.map((event, index) => (
                                <div key={index} className="mb-6 ml-4">
                                    <div className="absolute w-3 h-3 bg-cyan-500 rounded-full -left-1.5 border border-gray-800"></div>
                                    <time className="text-xs font-normal leading-none text-gray-400">{formatDate(event.timestamp, { hour: '2-digit', minute: '2-digit' })}</time>
                                    <h3 className="text-lg font-semibold text-white">{event.status} at {event.location}</h3>
                                    <p className="text-base font-normal text-gray-400">{event.details}</p>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export const InfoItem: React.FC<{ label: string; value: string; valueClassName?: string; isChip?: boolean }> = ({ label, value, valueClassName, isChip }) => (
    <div className="bg-gray-700/50 p-3 rounded-lg">
        <p className="text-sm text-gray-400">{label}</p>
        {isChip ? (
            <span className={`px-2 py-1 text-xs rounded-full mt-1 inline-block ${valueClassName}`}>{value}</span>
        ) : (
            <p className={`text-white font-semibold ${valueClassName}`}>{value}</p>
        )}
    </div>
);

// Main Application View
const DemoBankSupplyChainView: React.FC = () => {
    return (
        <AppStateProvider>
            <SupplyChainDashboard />
        </AppStateProvider>
    );
};

export const SupplyChainDashboard: React.FC = () => {
    const { state, dispatch } = useAppState();
    const [isRiskModalOpen, setRiskModalOpen] = useState(false);
    const [supplierInfo, setSupplierInfo] = useState({ name: 'Quantum Chips Co.', country: 'Taiwan' });
    const [riskReport, setRiskReport] = useState('');
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);
    
    const selectedShipment = useMemo(() => {
        return state.shipments.find(s => s.id === state.selectedShipmentId) || null;
    }, [state.shipments, state.selectedShipmentId]);

    useEffect(() => {
        const loadData = async () => {
            dispatch({ type: 'FETCH_START' });
            try {
                const data = await supplyChainApi.fetchDashboardData();
                dispatch({ type: 'FETCH_SUCCESS', payload: data });
                dispatch({ type: 'ADD_NOTIFICATION', payload: { message: 'Dashboard data loaded successfully.', type: 'info' } });
            } catch (err) {
                const error = err as Error;
                dispatch({ type: 'FETCH_ERROR', payload: error.message });
                 dispatch({ type: 'ADD_NOTIFICATION', payload: { message: `Failed to load data: ${error.message}`, type: 'error' } });
            }
        };
        loadData();
    }, [dispatch]);


    const handleGenerateReport = async () => {
        setIsGeneratingReport(true);
        setRiskReport('');
        dispatch({ type: 'ADD_NOTIFICATION', payload: { message: `Generating risk report for ${supplierInfo.name}...`, type: 'info' } });
        try {
            // NOTE: The API_KEY should be handled securely on a backend, never exposed on the client.
            // This is for demonstration purposes only.
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const prompt = `Generate a detailed supplier risk report for "${supplierInfo.name}" based in "${supplierInfo.country}". Cover the following sections with detailed bullet points under each:
            1.  **Geopolitical Risks:** (e.g., trade tensions, regional stability, government policies)
            2.  **Logistical Challenges:** (e.g., port congestion, infrastructure quality, weather patterns, customs delays)
            3.  **Financial Stability Factors:** (e.g., market position, reliance on specific industries, credit outlook)
            4.  **Operational Risks:** (e.g., labor disputes, quality control history, production capacity)
            5.  **Mitigation Strategies:** (Provide 3 actionable recommendations for the bank to mitigate these risks).
            Format the response clearly with markdown headings.`;
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
            setRiskReport(response.text);
        } catch (error) {
            setRiskReport("Error: Could not generate risk report. The API key might be missing or invalid. Please check your environment variables.");
            dispatch({ type: 'ADD_NOTIFICATION', payload: { message: 'Failed to generate AI risk report.', type: 'error' } });
        } finally {
            setIsGeneratingReport(false);
        }
    };
    
    const handleRowClick = useCallback((shipment: Shipment) => {
        dispatch({ type: 'SELECT_SHIPMENT', payload: shipment.id });
    }, [dispatch]);

    const handleCloseDrawer = useCallback(() => {
        dispatch({ type: 'SELECT_SHIPMENT', payload: null });
    }, [dispatch]);

    const summaryMetrics = useMemo(() => {
        const onTime = state.shipments.filter(s => s.status === 'Delivered' && s.actualDeliveryDate && s.estimatedDeliveryDate && new Date(s.actualDeliveryDate) <= new Date(s.estimatedDeliveryDate)).length;
        const totalDelivered = state.shipments.filter(s => s.status === 'Delivered').length;
        return {
            activeShipments: state.shipments.filter(s => s.status === 'In Transit' || s.status === 'Customs Clearance').length,
            onTimeDelivery: totalDelivered > 0 ? ((onTime / totalDelivered) * 100).toFixed(0) : '100',
            delayedShipments: state.shipments.filter(s => s.status === 'Delayed').length,
        }
    }, [state.shipments]);

    const shipmentTableColumns: Column<Shipment>[] = [
        { accessor: 'id', header: 'ID', sortable: true, cell: (id) => <span className="font-mono text-white">{id}</span> },
        { accessor: 'origin', header: 'Origin', sortable: true, cell: (loc) => `${(loc as Geolocation).city}, ${(loc as Geolocation).country}` },
        { accessor: 'destination', header: 'Destination', sortable: true, cell: (loc) => `${(loc as Geolocation).city}, ${(loc as Geolocation).country}` },
        { accessor: 'status', header: 'Status', sortable: true, cell: (status) => <span className={`px-2 py-1 text-xs rounded-full ${getStatusChipColor(status as ShipmentStatus)}`}>{status}</span> },
        { accessor: 'riskLevel', header: 'Risk', sortable: true, cell: (risk) => <span className={`px-2 py-1 text-xs rounded-full ${getRiskChipColor(risk as RiskLevel)}`}>{risk}</span> },
        { accessor: 'estimatedDeliveryDate', header: 'ETA', sortable: true, cell: (date) => formatDate(date as string) },
    ];


    if (state.isLoading) {
        return <div className="flex items-center justify-center h-screen"><div className="text-white text-2xl">Loading Supply Chain Data...</div></div>
    }

    if (state.error) {
        return <div className="flex items-center justify-center h-screen"><div className="text-red-400 text-2xl">Error: {state.error}</div></div>
    }
    
    return (
        <>
            <div className="space-y-6">
                 <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold text-white tracking-wider">Demo Bank Supply Chain</h2>
                     <button onClick={() => setRiskModalOpen(true)} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium transition-colors">AI Supplier Risk Report</button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="text-center"><p className="text-3xl font-bold text-white">{summaryMetrics.activeShipments}</p><p className="text-sm text-gray-400 mt-1">Active Shipments</p></Card>
                    <Card className="text-center"><p className="text-3xl font-bold text-white">{summaryMetrics.onTimeDelivery}%</p><p className="text-sm text-gray-400 mt-1">On-Time Delivery</p></Card>
                    <Card className="text-center"><p className="text-3xl font-bold text-white">{summaryMetrics.delayedShipments}</p><p className="text-sm text-gray-400 mt-1">Delayed Shipments</p></Card>
                </div>
                
                <InteractiveMapView shipments={state.shipments} suppliers={state.suppliers} />

                <AdvancedDataTable
                    title="Live Shipments"
                    columns={shipmentTableColumns}
                    data={state.shipments}
                    onRowClick={handleRowClick}
                />

            </div>

            {selectedShipment && <ShipmentDetailDrawer shipment={selectedShipment} onClose={handleCloseDrawer} />}

            {isRiskModalOpen && (
                 <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={() => setRiskModalOpen(false)}>
                    <div className="bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full border border-gray-700" onClick={e=>e.stopPropagation()}>
                        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-white">AI Supplier Risk Report</h3>
                            <button onClick={() => setRiskModalOpen(false)} className="text-gray-400 hover:text-white">&times;</button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex gap-4">
                                <input type="text" value={supplierInfo.name} onChange={e => setSupplierInfo(p => ({...p, name: e.target.value}))} placeholder="Supplier Name" className="w-full bg-gray-700/50 p-2 rounded text-white placeholder-gray-400" />
                                <input type="text" value={supplierInfo.country} onChange={e => setSupplierInfo(p => ({...p, country: e.target.value}))} placeholder="Country" className="w-full bg-gray-700/50 p-2 rounded text-white placeholder-gray-400" />
                            </div>
                            <button onClick={handleGenerateReport} disabled={isGeneratingReport} className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors">{isGeneratingReport ? 'Generating...' : 'Generate Report'}</button>
                            <Card title="Generated Report">
                                <div className="min-h-[10rem] max-h-96 overflow-y-auto text-sm text-gray-300 whitespace-pre-line prose prose-invert max-w-none p-4">
                                    {isGeneratingReport ? <span className="animate-pulse">Generating comprehensive analysis...</span> : riskReport || <span className="text-gray-500">Report will appear here.</span>}
                                </div>
                            </Card>
                        </div>
                    </div>
                 </div>
            )}
        </>
    );
};

export default DemoBankSupplyChainView;
