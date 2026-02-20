import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GovernanceService {
  public auditLog: any[] = [];
  public currentUser = { name: 'NeskoLimo', role: 'Administrator' };

  constructor() {} // Ensure constructor exists

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
