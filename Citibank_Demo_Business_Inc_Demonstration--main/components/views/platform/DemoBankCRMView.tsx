import React, { useState, useEffect, useMemo, useCallback, FC, ReactNode } from 'react';
import Card from '../../Card';
import { FunnelChart, Funnel, Tooltip, ResponsiveContainer, LabelList, BarChart, Bar, XAxis, YAxis, Legend, LineChart, Line, CartesianGrid, AreaChart, Area } from 'recharts';

// In a real app, this data would come from a dedicated file e.g., /data/platform/crmData.ts
const pipelineData = [
  { value: 100, name: 'Leads', fill: '#06b6d4' },
  { value: 80, name: 'Contacted', fill: '#3b82f6' },
  { value: 50, name: 'Qualified', fill: '#8b5cf6' },
  { value: 20, name: 'Won', fill: '#10b981' },
];
const satisfactionData = [
    { name: 'Q1', CSAT: 85 }, { name: 'Q2', CSAT: 88 },
    { name: 'Q3', CSAT: 92 }, { name: 'Q4', CSAT: 91 },
];
const topCustomers = [
    { id: 1, name: 'Global Innovations Inc.', LTV: 250000, status: 'Active' },
    { id: 2, name: 'FutureTech Solutions', LTV: 180000, status: 'Active' },
    { id: 3, name: 'Synergy Enterprises', LTV: 150000, status: 'Churn Risk' },
];

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// 1. ENHANCED TYPE DEFINITIONS FOR A REAL-WORLD CRM
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

export type CustomerStatus = 'Active' | 'Prospect' | 'Churn Risk' | 'Lost';
export type TaskStatus = 'Not Started' | 'In Progress' | 'Completed' | 'Blocked';
export type InteractionType = 'Call' | 'Email' | 'Meeting' | 'Note';
export type LeadSource = 'Website' | 'Referral' | 'Cold Call' | 'Trade Show' | 'Advertisement';
export type ProductType = 'Investment Account' | 'Business Loan' | 'Credit Line' | 'Wealth Management' | 'Treasury Services';
export type TaskPriority = 'High' | 'Medium' | 'Low';

export interface Interaction {
  id: string;
  type: InteractionType;
  date: string;
  notes: string;
  salespersonId: number;
}

export interface ProductHolding {
  productType: ProductType;
  value: number;
  openDate: string;
}

export interface Customer {
  id: number;
  name: string;
  LTV: number;
  status: CustomerStatus;
  joinDate: string;
  primaryContact: {
    name: string;
    email: string;
    phone: string;
  };
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  industry: string;
  assignedSalespersonId: number;
  interactions: Interaction[];
  productHoldings: ProductHolding[];
  npsScore?: number; // Net Promoter Score
}

export interface Salesperson {
  id: number;
  name:string;
  email: string;
  region: 'North' | 'South' | 'East' | 'West';
  avatarUrl: string;
}

export interface Task {
  id: string;
  title: string;
  dueDate: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo: number; // salespersonId
  relatedCustomerId?: number;
}

export interface DashboardMetrics {
  newLeads30d: number;
  conversionRate: number;
  customerSatisfaction: number;
  pipelineValue: number;
  monthlyRecurringRevenue: number;
  churnRate: number;
  avgResponseTimeHours: number;
  teamQuotaAttainment: number;
}

