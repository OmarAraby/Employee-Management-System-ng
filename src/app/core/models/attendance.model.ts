// check-in.dto.ts
export interface CheckInDto {
    employeeId: string; // Guid converted to string
  }
  
  // check-in-response.dto.ts
  export enum AttendanceStatus {
    Present = 'Present',
    Late = 'Late',
    Absent = 'Absent',
    HalfDay = 'HalfDay'
  }
  
  export interface CheckInResponseDto {
    success: boolean;
    message: string;
    attendance?: AttendanceDto;
    checkInTime?: string; // TimeSpan converted to string
    checkInDate: Date;
  }
  
  // attendance.dto.ts
  export interface AttendanceDto {
    attendanceId: string; // Guid converted to string
    employeeId: string; // Guid converted to string
    employeeFullName: string;
    employeeEmail: string;
    checkInDate: Date;
    checkInTime: string; // TimeSpan converted to string
    checkOutTime?: string; // TimeSpan converted to string
    workingHours?: number;
    createdDate: Date;
    checkInDateString: string;
    checkInTimeString: string;
    isOnTime: boolean;
    isLate: boolean;
    status: AttendanceStatus;
    statusDisplayName: string;
  }
  
  // attendance-list.dto.ts
  export interface AttendanceListDto {
    attendanceId: string; // Guid converted to string
    employeeId: string; // Guid converted to string
    employeeFullName: string;
    checkInDate: Date;
    checkInTime: string; // TimeSpan converted to string
    isOnTime: boolean;
    status: AttendanceStatus;
    statusDisplayName: string;
  }