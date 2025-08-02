import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { SignatureDto } from '../models/signature.model';
import { APIResult } from '../models/api-result.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SignatureService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/signatures`;

  uploadSignature(employeeId: string, file: File): Observable<APIResult<SignatureDto>> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<APIResult<SignatureDto>>(`${this.API_URL}/upload/${employeeId}`, formData)
      .pipe(catchError(this.handleError));
  }

  getEmployeeSignatures(employeeId: string): Observable<APIResult<SignatureDto>> {
    return this.http.get<APIResult<SignatureDto>>(`${this.API_URL}/${employeeId}`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any): Observable<never> {
    console.error('Signature Service Error:', error);
    return throwError(() => error);
  }
}