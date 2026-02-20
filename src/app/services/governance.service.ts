import { Injectable } from '@angular/core';

export interface MasterRegion {
  id: string;
  name: string;
  currency: string;
  totalBudget: number;
  projectCount: number;
  status: 'Active' | 'Paused';
}

@Injectable({
  providedIn: 'root'
})
export class GovernanceService {
  public auditLog: any[] = [];
  public currentUser = { name: 'NeskoLimo', role: 'Administrator' };

  // Master Registry Data
  public masterRegions: MasterRegion[] = [
    { id: 'KE-01', name: 'Kenya', currency: 'KES', totalBudget: 5200000, projectCount: 12, status: 'Active' },
    { id: 'UG-01', name: 'Uganda', currency: 'UGX', totalBudget: 1850000, projectCount: 8, status: 'Active' },
    { id: 'TZ-01', name: 'Tanzania', currency: 'TZS', totalBudget: 3100000, projectCount: 5, status: 'Paused' },
    { id: 'RW-01', name: 'Rwanda', currency: 'RWF', totalBudget: 950000, projectCount: 3, status: 'Active' }
  ];

  constructor() {}

  isAdmin(): boolean {
    return this.currentUser.role === 'Administrator';
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
