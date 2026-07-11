import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { NotificationService } from '../../../core/services/notification.service';
import { LoadingService } from '../../../core/services/loading.service';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, AsyncPipe, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements OnInit {

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private notificationService = inject(NotificationService);
  private loadingService = inject(LoadingService);

  loginForm: FormGroup;
  submitted = false;
  showPassword = false;
  returnUrl = '/dashboard';

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
  }

  get f() { return this.loginForm.controls; }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  get loading$() {
    return this.loadingService.loading$;
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.loginForm.invalid) {
      return;
    }

    this.loadingService.setLoading(true);

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.notificationService.showSuccess('Welcome!', `Hello ${response.data.fullName}`);
          
          if (response.data.requiresPasswordReset) {
            this.router.navigate(['/reset-password']);
          } else {
            this.router.navigate([this.returnUrl]);
          }
        } else {
          this.notificationService.showError('Login Failed', response.message || 'Invalid credentials');
        }
        this.loadingService.setLoading(false);
      },
      error: (error) => {
        this.loadingService.setLoading(false);
        this.notificationService.showError('Login Failed', 'Invalid email or password');
      }
    });
  }

}
