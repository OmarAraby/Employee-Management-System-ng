import { Routes } from '@angular/router';
import { Login } from './features/auth/login/login';
import { ResetPassword } from './features/auth/reset-password/reset-password';
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
      { path: ':id', component: ResetPassword }
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
        canActivate: [authGuard]
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
          { path: '', redirectTo: 'profile', pathMatch: 'full' },
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
