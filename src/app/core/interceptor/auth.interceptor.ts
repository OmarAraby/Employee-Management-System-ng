import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const notificationService = inject(NotificationService);
  
  const token = authService.getToken();
  
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req).pipe(
    catchError((error) => {
      if (error.status === 401) {
        authService.logout();
        notificationService.showError('Session expired. Please login again.');
      } else if (error.status === 403) {
        notificationService.showError('You do not have permission to perform this action.');
      } else if (error.status === 500) {
        notificationService.showError('Server error. Please try again later.');
      }
      
      return throwError(() => error);
    })
  );
};