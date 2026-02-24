// src/app/components/settings/settings.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GovernanceService, AuditEntry, ActionType } from '../../services/governance.service';

// ── Change Request Types ──────────────────────────────────────────────────────
export type ChangeField  = 'name' | 'email' | 'role' | 'department' | 'phone' | 'location';
export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface ChangeRequest {
  id: string;
  requestedBy: string;       // requester display name
  requestedAt: Date;
  field: ChangeField;
  fieldLabel: string;
  oldValue: string;
  newValue: string;
  reason: string;
  status: RequestStatus;
  reviewedBy?: string;
  reviewedAt?: Date;
  reviewNote?: string;
}

// ── Extended User Profile (adds fields beyond the base User) ──────────────────
interface UserProfile {
  name: string;
  email: string;
  role: string;
  avatar: string;
  department: string;
  phone: string;
  location: string;
}

// ── Policy config (HOD-editable) ──────────────────────────────────────────────
interface PolicyConfig {
  maxFileSizeMb: number;
  allowedFormats: string[];
  phaseGateLock: boolean;
  requireApprovalForDelete: boolean;
  auditRetentionDays: number;
  sessionTimeoutMinutes: number;
}

const DEFAULT_POLICY: PolicyConfig = {
  maxFileSizeMb: 25,
  allowedFormats: ['PDF', 'DOC', 'DOCX'],
  phaseGateLock: true,
  requireApprovalForDelete: false,
  auditRetentionDays: 365,
  sessionTimeoutMinutes: 60,
};

