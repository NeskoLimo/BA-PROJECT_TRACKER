import { Injectable, signal, computed } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

// ─── Models ────────────────────────────────────────────────────────────────────

export type ActionType    = 'SYSTEM' | 'UPLOAD' | 'DELETE' | 'EDIT' | 'LOGIN' | 'CREATE' | 'UPDATE';
export type UserRole      = 'HOD' | 'ADMIN' | 'VIEWER' | 'EDITOR';
export type ProjectPhase  = 'Initiation' | 'Planning' | 'Execution' | 'Closure';
export type ProjectStatus = 'Active' | 'Critical' | 'Planning' | 'Closure';

export interface AuditEntry {
  id?:     string;
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
  maxFileSizeMb:    number;
  allowedFormats:   string[];
  phaseGateLock:    boolean;
}

export interface Project {
  id:               string;
  name:             string;
  owner:            string;
  location:         string;
  startDate:        string;
  projectedEndDate: string;
  actualEndDate?:   string;
  phase:            ProjectPhase;
  status:           ProjectStatus;
  budget:           number;
  hasAttachment:    boolean;
  attachmentUrl?:   string;
}

export interface Region {
  name:         string;
  currency:     string;
  projectCount: number;
  status:       'Active' | 'Inactive';
}

export interface ValidationResult {
  valid:  boolean;
  error?: string;
}

export interface MasterPM {
  id:             string;
  name:           string;
  department:     string;
  activeProjects: number;
  rate:           number;
  lastDelivery:   string;
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

  // ── Private signal state ───────────────────────────────────────────────────

  private readonly _currentUser = signal<CurrentUser>({ name: 'Dr. Amara Osei', role: 'HOD' });
  private readonly _auditLog    = signal<AuditEntry[]>(this.seedLog());
  private readonly _projects    = signal<Project[]>(this.seedProjects());

  readonly policy = signal<PolicyConfig>({
    maxFileSizeMb:  25,
    allowedFormats: ['PDF', 'DOC', 'DOCX'],
    phaseGateLock:  true,
  });

  // ── RxJS observable (dashboard subscribe() pattern) ───────────────────────

  readonly masterPMs$ = new BehaviorSubject<MasterPM[]>([
    { id: 'PM-01', name: 'Alice M.',  department: 'IT & Systems',     activeProjects: 3, rate: 94, lastDelivery: '14 Feb 2026' },
    { id: 'PM-02', name: 'James K.',  department: 'Infrastructure',   activeProjects: 2, rate: 72, lastDelivery: '01 Feb 2026' },
    { id: 'PM-03', name: 'Kwame M.', department: 'Procurement',      activeProjects: 3, rate: 88, lastDelivery: '20 Jan 2026' },
    { id: 'PM-04', name: 'Nadia T.', department: 'Fleet & Logistics', activeProjects: 1, rate: 65, lastDelivery: '10 Dec 2025' },
  ]);

  // ── Derived permissions ────────────────────────────────────────────────────

  readonly canEdit      = computed(() => ROLE_PERMISSIONS[this._currentUser().role].edit);
  readonly canDelete    = computed(() => ROLE_PERMISSIONS[this._currentUser().role].delete);
  readonly isAdmin      = computed(() => ROLE_PERMISSIONS[this._currentUser().role].admin);
  readonly userInitials = computed(() =>
    this._currentUser().name.split(' ').map(w => w[0]).slice(0, 3).join('').toUpperCase()
  );

  // ── Public signal accessor (settings component uses currentUser()) ─────────

  readonly currentUser = this._currentUser.asReadonly();

  // ── Plain-array getters (legacy *ngFor / .filter() / .find() compat) ──────

  get projects(): Project[] {
    return this._projects();
  }

  get auditLog(): AuditEntry[] {
    const arr = [...this._auditLog()];
    (arr as any).unshift = (...items: AuditEntry[]) => {
      const stamped = items.map(e => ({ id: crypto.randomUUID(), ...e }));
      this._auditLog.update(log => [...stamped, ...log]);
      return this._auditLog().length;
    };
    return arr;
  }

  get masterRegions(): Region[] {
    const list = this._projects();
    return [
      { name: 'East Africa',     currency: 'KES', status: 'Active',   projectCount: list.filter(p => /kenya|nairobi|mombasa/i.test(p.location)).length || 4 },
      { name: 'West Africa',     currency: 'GHS', status: 'Active',   projectCount: list.filter(p => /ghana|accra/i.test(p.location)).length || 3 },
      { name: 'Southern Africa', currency: 'ZAR', status: 'Active',   projectCount: list.filter(p => /south africa|cape town/i.test(p.location)).length || 5 },
      { name: 'North Africa',    currency: 'EGP', status: 'Inactive', projectCount: 2 },
    ];
  }

  // ── Project mutations ──────────────────────────────────────────────────────

