// components/views/platform/DemoBankBookingsView.tsx
import React, { useState, useReducer, useEffect, useMemo, useCallback, useRef } from 'react';
import Card from '../../Card';
import { GoogleGenAI } from "@google/genai";

// NOTE: In a real app, this data would come from a dedicated file e.g., /data/platform/bookingsData.ts
const appointments = [
    { time: '10:00 AM', service: 'Financial Consultation', client: 'Alex Chen', status: 'Confirmed' },
    { time: '11:00 AM', service: 'API Integration Support', client: 'Brenda Rodriguez', status: 'Confirmed' },
    { time: '02:00 PM', service: 'Mortgage Application Review', client: 'Charles Davis', status: 'Tentative' },
];

// START OF EXPANDED CODE

// ===================================================================================
// TYPE DEFINITIONS FOR A REAL-WORLD APPLICATION
// ===================================================================================

export type AppointmentStatus = 'Confirmed' | 'Tentative' | 'Completed' | 'Canceled' | 'No-Show';
export type StaffRole = 'Financial Advisor' | 'Mortgage Specialist' | 'Technical Support' | 'Branch Manager';
export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Client {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    joinDate: Date;
    notes: string;
    totalBookings: number;
    preferredContactMethod: 'email' | 'phone';
}

export interface Staff {
    id: string;
    firstName: string;
    lastName: string;
    role: StaffRole;
    email: string;
    availability: Record<string, { start: string; end: string }[]>; // e.g., { "monday": [{ start: "09:00", end: "17:00" }] }
    specialties: string[];
}

export interface BankService {
    id: string;
    name: string;
    durationMinutes: number;
    description: string;
    requiresSpecialistRole?: StaffRole;
    cost: number;
    category: 'Financial' | 'Technical' | 'Mortgage' | 'General';
}

export interface Appointment {
    id: string;
    clientId: string;
    staffId: string;
    serviceId: string;
    startTime: Date;
    endTime: Date;
    status: AppointmentStatus;
    notes: string;
    createdAt: Date;
    updatedAt: Date;
    communicationHistory: {
        type: 'email' | 'sms' | 'call';
        content: string;
        timestamp: Date;
    }[];
}

export interface Notification {
    id: number;
    message: string;
    type: NotificationType;
}

export interface AppState {
    clients: Client[];
    staff: Staff[];
    services: BankService[];
    appointments: Appointment[];
    notifications: Notification[];
    isLoading: boolean;
    error: string | null;
}

// ===================================================================================
// MOCK DATA GENERATION
// ===================================================================================

export const MOCK_SERVICES: BankService[] = [
    { id: 'service-1', name: 'Financial Consultation', durationMinutes: 60, description: 'In-depth financial planning and investment advice.', cost: 250, category: 'Financial', requiresSpecialistRole: 'Financial Advisor' },
    { id: 'service-2', name: 'API Integration Support', durationMinutes: 90, description: 'Technical support for integrating with our banking APIs.', cost: 400, category: 'Technical', requiresSpecialistRole: 'Technical Support' },
    { id: 'service-3', name: 'Mortgage Application Review', durationMinutes: 60, description: 'Review and guidance on mortgage applications.', cost: 150, category: 'Mortgage', requiresSpecialistRole: 'Mortgage Specialist' },
    { id: 'service-4', name: 'New Account Opening', durationMinutes: 30, description: 'Open a new personal or business account.', cost: 0, category: 'General' },
    { id: 'service-5', name: 'Wealth Management Strategy', durationMinutes: 120, description: 'Comprehensive wealth management and estate planning.', cost: 750, category: 'Financial', requiresSpecialistRole: 'Financial Advisor' },
    { id: 'service-6', name: 'Small Business Loan Application', durationMinutes: 90, description: 'Assistance with the small business loan application process.', cost: 300, category: 'Mortgage' },
];