const ROLE_PERMISSIONS: Record<string, { label: string; granted: boolean }[]> = {
  HOD: [
    { label: 'Can Edit Workstreams',        granted: true  },
    { label: 'Can Delete Registry Entries', granted: true  },
    { label: 'Access to Mass Upload Tools', granted: true  },
    { label: 'Can Approve Change Requests', granted: true  },
    { label: 'Can Modify Policy Settings',  granted: true  },
    { label: 'Can Export Audit Logs',       granted: true  },
  ],
  PM: [
    { label: 'Can Edit Workstreams',        granted: true  },
    { label: 'Can Delete Registry Entries', granted: false },
    { label: 'Access to Mass Upload Tools', granted: true  },
    { label: 'Can Approve Change Requests', granted: false },
    { label: 'Can Modify Policy Settings',  granted: false },
    { label: 'Can Export Audit Logs',       granted: true  },
  ],
  ANALYST: [
    { label: 'Can Edit Workstreams',        granted: false },
    { label: 'Can Delete Registry Entries', granted: false },
    { label: 'Access to Mass Upload Tools', granted: false },
    { label: 'Can Approve Change Requests', granted: false },
    { label: 'Can Modify Policy Settings',  granted: false },
    { label: 'Can Export Audit Logs',       granted: true  },
  ],
};

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  template: `
<div class="pg">

  <!-- ── HEADER ──────────────────────────────────────────────────────────── -->
  <header class="pg-header">
    <div>
      <p class="eyebrow">SYSTEM ADMINISTRATION</p>
      <h1>Settings &amp; Audit Governance</h1>
      <p class="sub">Manage permissions, policies, and review the full system audit trail.</p>
    </div>
    <div class="hdr-actions">
      <button class="btn-secondary" (click)="exportAuditCsv()">↓ Export Audit Log</button>
      <button class="btn-primary" *ngIf="isHOD()" (click)="tab='policy'">⚙ Policy Settings</button>
    </div>
  </header>

  <!-- ── TABS ────────────────────────────────────────────────────────────── -->
  <nav class="tabs">
    <button class="tab" [class.active]="tab==='profile'"   (click)="tab='profile'">👤 My Profile</button>
    <button class="tab" [class.active]="tab==='requests'"  (click)="tab='requests'">
      📝 Change Requests
      <span class="badge" *ngIf="pendingCount() > 0">{{ pendingCount() }}</span>
    </button>
    <button class="tab" [class.active]="tab==='perms'"     (click)="tab='perms'">🔐 Permissions</button>
    <button class="tab" [class.active]="tab==='policy'"    (click)="tab='policy'" *ngIf="isHOD()">🛡 Policy</button>
    <button class="tab" [class.active]="tab==='audit'"     (click)="tab='audit'">🔍 Audit Trail</button>
  </nav>

  <!-- ══ MY PROFILE TAB ═══════════════════════════════════════════════════ -->
  <div *ngIf="tab==='profile'" class="tab-body">

    <div class="two-col">

      <!-- Left: Profile card -->
      <div class="panel">
        <div class="panel-hd">
          <span class="panel-title">Current Profile</span>
          <span class="panel-sub">{{ gov.currentUser().role }}</span>
        </div>
        <div class="profile-card">
          <div class="avatar-xl">{{ profile.avatar }}</div>
          <div class="profile-info">
            <div class="profile-name">{{ profile.name }}</div>
            <div class="profile-role-chip">{{ profile.role }}</div>
            <div class="profile-fields">
              <div class="pf-row"><span class="pf-lbl">Email</span><span class="pf-val">{{ profile.email }}</span></div>
              <div class="pf-row"><span class="pf-lbl">Department</span><span class="pf-val">{{ profile.department || '—' }}</span></div>
              <div class="pf-row"><span class="pf-lbl">Phone</span><span class="pf-val">{{ profile.phone || '—' }}</span></div>
              <div class="pf-row"><span class="pf-lbl">Location</span><span class="pf-val">{{ profile.location || '—' }}</span></div>
            </div>
          </div>
        </div>

        <!-- Pending requests banner -->
        <div class="pending-banner" *ngIf="myPendingRequests().length > 0">
          <span class="pb-icon">⏳</span>
          <div>
            <div class="pb-title">{{ myPendingRequests().length }} change request{{ myPendingRequests().length > 1 ? 's' : '' }} awaiting approval</div>
            <div class="pb-sub">Fields under review: {{ myPendingRequests().map(r => r.fieldLabel).join(', ') }}</div>
          </div>
          <button class="pb-view" (click)="tab='requests'">View →</button>
        </div>
      </div>

      <!-- Right: Request change form -->
      <div class="panel">
        <div class="panel-hd">
          <span class="panel-title">Request a Profile Change</span>
          <span class="panel-sub">Submitted changes require HOD approval</span>
        </div>

        <div class="change-form">

          <!-- Field selector -->
          <div class="form-group">
            <label>Field to Change <span class="req">*</span></label>
            <div class="field-selector">
              <button class="field-btn"
                      *ngFor="let f of changeableFields"
                      [class.field-btn-on]="reqDraft.field === f.key"
                      [disabled]="hasPendingFor(f.key)"
                      (click)="selectField(f.key)"
                      [title]="hasPendingFor(f.key) ? 'A request for this field is pending' : ''">
                <span class="fb-icon">{{ f.icon }}</span>
                <span class="fb-label">{{ f.label }}</span>
                <span class="fb-pending" *ngIf="hasPendingFor(f.key)">⏳</span>
              </button>
            </div>
          </div>

          <div *ngIf="reqDraft.field" class="form-fields">
            <div class="form-row">
              <div class="form-group">
                <label>Current Value</label>
                <input [value]="currentFieldValue(reqDraft.field)" disabled class="input-disabled">
              </div>
              <div class="form-group">
                <label>New Value <span class="req">*</span></label>
                <input [(ngModel)]="reqDraft.newValue"
                       [placeholder]="fieldPlaceholder(reqDraft.field)"
                       [class.input-err]="reqSubmitted && !reqDraft.newValue.trim()">
                <span class="err-msg" *ngIf="reqSubmitted && !reqDraft.newValue.trim()">Required</span>
              </div>
            </div>
            <div class="form-group">
              <label>Reason for Change <span class="req">*</span></label>
              <textarea [(ngModel)]="reqDraft.reason" rows="3"
                        placeholder="Briefly explain why this change is needed..."
                        [class.input-err]="reqSubmitted && !reqDraft.reason.trim()"></textarea>
              <span class="err-msg" *ngIf="reqSubmitted && !reqDraft.reason.trim()">A reason is required</span>
            </div>

            <div class="change-preview" *ngIf="reqDraft.newValue.trim()">
              <span class="cp-label">Preview</span>
              <span class="cp-old">{{ currentFieldValue(reqDraft.field) }}</span>
              <span class="cp-arrow">→</span>
              <span class="cp-new">{{ reqDraft.newValue }}</span>
            </div>

            <div class="info-note">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#0057FF" stroke-width="2"/>
                <path d="M12 8v4M12 16h.01" stroke="#0057FF" stroke-width="2" stroke-linecap="round"/>
              </svg>
              This request will be sent to your HOD for review. Your profile will update automatically once approved.
            </div>

            <div class="form-footer">
              <button class="btn-ghost" (click)="resetReqForm()">Clear</button>
              <button class="btn-submit" (click)="submitChangeRequest()">Submit Request →</button>
            </div>
          </div>

          <div class="no-field-hint" *ngIf="!reqDraft.field">
            <div class="nfh-icon">☝️</div>
            <div>Select a field above to begin your change request.</div>
          </div>

        </div>
      </div>
    </div>

  </div>

  <!-- ══ CHANGE REQUESTS TAB ══════════════════════════════════════════════ -->
  <div *ngIf="tab==='requests'" class="tab-body">

    <!-- HOD review queue -->
    <div *ngIf="isHOD() && pendingCount() > 0">
      <div class="section-label">
        <span class="sl-dot sl-amber"></span>
        PENDING APPROVAL ({{ pendingCount() }}) — Action Required
      </div>
      <div class="request-list">
        <div class="req-card req-pending" *ngFor="let r of pendingRequests()">
          <div class="rc-left">
            <div class="rc-meta">
              <span class="rc-id">{{ r.id }}</span>
              <span class="rc-date">{{ r.requestedAt | date:'d MMM y, HH:mm' }}</span>
            </div>
            <div class="rc-requester">{{ r.requestedBy }}</div>
            <div class="rc-change">
              Requesting to change <strong>{{ r.fieldLabel }}</strong>:
              <span class="rc-old">{{ r.oldValue }}</span>
              <span class="rc-arrow">→</span>
              <span class="rc-new">{{ r.newValue }}</span>
            </div>
            <div class="rc-reason">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="#64748b" stroke-width="2" stroke-linecap="round"/>
              </svg>
              {{ r.reason }}
            </div>
          </div>
          <div class="rc-actions">
            <div class="review-note-wrap">
              <textarea class="review-note" [(ngModel)]="reviewNotes[r.id]"
                        placeholder="Optional review note..." rows="2"></textarea>
            </div>
            <div class="rc-btns">
              <button class="btn-approve" (click)="approveRequest(r)">✓ Approve</button>
              <button class="btn-reject"  (click)="rejectRequest(r)">✕ Reject</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- All requests history -->
    <div>
      <div class="section-label">
        <span class="sl-dot sl-blue"></span>
        {{ isHOD() ? 'ALL REQUESTS' : 'MY REQUESTS' }} ({{ visibleRequests().length }})
      </div>

      <!-- Filters -->
      <div class="req-filters">
        <button class="chip" *ngFor="let s of ['ALL','PENDING','APPROVED','REJECTED','CANCELLED']"
                [class.chip-on]="reqFilter===s"
                (click)="reqFilter=s">
          {{ s }}
          <span class="chip-count">{{ countByStatus(s) }}</span>
        </button>
      </div>

      <div class="request-list" *ngIf="visibleRequests().length > 0">
        <div class="req-card"
             *ngFor="let r of visibleRequests()"
             [ngClass]="'req-' + r.status.toLowerCase()">
          <div class="rc-left">
            <div class="rc-meta">
              <span class="rc-id">{{ r.id }}</span>
              <span class="status-badge" [ngClass]="'sb-' + r.status.toLowerCase()">{{ r.status }}</span>
              <span class="rc-date">{{ r.requestedAt | date:'d MMM y, HH:mm' }}</span>
            </div>
            <div class="rc-requester" *ngIf="isHOD()">By: {{ r.requestedBy }}</div>
            <div class="rc-change">
              <strong>{{ r.fieldLabel }}</strong>:
              <span class="rc-old">{{ r.oldValue }}</span>
              <span class="rc-arrow">→</span>
              <span class="rc-new">{{ r.newValue }}</span>
            </div>
            <div class="rc-reason">{{ r.reason }}</div>
            <div class="rc-review" *ngIf="r.reviewedBy">
              <span class="rc-reviewer">{{ r.status === 'APPROVED' ? '✓' : '✕' }} {{ r.reviewedBy }}</span>
              <span class="rc-review-date">{{ r.reviewedAt | date:'d MMM y, HH:mm' }}</span>
              <span class="rc-review-note" *ngIf="r.reviewNote">— "{{ r.reviewNote }}"</span>
            </div>
          </div>
          <div class="rc-cancel" *ngIf="r.status === 'PENDING' && !isHOD()">
            <button class="btn-cancel-req" (click)="cancelRequest(r)">Cancel Request</button>
          </div>
        </div>
      </div>

      <div class="empty-state" *ngIf="visibleRequests().length === 0">
        <div class="es-icon">📭</div>
        <div class="es-title">No {{ reqFilter !== 'ALL' ? reqFilter.toLowerCase() : '' }} requests</div>
        <div class="es-sub" *ngIf="!isHOD()">
          <button class="btn-link" (click)="tab='profile'">Submit your first change request →</button>
        </div>
      </div>
    </div>

  </div>

  <!-- ══ PERMISSIONS TAB ════════════════════════════════════════════════════ -->
  <div *ngIf="tab==='perms'" class="tab-body">
    <div class="two-col">

      <!-- My permissions -->
      <div class="panel">
        <div class="panel-hd">
          <span class="panel-title">USER PERMISSIONS</span>
        </div>
        <div class="user-perm-header">
          <div class="avatar-md">{{ profile.avatar }}</div>
          <div>
            <div class="up-name">{{ profile.name }}</div>
            <div class="up-role">{{ profile.role }}</div>
          </div>
        </div>
        <div class="perm-list">
          <div class="perm-row" *ngFor="let p of currentPermissions()"
               [class.perm-granted]="p.granted"
               [class.perm-denied]="!p.granted">
            <span class="perm-icon">{{ p.granted ? '✓' : '✕' }}</span>
            <span class="perm-label">{{ p.label }}</span>
            <span class="perm-badge" [class.pb-granted]="p.granted" [class.pb-denied]="!p.granted">
              {{ p.granted ? 'GRANTED' : 'DENIED' }}
            </span>
          </div>
        </div>
      </div>

      <!-- All roles reference -->
      <div class="panel">
        <div class="panel-hd">
          <span class="panel-title">ROLE COMPARISON</span>
          <span class="panel-sub">System-defined access levels</span>
        </div>
        <div class="role-compare">
          <div class="rc-head-row">
            <span>Permission</span>
            <span *ngFor="let role of ['HOD','PM','ANALYST']">{{ role }}</span>
          </div>
          <div class="rc-data-row" *ngFor="let perm of allPermissionLabels()">
            <span class="rc-perm-name">{{ perm }}</span>
            <span *ngFor="let role of ['HOD','PM','ANALYST']">
              <span class="rc-dot" [class.rc-green]="roleHasPerm(role, perm)" [class.rc-red]="!roleHasPerm(role, perm)">
                {{ roleHasPerm(role, perm) ? '✓' : '—' }}
              </span>
            </span>
          </div>
        </div>

        <!-- Switch user (demo) -->
        <div class="role-switch-panel" *ngIf="isHOD()">
          <div class="panel-hd" style="border-top:1px solid var(--border);margin-top:16px;padding-top:14px;border-bottom:none;">
            <span class="panel-title">DEMO: Switch Session Role</span>
          </div>
          <div class="role-switch-btns">
            <button class="rs-btn" *ngFor="let r of ['HOD','PM','ANALYST']"
                    [class.rs-active]="gov.currentUser().role === r"
                    (click)="switchRole(r)">
              {{ r }}
            </button>
          </div>
          <p class="rs-hint">Switching roles demonstrates permission gates. Audit logs and data persist.</p>
        </div>
      </div>

    </div>
  </div>

  <!-- ══ POLICY TAB (HOD only) ═════════════════════════════════════════════ -->
  <div *ngIf="tab==='policy' && isHOD()" class="tab-body">

    <div class="policy-notice">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#92400e" stroke-width="2" stroke-linejoin="round"/>
      </svg>
      Policy changes require an Admin approval cycle before taking effect. All modifications are audit-logged.
    </div>

    <div class="two-col">

      <div class="panel">
        <div class="panel-hd">
          <span class="panel-title">ACTIVE POLICY ENFORCEMENT</span>
        </div>
        <div class="policy-list">

          <div class="policy-row">
            <div class="pr-left">
              <div class="pr-label">Max File Size</div>
              <div class="pr-sub">Maximum upload size per document</div>
            </div>
            <div class="pr-control">
              <input type="number" class="policy-input" [(ngModel)]="policyDraft.maxFileSizeMb" min="1" max="100">
              <span class="pr-unit">MB</span>
            </div>
            <div class="pr-current">Currently: <strong>{{ policy.maxFileSizeMb }} MB</strong></div>
          </div>

          <div class="policy-row">
            <div class="pr-left">
              <div class="pr-label">Allowed File Formats</div>
              <div class="pr-sub">Permitted upload types</div>
            </div>
            <div class="pr-control">
              <input class="policy-input" [(ngModel)]="formatsStr" placeholder="PDF, DOC, DOCX">
            </div>
            <div class="pr-current">Currently: <strong>{{ policy.allowedFormats.join(', ') }}</strong></div>
          </div>

          <div class="policy-row">
            <div class="pr-left">
              <div class="pr-label">Phase-Gate Lock</div>
              <div class="pr-sub">Prevent phase changes without gate approval</div>
            </div>
            <div class="pr-control">
              <button class="toggle-btn" [class.toggle-on]="policyDraft.phaseGateLock"
                      (click)="policyDraft.phaseGateLock = !policyDraft.phaseGateLock">
                <span class="toggle-thumb"></span>
              </button>
            </div>
            <div class="pr-current">
              <span class="enabled-chip" [class.chip-on]="policy.phaseGateLock">
                ● {{ policy.phaseGateLock ? 'Enabled' : 'Disabled' }}
              </span>
            </div>
          </div>

          <div class="policy-row">
            <div class="pr-left">
              <div class="pr-label">Require Approval for Delete</div>
              <div class="pr-sub">Force HOD sign-off before deletions</div>
            </div>
            <div class="pr-control">
              <button class="toggle-btn" [class.toggle-on]="policyDraft.requireApprovalForDelete"
                      (click)="policyDraft.requireApprovalForDelete = !policyDraft.requireApprovalForDelete">
                <span class="toggle-thumb"></span>
              </button>
            </div>
            <div class="pr-current">
              <span class="enabled-chip" [class.chip-on]="policy.requireApprovalForDelete">
                ● {{ policy.requireApprovalForDelete ? 'Enabled' : 'Disabled' }}
              </span>
            </div>
          </div>

          <div class="policy-row">
            <div class="pr-left">
              <div class="pr-label">Audit Log Retention</div>
              <div class="pr-sub">Days to retain audit entries</div>
            </div>
            <div class="pr-control">
              <input type="number" class="policy-input" [(ngModel)]="policyDraft.auditRetentionDays" min="30" max="3650">
              <span class="pr-unit">days</span>
            </div>
            <div class="pr-current">Currently: <strong>{{ policy.auditRetentionDays }} days</strong></div>
          </div>

          <div class="policy-row">
            <div class="pr-left">
              <div class="pr-label">Session Timeout</div>
              <div class="pr-sub">Auto-logout after inactivity</div>
            </div>
            <div class="pr-control">
              <input type="number" class="policy-input" [(ngModel)]="policyDraft.sessionTimeoutMinutes" min="5" max="480">
              <span class="pr-unit">min</span>
            </div>
            <div class="pr-current">Currently: <strong>{{ policy.sessionTimeoutMinutes }} min</strong></div>
          </div>

        </div>

        <div class="policy-footer">
          <button class="btn-ghost" (click)="resetPolicy()">Reset to Defaults</button>
          <button class="btn-primary" (click)="savePolicy()">Save Policy Changes</button>
        </div>
      </div>

      <!-- Policy history -->
      <div class="panel">
        <div class="panel-hd">
          <span class="panel-title">POLICY CHANGE HISTORY</span>
        </div>
        <div class="audit-mini">
          <div class="am-row" *ngFor="let e of policyAuditEntries()">
            <div class="am-dot"></div>
            <div class="am-body">
              <div class="am-detail">{{ e.details }}</div>
              <div class="am-meta">{{ e.user }} · {{ e.time | date:'d MMM y, HH:mm' }}</div>
            </div>
          </div>
          <div class="am-empty" *ngIf="policyAuditEntries().length === 0">No policy changes recorded yet.</div>
        </div>
      </div>

    </div>
  </div>

  <!-- ══ AUDIT TRAIL TAB ════════════════════════════════════════════════════ -->
  <div *ngIf="tab==='audit'" class="tab-body">

    <div class="audit-toolbar">
      <div class="fb-group">
        <label>Action</label>
        <select [(ngModel)]="auditActionFilter">
          <option value="">All Actions</option>
          <option *ngFor="let a of auditActions">{{ a }}</option>
        </select>
      </div>
      <div class="fb-group">
        <label>User</label>
        <select [(ngModel)]="auditUserFilter">
          <option value="">All Users</option>
          <option *ngFor="let u of auditUsers()">{{ u }}</option>
        </select>
      </div>
      <div class="fb-group">
        <label>Search</label>
        <input [(ngModel)]="auditSearch" placeholder="Search details..." class="audit-search">
      </div>
      <span class="result-count">{{ filteredAudit().length }} event{{ filteredAudit().length !== 1 ? 's' : '' }}</span>
      <button class="btn-secondary" (click)="exportAuditCsv()">↓ CSV</button>
    </div>

    <div class="panel tbl-panel">
      <table class="tbl">
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Action</th>
            <th>User</th>
            <th>Details</th>
            <th>Event ID</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let e of filteredAudit()">
            <td class="td-mono">{{ e.time | date:'d MMM y, HH:mm:ss' }}</td>
            <td><span class="action-tag" [ngClass]="'at-' + e.action.toLowerCase()">{{ e.action }}</span></td>
            <td class="td-name">{{ e.user }}</td>
            <td class="td-detail">{{ e.details }}</td>
            <td class="td-mono td-muted">{{ e.id?.slice(0,8) ?? '—' }}</td>
          </tr>
        </tbody>
      </table>
      <div class="empty-state-sm" *ngIf="filteredAudit().length === 0">No audit entries match this filter.</div>
    </div>

  </div>

</div>

<!-- ══ TOAST ══════════════════════════════════════════════════════════════ -->
<div class="toast" [class.toast-show]="toastMsg" [class.toast-err]="toastErr">
  {{ toastMsg }}
</div>
  `,
  styles: [`
    :host {
      --navy:   #001E3C;
      --blue:   #0057FF;
      --blue-lt:#dbeafe;
      --ink:    #0f172a;
      --ink2:   #1e293b;
      --muted:  #64748b;
      --border: #e2e8f0;
      --bg:     #f0f4f8;
      --surface:#ffffff;
      --green:  #10b981;
      --red:    #ef4444;
      --amber:  #f59e0b;
      --r:      10px;
      --sh:     0 1px 3px rgba(0,0,0,.05), 0 4px 20px rgba(0,0,0,.07);
      --font:   'Inter','Segoe UI',sans-serif;
      display: block;
      font-family: var(--font);
      background: var(--bg);
      min-height: 100vh;
    }

    /* ── Page layout ───────────────────────────────────────────── */
    .pg { padding: 28px 32px; display: flex; flex-direction: column; gap: 20px; max-width: 1400px; }

    .pg-header { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 14px; padding-bottom: 18px; border-bottom: 1px solid var(--border); }
    .eyebrow { font-size: 10px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: var(--blue); margin: 0 0 4px; }
    h1 { font-size: 26px; font-weight: 800; color: var(--navy); margin: 0 0 4px; letter-spacing: -.4px; }
    .sub { font-size: 12px; color: var(--muted); margin: 0; }
    .hdr-actions { display: flex; gap: 10px; }

    /* Tabs */
    .tabs { display: flex; gap: 4px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--r); padding: 5px; width: fit-content; }
    .tab { position: relative; padding: 8px 16px; border: none; background: none; border-radius: 7px; font-size: 12px; font-weight: 700; color: var(--muted); cursor: pointer; font-family: var(--font); transition: all .15s; white-space: nowrap; }
    .tab.active { background: var(--navy); color: #fff; }
    .tab:hover:not(.active) { background: var(--bg); color: var(--ink2); }
    .badge { position: absolute; top: 4px; right: 6px; background: var(--red); color: #fff; border-radius: 10px; padding: 1px 6px; font-size: 9px; font-weight: 800; line-height: 1.4; }

    .tab-body { display: flex; flex-direction: column; gap: 16px; }

    /* Panels */
    .panel     { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r); overflow: hidden; box-shadow: var(--sh); }
    .tbl-panel { padding: 0; }
    .panel-hd  { display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; border-bottom: 1px solid var(--border); }
    .panel-title { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: .8px; color: var(--ink2); }
    .panel-sub   { font-size: 11px; color: var(--muted); }
    .two-col  { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

    /* Buttons */
    .btn-primary  { padding: 9px 18px; background: var(--navy); color: #fff; border: none; border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer; font-family: var(--font); transition: background .15s; }
    .btn-primary:hover { background: #0a2a50; }
    .btn-secondary { padding: 9px 16px; background: var(--surface); border: 1px solid var(--border); border-radius: 8px; font-size: 12px; font-weight: 700; color: var(--ink2); cursor: pointer; font-family: var(--font); transition: all .15s; }
    .btn-secondary:hover { background: var(--bg); border-color: #94a3b8; }
    .btn-ghost { padding: 8px 16px; background: none; border: 1px solid var(--border); border-radius: 8px; font-size: 12px; font-weight: 700; color: var(--muted); cursor: pointer; font-family: var(--font); transition: all .15s; }
    .btn-ghost:hover { background: var(--bg); color: var(--ink2); }
    .btn-submit { padding: 10px 20px; background: var(--blue); color: #fff; border: none; border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer; font-family: var(--font); transition: background .15s; }
    .btn-submit:hover { background: #003fcc; }
    .btn-approve { padding: 8px 16px; background: var(--green); color: #fff; border: none; border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer; font-family: var(--font); transition: all .15s; }
    .btn-approve:hover { background: #059669; transform: translateY(-1px); }
    .btn-reject  { padding: 8px 16px; background: none; border: 1px solid var(--red); color: var(--red); border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer; font-family: var(--font); transition: all .15s; }
    .btn-reject:hover  { background: #fef2f2; transform: translateY(-1px); }
    .btn-cancel-req { padding: 6px 12px; background: none; border: 1px solid var(--border); border-radius: 7px; font-size: 11px; font-weight: 700; color: var(--muted); cursor: pointer; font-family: var(--font); transition: all .15s; }
    .btn-cancel-req:hover { border-color: var(--red); color: var(--red); }
    .btn-link { background: none; border: none; color: var(--blue); font-weight: 700; cursor: pointer; font-family: var(--font); font-size: 13px; padding: 0; text-decoration: underline; }

    /* ── Profile tab ───────────────────────────────────────────── */
    .profile-card { display: flex; gap: 20px; align-items: flex-start; padding: 20px; }
    .avatar-xl { width: 72px; height: 72px; border-radius: 14px; background: linear-gradient(135deg, var(--navy), #2d3f55); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 800; flex-shrink: 0; }
    .avatar-md { width: 44px; height: 44px; border-radius: 10px; background: linear-gradient(135deg, var(--navy), #2d3f55); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 800; flex-shrink: 0; }
    .profile-info { flex: 1; }
    .profile-name { font-size: 18px; font-weight: 800; color: var(--ink); margin-bottom: 6px; }
    .profile-role-chip { display: inline-flex; padding: 3px 10px; background: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46; border-radius: 20px; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: .5px; margin-bottom: 14px; }
    .profile-fields { display: flex; flex-direction: column; gap: 8px; }
    .pf-row { display: flex; gap: 12px; align-items: baseline; }
    .pf-lbl { font-size: 10px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: .4px; width: 80px; flex-shrink: 0; }
    .pf-val { font-size: 13px; color: var(--ink2); }

    .pending-banner { display: flex; align-items: center; gap: 12px; margin: 0 20px 20px; padding: 12px 16px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; }
    .pb-icon { font-size: 18px; flex-shrink: 0; }
    .pb-title { font-size: 13px; font-weight: 700; color: #92400e; }
    .pb-sub   { font-size: 11px; color: #b45309; margin-top: 1px; }
    .pb-view  { margin-left: auto; padding: 6px 12px; background: #f59e0b; color: #fff; border: none; border-radius: 7px; font-size: 11px; font-weight: 700; cursor: pointer; font-family: var(--font); flex-shrink: 0; }
    .pb-view:hover { background: #d97706; }

    /* Change request form */
    .change-form { padding: 16px 20px; display: flex; flex-direction: column; gap: 16px; }
    .form-group { display: flex; flex-direction: column; gap: 5px; }
    .form-group label { font-size: 10px; font-weight: 800; color: var(--muted); text-transform: uppercase; letter-spacing: .5px; }
    .form-group input, .form-group select, .form-group textarea {
      padding: 9px 12px; border: 1px solid var(--border); border-radius: 8px;
      font-size: 13px; color: var(--ink); font-family: var(--font); outline: none;
      background: var(--bg); transition: border-color .15s, box-shadow .15s; resize: vertical;
    }
    .form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color: var(--blue); box-shadow: 0 0 0 3px rgba(0,87,255,.1); background: var(--surface); }
    .input-disabled { background: #f1f5f9 !important; color: var(--muted) !important; cursor: not-allowed; }
    .input-err { border-color: var(--red) !important; }
    .err-msg { font-size: 10px; color: var(--red); font-weight: 600; }
    .req { color: var(--red); }
    .form-row { display: flex; gap: 12px; }
    .form-footer { display: flex; justify-content: flex-end; gap: 10px; }

    /* Field selector */
    .field-selector { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
    .field-btn { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 10px 8px; border: 1px solid var(--border); border-radius: 9px; background: var(--bg); cursor: pointer; font-family: var(--font); transition: all .15s; }
    .field-btn:hover:not([disabled]) { border-color: var(--blue); background: var(--blue-lt); }
    .field-btn.field-btn-on { border-color: var(--blue); background: var(--blue-lt); }
    .field-btn[disabled] { opacity: .45; cursor: not-allowed; }
    .fb-icon  { font-size: 18px; }
    .fb-label { font-size: 10px; font-weight: 700; color: var(--ink2); }
    .fb-pending { font-size: 10px; }

    /* Preview */
    .change-preview { display: flex; align-items: center; gap: 10px; background: var(--bg); border-radius: 8px; padding: 10px 14px; border: 1px solid var(--border); flex-wrap: wrap; }
    .cp-label { font-size: 10px; font-weight: 800; color: var(--muted); text-transform: uppercase; letter-spacing: .4px; }
    .cp-old   { color: var(--muted); text-decoration: line-through; font-size: 13px; }
    .cp-arrow { color: var(--muted); font-size: 14px; }
    .cp-new   { color: var(--green); font-weight: 700; font-size: 13px; }

    .info-note { display: flex; align-items: flex-start; gap: 8px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 10px 12px; font-size: 12px; color: var(--ink2); line-height: 1.5; }

    .no-field-hint { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 32px 20px; color: var(--muted); font-size: 13px; text-align: center; }
    .nfh-icon { font-size: 28px; }

    /* ── Change requests ───────────────────────────────────────── */
    .section-label { display: flex; align-items: center; gap: 8px; font-size: 10px; font-weight: 800; color: var(--muted); letter-spacing: 1px; text-transform: uppercase; margin-bottom: 10px; }
    .sl-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .sl-amber { background: var(--amber); }
    .sl-blue  { background: var(--blue); }

    .req-filters { display: flex; gap: 6px; margin-bottom: 12px; flex-wrap: wrap; }
    .chip { display: flex; align-items: center; gap: 5px; padding: 5px 11px; border: 1px solid var(--border); border-radius: 20px; background: none; font-size: 11px; font-weight: 700; color: var(--muted); cursor: pointer; font-family: var(--font); transition: all .15s; }
    .chip:hover { border-color: #94a3b8; color: var(--ink2); }
    .chip.chip-on { background: var(--navy); color: #fff; border-color: var(--navy); }
    .chip-count { background: rgba(0,0,0,.08); border-radius: 10px; padding: 1px 6px; font-size: 9px; }
    .chip.chip-on .chip-count { background: rgba(255,255,255,.2); }

    .request-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px; }

    .req-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r); padding: 16px 18px; display: flex; justify-content: space-between; gap: 16px; align-items: flex-start; box-shadow: var(--sh); transition: border-color .15s; }
    .req-pending  { border-left: 3px solid var(--amber); }
    .req-approved { border-left: 3px solid var(--green); }
    .req-rejected { border-left: 3px solid var(--red); opacity: .8; }
    .req-cancelled { border-left: 3px solid var(--border); opacity: .65; }

    .rc-left { flex: 1; display: flex; flex-direction: column; gap: 6px; }
    .rc-meta { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
    .rc-id   { font-family: 'Courier New', monospace; font-size: 10px; color: var(--blue); }
    .rc-date { font-size: 11px; color: var(--muted); }
    .rc-requester { font-size: 13px; font-weight: 700; color: var(--ink); }
    .rc-change { font-size: 13px; color: var(--ink2); }
    .rc-old   { color: var(--muted); text-decoration: line-through; margin: 0 4px; }
    .rc-arrow { color: var(--muted); margin: 0 4px; }
    .rc-new   { color: var(--green); font-weight: 700; margin-left: 4px; }
    .rc-reason { font-size: 12px; color: var(--muted); display: flex; align-items: flex-start; gap: 5px; margin-top: 2px; }
    .rc-review { display: flex; align-items: center; gap: 8px; font-size: 11px; color: var(--muted); margin-top: 4px; flex-wrap: wrap; }
    .rc-reviewer { font-weight: 700; }
    .rc-review-note { font-style: italic; }
    .rc-cancel { flex-shrink: 0; }

    .rc-actions { display: flex; flex-direction: column; gap: 8px; min-width: 200px; }
    .review-note-wrap { }
    .review-note { width: 100%; padding: 7px 10px; border: 1px solid var(--border); border-radius: 7px; font-size: 12px; color: var(--ink); font-family: var(--font); outline: none; background: var(--bg); resize: vertical; }
    .review-note:focus { border-color: var(--blue); }
    .rc-btns { display: flex; gap: 8px; }

    /* Status badges */
    .status-badge { padding: 2px 8px; border-radius: 20px; font-size: 9px; font-weight: 800; letter-spacing: .4px; }
    .sb-pending  { background: #fef3c7; color: #92400e; }
    .sb-approved { background: #ecfdf5; color: #065f46; }
    .sb-rejected { background: #fef2f2; color: #991b1b; }
    .sb-cancelled { background: #f1f5f9; color: #64748b; }

    /* Empty state */
    .empty-state { text-align: center; padding: 50px 20px; }
    .es-icon { font-size: 32px; margin-bottom: 8px; }
    .es-title { font-size: 15px; font-weight: 700; color: var(--ink2); margin-bottom: 4px; }
    .es-sub { font-size: 13px; color: var(--muted); }
    .empty-state-sm { padding: 28px; text-align: center; color: var(--muted); font-size: 13px; }

    /* ── Permissions tab ───────────────────────────────────────── */
    .user-perm-header { display: flex; align-items: center; gap: 14px; padding: 16px 20px; border-bottom: 1px solid var(--border); }
    .up-name { font-size: 14px; font-weight: 800; color: var(--ink); }
    .up-role { font-size: 11px; color: var(--muted); font-weight: 600; }
    .perm-list { padding: 10px 0; }
    .perm-row { display: flex; align-items: center; gap: 12px; padding: 11px 20px; border-bottom: 1px solid var(--border); transition: background .12s; }
    .perm-row:last-child { border-bottom: none; }
    .perm-row:hover { background: var(--bg); }
    .perm-granted { }
    .perm-denied  { opacity: .55; }
    .perm-icon { font-size: 13px; width: 18px; text-align: center; flex-shrink: 0; }
    .perm-label  { flex: 1; font-size: 13px; color: var(--ink2); font-weight: 500; }
    .perm-badge  { font-size: 9px; font-weight: 800; padding: 2px 8px; border-radius: 4px; letter-spacing: .4px; }
    .pb-granted  { background: #ecfdf5; color: #065f46; }
    .pb-denied   { background: #f1f5f9; color: #94a3b8; }

    .role-compare { overflow-x: auto; padding: 12px 20px; }
    .rc-head-row, .rc-data-row { display: grid; grid-template-columns: 1fr 60px 60px 80px; gap: 0; padding: 8px 0; font-size: 11px; border-bottom: 1px solid var(--border); align-items: center; }
    .rc-head-row { font-weight: 800; color: var(--muted); text-transform: uppercase; letter-spacing: .4px; font-size: 9px; }
    .rc-perm-name { font-size: 12px; color: var(--ink2); }
    .rc-dot { display: block; text-align: center; font-size: 12px; font-weight: 800; }
    .rc-green { color: var(--green); }
    .rc-red   { color: var(--border); }

    .role-switch-panel { padding: 0 20px 16px; }
    .role-switch-btns { display: flex; gap: 8px; margin-bottom: 8px; }
    .rs-btn { padding: 8px 20px; border: 1px solid var(--border); border-radius: 20px; background: var(--bg); font-size: 12px; font-weight: 700; color: var(--muted); cursor: pointer; font-family: var(--font); transition: all .15s; }
    .rs-btn:hover:not(.rs-active) { border-color: #94a3b8; color: var(--ink2); }
    .rs-btn.rs-active { background: var(--navy); color: #fff; border-color: var(--navy); }
    .rs-hint { font-size: 11px; color: var(--muted); margin: 0; }

    /* ── Policy tab ────────────────────────────────────────────── */
    .policy-notice { display: flex; align-items: center; gap: 10px; background: #fffbeb; border: 1px solid #fde68a; border-radius: var(--r); padding: 12px 16px; font-size: 12px; color: #92400e; font-weight: 600; }
    .policy-list { display: flex; flex-direction: column; gap: 0; padding: 8px 0; }
    .policy-row { display: grid; grid-template-columns: 1fr auto auto; gap: 16px; align-items: center; padding: 14px 20px; border-bottom: 1px solid var(--border); }
    .policy-row:last-child { border-bottom: none; }
    .pr-left { }
    .pr-label { font-size: 13px; font-weight: 700; color: var(--ink); }
    .pr-sub   { font-size: 11px; color: var(--muted); margin-top: 2px; }
    .pr-control { display: flex; align-items: center; gap: 6px; }
    .policy-input { padding: 7px 10px; border: 1px solid var(--border); border-radius: 7px; font-size: 13px; color: var(--ink); font-family: var(--font); outline: none; background: var(--bg); width: 90px; transition: border-color .15s; }
    .policy-input:focus { border-color: var(--blue); box-shadow: 0 0 0 2px rgba(0,87,255,.1); }
    .pr-unit { font-size: 11px; color: var(--muted); font-weight: 600; }
    .pr-current { font-size: 11px; color: var(--muted); white-space: nowrap; min-width: 100px; text-align: right; }

    .toggle-btn { width: 44px; height: 24px; border-radius: 12px; border: none; background: var(--border); cursor: pointer; position: relative; transition: background .25s; padding: 0; }
    .toggle-btn.toggle-on { background: var(--green); }
    .toggle-thumb { position: absolute; top: 2px; left: 2px; width: 20px; height: 20px; border-radius: 50%; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,.2); transition: transform .25s; display: block; }
    .toggle-btn.toggle-on .toggle-thumb { transform: translateX(20px); }

    .enabled-chip { font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 20px; background: #f1f5f9; color: var(--muted); }
    .enabled-chip.chip-on { background: #ecfdf5; color: var(--green); }

    .policy-footer { display: flex; justify-content: flex-end; gap: 10px; padding: 14px 20px; border-top: 1px solid var(--border); background: var(--bg); }

    .audit-mini { padding: 8px 20px; display: flex; flex-direction: column; gap: 0; }
    .am-row { display: flex; gap: 12px; padding: 11px 0; border-bottom: 1px solid var(--border); }
    .am-row:last-child { border-bottom: none; }
    .am-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--blue); flex-shrink: 0; margin-top: 4px; }
    .am-detail { font-size: 12px; color: var(--ink2); }
    .am-meta   { font-size: 10px; color: var(--muted); margin-top: 2px; }
    .am-empty  { padding: 20px; text-align: center; color: var(--muted); font-size: 12px; }

    /* ── Audit trail tab ───────────────────────────────────────── */
    .audit-toolbar { display: flex; align-items: flex-end; gap: 12px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--r); padding: 14px 18px; flex-wrap: wrap; }
    .fb-group { display: flex; flex-direction: column; gap: 4px; }
    .fb-group label { font-size: 10px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: .4px; }
    .fb-group select, .audit-search { padding: 8px 12px; border: 1px solid var(--border); border-radius: 7px; font-size: 13px; color: var(--ink); font-family: var(--font); outline: none; background: var(--surface); transition: border-color .15s; min-width: 140px; }
    .fb-group select:focus, .audit-search:focus { border-color: var(--blue); box-shadow: 0 0 0 3px rgba(0,87,255,.1); }
    .audit-search { min-width: 200px; }
    .result-count { font-size: 12px; color: var(--muted); font-weight: 600; margin-left: auto; align-self: center; }

    .tbl { width: 100%; border-collapse: collapse; font-size: 12px; }
    .tbl thead tr { background: var(--bg); }
    .tbl th { padding: 10px 14px; font-size: 9px; font-weight: 800; color: var(--muted); letter-spacing: .6px; text-align: left; border-bottom: 2px solid var(--border); }
    .tbl td { padding: 11px 14px; border-bottom: 1px solid var(--border); vertical-align: middle; }
    .tbl tbody tr:last-child td { border-bottom: none; }
    .tbl tbody tr:hover td { background: var(--bg); }
    .td-mono   { font-family: 'Courier New', monospace; font-size: 11px; white-space: nowrap; }
    .td-name   { font-weight: 700; color: var(--ink2); }
    .td-detail { color: var(--muted); max-width: 480px; }
    .td-muted  { color: var(--muted); }

    .action-tag { font-size: 9px; font-weight: 800; text-transform: uppercase; padding: 2px 7px; border-radius: 4px; }
    .at-system  { background: #e0f2fe; color: #0369a1; }
    .at-upload  { background: #f0fdf4; color: #15803d; }
    .at-delete  { background: #fef2f2; color: #dc2626; }
    .at-edit    { background: #fef3c7; color: #92400e; }
    .at-login   { background: #ede9fe; color: #6d28d9; }
    .at-create  { background: #f0fdf4; color: #15803d; }
    .at-update  { background: #e0f2fe; color: #0369a1; }
    .at-request { background: #fef3c7; color: #92400e; }
    .at-approve { background: #ecfdf5; color: #065f46; }
    .at-reject  { background: #fef2f2; color: #991b1b; }

    /* Toast */
    .toast { position: fixed; bottom: 28px; right: 28px; background: var(--navy); color: #fff; padding: 12px 20px; border-radius: 10px; font-size: 13px; font-weight: 600; z-index: 2000; box-shadow: 0 8px 24px rgba(0,0,0,.3); opacity: 0; transform: translateY(12px); transition: all .3s ease; pointer-events: none; max-width: 340px; }
    .toast.toast-show { opacity: 1; transform: translateY(0); }
    .toast.toast-err  { background: var(--red); }

    @media (max-width: 1000px) {
      .two-col { grid-template-columns: 1fr; }
      .policy-row { grid-template-columns: 1fr auto; }
      .pr-current { display: none; }
    }
  `]
})
export class SettingsComponent implements OnInit {
  protected readonly gov = inject(GovernanceService);

