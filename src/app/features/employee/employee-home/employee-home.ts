import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AttendanceService } from '../../../core/services/attendance.service';
import { AuthService } from '../../../core/services/auth.service';
import { AttendanceDto } from '../../../core/models/attendance.model';

@Component({
  selector: 'app-employee-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './employee-home.html'
})
export class EmployeeHome implements OnInit {
  private attendanceService = inject(AttendanceService);
  private authService = inject(AuthService);

  today: AttendanceDto | null = null;
  loading = true;

  get firstName(): string {
    return this.authService.getCurrentUser()?.firstName || 'there';
  }

  ngOnInit(): void {
    this.attendanceService.getTodayAttendance().subscribe({
      next: (res) => {
        this.today = res.success ? (res.data ?? null) : null;
        this.loading = false;
      },
      // Own-data endpoint; on any failure just show the "not checked in" state.
      error: () => { this.today = null; this.loading = false; }
    });
  }
}