  updateProject(updated: Project): void {
    this._projects.update(list => list.map(p => p.id === updated.id ? { ...updated } : p));
    this.logAction('EDIT', `Updated project: ${updated.name}`);
  }

  deleteProject(id: string): void {
    const p = this._projects().find(p => p.id === id);
    this._projects.update(list => list.filter(p => p.id !== id));
    if (p) this.logAction('DELETE', `Deleted project: ${p.name} (${id})`);
  }

  // ── Business logic ─────────────────────────────────────────────────────────

  getCalculatedProgress(p: Project): number {
    const start = new Date(p.startDate).getTime();
    const end   = new Date(p.projectedEndDate).getTime();
    const now   = p.actualEndDate ? new Date(p.actualEndDate).getTime() : Date.now();
    const total = end - start;
    if (total <= 0) return 100;
    return Math.min(100, Math.max(0, Math.round(((now - start) / total) * 100)));
  }

  validateAttachment(file: File): ValidationResult {
    const maxBytes = this.policy().maxFileSizeMb * 1024 * 1024;
    const allowed  = this.policy().allowedFormats.map(f => `.${f.toLowerCase()}`);
    const ext      = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    if (!allowed.includes(ext))
      return { valid: false, error: `File type not allowed. Use: ${this.policy().allowedFormats.join(', ')}` };
    if (file.size > maxBytes)
      return { valid: false, error: `File exceeds ${this.policy().maxFileSizeMb} MB limit.` };
    return { valid: true };
  }

  logUpload(projectName: string, fileName: string): void {
    this.logAction('UPLOAD', `Attached "${fileName}" to project: ${projectName}`);
  }

  // ── Audit ──────────────────────────────────────────────────────────────────

  logAction(action: ActionType, details: string): void {
    this._auditLog.update(log => [{
      id: crypto.randomUUID(), time: new Date(),
      action, user: this._currentUser().name, details,
    }, ...log]);
  }

  exportAsCsv(): void {
    const headers = ['Timestamp', 'Action', 'Operator', 'Details'];
    const rows    = this._auditLog().map(e => [
      e.time.toISOString(), e.action,
      `"${e.user}"`, `"${e.details.replace(/"/g, '""')}"`,
    ]);
    const csv    = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob   = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url    = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
    this.logAction('SYSTEM', 'Audit log exported as CSV');
  }

  // ── Seed data ──────────────────────────────────────────────────────────────

  private seedLog(): AuditEntry[] {
    const b = Date.now();
    return [
      { id: '1', time: new Date(b - 120_000), action: 'LOGIN',  user: 'Dr. Amara Osei', details: 'Session started from 196.201.xx.xx'        },
      { id: '2', time: new Date(b -  90_000), action: 'UPLOAD', user: 'Dr. Amara Osei', details: 'Uploaded Q3-Budget-Final.pdf (18.2 MB)'     },
      { id: '3', time: new Date(b -  60_000), action: 'EDIT',   user: 'Kwame Mensah',   details: 'Modified workstream: Procurement Reform'    },
      { id: '4', time: new Date(b -  30_000), action: 'DELETE', user: 'Dr. Amara Osei', details: 'Removed registry entry #REG-0042'           },
      { id: '5', time: new Date(b -  10_000), action: 'SYSTEM', user: 'System',          details: 'Phase-gate lock applied to WS-07'           },
    ];
  }

  private seedProjects(): Project[] {
    return [
      { id: 'PRJ-101', name: 'ERP System Migration',  owner: 'Alice M.',  location: 'Nairobi, Kenya',
        startDate: '2025-01-15', projectedEndDate: '2026-06-30',
        phase: 'Execution', status: 'Active',   budget: 1_200_000, hasAttachment: true,  attachmentUrl: 'erp-scope-v2.pdf' },
      { id: 'PRJ-102', name: 'Warehouse Expansion',   owner: 'James K.',  location: 'Mombasa, Kenya',
        startDate: '2025-03-01', projectedEndDate: '2026-03-31',
        phase: 'Planning',  status: 'Critical', budget: 850_000,   hasAttachment: false },
      { id: 'PRJ-103', name: 'Procurement Reform',    owner: 'Kwame M.', location: 'Accra, Ghana',
        startDate: '2025-06-01', projectedEndDate: '2026-12-31',
        phase: 'Initiation', status: 'Planning', budget: 420_000,  hasAttachment: false },
      { id: 'PRJ-104', name: 'Fleet Electrification', owner: 'Nadia T.', location: 'Cape Town, SA',
        startDate: '2024-09-01', projectedEndDate: '2025-12-31', actualEndDate: '2025-11-15',
        phase: 'Closure', status: 'Closure', budget: 2_100_000, hasAttachment: true, attachmentUrl: 'fleet-scope-final.docx' },
    ];
  }
}
