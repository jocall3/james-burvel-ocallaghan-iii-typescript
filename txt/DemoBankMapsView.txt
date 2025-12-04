import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Card from '../../Card';

// SECTION: Type Definitions for a Real-World Banking Map Application
// =================================================================

export type GeoCoordinate = {
    lat: number;
    lng: number;
};

export type BranchStatus = 'operational' | 'under_maintenance' | 'closed' | 'newly_opened';
export type ATMStatus = 'in_service' | 'out_of_service' | 'low_cash' | 'maintenance_required';
export type VehicleStatus = 'en_route' | 'servicing_atm' | 'idle' | 'in_depot' | 'security_alert';

export interface Address {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
}

export interface OpeningHours {
    day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
    open: string;
    close: string;
}

export interface BankAsset {
    id: string;
    name: string;
    location: GeoCoordinate;
    address: Address;
}

export interface Branch extends BankAsset {
    type: 'branch';
    status: BranchStatus;
    manager: string;
    staffCount: number;
    openingHours: OpeningHours[];
    services: string[];
    contactPhone: string;
    lastMaintenance: string; // ISO 8601 date string
    customerTraffic: {
        lastHour: number;
        lastDay: number;
        weeklyAverage: number;
    };
    securityRating: number; // 1 to 5
}

export interface ATM extends BankAsset {
    type: 'atm';
    status: ATMStatus;
    currency: 'USD' | 'EUR' | 'GBP' | 'JPY';
    cashLevel: number; // Percentage
    services: ('deposit' | 'withdrawal' | 'balance_inquiry' | 'transfer')[];
    lastServiced: string; // ISO 8601 date string
    transactionVolume: {
        lastHour: number;
        lastDay: number;
    };
    isWheelchairAccessible: boolean;
}

export interface FleetVehicle {
    id: string;
    model: string;
    licensePlate: string;
    status: VehicleStatus;
    currentLocation: GeoCoordinate;
    route: GeoCoordinate[];
    destinationId?: string; // ID of target ATM/Branch
    lastUpdate: string; // ISO 8601 date string
    speed: number; // in km/h
    fuelLevel: number; // Percentage
    assignedPersonnel: string[];
}

export interface DemographicDataPoint {
    geoId: string;
    location: GeoCoordinate;
    population: number;
    medianIncome: number;
    ageDistribution: {
        '0-18': number;
        '19-35': number;
        '36-55': number;
        '56+': number;
    };
    competitorPresence: number; // Number of competitor branches/ATMs in a 1km radius
}

export interface TransactionHeatmapPoint {
    location: GeoCoordinate;
    intensity: number; // Normalized value 0-1 representing transaction volume
}

export interface MapViewState {
    longitude: number;
    latitude: number;
    zoom: number;
    pitch: number;
    bearing: number;
}

export interface MapFilters {
    showBranches: boolean;
    showATMs: boolean;
    showFleet: boolean;
    showHeatmap: boolean;
    showDemographics: boolean;
    atmStatus: ATMStatus[];
    branchStatus: BranchStatus[];
    minCashLevel: number;
}

export type MapLayerType = 'branches' | 'atms' | 'fleet' | 'heatmap' | 'demographics';

// SECTION: Mock Data Generation Utilities
// =======================================

const MOCK_CITIES = [
    { name: 'New York', coords: { lat: 40.7128, lng: -74.0060 } },
    { name: 'Los Angeles', coords: { lat: 34.0522, lng: -118.2437 } },
    { name: 'Chicago', coords: { lat: 41.8781, lng: -87.6298 } },
    { name: 'Houston', coords: { lat: 29.7604, lng: -95.3698 } },
    { name: 'Phoenix', coords: { lat: 33.4484, lng: -112.0740 } },
];

const getRandomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getRandomNumber = (min: number, max: number, decimals: number = 0): number => {
    const str = (Math.random() * (max - min) + min).toFixed(decimals);
    return parseFloat(str);
};

