import { Injectable } from '@angular/core';

export interface AuditEntry {
  timestamp: Date;
  user: string;
  action: string;
  target: string;
  details: string;
}

@Injectable({ providedIn: 'root' })
export class GovernanceService {
  public auditLog: AuditEntry[] = [];
  public currentUser = { name: 'NeskoLimo', role: 'Administrator' };

  isAdmin() { return this.currentUser.role === 'Administrator'; }

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