export interface Lead {
  id: string;
  companyName: string;
  contactPerson: string;
  contactEmail: string;
  estimatedValue: number;
  source: LeadSource;
  status: 'New' | 'Contacted' | 'Qualified' | 'Unqualified';
  createdDate: string;
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// 2. MOCK DATA GENERATION
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

const FIRST_NAMES = ['Aiden', 'Bella', 'Caleb', 'Daisy', 'Elijah', 'Fiona', 'Gavin', 'Hazel', 'Isaac', 'Jade'];
const LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
const COMPANY_SUFFIXES = ['Corp', 'Inc.', 'Solutions', 'Group', 'LLC', 'Enterprises', 'Innovations', 'Partners'];
const COMPANY_PREFIXES = ['Global', 'Apex', 'Synergy', 'Quantum', 'Stellar', 'Dynamic', 'Future', 'Pinnacle', 'NextGen'];
const INDUSTRIES = ['Technology', 'Finance', 'Healthcare', 'Manufacturing', 'Retail', 'Real Estate', 'Consulting'];
const STREET_NAMES = ['Main St', 'Oak Ave', 'Pine Ln', 'Maple Dr', 'Cedar Blvd'];
const CITIES = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego'];
const STATES = ['NY', 'CA', 'IL', 'TX', 'AZ', 'PA'];

const getRandomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getRandomDate = (start: Date, end: Date): Date => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
const getRandomNumber = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;

export const salesTeam: Salesperson[] = [
    { id: 101, name: 'Alice Johnson', email: 'alice.j@demobank.com', region: 'North', avatarUrl: `https://i.pravatar.cc/150?u=101` },
    { id: 102, name: 'Bob Williams', email: 'bob.w@demobank.com', region: 'South', avatarUrl: `https://i.pravatar.cc/150?u=102` },
    { id: 103, name: 'Charlie Brown', email: 'charlie.b@demobank.com', region: 'East', avatarUrl: `https://i.pravatar.cc/150?u=103` },
    { id: 104, name: 'Diana Miller', email: 'diana.m@demobank.com', region: 'West', avatarUrl: `https://i.pravatar.cc/150?u=104` },
];

export const generateRandomInteractions = (count: number): Interaction[] => {
  const interactions: Interaction[] = [];
  for (let i = 0; i < count; i++) {
    interactions.push({
      id: `int_${Date.now()}_${i}`,
      type: getRandomElement<InteractionType>(['Call', 'Email', 'Meeting', 'Note']),
      date: getRandomDate(new Date(2022, 0, 1), new Date()).toISOString(),
      notes: 'Discussed Q3 financial planning and potential for new credit line. Follow-up required next week.',
      salespersonId: getRandomElement(salesTeam).id,
    });
  }
  return interactions;
};

export const generateRandomProductHoldings = (): ProductHolding[] => {
  const holdings: ProductHolding[] = [];
  const numHoldings = getRandomNumber(1, 3);
  const productTypes: ProductType[] = ['Investment Account', 'Business Loan', 'Credit Line', 'Wealth Management', 'Treasury Services'];
  const usedTypes: Set<ProductType> = new Set();
  
  for (let i = 0; i < numHoldings; i++) {
    let productType = getRandomElement(productTypes);
    while (usedTypes.has(productType)) {
      productType = getRandomElement(productTypes);
    }
    usedTypes.add(productType);
    
    holdings.push({
      productType,
      value: getRandomNumber(50000, 1000000),
      openDate: getRandomDate(new Date(2020, 0, 1), new Date()).toISOString(),
    });
  }
  return holdings;
};

export const generateRandomCustomers = (count: number): Customer[] => {
  const customers: Customer[] = [];
  for (let i = 1; i <= count; i++) {
    const firstName = getRandomElement(FIRST_NAMES);
    const lastName = getRandomElement(LAST_NAMES);
    customers.push({
      id: 2000 + i,
      name: `${getRandomElement(COMPANY_PREFIXES)} ${lastName} ${getRandomElement(COMPANY_SUFFIXES)}`,
      LTV: getRandomNumber(50000, 500000),
      status: getRandomElement<CustomerStatus>(['Active', 'Prospect', 'Churn Risk', 'Lost']),
      joinDate: getRandomDate(new Date(2020, 0, 1), new Date()).toISOString(),
      primaryContact: {
        name: `${firstName} ${lastName}`,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
        phone: `555-${getRandomNumber(100, 999)}-${getRandomNumber(1000, 9999)}`,
      },
      address: {
        street: `${getRandomNumber(100, 9999)} ${getRandomElement(STREET_NAMES)}`,
        city: getRandomElement(CITIES),
        state: getRandomElement(STATES),
        zip: `${getRandomNumber(10000, 99999)}`,
      },
      industry: getRandomElement(INDUSTRIES),
      assignedSalespersonId: getRandomElement(salesTeam).id,
      interactions: generateRandomInteractions(getRandomNumber(3, 10)),
      productHoldings: generateRandomProductHoldings(),
      npsScore: getRandomNumber(1, 10),
    });
  }
  return customers;
};

export const generateRandomTasks = (count: number, customers: Customer[]): Task[] => {
    const tasks: Task[] = [];
    for(let i = 0; i < count; i++) {
        tasks.push({
            id: `task_${Date.now()}_${i}`,
            title: getRandomElement(['Follow up on Q4 proposal', 'Schedule discovery call', 'Prepare annual review', 'Onboard new contact', 'Resolve support ticket']),
            dueDate: getRandomDate(new Date(), new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)).toISOString(),
            status: getRandomElement<TaskStatus>(['Not Started', 'In Progress', 'Completed']),
            priority: getRandomElement<TaskPriority>(['High', 'Medium', 'Low']),
            assignedTo: getRandomElement(salesTeam).id,
            relatedCustomerId: getRandomElement(customers).id,
        });
    }
    return tasks;
};