  tab = 'profile';

  // ── Profile ───────────────────────────────────────────────────
  profile: UserProfile = {
    name: '', email: '', role: '', avatar: '',
    department: '', phone: '', location: '',
  };

  // ── Change Request state ──────────────────────────────────────
  private changeRequests: ChangeRequest[] = this.loadRequests();
  reqFilter   = 'ALL';
  reqSubmitted = false;
  reviewNotes: Record<string, string> = {};

  reqDraft = { field: '' as ChangeField | '', newValue: '', reason: '' };

  readonly changeableFields: { key: ChangeField; label: string; icon: string }[] = [
    { key: 'name',       label: 'Full Name',   icon: '👤' },
    { key: 'email',      label: 'Email',        icon: '✉️'  },
    { key: 'department', label: 'Department',  icon: '🏢' },
    { key: 'phone',      label: 'Phone',        icon: '📞' },
    { key: 'location',   label: 'Location',    icon: '📍' },
  ];

  // ── Policy ────────────────────────────────────────────────────
  policy:      PolicyConfig = this.loadPolicy();
  policyDraft: PolicyConfig = { ...this.policy };
  formatsStr = this.policy.allowedFormats.join(', ');

  // ── Audit ─────────────────────────────────────────────────────
  auditActionFilter = '';
  auditUserFilter   = '';
  auditSearch       = '';
  readonly auditActions: ActionType[] = ['SYSTEM','UPLOAD','DELETE','EDIT','LOGIN','CREATE','UPDATE'];

