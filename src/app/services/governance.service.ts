import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/** * 🏛️ CORE INTERFACES
 * Explicitly defined and exported to resolve TS2304 and NG9 errors.
 */
export interface Project { 
  id: string; name: string; category: string; location: string; owner: string; 
  phase: 'Initiation' | 'Planning' | 'Execution' | 'Closure'; 
  status: 'Active' | 'Planning' | 'Critical' | 'Closure'; 
  budget: number; spent: number; currency: string;
  startDate: string; projectedEndDate: string; actualEndDate?: string; 
  attachmentUrl?: string; hasAttachment: boolean; 
}

export interface RepositoryDocument { 
  id: string; name: string; category: string; owner: string; 
  status: 'Pending' | 'Approved' | 'Finalized'; 
  downloadUrl: string; isTemplate: boolean; nextSignatory?: string; 
}

export interface AuditEntry { // Added to fix 'never' type error in Settings
  time: Date; action: string; user: string; details: string; 
}

export interface MasterRegion { name: string; currency: string; projectCount: number; status: 'Active' | 'Paused'; }
export interface MasterPM { name: string; rate: number; department: string; activeProjects: number; lastDelivery: string; }

@Injectable({ providedIn: 'root' })
export class GovernanceService {
  // Constants for compliance
  readonly MAX_FILE_SIZE_MB = 5;
  readonly ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx'];

  // 1. Projects Registry (Resolves TS2304 Project)
  public projects: Project[] = [
    { 
      id: 'PRJ-101', name: 'ERP System Migration', category: 'INFRASTRUCTURE', location: 'Kenya', 
      owner: 'Alice M.', phase: 'Execution', status: 'Active', budget: 850000, spent: 612000, currency: 'KES', 
      startDate: '2026-01-01', projectedEndDate: '2026-06-30', hasAttachment: true, attachmentUrl: 'scope_v1.pdf'
    }
  ];

  // 2. Audit Log (Resolves NG9 'never' in Settings)
  public auditLog: AuditEntry[] = [
    { time: new Date(), action: 'SYSTEM', user: 'Admin', details: 'Governance engine synchronized' }
  ];

  // 3. Repository (Resolves NG9 downloadUrl in Repository)
  public repositoryDocs: RepositoryDocument[] = [
    { id: 'T1', name: 'Risk Template', category: 'Template', owner: 'PMO', status: 'Finalized', downloadUrl: '#', isTemplate: true }
  ];

  // 4. Supporting Properties for Reports & Dashboard
  public masterRegions: MasterRegion[] = [{ name: 'Kenya', currency: 'KES', projectCount: 12, status: 'Active' }];
  public masterPMs: MasterPM[] = [{ name: 'Alice M.', rate: 94, department: 'IT', activeProjects: 5, lastDelivery: 'Today' }];
  
  private pmSource = new BehaviorSubject<MasterPM[]>(this.masterPMs);
  masterPMs$ = this.pmSource.asObservable();

  constructor() {}

  // GOVERNANCE LOGIC
  isAdmin() { return true; }

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

  validateAttachment(file: File): { valid: boolean; error?: string } {
    const extension = file.name.split('.').pop()?.toLowerCase();
    const sizeMB = file.size / (1024 * 1024);
    if (!this.ALLOWED_EXTENSIONS.includes(extension || '')) return { valid: false, error: 'Format must be PDF/Word.' };
    if (sizeMB > this.MAX_FILE_SIZE_MB) return { valid: false, error: 'Max 5MB allowed.' };
    return { valid: true };
  }
}
