import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/** * STRICT INTERFACES: Prevents TS2305 and TS7006 build errors
 */
export interface MasterRegion { name: string; currency: string; projectCount: number; status: 'Active' | 'Paused'; budget: string; health: string; }
export interface MasterPM { name: string; rate: number; department: string; projectsActive: number; }
export interface ProjectStats { assigned: number; unassigned: number; total: number; }
export interface RepositoryDocument { id: string; name: string; category: string; owner: string; status: 'Pending' | 'Approved' | 'Finalized'; downloadUrl: string; }

@Injectable({ providedIn: 'root' })
export class GovernanceService {
  // 1. REPOSITORY DATA: Restores document monitoring and sign-offs
  public repositoryDocs: RepositoryDocument[] = [
    { id: 'DOC-101', name: 'Project Charter_v1.2', category: 'Charter', owner: 'Alice M.', status: 'Approved', downloadUrl: '#' },
    { id: 'DOC-102', name: 'Vendor SLA_Final', category: 'SLA', owner: 'James K.', status: 'Pending', downloadUrl: '#' },
    { id: 'DOC-103', name: 'Compliance Sign-off', category: 'Sign-off', owner: 'Sarah T.', status: 'Finalized', downloadUrl: '#' }
  ];

  // 2. REPORTS DATA: Restores regional analytics
  public masterRegions: MasterRegion[] = [
    { name: 'Kenya', currency: 'KES', projectCount: 12, status: 'Active', budget: '4.2M', health: 'On Track' },
    { name: 'Uganda', currency: 'UGX', projectCount: 8, status: 'Active', budget: '1.1B', health: 'At Risk' }
  ];

  // 3. SETTINGS DATA: Restores the audit log
  public auditLog: any[] = [
    { timestamp: new Date(), user: 'NeskoLimo', action: 'CORE_RECONSTRUCT', details: 'Full system logic restored from scratch' }
  ];

  // 4. DASHBOARD DATA: Restores PM registry and stats
  public masterPMs: MasterPM[] = [
    { name: 'Alice M.', rate: 92, department: 'Infrastructure', projectsActive: 5 },
    { name: 'James K.', rate: 85, department: 'Software', projectsActive: 3 }
  ];

  private pmSource = new BehaviorSubject<MasterPM[]>(this.masterPMs);
  masterPMs$ = this.pmSource.asObservable();

  private statsSource = new BehaviorSubject<ProjectStats>({ assigned: 20, unassigned: 4, total: 24 });
  projectStats$ = this.statsSource.asObservable();

  isAdmin(): boolean { return true; }

  updatePMRate(name: string, newRate: number) {
    const pm = this.masterPMs.find(p => p.name === name);
    if (pm) {
      pm.rate = newRate;
      this.auditLog.unshift({ timestamp: new Date(), user: 'NeskoLimo', action: 'RATE_ADJ', details: `${name} updated to ${newRate}%` });
      this.pmSource.next([...this.masterPMs]);
    }
  }
}