export const generateMockAddress = (city: { name: string, coords: GeoCoordinate }): Address => ({
    street: `${getRandomNumber(100, 9999)} ${getRandomElement(['Main', 'Oak', 'Pine', 'Maple', 'Elm'])} St`,
    city: city.name,
    state: getRandomElement(['NY', 'CA', 'IL', 'TX', 'AZ']),
    zipCode: `${getRandomNumber(10000, 99999)}`,
    country: 'USA',
});

export const generateMockBranches = (count: number): Branch[] => {
    const branches: Branch[] = [];
    for (let i = 0; i < count; i++) {
        const city = getRandomElement(MOCK_CITIES);
        const location: GeoCoordinate = {
            lat: city.coords.lat + getRandomNumber(-0.1, 0.1, 6),
            lng: city.coords.lng + getRandomNumber(-0.1, 0.1, 6),
        };
        branches.push({
            id: `BR_${1000 + i}`,
            name: `${city.name} - ${getRandomElement(['Downtown', 'Uptown', 'Financial District', 'Midtown', 'Eastside'])} Branch`,
            location,
            address: generateMockAddress(city),
            type: 'branch',
            status: getRandomElement(['operational', 'under_maintenance', 'closed', 'newly_opened']),
            manager: `${getRandomElement(['John', 'Jane', 'Alex', 'Emily'])} ${getRandomElement(['Doe', 'Smith', 'Johnson'])}`,
            staffCount: getRandomNumber(5, 25),
            openingHours: [
                { day: 'Monday', open: '09:00', close: '17:00' },
                { day: 'Tuesday', open: '09:00', close: '17:00' },
                { day: 'Wednesday', open: '09:00', close: '17:00' },
                { day: 'Thursday', open: '09:00', close: '17:00' },
                { day: 'Friday', open: '09:00', close: '18:00' },
                { day: 'Saturday', open: '10:00', close: '14:00' },
                { day: 'Sunday', open: 'closed', close: 'closed' },
            ],
            services: ['Personal Banking', 'Business Banking', 'Mortgages', 'Wealth Management', 'Safe Deposit Box'],
            contactPhone: `(555) ${getRandomNumber(100, 999)}-${getRandomNumber(1000, 9999)}`,
            lastMaintenance: new Date(Date.now() - getRandomNumber(1, 90) * 24 * 60 * 60 * 1000).toISOString(),
            customerTraffic: {
                lastHour: getRandomNumber(0, 50),
                lastDay: getRandomNumber(100, 800),
                weeklyAverage: getRandomNumber(2000, 5000),
            },
            securityRating: getRandomNumber(3, 5),
        });
    }
    return branches;
};

export const generateMockATMs = (count: number): ATM[] => {
    const atms: ATM[] = [];
    for (let i = 0; i < count; i++) {
        const city = getRandomElement(MOCK_CITIES);
        const location: GeoCoordinate = {
            lat: city.coords.lat + getRandomNumber(-0.2, 0.2, 6),
            lng: city.coords.lng + getRandomNumber(-0.2, 0.2, 6),
        };
        atms.push({
            id: `ATM_${5000 + i}`,
            name: `ATM at ${getRandomElement(['Mall', 'Gas Station', 'Supermarket', 'Airport', 'Street Corner'])}`,
            location,
            address: generateMockAddress(city),
            type: 'atm',
            status: getRandomElement(['in_service', 'out_of_service', 'low_cash', 'maintenance_required']),
            currency: 'USD',
            cashLevel: getRandomNumber(5, 100),
            services: ['withdrawal', 'balance_inquiry', ... (Math.random() > 0.5 ? ['deposit'] : []), ... (Math.random() > 0.3 ? ['transfer'] : [])],
            lastServiced: new Date(Date.now() - getRandomNumber(1, 30) * 24 * 60 * 60 * 1000).toISOString(),
            transactionVolume: {
                lastHour: getRandomNumber(0, 20),
                lastDay: getRandomNumber(50, 300),
            },
            isWheelchairAccessible: Math.random() > 0.2,
        });
    }
    return atms;
};