  // ── Toast ─────────────────────────────────────────────────────
  toastMsg = ''; toastErr = false;
  private toastTimer: any;

  // ═══════════════════════════════════════════════════════════════
  ngOnInit(): void {
    this.syncProfile();
  }

  private syncProfile(): void {
    const u = this.gov.currentUser();
    const saved = this.loadProfileExtras();
    this.profile = {
      name:       saved.name       || u.name,
      email:      saved.email      || u.email,
      role:       u.role,
      avatar:     u.avatar,
      department: saved.department || '',
      phone:      saved.phone      || '',
      location:   saved.location   || 'Nairobi, Kenya',
    };
  }

  // ── Helpers ────────────────────────────────────────────────────
  isHOD(): boolean { return this.gov.currentUser().role === 'HOD'; }

  currentPermissions() { return ROLE_PERMISSIONS[this.gov.currentUser().role] ?? []; }
  allPermissionLabels() { return ROLE_PERMISSIONS['HOD'].map(p => p.label); }
  roleHasPerm(role: string, label: string): boolean {
    return ROLE_PERMISSIONS[role]?.find(p => p.label === label)?.granted ?? false;
  }

  pendingCount(): number   { return this.changeRequests.filter(r => r.status === 'PENDING').length; }
  pendingRequests(): ChangeRequest[] { return this.changeRequests.filter(r => r.status === 'PENDING'); }
  myPendingRequests(): ChangeRequest[] {
    return this.changeRequests.filter(r => r.status === 'PENDING' && r.requestedBy === this.profile.name);
  }

