import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface AuditEntry {
  timestamp: string;
  action: string;
  category: string;
  details: string;
  user?: string;
}

@Injectable({
  providedIn: 'root'
})
export class GovernanceService {
  private http = inject(HttpClient);
  private readonly API_URL = '/api/v1/governance';

  // Maintaining local state for immediate UI feedback (Audit Trail display)
  private _auditTrail = signal<AuditEntry[]>([]);
  readonly auditTrail = this._auditTrail.asReadonly();

  /**
   * ADDITION: Sends audit logs to the DB while maintaining local history.
   * Used by Login/Register to record entry attempts.
   */
  logAction(action: string, category: string, details: string) {
    const entry: AuditEntry = {
      timestamp: new Date().toISOString(),
      action,
      category,
      details
    };

    // 1. Add to local Signal for immediate analytics/UI updates
    this._auditTrail.update(trail => [entry, ...trail]);

    // 2. Add to Database for permanent governance records
    this.http.post(`${this.API_URL}/audit`, entry).subscribe({
      error: (err) => console.error('Governance Sync Failed:', err)
    });
  }

  /**
   * ADDITION: Redirects Support/Access tickets to the DB.
   * Critical for the "Request Queued" registration flow.
   */
  submitTicket(type: string, description: string) {
    const ticket = {
      type,
      description,
      status: 'Open',
      createdAt: new Date().toISOString()
    };

    // Redirect to DB Support endpoint
    return this.http.post(`${this.API_URL}/tickets`, ticket).subscribe({
      next: () => console.log('Support ticket synchronized with DB'),
      error: (err) => console.error('Ticket Redirection Failed:', err)
    });
  }

  /**
   * ADDITION: Fetch historic audit logs from DB on startup.
   */
  refreshAuditLogs() {
    this.http.get<AuditEntry[]>(`${this.API_URL}/audit`).subscribe(logs => {
      this._auditTrail.set(logs);
    });
  }
}
