import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { LoginDto, LoginResponseDto, ResetPasswordDto, ResetPasswordResponseDto, ForgotPasswordDto, ResetPasswordWithTokenDto } from '../models/auth.model';
import { APIResult } from '../models/api-result.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly API_URL = `${environment.apiUrl}/auth`;
  
  private currentUserSubject = new BehaviorSubject<LoginResponseDto | null>(null);
  private tokenKey = 'emp_token';
  private userKey = 'emp_user';

  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const token = localStorage.getItem(this.tokenKey);
    const userData = localStorage.getItem(this.userKey);
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        if (this.isTokenValid(user.tokenExpiry)) {
          this.currentUserSubject.next(user);
        } else {
          this.logout();
        }
      } catch (error) {
        this.logout();
      }
    }
  }

  private isTokenValid(expiry: string): boolean {
    const expiryDate = new Date(expiry);
    return expiryDate > new Date();
  }

  login(loginDto: LoginDto): Observable<APIResult<LoginResponseDto>> {
    return this.http.post<APIResult<LoginResponseDto>>(`${this.API_URL}/login`, loginDto)
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            this.setCurrentUser(response.data);
          }
        }),
        catchError(this.handleError)
      );
  }

  resetPassword(resetDto: ResetPasswordDto): Observable<APIResult<ResetPasswordResponseDto>> {
    return this.http.post<APIResult<ResetPasswordResponseDto>>(`${this.API_URL}/reset-password`, resetDto)
      .pipe(
        catchError(this.handleError)
      );
  }

  /** Requests a password-reset link by email (enumeration-safe: always succeeds). */
  forgotPassword(dto: ForgotPasswordDto): Observable<APIResult<boolean>> {
    return this.http.post<APIResult<boolean>>(`${this.API_URL}/forgot-password`, dto)
      .pipe(catchError(this.handleError));
  }

  /** Completes a reset using the email + token from the reset link. */
  resetPasswordWithToken(dto: ResetPasswordWithTokenDto): Observable<APIResult<boolean>> {
    return this.http.post<APIResult<boolean>>(`${this.API_URL}/reset-password-confirm`, dto)
      .pipe(catchError(this.handleError));
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  private setCurrentUser(user: LoginResponseDto): void {
    localStorage.setItem(this.tokenKey, user.token);
    localStorage.setItem(this.userKey, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  getCurrentUser(): LoginResponseDto | null {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    const user = this.getCurrentUser();
    return user != null && this.isTokenValid(user.tokenExpiry.toString());
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  isAdmin(): boolean {
    return this.hasRole('Admin');
  }

  isEmployee(): boolean {
    return this.hasRole('Employee');
  }

  private handleError(error: any) {
    console.error('An error occurred:', error);
    return throwError(() => new Error('Something went wrong; please try again later.'));
  }
}
