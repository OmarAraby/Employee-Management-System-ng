import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreateEmployeeDto, EmployeeDto, EmployeeStatus } from '../../../core/models/employee.model';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EmployeeService } from '../../../core/services/employee.service';
import { SignatureService } from '../../../core/services/signature.service';
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
  private signatureService = inject(SignatureService);
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
      email: ['', [Validators.email]], // Email is optional
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
        console.error('Load employee error:', error);
        this.notificationService.showError('Error', 'Failed to load employee data');
        this.loadingService.setLoading(false);
        this.router.navigate(['/admin/employees']);
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
    const replaceFileInput = document.getElementById('replaceSignatureFile') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
    if (replaceFileInput) {
      replaceFileInput.value = '';
    }
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.employeeForm.invalid) {
      console.log('Form is invalid:', this.employeeForm.errors);
      this.markFormGroupTouched(this.employeeForm);
      this.notificationService.showError('Form Invalid', 'Please fill all required fields correctly');
      return;
    }

    if (this.isEditMode) {
      this.updateEmployee();
    } else {
      this.createEmployee();
    }
  }

  createEmployee(): void {
    if (this.employeeForm.invalid) {
      this.markFormGroupTouched(this.employeeForm);
      this.notificationService.showError('Form Invalid', 'Please fill all required fields correctly');
      return;
    }

    this.loadingService.setLoading(true);

    const rawFormData = this.employeeForm.value;
    console.log('Raw form data:', rawFormData);

    // Create proper DTO - ensure all required fields are present and properly typed
    const formData: CreateEmployeeDto = {
      firstName: (rawFormData.firstName || '').toString().trim(),
      lastName: (rawFormData.lastName || '').toString().trim(),
      nationalId: (rawFormData.nationalId || '').toString().trim(),
      age: parseInt(rawFormData.age, 10) || 0,
      phoneNumber: (rawFormData.phoneNumber || '').toString().trim(),
      email: rawFormData.email ? rawFormData.email.toString().trim() : undefined,
      status: rawFormData.status || EmployeeStatus.Active
    };

    // Final validation
    if (!formData.firstName || !formData.lastName || !formData.nationalId || 
        !formData.phoneNumber || formData.age < 18) {
      console.error('Form data validation failed:', formData);
      this.notificationService.showError('Validation Error', 'Please check all required fields');
      this.loadingService.setLoading(false);
      return;
    }

    console.log('Processed form data to send:', formData);

    this.employeeService.addEmployee(formData).subscribe({
      next: (response) => {
        console.log('Create employee response:', response);
        this.loadingService.setLoading(false);
        
        if (response.success && response.data) {
          this.notificationService.showSuccess('Success', 'Employee created successfully');
          
          // Upload signature if provided
          if (this.selectedFile && response.data.id) {
            this.uploadSignature(response.data.id);
          } else {
            this.router.navigate(['/admin/employees']);
          }
        } else {
          const errorMessage = response.message || 'Failed to create employee';
          this.notificationService.showError('Error', errorMessage);
        }
      },
      error: (error) => {
        console.error('Create employee error:', error);
        this.loadingService.setLoading(false);
        
        let errorMessage = 'Failed to create employee';
        let validationErrors: string[] = [];
        
        // Extract error details
        if (error.error) {
          if (error.error.errors && Array.isArray(error.error.errors)) {
            validationErrors = error.error.errors.map((err: any) => {
              if (typeof err === 'string') return err;
              if (err.message) return err.message;
              return JSON.stringify(err);
            });
            errorMessage = `Validation failed: ${validationErrors.join(', ')}`;
          } else if (error.error.message) {
            errorMessage = error.error.message;
          } else if (typeof error.error === 'string') {
            errorMessage = error.error;
          }
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        this.notificationService.showError('Creation Failed', errorMessage);
        
        // Log for debugging
        if (validationErrors.length > 0) {
          console.error('Server validation errors:', validationErrors);
        }
      }
    });
  }

  updateEmployee(): void {
    if (!this.employeeId) return;

    this.loadingService.setLoading(true);

    const rawFormData = this.employeeForm.value;
    console.log('Raw update form data:', rawFormData);

    const formData: EmployeeDto = { 
      id: this.employeeId,
      firstName: (rawFormData.firstName || '').toString().trim(),
      lastName: (rawFormData.lastName || '').toString().trim(),
      fullName: '', // This will be set by the server
      nationalId: (rawFormData.nationalId || '').toString().trim(),
      age: parseInt(rawFormData.age, 10) || 0,
      phoneNumber: (rawFormData.phoneNumber || '').toString().trim(),
      email: rawFormData.email ? rawFormData.email.toString().trim() : '',
      status: rawFormData.status || EmployeeStatus.Active,
      statusDisplayName: '', // This will be set by the server
      signature: this.signaturePreview || undefined,
      createdDate: new Date(),
      updatedDate: new Date(),
      isActive: rawFormData.status === EmployeeStatus.Active
    };

    console.log('Processed update data to send:', formData);

    this.employeeService.updateEmployee(this.employeeId, formData).subscribe({
      next: (response) => {
        console.log('Update employee response:', response);
        this.loadingService.setLoading(false);
        
        if (response.success) {
          this.notificationService.showSuccess('Success', 'Employee updated successfully');
          
          // Upload signature if provided
          if (this.selectedFile) {
            this.uploadSignature(this.employeeId!);
          } else {
            this.router.navigate(['/admin/employees']);
          }
        } else {
          const errorMessage = response.message || 'Failed to update employee';
          this.notificationService.showError('Error', errorMessage);
        }
      },
      error: (error) => {
        console.error('Update employee error:', error);
        this.loadingService.setLoading(false);
        
        let errorMessage = 'Failed to update employee';
        if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (typeof error.error === 'string') {
          errorMessage = error.error;
        }
        
        this.notificationService.showError('Update Failed', errorMessage);
      }
    });
  }

  uploadSignature(employeeId: string): void {
    if (!this.selectedFile) {
      this.router.navigate(['/admin/employees']);
      return;
    }

    this.signatureService.uploadSignature(employeeId, this.selectedFile).subscribe({
      next: (response) => {
        if (!response.success) {
          this.notificationService.showError('Signature', response.message || 'Failed to upload signature');
        }
        this.router.navigate(['/admin/employees']);
      },
      error: () => {
        this.notificationService.showError('Signature', 'Failed to upload the signature');
        this.router.navigate(['/admin/employees']);
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/admin/employees']);
  }

  viewEmployeeDetails(): void {
    if (this.employeeId) {
      this.router.navigate(['/admin/employees', this.employeeId]);
    }
  }

  // Helper method to mark all form fields as touched
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      control?.markAsTouched({ onlySelf: true });
      
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
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
      const fieldDisplayName = this.getFieldDisplayName(fieldName);
      
      if (field.errors['required']) return `${fieldDisplayName} is required`;
      if (field.errors['minlength']) return `${fieldDisplayName} must be at least ${field.errors['minlength'].requiredLength} characters`;
      if (field.errors['maxlength']) return `${fieldDisplayName} must be no more than ${field.errors['maxlength'].requiredLength} characters`;
      if (field.errors['min']) return `${fieldDisplayName} must be at least ${field.errors['min'].min}`;
      if (field.errors['max']) return `${fieldDisplayName} must be at most ${field.errors['max'].max}`;
      if (field.errors['pattern']) {
        if (fieldName === 'nationalId') return 'National ID must be 10-14 digits only';
        if (fieldName === 'phoneNumber') return 'Please enter a valid phone number';
      }
      if (field.errors['email']) return 'Please enter a valid email address';
    }
    return '';
  }

  private getFieldDisplayName(fieldName: string): string {
    const fieldNames: { [key: string]: string } = {
      firstName: 'First Name',
      lastName: 'Last Name',
      nationalId: 'National ID',
      age: 'Age',
      phoneNumber: 'Phone Number',
      email: 'Email',
      status: 'Status'
    };
    return fieldNames[fieldName] || fieldName;
  }
}