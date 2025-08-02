import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreateEmployeeDto, EmployeeDto, EmployeeStatus } from '../../../core/models/employee.model';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EmployeeService } from '../../../core/services/employee.service';
import { NotificationService } from '../../../core/services/notification.service';
import { LoadingService } from '../../../core/services/loading.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-employee-form',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './employee-form.html',
  styleUrl: './employee-form.css'
})
export class EmployeeForm {
  private fb = inject(FormBuilder);
  private employeeService = inject(EmployeeService);
  private notificationService = inject(NotificationService);
  private loadingService = inject(LoadingService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  employeeForm: FormGroup;
  submitted = false;
  isEditMode = false;
  employeeId: string | null = null;
  pageTitle = 'Add Employee';

  // File upload
  selectedFile: File | null = null;
  signaturePreview: string | null = null;

  // Public getter for loading$
  get loading$() {
    return this.loadingService.loading$;
  }

  constructor() {
    this.employeeForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      nationalId: ['', [Validators.required, Validators.pattern(/^\d{10,14}$/)]],
      age: ['', [Validators.required, Validators.min(18), Validators.max(65)]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[\+]?[1-9][\d]{0,15}$/)]],
      email: ['', [Validators.email]],
      status: [EmployeeStatus.Active, [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.employeeId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.employeeId;
    this.pageTitle = this.isEditMode ? 'Edit Employee' : 'Add Employee';

    if (this.isEditMode && this.employeeId) {
      this.loadEmployee();
    }
  }

  get f() { return this.employeeForm.controls; }

  loadEmployee(): void {
    if (!this.employeeId) return;

    this.loadingService.setLoading(true);
    
    this.employeeService.getEmployeeProfile(this.employeeId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.populateForm(response.data);
        }
        this.loadingService.setLoading(false);
      },
      error: (error) => {
        this.notificationService.showError('Error', 'Failed to load employee data');
        this.loadingService.setLoading(false);
        this.router.navigate(['/employees']);
      }
    });
  }

  populateForm(employee: EmployeeDto): void {
    this.employeeForm.patchValue({
      firstName: employee.firstName,
      lastName: employee.lastName,
      nationalId: employee.nationalId,
      age: employee.age,
      phoneNumber: employee.phoneNumber,
      email: employee.email,
      status: employee.status
    });

    if (employee.signature) {
      this.signaturePreview = employee.signature;
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        this.notificationService.showError('Invalid File', 'Please select a valid image file (JPEG, PNG, GIF)');
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        this.notificationService.showError('File Too Large', 'Please select a file smaller than 5MB');
        return;
      }

      this.selectedFile = file;

      // Create preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.signaturePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  removeSignature(): void {
    this.selectedFile = null;
    this.signaturePreview = null;
    
    // Reset file input
    const fileInput = document.getElementById('signatureFile') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.employeeForm.invalid) {
      this.notificationService.showError('Form Invalid', 'Please fill all required fields correctly');
      return;
    }

    this.loadingService.setLoading(true);

    if (this.isEditMode) {
      this.updateEmployee();
    } else {
      this.createEmployee();
    }
  }

  createEmployee(): void {
    const formData = this.employeeForm.value as CreateEmployeeDto;

    this.employeeService.addEmployee(formData).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.notificationService.showSuccess('Success', 'Employee created successfully');
          
          // Upload signature if provided
          if (this.selectedFile && response.data.id) {
            this.uploadSignature(response.data.id);
          } else {
            this.router.navigate(['/employees']);
          }
        } else {
          this.notificationService.showError('Error', response.message || 'Failed to create employee');
        }
        this.loadingService.setLoading(false);
      },
      error: (error) => {
        this.loadingService.setLoading(false);
        this.notificationService.showError('Error', 'Failed to create employee');
      }
    });
  }

  updateEmployee(): void {
    if (!this.employeeId) return;

    const formData = { 
      ...this.employeeForm.value,
      id: this.employeeId 
    } as EmployeeDto;

    this.employeeService.updateEmployee(this.employeeId, formData).subscribe({
      next: (response) => {
        if (response.success) {
          this.notificationService.showSuccess('Success', 'Employee updated successfully');
          
          // Upload signature if provided
          if (this.selectedFile) {
            this.uploadSignature(this.employeeId!);
          } else {
            this.router.navigate(['/employees']);
          }
        } else {
          this.notificationService.showError('Error', response.message || 'Failed to update employee');
        }
        this.loadingService.setLoading(false);
      },
      error: (error) => {
        this.loadingService.setLoading(false);
        this.notificationService.showError('Error', 'Failed to update employee');
      }
    });
  }

  uploadSignature(employeeId: string): void {
    if (!this.selectedFile) {
      this.router.navigate(['/employees']);
      return;
    }

    // Note: You'll need to inject SignatureService here
    // this.signatureService.uploadSignature(employeeId, this.selectedFile).subscribe({
    //   next: (response) => {
    //     if (response.success) {
    //       this.notificationService.showSuccess('Success', 'Signature uploaded successfully');
    //     }
    //     this.router.navigate(['/employees']);
    //   },
    //   error: (error) => {
    //     this.notificationService.showError('Warning', 'Employee saved but signature upload failed');
    //     this.router.navigate(['/employees']);
    //   }
    // });
    
    // For now, just navigate
    this.router.navigate(['/employees']);
  }

  cancel(): void {
    this.router.navigate(['/employees']);
  }

  // Utility methods
  getStatusOptions() {
    return [
      { value: EmployeeStatus.Active, label: 'Active' },
      { value: EmployeeStatus.Inactive, label: 'Inactive' },
      { value: EmployeeStatus.Suspended, label: 'Suspended' }
    ];
  }

  // Form validation helpers
  isFieldInvalid(fieldName: string): boolean {
    const field = this.employeeForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched || this.submitted));
  }

  getFieldError(fieldName: string): string {
    const field = this.employeeForm.get(fieldName);
    if (field && field.errors) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['minlength']) return `${fieldName} is too short`;
      if (field.errors['maxlength']) return `${fieldName} is too long`;
      if (field.errors['min']) return `${fieldName} must be at least ${field.errors['min'].min}`;
      if (field.errors['max']) return `${fieldName} must be at most ${field.errors['max'].max}`;
      if (field.errors['pattern']) {
        if (fieldName === 'nationalId') return 'National ID must be 10-14 digits';
        if (fieldName === 'phoneNumber') return 'Please enter a valid phone number';
      }
      if (field.errors['email']) return 'Please enter a valid email address';
    }
    return '';
  }
}