export const generateLeads = (count: number): Lead[] => {
    const leads: Lead[] = [];
    for (let i = 0; i < count; i++) {
        const firstName = getRandomElement(FIRST_NAMES);
        const lastName = getRandomElement(LAST_NAMES);
        leads.push({
            id: `lead_${Date.now()}_${i}`,
            companyName: `${getRandomElement(COMPANY_PREFIXES)} ${lastName} ${getRandomElement(COMPANY_SUFFIXES)}`,
            contactPerson: `${firstName} ${lastName}`,
            contactEmail: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@newbiz.com`,
            estimatedValue: getRandomNumber(10000, 100000),
            source: getRandomElement<LeadSource>(['Website', 'Referral', 'Cold Call', 'Trade Show', 'Advertisement']),
            status: getRandomElement(['New', 'Contacted', 'Qualified', 'Unqualified']),
            createdDate: getRandomDate(new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), new Date()).toISOString(),
        });
    }
    return leads;
};


let mockCustomers: Customer[] = generateRandomCustomers(200);
let mockTasks: Task[] = generateRandomTasks(50, mockCustomers);
let mockLeads: Lead[] = generateLeads(75);

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// 3. MOCK API SERVICE
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

export const apiService = {
  fetchDashboardMetrics: async (): Promise<DashboardMetrics> => {
    return new Promise(resolve => setTimeout(() => resolve({
        newLeads30d: 125,
        conversionRate: 16,
        customerSatisfaction: 91,
        pipelineValue: 1500000,
        monthlyRecurringRevenue: 450000,
        churnRate: 2.3,
        avgResponseTimeHours: 8,
        teamQuotaAttainment: 85,
    }), 500));
  },
  fetchCustomers: async ({ page, limit, sort, filters }: { page: number, limit: number, sort: { key: keyof Customer, order: 'asc' | 'desc'}, filters: Record<string, string> }): Promise<{ customers: Customer[], total: number }> => {
    return new Promise(resolve => {
        let filteredCustomers = [...mockCustomers];

        // Apply filters
        if (filters.name) {
            filteredCustomers = filteredCustomers.filter(c => c.name.toLowerCase().includes(filters.name.toLowerCase()));
        }
        if (filters.status) {
            filteredCustomers = filteredCustomers.filter(c => c.status === filters.status);
        }
        if (filters.salespersonId) {
            filteredCustomers = filteredCustomers.filter(c => c.assignedSalespersonId === parseInt(filters.salespersonId));
        }

        // Apply sorting
        filteredCustomers.sort((a, b) => {
            const valA = a[sort.key];
            const valB = b[sort.key];
            if (valA < valB) return sort.order === 'asc' ? -1 : 1;
            if (valA > valB) return sort.order === 'asc' ? 1 : -1;
            return 0;
        });
        
        const start = (page - 1) * limit;
        const end = start + limit;
        const paginatedCustomers = filteredCustomers.slice(start, end);
        
        setTimeout(() => resolve({ customers: paginatedCustomers, total: filteredCustomers.length }), 700);
    });
  },
  fetchTasks: async (): Promise<Task[]> => {
    return new Promise(resolve => setTimeout(() => resolve([...mockTasks].sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())), 600));
  },
  updateTaskStatus: async (taskId: string, status: TaskStatus): Promise<Task> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const taskIndex = mockTasks.findIndex(t => t.id === taskId);
            if (taskIndex !== -1) {
                mockTasks[taskIndex].status = status;
                resolve(mockTasks[taskIndex]);
            } else {
                reject(new Error('Task not found'));
            }
        }, 300);
    });
  },
  createLead: async (leadData: Omit<Lead, 'id' | 'createdDate'>): Promise<Lead> => {
      return new Promise(resolve => {
          setTimeout(() => {
              const newLead: Lead = {
                  ...leadData,
                  id: `lead_${Date.now()}`,
                  createdDate: new Date().toISOString(),
              };
              mockLeads.unshift(newLead);
              resolve(newLead);
          }, 800)
      })
  }
};

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// 4. UTILITY FUNCTIONS
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

export const formatCurrency = (amount: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const getStatusChipClass = (status: CustomerStatus): string => {
  switch (status) {
    case 'Active': return 'bg-green-500/20 text-green-300';
    case 'Prospect': return 'bg-blue-500/20 text-blue-300';
    case 'Churn Risk': return 'bg-yellow-500/20 text-yellow-300';
    case 'Lost': return 'bg-red-500/20 text-red-300';
    default: return 'bg-gray-500/20 text-gray-300';
  }
};

export const getPriorityClass = (priority: TaskPriority): string => {
    switch (priority) {
        case 'High': return 'text-red-400';
        case 'Medium': return 'text-yellow-400';
        case 'Low': return 'text-gray-400';
        default: return 'text-gray-400';
    }
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// 5. SVG ICON COMPONENTS
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

export const IconSearch: FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

export const IconFilter: FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L15 12.414V19a1 1 0 01-.293.707l-4 4A1 1 0 019 23v-6.586l-5.707-5.707A1 1 0 013 10V4z" />
  </svg>
);

export const IconChevronDown: FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

export const IconChevronUp: FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
  </svg>
);

export const IconClose: FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);


// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// 6. UI COMPONENTS
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// 6.1. Generic Components

export const LoadingSpinner: FC = () => (
  <div className="flex justify-center items-center p-8">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-500"></div>
  </div>
);

export interface Notification {
  id: number;
  message: string;
  type: 'success' | 'error';
}

export const NotificationToast: FC<{ notification: Notification | null; onDismiss: (id: number) => void }> = ({ notification, onDismiss }) => {
  if (!notification) return null;

  const baseClasses = "fixed top-5 right-5 p-4 rounded-lg shadow-lg text-white z-50 transition-opacity duration-300";
  const typeClasses = notification.type === 'success' ? 'bg-green-600' : 'bg-red-600';

  return (
    <div className={`${baseClasses} ${typeClasses}`}>
      <span>{notification.message}</span>
      <button onClick={() => onDismiss(notification.id)} className="ml-4 font-bold">X</button>
    </div>
  );
};

export const Pagination: FC<{ currentPage: number; totalItems: number; itemsPerPage: number; onPageChange: (page: number) => void; }> = ({ currentPage, totalItems, itemsPerPage, onPageChange }) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  if (totalPages <= 1) return null;

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <nav className="flex justify-center items-center space-x-2 mt-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 rounded-md bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white"
      >
        Previous
      </button>
      {pageNumbers.map(number => (
        <button
          key={number}
          onClick={() => onPageChange(number)}
          className={`px-3 py-1 rounded-md ${currentPage === number ? 'bg-cyan-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}
        >
          {number}
        </button>
      ))}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 rounded-md bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white"
      >
        Next
      </button>
    </nav>
  );
};

