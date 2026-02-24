// src/app/services/governance.service.ts
import { Injectable, signal, computed } from '@angular/core';

export type ActionType = 'SYSTEM' | 'UPLOAD' | 'DELETE' | 'EDIT' | 'LOGIN' | 'CREATE' | 'UPDATE';

export interface Project {
  id: string;
  name: string;
  owner: string;
  location: string;
  phase: 'Initiation' | 'Planning' | 'Execution' | 'Closure';
  status: 'Active' | 'Critical' | 'Planning' | 'Closure';
  startDate: string;          // ISO date string  YYYY-MM-DD
  projectedEndDate: string;   // ISO date string
  actualEndDate?: string;     // ISO date string — set when project closes
  budget: number;             // KES
  hasAttachment: boolean;
  attachmentUrl?: string;
  scopeTag?: string;          // short label shown in Scope column
  manualProgress?: number;    // 0-100 — if set, overrides time-based calc
}

export interface AuditEntry {
  id: string;
  time: Date;
  action: ActionType;
  user: string;
  details: string;
}

export interface User {
  name: string;
  email: string;
  role: string;
  avatar: string;
}

// ── SEED DATA ─────────────────────────────────────────────────────────────────
const SEED_PROJECTS: Project[] = [
  {
    id: 'PRJ-001',
    name: 'ERP System Migration',
    owner: 'Alice M.',
    location: 'Nairobi, Kenya',
    phase: 'Execution',
    status: 'Active',
    startDate: '2025-01-15',
    projectedEndDate: '2026-06-30',
    budget: 1_200_000,
    hasAttachment: true,
    attachmentUrl: 'https://example.com/erp-scope.pdf',
    scopeTag: 'erp-sc...',
  },
  {
    id: 'PRJ-002',
    name: 'Warehouse Expansion',
    owner: 'James K.',
    location: 'Mombasa, Kenya',
    phase: 'Planning',
    status: 'Critical',
    startDate: '2025-03-01',
    projectedEndDate: '2026-03-31',
    budget: 850_000,
    hasAttachment: true,
    attachmentUrl: 'https://example.com/warehouse-link',
    scopeTag: 'LINK',
  },
  {
    id: 'PRJ-003',
    name: 'Procurement Reform',
    owner: 'Kwame M.',
    location: 'Accra, Ghana',
    phase: 'Initiation',
    status: 'Planning',
    startDate: '2025-06-01',
    projectedEndDate: '2026-12-31',
    budget: 420_000,
    hasAttachment: true,
    attachmentUrl: 'https://example.com/proc-link',
    scopeTag: 'LINK',
  },
  {
    id: 'PRJ-004',
    name: 'Fleet Electrification',
    owner: 'Alice M.',
    location: 'Nairobi, Kenya',
    phase: 'Closure',
    status: 'Closure',
    startDate: '2024-08-01',
    projectedEndDate: '2026-02-28',
    actualEndDate: '2026-02-20',
    budget: 2_100_000,
    hasAttachment: false,
  },
];

// ── USERS ─────────────────────────────────────────────────────────────────────
const USERS: Record<string, User> = {
  HOD: { name: 'Head of Department', email: 'hod@organisation.ke', role: 'HOD',     avatar: 'H' },
  PM:  { name: 'Project Manager',    email: 'pm@organisation.ke',  role: 'PM',      avatar: 'P' },
  BA:  { name: 'Business Analyst',   email: 'ba@organisation.ke',  role: 'ANALYST', avatar: 'A' },
};

@Injectable({ providedIn: 'root' })
export class GovernanceService {

  // ── State ──────────────────────────────────────────────────────────────────
  private _projects = signal<Project[]>(this.loadProjects());
  private _auditLog = signal<AuditEntry[]>(this.loadAudit());
  private _activeUser = signal<User>(USERS['HOD']);

  readonly projectsSig = this._projects.asReadonly();
  readonly auditLogSig = this._auditLog.asReadonly();

  // Convenience getters so templates can use gov.projects / gov.auditLog
  get projects(): Project[]    { return this._projects(); }
  get auditLog(): AuditEntry[] { return this._auditLog(); }

  currentUser = this._activeUser.asReadonly();

  // ── Progress Calculation ──────────────────────────────────────────────────
  /**
   * TIME-BASED PROGRESS
   *
   * Logic:
   *  1. If actualEndDate is set → 100%
   *  2. If manualProgress is set → use that (allows override)
   *  3. Otherwise → elapsed / total span, clamped 0–99
   *
   * "A project with a closer end date should show MORE progress"
   *  because if today is near the end, the project has been running longer
   *  relative to its total span.
   *
   *  progress = (today - startDate) / (endDate - startDate) × 100
   *
   *  We use actualEndDate if available, else projectedEndDate as the
   *  denominator anchor. This means:
   *   - Short-duration project near its end  → high %
   *   - Long-duration project early in run   → low %
   */
  getCalculatedProgress(p: Project): number {
    if (p.actualEndDate) return 100;
    if (p.manualProgress !== undefined && p.manualProgress !== null) {
      return Math.max(0, Math.min(100, p.manualProgress));
    }

    const start  = new Date(p.startDate).getTime();
    const end    = new Date(p.projectedEndDate).getTime();
    const today  = Date.now();

    const totalSpan   = end - start;
    const elapsedSpan = today - start;

    if (totalSpan <= 0) return 0;

    const raw = (elapsedSpan / totalSpan) * 100;
    // Clamp: 0 minimum (not started yet), 99 maximum (only actualEndDate gives 100)
    return Math.max(0, Math.min(99, Math.round(raw)));
  }