  hasPendingFor(field: ChangeField): boolean {
    return this.changeRequests.some(r => r.field === field && r.status === 'PENDING' && r.requestedBy === this.profile.name);
  }

  visibleRequests(): ChangeRequest[] {
    let list = this.isHOD()
      ? [...this.changeRequests]
      : this.changeRequests.filter(r => r.requestedBy === this.profile.name);

    if (this.reqFilter !== 'ALL') {
      list = list.filter(r => r.status === this.reqFilter);
    }

    return list.sort((a, b) => b.requestedAt.getTime() - a.requestedAt.getTime());
  }

  countByStatus(status: string): number {
    const base = this.isHOD()
      ? this.changeRequests
      : this.changeRequests.filter(r => r.requestedBy === this.profile.name);
    return status === 'ALL' ? base.length : base.filter(r => r.status === status).length;
  }

  currentFieldValue(field: ChangeField | ''): string {
    if (!field) return '';
    return (this.profile as any)[field] ?? '—';
  }

  fieldPlaceholder(field: ChangeField | ''): string {
    const map: Record<ChangeField, string> = {
      name: 'e.g. Dr. Amara Osei',
      email: 'e.g. amara.osei@org.ke',
      role: 'e.g. HOD',
      department: 'e.g. Strategy & Governance',
      phone: 'e.g. +254 700 000 000',
      location: 'e.g. Nairobi, Kenya',
    };
    return field ? map[field] : '';
  }