export const Modal: FC<{ isOpen: boolean; onClose: () => void; title: string; children: ReactNode }> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-40 flex justify-center items-center" onClick={onClose}>
            <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex justify-between items-center p-4 border-b border-gray-700">
                    <h3 className="text-xl font-bold text-white">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <IconClose className="h-6 w-6" />
                    </button>
                </header>
                <main className="p-6 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};

// 6.2. Feature-Specific Components

export type CustomerSortKey = keyof Customer;
export type SortOrder = 'asc' | 'desc';
export type CustomerFilters = {
    name: string;
    status: CustomerStatus | '';
    salespersonId: string;
};

export const AdvancedFilters: FC<{
  filters: CustomerFilters;
  onFilterChange: (filters: CustomerFilters) => void;
  onReset: () => void;
}> = ({ filters, onFilterChange, onReset }) => {
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        onFilterChange({
            ...filters,
            [e.target.name]: e.target.value
        });
    };

    return (
        <Card>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                <div className="relative">
                    <label htmlFor="name" className="text-xs text-gray-400">Customer Name</label>
                    <IconSearch className="absolute h-5 w-5 text-gray-500 top-7 left-3" />
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={filters.name}
                        onChange={handleInputChange}
                        placeholder="Search by name..."
                        className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                </div>
                <div>
                    <label htmlFor="status" className="text-xs text-gray-400">Status</label>
                    <select
                        id="status"
                        name="status"
                        value={filters.status}
                        onChange={handleInputChange}
                        className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                        <option value="">All Statuses</option>
                        <option value="Active">Active</option>
                        <option value="Prospect">Prospect</option>
                        <option value="Churn Risk">Churn Risk</option>
                        <option value="Lost">Lost</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="salespersonId" className="text-xs text-gray-400">Assigned Salesperson</label>
                    <select
                        id="salespersonId"
                        name="salespersonId"
                        value={filters.salespersonId}
                        onChange={handleInputChange}
                        className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                        <option value="">All Salespeople</option>
                        {salesTeam.map(sp => <option key={sp.id} value={sp.id}>{sp.name}</option>)}
                    </select>
                </div>
                <button
                    onClick={onReset}
                    className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-md transition-colors"
                >
                    Reset Filters
                </button>
            </div>
        </Card>
    );
};

