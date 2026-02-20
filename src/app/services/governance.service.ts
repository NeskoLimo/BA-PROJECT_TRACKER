import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

// Unified interfaces to prevent build errors
export interface MasterRegion { name: string; currency: string; projectCount: number; status: 'Active' | 'Paused'; }
export interface MasterPM { name: string; rate: number; department: string; projectsActive: number; }
export interface ProjectStats { assigned: number; unassigned: number; total: number; }
export interface RepositoryDocument { 
  id: string; 
  name: string; 
  category: 'Charter' | 'SLA' | 'Sign-off' | 'Report'; 
  owner: string; 
  status: 'Pending' | 'Approved' | 'Finalized'; 
  downloadUrl: string;
}

@Injectable({ providedIn: 'root' })
export class GovernanceService {
  // Data for Reports
  public masterRegions: MasterRegion[] = [
    { name: 'Kenya', currency: 'KES', projectCount: 12, status: 'Active' },
    { name: 'Uganda', currency: 'UGX', projectCount: 8, status: 'Active' }
  ];

  // Data for Dashboard/Settings
  public masterPMs: MasterPM[] = [
    { name: 'Alice M.', rate: 92, department: 'Infrastructure', projectsActive: 5 },
    { name: 'James K.', rate: 85, department: 'Software', projectsActive: 3 }
  ];

  // Data for Repository (Monitoring Sign-offs)
  public repositoryDocs: RepositoryDocument[] = [
    { id: 'DOC-101', name: 'Charter_v1', category: 'Charter', owner: 'Alice M.', status: 'Approved', downloadUrl: '#' },
    { id: 'DOC-102', name: 'SLA_Final', category: 'SLA', owner: 'James K.', status: 'Pending', downloadUrl: '#' }
  ];

  // Data for Settings Log
  public auditLog: any[] = [{ timestamp: new Date(), user: 'NeskoLimo', action: 'SYNC', details: 'System Restored' }];

  // Streams for real-time updates
  private pmSource = new BehaviorSubject<MasterPM[]>(this.masterPMs);
  masterPMs$ = this.pmSource.asObservable();

  private statsSource = new BehaviorSubject<ProjectStats>({ assigned: 20, unassigned: 4, total: 24 });
  projectStats$ = this.statsSource.asObservable();

  constructor(private http: HttpClient) {}

  isAdmin() { return true; } // Simplified for access

  updatePMRate(name: string, newRate: number) {
    const pm = this.masterPMs.find(p => p.name === name);
    if (pm) {
      pm.rate = newRate;
      this.pmSource.next([...this.masterPMs]);
    }
  }
}
