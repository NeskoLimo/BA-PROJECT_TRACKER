import { Injectable } from '@angular/core';

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
}

@Injectable({
  providedIn: 'root'
})
export class GovernanceService {
  public currentUser = { name: 'NeskoLimo', role: 'Administrator' };
  public auditLog: any[] = [];

  // Master Dataset: Regions
  public masterRegions: MasterRegion[] = [
    { name: 'Kenya', currency: 'KES', projectCount: 12, status: 'Active' },
    { name: 'Uganda', currency: 'UGX', projectCount: 8, status: 'Active' }
  ];

  // Master Dataset: PM Performance (The "Source of Truth" for the Dashboard)
  public masterPMs: MasterPM[] = [
    { name: 'Alice M.', rate: 92, department: 'Infrastructure' },
    { name: 'James K.', rate: 85, department: 'Software' },
    { name: 'Sarah T.', rate: 78, department: 'Operations' }
  ];

  constructor() {}

  isAdmin(): boolean {
    return this.currentUser.role === 'Administrator';
  }

  // Update logic that components will call
  updatePMRate(name: string, newRate: number) {
    const pm = this.masterPMs.find(p => p.name === name);
    if (pm) {
      const oldRate = pm.rate;
      pm.rate = newRate;
      this.logAction('UPDATE', 'PM Master Data', `${name} rate changed from ${oldRate}% to ${newRate}%`);
    }
  }

  addRegion(newRegion: MasterRegion) {
    this.masterRegions.push(newRegion);
    this.logAction('CREATE', 'Region Master Data', `Added ${newRegion.name}`);
  }

  logAction(action: string, target: string, details: string) {
    this.auditLog.unshift({
      timestamp: new Date(),
      user: this.currentUser.name,
      action,
      target,
      details
    });
  }
}
