import { Injectable, signal } from '@angular/core';

export interface AuditEntry {
  id: string; // Required
  time: Date;
  action: 'SYSTEM' | 'UPLOAD' | 'DELETE' | 'EDIT' | 'LOGIN' | 'CREATE' | 'UPDATE';
  user: string;
  details: string;
}

@Injectable({ providedIn: 'root' })
export class GovernanceService {
  private _auditLog = signal<AuditEntry[]>([]);
  readonly auditLogSig = this._auditLog.asReadonly();

  /**
   * Centralized Logging Method
   * Handles ID generation and structure to prevent TS2345 errors.
   */
  public log(action: AuditEntry['action'], details: string): void {
    const entry: AuditEntry = {
      id: crypto.randomUUID(), // Generates the missing 'id'
      time: new Date(),
      action,
      user: 'Current User', // This would ideally come from an AuthService
      details
    };
    
    this._auditLog.update(log => [entry, ...log]);
    this.persistAudit();
  }

  private persistAudit(): void {
    localStorage.setItem('ba_audit', JSON.stringify(this._auditLog()));
  }
}
