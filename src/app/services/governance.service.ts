import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

export interface MasterRegion { name: string; currency: string; projectCount: number; status: 'Active' | 'Paused'; }
export interface MasterPM { name: string; rate: number; department: string; projectsActive: number; }
export interface ProjectStats { assigned: number; unassigned: number; total: number; }

@Injectable({ providedIn: 'root' })
export class GovernanceService {
  // Restore masterRegions for the Reports page
  public masterRegions: MasterRegion[] = [
    { name: 'Kenya', currency: 'KES', projectCount: 12, status: 'Active' },
    { name: 'Uganda', currency: 'UGX', projectCount: 8, status: 'Active' },
    { name: 'Tanzania', currency: 'TZS', projectCount: 5, status: 'Paused' }
  ];

  // Restore masterPMs for the Settings page
  public masterPMs: MasterPM[] = [
    { name: 'Alice M.', rate: 92, department: 'Infrastructure', projectsActive: 5 },
    { name: 'James K.', rate: 85, department: 'Software', projectsActive: 3 },
    { name: 'Sarah T.', rate: 78, department: 'Operations', projectsActive: 4 }
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
      this.pmSource.next([...this.masterPMs]);
    }
  }
}