export const CustomerTable: FC<{
  customers: Customer[];
  onSort: (key: CustomerSortKey) => void;
  sortConfig: { key: CustomerSortKey; order: SortOrder };
  onRowClick: (customer: Customer) => void;
}> = ({ customers, onSort, sortConfig, onRowClick }) => {
  const SortableHeader: FC<{ columnKey: CustomerSortKey; children: ReactNode }> = ({ columnKey, children }) => {
    const isSorted = sortConfig.key === columnKey;
    return (
      <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => onSort(columnKey)}>
        <div className="flex items-center">
            {children}
            {isSorted ? (sortConfig.order === 'asc' ? <IconChevronUp className="h-4 w-4 ml-1" /> : <IconChevronDown className="h-4 w-4 ml-1" />) : null}
        </div>
      </th>
    );
  };

  return (
    <Card title="Customer Database">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-400">
          <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
            <tr>
              <SortableHeader columnKey="name">Customer Name</SortableHeader>
              <SortableHeader columnKey="LTV">LTV</SortableHeader>
              <SortableHeader columnKey="status">Status</SortableHeader>
              <SortableHeader columnKey="joinDate">Join Date</SortableHeader>
              <th scope="col" className="px-6 py-3">Industry</th>
            </tr>
          </thead>
          <tbody>
            {customers.map(customer => (
              <tr key={customer.id} className="border-b border-gray-800 hover:bg-gray-800/50 cursor-pointer" onClick={() => onRowClick(customer)}>
                <td className="px-6 py-4 font-medium text-white">{customer.name}</td>
                <td className="px-6 py-4 font-mono">{formatCurrency(customer.LTV)}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusChipClass(customer.status)}`}>
                    {customer.status}
                  </span>
                </td>
                <td className="px-6 py-4">{formatDate(customer.joinDate)}</td>
                <td className="px-6 py-4">{customer.industry}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export const CustomerDetailView: FC<{ customer: Customer | null }> = ({ customer }) => {
    if (!customer) return null;

    const assignedSalesperson = salesTeam.find(s => s.id === customer.assignedSalespersonId);
    
    return (
        <div className="text-gray-300 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column: Basic Info */}
                <div className="md:col-span-1 space-y-4">
                    <div>
                        <h4 className="font-bold text-white">Contact Info</h4>
                        <p>{customer.primaryContact.name}</p>
                        <p className="text-cyan-400">{customer.primaryContact.email}</p>
                        <p>{customer.primaryContact.phone}</p>
                    </div>
                     <div>
                        <h4 className="font-bold text-white">Address</h4>
                        <p>{customer.address.street}</p>
                        <p>{customer.address.city}, {customer.address.state} {customer.address.zip}</p>
                    </div>
                    <div>
                        <h4 className="font-bold text-white">Assigned To</h4>
                        <div className="flex items-center space-x-2 mt-1">
                            <img src={assignedSalesperson?.avatarUrl} alt={assignedSalesperson?.name} className="h-8 w-8 rounded-full" />
                            <span>{assignedSalesperson?.name}</span>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-bold text-white">NPS Score</h4>
                        <p className="text-2xl font-bold text-white">{customer.npsScore || 'N/A'}/10</p>
                    </div>
                </div>

                {/* Right Column: Holdings & Interactions */}
                <div className="md:col-span-2 space-y-6">
                    <div>
                        <h4 className="font-bold text-white text-lg mb-2">Product Holdings</h4>
                        <div className="space-y-2">
                        {customer.productHoldings.map(p => (
                            <div key={p.productType} className="p-3 bg-gray-800 rounded-md flex justify-between items-center">
                                <div>
                                    <p className="font-semibold text-white">{p.productType}</p>
                                    <p className="text-xs text-gray-400">Opened: {formatDate(p.openDate)}</p>
                                </div>
                                <p className="font-mono text-lg text-cyan-400">{formatCurrency(p.value)}</p>
                            </div>
                        ))}
                        </div>
                    </div>
                     <div>
                        <h4 className="font-bold text-white text-lg mb-2">Recent Interactions</h4>
                        <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                        {customer.interactions.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(i => (
                            <div key={i.id} className="p-3 bg-gray-800 rounded-md">
                                <div className="flex justify-between items-center text-xs">
                                    <p className="font-bold text-cyan-400">{i.type}</p>
                                    <p className="text-gray-400">{formatDate(i.date)}</p>
                                </div>
                                <p className="mt-2 text-sm">{i.notes}</p>
                            </div>
                        ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const ActivityFeed: FC<{ tasks: Task[]; onTaskStatusChange: (taskId: string, status: TaskStatus) => void; }> = ({ tasks, onTaskStatusChange }) => {
    return (
        <Card title="My Upcoming Tasks">
            <div className="space-y-3 max-h-96 overflow-y-auto">
                {tasks.filter(t => t.status !== 'Completed').slice(0, 10).map(task => (
                    <div key={task.id} className="p-3 bg-gray-800/50 rounded-md">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className={`font-semibold ${getPriorityClass(task.priority)}`}>{task.title}</p>
                                <p className="text-xs text-gray-400">Due: {formatDate(task.dueDate)}</p>
                                {task.relatedCustomerId && <p className="text-xs text-gray-500">For: {mockCustomers.find(c => c.id === task.relatedCustomerId)?.name}</p>}
                            </div>
                            <select 
                                value={task.status}
                                onChange={(e) => onTaskStatusChange(task.id, e.target.value as TaskStatus)}
                                className="bg-gray-700 text-xs text-white rounded p-1 border border-gray-600 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                            >
                                <option>Not Started</option>
                                <option>In Progress</option>
                                <option>Completed</option>
                            </select>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
};

export const LeadCaptureForm: FC<{ onLeadSubmit: (lead: Omit<Lead, 'id' | 'createdDate'>) => Promise<void>, isSubmitting: boolean }> = ({ onLeadSubmit, isSubmitting }) => {
    const [formData, setFormData] = useState({
        companyName: '',
        contactPerson: '',
        contactEmail: '',
        estimatedValue: '',
        source: 'Website' as LeadSource,
        status: 'New' as Lead['status'],
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onLeadSubmit({
            ...formData,
            estimatedValue: Number(formData.estimatedValue)
        });
        // Reset form
        setFormData({
            companyName: '',
            contactPerson: '',
            contactEmail: '',
            estimatedValue: '',
            source: 'Website',
            status: 'New',
        });
    };

    return (
        <Card title="Add New Lead">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} placeholder="Company Name" required className="input-style" />
                    <input type="text" name="contactPerson" value={formData.contactPerson} onChange={handleChange} placeholder="Contact Person" required className="input-style" />
                    <input type="email" name="contactEmail" value={formData.contactEmail} onChange={handleChange} placeholder="Contact Email" required className="input-style" />
                    <input type="number" name="estimatedValue" value={formData.estimatedValue} onChange={handleChange} placeholder="Estimated Value ($)" required className="input-style" />
                </div>
                 <select name="source" value={formData.source} onChange={handleChange} className="input-style w-full">
                    <option>Website</option>
                    <option>Referral</option>
                    <option>Cold Call</option>
                    <option>Trade Show</option>
                    <option>Advertisement</option>
                </select>
                <button type="submit" disabled={isSubmitting} className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded transition-colors disabled:bg-gray-500">
                    {isSubmitting ? 'Adding...' : 'Add Lead'}
                </button>
            </form>
        </Card>
    );
};

export const TeamPerformanceChart: FC = () => {
    const data = salesTeam.map(s => ({
        name: s.name.split(' ')[0], // First name
        dealsClosed: getRandomNumber(10, 50),
        revenue: getRandomNumber(100000, 800000)
    }));
    return (
        <Card title="Sales Team Performance (YTD)">
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9ca3af" />
                    <YAxis yAxisId="left" orientation="left" stroke="#818cf8" label={{ value: 'Revenue ($)', angle: -90, position: 'insideLeft', fill: '#9ca3af' }} />
                    <YAxis yAxisId="right" orientation="right" stroke="#60a5fa" label={{ value: 'Deals Closed', angle: 90, position: 'insideRight', fill: '#9ca3af' }}/>
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }} />
                    <Legend />
                    <Bar yAxisId="left" dataKey="revenue" fill="#818cf8" name="Revenue" />
                    <Bar yAxisId="right" dataKey="dealsClosed" fill="#60a5fa" name="Deals Closed" />
                </BarChart>
            </ResponsiveContainer>
        </Card>
    );
}

export const RevenueGrowthChart: FC = () => {
    const data = Array.from({ length: 12 }, (_, i) => ({
        month: new Date(2023, i, 1).toLocaleString('default', { month: 'short' }),
        mrr: 450000 + (i * 15000) + getRandomNumber(-10000, 10000),
    }));
    return (
        <Card title="Monthly Recurring Revenue (MRR)">
            <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="colorMrr" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <XAxis dataKey="month" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" tickFormatter={(value) => `$${Number(value) / 1000}k`} />
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151"/>
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }} formatter={(value: number) => formatCurrency(value)} />
                    <Area type="monotone" dataKey="mrr" stroke="#10b981" fillOpacity={1} fill="url(#colorMrr)" />
                </AreaChart>
            </ResponsiveContainer>
        </Card>
    );
};

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// 7. MAIN VIEW COMPONENT
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

const DemoBankCRMView: React.FC = () => {
    // STATE MANAGEMENT
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [totalCustomers, setTotalCustomers] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState<{ key: CustomerSortKey; order: SortOrder }>({ key: 'LTV', order: 'desc' });
    const [filters, setFilters] = useState<CustomerFilters>({ name: '', status: '', salespersonId: '' });
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const ITEMS_PER_PAGE = 10;
    
    // DATA FETCHING HOOK
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const [metricsData, customerData, tasksData] = await Promise.all([
                    apiService.fetchDashboardMetrics(),
                    apiService.fetchCustomers({ page: currentPage, limit: ITEMS_PER_PAGE, sort: sortConfig, filters }),
                    apiService.fetchTasks()
                ]);
                setMetrics(metricsData);
                setCustomers(customerData.customers);
                setTotalCustomers(customerData.total);
                setTasks(tasksData);
                setError(null);
            } catch (err) {
                setError("Failed to fetch CRM data. Please try again later.");
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [currentPage, sortConfig, filters]);

    // NOTIFICATION HANDLER
    const addNotification = useCallback((message: string, type: 'success' | 'error') => {
        const newNotif = { id: Date.now(), message, type };
        setNotifications(prev => [...prev, newNotif]);
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== newNotif.id));
        }, 5000);
    }, []);
    
    // EVENT HANDLERS
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleSort = (key: CustomerSortKey) => {
        setSortConfig(prevConfig => ({
            key,
            order: prevConfig.key === key && prevConfig.order === 'asc' ? 'desc' : 'asc'
        }));
    };

    const handleFilterChange = useCallback((newFilters: CustomerFilters) => {
        setCurrentPage(1);
        setFilters(newFilters);
    }, []);
    
    const handleFilterReset = useCallback(() => {
        setCurrentPage(1);
        setFilters({ name: '', status: '', salespersonId: '' });
    }, []);

    const handleTaskStatusChange = async (taskId: string, status: TaskStatus) => {
        const originalTasks = [...tasks];
        // Optimistic update
        setTasks(prevTasks => prevTasks.map(t => t.id === taskId ? { ...t, status } : t));
        try {
            await apiService.updateTaskStatus(taskId, status);
            addNotification('Task updated successfully!', 'success');
        } catch (error) {
            console.error(error);
            setTasks(originalTasks); // Revert on failure
            addNotification('Failed to update task.', 'error');
        }
    };
    
    const handleLeadSubmit = async (leadData: Omit<Lead, 'id' | 'createdDate'>) => {
        setIsSubmitting(true);
        try {
            await apiService.createLead(leadData);
            addNotification(`Lead for ${leadData.companyName} created successfully!`, 'success');
        } catch (error) {
            console.error(error);
            addNotification('Failed to create lead.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    if (error) {
        return <div className="text-center text-red-400 p-8">{error}</div>;
    }

    return (
        <div className="space-y-6">
            {notifications.map(n => <NotificationToast key={n.id} notification={n} onDismiss={() => setNotifications(prev => prev.filter(notif => notif.id !== n.id))} />)}
            
            <Modal isOpen={!!selectedCustomer} onClose={() => setSelectedCustomer(null)} title={selectedCustomer?.name || 'Customer Details'}>
                <CustomerDetailView customer={selectedCustomer} />
            </Modal>

            <h2 className="text-3xl font-bold text-white tracking-wider">Demo Bank CRM Dashboard</h2>
            
            {isLoading && !metrics ? <LoadingSpinner /> : metrics && (
                 <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
                    <Card className="text-center"><p className="text-3xl font-bold text-white">{metrics.newLeads30d}</p><p className="text-sm text-gray-400 mt-1">New Leads (30d)</p></Card>
                    <Card className="text-center"><p className="text-3xl font-bold text-white">{metrics.conversionRate}%</p><p className="text-sm text-gray-400 mt-1">Conversion Rate</p></Card>
                    <Card className="text-center"><p className="text-3xl font-bold text-white">{metrics.customerSatisfaction}%</p><p className="text-sm text-gray-400 mt-1">Customer Satisfaction</p></Card>
                    <Card className="text-center"><p className="text-3xl font-bold text-white">{formatCurrency(metrics.pipelineValue)}</p><p className="text-sm text-gray-400 mt-1">Pipeline Value</p></Card>
                    <Card className="text-center"><p className="text-3xl font-bold text-white">{formatCurrency(metrics.monthlyRecurringRevenue)}</p><p className="text-sm text-gray-400 mt-1">MRR</p></Card>
                    <Card className="text-center"><p className="text-3xl font-bold text-white">{metrics.churnRate}%</p><p className="text-sm text-gray-400 mt-1">Churn Rate</p></Card>
                    <Card className="text-center"><p className="text-3xl font-bold text-white">{metrics.avgResponseTimeHours}h</p><p className="text-sm text-gray-400 mt-1">Avg. Response Time</p></Card>
                    <Card className="text-center"><p className="text-3xl font-bold text-white">{metrics.teamQuotaAttainment}%</p><p className="text-sm text-gray-400 mt-1">Team Quota Attainment</p></Card>
                </div>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 space-y-6">
                    <RevenueGrowthChart />
                    <TeamPerformanceChart />
                </div>
                <div className="lg:col-span-2 space-y-6">
                    <Card title="Sales Pipeline">
                        <ResponsiveContainer width="100%" height={300}>
                            <FunnelChart>
                                <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }} />
                                <Funnel dataKey="value" data={pipelineData} isAnimationActive>
                                    <LabelList position="right" fill="#fff" stroke="none" dataKey="name" />
                                </Funnel>
                            </FunnelChart>
                        </ResponsiveContainer>
                    </Card>
                    <ActivityFeed tasks={tasks} onTaskStatusChange={handleTaskStatusChange} />
                    <LeadCaptureForm onLeadSubmit={handleLeadSubmit} isSubmitting={isSubmitting}/>
                </div>
            </div>
            
            <div className="space-y-6">
                <AdvancedFilters filters={filters} onFilterChange={handleFilterChange} onReset={handleFilterReset} />
                {isLoading && customers.length === 0 ? <LoadingSpinner /> : 
                <>
                    <CustomerTable 
                        customers={customers} 
                        onSort={handleSort} 
                        sortConfig={sortConfig} 
                        onRowClick={(customer) => setSelectedCustomer(customer)} 
                    />
                    <Pagination
                        currentPage={currentPage}
                        totalItems={totalCustomers}
                        itemsPerPage={ITEMS_PER_PAGE}
                        onPageChange={handlePageChange}
                    />
                </>
                }
            </div>
        </div>
    );
};

export default DemoBankCRMView;
