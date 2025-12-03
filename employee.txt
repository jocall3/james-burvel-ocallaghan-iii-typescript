// types/models/platform/employee.ts
export interface Employee {
    id: string;
    name: string;
    department: 'Engineering' | 'Sales' | 'Marketing' | 'HR';
    role: string;
}