import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { CheckInDto, CheckInResponseDto, AttendanceDto, AttendanceListDto } from '../models/attendance.model';
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
    return this.http.post<APIResult<CheckInResponseDto>>(`${this.API_URL}/check-in`, checkInDto)
      .pipe(catchError(this.handleError));
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

  private handleError(error: any): Observable<never> {
    console.error('Attendance Service Error:', error);
    return throwError(() => error);
  }
}