  auditUsers(): string[] {
    return [...new Set(this.gov.auditLog.map((e: AuditEntry) => e.user))];
  }

  filteredAudit(): AuditEntry[] {
    return this.gov.auditLog.filter((e: AuditEntry) => {
      const matchAction = !this.auditActionFilter || e.action === this.auditActionFilter;
      const matchUser   = !this.auditUserFilter   || e.user === this.auditUserFilter;
      const matchSearch = !this.auditSearch || e.details.toLowerCase().includes(this.auditSearch.toLowerCase());
      return matchAction && matchUser && matchSearch;
    });
  }

  policyAuditEntries(): AuditEntry[] {
    return this.gov.auditLog.filter((e: AuditEntry) => e.details.toLowerCase().includes('policy')).slice(0, 15);
  }

  // ── Field selection ────────────────────────────────────────────
  selectField(key: ChangeField): void {
    this.reqDraft = { field: key, newValue: '', reason: '' };
    this.reqSubmitted = false;
  }

  resetReqForm(): void {
    this.reqDraft = { field: '' as ChangeField, newValue: '', reason: '' };
    this.reqSubmitted = false;
  }

  // ── Submit change request ──────────────────────────────────────
  submitChangeRequest(): void {
    this.reqSubmitted = true;
    if (!this.reqDraft.field || !this.reqDraft.newValue.trim() || !this.reqDraft.reason.trim()) {
      this.toast('Please fill in all required fields', true);
      return;
    }
    const fieldMeta = this.changeableFields.find(f => f.key === this.reqDraft.field)!;
    const req: ChangeRequest = {
      id: 'CR-' + Date.now().toString(36).toUpperCase(),
      requestedBy: this.profile.name,
      requestedAt: new Date(),
      field: this.reqDraft.field as ChangeField,
      fieldLabel: fieldMeta.label,
      oldValue: this.currentFieldValue(this.reqDraft.field),
      newValue: this.reqDraft.newValue.trim(),
      reason: this.reqDraft.reason.trim(),
      status: 'PENDING',
    };
    this.changeRequests = [req, ...this.changeRequests];
    this.persistRequests();
    this.gov.log('EDIT' as ActionType, `Change request ${req.id} submitted by ${req.requestedBy}: ${req.fieldLabel} change requested`);
    this.resetReqForm();
    this.toast(`Request ${req.id} submitted — awaiting HOD approval`);
    if (!this.isHOD()) this.tab = 'requests';
  }

