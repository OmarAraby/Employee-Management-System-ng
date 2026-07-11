import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { CheckInDto, CheckInResponseDto, AttendanceListDto, AttendanceDto } from '../models/attendance.model';
import { APIResult, PaginatedResult } from '../models/api-result.model';
import { AttendanceQueryParams } from '../models/query-params.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/attendance`;

  checkIn(checkInDto: CheckInDto): Observable<APIResult<CheckInResponseDto>> {
    console.log('Sending check-in request to:', `${this.API_URL}/check-in`);
    console.log('Payload:', checkInDto);
    
    return this.http.post<APIResult<CheckInResponseDto>>(`${this.API_URL}/check-in`, checkInDto)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Check-in API error:', error);
          console.error('Error response body:', error.error);
          return this.handleError(error);
        })
      );
  }

  getPaginatedAttendance(queryParams: AttendanceQueryParams): Observable<APIResult<PaginatedResult<AttendanceListDto>>> {
    let params = new HttpParams();
    
    if (queryParams.pageNumber) params = params.set('pageNumber', queryParams.pageNumber.toString());
    if (queryParams.pageSize) params = params.set('pageSize', queryParams.pageSize.toString());
    if (queryParams.searchTerm) params = params.set('searchTerm', queryParams.searchTerm);
    if (queryParams.sortBy) params = params.set('sortBy', queryParams.sortBy);
    if (queryParams.sortDirection) params = params.set('sortDirection', queryParams.sortDirection);
    if (queryParams.employeeId) params = params.set('employeeId', queryParams.employeeId);
    if (queryParams.startDate) params = params.set('startDate', queryParams.startDate.toISOString());
    if (queryParams.endDate) params = params.set('endDate', queryParams.endDate.toISOString());
    if (queryParams.status) params = params.set('status', queryParams.status);

    return this.http.get<APIResult<PaginatedResult<AttendanceListDto>>>(this.API_URL, { params })
      .pipe(catchError(this.handleError));
  }

  getWeeklyAttendance(employeeId: string): Observable<APIResult<AttendanceListDto[]>> {
    return this.http.get<APIResult<AttendanceListDto[]>>(`${this.API_URL}/weekly/${employeeId}`)
      .pipe(catchError(this.handleError));
  }

  getDailyAttendance(): Observable<APIResult<AttendanceListDto[]>> {
    return this.http.get<APIResult<AttendanceListDto[]>>(`${this.API_URL}/daily`)
      .pipe(catchError(this.handleError));
  }

  getMonthlyAttendance(employeeId: string, year: number, month: number): Observable<APIResult<AttendanceListDto[]>> {
    const params = new HttpParams()
      .set('year', year.toString())
      .set('month', month.toString());

    return this.http.get<APIResult<AttendanceListDto[]>>(`${this.API_URL}/monthly/${employeeId}`, { params })
      .pipe(catchError(this.handleError));
  }

  /**
   * Downloads the monthly attendance report CSV for an employee.
   * Returns the raw Blob; the caller triggers the browser save.
   */
  downloadMonthlyReport(employeeId: string, year: number, month: number): Observable<Blob> {
    const params = new HttpParams()
      .set('year', year.toString())
      .set('month', month.toString());

    return this.http.get(`${this.API_URL}/monthly/${employeeId}/report`, {
      params,
      responseType: 'blob'
    }).pipe(catchError(this.handleError));
  }

  /**
   * The current user's OWN attendance record for today (or null). Uses the
   * employee-safe GET /attendance/today (identity from the JWT) instead of the
   * Admin-only paginated list. No id param needed — the server derives it.
   */
  getTodayAttendance(): Observable<APIResult<AttendanceDto | null>> {
    return this.http.get<APIResult<AttendanceDto | null>>(`${this.API_URL}/today`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Checks the current user out. The endpoint derives the employee from the
   * JWT, so no body or id is sent.
   */
  checkOut(): Observable<APIResult<CheckInResponseDto>> {
    return this.http.post<APIResult<CheckInResponseDto>>(`${this.API_URL}/check-out`, {})
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('Attendance Service Error Details:', {
      status: error.status,
      statusText: error.statusText,
      url: error.url,
      error: error.error
    });
    
    // Return the original error for proper handling in components
    return throwError(() => error);
  }
}