import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AttendanceService } from '../../../core/services/attendance.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { LoadingService } from '../../../core/services/loading.service';
import { AttendanceQueryParams } from '../../../core/models/query-params.model';

@Component({
  selector: 'app-attendance-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './attendance-list.html',
  styleUrl: './attendance-list.css'
})
export class AttendanceList implements OnInit {
  private attendanceService = inject(AttendanceService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private loadingService = inject(LoadingService);

  attendanceRecords: any[] = [];
  paginatedResult: any = null;
  
  // Global Math object for template
  Math = Math;
  
  // Filter and search parameters
  queryParams: AttendanceQueryParams = {
    pageNumber: 1,
    pageSize: 10,
    searchTerm: '',
    sortBy: 'date',
    sortDirection: 'desc',
    employeeId: '',
    startDate: undefined,
    endDate: undefined,
    status: undefined
  };

  // Available options
  pageSizeOptions = [5, 10, 25, 50];
  sortOptions = [
    { value: 'date', label: 'Date' },
    { value: 'checkInTime', label: 'Check In Time' },
    { value: 'checkOutTime', label: 'Check Out Time' },
    { value: 'status', label: 'Status' }
  ];
  
  statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'Present', label: 'Present' },
    { value: 'Absent', label: 'Absent' },
    { value: 'Late', label: 'Late' },
    { value: 'Leave', label: 'Leave' }
  ];

  constructor() {}

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.queryParams.employeeId = currentUser.employeeId.toString();
      this.loadAttendanceRecords();
    }
  }

  loadAttendanceRecords(): void {
    this.loadingService.setLoading(true);
    this.attendanceService.getPaginatedAttendance(this.queryParams).subscribe({
      next: (response) => {
        this.loadingService.setLoading(false);
        if (response.success && response.data) {
          this.paginatedResult = response.data;
          this.attendanceRecords = response.data.items;
        } else {
          this.notificationService.showError('Failed to load attendance records');
        }
      },
      error: (error) => {
        this.loadingService.setLoading(false);
        console.error('Error loading attendance records:', error);
        this.notificationService.showError('Failed to load attendance records');
      }
    });
  }

  onPageChange(page: number): void {
    this.queryParams.pageNumber = page;
    this.loadAttendanceRecords();
  }

  onPageSizeChange(): void {
    this.queryParams.pageNumber = 1;
    this.loadAttendanceRecords();
  }

  onSortChange(): void {
    this.loadAttendanceRecords();
  }

  onStatusChange(): void {
    this.queryParams.pageNumber = 1;
    this.loadAttendanceRecords();
  }

  onDateRangeChange(): void {
    this.queryParams.pageNumber = 1;
    this.loadAttendanceRecords();
  }

  onSearch(): void {
    this.queryParams.pageNumber = 1;
    this.loadAttendanceRecords();
  }

  clearFilters(): void {
    this.queryParams = {
      pageNumber: 1,
      pageSize: 10,
      searchTerm: '',
      sortBy: 'date',
      sortDirection: 'desc',
      employeeId: this.queryParams.employeeId,
      startDate: undefined,
      endDate: undefined,
      status: undefined
    };
    this.loadAttendanceRecords();
  }
}