export interface APIError {
    code: string;
    message: string;
  }
  
  export interface APIResult<T> {
    success: boolean;
    data?: T;
    errors?: APIError[];
    message?: string;
  }
  
  export interface PaginatedResult<T> {
    items: T[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  }