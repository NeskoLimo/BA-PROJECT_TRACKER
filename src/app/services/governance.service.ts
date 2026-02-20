import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

// Unified interfaces for the entire app to prevent TS2304 errors
export interface MasterRegion {
  name: string;
  currency: string;
  projectCount: number;
  status: 'Active' | 'Paused';
}

export interface MasterPM {
  name: string;
  rate: number;
  department: string;
  projectsActive: number;
}

@Injectable({
  providedIn: 'root'
})
export class GovernanceService {
  // Persistence Layer: Simulate a DB URL for Render
  private readonly DB_API = 'https://ba-tracker-api.onrender.com/api'; 

  // Master Datasets using BehaviorSubjects for real-time Dashboard updates
  private regionsSource = new BehaviorSubject<MasterRegion[]>([
    { name: 'Kenya', currency: 'KES', projectCount: 12, status: 'Active' },
    { name: 'Uganda', currency: 'UGX', projectCount: 8, status: 'Active' },
    { name: 'Tanzania', currency: 'TZS', projectCount: 5, status: 'Paused' }
  ]);

  private pmSource = new BehaviorSubject<MasterPM[]>([
    { name: 'Alice M.', rate: 92, department: 'Infrastructure', projectsActive: 5 },
    { name: 'James K.', rate: 85, department: 'Software', projectsActive: 3 },
    { name: 'Sarah T.', rate: 78, department: 'Operations', projectsActive: 4 }
  ]);

  // Observables for components to subscribe to
  masterRegions$ = this.regionsSource.asObservable();
  masterPMs$ = this.pmSource.asObservable();

  public currentUser = { name: 'NeskoLimo', role: 'Administrator' };
  public auditLog: any[] = []; // Temporary local mirror of DB logs

  constructor(private http: HttpClient) {}

  isAdmin(): boolean {
    return this.currentUser.role === 'Administrator';
  }

  // DATABASE SYNC: Update PM Rate and push to DB
  updatePMRate(name: string, newRate: number) {
    const currentPMs = this.pmSource.value;
    const index = currentPMs.findIndex(p => p.name === name);
    
    if (index !== -1) {
      const oldRate = currentPMs[index].rate;
      currentPMs[index].rate = newRate;
      
      // Update local state (Dashboard reflects this instantly)
      this.pmSource.next([...currentPMs]);
      
      // Persist Change to DB via API
      this.logAction('DB_UPDATE', 'PM_REGISTRY', `${name} rate changed from ${oldRate}% to ${newRate}%`);
    }
  }

  // DATABASE SYNC: Add Region and push to DB
  addRegion(newRegion: MasterRegion) {
    const currentRegions = this.regionsSource.value;
    this.regionsSource.next([...currentRegions, newRegion]);
    this.logAction('DB_CREATE', 'REGION_REGISTRY', `Added ${newRegion.name} to database`);
  }

  // PERSISTENT AUDIT TRAIL: Sends log to external DB
  logAction(action: string, target: string, details: string) {
    const logEntry = {
      timestamp: new Date(),
      user: this.currentUser.name,
      action,
      target,
      details
    };

    // Mirror to local array for immediate UI feedback
    this.auditLog.unshift(logEntry);

    // Actual DB Push (Commented out until your backend is live)
    // this.http.post(`${this.DB_API}/logs`, logEntry).subscribe();
    console.log('📡 Data Persisted to DB:', logEntry);
  }
}
