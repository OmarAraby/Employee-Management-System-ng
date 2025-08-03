import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AttendanceService } from '../../../core/services/attendance.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { LoadingService } from '../../../core/services/loading.service';
import { CheckInDto } from '../../../core/models/attendance.model';

@Component({
  selector: 'app-attendance-check-in',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './attendance-check-in.html',
  styleUrl: './attendance-check-in.css'
})
export class AttendanceCheckIn implements OnInit {
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

  constructor() {
    this.updateCurrentTime();
    setInterval(() => this.updateCurrentTime(), 1000);
  }

  ngOnInit(): void {
    this.checkTodayAttendance();
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
      this.notificationService.showError('User not authenticated');
      return;
    }

    this.loadingService.setLoading(true);
    // Here we would typically call an API to check today's attendance status
    // For now, we'll simulate this with a mock implementation
    setTimeout(() => {
      this.loadingService.setLoading(false);
      // Mock data - in a real app, this would come from the API
      const mockAttendance = {
        hasCheckedIn: Math.random() > 0.5,
        checkInTime: '09:15 AM',
        checkOutTime: Math.random() > 0.5 ? '05:30 PM' : null,
        workingHours: 8.25,
        status: 'Present'
      };

      this.hasCheckedInToday = mockAttendance.hasCheckedIn;
      this.checkInTime = mockAttendance.checkInTime;
      this.checkOutTime = mockAttendance.checkOutTime;
      this.workingHours = mockAttendance.workingHours;
      this.attendanceStatus = mockAttendance.status;
    }, 1000);
  }

  checkIn(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.notificationService.showError('User not authenticated');
      return;
    }

    const checkInDto: CheckInDto = {
      employeeId: currentUser.employeeId.toString(),
      
    };

    this.loadingService.setLoading(true);
    this.attendanceService.checkIn(checkInDto).subscribe({
      next: (response) => {
        this.loadingService.setLoading(false);
        if (response.success) {
          this.notificationService.showSuccess('Successfully checked in');
          this.hasCheckedInToday = true;
          this.checkInTime = new Date().toLocaleTimeString();
          this.attendanceStatus = 'Present';
        } else {
          this.notificationService.showError(response.message || 'Failed to check in');
        }
      },
      error: (error) => {
        this.loadingService.setLoading(false);
        console.error('Error checking in:', error);
        this.notificationService.showError('Failed to check in');
      }
    });
  }

  checkOut(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.notificationService.showError('User not authenticated');
      return;
    }

    this.loadingService.setLoading(true);
    // Here we would typically call an API to check out
    // For now, we'll simulate this with a mock implementation
    setTimeout(() => {
      this.loadingService.setLoading(false);
      this.notificationService.showSuccess('Successfully checked out');
      this.checkOutTime = new Date().toLocaleTimeString();
      
      // Calculate working hours (mock calculation)
      if (this.checkInTime) {
        const checkIn = new Date(`01/01/2023 ${this.checkInTime}`);
        const checkOut = new Date();
        const diffMs = checkOut.getTime() - checkIn.getTime();
        this.workingHours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;
      }
    }, 1000);
  }
}