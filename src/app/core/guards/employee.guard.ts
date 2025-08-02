import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

export const employeeGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const notificationService = inject(NotificationService);

  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  if (authService.isEmployee()) {
    return true;
  }

  notificationService.showError('Employee access required.');
  router.navigate(['/dashboard']);
  return false;
};
