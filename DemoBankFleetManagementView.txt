// components/views/platform/DemoBankFleetManagementView.tsx
import React, { useState, useEffect, useMemo, useCallback, useRef, useReducer, createContext, useContext } from 'react';
import Card from '../../Card';
import { GoogleGenAI, Type } from "@google/genai";

// SECTION 1: TYPES & INTERFACES =======================================================

export type VehicleStatus = 'idle' | 'en_route' | 'at_stop' | 'maintenance' | 'offline';
export type VehicleType = 'armored_truck' | 'courier_van' | 'sedan' | 'motorcycle';
export type DriverStatus = 'on_duty' | 'off_duty' | 'on_break';
export type MaintenanceStatus = 'scheduled' | 'in_progress' | 'completed' | 'overdue';
export type AlertType = 'speeding' | 'geofence_exit' | 'harsh_braking' | 'engine_fault' | 'panic_button';
export type ViewType = 'dashboard' | 'vehicles' | 'drivers' | 'routes' | 'tracking' | 'maintenance' | 'analytics' | 'alerts';

export interface Address {
    street: string;
    city: string;
    state: string;
    zip: string;
}

export interface Coordinates {
    lat: number;
    lng: number;
}

export interface Stop extends Coordinates {
    id: string;
    name: string;
    address: string;
    type: 'pickup' | 'delivery' | 'service' | 'depot';
    timeWindow?: { start: string; end: string };
    completed: boolean;
}

export interface Route {
    id: string;
    name: string;
    stops: Stop[];
    vehicleId: string | null;
    driverId: string | null;
    startTime: string;
    estimatedEndTime: string;
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    distance: number; // in kilometers
}

export interface Vehicle {
    id: string;
    make: string;
    model: string;
    year: number;
    licensePlate: string;
    vin: string;
    type: VehicleType;
    status: VehicleStatus;
    driverId: string | null;
    currentRouteId: string | null;
    location: Coordinates;
    fuelLevel: number; // percentage
    odometer: number; // in kilometers
    nextMaintenance: string; // ISO date string
    telemetry: {
        speed: number; // km/h
        engineTemp: number; // Celsius
        oilPressure: number; // kPa
    };
}

export interface Driver {
    id: string;
    name: string;
    employeeId: string;
    licenseNumber: string;
    phone: string;
    email: string;
    status: DriverStatus;
    assignedVehicleId: string | null;
    performance: {
        safetyScore: number; // out of 100
        onTimeRate: number; // percentage
        efficiencyScore: number; // out of 100
    };
}

export interface MaintenanceRecord {
    id: string;
    vehicleId: string;
    date: string;
    odometer: number;
    type: 'routine' | 'repair' | 'inspection';
    description: string;
    cost: number;
    status: MaintenanceStatus;
}

export interface Alert {
    id: string;
    timestamp: string;
    type: AlertType;
    vehicleId: string;
    driverId: string | null;
    location: Coordinates;
    details: string;
    isAcknowledged: boolean;
}

export interface FleetState {
    vehicles: Vehicle[];
    drivers: Driver[];
    routes: Route[];
    stops: Stop[];
    maintenanceRecords: MaintenanceRecord[];
    alerts: Alert[];
}

export type FleetAction =
    | { type: 'SET_INITIAL_STATE'; payload: FleetState }
    | { type: 'UPDATE_VEHICLE'; payload: Partial<Vehicle> & { id: string } }
    | { type: 'ADD_VEHICLE'; payload: Vehicle }
    | { type: 'REMOVE_VEHICLE'; payload: string } // ID
    | { type: 'UPDATE_DRIVER'; payload: Partial<Driver> & { id: string } }
    | { type: 'ADD_DRIVER'; payload: Driver }
    | { type: 'REMOVE_DRIVER'; payload: string } // ID
    | { type: 'UPDATE_ROUTE'; payload: Partial<Route> & { id: string } }
    | { type: 'ADD_ROUTE'; payload: Route }
    | { type: 'REMOVE_ROUTE'; payload: string } // ID
    | { type: 'ADD_MAINTENANCE'; payload: MaintenanceRecord }
    | { type: 'UPDATE_MAINTENANCE'; payload: Partial<MaintenanceRecord> & { id: string } }
    | { type: 'CREATE_ALERT'; payload: Alert }
    | { type: 'ACKNOWLEDGE_ALERT'; payload: string }; // ID

// SECTION 2: MOCK DATA & SIMULATION CONSTANTS ==========================================

export const SIMULATION_TICK_RATE_MS = 2000;
export const MAP_BOUNDS = {
    minLat: 34.0, maxLat: 34.1,
    minLng: -118.5, maxLng: -118.2,
};

const firstNames = ['John', 'Jane', 'Peter', 'Susan', 'Michael', 'Emily', 'Chris', 'Jessica'];
const lastNames = ['Smith', 'Doe', 'Jones', 'Williams', 'Brown', 'Davis', 'Miller', 'Wilson'];
const vehicleMakes = {
    armored_truck: ['Brinks', 'Garda', 'Loomis'],
    courier_van: ['Ford', 'Mercedes-Benz', 'RAM'],
    sedan: ['Toyota', 'Honda', 'Ford'],
    motorcycle: ['Harley-Davidson', 'Honda', 'BMW']
};
const vehicleModels = {
    armored_truck: ['Defender', 'Cash-In-Transit', 'Bullion'],
    courier_van: ['Transit', 'Sprinter', 'ProMaster'],
    sedan: ['Camry', 'Accord', 'Fusion'],
    motorcycle: ['Street Glide', 'Gold Wing', 'R 1250 RT']
};
const streetNames = ['Main St', 'Oak Ave', 'Pine Ln', 'Maple Dr', 'Elm St', 'Cedar Blvd'];
const cities = ['Los Angeles', 'Santa Monica', 'Beverly Hills', 'Culver City'];

