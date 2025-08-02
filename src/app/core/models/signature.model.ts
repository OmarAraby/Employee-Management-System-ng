// signature.dto.ts
export interface SignatureDto {
    signatureId: string; // Guid converted to string
    fileName: string;
    filePath: string;
    uploadedAt: Date;
    employeeId: string; // Guid converted to string
  }
  
  // signature-create.dto.ts
  export interface SignatureCreateDto {
    fileUrl: string;
    fileName: string;
    employeeId: string; // Guid converted to string
  }