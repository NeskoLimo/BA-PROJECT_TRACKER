import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface MasterPM { name: string; rate: number; department: string; activeProjects: number; lastDelivery: string; }
export interface PortfolioStats { assigned: number; unassigned: number; onTrack: number; delayed: number; total: number; }

@Injectable({ providedIn: 'root' })
export class GovernanceService {
  // Data for the Performance Bars
  public masterPMs: MasterPM[] = [
    { name: 'Alice M.', rate: 94, department: 'IT Strategy', activeProjects: 5, lastDelivery: '2 days ago' },
    { name: 'James K.', rate: 82, department: 'Infrastructure', activeProjects: 3, lastDelivery: '1 week ago' },
    { name: 'Sarah T.', rate: 76, department: 'Compliance', activeProjects: 4, lastDelivery: '3 days ago' }
  ];

  // Data for the Pie Charts & Storytelling
  public stats: PortfolioStats = {
    assigned: 18,
    unassigned: 4,
    onTrack: 15,
    delayed: 3,
    total: 22
  };

  private pmSource = new BehaviorSubject<MasterPM[]>(this.masterPMs);
  masterPMs$ = this.pmSource.asObservable();

  private statsSource = new BehaviorSubject<PortfolioStats>(this.stats);
  stats$ = this.statsSource.asObservable();

  isAdmin() { return true; }
}
