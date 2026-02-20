import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

export interface MasterPM { name: string; rate: number; department: string; projectsActive: number; }
export interface ProjectStats { assigned: number; unassigned: number; total: number; }

@Injectable({ providedIn: 'root' })
export class GovernanceService {
  public masterPMs: MasterPM[] = [
    { name: 'Alice M.', rate: 92, department: 'Infrastructure', projectsActive: 5 },
    { name: 'James K.', rate: 85, department: 'Software', projectsActive: 3 },
    { name: 'Sarah T.', rate: 78, department: 'Operations', projectsActive: 4 }
  ];

  // Initializing stats so the dashboard has immediate McKinsey-style content
  private statsSource = new BehaviorSubject<ProjectStats>({ assigned: 14, unassigned: 2, total: 16 });
  projectStats$ = this.statsSource.asObservable();

  constructor(private http: HttpClient) {}

  updatePMRate(name: string, newRate: number) {
    const pm = this.masterPMs.find(p => p.name === name);
    if (pm) pm.rate = newRate;
  }
}