export const generateId = (prefix: string = 'id'): string => `${prefix}_${new Date().getTime()}_${Math.random().toString(36).substr(2, 9)}`;

export const getRandomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export const getRandomNumber = (min: number, max: number, decimals: number = 0): number => {
    const str = (Math.random() * (max - min) + min).toFixed(decimals);
    return parseFloat(str);
};

export const generateMockAddress = (): Address => ({
    street: `${getRandomNumber(100, 9999)} ${getRandomElement(streetNames)}`,
    city: getRandomElement(cities),
    state: 'CA',
    zip: `${getRandomNumber(90001, 90210)}`,
});

export const generateMockCoordinates = (): Coordinates => ({
    lat: getRandomNumber(MAP_BOUNDS.minLat, MAP_BOUNDS.maxLat, 6),
    lng: getRandomNumber(MAP_BOUNDS.minLng, MAP_BOUNDS.maxLng, 6),
});

export const generateMockStops = (count: number): Stop[] => {
    return Array.from({ length: count }, (_, i) => {
        const address = generateMockAddress();
        return {
            id: generateId('stop'),
            name: i === 0 ? 'Demo Bank HQ' : `Client #${i}`,
            address: `${address.street}, ${address.city}`,
            ...generateMockCoordinates(),
            type: getRandomElement(['pickup', 'delivery', 'service']),
            completed: false,
        };
    });
};

export const generateMockDrivers = (count: number): Driver[] => {
    return Array.from({ length: count }, () => ({
        id: generateId('driver'),
        name: `${getRandomElement(firstNames)} ${getRandomElement(lastNames)}`,
        employeeId: `DB-${getRandomNumber(1000, 9999)}`,
        licenseNumber: `D${getRandomNumber(1000000, 9999999)}`,
        phone: `(555) ${getRandomNumber(100, 999)}-${getRandomNumber(1000, 9999)}`,
        email: `${name.toLowerCase().replace(' ', '.')}@demobank.com`,
        status: getRandomElement(['on_duty', 'off_duty', 'on_break']),
        assignedVehicleId: null,
        performance: {
            safetyScore: getRandomNumber(85, 99),
            onTimeRate: getRandomNumber(92, 99.5, 1),
            efficiencyScore: getRandomNumber(88, 98),
        },
    }));
};

