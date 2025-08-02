import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const notificationService = inject(NotificationService);

  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  const expectedRoles = route.data['roles'] as Array<string>;
  const currentUser = authService.getCurrentUser();

  if (!expectedRoles || expectedRoles.length === 0) {
    return true;
  }

  if (currentUser && expectedRoles.includes(currentUser.role)) {
    return true;
  }

  notificationService.showError('You do not have permission to access this page.');
  router.navigate(['/unauthorized']);
  return false;
};