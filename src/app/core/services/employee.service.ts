import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError, map, of } from 'rxjs';
import { CreateEmployeeDto, EmployeeDto, EmployeeListDto, EmployeeStatsDto } from '../models/employee.model';
import { APIResult, PaginatedResult } from '../models/api-result.model';
import { EmployeeQueryParams } from '../models/query-params.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/employee`;

  addEmployee(employee: CreateEmployeeDto): Observable<APIResult<EmployeeDto>> {
    console.log('Sending employee data:', JSON.stringify(employee, null, 2));
    
    return this.http.post<APIResult<EmployeeDto>>(this.API_URL, employee, {
      headers: {
        'Content-Type': 'application/json'
      }
    }).pipe(
      map(response => {
        console.log('Add employee response:', response);
        return response;
      }),
      catchError(this.handleError)
    );
  }

  updateEmployee(id: string, updateDto: EmployeeDto): Observable<APIResult<EmployeeDto>> {
    return this.http.put<APIResult<EmployeeDto>>(`${this.API_URL}/${id}`, updateDto)
      .pipe(catchError(this.handleError));
  }

  deleteEmployee(id: string): Observable<APIResult<any>> {
    return this.http.delete<APIResult<any>>(`${this.API_URL}/${id}`)
      .pipe(catchError(this.handleError));
  }

  getPaginatedEmployees(queryParams: EmployeeQueryParams): Observable<APIResult<PaginatedResult<EmployeeListDto>>> {
    let params = new HttpParams();
    
    if (queryParams.pageNumber) params = params.set('pageNumber', queryParams.pageNumber.toString());
    if (queryParams.pageSize) params = params.set('pageSize', queryParams.pageSize.toString());
    if (queryParams.searchTerm) params = params.set('searchTerm', queryParams.searchTerm);
    if (queryParams.sortBy) params = params.set('sortBy', queryParams.sortBy);
    if (queryParams.sortDirection) params = params.set('sortDirection', queryParams.sortDirection);
    if (queryParams.status) params = params.set('status', queryParams.status);
    if (queryParams.minAge) params = params.set('minAge', queryParams.minAge.toString());
    if (queryParams.maxAge) params = params.set('maxAge', queryParams.maxAge.toString());

    return this.http.get<APIResult<PaginatedResult<EmployeeListDto>>>(this.API_URL, { params })
      .pipe(catchError(this.handleError));
  }

  getEmployeeProfile(employeeId: string): Observable<APIResult<EmployeeDto>> {
    return this.http.get<APIResult<EmployeeDto>>(`${this.API_URL}/profile/${employeeId}`)
      .pipe(catchError(this.handleError));
  }

  // getEmployeeStats(): Observable<APIResult<EmployeeStatsDto>> {
  //   return this.http.get<APIResult<EmployeeStatsDto>>(`${this.API_URL}/stats`)
  //     .pipe(catchError(this.handleError));
  // }

  private handleError(error: any): Observable<never> {
    console.error('Employee Service Error:', error);
    
    // Log detailed error information
    if (error.error) {
      console.error('Error details:', error.error);
      if (error.error.errors) {
        console.error('Validation errors:', error.error.errors);
      }
    }
    
    return throwError(() => error);
  }
}