export const generateMockVehicles = (count: number): Vehicle[] => {
    return Array.from({ length: count }, () => {
        const type = getRandomElement(Object.keys(vehicleMakes) as VehicleType[]);
        const make = getRandomElement(vehicleMakes[type]);
        const model = getRandomElement(vehicleModels[type]);
        const year = getRandomNumber(2018, 2024);

        return {
            id: generateId('vehicle'),
            make,
            model,
            year,
            licensePlate: `${getRandomNumber(100, 999)} ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
            vin: generateId('VIN').toUpperCase(),
            type,
            status: 'idle',
            driverId: null,
            currentRouteId: null,
            location: generateMockCoordinates(),
            fuelLevel: getRandomNumber(30, 100),
            odometer: getRandomNumber(10000, 80000),
            nextMaintenance: new Date(Date.now() + getRandomNumber(1, 60) * 24 * 60 * 60 * 1000).toISOString(),
            telemetry: {
                speed: 0,
                engineTemp: 25,
                oilPressure: 300,
            },
        };
    });
};

export const generateMockMaintenance = (vehicles: Vehicle[], count: number): MaintenanceRecord[] => {
    return Array.from({ length: count }, () => {
        const vehicle = getRandomElement(vehicles);
        const date = new Date(Date.now() - getRandomNumber(0, 365) * 24 * 60 * 60 * 1000).toISOString();
        return {
            id: generateId('maint'),
            vehicleId: vehicle.id,
            date,
            odometer: vehicle.odometer - getRandomNumber(100, 5000),
            type: getRandomElement(['routine', 'repair', 'inspection']),
            description: getRandomElement(['Oil change', 'Tire rotation', 'Brake replacement', 'Annual inspection']),
            cost: getRandomNumber(100, 2500, 2),
            status: 'completed',
        };
    });
};

export const generateInitialState = (): FleetState => {
    const vehicles = generateMockVehicles(50);
    const drivers = generateMockDrivers(60);
    const stops = generateMockStops(200);
    
    // Assign some drivers to vehicles
    vehicles.slice(0, 40).forEach((v, i) => {
        if (drivers[i]) {
            v.driverId = drivers[i].id;
            drivers[i].assignedVehicleId = v.id;
            drivers[i].status = 'on_duty';
        }
    });

    const maintenanceRecords = generateMockMaintenance(vehicles, 150);
    const routes: Route[] = []; // Routes will be generated on demand
    const alerts: Alert[] = []; // Alerts will be generated by the simulator

    return { vehicles, drivers, routes, stops, maintenanceRecords, alerts };
};


// SECTION 3: UTILITY & HELPER FUNCTIONS ================================================

/**
 * Formats an ISO date string into a more readable format.
 * @param dateString - The ISO date string.
 * @param options - Formatting options.
 * @returns A formatted date string.
 */
export const formatDate = (dateString: string, options: Intl.DateTimeFormatOptions = {}): string => {
    const defaultOptions: Intl.DateTimeFormatOptions = {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
    };
    try {
        return new Intl.DateTimeFormat('en-US', { ...defaultOptions, ...options }).format(new Date(dateString));
    } catch (e) {
        return 'Invalid Date';
    }
};

/**
 * Calculates the great-circle distance between two points on the Earth.
 * @param coord1 - The first coordinate.
 * @param coord2 - The second coordinate.
 * @returns The distance in kilometers.
 */
export const calculateDistance = (coord1: Coordinates, coord2: Coordinates): number => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
    const dLon = (coord2.lng - coord1.lng) * Math.PI / 180;
    const a =
        0.5 - Math.cos(dLat) / 2 +
        Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) *
        (1 - Math.cos(dLon)) / 2;
    return R * 2 * Math.asin(Math.sqrt(a));
};

/**
 * Formats a vehicle type string for display.
 * @param type - The vehicle type.
 * @returns A user-friendly string.
 */
export const formatVehicleType = (type: VehicleType): string => {
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
};

/**
 * Truncates a string to a specified length.
 * @param str - The string to truncate.
 * @param length - The maximum length.
 * @returns The truncated string.
 */
export const truncate = (str: string, length: number): string => {
    return str.length > length ? `${str.substring(0, length)}...` : str;
};

// SECTION 4: STATE MANAGEMENT (Reducer) =================================================

export const fleetReducer = (state: FleetState, action: FleetAction): FleetState => {
    switch (action.type) {
        case 'SET_INITIAL_STATE':
            return action.payload;
        case 'UPDATE_VEHICLE':
            return {
                ...state,
                vehicles: state.vehicles.map(v => v.id === action.payload.id ? { ...v, ...action.payload } : v),
            };
        case 'ADD_VEHICLE':
            return { ...state, vehicles: [...state.vehicles, action.payload] };
        case 'REMOVE_VEHICLE':
            return { ...state, vehicles: state.vehicles.filter(v => v.id !== action.payload) };
        case 'UPDATE_DRIVER':
            return {
                ...state,
                drivers: state.drivers.map(d => d.id === action.payload.id ? { ...d, ...action.payload } : d),
            };
        case 'ADD_DRIVER':
            return { ...state, drivers: [...state.drivers, action.payload] };
        case 'REMOVE_DRIVER':
            return { ...state, drivers: state.drivers.filter(d => d.id !== action.payload) };
        case 'ADD_ROUTE':
            return { ...state, routes: [...state.routes, action.payload] };
        case 'UPDATE_ROUTE':
            return {
                ...state,
                routes: state.routes.map(r => r.id === action.payload.id ? { ...r, ...action.payload } : r),
            };
        case 'REMOVE_ROUTE':
            return { ...state, routes: state.routes.filter(r => r.id !== action.payload) };
        case 'ADD_MAINTENANCE':
            return { ...state, maintenanceRecords: [action.payload, ...state.maintenanceRecords] };
        case 'UPDATE_MAINTENANCE':
            return {
                ...state,
                maintenanceRecords: state.maintenanceRecords.map(m => m.id === action.payload.id ? { ...m, ...action.payload } : m),
            };
        case 'CREATE_ALERT':
            return { ...state, alerts: [action.payload, ...state.alerts].slice(0, 100) }; // Keep alerts list capped
        case 'ACKNOWLEDGE_ALERT':
            return {
                ...state,
                alerts: state.alerts.map(a => a.id === action.payload ? { ...a, isAcknowledged: true } : a),
            };
        default:
            return state;
    }
};

export const initialFleetState: FleetState = {
    vehicles: [],
    drivers: [],
    routes: [],
    stops: [],
    maintenanceRecords: [],
    alerts: [],
};

export const FleetContext = createContext<{ state: FleetState; dispatch: React.Dispatch<FleetAction> } | undefined>(undefined);

// SECTION 5: CUSTOM HOOKS ==============================================================

/**
 * A custom hook to manage the state of a modal dialog.
 * @returns An object with modal state and control functions.
 */
export const useModal = () => {
    const [isOpen, setIsOpen] = useState(false);
    const open = useCallback(() => setIsOpen(true), []);
    const close = useCallback(() => setIsOpen(false), []);
    return { isOpen, open, close };
};

/**
 * A custom hook for sorting table data.
 * @param items - The array of items to sort.
 * @param config - Initial sort configuration.
 * @returns An object with sorted items and sorting control functions.
 */
export const useSortableData = <T>(items: T[], config: { key: keyof T; direction: 'ascending' | 'descending' } | null = null) => {
    const [sortConfig, setSortConfig] = useState(config);

    const sortedItems = useMemo(() => {
        let sortableItems = [...items];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sort-config.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [items, sortConfig]);

    const requestSort = (key: keyof T) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    return { items: sortedItems, requestSort, sortConfig };
};

/**
 * Custom hook to simulate fleet activity.
 * @param dispatch - The reducer dispatch function.
 */
export const useFleetSimulator = (dispatch: React.Dispatch<FleetAction>, state: FleetState) => {
    const stateRef = useRef(state);
    stateRef.current = state;

    useEffect(() => {
        const tick = () => {
            const { vehicles, routes, drivers } = stateRef.current;
            if (vehicles.length === 0) return;

            vehicles.forEach(vehicle => {
                const route = routes.find(r => r.id === vehicle.currentRouteId && r.status === 'in_progress');
                if (route) {
                    const currentStopIndex = route.stops.findIndex(s => !s.completed);
                    if (currentStopIndex === -1) {
                        // Route completed
                        dispatch({ type: 'UPDATE_VEHICLE', payload: { id: vehicle.id, status: 'idle', currentRouteId: null, telemetry: { ...vehicle.telemetry, speed: 0 } } });
                        dispatch({ type: 'UPDATE_ROUTE', payload: { id: route.id, status: 'completed' } });
                        return;
                    }

                    const targetStop = route.stops[currentStopIndex];
                    const distanceToTarget = calculateDistance(vehicle.location, targetStop);
                    const speedKmsPerTick = (vehicle.telemetry.speed / 3600) * (SIMULATION_TICK_RATE_MS / 1000);

                    if (distanceToTarget < 0.1) { // Arrived at stop
                        dispatch({ type: 'UPDATE_VEHICLE', payload: { id: vehicle.id, status: 'at_stop', telemetry: { ...vehicle.telemetry, speed: 0 } } });
                        const updatedStops = route.stops.map((s, i) => i === currentStopIndex ? { ...s, completed: true } : s);
                        dispatch({ type: 'UPDATE_ROUTE', payload: { id: route.id, stops: updatedStops } });
                    } else {
                        // Move towards target
                        const newLat = vehicle.location.lat + (targetStop.lat - vehicle.location.lat) * (speedKmsPerTick / distanceToTarget);
                        const newLng = vehicle.location.lng + (targetStop.lng - vehicle.location.lng) * (speedKmsPerTick / distanceToTarget);
                        
                        const speed = getRandomNumber(40, 65);
                        const odometer = vehicle.odometer + speedKmsPerTick;
                        const fuelLevel = vehicle.fuelLevel - (speedKmsPerTick * 0.05); // Simple fuel model
                        
                        dispatch({
                            type: 'UPDATE_VEHICLE',
                            payload: {
                                id: vehicle.id,
                                location: { lat: newLat, lng: newLng },
                                status: 'en_route',
                                odometer,
                                fuelLevel,
                                telemetry: { ...vehicle.telemetry, speed, engineTemp: getRandomNumber(85, 95) }
                            }
                        });
                        
                        // Randomly generate alerts
                        if (Math.random() < 0.005) {
                            const alertType = getRandomElement<AlertType>(['speeding', 'harsh_braking', 'engine_fault']);
                            dispatch({
                                type: 'CREATE_ALERT',
                                payload: {
                                    id: generateId('alert'),
                                    timestamp: new Date().toISOString(),
                                    type: alertType,
                                    vehicleId: vehicle.id,
                                    driverId: vehicle.driverId,
                                    location: vehicle.location,
                                    details: alertType === 'speeding' ? `Vehicle exceeded speed limit. Speed: ${speed + 20} km/h` : `Event detected for vehicle ${vehicle.licensePlate}`,
                                    isAcknowledged: false,
                                }
                            });
                        }
                    }
                }
            });
        };

        const intervalId = setInterval(tick, SIMULATION_TICK_RATE_MS);
        return () => clearInterval(intervalId);
    }, [dispatch]);
};

// SECTION 6: UI COMPONENTS (Building blocks) ===========================================

export const StatusPill: React.FC<{ status: string }> = ({ status }) => {
    const colorClasses = {
        idle: 'bg-gray-500 text-gray-100',
        en_route: 'bg-blue-500 text-white',
        at_stop: 'bg-yellow-500 text-black',
        maintenance: 'bg-orange-500 text-white',
        offline: 'bg-red-700 text-white',
        on_duty: 'bg-green-500 text-white',
        off_duty: 'bg-gray-600 text-gray-200',
        on_break: 'bg-indigo-500 text-white',
        scheduled: 'bg-blue-400 text-white',
        in_progress: 'bg-yellow-400 text-black',
        completed: 'bg-green-600 text-white',
        overdue: 'bg-red-500 text-white',
        pending: 'bg-gray-400 text-black',
        cancelled: 'bg-red-600 text-white',
    }[status] || 'bg-gray-200 text-gray-800';

    return (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colorClasses}`}>
            {status.replace(/_/g, ' ').toUpperCase()}
        </span>
    );
};

export const VehicleIcon: React.FC<{ type: VehicleType, className?: string }> = ({ type, className }) => {
    const iconPath = {
        armored_truck: "M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2V8zM6 18c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm12 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zM3 6h10v6H3V6z",
        courier_van: "M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2V8zm-9 10c-1.66 0-3-1.34-3-3h14.55c.58-2.21-.79-4.5-3.05-4.5H11V6h7v2h-4v2h2v2h-2v2h2v2z",
        sedan: "M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11C5.84 5 5.28 5.42 5.08 6.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5S18.33 16 17.5 16zM5 11l1.5-4.5h11L19 11H5z",
        motorcycle: "M16.5 12c1.38 0 2.5 1.12 2.5 2.5s-1.12 2.5-2.5 2.5-2.5-1.12-2.5-2.5 1.12-2.5 2.5-2.5M9 12c1.38 0 2.5 1.12 2.5 2.5S10.38 17 9 17s-2.5-1.12-2.5-2.5S7.62 12 9 12m12.48-3.41c-.2-.49-.71-.8-1.23-.8H18v-2h-2v2h-4V6H5c-1.1 0-2 .9-2 2v7h2c0 1.66 1.34 3 3 3s3-1.34 3-3h4c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-3.4l-1.52-4.59z",
    }[type];

    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
            <path d={iconPath}></path>
        </svg>
    );
};

