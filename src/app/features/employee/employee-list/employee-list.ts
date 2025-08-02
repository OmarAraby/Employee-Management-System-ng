import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmployeeQueryParams } from '../../../core/models/query-params.model';
import { LoadingService } from '../../../core/services/loading.service';
import { Router } from '@angular/router';
import { EmployeeService } from '../../../core/services/employee.service';
import { NotificationService } from '../../../core/services/notification.service';
import { EmployeeListDto, EmployeeStatus } from '../../../core/models/employee.model';
import { PaginatedResult } from '../../../core/models/api-result.model';

@Component({
  selector: 'app-employee-list',
  imports: [CommonModule, FormsModule],
  templateUrl: './employee-list.html',
  styleUrl: './employee-list.css'
})
export class EmployeeList {
  private employeeService = inject(EmployeeService);
  private notificationService = inject(NotificationService);
  private loadingService = inject(LoadingService);
  private router = inject(Router);

  employees: EmployeeListDto[] = [];
  paginatedResult: PaginatedResult<EmployeeListDto> | null = null;
  
  // Global Math object for template
  Math = Math;
  
  // Filter and search parameters
  queryParams: EmployeeQueryParams = {
    pageNumber: 1,
    pageSize: 10,
    searchTerm: '',
    sortBy: 'fullName',
    sortDirection: 'asc',
    status: undefined,
    minAge: undefined,
    maxAge: undefined
  };

  // Available options
  pageSizeOptions = [5, 10, 25, 50];
  sortOptions = [
    { value: 'fullName', label: 'Name' },
    { value: 'email', label: 'Email' },
    { value: 'age', label: 'Age' },
    { value: 'createdDate', label: 'Created Date' }
  ];
  
  statusOptions = [
    { value: '', label: 'All Status' },
    { value: EmployeeStatus.Active, label: 'Active' },
    { value: EmployeeStatus.Inactive, label: 'Inactive' },
    { value: EmployeeStatus.Suspended, label: 'Suspended' }
  ];

  // UI State
  showFilters = false;
  selectedEmployees: string[] = [];
  selectAll = false;

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.loadingService.setLoading(true);
    
    this.employeeService.getPaginatedEmployees(this.queryParams).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.paginatedResult = response.data;
          this.employees = response.data.items;
        }
        this.loadingService.setLoading(false);
      },
      error: (error) => {
        this.notificationService.showError('Error', 'Failed to load employees');
        this.loadingService.setLoading(false);
      }
    });
  }

  onSearch(): void {
    this.queryParams.pageNumber = 1;
    this.loadEmployees();
  }

  onPageChange(page: number): void {
    this.queryParams.pageNumber = page;
    this.loadEmployees();
  }

  onPageSizeChange(): void {
    this.queryParams.pageNumber = 1;
    this.loadEmployees();
  }

  onSortChange(): void {
    this.loadEmployees();
  }

  toggleSortDirection(): void {
    this.queryParams.sortDirection = this.queryParams.sortDirection === 'asc' ? 'desc' : 'asc';
    this.loadEmployees();
  }

  onFilterChange(): void {
    this.queryParams.pageNumber = 1;
    this.loadEmployees();
  }

  clearFilters(): void {
    this.queryParams = {
      pageNumber: 1,
      pageSize: this.queryParams.pageSize,
      searchTerm: '',
      sortBy: 'fullName',
      sortDirection: 'asc',
      status: undefined,
      minAge: undefined,
      maxAge: undefined
    };
    this.loadEmployees();
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  // Selection methods
  toggleSelectAll(): void {
    this.selectAll = !this.selectAll;
    this.selectedEmployees = this.selectAll ? this.employees.map(emp => emp.id) : [];
  }

  toggleEmployeeSelection(employeeId: string): void {
    const index = this.selectedEmployees.indexOf(employeeId);
    if (index > -1) {
      this.selectedEmployees.splice(index, 1);
    } else {
      this.selectedEmployees.push(employeeId);
    }
    this.selectAll = this.selectedEmployees.length === this.employees.length;
  }

  isEmployeeSelected(employeeId: string): boolean {
    return this.selectedEmployees.includes(employeeId);
  }

  // Navigation methods
  addEmployee(): void {
    this.router.navigate(['/employees/add']);
  }

  editEmployee(id: string): void {
    this.router.navigate(['/employees/edit', id]);
  }

  viewEmployee(id: string): void {
    this.router.navigate(['/employees/view', id]);
  }

  deleteEmployee(id: string, employeeName: string): void {
    if (confirm(`Are you sure you want to delete ${employeeName}?`)) {
      this.loadingService.setLoading(true);
      
      this.employeeService.deleteEmployee(id).subscribe({
        next: (response) => {
          if (response.success) {
            this.notificationService.showSuccess('Success', 'Employee deleted successfully');
            this.loadEmployees();
          } else {
            this.notificationService.showError('Error', 'Failed to delete employee');
          }
          this.loadingService.setLoading(false);
        },
        error: (error) => {
          this.notificationService.showError('Error', 'Failed to delete employee');
          this.loadingService.setLoading(false);
        }
      });
    }
  }

  // Utility methods
  getStatusBadgeClass(status: EmployeeStatus): string {
    switch (status) {
      case EmployeeStatus.Active: return 'badge bg-success';
      case EmployeeStatus.Inactive: return 'badge bg-secondary';
      case EmployeeStatus.Suspended: return 'badge bg-warning';
      default: return 'badge bg-secondary';
    }
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString();
  }

  getPaginationPages(): number[] {
    if (!this.paginatedResult) return [];
    
    const totalPages = this.paginatedResult.totalPages;
    const currentPage = this.paginatedResult.pageNumber;
    const pages: number[] = [];
    
    // Show max 5 pages around current page
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }
}
