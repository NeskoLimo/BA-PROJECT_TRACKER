import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

// Core Interfaces to prevent 'Cannot find name' errors
export interface MasterPM { 
  name: string; 
  rate: number; 
  department: string; 
  projectsActive: number; 
}

export interface ProjectStats { 
  assigned: number; 
  unassigned: number; 
  total: number; 
}

@Injectable({
  providedIn: 'root'
})
export class GovernanceService {
  // 1. PM Performance Data Stream
  private pmSource = new BehaviorSubject<MasterPM[]>([
    { name: 'Alice M.', rate: 92, department: 'Infrastructure', projectsActive: 5 },
    { name: 'James K.', rate: 85, department: 'Software', projectsActive: 3 },
    { name: 'Sarah T.', rate: 78, department: 'Operations', projectsActive: 4 }
  ]);
  masterPMs$ = this.pmSource.asObservable();

  // 2. Project Distribution Data Stream (For the Pie Chart)
  private statsSource = new BehaviorSubject<ProjectStats>({
    assigned: 12,
    unassigned: 4,
    total: 16
  });
  projectStats$ = this.statsSource.asObservable();

  public currentUser = { name: 'NeskoLimo', role: 'Administrator' };
  public auditLog: any[] = [];

  constructor(private http: HttpClient) {}

  isAdmin(): boolean {
    return this.currentUser.role === 'Administrator';
  }

  // Update logic that triggers the Pie Chart and Storytelling
  updateDistribution(assigned: number, unassigned: number) {
    this.statsSource.next({ 
      assigned, 
      unassigned, 
      total: assigned + unassigned 
    });
    this.logAction('DATA_SYNC', 'Distribution', `Assigned: ${assigned}, Unassigned: ${unassigned}`);
  }

  logAction(action: string, target: string, details: string) {
    const entry = { timestamp: new Date(), user: this.currentUser.name, action, target, details };
    this.auditLog.unshift(entry);
    // Prepared for future DB integration:
    console.log('📡 Audit saved to local buffer:', entry);
  }
}
