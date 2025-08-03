import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployeeService } from '../../../core/services/employee.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { LoadingService } from '../../../core/services/loading.service';
import { EmployeeDto } from '../../../core/models/employee.model';

@Component({
  selector: 'app-employee-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './employee-profile.html',
  styleUrl: './employee-profile.css'
})
export class EmployeeProfile implements OnInit {
  private employeeService = inject(EmployeeService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private loadingService = inject(LoadingService);

  employee: EmployeeDto | null = null;
  
  constructor() {}

  ngOnInit(): void {
    this.loadEmployeeProfile();
  }

  loadEmployeeProfile(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.notificationService.showError('User not authenticated');
      return;
    }

    this.employeeService.getEmployeeProfile(currentUser.employeeId.toString()).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.employee = response.data;
        } else {
          this.notificationService.showError('Failed to load employee profile');
        }
      },
      error: (error) => {
        console.error('Error loading employee profile:', error);
        this.notificationService.showError('Failed to load employee profile');
      }
    });
  }
}