import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

import { EmployeeQueryParams } from '../../../core/models/query-params.model';
import { LoadingService } from '../../../core/services/loading.service';
import { EmployeeService } from '../../../core/services/employee.service';
import { AttendanceService } from '../../../core/services/attendance.service';
import { NotificationService } from '../../../core/services/notification.service';
import { EmployeeListDto, EmployeeStatus, EmployeeStatsDto, EmployeeDto } from '../../../core/models/employee.model';
import { PaginatedResult } from '../../../core/models/api-result.model';

type ViewMode = 'table' | 'grid';

@Component({
  selector: 'app-employee-list',
  imports: [CommonModule, FormsModule],
  templateUrl: './employee-list.html',
  styleUrl: './employee-list.css'
})
export class EmployeeList implements OnInit, OnDestroy {
  private employeeService = inject(EmployeeService);
  private attendanceService = inject(AttendanceService);
  private notificationService = inject(NotificationService);
  private loadingService = inject(LoadingService);
  private router = inject(Router);
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  // Data
  employees: EmployeeListDto[] = [];
  paginatedResult: PaginatedResult<EmployeeListDto> | null = null;
  employeeStats: EmployeeStatsDto | null = null;
  
  // Global Math object for template
  Math = Math;
  
  // UI State
  viewMode: ViewMode = 'table';
  showFilters = false;
  selectedEmployees: string[] = [];
  selectAll = false;

  // Modal State
  showDeleteModal = false;
  showViewModal = false;
  showEditModal = false;
  showBulkDeleteModal = false;
  employeeToDelete: EmployeeListDto | null = null;
  selectedEmployee: EmployeeListDto | null = null;
  editingEmployee: EmployeeDto | null = null;
  originalEmployeeData: EmployeeDto | null = null;
  
  // Loading States
  isDeleting = false;
  isBulkDeleting = false;
  isSaving = false;
  isLoadingEmployeeDetails = false;

  // Filter and search parameters
  queryParams: EmployeeQueryParams = {
    pageNumber: 1,
    pageSize: 10,
    searchTerm: '',
    sortBy: 'fullName',
    sortDirection: 'asc',
    status: undefined,
    minAge: undefined,
    maxAge: undefined,
    startDate: undefined,
    endDate: undefined
  };

  // Available options
  pageSizeOptions = [5, 10, 25, 50, 100];
  sortOptions = [
    { value: 'fullName', label: 'Name' },
    { value: 'email', label: 'Email' },
    { value: 'age', label: 'Age' },
    { value: 'createdDate', label: 'Date Added' },
    { value: 'nationalId', label: 'National ID' }
  ];
  
  statusOptions = [
    { value: '', label: 'All Status' },
    { value: EmployeeStatus.Active, label: 'Active' },
    { value: EmployeeStatus.Inactive, label: 'Inactive' },
    { value: EmployeeStatus.Suspended, label: 'Suspended' }
  ];

  // Loading observable
  get loading$() {
    return this.loadingService.loading$;
  }

  constructor() {
    // Set up search debouncing
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(searchTerm => {
        this.queryParams.searchTerm = searchTerm;
        this.queryParams.pageNumber = 1;
        this.loadEmployees();
      });

    // Load view mode from localStorage (commented out to avoid browser storage issues)
    // const savedViewMode = localStorage.getItem('employee-list-view-mode') as ViewMode;
    // if (savedViewMode) {
    //   this.viewMode = savedViewMode;
    // }
  }

