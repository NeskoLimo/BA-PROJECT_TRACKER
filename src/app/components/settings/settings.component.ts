import { Component, inject } from '@angular/core';
import { DatePipe, NgClass }  from '@angular/common';
import { GovernanceService, ActionType } from '../../services/governance.service';

@Component({
  selector:   'app-settings',
  standalone: true,
  imports:    [DatePipe, NgClass],
  template: `
    <div class="page">

      <!-- ── Header ───────────────────────────────────────────────────────── -->
      <header class="page-header">
        <span class="eyebrow">System Administration</span>
        <h1>Settings &amp; Audit Governance</h1>
        <p class="subtitle">Manage permissions, policies, and review the full system audit trail.</p>
      </header>

      <!-- ── Top grid ─────────────────────────────────────────────────────── -->
      <div class="grid-2">

        <!-- User Permissions -->
        <section class="card" aria-labelledby="perm-heading">
          <h2 id="perm-heading" class="card-title">
            <span class="card-icon" aria-hidden="true">👤</span>
            User Permissions
          </h2>
          <div class="user-profile">
            <div class="avatar" aria-hidden="true">{{ gov.userInitials() }}</div>
            <div class="profile-info">
              <strong class="u-name">{{ gov.currentUser().name }}</strong>
              <span   class="u-role">{{ gov.currentUser().role }}</span>
            </div>
          </div>
          <ul class="perm-list" aria-label="Permission list">
            <li class="perm-item" [class.granted]="gov.canEdit()">
              <span class="perm-indicator" aria-hidden="true">{{ gov.canEdit() ? '✓' : '✗' }}</span>
              <span class="perm-label">Can Edit Workstreams</span>
              <span class="perm-badge" [class.yes]="gov.canEdit()" [class.no]="!gov.canEdit()">
                {{ gov.canEdit() ? 'Granted' : 'Denied' }}
              </span>
            </li>
            <li class="perm-item" [class.granted]="gov.canDelete()">
              <span class="perm-indicator" aria-hidden="true">{{ gov.canDelete() ? '✓' : '✗' }}</span>
              <span class="perm-label">Can Delete Registry Entries</span>
              <span class="perm-badge" [class.yes]="gov.canDelete()" [class.no]="!gov.canDelete()">
                {{ gov.canDelete() ? 'Granted' : 'Denied' }}
              </span>
            </li>
            <li class="perm-item" [class.granted]="gov.isAdmin()">
              <span class="perm-indicator" aria-hidden="true">{{ gov.isAdmin() ? '✓' : '✗' }}</span>
              <span class="perm-label">Access to Mass Upload Tools</span>
              <span class="perm-badge" [class.yes]="gov.isAdmin()" [class.no]="!gov.isAdmin()">
                {{ gov.isAdmin() ? 'Granted' : 'Denied' }}
              </span>
            </li>
          </ul>
        </section>

        <!-- Policy Enforcement -->
        <section class="card" aria-labelledby="policy-heading">
          <h2 id="policy-heading" class="card-title">
            <span class="card-icon" aria-hidden="true">🛡</span>
            Active Policy Enforcement
          </h2>
          <dl class="policy-list">
            <div class="policy-row">
              <dt class="p-label">Max File Size</dt>
              <dd class="p-value">{{ gov.policy().maxFileSizeMb }} MB</dd>
            </div>
            <div class="policy-row">
              <dt class="p-label">Allowed Formats</dt>
              <dd class="p-value">{{ gov.policy().allowedFormats.join(', ') }}</dd>
            </div>
            <div class="policy-row">
              <dt class="p-label">Phase-Gate Lock</dt>
              <dd class="p-value">
                <span class="status-pill"
                      [class.on]="gov.policy().phaseGateLock"
                      [class.off]="!gov.policy().phaseGateLock">
                  {{ gov.policy().phaseGateLock ? '● Enabled' : '○ Disabled' }}
                </span>
              </dd>
            </div>
          </dl>
          <div class="policy-note">
            Policy changes require an Admin approval cycle before taking effect.
          </div>
        </section>
      </div>

      <!-- ── Audit Trail ───────────────────────────────────────────────────── -->
      <section class="card audit-card" aria-labelledby="audit-heading">
        <div class="audit-header">
          <div>
            <h2 id="audit-heading" class="card-title">
              <span class="card-icon" aria-hidden="true">📋</span>
              Governance Audit Trail
            </h2>
            <p class="audit-count">{{ gov.auditLog.length }} events recorded</p>
          </div>
          <button class="btn-export" (click)="exportLog()" aria-label="Export audit log as CSV">
            <span aria-hidden="true">↓</span> Export CSV
          </button>
        </div>

        <div class="table-wrapper" role="region" aria-label="Audit log table" tabindex="0">
          <table class="audit-table">
            <thead>
              <tr>
                <th scope="col">Timestamp</th>
                <th scope="col">Action</th>
                <th scope="col">Operator</th>
                <th scope="col">Details</th>
              </tr>
            </thead>
            <tbody>
              @for (entry of gov.auditLog; track entry.id) {
                <tr class="audit-row">
                  <td class="cell-time">
                    <time [dateTime]="entry.time.toISOString()">
                      {{ entry.time | date:'HH:mm:ss' }}
                    </time>
                  </td>
                  <td>
                    <span class="action-tag" [ngClass]="actionClass(entry.action)">
                      {{ entry.action }}
                    </span>
                  </td>
                  <td class="cell-user">{{ entry.user }}</td>
                  <td class="cell-detail">{{ entry.details }}</td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="4" class="empty-state">No audit events recorded yet.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>

    </div>
  `,
  styles: [`
    :host {
      --ink-900:   #0A1628; --ink-700: #1E3A5F; --ink-500: #4A6FA5;
      --ink-300:   #8FAFD4; --ink-100: #E8EFF7; --ink-050: #F4F7FB;
      --accent:    #0057FF; --accent-lt: #E6EEFF;
      --green:     #059669; --green-lt: #D1FAE5;
      --red:       #DC2626; --red-lt:   #FEE2E2;
      --amber:     #D97706; --amber-lt: #FEF3C7;
      --sky:       #0284C7; --sky-lt:   #E0F2FE;
      --violet:    #7C3AED; --violet-lt:#EDE9FE;
      --radius: 10px;
      --shadow: 0 1px 3px rgba(10,22,40,.08), 0 4px 16px rgba(10,22,40,.06);
      --font:   'DM Sans', 'Helvetica Neue', sans-serif;
      --mono:   'DM Mono', 'Fira Mono', monospace;
      display: block; font-family: var(--font);
    }
    .page          { padding: 48px 40px; background: var(--ink-050); min-height: 100vh; }
    .page-header   { margin-bottom: 36px; }
    .eyebrow       { display: inline-block; font-size: 10px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: var(--accent); background: var(--accent-lt); padding: 4px 10px; border-radius: 4px; margin-bottom: 12px; }
    h1             { font-size: 28px; font-weight: 800; color: var(--ink-900); margin: 0 0 6px; letter-spacing: -.5px; }
    .subtitle      { font-size: 14px; color: var(--ink-500); margin: 0; }
    .grid-2        { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
    .card          { background: #fff; border: 1px solid var(--ink-100); border-radius: var(--radius); padding: 28px; box-shadow: var(--shadow); }
    .card-title    { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 700; color: var(--ink-700); text-transform: uppercase; letter-spacing: .8px; margin: 0 0 24px; }
    .card-icon     { font-size: 16px; }
    .user-profile  { display: flex; align-items: center; gap: 14px; padding-bottom: 20px; border-bottom: 1px solid var(--ink-100); margin-bottom: 20px; }
    .avatar        { width: 48px; height: 48px; border-radius: 12px; background: var(--ink-900); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 800; letter-spacing: .5px; flex-shrink: 0; }
    .u-name        { display: block; font-weight: 700; color: var(--ink-900); font-size: 15px; }
    .u-role        { display: block; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: var(--accent); margin-top: 2px; }
    .perm-list     { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; }
    .perm-item     { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 8px; background: var(--ink-050); border: 1px solid transparent; }
    .perm-item.granted { background: var(--green-lt); border-color: #A7F3D0; }
    .perm-indicator { font-size: 13px; font-weight: 800; width: 18px; text-align: center; color: var(--ink-300); }
    .perm-item.granted .perm-indicator { color: var(--green); }
    .perm-label    { flex: 1; font-size: 13px; font-weight: 500; color: var(--ink-700); }
    .perm-badge    { font-size: 10px; font-weight: 700; letter-spacing: .8px; text-transform: uppercase; padding: 2px 7px; border-radius: 4px; }
    .perm-badge.yes { background: var(--green-lt); color: var(--green); }
    .perm-badge.no  { background: var(--red-lt);   color: var(--red);   }
    .policy-list   { margin: 0 0 16px; padding: 0; }
    .policy-row    { display: flex; justify-content: space-between; align-items: center; padding: 14px 0; border-bottom: 1px solid var(--ink-100); }
    .policy-row:last-child { border-bottom: none; }
    .p-label       { font-size: 13px; color: var(--ink-500); font-weight: 500; }
    .p-value       { font-size: 13px; color: var(--ink-900); font-weight: 600; }
    .status-pill   { font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 20px; }
    .status-pill.on  { background: var(--green-lt); color: var(--green); }
    .status-pill.off { background: var(--red-lt);   color: var(--red);   }
    .policy-note   { font-size: 11px; color: var(--ink-300); background: var(--ink-050); border-radius: 6px; padding: 10px 12px; line-height: 1.5; }
    .audit-card    { }
    .audit-header  { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
    .audit-count   { font-size: 12px; color: var(--ink-300); margin: 4px 0 0; }
    .btn-export    { display: flex; align-items: center; gap: 6px; background: var(--ink-900); color: #fff; border: none; padding: 10px 18px; border-radius: 8px; font-size: 12px; font-weight: 700; font-family: var(--font); letter-spacing: .5px; cursor: pointer; }
    .btn-export:hover { background: var(--ink-700); }
    .table-wrapper { overflow-x: auto; border-radius: 8px; border: 1px solid var(--ink-100); }
    .audit-table   { width: 100%; border-collapse: collapse; }
    .audit-table th { font-size: 10px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; color: var(--ink-300); background: var(--ink-050); padding: 12px 16px; text-align: left; border-bottom: 1px solid var(--ink-100); }
    .audit-table td { padding: 13px 16px; border-bottom: 1px solid var(--ink-100); vertical-align: middle; }
    .audit-row:last-child td { border-bottom: none; }
    .audit-row:hover td { background: var(--ink-050); }
    .cell-time     { font-family: var(--mono); font-size: 12px; color: var(--ink-500); white-space: nowrap; }
    .cell-user     { font-size: 13px; font-weight: 600; color: var(--ink-700); white-space: nowrap; }
    .cell-detail   { font-size: 13px; color: var(--ink-500); }
    .action-tag    { display: inline-block; font-size: 9px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; padding: 3px 8px; border-radius: 4px; }
    .tag-system  { background: var(--sky-lt);    color: var(--sky);    }
    .tag-upload  { background: var(--green-lt);  color: var(--green);  }
    .tag-delete  { background: var(--red-lt);    color: var(--red);    }
    .tag-edit    { background: var(--amber-lt);  color: var(--amber);  }
    .tag-login   { background: var(--violet-lt); color: var(--violet); }
    .tag-create  { background: var(--green-lt);  color: var(--green);  }
    .tag-update  { background: var(--sky-lt);    color: var(--sky);    }
    .empty-state { text-align: center; padding: 48px; color: var(--ink-300); font-size: 14px; }
    @media (max-width: 768px) { .page { padding: 24px 16px; } .grid-2 { grid-template-columns: 1fr; } }
  `]
})
export class SettingsComponent {
  protected readonly gov = inject(GovernanceService);

  private readonly ACTION_CLASS: Record<string, string> = {
    SYSTEM: 'tag-system', UPLOAD: 'tag-upload', DELETE: 'tag-delete',
    EDIT:   'tag-edit',   LOGIN:  'tag-login',  CREATE: 'tag-create',
    UPDATE: 'tag-update',
  };

  actionClass(action: ActionType): string {
    return this.ACTION_CLASS[action] ?? 'tag-system';
  }

  exportLog(): void {
    this.gov.exportAsCsv();
  }
}