  // ── CRUD ──────────────────────────────────────────────────────────────────

  addProject(draft: Omit<Project, 'id'>): Project {
    const id  = 'PRJ-' + String(this._projects().length + 1).padStart(3, '0');
    const project: Project = { id, ...draft };
    this._projects.update(ps => [...ps, project]);
    this.persist();
    this.log('CREATE', `Created project "${project.name}" [${id}]`);
    return project;
  }

  /**
   * Update a project — called AFTER the user confirms the change dialogue.
   * Records a detailed diff in the audit log.
   */
  updateProject(id: string, changes: Partial<Project>): void {
    const before = this._projects().find(p => p.id === id);
    if (!before) return;

    const diffLines: string[] = [];
    for (const key of Object.keys(changes) as (keyof Project)[]) {
      const oldVal = String(before[key] ?? '—');
      const newVal = String((changes as any)[key] ?? '—');
      if (oldVal !== newVal) {
        diffLines.push(`${key}: "${oldVal}" → "${newVal}"`);
      }
    }

    this._projects.update(ps =>
      ps.map(p => p.id === id ? { ...p, ...changes } : p)
    );
    this.persist();

    const detail = diffLines.length
      ? `Updated project "${before.name}" [${id}]: ${diffLines.join('; ')}`
      : `Touched project "${before.name}" [${id}] — no field changes detected`;

    this.log('UPDATE', detail);
  }

  deleteProject(id: string): void {
    const p = this._projects().find(p => p.id === id);
    this._projects.update(ps => ps.filter(p => p.id !== id));
    this.persist();
    this.log('DELETE', `Deleted project "${p?.name ?? id}" [${id}]`);
  }

  uploadProjects(incoming: Project[]): void {
    // Merge: update existing by id, append new
    const existing = new Map(this._projects().map(p => [p.id, p]));
    let created = 0, updated = 0;
    for (const p of incoming) {
      if (existing.has(p.id)) { existing.set(p.id, { ...existing.get(p.id)!, ...p }); updated++; }
      else                    { existing.set(p.id, p); created++; }
    }
    this._projects.set([...existing.values()]);
    this.persist();
    this.log('UPLOAD', `Bulk upload: ${created} created, ${updated} updated (${incoming.length} total records)`);
  }

  // ── Auth ──────────────────────────────────────────────────────────────────
  login(role: string): void {
    const u = USERS[role] ?? USERS['HOD'];
    this._activeUser.set(u);
    this.log('LOGIN', `Session started — role: ${u.role}, user: ${u.name}`);
  }

  logout(): void {
    this.log('LOGIN', `Session ended — user: ${this._activeUser().name}`);
    this._activeUser.set(USERS['HOD']);
  }

  user() { return this._activeUser(); }

  // ── Audit ─────────────────────────────────────────────────────────────────
  log(action: ActionType, details: string): void {
    const entry: AuditEntry = {
      id: crypto.randomUUID(),
      time: new Date(),
      action,
      user: this._activeUser().name + ' (' + this._activeUser().role + ')',
      details,
    };
    this._auditLog.update(log => [entry, ...log]);
    this.persistAudit();
  }

  // ── Persistence (localStorage) ────────────────────────────────────────────
  private loadProjects(): Project[] {
    try {
      const raw = localStorage.getItem('ba_projects');
      return raw ? JSON.parse(raw) : SEED_PROJECTS;
    } catch { return SEED_PROJECTS; }
  }

  private loadAudit(): AuditEntry[] {
    try {
      const raw = localStorage.getItem('ba_audit');
      if (!raw) return [{ id: crypto.randomUUID(), time: new Date(), action: 'SYSTEM', user: 'System', details: 'Application initialised — governance registry loaded' }];
      return JSON.parse(raw).map((e: any) => ({ ...e, time: new Date(e.time) }));
    } catch { return []; }
  }

  private persist(): void {
    try { localStorage.setItem('ba_projects', JSON.stringify(this._projects())); } catch {}
  }

  private persistAudit(): void {
    try {
      // Keep last 500 entries in storage
      const trimmed = this._auditLog().slice(0, 500);
      localStorage.setItem('ba_audit', JSON.stringify(trimmed.map(e => ({ ...e, time: e.time.toISOString() }))));
    } catch {}
  }

  resetToSeed(): void {
    this._projects.set(SEED_PROJECTS);
    this.persist();
    this.log('SYSTEM', 'Data reset to seed state by user');
  }
}