  ngOnInit(): void {
    this.loadEmployees();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Data Loading Methods
  loadEmployees(): void {
    this.loadingService.setLoading(true);
    
    this.employeeService.getPaginatedEmployees(this.queryParams).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.paginatedResult = response.data;
          this.employees = response.data.items;
          this.updateSelectionState();
        } else {
          this.notificationService.showError('Error', 'Failed to load employees');
        }
        this.loadingService.setLoading(false);
      },
      error: (error) => {
        console.error('Load employees error:', error);
        this.notificationService.showError('Error', 'Failed to load employees');
        this.loadingService.setLoading(false);
      }
    });
  }

  // Search and Filter Methods
  onSearchInput(event: any): void {
    const searchTerm = event.target.value;
    this.searchSubject.next(searchTerm);
  }

  onSearch(): void {
    this.queryParams.pageNumber = 1;
    this.loadEmployees();
  }

  clearSearch(): void {
    this.queryParams.searchTerm = '';
    this.queryParams.pageNumber = 1;
    this.loadEmployees();
  }

  onFilterChange(): void {
    this.queryParams.pageNumber = 1;
    this.selectedEmployees = [];
    this.selectAll = false;
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
      maxAge: undefined,
      startDate: undefined,
      endDate: undefined
    };
    this.selectedEmployees = [];
    this.selectAll = false;
    this.loadEmployees();
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  // Sorting Methods
  onSortChange(): void {
    this.loadEmployees();
  }

  toggleSortDirection(): void {
    this.queryParams.sortDirection = this.queryParams.sortDirection === 'asc' ? 'desc' : 'asc';
    this.loadEmployees();
  }

  // Pagination Methods
  onPageChange(page: number): void {
    if (page >= 1 && page <= (this.paginatedResult?.totalPages || 1)) {
      this.queryParams.pageNumber = page;
      this.loadEmployees();
    }
  }

  onPageSizeChange(): void {
    this.queryParams.pageNumber = 1;
    this.loadEmployees();
  }

  jumpToPage(event: any): void {
    const page = parseInt(event.target.value, 10);
    if (page >= 1 && page <= (this.paginatedResult?.totalPages || 1)) {
      this.onPageChange(page);
    }
  }

  // View Mode Methods
  setViewMode(mode: ViewMode): void {
    this.viewMode = mode;
    // localStorage.setItem('employee-list-view-mode', mode);
  }

  // Selection Methods
  toggleSelectAll(): void {
    this.selectAll = !this.selectAll;
    if (this.selectAll) {
      this.selectedEmployees = this.employees.map(emp => emp.id);
    } else {
      this.selectedEmployees = [];
    }
  }

  toggleEmployeeSelection(employeeId: string): void {
    const index = this.selectedEmployees.indexOf(employeeId);
    if (index > -1) {
      this.selectedEmployees.splice(index, 1);
    } else {
      this.selectedEmployees.push(employeeId);
    }
    this.updateSelectionState();
  }

  isEmployeeSelected(employeeId: string): boolean {
    return this.selectedEmployees.includes(employeeId);
  }

  isIndeterminate(): boolean {
    return this.selectedEmployees.length > 0 && this.selectedEmployees.length < this.employees.length;
  }

  private updateSelectionState(): void {
    if (this.employees.length === 0) {
      this.selectAll = false;
      return;
    }
    
    // Remove selected employees that are no longer in current page
    this.selectedEmployees = this.selectedEmployees.filter(id => 
      this.employees.some(emp => emp.id === id)
    );
    
    this.selectAll = this.employees.length > 0 && 
                     this.selectedEmployees.length === this.employees.length;
  }

  // Navigation Methods
  addEmployee(): void {
    this.router.navigate(['/admin/add-employee']);
  }

  editEmployee(id: string): void {
    this.router.navigate(['/employees/edit', id]);
  }

  viewEmployee(id: string): void {
    this.router.navigate(['/employees/view', id]);
  }

  viewAttendance(id: string): void {
    this.router.navigate(['/attendance/employee', id]);
  }

  // Modal Management Methods

  // Delete Modal Methods
  openDeleteModal(employee: EmployeeListDto): void {
    this.employeeToDelete = employee;
    this.showDeleteModal = true;
    document.body.classList.add('modal-open');
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.employeeToDelete = null;
    this.isDeleting = false;
    document.body.classList.remove('modal-open');
  }

  confirmDelete(): void {
    if (!this.employeeToDelete) return;
    
    this.isDeleting = true;
    
    this.employeeService.deleteEmployee(this.employeeToDelete.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.notificationService.showSuccess('Success', 'Employee deleted successfully');
          this.selectedEmployees = this.selectedEmployees.filter(empId => empId !== this.employeeToDelete!.id);
          this.loadEmployees();
          this.closeDeleteModal();
        } else {
          this.notificationService.showError('Error', response.message || 'Failed to delete employee');
          this.isDeleting = false;
        }
      },
      error: (error) => {
        console.error('Delete employee error:', error);
        this.notificationService.showError('Error', 'Failed to delete employee');
        this.isDeleting = false;
      }
    });
  }

  // View Modal Methods
  openViewModal(employee: EmployeeListDto): void {
    this.selectedEmployee = employee;
    this.showViewModal = true;
    document.body.classList.add('modal-open');
  }

  closeViewModal(): void {
    this.showViewModal = false;
    this.selectedEmployee = null;
    document.body.classList.remove('modal-open');
  }

  editFromView(): void {
    if (this.selectedEmployee) {
      this.closeViewModal();
      this.openEditModal(this.selectedEmployee);
    }
  }

  // Edit Modal Methods
  openEditModal(employee: EmployeeListDto): void {
    this.isLoadingEmployeeDetails = true;
    this.showEditModal = true;
    document.body.classList.add('modal-open');
    
    // Load full employee details for editing
    this.employeeService.getEmployeeProfile(employee.id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.editingEmployee = { ...response.data };
          this.originalEmployeeData = { ...response.data };
        } else {
          this.notificationService.showError('Error', 'Failed to load employee details');
          this.closeEditModal();
        }
        this.isLoadingEmployeeDetails = false;
      },
      error: (error) => {
        console.error('Load employee details error:', error);
        this.notificationService.showError('Error', 'Failed to load employee details');
        this.closeEditModal();
        this.isLoadingEmployeeDetails = false;
      }
    });
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.editingEmployee = null;
    this.originalEmployeeData = null;
    this.isSaving = false;
    document.body.classList.remove('modal-open');
  }

  saveEmployee(): void {
    if (!this.editingEmployee || !this.isFormValid()) return;
    
    this.isSaving = true;
    
    this.employeeService.updateEmployee(this.editingEmployee.id, this.editingEmployee).subscribe({
      next: (response) => {
        if (response.success) {
          this.notificationService.showSuccess('Success', 'Employee updated successfully');
          this.loadEmployees();
          this.closeEditModal();
        } else {
          this.notificationService.showError('Error', response.message || 'Failed to update employee');
          this.isSaving = false;
        }
      },
      error: (error) => {
        console.error('Update employee error:', error);
        this.notificationService.showError('Error', 'Failed to update employee');
        this.isSaving = false;
      }
    });
  }

  isFormValid(): boolean {
    if (!this.editingEmployee) return false;
    
    return !!(
      this.editingEmployee.firstName?.trim() &&
      this.editingEmployee.lastName?.trim() &&
      this.editingEmployee.email?.trim() &&
      this.editingEmployee.nationalId?.trim() &&
      this.editingEmployee.age &&
      this.editingEmployee.age >= 18 &&
      this.editingEmployee.age <= 100 &&
      this.isValidEmail(this.editingEmployee.email)
    );
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Bulk Delete Modal Methods
  openBulkDeleteModal(): void {
    this.showBulkDeleteModal = true;
    document.body.classList.add('modal-open');
  }

  closeBulkDeleteModal(): void {
    this.showBulkDeleteModal = false;
    this.isBulkDeleting = false;
    document.body.classList.remove('modal-open');
  }

  confirmBulkDelete(): void {
    if (this.selectedEmployees.length === 0) return;
    
    this.isBulkDeleting = true;
    this.processBulkDeletion(0);
  }

  private processBulkDeletion(index: number): void {
    if (index >= this.selectedEmployees.length) {
      // All deletions completed
      this.selectedEmployees = [];
      this.selectAll = false;
      this.loadEmployees();
      this.notificationService.showSuccess('Success', 'Selected employees deleted successfully');
      this.closeBulkDeleteModal();
      return;
    }

    const employeeId = this.selectedEmployees[index];
    this.employeeService.deleteEmployee(employeeId).subscribe({
      next: (response) => {
        if (response.success) {
          // Process next deletion
          this.processBulkDeletion(index + 1);
        } else {
          this.notificationService.showError('Error', `Failed to delete employee ${index + 1}`);
          this.isBulkDeleting = false;
        }
      },
      error: (error) => {
        console.error('Bulk delete error:', error);
        this.notificationService.showError('Error', `Failed to delete employee ${index + 1}`);
        this.isBulkDeleting = false;
      }
    });
  }

  // Legacy Methods (for backward compatibility)
  deleteEmployee(id: string, employeeName: string): void {
    const employee = this.employees.find(emp => emp.id === id);
    if (employee) {
      this.openDeleteModal(employee);
    }
  }

  bulkDelete(): void {
    this.openBulkDeleteModal();
  }

  bulkExport(): void {
    const selectedEmployeeData = this.employees.filter(emp => 
      this.selectedEmployees.includes(emp.id)
    );
    this.exportToCSV(selectedEmployeeData, 'selected-employees');
  }

  bulkStatusChange(): void {
    // This would typically open a modal to select new status
    // For now, we'll just show a notification
    this.notificationService.showInfo('Feature Coming Soon', 'Bulk status change will be available soon');
  }

  // Export Methods
  exportEmployees(): void {
    this.exportToCSV(this.employees, 'all-employees');
  }

  /** Downloads the current month's attendance report CSV for one employee. */
  downloadAttendanceReport(employee: EmployeeListDto): void {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    this.attendanceService.downloadMonthlyReport(employee.id, year, month)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `attendance-${employee.fullName}-${year}-${String(month).padStart(2, '0')}.csv`;
          link.click();
          window.URL.revokeObjectURL(url);
        },
        error: () => {
          this.notificationService.showError('Error', 'Failed to download the attendance report');
        }
      });
  }

  private exportToCSV(data: EmployeeListDto[], filename: string): void {
    if (data.length === 0) {
      this.notificationService.showWarning('No Data', 'No employees to export');
      return;
    }

    const headers = [
      'Employee ID',
      'Full Name',
      'First Name', 
      'Last Name',
      'Email',
      'Phone Number',
      'Department',
      'Age',
      'Status',
      'National ID',
      'Created Date'
    ];

    const csvContent = [
      headers.join(','),
      ...data.map(emp => [
        `"${emp.employeeId || emp.id}"`,
        `"${emp.fullName}"`,
        `"${emp.firstName}"`,
        `"${emp.lastName}"`,
        `"${emp.email}"`,
        `"${emp.phoneNumber || ''}"`,
        `"${emp.department || ''}"`,
        emp.age,
        `"${emp.status}"`,
        `"${emp.nationalId}"`,
        `"${this.formatDate(emp.createdDate)}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.notificationService.showSuccess('Export Complete', 'Employee data exported successfully');
  }

  // Utility Methods
  getStatusBadgeClass(status: EmployeeStatus): string {
    switch (status) {
      case EmployeeStatus.Active: return 'badge bg-success';
      case EmployeeStatus.Inactive: return 'badge bg-secondary';
      case EmployeeStatus.Suspended: return 'badge bg-warning text-dark';
      default: return 'badge bg-secondary';
    }
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getInitials(firstName: string, lastName: string): string {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  }

  getEmployeeColor(name: string): string {
    const colors = [
      '#667eea', '#764ba2', '#f093fb', '#f5576c',
      '#4facfe', '#00f2fe', '#43e97b', '#38f9d7',
      '#ffecd2', '#fcb69f', '#a8edea', '#fed6e3'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  trackByEmployeeId(index: number, employee: EmployeeListDto): string {
    return employee.id;
  }

  trackByPage(index: number, page: number): number {
    return page;
  }

  getPaginationPages(): number[] {
    if (!this.paginatedResult) return [];
    
    const totalPages = this.paginatedResult.totalPages;
    const currentPage = this.paginatedResult.pageNumber;
    const pages: number[] = [];
    
    // Show max 5 pages around current page
    const maxPages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(totalPages, startPage + maxPages - 1);
    
    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxPages) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  getStartIndex(): number {
    if (!this.paginatedResult || this.employees.length === 0) return 0;
    return (this.paginatedResult.pageNumber - 1) * this.paginatedResult.pageSize + 1;
  }

  getEndIndex(): number {
    if (!this.paginatedResult || this.employees.length === 0) return 0;
    return Math.min(
      this.paginatedResult.pageNumber * this.paginatedResult.pageSize,
      this.paginatedResult.totalCount
    );
  }
}