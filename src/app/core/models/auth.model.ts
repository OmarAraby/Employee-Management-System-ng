// login.dto.ts
export interface LoginDto {
  email: string;
  password: string;
}

// login-response.dto.ts
export interface LoginResponseDto {
  employeeId: number;
  email: string;
  fullName: string;
  firstName?: string;  // Make optional to maintain backward compatibility
  lastName?: string;   // Make optional to maintain backward compatibility
  role: string;
  token: string;
  tokenExpiry: Date;
  requiresPasswordReset?: boolean;
}



// reset-password.dto.ts
export interface ResetPasswordDto {
  employeeId?: number;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// reset-password-response.dto.ts
export interface ResetPasswordResponseDto {
  success: boolean;
  message?: string;
  // Optionally include updated user info if needed
  // user?: LoginResponseDto;
}

// User Model
export interface User {
  employeeId: string;
  fullName: string;
  email: string;
  role: UserRole;
  requiresPasswordReset: boolean;
}

// User Roles
export enum UserRole {
  ADMIN = 'Admin',
  EMPLOYEE = 'Employee'
}