export const MOCK_STAFF: Staff[] = [
    { id: 'staff-1', firstName: 'John', lastName: 'Miller', role: 'Financial Advisor', email: 'john.miller@demobank.com', availability: { 'monday': [{ start: '09:00', end: '17:00' }], 'tuesday': [{ start: '09:00', end: '17:00' }], 'wednesday': [{ start: '09:00', end: '17:00' }], 'thursday': [{ start: '09:00', end: '17:00' }], 'friday': [{ start: '09:00', end: '17:00' }] }, specialties: ['Investment', 'Retirement Planning'] },
    { id: 'staff-2', firstName: 'Sarah', lastName: 'Chen', role: 'Technical Support', email: 'sarah.chen@demobank.com', availability: { 'monday': [{ start: '09:00', end: '17:00' }], 'tuesday': [{ start: '10:00', end: '18:00' }], 'wednesday': [{ start: '09:00', end: '17:00' }], 'thursday': [{ start: '10:00', end: '18:00' }], 'friday': [{ start: '09:00', end: '17:00' }] }, specialties: ['REST APIs', 'OAuth2'] },
    { id: 'staff-3', firstName: 'David', lastName: 'Lee', role: 'Mortgage Specialist', email: 'david.lee@demobank.com', availability: { 'monday': [{ start: '08:30', end: '16:30' }], 'tuesday': [{ start: '08:30', end: '16:30' }], 'wednesday': [{ start: '08:30', end: '12:30' }], 'thursday': [{ start: '08:30', end: '16:30' }], 'friday': [{ start: '08:30', end: '16:30' }] }, specialties: ['FHA Loans', 'Jumbo Loans'] },
    { id: 'staff-4', firstName: 'Maria', lastName: 'Garcia', role: 'Branch Manager', email: 'maria.garcia@demobank.com', availability: { 'monday': [{ start: '09:00', end: '17:00' }], 'tuesday': [{ start: '09:00', end: '17:00' }], 'wednesday': [{ start: '09:00', end: '17:00' }], 'thursday': [{ start: '09:00', end: '17:00' }], 'friday': [{ start: '09:00', end: '17:00' }] }, specialties: ['Operations', 'Customer Relations'] },
];

export const MOCK_CLIENTS: Client[] = [
    { id: 'client-1', firstName: 'Alex', lastName: 'Chen', email: 'alex.chen@example.com', phone: '555-0101', joinDate: new Date('2022-03-15'), notes: 'Interested in tech stocks.', totalBookings: 3, preferredContactMethod: 'email' },
    { id: 'client-2', firstName: 'Brenda', lastName: 'Rodriguez', email: 'brenda.r@example.com', phone: '555-0102', joinDate: new Date('2021-11-20'), notes: 'Developing a new fintech app.', totalBookings: 5, preferredContactMethod: 'email' },
    { id: 'client-3', firstName: 'Charles', lastName: 'Davis', email: 'charles.d@example.com', phone: '555-0103', joinDate: new Date('2023-01-10'), notes: 'First-time home buyer.', totalBookings: 1, preferredContactMethod: 'phone' },
    { id: 'client-4', firstName: 'Diana', lastName: 'Prince', email: 'diana.p@example.com', phone: '555-0104', joinDate: new Date('2020-07-22'), notes: 'High net worth individual. Requires discretion.', totalBookings: 12, preferredContactMethod: 'email' },
];

/**
 * Generates a set of mock appointments for demonstration purposes.
 * @returns An array of Appointment objects.
 */
export const generateMockAppointments = (): Appointment[] => {
    const appointments: Appointment[] = [];
    const today = new Date();
    const statuses: AppointmentStatus[] = ['Confirmed', 'Completed', 'Tentative', 'Canceled'];

    for (let i = 0; i < 150; i++) {
        const dayOffset = Math.floor(Math.random() * 60) - 30; // -30 to +29 days from today
        const hour = Math.floor(Math.random() * 9) + 9; // 9 AM to 5 PM
        const minute = Math.random() > 0.5 ? 30 : 0;

        const startTime = new Date(today.getFullYear(), today.getMonth(), today.getDate() + dayOffset, hour, minute);
        
        const client = MOCK_CLIENTS[i % MOCK_CLIENTS.length];
        const service = MOCK_SERVICES[i % MOCK_SERVICES.length];
        let staff = MOCK_STAFF[i % MOCK_STAFF.length];
        if (service.requiresSpecialistRole) {
            const suitableStaff = MOCK_STAFF.filter(s => s.role === service.requiresSpecialistRole);
            if(suitableStaff.length > 0) {
                staff = suitableStaff[i % suitableStaff.length];
            }
        }
        
        const endTime = new Date(startTime.getTime() + service.durationMinutes * 60000);
        
        // Make past appointments 'Completed'
        let status: AppointmentStatus = statuses[i % statuses.length];
        if (startTime < new Date()) {
            status = 'Completed';
            if (Math.random() < 0.05) status = 'No-Show'; // 5% no-show rate
        }

        appointments.push({
            id: `appt-${i + 1}`,
            clientId: client.id,
            staffId: staff.id,
            serviceId: service.id,
            startTime,
            endTime,
            status,
            notes: `This is a mock note for appointment ${i + 1}.`,
            createdAt: new Date(startTime.getTime() - 7 * 24 * 60 * 60000), // Created a week before
            updatedAt: new Date(),
            communicationHistory: [
                { type: 'email', content: 'Initial booking confirmation sent.', timestamp: new Date(startTime.getTime() - 7 * 24 * 60 * 60000 + 10000) },
                { type: 'sms', content: 'Reminder sent 24 hours before.', timestamp: new Date(startTime.getTime() - 1 * 24 * 60 * 60000) }
            ]
        });
    }

    return appointments;
};