  // ── Approve request → auto-apply profile update ───────────────
  approveRequest(r: ChangeRequest): void {
    const note = this.reviewNotes[r.id] ?? '';

    // Auto-apply the change to the profile
    (this.profile as any)[r.field] = r.newValue;
    this.persistProfileExtras();

    // If it's the name/email, also sync to the base user (if HOD approving own)
    if (r.field === 'name' && r.requestedBy === this.gov.currentUser().name) {
      // In a real app: call AuthService.updateUser(). Here we persist via extras.
    }

    // Mark approved
    r.status = 'APPROVED';
    r.reviewedBy = this.gov.currentUser().name + ' (' + this.gov.currentUser().role + ')';
    r.reviewedAt = new Date();
    r.reviewNote = note;
    delete this.reviewNotes[r.id];

    this.persistRequests();
    this.gov.log('UPDATE' as ActionType,
      `Change request ${r.id} APPROVED by ${r.reviewedBy}: ${r.fieldLabel} updated from "${r.oldValue}" to "${r.newValue}"${note ? ` — note: "${note}"` : ''}`
    );
    this.toast(`✓ Approved — ${r.fieldLabel} updated to "${r.newValue}"`);
  }

  // ── Reject request ─────────────────────────────────────────────
  rejectRequest(r: ChangeRequest): void {
    const note = this.reviewNotes[r.id] ?? '';
    r.status = 'REJECTED';
    r.reviewedBy = this.gov.currentUser().name + ' (' + this.gov.currentUser().role + ')';
    r.reviewedAt = new Date();
    r.reviewNote = note || 'Request did not meet approval criteria.';
    delete this.reviewNotes[r.id];

    this.persistRequests();
    this.gov.log('EDIT' as ActionType,
      `Change request ${r.id} REJECTED by ${r.reviewedBy}: ${r.fieldLabel} change from "${r.oldValue}" to "${r.newValue}" denied${note ? ` — note: "${note}"` : ''}`
    );
    this.toast(`Request ${r.id} rejected`, true);
  }