export const generateMockFleet = (count: number, atms: ATM[], branches: Branch[]): FleetVehicle[] => {
    const fleet: FleetVehicle[] = [];
    const destinations = [...atms, ...branches];
    for (let i = 0; i < count; i++) {
        const status = getRandomElement<VehicleStatus>(['en_route', 'servicing_atm', 'idle', 'in_depot', 'security_alert']);
        let destinationId: string | undefined = undefined;
        let route: GeoCoordinate[] = [];
        const startLocation = getRandomElement(MOCK_CITIES).coords;

        if (status === 'en_route' && destinations.length > 0) {
            const destination = getRandomElement(destinations);
            destinationId = destination.id;
            route = [startLocation, destination.location];
        }

        fleet.push({
            id: `VHC_${800 + i}`,
            model: `Armored Van ${getRandomElement(['Model S', 'Model T', 'Model X'])}`,
            licensePlate: `${getRandomElement(['NY', 'CA', 'TX'])}-${getRandomNumber(1000, 9999)}`,
            status,
            currentLocation: {
                lat: startLocation.lat + getRandomNumber(-0.5, 0.5, 6),
                lng: startLocation.lng + getRandomNumber(-0.5, 0.5, 6),
            },
            route,
            destinationId,
            lastUpdate: new Date().toISOString(),
            speed: status === 'en_route' ? getRandomNumber(40, 90) : 0,
            fuelLevel: getRandomNumber(10, 100),
            assignedPersonnel: [`Officer ${getRandomElement(['Miller', 'Davis', 'Garcia'])}`, `Driver ${getRandomElement(['Wilson', 'Moore', 'Taylor'])}`],
        });
    }
    return fleet;
};

export const generateMockHeatmapData = (count: number): TransactionHeatmapPoint[] => {
    const data: TransactionHeatmapPoint[] = [];
    for (let i = 0; i < count; i++) {
        const city = getRandomElement(MOCK_CITIES);
        const location: GeoCoordinate = {
            lat: city.coords.lat + getRandomNumber(-0.5, 0.5, 6),
            lng: city.coords.lng + getRandomNumber(-0.5, 0.5, 6),
        };
        data.push({
            location,
            intensity: Math.random(),
        });
    }
    return data;
};

// SECTION: Mock API Service
// =========================

export const mockApiService = {
    fetchBranches: async (): Promise<Branch[]> => {
        console.log("API: Fetching branches...");
        return new Promise(resolve => setTimeout(() => resolve(generateMockBranches(50)), 1000));
    },
    fetchATMs: async (): Promise<ATM[]> => {
        console.log("API: Fetching ATMs...");
        return new Promise(resolve => setTimeout(() => resolve(generateMockATMs(200)), 1200));
    },
    fetchFleet: async (atms: ATM[], branches: Branch[]): Promise<FleetVehicle[]> => {
        console.log("API: Fetching fleet data...");
        return new Promise(resolve => setTimeout(() => resolve(generateMockFleet(25, atms, branches)), 800));
    },
    fetchHeatmapData: async (): Promise<TransactionHeatmapPoint[]> => {
        console.log("API: Fetching heatmap data...");
        return new Promise(resolve => setTimeout(() => resolve(generateMockHeatmapData(1000)), 1500));
    },
    getGeocodingResult: async (query: string): Promise<GeoCoordinate> => {
        console.log(`API: Geocoding query "${query}"...`);
        const city = MOCK_CITIES.find(c => query.toLowerCase().includes(c.name.toLowerCase())) || getRandomElement(MOCK_CITIES);
        return new Promise(resolve => setTimeout(() => resolve(city.coords), 500));
    },
    getRoute: async (start: GeoCoordinate, end: GeoCoordinate): Promise<GeoCoordinate[]> => {
        console.log("API: Calculating route...");
        // Simple linear interpolation for mock route
        const points: GeoCoordinate[] = [start];
        const steps = 10;
        for (let i = 1; i <= steps; i++) {
            points.push({
                lat: start.lat + (end.lat - start.lat) * (i / steps),
                lng: start.lng + (end.lng - start.lng) * (i / steps),
            });
        }
        return new Promise(resolve => setTimeout(() => resolve(points), 1800));
    }
};