// ===================================================================================
// UTILITY FUNCTIONS
// ===================================================================================
export const DateUtils = {
    formatDate: (date: Date): string => {
        return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(date);
    },
    formatTime: (date: Date): string => {
        return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }).format(date);
    },
    isSameDay: (d1: Date, d2: Date): boolean => {
        return d1.getFullYear() === d2.getFullYear() &&
               d1.getMonth() === d2.getMonth() &&
               d1.getDate() === d2.getDate();
    },
    getStartOfWeek: (date: Date): Date => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
        return new Date(d.setDate(diff));
    },
    getDaysInMonth: (year: number, month: number): Date[] => {
        const date = new Date(year, month, 1);
        const days: Date[] = [];
        while (date.getMonth() === month) {
            days.push(new Date(date));
            date.setDate(date.getDate() + 1);
        }
        return days;
    },
    addDays: (date: Date, days: number): Date => {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    },
    getTimeSlots: (start: string, end: string, interval: number): string[] => {
        const slots = [];
        let [startHour, startMinute] = start.split(':').map(Number);
        const [endHour, endMinute] = end.split(':').map(Number);
    
        let currentTime = new Date();
        currentTime.setHours(startHour, startMinute, 0, 0);
    
        const endTime = new Date();
        endTime.setHours(endHour, endMinute, 0, 0);
    
        while (currentTime < endTime) {
            slots.push(
                currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
            );
            currentTime.setMinutes(currentTime.getMinutes() + interval);
        }
        return slots;
    }
};

// ===================================================================================
// AI INTEGRATION SERVICE
// ===================================================================================

export class AIIntegrationService {
    private ai: GoogleGenAI;
    private static instance: AIIntegrationService;

    private constructor() {
        if (!process.env.API_KEY) {
            console.error("API_KEY environment variable not set for AIIntegrationService.");
            // In a real app, you might have a fallback or a more robust error handling
        }
        this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    }

    public static getInstance(): AIIntegrationService {
        if (!AIIntegrationService.instance) {
            AIIntegrationService.instance = new AIIntegrationService();
        }
        return AIIntegrationService.instance;
    }

    private async generateContent(prompt: string): Promise<string> {
        try {
            const response = await this.ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
            return response.text;
        } catch (error) {
            console.error("AI content generation failed:", error);
            throw new Error("Failed to generate content from AI model.");
        }
    }

    public async generateBookingConfirmation(details: { serviceName: string; clientName: string; time: string }): Promise<string> {
        const prompt = `
            Generate a friendly and professional booking confirmation message for a client for our bank, "Demo Bank".
            Service: "${details.serviceName}"
            Client Name: "${details.clientName}"
            Time: "${details.time}"
            
            The message should:
            1. Confirm the booking details clearly.
            2. Thank the client for their booking.
            3. Include a section on "How to Prepare" which might involve bringing specific documents or thinking about certain financial goals. Be creative but relevant to the service.
            4. Provide contact information for rescheduling.
            5. Be professional, yet warm and welcoming in tone.
        `;
        return this.generateContent(prompt);
    }

    public async summarizeClientHistory(client: Client, appointments: Appointment[]): Promise<string> {
        const prompt = `
            Summarize the history of the client "${client.firstName} ${client.lastName}" for a financial advisor at Demo Bank.
            
            Client Details:
            - Joined: ${DateUtils.formatDate(client.joinDate)}
            - Total Bookings: ${client.totalBookings}
            - Notes: ${client.notes}

            Past Appointments:
            ${appointments.map(a => `- ${DateUtils.formatDate(a.startTime)}: ${MOCK_SERVICES.find(s=>s.id === a.serviceId)?.name} (Status: ${a.status})`).join('\n')}

            Generate a concise summary covering:
            1. The client's relationship length and engagement level.
            2. Key services they have used in the past.
            3. Any notable patterns or points from their notes.
            4. Potential future needs or services to suggest.
        `;
        return this.generateContent(prompt);
    }
    
    public async suggestAppointmentTime(service: BankService, staff: Staff, existingAppointments: Appointment[]): Promise<string> {
        const prompt = `
            As an intelligent scheduling assistant for Demo Bank, suggest three optimal appointment slots for a client.
            
            Requested Service: "${service.name}" (Duration: ${service.durationMinutes} minutes)
            Assigned Staff: "${staff.firstName} ${staff.lastName}" (${staff.role})
            
            Staff Availability (next 7 days):
            ${Object.entries(staff.availability).map(([day, slots]) => `- ${day}: ${slots.map(s => `${s.start}-${s.end}`).join(', ')}`).join('\n')}
            
            Existing Appointments for this staff member (next 7 days):
            ${existingAppointments.map(a => `- ${a.startTime.toISOString()}`).join('\n')}
            
            Task:
            1. Analyze the staff's availability and existing appointments.
            2. Find three open slots that can accommodate the ${service.durationMinutes}-minute service.
            3. Prioritize slots that are not immediately back-to-back with other appointments if possible, to allow for preparation.
            4. Present the suggestions in a friendly, client-facing format, including the day of the week, date, and time.
            
            Example output format:
            "Here are a few suggested times for your ${service.name} appointment with ${staff.firstName}:
            - Monday, July 29th at 10:00 AM
            - Tuesday, July 30th at 02:30 PM
            - Thursday, August 1st at 11:00 AM"
        `;
        return this.generateContent(prompt);
    }
}


