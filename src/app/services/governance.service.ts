import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

// ... Project interface stays the same as previous step ...

@Injectable({ providedIn: 'root' })
export class GovernanceService {
  // GOVERNANCE CONSTANTS
  readonly MAX_FILE_SIZE_MB = 5;
  readonly ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx'];

  public projects: Project[] = [
    { 
      id: 'PRJ-101', name: 'ERP System Migration', category: 'INFRASTRUCTURE', location: 'Kenya', 
      owner: 'Alice M.', phase: 'Execution', status: 'Active', budget: 850000, spent: 612000, currency: 'KES', 
      startDate: '2026-01-01', projectedEndDate: '2026-06-30', hasAttachment: true, attachmentUrl: 'scope_v1.pdf'
    },
    { 
      id: 'PRJ-102', name: 'Warehouse expansion', category: 'OPERATIONS', location: 'Uganda', 
      owner: 'James K.', phase: 'Planning', status: 'Planning', budget: 500000, spent: 0, currency: 'UGX', 
      startDate: '2026-03-01', projectedEndDate: '2026-08-30', hasAttachment: false
    }
  ];

  // Logic: Validates file before processing
  validateAttachment(file: File): { valid: boolean; error?: string } {
    const extension = file.name.split('.').pop()?.toLowerCase();
    const sizeMB = file.size / (1024 * 1024);

    if (!this.ALLOWED_EXTENSIONS.includes(extension || '')) {
      return { valid: false, error: 'Invalid format. Only PDF or Word (DOC/DOCX) allowed.' };
    }
    if (sizeMB > this.MAX_FILE_SIZE_MB) {
      return { valid: false, error: `File too large. Maximum size is ${this.MAX_FILE_SIZE_MB}MB.` };
    }
    return { valid: true };
  }

  // ... Rest of service methods (getCalculatedProgress, canMoveToExecution) remain the same ...
  getCalculatedProgress(p: Project): number {
    const start = new Date(p.startDate).getTime();
    const end = new Date(p.projectedEndDate).getTime();
    const now = new Date().getTime();
    if (now < start) return 0;
    if (now > end) return 100;
    return Math.round(((now - start) / (end - start)) * 100);
  }

  canMoveToExecution(p: Project): boolean {
    return !(p.phase === 'Planning' && !p.hasAttachment);
  }

  public masterRegions = [{ name: 'Kenya', currency: 'KES', projectCount: 12, status: 'Active' }];
  public repositoryDocs = [];
  public auditLog = [];
  public masterPMs$ = new BehaviorSubject<any[]>([]).asObservable();
  isAdmin() { return true; }
}
