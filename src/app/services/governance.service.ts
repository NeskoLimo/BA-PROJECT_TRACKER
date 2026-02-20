import { Injectable } from '@angular/core';

export interface MasterRegion {
  name: string;
  currency: string;
  projectCount: number;
  status: 'Active' | 'Paused';
}

@Injectable({
  providedIn: 'root'
})
export class GovernanceService {
  // Fixes NG9: Property 'masterRegions' does not exist
  public masterRegions: MasterRegion[] = [
    { name: 'Kenya', currency: 'KES', projectCount: 12, status: 'Active' },
    { name: 'Uganda', currency: 'UGX', projectCount: 8, status: 'Active' },
    { name: 'Tanzania', currency: 'TZS', projectCount: 5, status: 'Paused' }
  ];

  public currentUser = { 
    name: 'NeskoLimo', 
    role: 'Administrator' 
  };

  public auditLog: any[] = [];

  constructor() {}

  // Fixes NG9: Property 'isAdmin' does not exist
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
