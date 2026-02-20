import { Injectable, signal, computed } from '@angular/core';

// ─── Models ───────────────────────────────────────────────────────────────────

export type ActionType = 'SYSTEM' | 'UPLOAD' | 'DELETE' | 'EDIT' | 'LOGIN';
export type UserRole   = 'HOD' | 'ADMIN' | 'VIEWER' | 'EDITOR';

export interface AuditEntry {
  id:      string;
  time:    Date;
  action:  ActionType;
  user:    string;
  details: string;
}

export interface CurrentUser {
  name: string;
  role: UserRole;
}

export interface PolicyConfig {
  maxFileSizeMb:   number;
  allowedFormats:  string[];
  phaseGateLock:   boolean;
}

// ─── Permission matrix ────────────────────────────────────────────────────────

const ROLE_PERMISSIONS: Record<UserRole, { edit: boolean; delete: boolean; admin: boolean }> = {
  HOD:    { edit: true,  delete: true,  admin: true  },
  ADMIN:  { edit: true,  delete: true,  admin: true  },
  EDITOR: { edit: true,  delete: false, admin: false },
  VIEWER: { edit: false, delete: false, admin: false },
};

// ─── Service ──────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class GovernanceService {

  // ── Public state (signals) ─────────────────────────────────────────────────

  readonly currentUser = signal<CurrentUser>({ name: 'Dr. Amara Osei', role: 'HOD' });

  readonly policy = signal<PolicyConfig>({
    maxFileSizeMb:  25,
    allowedFormats: ['PDF', 'DOC', 'DOCX'],
    phaseGateLock:  true,
  });

  readonly auditLog = signal<AuditEntry[]>(this.#seedLog());

  // ── Derived permissions ────────────────────────────────────────────────────

  readonly canEdit   = computed(() => ROLE_PERMISSIONS[this.currentUser().role].edit);
  readonly canDelete = computed(() => ROLE_PERMISSIONS[this.currentUser().role].delete);
  readonly isAdmin   = computed(() => ROLE_PERMISSIONS[this.currentUser().role].admin);

  readonly userInitials = computed(() =>
    this.currentUser().name
      .split(' ')
      .map(w => w[0])
      .slice(0, 3)
      .join('')
      .toUpperCase()
  );

  // ── Audit helpers ──────────────────────────────────────────────────────────

  logAction(action: ActionType, details: string): void {
    const entry: AuditEntry = {
      id:      crypto.randomUUID(),
      time:    new Date(),
      action,
      user:    this.currentUser().name,
      details,
    };
    this.auditLog.update(log => [entry, ...log]);
  }

  exportAsCsv(): void {
    const headers = ['Timestamp', 'Action', 'Operator', 'Details'];
    const rows = this.auditLog().map(e => [
      e.time.toISOString(),
      e.action,
      `"${e.user}"`,
      `"${e.details.replace(/"/g, '""')}"`,
    ]);

    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);

    const anchor      = document.createElement('a');
    anchor.href       = url;
    anchor.download   = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();

    URL.revokeObjectURL(url);
    this.logAction('SYSTEM', 'Audit log exported as CSV');
  }

  // ── Seed data ──────────────────────────────────────────────────────────────

  #seedLog(): AuditEntry[] {
    const base = Date.now();
    return [
      { id: '1', time: new Date(base - 120_000), action: 'LOGIN',  user: 'Dr. Amara Osei',   details: 'Session started from 196.201.xx.xx'      },
      { id: '2', time: new Date(base -  90_000), action: 'UPLOAD', user: 'Dr. Amara Osei',   details: 'Uploaded Q3-Budget-Final.pdf (18.2 MB)'   },
      { id: '3', time: new Date(base -  60_000), action: 'EDIT',   user: 'Kwame Mensah',      details: 'Modified workstream: Procurement Reform'  },
      { id: '4', time: new Date(base -  30_000), action: 'DELETE', user: 'Dr. Amara Osei',   details: 'Removed registry entry #REG-0042'         },
      { id: '5', time: new Date(base -  10_000), action: 'SYSTEM', user: 'System',            details: 'Phase-gate lock applied to WS-07'         },
    ];
  }
}
