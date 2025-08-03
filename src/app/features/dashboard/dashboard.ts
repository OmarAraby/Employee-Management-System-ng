import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployeeService } from '../../core/services/employee.service';
import { EmployeeStatsDto } from '../../core/models/employee.model';
import { LoadingService } from '../../core/services/loading.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  private employeeService = inject(EmployeeService);
  private loadingService = inject(LoadingService);
  private notificationService = inject(NotificationService);

  stats: EmployeeStatsDto | null = null;
  recentActivities: any[] = [];

  constructor() {}

  ngOnInit(): void {
    // this.loadStats();
    // Mock data for recent activities
    this.loadRecentActivities();
  }

  // loadStats(): void {
  //   this.employeeService.getEmployeeStats().subscribe({
  //     next: (response) => {
  //       if (response.success && response.data) {
  //         this.stats = response.data;
  //       } else {
  //         this.notificationService.showError('Failed to load employee statistics');
  //       }
  //     },
  //     error: (error) => {
  //       console.error('Error loading stats:', error);
  //       this.notificationService.showError('Failed to load employee statistics');
  //     }
  //   });
  // }

  loadRecentActivities(): void {
    // Mock data for recent activities
    this.recentActivities = [
      { id: 1, name: 'John Doe', action: 'checked in', time: '08:45 AM', date: 'Today' },
      { id: 2, name: 'Alice Smith', action: 'submitted leave request', time: '08:30 AM', date: 'Today' },
      { id: 3, name: 'Mike Johnson', action: 'updated personal information', time: '05:12 PM', date: 'Yesterday' },
      { id: 4, name: 'HR Department', action: 'added new policy', time: '03:45 PM', date: 'Yesterday' }
    ];
  }
}