import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-reset-password-confirm',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password-confirm.html'
})
export class ResetPasswordConfirm implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  form: FormGroup = this.fb.group({
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: [this.passwordsMatch] });

  private email = '';
  private token = '';
  loading = false;
  submitted = false;
  // True when the reset link is missing its email/token query params.
  invalidLink = false;

  get f() { return this.form.controls; }

  ngOnInit(): void {
    this.email = this.route.snapshot.queryParamMap.get('email') ?? '';
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
    this.invalidLink = !this.email || !this.token;
  }

  private passwordsMatch(group: AbstractControl): ValidationErrors | null {
    const pw = group.get('newPassword')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return pw && confirm && pw !== confirm ? { mismatch: true } : null;
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.form.invalid || this.invalidLink) return;

    this.loading = true;
    this.authService.resetPasswordWithToken({
      email: this.email,
      token: this.token,
      newPassword: this.form.value.newPassword,
      confirmPassword: this.form.value.confirmPassword
    }).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          this.notificationService.showSuccess('Password reset', 'Your password has been reset. Please sign in.');
          this.router.navigate(['/login']);
        } else {
          this.notificationService.showError('Reset failed', res.message || 'The reset link is invalid or has expired.');
        }
      },
      error: (err) => {
        this.loading = false;
        const msg = err?.error?.errors?.[0]?.message || 'The reset link is invalid or has expired.';
        this.notificationService.showError('Reset failed', msg);
      }
    });
  }
}
