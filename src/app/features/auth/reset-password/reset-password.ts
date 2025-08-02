import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { LoadingService } from '../../../core/services/loading.service';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-reset-password',
  imports: [ReactiveFormsModule, AsyncPipe],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css'
})
export class ResetPassword implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);
  private loadingService = inject(LoadingService);

  resetPasswordForm: FormGroup;
  submitted = false;

  constructor() {
    this.resetPasswordForm = this.fb.group({
      currentPassword: ['', [Validators.required, Validators.minLength(6)]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {}

  get f() { return this.resetPasswordForm.controls; }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');
    
    return newPassword && confirmPassword && newPassword.value === confirmPassword.value 
      ? null 
      : { passwordMismatch: true };
  }

  get loading$() {
    return this.loadingService.loading$;
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.resetPasswordForm.invalid) {
      return;
    }

    this.loadingService.setLoading(true);

    const { currentPassword, newPassword } = this.resetPasswordForm.value;

    this.authService.resetPassword({ currentPassword, newPassword, confirmPassword: newPassword }).subscribe({
      next: (response) => {
        this.loadingService.setLoading(false);
        if (response.success) {
          this.notificationService.showSuccess('Password Reset', 'Your password has been successfully updated.');
          this.router.navigate(['/dashboard']);
        } else {
          this.notificationService.showError('Reset Failed', response.message || 'Unable to reset password');
        }
      },
      error: (error) => {
        this.loadingService.setLoading(false);
        this.notificationService.showError('Reset Failed', 'An error occurred while resetting password');
      }
    });
  }
}