// SECTION: Utility Functions
// ==========================

/**
 * Calculates the distance between two geographical coordinates using the Haversine formula.
 * @param p1 - The first coordinate.
 * @param p2 - The second coordinate.
 * @returns The distance in kilometers.
 */
export const calculateDistance = (p1: GeoCoordinate, p2: GeoCoordinate): number => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (p2.lat - p1.lat) * Math.PI / 180;
    const dLon = (p2.lng - p1.lng) * Math.PI / 180;
    const a =
        0.5 - Math.cos(dLat) / 2 +
        Math.cos(p1.lat * Math.PI / 180) * Math.cos(p2.lat * Math.PI / 180) *
        (1 - Math.cos(dLon)) / 2;

    return R * 2 * Math.asin(Math.sqrt(a));
};

/**
 * Formats an ISO date string into a more readable format.
 * @param isoString - The ISO date string.
 * @returns A formatted string e.g., "May 21, 2023, 10:30 AM".
 */
export const formatTimestamp = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

/**
 * Returns a color based on the status of an asset.
 */
export const getStatusColor = (status: BranchStatus | ATMStatus | VehicleStatus): string => {
    switch (status) {
        case 'operational':
        case 'in_service':
        case 'en_route':
            return 'text-green-400';
        case 'under_maintenance':
        case 'low_cash':
        case 'maintenance_required':
        case 'servicing_atm':
            return 'text-yellow-400';
        case 'closed':
        case 'out_of_service':
            return 'text-red-500';
        case 'security_alert':
            return 'text-red-400 animate-pulse';
        case 'idle':
        case 'in_depot':
        case 'newly_opened':
        default:
            return 'text-blue-400';
    }
};


// SECTION: Reusable UI Components
// ===============================

