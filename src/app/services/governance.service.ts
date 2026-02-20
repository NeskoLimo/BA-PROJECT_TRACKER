import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

export interface MasterRegion { name: string; currency: string; projectCount: number; status: 'Active' | 'Paused'; }
export interface MasterPM { name: string; rate: number; department: string; projectsActive: number; }
export interface ProjectStats { assigned: number; unassigned: number; total: number; }

@Injectable({ providedIn: 'root' })
export class GovernanceService {
  public masterRegions: MasterRegion[] = [
    { name: 'Kenya', currency: 'KES', projectCount: 12, status: 'Active' },
    { name: 'Uganda', currency: 'UGX', projectCount: 8, status: 'Active' }
  ];

  public masterPMs: MasterPM[] = [
    { name: 'Alice M.', rate: 92, department: 'Infrastructure', projectsActive: 5 },
    { name: 'James K.', rate: 85, department: 'Software', projectsActive: 3 },
    { name: 'Sarah T.', rate: 78, department: 'Operations', projectsActive: 4 }
  ];

  // Restoring the property that caused the NG9 error
  public auditLog: any[] = [
    { timestamp: new Date(), user: 'NeskoLimo', action: 'SYSTEM_INIT', details: 'McKinsey Theme Applied' }
  ];

  private pmSource = new BehaviorSubject<MasterPM[]>(this.masterPMs);
  masterPMs$: Observable<MasterPM[]> = this.pmSource.asObservable();

  private statsSource = new BehaviorSubject<ProjectStats>({ assigned: 14, unassigned: 2, total: 16 });
  projectStats$: Observable<ProjectStats> = this.statsSource.asObservable();

  public currentUser = { name: 'NeskoLimo', role: 'Administrator' };

  constructor(private http: HttpClient) {}

  isAdmin(): boolean { return this.currentUser.role === 'Administrator'; }

  updatePMRate(name: string, newRate: number) {
    const pm = this.masterPMs.find(p => p.name === name);
    if (pm) {
      pm.rate = newRate;
      this.auditLog.unshift({ 
        timestamp: new Date(), 
        user: this.currentUser.name, 
        action: 'RATE_UPDATE', 
        details: `${name} set to ${newRate}%` 
      });
      this.pmSource.next([...this.masterPMs]);
    }
  }
}
