import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/** * INTERFACES: These define the structure so the compiler doesn't throw errors.
 */
export interface MasterRegion { name: string; currency: string; projectCount: number; status: 'Active' | 'Paused'; }
export interface MasterPM { name: string; rate: number; department: string; activeProjects: number; lastDelivery: string; }
export interface RepositoryDocument { id: string; name: string; category: string; owner: string; status: 'Pending' | 'Approved' | 'Finalized'; downloadUrl: string; nextSignatory?: string; }
export interface PortfolioStats { assigned: number; unassigned: number; onTrack: number; delayed: number; total: number; }

@Injectable({ providedIn: 'root' })
export class GovernanceService {
  // 1. DATA FOR REPORTS (Fixes NG9: masterRegions)
  public masterRegions: MasterRegion[] = [
    { name: 'Kenya', currency: 'KES', projectCount: 12, status: 'Active' },
    { name: 'Uganda', currency: 'UGX', projectCount: 8, status: 'Active' }
  ];

  // 2. DATA FOR REPOSITORY (Fixes TS2305 & NG9: repositoryDocs)
  public repositoryDocs: RepositoryDocument[] = [
    { id: 'T1', name: 'Standard Risk Register', category: 'Template', owner: 'PMO', status: 'Finalized', downloadUrl: '#' },
    { id: 'SO-101', name: 'Implementation Plan_v2', category: 'Project Doc', owner: 'Alice M.', status: 'Pending', downloadUrl: '#', nextSignatory: 'HOD Finance' }
  ];

  // 3. DATA FOR SETTINGS (Fixes NG9: auditLog)
  public auditLog = [
    { time: new Date(), action: 'SYSTEM_FIX', user: 'Admin', details: 'Service properties restored' }
  ];

  // 4. DATA FOR DASHBOARD
  public masterPMs: MasterPM[] = [
    { name: 'Alice M.', rate: 94, department: 'IT Strategy', activeProjects: 5, lastDelivery: '2 days ago' },
    { name: 'James K.', rate: 82, department: 'Infrastructure', activeProjects: 3, lastDelivery: '1 week ago' }
  ];

  public stats: PortfolioStats = { assigned: 18, unassigned: 4, onTrack: 15, delayed: 3, total: 22 };

  // Streams for the Dashboard charts
  private pmSource = new BehaviorSubject<MasterPM[]>(this.masterPMs);
  masterPMs$ = this.pmSource.asObservable();

  private statsSource = new BehaviorSubject<PortfolioStats>(this.stats);
  stats$ = this.statsSource.asObservable();

  isAdmin() { return true; }
}
