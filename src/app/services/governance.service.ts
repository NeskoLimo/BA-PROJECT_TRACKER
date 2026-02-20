import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/** * ALIGNED INTERFACES: Restores currency, projectCount, and owner properties
 */
export interface MasterRegion { 
  name: string; 
  currency: string; 
  projectCount: number; 
  status: 'Active' | 'Paused'; 
}

export interface MasterPM { 
  name: string; 
  rate: number; 
  department: string; 
  status: string; 
}

export interface Project { 
  id: string; 
  name: string; 
  category: string; 
  owner: string; 
  phase: string; 
  status: string; 
}

// Renamed to RepositoryDocument as requested by the component error
export interface RepositoryDocument { 
  id: string; 
  name: string; 
  category: string; 
  owner: string; 
  status: 'Pending' | 'Approved' | 'Finalized'; 
  downloadUrl: string; 
}

@Injectable({ providedIn: 'root' })
export class GovernanceService {
  public projects: Project[] = [
    { id: 'PRJ-101', name: 'Cloud Migration', category: 'IT', owner: 'Alice M.', phase: 'Execution', status: 'Active' },
    { id: 'PRJ-102', name: 'Network Upgrade', category: 'Infrastructure', owner: 'James K.', phase: 'Planning', status: 'Active' }
  ];

  public repositoryDocs: RepositoryDocument[] = [
    { id: 'DOC-01', name: 'Project Charter_v1', category: 'Charter', owner: 'Alice M.', status: 'Approved', downloadUrl: '#' },
    { id: 'DOC-02', name: 'SLA_Final_Draft', category: 'SLA', owner: 'James K.', status: 'Pending', downloadUrl: '#' }
  ];

  public masterRegions: MasterRegion[] = [
    { name: 'Kenya', currency: 'KES', projectCount: 12, status: 'Active' },
    { name: 'Uganda', currency: 'UGX', projectCount: 8, status: 'Active' }
  ];

  public masterPMs: MasterPM[] = [
    { name: 'Alice M.', rate: 94, department: 'IT', status: 'Active' },
    { name: 'James K.', rate: 82, department: 'Ops', status: 'Active' }
  ];

  public auditLog = [{ time: new Date(), action: 'RECONSTRUCT_V2', user: 'Admin', details: 'Property alignment completed' }];

  private pmSource = new BehaviorSubject<MasterPM[]>(this.masterPMs);
  masterPMs$ = this.pmSource.asObservable();

  isAdmin() { return true; }
}
