// create-employee.dto.ts
export interface CreateEmployeeDto {
    firstName: string;
    lastName: string;
    nationalId: string;
    age: number;
    phoneNumber: string;
    signature?: string;
  }
  
  // employee.dto.ts
  export enum EmployeeStatus {
    Active = 'Active',
    Inactive = 'Inactive',
    Suspended = 'Suspended'
  }
  
  export interface EmployeeDto {
    id: string; // Guid converted to string
    firstName: string;
    lastName: string;
    fullName: string;
    phoneNumber: string;
    nationalId: string;
    age: number;
    signature?: string;
    status: EmployeeStatus;
    statusDisplayName: string;
    createdDate: Date;
    updatedDate?: Date;
    isActive: boolean;
    email: string;
  }
  
  // employee-list.dto.ts
  export interface EmployeeListDto {
    id: string;
    employeeId: string;
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    phoneNumber?: string;
    department?: string;
    age: number;
    status: EmployeeStatus;
    statusDisplayName?: string;
    nationalId: string;
    createdDate: Date;
  }
  
  // employee-stats.dto.ts
  export interface EmployeeStatsDto {
    totalEmployees: number;
    activeEmployees: number;
    inactiveEmployees: number;
    suspendedEmployees: number;
    newEmployeesThisMonth: number;
  }