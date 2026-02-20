import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

export interface MasterRegion { name: string; currency: string; projectCount: number; status: 'Active' | 'Paused'; }
export interface MasterPM { name: string; rate: number; department: string; projectsActive: number; }
export interface ProjectStats { assigned: number; unassigned: number; total: number; }

@Injectable({ providedIn: 'root' })
export class GovernanceService {
  // These properties MUST exist for your components to compile
  public masterRegions: MasterRegion[] = [
    { name: 'Kenya', currency: 'KES', projectCount: 12, status: 'Active' },
    { name: 'Uganda', currency: 'UGX', projectCount: 8, status: 'Active' }
  ];

  public masterPMs: MasterPM[] = [
    { name: 'Alice M.', rate: 92, department: 'Infrastructure', projectsActive: 5 },
    { name: 'James K.', rate: 85, department: 'Software', projectsActive: 3 },
    { name: 'Sarah T.', rate: 78, department: 'Operations', projectsActive: 4 }
  ];

  // Observables for reactive UI components
  private pmSource = new BehaviorSubject<MasterPM[]>(this.masterPMs);
  masterPMs$ = this.pmSource.asObservable();

  private statsSource = new BehaviorSubject<ProjectStats>({ assigned: 12, unassigned: 4, total: 16 });
  projectStats$ = this.statsSource.asObservable();

  public currentUser = { name: 'NeskoLimo', role: 'Administrator' };
  public auditLog: any[] = [];

  constructor(private http: HttpClient) {}

  isAdmin(): boolean { return this.currentUser.role === 'Administrator'; }

  // Fixes TS2339: Property 'updatePMRate' does not exist
  updatePMRate(name: string, newRate: number) {
    const pm = this.masterPMs.find(p => p.name === name);
    if (pm) {
      pm.rate = newRate;
      this.pmSource.next([...this.masterPMs]); // Notify subscribers
      this.logAction('DB_UPDATE', 'PM_REGISTRY', `${name} rate updated to ${newRate}%`);
    }
  }

  logAction(action: string, target: string, details: string) {
    this.auditLog.unshift({ timestamp: new Date(), user: this.currentUser.name, action, target, details });
  }
}
