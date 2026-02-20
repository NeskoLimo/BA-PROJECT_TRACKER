// src/app/services/governance.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Project {
  id: string;
  name: string;
  category: string;
  location: string;
  owner: string;
  phase: 'Initiation' | 'Planning' | 'Execution' | 'Closure';
  status: 'Active' | 'Planning' | 'Critical' | 'Closure';
  budget: number;
  spent: number;
  currency: string;
  startDate: string;
  projectedEndDate: string;
  actualEndDate?: string;
  attachmentUrl?: string;
  hasAttachment: boolean;
}

export interface MasterPM {
  name: string;
  rate: number;
  department: string;
  activeProjects: number;
  lastDelivery: string;
}

export interface RepositoryDocument {
  id: string;
  name: string;
  category: string;
  owner: string;
  status: 'Pending' | 'Approved' | 'Finalized';
  downloadUrl: string;
  isTemplate: boolean;
  nextSignatory?: string;
}

export interface AuditEntry {
  time: Date;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'UPLOAD' | 'SYSTEM';
  user: string;
  details: string;
}

export interface MasterRegion {
  name: string;
  currency: string;
  projectCount: number;
  status: 'Active' | 'Paused';
}

@Injectable({ providedIn: 'root' })
export class GovernanceService {

  // 1. GOVERNANCE CONSTANTS
  readonly MAX_FILE_SIZE_MB = 5;
  readonly ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx'];

  // 2. USER CONTEXT
  public currentUser = { name: 'Admin User', role: 'ADMIN' };

  // 3. PROJECT REGISTRY
  public projects: Project[] = [
    {
      id: 'PRJ-101', name: 'ERP System Migration', category: 'INFRASTRUCTURE', location: 'Kenya',
      owner: 'Alice M.', phase: 'Execution', status: 'Active', budget: 850000, spent: 612000, currency: 'KES',
      startDate: '2026-01-01', projectedEndDate: '2026-06-30', hasAttachment: true, attachmentUrl: 'scope_final_v1.pdf'
    },
    {
      id: 'PRJ-102', name: 'Warehouse Expansion', category: 'OPERATIONS', location: 'Uganda',
      owner: 'James K.', phase: 'Planning', status: 'Planning', budget: 1200000, spent: 0, currency: 'UGX',
      startDate: '2026-03-15', projectedEndDate: '2026-12-20', hasAttachment: false
    }
  ];

  // 4. RESOURCE REGISTRY
  public masterPMs: MasterPM[] = [
    { name: 'Alice M.', rate: 94, department: 'Digital Transformation', activeProjects: 4, lastDelivery: '2 days ago' },
    { name: 'James K.', rate: 82, department: 'Logistics IT', activeProjects: 2, lastDelivery: '1 week ago' }
  ];

  // 5. AUDIT & REPOSITORY
  public auditLog: AuditEntry[] = [
    { time: new Date(), action: 'SYSTEM', user: 'Admin', details: 'Governance registry initialized with RBAC' }
  ];

  public repositoryDocs: RepositoryDocument[] = [
    { id: 'TMP-01', name: 'Scope Sign-off Template', category: 'Template', owner: 'PMO', status: 'Finalized', downloadUrl: '#', isTemplate: true }
  ];

  public masterRegions: MasterRegion[] = [
    { name: 'Kenya', currency: 'KES', projectCount: 12, status: 'Active' },
    { name: 'Uganda', currency: 'UGX', projectCount: 8, status: 'Active' }
  ];

  // 6. DASHBOARD STREAMS
  private pmSource = new BehaviorSubject<MasterPM[]>(this.masterPMs);
  masterPMs$ = this.pmSource.asObservable();

  constructor() {}

  // 7. GOVERNANCE ENGINES

  /** Calculates progress based on time elapsed vs projected duration */
  getCalculatedProgress(p: Project): number {
    const start = new Date(p.startDate).getTime();
    const end = new Date(p.projectedEndDate).getTime();
    const now = new Date().getTime();
    if (now < start) return 0;
    if (now > end || p.phase === 'Closure') return 100;
    const total = end - start;
    const elapsed = now - start;
    return Math.round((elapsed / total) * 100);
  }

  /** Gatekeeper: Blocks project if scope attachment is missing in Planning */
  canMoveToExecution(p: Project): boolean {
    return !(p.phase === 'Planning' && !p.hasAttachment);
  }

  /** Compliance: Validates file type and size */
  validateAttachment(file: File): { valid: boolean; error?: string } {
    const extension = file.name.split('.').pop()?.toLowerCase();
    const sizeMB = file.size / (1024 * 1024);
    if (!this.ALLOWED_EXTENSIONS.includes(extension || '')) {
      return { valid: false, error: 'File must be PDF, DOC, or DOCX.' };
    }
    if (sizeMB > this.MAX_FILE_SIZE_MB) {
      return { valid: false, error: `File exceeds ${this.MAX_FILE_SIZE_MB}MB limit.` };
    }
    return { valid: true };
  }

  // 8. PERMISSION ENGINE
  isAdmin(): boolean { return this.currentUser.role === 'ADMIN'; }
  canEdit(): boolean { return this.isAdmin() || this.currentUser.role === 'PMO'; }
  canDelete(): boolean { return this.isAdmin(); } // ← was missing

  // 9. PROJECT CRUD ENGINE

  /** Delete project by ID and log to audit */
  deleteProject(id: string): void {
    const project = this.projects.find(p => p.id === id);
    if (project) {
      this.projects = this.projects.filter(p => p.id !== id);
      this.auditLog.unshift({
        time: new Date(),
        action: 'DELETE',
        user: this.currentUser.name,
        details: `Removed project "${project.name}" (${id}) from registry`
      });
    }
  }

  /** Add project and log to audit */
  addProject(project: Project): void {
    this.projects.unshift(project);
    this.auditLog.unshift({
      time: new Date(),
      action: 'CREATE',
      user: this.currentUser.name,
      details: `Created project "${project.name}" in ${project.location}`
    });
  }

  /** Update project and log to audit */
  updateProject(updated: Project): void {
    const idx = this.projects.findIndex(p => p.id === updated.id);
    if (idx > -1) {
      this.projects[idx] = updated;
      this.auditLog.unshift({
        time: new Date(),
        action: 'UPDATE',
        user: this.currentUser.name,
        details: `Updated project "${updated.name}" — phase: ${updated.phase}, status: ${updated.status}`
      });
    }
  }

  /** Log file upload to audit */
  logUpload(projectName: string, filename: string): void {
    this.auditLog.unshift({
      time: new Date(),
      action: 'UPLOAD',
      user: this.currentUser.name,
      details: `Uploaded "${filename}" to project "${projectName}"`
    });
  }
}