// ===================================================================================
// STATE MANAGEMENT (useReducer)
// ===================================================================================
type Action =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: { clients: Client[], staff: Staff[], services: BankService[], appointments: Appointment[] } }
  | { type: 'FETCH_ERROR'; payload: string }
  | { type: 'ADD_APPOINTMENT'; payload: Appointment }
  | { type: 'UPDATE_APPOINTMENT'; payload: Appointment }
  | { type: 'DELETE_APPOINTMENT'; payload: string }
  | { type: 'ADD_NOTIFICATION'; payload: Omit<Notification, 'id'> }
  | { type: 'REMOVE_NOTIFICATION'; payload: number };


const initialState: AppState = {
    clients: [],
    staff: [],
    services: [],
    appointments: [],
    notifications: [],
    isLoading: true,
    error: null,
};

function appReducer(state: AppState, action: Action): AppState {
    switch (action.type) {
        case 'FETCH_START':
            return { ...state, isLoading: true, error: null };
        case 'FETCH_SUCCESS':
            return {
                ...state,
                isLoading: false,
                clients: action.payload.clients,
                staff: action.payload.staff,
                services: action.payload.services,
                appointments: action.payload.appointments,
            };
        case 'FETCH_ERROR':
            return { ...state, isLoading: false, error: action.payload };
        case 'ADD_APPOINTMENT':
            return { ...state, appointments: [...state.appointments, action.payload] };
        case 'UPDATE_APPOINTMENT':
            return {
                ...state,
                appointments: state.appointments.map(appt =>
                    appt.id === action.payload.id ? action.payload : appt
                ),
            };
        case 'DELETE_APPOINTMENT':
            return {
                ...state,
                appointments: state.appointments.filter(appt => appt.id !== action.payload),
            };
        case 'ADD_NOTIFICATION':
            return {
                ...state,
                notifications: [...state.notifications, { ...action.payload, id: Date.now() }],
            };
        case 'REMOVE_NOTIFICATION':
            return {
                ...state,
                notifications: state.notifications.filter(n => n.id !== action.payload),
            };
        default:
            return state;
    }
}

// ===================================================================================
// CUSTOM HOOK for managing application logic
// ===================================================================================
export const useBookingManager = () => {
    const [state, dispatch] = useReducer(appReducer, initialState);

    useEffect(() => {
        // Simulate an async API call to fetch initial data
        dispatch({ type: 'FETCH_START' });
        const timer = setTimeout(() => {
            try {
                const mockAppointments = generateMockAppointments();
                dispatch({
                    type: 'FETCH_SUCCESS',
                    payload: {
                        clients: MOCK_CLIENTS,
                        staff: MOCK_STAFF,
                        services: MOCK_SERVICES,
                        appointments: mockAppointments,
                    }
                });
            } catch (err) {
                dispatch({ type: 'FETCH_ERROR', payload: 'Failed to load initial data.' });
            }
        }, 1500);
        return () => clearTimeout(timer);
    }, []);
    
    const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
        dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
    }, []);

    const removeNotification = useCallback((id: number) => {
        dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
    }, []);
    
    const createAppointment = useCallback(async (data: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt' | 'communicationHistory'>) => {
        // Simulate API call
        return new Promise<Appointment>((resolve) => {
            setTimeout(() => {
                const newAppointment: Appointment = {
                    ...data,
                    id: `appt-${Date.now()}`,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    communicationHistory: [],
                };
                dispatch({ type: 'ADD_APPOINTMENT', payload: newAppointment });
                addNotification({ message: 'Appointment created successfully!', type: 'success' });
                resolve(newAppointment);
            }, 500);
        });
    }, [addNotification]);

    const updateAppointment = useCallback(async (appointment: Appointment) => {
        return new Promise<Appointment>((resolve) => {
            setTimeout(() => {
                const updatedAppointment = { ...appointment, updatedAt: new Date() };
                dispatch({ type: 'UPDATE_APPOINTMENT', payload: updatedAppointment });
                addNotification({ message: 'Appointment updated!', type: 'info' });
                resolve(updatedAppointment);
            }, 500);
        });
    }, [addNotification]);
    
    const cancelAppointment = useCallback(async (appointmentId: string, reason: string) => {
        const appointment = state.appointments.find(a => a.id === appointmentId);
        if (appointment) {
            const updatedAppointment: Appointment = {
                ...appointment,
                status: 'Canceled',
                notes: `${appointment.notes}\nCanceled: ${reason}`,
                updatedAt: new Date(),
                communicationHistory: [
                    ...appointment.communicationHistory,
                    { type: 'email', content: `Appointment canceled. Reason: ${reason}`, timestamp: new Date() }
                ]
            };
            await updateAppointment(updatedAppointment);
            addNotification({ message: `Appointment with ${state.clients.find(c=>c.id === appointment.clientId)?.firstName} canceled.`, type: 'warning' });
        }
    }, [state.appointments, state.clients, updateAppointment, addNotification]);

    return { state, dispatch, createAppointment, updateAppointment, cancelAppointment, addNotification, removeNotification };
};


