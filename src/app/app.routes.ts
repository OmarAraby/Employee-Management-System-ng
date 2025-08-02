import { Routes } from '@angular/router';
import { Login } from './features/auth/login/login';
import { ResetPassword } from './features/auth/reset-password/reset-password';
import { AdminLayout } from './layout/admin-layout/admin-layout';

export const routes: Routes = [
 
  {
    path: 'login',
    component: Login
  },
  {
    path: 'reset-password/:id',
    component: ResetPassword
  },
  {
    path: '',
    component: AdminLayout,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
     
    ]
  }
];
