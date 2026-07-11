import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AttendanceService } from '../../../core/services/attendance.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AttendanceListDto } from '../../../core/models/attendance.model';

@Component({
  selector: 'app-my-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './my-attendance.html'
})
export class MyAttendance implements OnInit {
  private attendanceService = inject(AttendanceService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  records: AttendanceListDto[] = [];
  loading = false;

  // Month/year selectors — numbers, so no Date-string / toISOString hazard.
  year: number = new Date().getFullYear();
  month: number = new Date().getMonth() + 1;
  readonly months = [
    { v: 1, n: 'January' }, { v: 2, n: 'February' }, { v: 3, n: 'March' },
    { v: 4, n: 'April' }, { v: 5, n: 'May' }, { v: 6, n: 'June' },
    { v: 7, n: 'July' }, { v: 8, n: 'August' }, { v: 9, n: 'September' },
    { v: 10, n: 'October' }, { v: 11, n: 'November' }, { v: 12, n: 'December' }
  ];
  readonly years: number[] = (() => {
    const current = new Date().getFullYear();
    return [current, current - 1, current - 2];
  })();

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    const user = this.authService.getCurrentUser();
    if (!user?.employeeId) {
      this.notificationService.showError('Error', 'Could not determine your account.');
      return;
    }
    this.loading = true;
    this.attendanceService.getMonthlyAttendance(user.employeeId.toString(), this.year, this.month).subscribe({
      next: (res) => {
        this.records = res.success && res.data ? res.data : [];
        this.loading = false;
      },
      error: () => {
        this.records = [];
        this.loading = false;
        this.notificationService.showError('Error', 'Failed to load your attendance.');
      }
    });
  }
}