// ===================================================================================
// SUB-COMPONENTS for the View
// ===================================================================================

export interface NotificationToastProps {
    notification: Notification;
    onDismiss: (id: number) => void;
}
export const NotificationToast: React.FC<NotificationToastProps> = ({ notification, onDismiss }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onDismiss(notification.id);
        }, 5000);
        return () => clearTimeout(timer);
    }, [notification, onDismiss]);

    const baseClasses = "max-w-sm w-full bg-gray-800 shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden";
    const colorClasses = {
        success: "border-l-4 border-green-500",
        error: "border-l-4 border-red-500",
        info: "border-l-4 border-cyan-500",
        warning: "border-l-4 border-yellow-500",
    };

    return (
        <div className={`${baseClasses} ${colorClasses[notification.type]}`}>
            <div className="p-4">
                <div className="flex items-start">
                    <div className="ml-3 w-0 flex-1 pt-0.5">
                        <p className="text-sm font-medium text-white">{notification.message}</p>
                    </div>
                    <div className="ml-4 flex-shrink-0 flex">
                        <button onClick={() => onDismiss(notification.id)} className="inline-flex text-gray-400 hover:text-gray-500">
                            <span className="sr-only">Close</span>
                            &times;
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const NotificationContainer: React.FC<{ notifications: Notification[]; onDismiss: (id: number) => void; }> = ({ notifications, onDismiss }) => {
    return (
        <div className="fixed inset-0 flex items-end justify-center px-4 py-6 pointer-events-none sm:p-6 sm:items-start sm:justify-end z-[100]">
            <div className="max-w-sm w-full flex flex-col items-center space-y-4 sm:items-end">
                {notifications.map(n => (
                    <NotificationToast key={n.id} notification={n} onDismiss={onDismiss} />
                ))}
            </div>
        </div>
    );
};

export interface CalendarViewProps {
    appointments: Appointment[];
    onSelectDate: (date: Date) => void;
    onSelectAppointment: (appointment: Appointment) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ appointments, onSelectDate, onSelectAppointment }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const startingDayOfWeek = firstDayOfMonth.getDay();
    const totalDays = lastDayOfMonth.getDate();

    const calendarDays = useMemo(() => {
        const days = [];
        // Add empty cells for days before the 1st
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null);
        }
        // Add days of the month
        for (let i = 1; i <= totalDays; i++) {
            days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
        }
        return days;
    }, [currentDate, startingDayOfWeek, totalDays]);

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    return (
        <Card title="Appointment Calendar">
            <div className="flex justify-between items-center mb-4">
                <button onClick={handlePrevMonth} className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded">&lt;</button>
                <h3 className="text-xl font-semibold text-white">
                    {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </h3>
                <button onClick={handleNextMonth} className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded">&gt;</button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
                {daysOfWeek.map(day => <div key={day} className="font-bold text-gray-400 text-sm">{day}</div>)}
                {calendarDays.map((day, index) => (
                    <div key={index} className={`h-28 md:h-36 p-1 border border-gray-700 rounded-md ${day ? 'bg-gray-800/50' : 'bg-gray-800/20'}`} onClick={() => day && onSelectDate(day)}>
                        {day && (
                            <>
                                <span className={`text-xs ${DateUtils.isSameDay(day, new Date()) ? 'bg-cyan-500 text-white rounded-full px-1.5 py-0.5' : 'text-gray-300'}`}>{day.getDate()}</span>
                                <div className="mt-1 space-y-1 overflow-y-auto max-h-28">
                                    {appointments
                                        .filter(a => DateUtils.isSameDay(a.startTime, day))
                                        .slice(0, 3) // Show max 3 appointments
                                        .map(a => (
                                            <div key={a.id} onClick={(e) => { e.stopPropagation(); onSelectAppointment(a); }} className="p-1 text-xs text-left bg-cyan-800/70 rounded cursor-pointer hover:bg-cyan-700">
                                                <p className="font-semibold text-white truncate">{MOCK_SERVICES.find(s=>s.id === a.serviceId)?.name}</p>
                                                <p className="text-cyan-200">{DateUtils.formatTime(a.startTime)}</p>
                                            </div>
                                        ))
                                    }
                                    {appointments.filter(a => DateUtils.isSameDay(a.startTime, day)).length > 3 && (
                                        <div className="text-xs text-gray-400 mt-1">... and more</div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </Card>
    );
};

export interface AppointmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    appointment?: Appointment | null;
    services: BankService[];
    staff: Staff[];
    clients: Client[];
    onSave: (data: any) => void;
}

export const AppointmentModal: React.FC<AppointmentModalProps> = ({ isOpen, onClose, appointment, services, staff, clients, onSave }) => {
    const [formData, setFormData] = useState<any>({});
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (appointment) {
            setFormData({
                ...appointment,
                date: appointment.startTime.toISOString().split('T')[0],
                time: DateUtils.formatTime(appointment.startTime).replace(' ', ''),
            });
        } else {
            setFormData({
                clientId: '',
                serviceId: '',
                staffId: '',
                date: new Date().toISOString().split('T')[0],
                time: '09:00AM',
                status: 'Tentative',
                notes: ''
            });
        }
    }, [appointment, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.clientId) newErrors.clientId = "Client is required";
        if (!formData.serviceId) newErrors.serviceId = "Service is required";
        if (!formData.staffId) newErrors.staffId = "Staff is required";
        if (!formData.date) newErrors.date = "Date is required";
        if (!formData.time) newErrors.time = "Time is required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            onSave(formData);
            onClose();
        }
    };
    
    const timeSlots = useMemo(() => {
        const slots: string[] = [];
        for (let h = 8; h < 18; h++) {
            slots.push(`${h.toString().padStart(2, '0')}:00`);
            slots.push(`${h.toString().padStart(2, '0')}:30`);
        }
        return slots;
    }, []);

    const modalRef = useRef<HTMLDivElement>(null);

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (modalRef.current && e.target === modalRef.current) {
            onClose();
        }
    };

    return (
        <div ref={modalRef} onClick={handleBackdropClick} className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full border border-gray-700 max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <div className="p-4 border-b border-gray-700 sticky top-0 bg-gray-800 z-10">
                        <h3 className="text-lg font-semibold text-white">{appointment ? 'Edit Appointment' : 'New Appointment'}</h3>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Client */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300">Client</label>
                            <select name="clientId" value={formData.clientId || ''} onChange={handleChange} className="w-full bg-gray-700/50 p-2 rounded text-white mt-1">
                                <option value="">Select a client</option>
                                {clients.map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
                            </select>
                            {errors.clientId && <p className="text-red-400 text-xs mt-1">{errors.clientId}</p>}
                        </div>
                        {/* Service */}
                         <div>
                            <label className="block text-sm font-medium text-gray-300">Service</label>
                            <select name="serviceId" value={formData.serviceId || ''} onChange={handleChange} className="w-full bg-gray-700/50 p-2 rounded text-white mt-1">
                                <option value="">Select a service</option>
                                {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                             {errors.serviceId && <p className="text-red-400 text-xs mt-1">{errors.serviceId}</p>}
                        </div>
                        {/* Staff */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300">Staff</label>
                            <select name="staffId" value={formData.staffId || ''} onChange={handleChange} className="w-full bg-gray-700/50 p-2 rounded text-white mt-1">
                                <option value="">Select staff</option>
                                {staff.map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.role})</option>)}
                            </select>
                            {errors.staffId && <p className="text-red-400 text-xs mt-1">{errors.staffId}</p>}
                        </div>
                        {/* Status */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300">Status</label>
                            <select name="status" value={formData.status || ''} onChange={handleChange} className="w-full bg-gray-700/50 p-2 rounded text-white mt-1">
                                <option>Tentative</option>
                                <option>Confirmed</option>
                                <option>Completed</option>
                                <option>Canceled</option>
                                <option>No-Show</option>
                            </select>
                        </div>
                        {/* Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300">Date</label>
                            <input type="date" name="date" value={formData.date || ''} onChange={handleChange} className="w-full bg-gray-700/50 p-2 rounded text-white mt-1" />
                            {errors.date && <p className="text-red-400 text-xs mt-1">{errors.date}</p>}
                        </div>
                        {/* Time */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300">Time</label>
                            <select name="time" value={formData.time || ''} onChange={handleChange} className="w-full bg-gray-700/50 p-2 rounded text-white mt-1">
                                {timeSlots.map(slot => <option key={slot} value={slot}>{slot}</option>)}
                            </select>
                            {errors.time && <p className="text-red-400 text-xs mt-1">{errors.time}</p>}
                        </div>
                        {/* Notes */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-300">Notes</label>
                            <textarea name="notes" value={formData.notes || ''} onChange={handleChange} rows={4} className="w-full bg-gray-700/50 p-2 rounded text-white mt-1"></textarea>
                        </div>
                    </div>
                    <div className="p-4 bg-gray-900/50 border-t border-gray-700 flex justify-end space-x-2 sticky bottom-0 z-10">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium">Save Appointment</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ===================================================================================
// MAIN COMPONENT
// ===================================================================================

const DemoBankBookingsView: React.FC = () => {
    const [isBookingModalOpen, setBookingModalOpen] = useState(false);
    const [bookingDetails, setBookingDetails] = useState({ service: 'Financial Consultation', clientName: 'The Visionary', time: 'tomorrow at 3:00 PM' });
    const [confirmationMsg, setConfirmationMsg] = useState('');
    const [isLoadingAI, setIsLoadingAI] = useState(false);
    
    // Advanced state management
    const { state, createAppointment, updateAppointment, cancelAppointment, addNotification, removeNotification } = useBookingManager();
    const { clients, staff, services, appointments, notifications, isLoading } = state;
    
    // UI State
    const [activeView, setActiveView] = useState('dashboard'); // 'dashboard', 'calendar', 'clients'
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);

    const handleGenerate = async () => {
        setIsLoadingAI(true);
        setConfirmationMsg('');
        try {
            const aiService = AIIntegrationService.getInstance();
            const service = MOCK_SERVICES.find(s => s.name === bookingDetails.service);
            const response = await aiService.generateBookingConfirmation({
                serviceName: service?.name || 'Appointment',
                clientName: bookingDetails.clientName,
                time: bookingDetails.time,
            });
            setConfirmationMsg(response);
        } catch (error) {
            setConfirmationMsg("Error generating confirmation.");
            addNotification({ message: "AI generation failed. Check API key.", type: 'error' });
        } finally {
            setIsLoadingAI(false);
        }
    };
    
    const handleSaveAppointment = async (formData: any) => {
        const { date, time, ...rest } = formData;
        const [hours, minutes] = time.split(':');
        const startTime = new Date(date);
        startTime.setHours(parseInt(hours, 10), parseInt(minutes, 10));

        const service = services.find(s => s.id === formData.serviceId);
        const endTime = new Date(startTime.getTime() + (service?.durationMinutes || 60) * 60000);
        
        const payload = {
            ...rest,
            startTime,
            endTime
        };

        if (formData.id) {
            // Update existing
            await updateAppointment(payload as Appointment);
        } else {
            // Create new
            await createAppointment(payload);
        }
        setIsAppointmentModalOpen(false);
        setSelectedAppointment(null);
    };

    const handleOpenNewAppointment = (date?: Date) => {
        setSelectedAppointment(null);
        setIsAppointmentModalOpen(true);
        // Optionally pre-fill date if clicked from calendar
    };
    
    const handleSelectAppointment = (appointment: Appointment) => {
        setSelectedAppointment(appointment);
        setIsAppointmentModalOpen(true);
    };

    const todaysAppointments = useMemo(() => {
        return appointments.filter(a => DateUtils.isSameDay(a.startTime, new Date())).sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
    }, [appointments]);

    const stats = useMemo(() => {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const relevantAppointments = appointments.filter(a => a.startTime >= startOfMonth);
        const showRate = relevantAppointments.length > 0 ?
            (relevantAppointments.filter(a => a.status === 'Completed' || a.status === 'Confirmed').length / relevantAppointments.filter(a => a.status !== 'Canceled').length) * 100
            : 0;
        return {
            bookingsToday: todaysAppointments.length,
            showRate: showRate.toFixed(0) + '%',
            servicesOffered: services.length
        };
    }, [todaysAppointments.length, appointments, services.length]);

    const renderActiveView = () => {
        switch (activeView) {
            case 'calendar':
                return <CalendarView appointments={appointments} onSelectDate={handleOpenNewAppointment} onSelectAppointment={handleSelectAppointment} />;
            case 'clients':
                // Placeholder for a future client management view
                return <Card title="Client Management"><p className="text-gray-400">Client management interface coming soon.</p></Card>;
            case 'dashboard':
            default:
                return (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card className="text-center"><p className="text-3xl font-bold text-white">{isLoading ? '...' : stats.bookingsToday}</p><p className="text-sm text-gray-400 mt-1">Bookings Today</p></Card>
                            <Card className="text-center"><p className="text-3xl font-bold text-white">{isLoading ? '...' : stats.showRate}</p><p className="text-sm text-gray-400 mt-1">Monthly Show Rate</p></Card>
                            <Card className="text-center"><p className="text-3xl font-bold text-white">{isLoading ? '...' : stats.servicesOffered}</p><p className="text-sm text-gray-400 mt-1">Services Offered</p></Card>
                        </div>
                        <Card title="Today's Schedule">
                            {isLoading ? (
                                <p className="text-gray-400">Loading schedule...</p>
                            ) : todaysAppointments.length > 0 ? (
                                <div className="space-y-3">
                                    {todaysAppointments.map((a) => {
                                        const client = clients.find(c => c.id === a.clientId);
                                        const service = services.find(s => s.id === a.serviceId);
                                        return (
                                            <div key={a.id} onClick={() => handleSelectAppointment(a)} className="p-3 bg-gray-800/50 rounded-lg flex justify-between items-center cursor-pointer hover:bg-gray-800 transition-colors">
                                                <div>
                                                    <p className="font-semibold text-white">{service?.name || 'Unknown Service'}</p>
                                                    <p className="text-sm text-gray-400">{DateUtils.formatTime(a.startTime)} - {client ? `${client.firstName} ${client.lastName}` : 'Unknown Client'}</p>
                                                </div>
                                                <span className={`px-2 py-1 text-xs rounded-full ${a.status === 'Confirmed' ? 'bg-green-500/20 text-green-300' : a.status === 'Canceled' ? 'bg-red-500/20 text-red-300' : 'bg-yellow-500/20 text-yellow-300'}`}>{a.status}</span>
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <p className="text-gray-400">No appointments scheduled for today.</p>
                            )}
                        </Card>
                    </>
                );
        }
    };
    
    return (
        <>
            <NotificationContainer notifications={notifications} onDismiss={removeNotification} />
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold text-white tracking-wider">Demo Bank Bookings</h2>
                    <div className="flex items-center space-x-2">
                        <button onClick={() => setBookingModalOpen(true)} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium">AI Confirmation Writer</button>
                        <button onClick={() => handleOpenNewAppointment()} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium">New Appointment</button>
                    </div>
                </div>

                <div className="flex space-x-1 bg-gray-800/50 p-1 rounded-lg">
                    <button onClick={() => setActiveView('dashboard')} className={`flex-1 py-2 rounded-md text-sm ${activeView === 'dashboard' ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>Dashboard</button>
                    <button onClick={() => setActiveView('calendar')} className={`flex-1 py-2 rounded-md text-sm ${activeView === 'calendar' ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>Calendar</button>
                    <button onClick={() => setActiveView('clients')} className={`flex-1 py-2 rounded-md text-sm ${activeView === 'clients' ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>Clients</button>
                </div>
                
                {renderActiveView()}

            </div>
            
            <AppointmentModal
                isOpen={isAppointmentModalOpen}
                onClose={() => { setIsAppointmentModalOpen(false); setSelectedAppointment(null); }}
                appointment={selectedAppointment}
                clients={clients}
                staff={staff}
                services={services}
                onSave={handleSaveAppointment}
            />

            {isBookingModalOpen && (
                 <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={() => setBookingModalOpen(false)}>
                    <div className="bg-gray-800 rounded-lg shadow-2xl max-w-lg w-full border border-gray-700" onClick={e=>e.stopPropagation()}>
                        <div className="p-4 border-b border-gray-700"><h3 className="text-lg font-semibold text-white">AI Confirmation Writer</h3></div>
                        <div className="p-6 space-y-4">
                            <p className="text-sm text-gray-400">Simulate a booking, then generate an AI confirmation message.</p>
                            <select value={bookingDetails.service} onChange={e => setBookingDetails(b => ({...b, service: e.target.value}))} className="w-full bg-gray-700/50 p-2 rounded text-white">
                                {MOCK_SERVICES.map(s => <option key={s.id}>{s.name}</option>)}
                            </select>
                            <input type="text" value={bookingDetails.clientName} onChange={e => setBookingDetails(b => ({...b, clientName: e.target.value}))} className="w-full bg-gray-700/50 p-2 rounded text-white" placeholder="Client Name" />
                             <input type="text" value={bookingDetails.time} onChange={e => setBookingDetails(b => ({...b, time: e.target.value}))} className="w-full bg-gray-700/50 p-2 rounded text-white" placeholder="Appointment Time" />
                            <button onClick={handleGenerate} disabled={isLoadingAI} className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 rounded disabled:opacity-50 transition-colors">{isLoadingAI ? 'Generating...' : 'Generate Confirmation'}</button>
                            { (isLoadingAI || confirmationMsg) && <Card title="Generated Message"><div className="min-h-[6rem] max-h-60 overflow-y-auto text-sm text-gray-300 whitespace-pre-line">{isLoadingAI ? 'Generating...' : confirmationMsg}</div></Card>}
                        </div>
                    </div>
                 </div>
            )}
        </>
    );
};

export default DemoBankBookingsView;