import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface MasterRegion { name: string; projects: number; budget: string; health: string; }
export interface MasterPM { name: string; rate: number; department: string; status: string; }
export interface Project { id: string; name: string; category: string; owner: string; phase: string; status: string; }
export interface RepositoryDoc { id: string; name: string; category: string; status: 'Pending' | 'Approved'; url: string; }

@Injectable({ providedIn: 'root' })
export class GovernanceService {
  public projects: Project[] = [
    { id: 'PRJ-101', name: 'Cloud Migration', category: 'IT', owner: 'Alice M.', phase: 'Execution', status: 'Active' },
    { id: 'PRJ-102', name: 'Network Upgrade', category: 'Infrastructure', owner: 'James K.', phase: 'Planning', status: 'Active' }
  ];

  public repositoryDocs: RepositoryDoc[] = [
    { id: 'DOC-01', name: 'Project Charter_v1', category: 'Charter', status: 'Approved', url: '#' },
    { id: 'DOC-02', name: 'SLA_Final_Draft', category: 'SLA', status: 'Pending', url: '#' }
  ];

  public masterRegions: MasterRegion[] = [
    { name: 'East Africa', projects: 12, budget: 'KES 4.2M', health: 'Stable' },
    { name: 'West Africa', projects: 5, budget: 'NGN 800M', health: 'At Risk' }
  ];

  public masterPMs: MasterPM[] = [
    { name: 'Alice M.', rate: 94, department: 'IT', status: 'Active' },
    { name: 'James K.', rate: 82, department: 'Ops', status: 'Active' }
  ];

  public auditLog = [{ time: new Date(), action: 'SYSTEM_RESTORE', user: 'Admin', details: 'Full reconstruction completed' }];

  private pmSource = new BehaviorSubject<MasterPM[]>(this.masterPMs);
  masterPMs$ = this.pmSource.asObservable();

  isAdmin() { return true; }
}
