import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { LoginResponseDto } from '../../core/models/auth.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  currentUser: LoginResponseDto | null = null;
  isMenuOpen = false;

  ngOnInit(): void {
    // Subscribe to current user changes
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  onLogout(): void {
    // Close mobile menu if open
    this.isMenuOpen = false;
    
    // Call logout method from auth service
    this.authService.logout();
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }
}
