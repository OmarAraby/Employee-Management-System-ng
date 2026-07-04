import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EmployeeService } from '../../core/services/employee.service';
import { EmployeeStatsDto, EmployeeListDto } from '../../core/models/employee.model';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  private employeeService = inject(EmployeeService);
  private notificationService = inject(NotificationService);

  stats: EmployeeStatsDto | null = null;
  recentEmployees: EmployeeListDto[] = [];

  ngOnInit(): void {
    this.loadStats();
    this.loadRecentEmployees();
  }

  loadStats(): void {
    this.employeeService.getEmployeeStats().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.stats = response.data;
        }
      },
      error: () => this.notificationService.showError('Error', 'Failed to load employee statistics')
    });
  }

  loadRecentEmployees(): void {
    this.employeeService.getPaginatedEmployees({ pageNumber: 1, pageSize: 5 }).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.recentEmployees = response.data.items;
        }
      },
      error: () => this.notificationService.showError('Error', 'Failed to load recent employees')
    });
  }

  getInitials(name: string | undefined | null): string {
    if (!name) return '?';
    return name.trim().split(/\s+/).map(p => p[0]).slice(0, 2).join('').toUpperCase();
  }
}
