// src/app/core/models/query-params.model.ts
export interface BaseQueryParams {
    pageNumber?: number;
    pageSize?: number;
    searchTerm?: string;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
  }
  
  export interface EmployeeQueryParams extends BaseQueryParams {
    status?: string;
    minAge?: number;
    maxAge?: number;
    startDate?: Date;
    endDate?: Date;
  }
  
  export interface AttendanceQueryParams extends BaseQueryParams {
    employeeId?: string;
    startDate?: Date;
    endDate?: Date;
    status?: string;
  }