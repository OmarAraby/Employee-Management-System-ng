import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AttendanceService } from '../../../core/services/attendance.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { LoadingService } from '../../../core/services/loading.service';
import { CheckInDto } from '../../../core/models/attendance.model';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-attendance-check-in',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './attendance-check-in.html',
  styleUrl: './attendance-check-in.css'
})
export class AttendanceCheckIn implements OnInit, OnDestroy {
  private attendanceService = inject(AttendanceService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private loadingService = inject(LoadingService);

  currentTime: string = '';
  currentDate: string = '';
  hasCheckedInToday: boolean = false;
  checkInTime: string | null = null;
  checkOutTime: string | null = null;
  workingHours: number | null = null;
  attendanceStatus: string | null = null;
  checkInWindow: { start: string; end: string } | null = null;

  private clockIntervalId?: ReturnType<typeof setInterval>;

  constructor() {
    this.updateCurrentTime();
    this.clockIntervalId = setInterval(() => this.updateCurrentTime(), 1000);
  }

  ngOnInit(): void {
    this.checkTodayAttendance();
    this.attendanceService.getCheckInWindow().subscribe({
      next: (res) => { if (res.success && res.data) this.checkInWindow = res.data; },
      error: () => { /* window display is best-effort; ignore */ }
    });
  }

  ngOnDestroy(): void {
    if (this.clockIntervalId) {
      clearInterval(this.clockIntervalId);
    }
  }

  private updateCurrentTime(): void {
    const now = new Date();
    this.currentTime = now.toLocaleTimeString();
    this.currentDate = now.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  private checkTodayAttendance(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.notificationService.showError('Authentication Error', 'User not authenticated. Please login again.');
      return;
    }

    this.loadingService.setLoading(true);
    
    this.attendanceService.getTodayAttendance().subscribe({
      next: (response) => {
        this.loadingService.setLoading(false);
        if (response.success && response.data) {
          const attendance = response.data;
          this.hasCheckedInToday = !!attendance.checkInTime;
          this.checkInTime = attendance.checkInTime || null;
          this.checkOutTime = attendance.checkOutTime || null;
          this.workingHours = attendance.workingHours ?? null;
          this.attendanceStatus = attendance.statusDisplayName || 'Present';
        } else {
          this.resetAttendanceState();
        }
      },
      error: (error) => {
        this.loadingService.setLoading(false);
        console.error('Error loading today\'s attendance:', error);
        
        if (error.status === 404) {
          this.resetAttendanceState();
        } else {
          this.notificationService.showError('Load Error', 'Unable to load today\'s attendance status');
        }
      }
    });
  }

  private resetAttendanceState(): void {
    this.hasCheckedInToday = false;
    this.checkInTime = null;
    this.checkOutTime = null;
    this.workingHours = null;
    this.attendanceStatus = 'Not Checked In';
  }

  checkIn(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.notificationService.showError('Authentication Error', 'User not authenticated. Please login again.');
      return;
    }

    // Validate employee ID
    if (!currentUser.employeeId) {
      this.notificationService.showError('Validation Error', 'Employee ID is missing. Please contact your administrator.');
      return;
    }

    const checkInDto: CheckInDto = {
      employeeId: currentUser.employeeId.toString()
    };

    console.log('Check-in payload:', checkInDto); // Debug log

    this.loadingService.setLoading(true);
    this.attendanceService.checkIn(checkInDto).subscribe({
      next: (response) => {
        this.loadingService.setLoading(false);
        if (response.success) {
          this.notificationService.showSuccess('Check-in Successful', 'You have successfully checked in for today.');
          this.hasCheckedInToday = true;
          this.checkInTime = new Date().toLocaleTimeString();
          this.attendanceStatus = 'Present';
          
          // Refresh today's attendance status
          this.checkTodayAttendance();
        } else {
          const errorMessage = response.message || 'Failed to check in';
          this.notificationService.showError('Check-in Failed', errorMessage);
        }
      },
      error: (error: HttpErrorResponse) => {
        this.loadingService.setLoading(false);
        console.error('Check-in error details:', error);
        
        const errorMessage = this.extractErrorMessage(error);
        this.notificationService.showError('Check-in Failed', errorMessage);
      }
    });
  }

  checkOut(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.notificationService.showError('Authentication Error', 'User not authenticated. Please login again.');
      return;
    }

    this.loadingService.setLoading(true);
    
    this.attendanceService.checkOut().subscribe({
      next: (response) => {
        this.loadingService.setLoading(false);
        if (response.success) {
          this.notificationService.showSuccess('Check-out Successful', 'You have successfully checked out. Have a great day!');
          this.checkTodayAttendance();
        } else {
          const errorMessage = response.message || 'Failed to check out';
          this.notificationService.showError('Check-out Failed', errorMessage);
        }
      },
      error: (error: HttpErrorResponse) => {
        this.loadingService.setLoading(false);
        console.error('Check-out error details:', error);
        
        const errorMessage = this.extractErrorMessage(error);
        this.notificationService.showError('Check-out Not Available', errorMessage);
      }
    });
  }

  private extractErrorMessage(error: HttpErrorResponse): string {
    try {
      // Check for different error response structures
      if (error.error) {
        // If error.error is a string
        if (typeof error.error === 'string') {
          return error.error;
        }
        
        // If error.error has a message property
        if (error.error.message) {
          return error.error.message;
        }
        
        // If error.error has validation errors
        if (error.error.errors) {
          const validationErrors = Object.values(error.error.errors).flat();
          return Array.isArray(validationErrors) ? validationErrors.join(', ') : 'Validation error occurred';
        }
        
        // If error.error has a title or detail (Problem Details format)
        if (error.error.title) {
          return error.error.detail || error.error.title;
        }
        
        // If error.error is an object but doesn't match expected structure
        if (typeof error.error === 'object') {
          return JSON.stringify(error.error);
        }
      }
      
      // Fallback to status-based messages
      switch (error.status) {
        case 400:
          return 'Invalid request. Please check your data and try again.';
        case 401:
          return 'You are not authorized. Please login again.';
        case 403:
          return 'You do not have permission to perform this action.';
        case 404:
          return 'The requested resource was not found.';
        case 500:
          return 'Server error occurred. Please try again later.';
        default:
          return `Request failed with status ${error.status}. Please try again.`;
      }
    } catch (parseError) {
      console.error('Error parsing error response:', parseError);
      return 'An unexpected error occurred. Please try again.';
    }
  }
}