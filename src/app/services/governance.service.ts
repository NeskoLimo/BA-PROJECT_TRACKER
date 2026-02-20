import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/** * ARCHITECTURAL INTERFACES
 * Enriched with the required analytics fields: dates and attachments.
 */
export interface Project { 
  id: string; 
  name: string; 
  category: string; 
  location: string;
  owner: string; // Matches component expectation
  status: 'Active' | 'Planning' | 'Critical' | 'Closure'; 
  budget: number; 
  spent: number; 
  currency: string; 
  progress: number;
  startDate: string; 
  projectedEndDate: string; 
  actualEndDate?: string; 
  hasAttachment: boolean; 
}

export interface RepositoryDocument { // Fixed name for Export
  id: string; 
  name: string; 
  category: string; 
  owner: string; 
  status: 'Pending' | 'Approved' | 'Finalized'; 
  downloadUrl: string; 
  isTemplate: boolean; 
  nextSignatory?: string; 
}

export interface MasterRegion { name: string; currency: string; projectCount: number; status: 'Active' | 'Paused'; }

@Injectable({ providedIn: 'root' })
export class GovernanceService {
  // Fixes NG9: masterRegions
  public masterRegions: MasterRegion[] = [
    { name: 'Kenya', currency: 'KES', projectCount: 12, status: 'Active' },
    { name: 'Uganda', currency: 'UGX', projectCount: 8, status: 'Active' }
  ];

  // Fixes NG9: repositoryDocs
  public repositoryDocs: RepositoryDocument[] = [
    { id: 'T-01', name: 'Risk Register Template', category: 'Template', owner: 'PMO', status: 'Finalized', downloadUrl: '#', isTemplate: true },
    { id: 'S-01', name: 'Scope Sign-off: Phase 1', category: 'Project Doc', owner: 'Alice M.', status: 'Pending', downloadUrl: '#', isTemplate: false, nextSignatory: 'HOD Finance' }
  ];

  // Enriched Project Data for Analytics
  public projects: Project[] = [
    { 
      id: 'PRJ-101', name: 'ERP System Migration', category: 'INFRASTRUCTURE', location: 'Kenya', 
      owner: 'Alice M.', status: 'Active', budget: 850000, spent: 612000, currency: 'KES', 
      progress: 72, startDate: '2026-01-01', projectedEndDate: '2026-06-30', hasAttachment: true 
    },
    { 
      id: 'PRJ-103', name: 'Cloud Migration', category: 'INFRASTRUCTURE', location: 'Kenya', 
      owner: 'Alice M.', status: 'Critical', budget: 1200000, spent: 1100000, currency: 'KES', 
      progress: 92, startDate: '2025-11-10', projectedEndDate: '2026-02-28', hasAttachment: true 
    }
  ];

  // Fixes NG9: auditLog
  public auditLog = [
    { time: new Date(), action: 'ARCH_ALIGN', user: 'Admin', details: 'System properties synchronized' }
  ];

  // Dashboard Streams
  private pmSource = new BehaviorSubject<any[]>([]);
  masterPMs$ = this.pmSource.asObservable();

  // Fixes NG9: isAdmin
  isAdmin() { return true; }
}