export const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center" onClick={onClose}>
            <div className="bg-gray-800 text-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-700 flex justify-between items-center sticky top-0 bg-gray-800">
                    <h3 className="text-xl font-bold">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
                </div>
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};

export const DataTable: React.FC<{ columns: { key: string; header: string }[]; data: any[]; onRowClick?: (row: any) => void; renderCell?: (item: any, columnKey: string) => React.ReactNode }> = ({ columns, data, onRowClick, renderCell }) => {
    const { items, requestSort, sortConfig } = useSortableData(data);

    const getSortDirectionFor = (key: string) => {
        if (!sortConfig) return;
        return sortConfig.key === key ? sortConfig.direction : undefined;
    };

    return (
        <div className="overflow-x-auto bg-gray-800 rounded-lg">
            <table className="w-full text-sm text-left text-gray-300">
                <thead className="text-xs text-gray-400 uppercase bg-gray-700/50">
                    <tr>
                        {columns.map(col => (
                            <th key={col.key} scope="col" className="px-6 py-3">
                                <button onClick={() => requestSort(col.key)} className="flex items-center">
                                    {col.header}
                                    {getSortDirectionFor(col.key) === 'ascending' ? ' ▲' : getSortDirectionFor(col.key) === 'descending' ? ' ▼' : ''}
                                </button>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {items.map((item, index) => (
                        <tr key={item.id || index} onClick={() => onRowClick?.(item)} className={`border-b border-gray-700 hover:bg-gray-700 ${onRowClick ? 'cursor-pointer' : ''}`}>
                            {columns.map(col => (
                                <td key={col.key} className="px-6 py-4">
                                    {renderCell ? renderCell(item, col.key) : item[col.key]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export const BarChart: React.FC<{ data: { label: string; value: number }[]; title: string }> = ({ data, title }) => {
    const maxValue = Math.max(...data.map(d => d.value));
    const chartHeight = 200;
    const barWidth = 30;
    const barMargin = 10;
    const width = data.length * (barWidth + barMargin);

    return (
        <Card title={title}>
            <div className="overflow-x-auto p-4">
                <svg width={width} height={chartHeight + 40} className="text-gray-400">
                    {data.map((d, i) => {
                        const barHeight = (d.value / maxValue) * chartHeight;
                        const x = i * (barWidth + barMargin);
                        const y = chartHeight - barHeight;
                        return (
                            <g key={d.label}>
                                <rect x={x} y={y} width={barWidth} height={barHeight} className="fill-cyan-500" />
                                <text x={x + barWidth / 2} y={chartHeight + 15} textAnchor="middle" className="text-xs fill-current">{d.label}</text>
                                <text x={x + barWidth / 2} y={y - 5} textAnchor="middle" className="text-xs fill-white font-bold">{d.value}</text>
                            </g>
                        );
                    })}
                    <line x1="0" y1={chartHeight} x2={width} y2={chartHeight} stroke="currentColor" />
                </svg>
            </div>
        </Card>
    );
};

export const PieChart: React.FC<{ data: { label: string; value: number, color: string }[]; title: string }> = ({ data, title }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let cumulativePercent = 0;

    const getCoordinatesForPercent = (percent: number) => {
        const x = Math.cos(2 * Math.PI * percent);
        const y = Math.sin(2 * Math.PI * percent);
        return [x, y];
    };

    return (
        <Card title={title}>
            <div className="flex items-center justify-around p-4">
                <svg viewBox="-1 -1 2 2" width="200" height="200" style={{ transform: 'rotate(-90deg)' }}>
                    {data.map(item => {
                        const percent = item.value / total;
                        const [startX, startY] = getCoordinatesForPercent(cumulativePercent);
                        cumulativePercent += percent;
                        const [endX, endY] = getCoordinatesForPercent(cumulativePercent);
                        const largeArcFlag = percent > 0.5 ? 1 : 0;
                        const pathData = `M ${startX} ${startY} A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY} L 0 0`;
                        return <path key={item.label} d={pathData} fill={item.color} />;
                    })}
                </svg>
                <div className="text-sm">
                    {data.map(item => (
                        <div key={item.label} className="flex items-center mb-2">
                            <span className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: item.color }}></span>
                            <span>{item.label}: {item.value} ({((item.value / total) * 100).toFixed(1)}%)</span>
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    );
};

// SECTION 7: FEATURE COMPONENTS ========================================================

export const DashboardView: React.FC = () => {
    const { state } = useContext(FleetContext)!;
    const { vehicles, drivers, routes, alerts } = state;

    const metrics = useMemo(() => ({
        totalVehicles: vehicles.length,
        activeVehicles: vehicles.filter(v => v.status === 'en_route' || v.status === 'at_stop').length,
        idleVehicles: vehicles.filter(v => v.status === 'idle').length,
        inMaintenance: vehicles.filter(v => v.status === 'maintenance').length,
        activeRoutes: routes.filter(r => r.status === 'in_progress').length,
        onDutyDrivers: drivers.filter(d => d.status === 'on_duty').length,
        unacknowledgedAlerts: alerts.filter(a => !a.isAcknowledged).length,
    }), [vehicles, drivers, routes, alerts]);

    const vehicleStatusData = useMemo(() => {
        const statuses: { [key in VehicleStatus]: number } = { idle: 0, en_route: 0, at_stop: 0, maintenance: 0, offline: 0 };
        vehicles.forEach(v => statuses[v.status]++);
        return [
            { label: 'Idle', value: statuses.idle, color: '#6B7280' },
            { label: 'En Route', value: statuses.en_route, color: '#3B82F6' },
            { label: 'At Stop', value: statuses.at_stop, color: '#F59E0B' },
            { label: 'Maintenance', value: statuses.maintenance, color: '#F97316' },
            { label: 'Offline', value: statuses.offline, color: '#EF4444' },
        ];
    }, [vehicles]);

    const maintenanceData = useMemo(() => {
        const last7Days = Array.from({length: 7}, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toISOString().split('T')[0];
        }).reverse();
        
        return last7Days.map(day => ({
            label: new Date(day).toLocaleDateString('en-US', { weekday: 'short' }),
            value: state.maintenanceRecords.filter(m => m.date.startsWith(day) && m.status === 'completed').length,
        }));
    }, [state.maintenanceRecords]);

    const MetricCard: React.FC<{ title: string; value: number | string; }> = ({ title, value }) => (
        <div className="bg-gray-800/70 p-4 rounded-lg text-center">
            <p className="text-sm text-gray-400">{title}</p>
            <p className="text-3xl font-bold text-white">{value}</p>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricCard title="Active Vehicles" value={metrics.activeVehicles} />
                <MetricCard title="Idle Vehicles" value={metrics.idleVehicles} />
                <MetricCard title="Active Routes" value={metrics.activeRoutes} />
                <MetricCard title="Critical Alerts" value={metrics.unacknowledgedAlerts} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PieChart title="Vehicle Status" data={vehicleStatusData} />
                <BarChart title="Completed Maintenance (Last 7 Days)" data={maintenanceData} />
            </div>
            <div>
                <AlertsFeedView limit={5} />
            </div>
        </div>
    );
};

export const VehicleManagementView: React.FC = () => {
    const { state } = useContext(FleetContext)!;
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
    const { isOpen, open, close } = useModal();

    const handleRowClick = (vehicle: Vehicle) => {
        setSelectedVehicle(vehicle);
        open();
    };

    const columns = [
        { key: 'licensePlate', header: 'License Plate' },
        { key: 'type', header: 'Type' },
        { key: 'status', header: 'Status' },
        { key: 'driverId', header: 'Driver' },
        { key: 'fuelLevel', header: 'Fuel' },
        { key: 'odometer', header: 'Odometer (km)' },
    ];
    
    const renderCell = (item: Vehicle, columnKey: string) => {
        switch(columnKey) {
            case 'type':
                return formatVehicleType(item.type);
            case 'status':
                return <StatusPill status={item.status} />;
            case 'driverId':
                const driver = state.drivers.find(d => d.id === item.driverId);
                return driver ? driver.name : <span className="text-gray-500">Unassigned</span>;
            case 'fuelLevel':
                return `${item.fuelLevel.toFixed(1)}%`;
            default:
                return item[columnKey as keyof Vehicle];
        }
    };

    return (
        <div className="space-y-6">
            <Card title="Vehicle Fleet">
                <DataTable columns={columns} data={state.vehicles} onRowClick={handleRowClick} renderCell={renderCell} />
            </Card>
            <Modal isOpen={isOpen} onClose={close} title={`Vehicle Details - ${selectedVehicle?.licensePlate}`}>
                {selectedVehicle && (
                    <div className="space-y-4 text-sm">
                        <p><strong>Make/Model:</strong> {selectedVehicle.make} {selectedVehicle.model} ({selectedVehicle.year})</p>
                        <p><strong>VIN:</strong> {selectedVehicle.vin}</p>
                        <p><strong>Next Maintenance:</strong> {formatDate(selectedVehicle.nextMaintenance, { day: '2-digit', month: 'short', year: 'numeric'})}</p>
                        <h4 className="font-bold text-lg mt-4 border-b border-gray-600 pb-1">Live Telemetry</h4>
                        <div className="grid grid-cols-3 gap-4 p-4 bg-gray-900/50 rounded-lg">
                            <div className="text-center"><p className="text-xs text-gray-400">Speed</p><p className="font-mono text-xl">{selectedVehicle.telemetry.speed} km/h</p></div>
                            <div className="text-center"><p className="text-xs text-gray-400">Engine Temp</p><p className="font-mono text-xl">{selectedVehicle.telemetry.engineTemp}°C</p></div>
                            <div className="text-center"><p className="text-xs text-gray-400">Oil Pressure</p><p className="font-mono text-xl">{selectedVehicle.telemetry.oilPressure} kPa</p></div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export const DriverManagementView: React.FC = () => {
    const { state } = useContext(FleetContext)!;
    
    const columns = [
        { key: 'name', header: 'Name' },
        { key: 'employeeId', header: 'Employee ID' },
        { key: 'status', header: 'Status' },
        { key: 'assignedVehicleId', header: 'Vehicle' },
        { key: 'safetyScore', header: 'Safety Score' },
        { key: 'onTimeRate', header: 'On-Time Rate' },
    ];
    
    const renderCell = (item: Driver, columnKey: string) => {
        switch(columnKey) {
            case 'status':
                return <StatusPill status={item.status} />;
            case 'assignedVehicleId':
                const vehicle = state.vehicles.find(v => v.id === item.assignedVehicleId);
                return vehicle ? vehicle.licensePlate : <span className="text-gray-500">N/A</span>;
            case 'safetyScore':
                return `${item.performance.safetyScore}/100`;
            case 'onTimeRate':
                return `${item.performance.onTimeRate}%`;
            default:
                return item[columnKey as keyof Driver];
        }
    };

    return (
        <Card title="Drivers">
            <DataTable columns={columns} data={state.drivers} renderCell={renderCell} />
        </Card>
    );
};

export const RoutePlanningView: React.FC = () => {
    const { state, dispatch } = useContext(FleetContext)!;
    const [prompt, setPrompt] = useState("Warehouse A -> 123 Main St, Anytown -> 456 Oak Ave, Anytown -> 789 Pine Ln, Anytown -> Warehouse A");
    const [generatedRoute, setGeneratedRoute] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedVehicleId, setSelectedVehicleId] = useState('');
    const [routeName, setRouteName] = useState(`Daily Route ${new Date().toLocaleDateString()}`);

    const handleGenerate = async () => {
        setIsLoading(true);
        setGeneratedRoute(null);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const schema = {
                type: Type.OBJECT,
                properties: {
                    optimizedRoute: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                    },
                    estimatedTime: { type: Type.STRING },
                    estimatedDistance: { type: Type.STRING },
                }
            };
            const fullPrompt = `You are a logistics expert. Based on this list of stops, generate an optimized delivery route (re-ordering the stops between the start and end point), and provide a realistic estimated time and distance. Stops: "${prompt}".`;
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: fullPrompt, config: { responseMimeType: "application/json", responseSchema: schema } });
            setGeneratedRoute(JSON.parse(response.text));
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };
    
    const assignRoute = () => {
        if (!generatedRoute || !selectedVehicleId) {
            alert("Please generate a route and select a vehicle.");
            return;
        }
        
        const vehicle = state.vehicles.find(v => v.id === selectedVehicleId);
        if (!vehicle) return;

        const newRoute: Route = {
            id: generateId('route'),
            name: routeName,
            stops: generatedRoute.optimizedRoute.map((stopName: string, i: number) => ({
                id: generateId('stop'),
                name: stopName,
                address: stopName, // Simplified for this demo
                ...generateMockCoordinates(),
                type: 'delivery',
                completed: i === 0, // Assume start point is 'completed'
            })),
            vehicleId: selectedVehicleId,
            driverId: vehicle.driverId,
            startTime: new Date().toISOString(),
            estimatedEndTime: '', // Could be parsed from AI response
            status: 'in_progress',
            distance: parseFloat(generatedRoute.estimatedDistance) || 0,
        };
        
        dispatch({ type: 'ADD_ROUTE', payload: newRoute });
        dispatch({ type: 'UPDATE_VEHICLE', payload: { id: selectedVehicleId, status: 'en_route', currentRouteId: newRoute.id } });

        alert(`Route "${routeName}" assigned to vehicle ${vehicle.licensePlate}.`);
        setGeneratedRoute(null);
        setRouteName(`Daily Route ${new Date().toLocaleDateString()}`);
    };

    const availableVehicles = state.vehicles.filter(v => v.status === 'idle' && v.driverId);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
                <Card title="AI Route Optimizer">
                    <p className="text-gray-400 mb-4">Enter a list of delivery addresses or waypoints, separated by "->".</p>
                    <textarea
                        value={prompt}
                        onChange={e => setPrompt(e.target.value)}
                        className="w-full h-24 bg-gray-700/50 p-3 rounded text-white font-mono text-sm focus:ring-cyan-500 focus:border-cyan-500"
                    />
                    <button onClick={handleGenerate} disabled={isLoading} className="w-full mt-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded disabled:opacity-50 transition-colors">
                        {isLoading ? 'Optimizing...' : 'Generate Optimized Route'}
                    </button>
                </Card>

                {(isLoading || generatedRoute) && (
                     <Card title="Optimized Route">
                         <div className="space-y-4">
                            {isLoading ? <p>Optimizing...</p> : (
                                <>
                                    <div className="flex justify-around text-center p-4 bg-gray-900/50 rounded-lg">
                                        <div><p className="text-sm text-gray-400">Est. Time</p><p className="text-xl font-semibold text-white">{generatedRoute.estimatedTime}</p></div>
                                        <div><p className="text-sm text-gray-400">Est. Distance</p><p className="text-xl font-semibold text-white">{generatedRoute.estimatedDistance}</p></div>
                                    </div>
                                    <ol className="list-decimal list-inside text-gray-300 space-y-2 mt-4 p-2">
                                    {generatedRoute.optimizedRoute.map((stop: string, i: number) => <li key={i} className="font-mono">{stop}</li>)}
                                    </ol>
                                </>
                            )}
                         </div>
                    </Card>
                )}
            </div>
            
            <div className="space-y-6">
                 {generatedRoute && (
                     <Card title="Assign Route">
                         <div className="space-y-4">
                             <div>
                                <label htmlFor="routeName" className="block text-sm font-medium text-gray-300">Route Name</label>
                                <input type="text" id="routeName" value={routeName} onChange={e => setRouteName(e.target.value)} className="w-full bg-gray-700/50 p-2 mt-1 rounded text-white" />
                            </div>
                            <div>
                                <label htmlFor="vehicle" className="block text-sm font-medium text-gray-300">Assign to Vehicle</label>
                                <select id="vehicle" value={selectedVehicleId} onChange={e => setSelectedVehicleId(e.target.value)} className="w-full bg-gray-700/50 p-2 mt-1 rounded text-white">
                                    <option value="">Select a vehicle...</option>
                                    {availableVehicles.map(v => <option key={v.id} value={v.id}>{v.licensePlate} ({formatVehicleType(v.type)})</option>)}
                                </select>
                            </div>
                            <button onClick={assignRoute} disabled={!selectedVehicleId} className="w-full mt-4 py-2 bg-green-600 hover:bg-green-700 rounded disabled:opacity-50 transition-colors">
                                Assign and Dispatch
                            </button>
                         </div>
                     </Card>
                 )}
                <Card title="Active Routes">
                    {state.routes.filter(r => r.status === 'in_progress').length === 0 ? <p className="text-gray-400">No active routes.</p> : (
                        <ul className="space-y-3">
                            {state.routes.filter(r => r.status === 'in_progress').map(route => {
                                const vehicle = state.vehicles.find(v => v.id === route.vehicleId);
                                const progress = (route.stops.filter(s => s.completed).length / route.stops.length) * 100;
                                return (
                                    <li key={route.id} className="p-3 bg-gray-900/50 rounded-lg">
                                        <div className="flex justify-between items-center">
                                            <p className="font-bold">{route.name}</p>
                                            <p className="text-sm text-gray-400">{vehicle?.licensePlate}</p>
                                        </div>
                                        <div className="w-full bg-gray-700 rounded-full h-2.5 mt-2">
                                            <div className="bg-cyan-500 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                                        </div>
                                        <p className="text-xs text-right mt-1">{progress.toFixed(0)}% Complete</p>
                                    </li>
                                )
                            })}
                        </ul>
                    )}
                </Card>
            </div>
        </div>
    );
};

export const LiveTrackingView: React.FC = () => {
    const { state } = useContext(FleetContext)!;
    const mapRef = useRef<HTMLDivElement>(null);
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

    const getPositionOnMap = (coords: Coordinates) => {
        if (!mapRef.current) return { x: 0, y: 0 };
        const { width, height } = mapRef.current.getBoundingClientRect();
        const x = ((coords.lng - MAP_BOUNDS.minLng) / (MAP_BOUNDS.maxLng - MAP_BOUNDS.minLng)) * width;
        const y = ((MAP_BOUNDS.maxLat - coords.lat) / (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat)) * height;
        return { x, y };
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[80vh]">
            <div className="lg:col-span-2 h-full">
                 <Card title="Live Fleet Map" className="h-full flex flex-col">
                    <div ref={mapRef} className="flex-grow bg-gray-700 rounded-b-lg relative overflow-hidden">
                        {/* Map Background - placeholder */}
                        <div className="absolute inset-0 bg-[url('https://www.openstreetmap.org/assets/map/inventory-a111de03b9ac39a531e285e6878c187373f0043ff78a9c3904c66432070150ce.png')] opacity-20"></div>

                        {state.vehicles.filter(v => v.status !== 'offline').map(vehicle => {
                            const { x, y } = getPositionOnMap(vehicle.location);
                            return (
                                <div
                                    key={vehicle.id}
                                    className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-1000 ease-linear cursor-pointer"
                                    style={{ left: `${x}px`, top: `${y}px` }}
                                    onClick={() => setSelectedVehicle(vehicle)}
                                >
                                    <VehicleIcon type={vehicle.type} className={`w-6 h-6 ${vehicle.status === 'en_route' ? 'text-cyan-400' : 'text-yellow-400'}`} />
                                </div>
                            );
                        })}
                    </div>
                 </Card>
            </div>
            <div className="h-full">
                <Card title="Vehicle Details" className="h-full overflow-y-auto">
                    {selectedVehicle ? (
                         <div className="space-y-3 text-sm p-4">
                            <h3 className="text-xl font-bold">{selectedVehicle.licensePlate}</h3>
                            <p>{selectedVehicle.make} {selectedVehicle.model}</p>
                            <StatusPill status={selectedVehicle.status} />
                            <p><strong>Driver:</strong> {state.drivers.find(d => d.id === selectedVehicle.driverId)?.name || 'N/A'}</p>
                            <p><strong>Speed:</strong> {selectedVehicle.telemetry.speed} km/h</p>
                            <p><strong>Fuel:</strong> {selectedVehicle.fuelLevel.toFixed(1)}%</p>
                            <p><strong>Odometer:</strong> {selectedVehicle.odometer.toFixed(0)} km</p>
                         </div>
                    ) : (
                        <p className="text-gray-400 p-4">Click on a vehicle on the map to see details.</p>
                    )}
                </Card>
            </div>
        </div>
    );
};

export const AlertsFeedView: React.FC<{ limit?: number }> = ({ limit }) => {
    const { state, dispatch } = useContext(FleetContext)!;

    const getAlertIcon = (type: AlertType) => {
        // Placeholder for icons
        switch (type) {
            case 'speeding': return '⚡️';
            case 'harsh_braking': return '🛑';
            case 'engine_fault': return '⚙️';
            case 'geofence_exit': return '🗺️';
            case 'panic_button': return '🚨';
        }
    };
    
    const alertsToShow = limit ? state.alerts.slice(0, limit) : state.alerts;

    return (
        <Card title="Alerts Feed">
            <div className="space-y-3 max-h-96 overflow-y-auto">
                {alertsToShow.length === 0 && <p className="text-gray-400">No alerts.</p>}
                {alertsToShow.map(alert => (
                    <div key={alert.id} className={`p-3 rounded-lg flex items-start gap-4 ${alert.isAcknowledged ? 'bg-gray-800' : 'bg-red-900/50'}`}>
                        <div className="text-2xl mt-1">{getAlertIcon(alert.type)}</div>
                        <div>
                            <p className="font-semibold">{formatVehicleType(alert.type)} Alert</p>
                            <p className="text-sm text-gray-300">{alert.details}</p>
                            <p className="text-xs text-gray-400 mt-1">{state.vehicles.find(v => v.id === alert.vehicleId)?.licensePlate} &bull; {formatDate(alert.timestamp)}</p>
                        </div>
                        {!alert.isAcknowledged && (
                            <button onClick={() => dispatch({type: 'ACKNOWLEDGE_ALERT', payload: alert.id})} className="ml-auto text-xs bg-gray-600 hover:bg-gray-500 px-2 py-1 rounded">Ack</button>
                        )}
                    </div>
                ))}
            </div>
        </Card>
    );
};

// SECTION 8: MAIN COMPONENT ============================================================

const DemoBankFleetManagementView: React.FC = () => {
    const [state, dispatch] = useReducer(fleetReducer, initialFleetState);
    const [currentView, setCurrentView] = useState<ViewType>('dashboard');

    useEffect(() => {
        dispatch({ type: 'SET_INITIAL_STATE', payload: generateInitialState() });
    }, []);

    useFleetSimulator(dispatch, state);

    const NavButton: React.FC<{ view: ViewType; label: string }> = ({ view, label }) => (
        <button
            onClick={() => setCurrentView(view)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${currentView === view ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
        >
            {label}
        </button>
    );

    const renderView = () => {
        switch (currentView) {
            case 'dashboard': return <DashboardView />;
            case 'vehicles': return <VehicleManagementView />;
            case 'drivers': return <DriverManagementView />;
            case 'routes': return <RoutePlanningView />;
            case 'tracking': return <LiveTrackingView />;
            case 'alerts': return <AlertsFeedView />;
            // Add other views here...
            default: return <DashboardView />;
        }
    };

    return (
        <FleetContext.Provider value={{ state, dispatch }}>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold text-white tracking-wider">Demo Bank Fleet Management</h2>
                    <div className="text-sm text-gray-400">{new Date().toLocaleString()}</div>
                </div>

                <nav className="flex space-x-2 p-2 bg-gray-900/50 rounded-lg overflow-x-auto">
                    <NavButton view="dashboard" label="Dashboard" />
                    <NavButton view="tracking" label="Live Tracking" />
                    <NavButton view="routes" label="Route Planning" />
                    <NavButton view="vehicles" label="Vehicles" />
                    <NavButton view="drivers" label="Drivers" />
                    <NavButton view="alerts" label="Alerts" />
                </nav>

                <main>
                    {renderView()}
                </main>
            </div>
        </FleetContext.Provider>
    );
};

export default DemoBankFleetManagementView;