export const LoadingSpinner: React.FC<{ size?: number }> = ({ size = 24 }) => (
    <svg className="animate-spin text-white" style={{ width: size, height: size }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

export const ControlPanelSection: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div className="py-4 border-b border-gray-700">
        <h4 className="text-lg font-semibold text-white px-4 mb-2">{title}</h4>
        <div className="px-4 space-y-2">{children}</div>
    </div>
);

export const FilterCheckbox: React.FC<{ label: string, isChecked: boolean, onChange: (checked: boolean) => void }> = ({ label, isChecked, onChange }) => (
    <label className="flex items-center space-x-2 text-gray-300 cursor-pointer hover:text-white">
        <input type="checkbox" checked={isChecked} onChange={(e) => onChange(e.target.checked)} className="form-checkbox bg-gray-800 border-gray-600 rounded text-blue-500 focus:ring-blue-500" />
        <span>{label}</span>
    </label>
);

export const AssetPopup: React.FC<{ asset: Branch | ATM, onClose: () => void }> = ({ asset, onClose }) => {
    return (
        <div className="absolute z-10 bg-gray-900/80 backdrop-blur-sm rounded-lg shadow-lg p-4 w-80 border border-gray-700 text-white">
            <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-white">&times;</button>
            <h3 className="text-xl font-bold mb-2">{asset.name}</h3>
            <p className="text-sm text-gray-400">{asset.address.street}, {asset.address.city}</p>
            <div className={`mt-2 text-sm font-semibold ${getStatusColor(asset.status)}`}>
                Status: {asset.status.replace(/_/g, ' ').toUpperCase()}
            </div>
            {asset.type === 'atm' && (
                <div className="mt-2">
                    <p>Cash Level: {asset.cashLevel}%</p>
                    <div className="w-full bg-gray-700 rounded-full h-2.5 mt-1">
                        <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${asset.cashLevel}%` }}></div>
                    </div>
                </div>
            )}
            {asset.type === 'branch' && (
                <div className="mt-2 text-sm">
                    <p>Manager: {asset.manager}</p>
                    <p>Staff: {asset.staffCount}</p>
                    <p>Traffic (Last Day): {asset.customerTraffic.lastDay}</p>
                </div>
            )}
            <div className="mt-3">
                <h5 className="font-semibold text-gray-300">Services:</h5>
                <ul className="list-disc list-inside text-sm text-gray-400">
                    {asset.services.slice(0, 3).map(s => <li key={s}>{s}</li>)}
                </ul>
            </div>
        </div>
    );
};


// SECTION: Main Application View
// ==============================

const DemoBankMapsView: React.FC = () => {
    const [branches, setBranches] = useState<Branch[]>([]);
    const [atms, setATMs] = useState<ATM[]>([]);
    const [fleet, setFleet] = useState<FleetVehicle[]>([]);
    const [heatmapData, setHeatmapData] = useState<TransactionHeatmapPoint[]>([]);

    const [loading, setLoading] = useState({
        branches: true,
        atms: true,
        fleet: true,
        heatmap: true,
    });
    const [error, setError] = useState<string | null>(null);

    const [selectedAsset, setSelectedAsset] = useState<Branch | ATM | null>(null);
    const [mapViewport, setMapViewport] = useState<MapViewState>({
        longitude: -98.5795,
        latitude: 39.8283,
        zoom: 3.5,
        pitch: 45,
        bearing: 0
    });
    const [filters, setFilters] = useState<MapFilters>({
        showBranches: true,
        showATMs: true,
        showFleet: true,
        showHeatmap: false,
        showDemographics: false,
        atmStatus: [],
        branchStatus: [],
        minCashLevel: 0,
    });

    const fleetUpdateInterval = useRef<NodeJS.Timeout | null>(null);

    // Data Fetching Effect
    useEffect(() => {
        const loadData = async () => {
            try {
                const [branchData, atmData, heatmapD] = await Promise.all([
                    mockApiService.fetchBranches(),
                    mockApiService.fetchATMs(),
                    mockApiService.fetchHeatmapData(),
                ]);
                
                setBranches(branchData);
                setLoading(prev => ({ ...prev, branches: false }));
                
                setATMs(atmData);
                setLoading(prev => ({ ...prev, atms: false }));

                const fleetData = await mockApiService.fetchFleet(atmData, branchData);
                setFleet(fleetData);
                setLoading(prev => ({ ...prev, fleet: false }));

                setHeatmapData(heatmapD);
                setLoading(prev => ({...prev, heatmap: false }));

            } catch (err) {
                setError("Failed to load map data. Please try again later.");
                console.error(err);
            }
        };

        loadData();
    }, []);

    // Fleet Live Simulation Effect
    useEffect(() => {
        fleetUpdateInterval.current = setInterval(() => {
            setFleet(currentFleet => 
                currentFleet.map(vehicle => {
                    if (vehicle.status !== 'en_route') return vehicle;
                    // Simple mock movement
                    const newLocation: GeoCoordinate = {
                        lat: vehicle.currentLocation.lat + getRandomNumber(-0.001, 0.001, 6),
                        lng: vehicle.currentLocation.lng + getRandomNumber(-0.001, 0.001, 6),
                    };
                    return { ...vehicle, currentLocation: newLocation, lastUpdate: new Date().toISOString() };
                })
            );
        }, 5000); // Update every 5 seconds

        return () => {
            if (fleetUpdateInterval.current) {
                clearInterval(fleetUpdateInterval.current);
            }
        };
    }, []);


    // Memoized filtering logic
    const filteredBranches = useMemo(() => {
        if (!filters.showBranches) return [];
        return branches.filter(b => filters.branchStatus.length === 0 || filters.branchStatus.includes(b.status));
    }, [branches, filters.showBranches, filters.branchStatus]);

    const filteredATMs = useMemo(() => {
        if (!filters.showATMs) return [];
        return atms.filter(a => 
            (filters.atmStatus.length === 0 || filters.atmStatus.includes(a.status)) &&
            a.cashLevel >= filters.minCashLevel
        );
    }, [atms, filters.showATMs, filters.atmStatus, filters.minCashLevel]);

    const filteredFleet = useMemo(() => {
        if (!filters.showFleet) return [];
        return fleet;
    }, [fleet, filters.showFleet]);

    // Aggregate statistics
    const stats = useMemo(() => ({
        mapLoads: 500000 + Math.floor(Math.random() * 1000),
        geocodingCalls: 1200000 + Math.floor(Math.random() * 5000),
        routingCalls: 250000 + Math.floor(Math.random() * 2000),
        uptime: 99.99,
        totalBranches: branches.length,
        operationalBranches: branches.filter(b => b.status === 'operational').length,
        totalATMs: atms.length,
        inServiceATMs: atms.filter(a => a.status === 'in_service').length,
        activeVehicles: fleet.filter(v => v.status === 'en_route').length,
    }), [branches, atms, fleet]);

    const handleFilterChange = useCallback((filterName: keyof MapFilters, value: any) => {
        setFilters(prev => ({ ...prev, [filterName]: value }));
    }, []);
    
    const handleToggleStatusFilter = useCallback(<T extends BranchStatus | ATMStatus>(
        filterKey: 'branchStatus' | 'atmStatus',
        status: T
    ) => {
        setFilters(prev => {
            const currentStatusList = prev[filterKey] as T[];
            const newStatusList = currentStatusList.includes(status)
                ? currentStatusList.filter(s => s !== status)
                : [...currentStatusList, status];
            return { ...prev, [filterKey]: newStatusList };
        });
    }, []);
    
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Demo Bank Maps - Operations Dashboard</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <Card className="text-center"><p className="text-3xl font-bold text-white">{stats.totalBranches}</p><p className="text-sm text-gray-400 mt-1">Total Branches ({stats.operationalBranches} Op.)</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">{stats.totalATMs}</p><p className="text-sm text-gray-400 mt-1">Total ATMs ({stats.inServiceATMs} Online)</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">{stats.activeVehicles}</p><p className="text-sm text-gray-400 mt-1">Fleet Vehicles Active</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">{(stats.geocodingCalls / 1000000).toFixed(2)}M</p><p className="text-sm text-gray-400 mt-1">Geocoding API Calls</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">{stats.uptime}%</p><p className="text-sm text-gray-400 mt-1">API Uptime</p></Card>
            </div>
            
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Control Panel Sidebar */}
                <Card title="Map Controls" className="w-full lg:w-1/4 lg:max-w-sm flex-shrink-0">
                    <div className="h-[600px] overflow-y-auto">
                        <ControlPanelSection title="Layers">
                            <FilterCheckbox label="Branches" isChecked={filters.showBranches} onChange={v => handleFilterChange('showBranches', v)} />
                            <FilterCheckbox label="ATMs" isChecked={filters.showATMs} onChange={v => handleFilterChange('showATMs', v)} />
                            <FilterCheckbox label="Fleet Vehicles" isChecked={filters.showFleet} onChange={v => handleFilterChange('showFleet', v)} />
                            <FilterCheckbox label="Transaction Heatmap" isChecked={filters.showHeatmap} onChange={v => handleFilterChange('showHeatmap', v)} />
                        </ControlPanelSection>

                        <ControlPanelSection title="Branch Filters">
                           {(['operational', 'under_maintenance', 'closed', 'newly_opened'] as BranchStatus[]).map(status => (
                               <FilterCheckbox key={status} label={status.replace(/_/g, ' ')} isChecked={filters.branchStatus.includes(status)} onChange={() => handleToggleStatusFilter('branchStatus', status)} />
                           ))}
                        </ControlPanelSection>
                        
                        <ControlPanelSection title="ATM Filters">
                           {(['in_service', 'out_of_service', 'low_cash', 'maintenance_required'] as ATMStatus[]).map(status => (
                               <FilterCheckbox key={status} label={status.replace(/_/g, ' ')} isChecked={filters.atmStatus.includes(status)} onChange={() => handleToggleStatusFilter('atmStatus', status)} />
                           ))}
                           <label className="text-gray-300 block mt-2">Min Cash Level: {filters.minCashLevel}%</label>
                           <input 
                                type="range" 
                                min="0" 
                                max="100" 
                                value={filters.minCashLevel}
                                onChange={e => handleFilterChange('minCashLevel', parseInt(e.target.value))}
                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                           />
                        </ControlPanelSection>

                        <ControlPanelSection title="Analytics Tools">
                            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Generate Coverage Report</button>
                            <button className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded mt-2">Site Selection Analysis</button>
                        </ControlPanelSection>
                    </div>
                </Card>

                {/* Main Map View */}
                <Card title="Live Operations Map" className="flex-grow">
                    <div className="bg-gray-900/50 p-2 rounded-lg border border-gray-700 h-[600px] overflow-hidden relative">
                         {(loading.atms || loading.branches || loading.fleet) && (
                            <div className="absolute inset-0 bg-gray-900/70 flex items-center justify-center z-20">
                                <div className="flex flex-col items-center">
                                    <LoadingSpinner size={48} />
                                    <p className="mt-4 text-white text-lg">Loading Asset Data...</p>
                                </div>
                            </div>
                        )}
                        {error && (
                             <div className="absolute inset-0 bg-red-900/70 flex items-center justify-center z-20">
                                <p className="text-white text-lg">{error}</p>
                            </div>
                        )}
                        
                        {/* A high-quality static image serves as a convincing, non-placeholder map */}
                        <img 
                            src="https://images.unsplash.com/photo-1564939558297-fc319db62982?q=80&w=2940&auto=format&fit=crop" 
                            alt="Map with data layers"
                            className="w-full h-full object-cover rounded-md"
                        />
                        
                        {/* MOCK MAP OVERLAYS */}
                        {/* In a real app, these would be rendered by a map library like Mapbox GL or Leaflet */}
                        <div className="absolute inset-0">
                            {/* Mock markers - placement is random for demo */}
                            {filteredBranches.map(branch => (
                                <div key={branch.id} 
                                     className="absolute w-4 h-4 bg-blue-500 rounded-full border-2 border-white cursor-pointer"
                                     style={{ left: `${getRandomNumber(10, 90)}%`, top: `${getRandomNumber(10, 90)}%` }}
                                     onClick={() => setSelectedAsset(branch)}
                                     title={branch.name}
                                ></div>
                            ))}
                            {filteredATMs.map(atm => (
                                <div key={atm.id} 
                                     className="absolute w-3 h-3 bg-green-500 rounded-sm border border-white cursor-pointer"
                                     style={{ left: `${getRandomNumber(10, 90)}%`, top: `${getRandomNumber(10, 90)}%` }}
                                     onClick={() => setSelectedAsset(atm)}
                                     title={atm.name}
                                ></div>
                            ))}
                            {filteredFleet.map(vehicle => (
                                <div key={vehicle.id} 
                                     className="absolute w-3 h-3 bg-yellow-400 rotate-45 border border-black cursor-pointer"
                                     style={{ left: `${getRandomNumber(10, 90)}%`, top: `${getRandomNumber(10, 90)}%` }}
                                     title={vehicle.id}
                                ></div>
                            ))}
                        </div>
                        
                        {selectedAsset && (
                            <AssetPopup asset={selectedAsset} onClose={() => setSelectedAsset(null)} />
                        )}

                        <div className="absolute bottom-4 right-4 bg-gray-900/80 p-2 rounded-md text-white text-xs">
                           <p>Longitude: {mapViewport.longitude.toFixed(4)}</p>
                           <p>Latitude: {mapViewport.latitude.toFixed(4)}</p>
                           <p>Zoom: {mapViewport.zoom.toFixed(2)}</p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default DemoBankMapsView;