  // ── Cancel own pending request ────────────────────────────────
  cancelRequest(r: ChangeRequest): void {
    r.status = 'CANCELLED';
    this.persistRequests();
    this.gov.log('EDIT' as ActionType, `Change request ${r.id} cancelled by requester`);
    this.toast(`Request ${r.id} cancelled`);
  }

  // ── Policy save ───────────────────────────────────────────────
  savePolicy(): void {
    this.policy = { ...this.policyDraft, allowedFormats: this.formatsStr.split(',').map(s => s.trim().toUpperCase()).filter(Boolean) };
    this.policyDraft = { ...this.policy };
    this.persistPolicy();
    this.gov.log('UPDATE' as ActionType,
      `Policy updated by ${this.gov.currentUser().name}: maxFileSize=${this.policy.maxFileSizeMb}MB, formats=${this.policy.allowedFormats.join('/')}, phaseGateLock=${this.policy.phaseGateLock}, deleteApproval=${this.policy.requireApprovalForDelete}`
    );
    this.toast('Policy saved and logged successfully');
  }

  resetPolicy(): void {
    this.policy = { ...DEFAULT_POLICY };
    this.policyDraft = { ...DEFAULT_POLICY };
    this.formatsStr = DEFAULT_POLICY.allowedFormats.join(', ');
    this.persistPolicy();
    this.gov.log('SYSTEM', 'Policy reset to defaults');
    this.toast('Policy reset to defaults');
  }

  // ── Role switch (demo) ─────────────────────────────────────────
  switchRole(role: string): void {
    this.gov.login(role);
    this.syncProfile();
    this.toast(`Session role switched to ${role}`);
  }

  // ── CSV export ────────────────────────────────────────────────
  exportAuditCsv(): void {
    const header = ['Timestamp','Action','User','Details','Event ID'];
    const rows   = this.filteredAudit().map((e: AuditEntry) => [e.time.toISOString(), e.action, e.user, e.details, e.id ?? '']);
    const csv    = [header, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob   = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url    = URL.createObjectURL(blob);
    const a      = document.createElement('a');
    a.href = url; a.download = `audit-log-${new Date().toISOString().slice(0,10)}.csv`; a.click();
    URL.revokeObjectURL(url);
    this.gov.log('SYSTEM', 'Audit log exported to CSV');
  }

  // ── Persistence ───────────────────────────────────────────────
  private loadRequests(): ChangeRequest[] {
    try {
      const raw = localStorage.getItem('ba_change_requests');
      return raw ? JSON.parse(raw).map((r: any) => ({ ...r, requestedAt: new Date(r.requestedAt), reviewedAt: r.reviewedAt ? new Date(r.reviewedAt) : undefined })) : [];
    } catch { return []; }
  }

  private persistRequests(): void {
    try { localStorage.setItem('ba_change_requests', JSON.stringify(this.changeRequests)); } catch {}
  }

  private loadProfileExtras(): Partial<UserProfile> {
    try { return JSON.parse(localStorage.getItem('ba_profile_extras') ?? '{}'); } catch { return {}; }
  }

  private persistProfileExtras(): void {
    try { localStorage.setItem('ba_profile_extras', JSON.stringify({ name: this.profile.name, email: this.profile.email, department: this.profile.department, phone: this.profile.phone, location: this.profile.location })); } catch {}
  }

  private loadPolicy(): PolicyConfig {
    try { const raw = localStorage.getItem('ba_policy'); return raw ? JSON.parse(raw) : { ...DEFAULT_POLICY }; } catch { return { ...DEFAULT_POLICY }; }
  }

  private persistPolicy(): void {
    try { localStorage.setItem('ba_policy', JSON.stringify(this.policy)); } catch {}
  }

  // ── Toast ─────────────────────────────────────────────────────
  toast(msg: string, err = false): void {
    clearTimeout(this.toastTimer);
    this.toastMsg = msg; this.toastErr = err;
    this.toastTimer = setTimeout(() => { this.toastMsg = ''; this.toastErr = false; }, 3500);
  }
}
