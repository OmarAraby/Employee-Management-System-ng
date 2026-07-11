import { Routes } from '@angular/router';
import { Login } from './features/auth/login/login';
import { ResetPassword } from './features/auth/reset-password/reset-password';
import { ForgotPassword } from './features/auth/forgot-password/forgot-password';
import { ResetPasswordConfirm } from './features/auth/reset-password-confirm/reset-password-confirm';
import { AdminLayout } from './layout/admin-layout/admin-layout';
import { AuthLayout } from './layout/auth-layout/auth-layout';
import { EmployeeList } from './features/employee/employee-list/employee-list';
import { EmployeeForm } from './features/employee/employee-form/employee-form';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { employeeGuard } from './core/guards/employee.guard';
import { loginGuard } from './core/guards/login.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: 'login',
    component: AuthLayout,
    canActivate: [loginGuard],
    children: [
      { path: '', component: Login }
    ]
  },
  {
    path: 'reset-password',
    component: AuthLayout,
    canActivate: [authGuard],
    children: [
      { path: '', component: ResetPassword }
    ]
  },
  {
    // Self-service: request a reset link. Anonymous — the user is logged out.
    path: 'forgot-password',
    component: AuthLayout,
    children: [
      { path: '', component: ForgotPassword }
    ]
  },
  {
    // Self-service: complete the reset via the emailed email+token link. Anonymous.
    path: 'reset-password-confirm',
    component: AuthLayout,
    children: [
      { path: '', component: ResetPasswordConfirm }
    ]
  },
  {
    path: '',
    component: AdminLayout,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard').then(m => m.Dashboard),
        canActivate: [authGuard, adminGuard]
      },
      {
        path: 'admin',
        canActivate: [adminGuard],
        children: [
          { path: '', redirectTo: 'employees', pathMatch: 'full' },
          { path: 'employees', component: EmployeeList },
          { path: 'add-employee', component: EmployeeForm },
          { path: 'edit-employee/:id', component: EmployeeForm }
        ]
      },
      {
        path: 'employee',
        canActivate: [employeeGuard],
        children: [
          { path: '', redirectTo: 'home', pathMatch: 'full' },
          { path: 'home', loadComponent: () => import('./features/employee/employee-home/employee-home').then(m => m.EmployeeHome) },
          { path: 'profile', loadComponent: () => import('./features/employee/employee-profile/employee-profile').then(m => m.EmployeeProfile) },
          { 
            path: 'attendance',
            children: [
              { path: '', redirectTo: 'check-in', pathMatch: 'full' },
              { path: 'check-in', loadComponent: () => import('./features/attendance/attendance-check-in/attendance-check-in').then(m => m.AttendanceCheckIn) },
              { path: 'list', loadComponent: () => import('./features/attendance/attendance-list/attendance-list').then(m => m.AttendanceList) }
            ]
          }
        ]
      },
      {
        path: 'admin/attendance',
        canActivate: [adminGuard],
        loadComponent: () => import('./features/attendance/attendance-list/attendance-list').then(m => m.AttendanceList)
      }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
