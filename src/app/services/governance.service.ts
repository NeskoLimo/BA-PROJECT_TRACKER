import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/** * 🏛️ ARCHITECTURAL INTERFACES
 * These must be exported for the components to "see" them.
 */

// Fixes TS2305: Exporting MasterPM for the Dashboard
export interface MasterPM { 
  name: string; 
  rate: number; 
  department: string; 
  activeProjects: number; 
  lastDelivery: string; 
}

// Fixes NG9: Defining Project with 'owner' and enrichment fields
export interface Project { 
  id: string; 
  name: string; 
  category: string; 
  location: string; 
  owner: string; 
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

// Fixes TS2305: Exporting RepositoryDocument
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

// Fixes NG9: Exporting MasterRegion for Reports
export interface MasterRegion { 
  name: string; 
  currency: string; 
  projectCount: number; 
  status: 'Active' | 'Paused'; 
}

@Injectable({ providedIn: 'root' })
export class GovernanceService {
  
  // 1. PROJECT DATA (Mass upload & Analytics ready)
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

  // 2. RESOURCE DATA (For Dashboard Performance Bars)
  public masterPMs: MasterPM[] = [
    { name: 'Alice M.', rate: 94, department: 'IT Strategy', activeProjects: 5, lastDelivery: '2 days ago' },
    { name: 'James K.', rate: 82, department: 'Infrastructure', activeProjects: 3, lastDelivery: '1 week ago' }
  ];

  // 3. REGIONAL DATA (For Reports)
  public masterRegions: MasterRegion[] = [
    { name: 'Kenya', currency: 'KES', projectCount: 12, status: 'Active' },
    { name: 'Uganda', currency: 'UGX', projectCount: 8, status: 'Active' }
  ];

  // 4. REPOSITORY DATA (For Downloads/Sign-offs)
  public repositoryDocs: RepositoryDocument[] = [
    { id: 'T1', name: 'Governance Template', category: 'Template', owner: 'PMO', status: 'Finalized', downloadUrl: '#', isTemplate: true }
  ];

  // 5. AUDIT LOG (For Settings)
  public auditLog = [
    { time: new Date(), action: 'CORE_RESTORE', user: 'Admin', details: 'Full governance architecture validated' }
  ];

  // DASHBOARD STREAMS
  private pmSource = new BehaviorSubject<MasterPM[]>(this.masterPMs);
  masterPMs$ = this.pmSource.asObservable();

  // ACCESS CONTROL (Fixes NG9: isAdmin)
  isAdmin() { return true; }

  constructor() {}
}
