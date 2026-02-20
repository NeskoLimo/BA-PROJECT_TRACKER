// src/app/components/repository/repository.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GovernanceService } from '../../services/governance.service';

interface SignoffRequest {
  id: string;
  projectId: string;
  projectName: string;
  documentName: string;
  requestedBy: string;
  assignedTo: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  comments: string;
  requestedAt: Date;
  actedAt?: Date;
}

interface Template {
  id: string;
  name: string;
  category: string;
  description: string;
  filename: string;
  content: string; // CSV/text content to download
  icon: string;
}

@Component({
  selector: 'app-repository',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="mck-container">

      <!-- Header -->
      <div class="header">
        <div class="title-group">
          <span class="eyebrow">Project Audit Trail</span>
          <h1>Document & Signature Hub</h1>
          <p>Download standard templates and manage project sign-off workflows.</p>
        </div>
        <button class="btn-main" *ngIf="gov.canEdit()" (click)="showRequestModal = true">
          + Request Sign-off
        </button>
      </div>

      <!-- Stats Row -->
      <div class="stats-row">
        <div class="stat-pill">
          <span class="stat-num">{{ templates.length }}</span>
          <span class="stat-lbl">Templates</span>
        </div>
        <div class="stat-pill">
          <span class="stat-num pending">{{ getPendingCount() }}</span>
          <span class="stat-lbl">Pending Sign-offs</span>
        </div>
        <div class="stat-pill">
          <span class="stat-num approved">{{ getApprovedCount() }}</span>
          <span class="stat-lbl">Approved</span>
        </div>
        <div class="stat-pill">
          <span class="stat-num rejected">{{ getRejectedCount() }}</span>
          <span class="stat-lbl">Rejected</span>
        </div>
        <div class="stat-pill">
          <span class="stat-num">{{ getAttachedCount() }}</span>
          <span class="stat-lbl">Scope Files Linked</span>
        </div>
      </div>

      <!-- Tabs -->
      <div class="tabs">
        <button class="tab" [class.active]="activeTab === 'templates'" (click)="activeTab = 'templates'">
          📄 Templates
        </button>
        <button class="tab" [class.active]="activeTab === 'signoffs'" (click)="activeTab = 'signoffs'">
          ✍️ Sign-off Workflow
          <span class="badge" *ngIf="getPendingCount() > 0">{{ getPendingCount() }}</span>
        </button>
        <button class="tab" [class.active]="activeTab === 'audit'" (click)="activeTab = 'audit'">
          🔍 Audit Trail
        </button>
      </div>

      <!-- TEMPLATES TAB -->
      <div *ngIf="activeTab === 'templates'">
        <div class="section-desc">Click <strong>Download</strong> to get a working template file.</div>
        <div class="template-grid">
          <div class="template-card" *ngFor="let t of templates">
            <div class="template-icon">{{ t.icon }}</div>
            <div class="template-info">
              <div class="template-name">{{ t.name }}</div>
              <div class="template-category">{{ t.category }}</div>
              <div class="template-desc">{{ t.description }}</div>
            </div>
            <button class="btn-download" (click)="downloadTemplate(t)">
              ↓ Download
            </button>
          </div>
        </div>
      </div>

      <!-- SIGN-OFF WORKFLOW TAB -->
      <div *ngIf="activeTab === 'signoffs'">

        <!-- Filter -->
        <div class="filter-bar">
          <button class="filter-btn" [class.active]="signoffFilter === 'All'" (click)="signoffFilter = 'All'">All</button>
          <button class="filter-btn" [class.active]="signoffFilter === 'Pending'" (click)="signoffFilter = 'Pending'">Pending</button>
          <button class="filter-btn" [class.active]="signoffFilter === 'Approved'" (click)="signoffFilter = 'Approved'">Approved</button>
          <button class="filter-btn" [class.active]="signoffFilter === 'Rejected'" (click)="signoffFilter = 'Rejected'">Rejected</button>
        </div>

        <div class="signoff-table-wrap">
          <table class="sig-table">
            <thead>
              <tr>
                <th>Document</th>
                <th>Project</th>
                <th>Requested By</th>
                <th>Assigned To</th>
                <th>Requested</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let s of getFilteredSignoffs()">
                <td>
                  <div class="doc-name-cell">📄 {{ s.documentName }}</div>
                </td>
                <td>
                  <div class="proj-ref">{{ s.projectName }}</div>
                  <div class="proj-id-sm">{{ s.projectId }}</div>
                </td>
                <td>
                  <div class="signatory">
                    <div class="avatar">{{ s.requestedBy.charAt(0) }}</div>
                    {{ s.requestedBy }}
                  </div>
                </td>
                <td>
                  <div class="signatory">
                    <div class="avatar blue">{{ s.assignedTo.charAt(0) }}</div>
                    {{ s.assignedTo }}
                  </div>
                </td>
                <td class="date-sm">{{ s.requestedAt | date:'dd/MM/yy' }}</td>
                <td>
                  <span class="sig-badge" [ngClass]="s.status.toLowerCase()">{{ s.status }}</span>
                </td>
                <td>
                  <div class="action-row" *ngIf="s.status === 'Pending'">
                    <button class="btn-approve" (click)="openActionModal(s, 'Approved')">✓ Approve</button>
                    <button class="btn-reject" (click)="openActionModal(s, 'Rejected')">✗ Reject</button>
                  </div>
                  <div *ngIf="s.status !== 'Pending'">
                    <span class="acted-date">{{ s.actedAt | date:'dd/MM/yy' }}</span>
                    <div class="comment-preview" *ngIf="s.comments">💬 {{ s.comments }}</div>
                  </div>
                </td>
              </tr>
              <tr *ngIf="getFilteredSignoffs().length === 0">
                <td colspan="7" class="empty-state">No sign-off requests match this filter.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- AUDIT TRAIL TAB -->
      <div *ngIf="activeTab === 'audit'">
        <div class="audit-list">
          <div class="audit-item" *ngFor="let entry of gov.auditLog">
            <div class="audit-icon" [ngClass]="entry.action.toLowerCase()">
              {{ getAuditIcon(entry.action) }}
            </div>
            <div class="audit-body">
              <div class="audit-detail">{{ entry.details }}</div>
              <div class="audit-meta">{{ entry.user }} · {{ entry.time | date:'dd/MM/yy, h:mm a' }}</div>
            </div>
            <div class="audit-badge" [ngClass]="entry.action.toLowerCase()">{{ entry.action }}</div>
          </div>
          <div class="empty-state" *ngIf="gov.auditLog.length === 0">No audit entries yet.</div>
        </div>
      </div>

      <!-- Executed Sign-offs from Projects -->
      <div class="mck-card" style="margin-top:24px" *ngIf="activeTab === 'signoffs'">
        <h3 class="card-title">📎 Scope Files Linked to Projects</h3>
        <div class="signoff-grid">
          <div *ngFor="let proj of gov.projects" class="signoff-card" [class.hidden]="!proj.hasAttachment">
            <div class="status-dot-green"></div>
            <div class="signoff-info">
              <span class="proj-id-tag">{{ proj.id }}</span>
              <span class="proj-title-sm">{{ proj.name }}</span>
              <span class="file-link">🔗 {{ proj.attachmentUrl }}</span>
            </div>
            <button class="btn-view" (click)="viewDoc(proj.attachmentUrl)">View</button>
          </div>
          <div class="empty-state" *ngIf="getAttachedCount() === 0">
            No scope files linked yet. Upload from the Projects page.
          </div>
        </div>
      </div>

      <!-- Request Sign-off Modal -->
      <div class="modal-overlay" *ngIf="showRequestModal" (click)="showRequestModal = false">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Request Sign-off</h2>
            <button class="modal-close" (click)="showRequestModal = false">✕</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Document Name *</label>
              <input type="text" [(ngModel)]="newRequest.documentName" placeholder="e.g. PRJ-101 Scope Sign-off" />
            </div>
            <div class="form-group">
              <label>Project *</label>
              <select [(ngModel)]="newRequest.projectId" (change)="onProjectSelect()">
                <option value="">Select project...</option>
                <option *ngFor="let p of gov.projects" [value]="p.id">{{ p.id }} — {{ p.name }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Assign To (Signatory) *</label>
              <input type="text" [(ngModel)]="newRequest.assignedTo" placeholder="e.g. HOD Finance" />
            </div>
            <div class="form-error" *ngIf="requestError">⚠️ {{ requestError }}</div>
          </div>
          <div class="modal-footer">
            <button class="btn-sec" (click)="showRequestModal = false">Cancel</button>
            <button class="btn-main" (click)="submitRequest()">Submit Request</button>
          </div>
        </div>
      </div>

      <!-- Approve/Reject Modal -->
      <div class="modal-overlay" *ngIf="showActionModal" (click)="showActionModal = false">
        <div class="modal modal-sm" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{ pendingAction === 'Approved' ? '✓ Approve' : '✗ Reject' }} Sign-off</h2>
            <button class="modal-close" (click)="showActionModal = false">✕</button>
          </div>
          <div class="modal-body">
            <div class="action-doc-name">📄 {{ selectedSignoff?.documentName }}</div>
            <div class="form-group" style="margin-top:14px">
              <label>Comments {{ pendingAction === 'Rejected' ? '(required)' : '(optional)' }}</label>
              <textarea [(ngModel)]="actionComment" rows="3"
                [placeholder]="pendingAction === 'Approved' ? 'Add any notes...' : 'Reason for rejection...'"></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-sec" (click)="showActionModal = false">Cancel</button>
            <button [class]="pendingAction === 'Approved' ? 'btn-approve-lg' : 'btn-reject-lg'"
              (click)="confirmAction()">
              {{ pendingAction === 'Approved' ? '✓ Confirm Approval' : '✗ Confirm Rejection' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Toast -->
      <div class="toast" *ngIf="toastVisible">{{ toastMessage }}</div>

    </div>
  `,
  styles: [`
    .mck-container { padding: 28px; background: #f5f7f9; min-height: 100vh; font-family: 'Inter', sans-serif; display: flex; flex-direction: column; gap: 20px; }
    .eyebrow { color: #007DFE; font-weight: 800; font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; }
    .title-group h1 { font-size: 22px; font-weight: 700; margin: 4px 0 2px; font-family: 'Georgia', serif; color: #1a2332; }
    .title-group p { font-size: 12px; color: #718096; margin: 0; }

    /* Stats */
    .stats-row { display: flex; gap: 12px; flex-wrap: wrap; }
    .stat-pill { background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 18px; display: flex; flex-direction: column; align-items: center; min-width: 90px; }
    .stat-num { font-size: 24px; font-weight: 700; color: #1a2332; font-family: 'Georgia', serif; }
    .stat-num.pending { color: #d69e2e; }
    .stat-num.approved { color: #38a169; }
    .stat-num.rejected { color: #e53e3e; }
    .stat-lbl { font-size: 10px; color: #94a3b8; text-transform: uppercase; font-weight: 700; letter-spacing: 0.4px; margin-top: 2px; text-align: center; }

    /* Tabs */
    .tabs { display: flex; gap: 4px; background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px; width: fit-content; }
    .tab { padding: 8px 16px; border: none; background: none; border-radius: 6px; font-size: 13px; font-weight: 600; color: #64748b; cursor: pointer; display: flex; align-items: center; gap: 6px; }
    .tab.active { background: #1a2332; color: white; }
    .tab:hover:not(.active) { background: #f7f9fc; }
    .badge { background: #e53e3e; color: white; font-size: 10px; padding: 1px 6px; border-radius: 99px; font-weight: 700; }

    /* Templates */
    .section-desc { font-size: 13px; color: #718096; margin-bottom: 16px; }
    .template-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 14px; }
    .template-card { background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; display: flex; align-items: flex-start; gap: 14px; transition: border 0.15s; }
    .template-card:hover { border-color: #007DFE; }
    .template-icon { font-size: 28px; flex-shrink: 0; }
    .template-info { flex: 1; }
    .template-name { font-size: 14px; font-weight: 700; color: #1a2332; margin-bottom: 2px; }
    .template-category { font-size: 10px; font-weight: 700; color: #007DFE; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
    .template-desc { font-size: 12px; color: #718096; }
    .btn-download { background: #1a2332; color: white; border: none; padding: 8px 14px; border-radius: 6px; font-size: 12px; font-weight: 700; cursor: pointer; white-space: nowrap; flex-shrink: 0; }
    .btn-download:hover { background: #2d3748; }

    /* Filter bar */
    .filter-bar { display: flex; gap: 8px; margin-bottom: 16px; }
    .filter-btn { padding: 6px 14px; border: 1px solid #e2e8f0; border-radius: 20px; background: white; font-size: 12px; font-weight: 600; color: #64748b; cursor: pointer; }
    .filter-btn.active { background: #1a2332; color: white; border-color: #1a2332; }

    /* Sign-off table */
    .signoff-table-wrap { background: white; border: 1px solid #e2e8f0; border-radius: 8px; overflow-x: auto; }
    .sig-table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .sig-table th { padding: 10px 14px; background: #f8fafc; text-align: left; font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #f1f5f9; font-weight: 700; white-space: nowrap; }
    .sig-table td { padding: 12px 14px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
    .sig-table tr:last-child td { border-bottom: none; }
    .doc-name-cell { font-weight: 600; color: #1a2332; }
    .proj-ref { font-weight: 600; color: #1a2332; font-size: 13px; }
    .proj-id-sm { font-size: 10px; color: #94a3b8; }
    .date-sm { font-size: 12px; color: #64748b; white-space: nowrap; }
    .signatory { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; color: #1a2332; }
    .avatar { width: 24px; height: 24px; background: #1a2332; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; flex-shrink: 0; }
    .avatar.blue { background: #007DFE; }
    .sig-badge { font-size: 10px; padding: 3px 9px; border-radius: 20px; font-weight: 800; text-transform: uppercase; }
    .pending  { background: #fef3c7; color: #92400e; }
    .approved { background: #ecfdf5; color: #166534; }
    .rejected { background: #fef2f2; color: #991b1b; }
    .action-row { display: flex; gap: 6px; }
    .btn-approve { background: #ecfdf5; color: #166534; border: 1px solid #a7f3d0; padding: 5px 10px; border-radius: 5px; font-size: 11px; font-weight: 700; cursor: pointer; }
    .btn-approve:hover { background: #d1fae5; }
    .btn-reject { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; padding: 5px 10px; border-radius: 5px; font-size: 11px; font-weight: 700; cursor: pointer; }
    .btn-reject:hover { background: #fee2e2; }
    .acted-date { font-size: 11px; color: #94a3b8; }
    .comment-preview { font-size: 11px; color: #64748b; margin-top: 3px; }

    /* Audit trail */
    .audit-list { background: white; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
    .audit-item { display: flex; align-items: center; gap: 14px; padding: 14px 18px; border-bottom: 1px solid #f1f5f9; }
    .audit-item:last-child { border-bottom: none; }
    .audit-icon { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 14px; flex-shrink: 0; background: #f1f5f9; }
    .audit-icon.create { background: #ecfdf5; }
    .audit-icon.update { background: #e0f2fe; }
    .audit-icon.delete { background: #fef2f2; }
    .audit-icon.upload { background: #fdf4ff; }
    .audit-icon.system { background: #f1f5f9; }
    .audit-body { flex: 1; }
    .audit-detail { font-size: 13px; font-weight: 600; color: #1a2332; }
    .audit-meta { font-size: 11px; color: #94a3b8; margin-top: 2px; }
    .audit-badge { font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; padding: 3px 8px; border-radius: 4px; background: #f1f5f9; color: #64748b; white-space: nowrap; }
    .audit-badge.create { background: #ecfdf5; color: #166534; }
    .audit-badge.update { background: #e0f2fe; color: #0369a1; }
    .audit-badge.delete { background: #fef2f2; color: #991b1b; }
    .audit-badge.upload { background: #fdf4ff; color: #7e22ce; }

    /* Executed sign-offs */
    .mck-card { background: white; border-radius: 8px; border: 1px solid #e2e8f0; padding: 20px; }
    .card-title { font-size: 13px; font-weight: 700; color: #1a2332; margin: 0 0 16px; text-transform: uppercase; letter-spacing: 0.5px; }
    .signoff-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 12px; }
    .signoff-card { display: flex; align-items: center; padding: 12px 14px; background: #f8fafc; border-radius: 6px; gap: 12px; border: 1px solid #e8ecf0; }
    .signoff-card.hidden { display: none; }
    .status-dot-green { width: 8px; height: 8px; background: #10b981; border-radius: 50%; flex-shrink: 0; }
    .signoff-info { flex: 1; display: flex; flex-direction: column; gap: 2px; min-width: 0; }
    .proj-id-tag { font-size: 9px; font-weight: 800; color: #94a3b8; text-transform: uppercase; }
    .proj-title-sm { font-size: 12px; font-weight: 700; color: #1a2332; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .file-link { font-size: 11px; color: #007DFE; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .btn-view { background: white; border: 1px solid #e2e8f0; padding: 5px 10px; border-radius: 4px; font-size: 11px; cursor: pointer; white-space: nowrap; font-weight: 600; }
    .btn-view:hover { background: #f7f9fc; }

    /* Modals */
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.35); z-index: 200; display: flex; align-items: center; justify-content: center; }
    .modal { background: #fff; border-radius: 12px; width: 500px; max-width: 95vw; box-shadow: 0 20px 60px rgba(0,0,0,0.15); }
    .modal-sm { width: 420px; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 18px 22px; border-bottom: 1px solid #e8ecf0; }
    .modal-header h2 { margin: 0; font-size: 16px; font-family: 'Georgia', serif; color: #1a2332; }
    .modal-close { background: none; border: none; font-size: 16px; cursor: pointer; color: #a0aec0; }
    .modal-body { padding: 18px 22px; display: flex; flex-direction: column; gap: 14px; }
    .modal-footer { display: flex; justify-content: flex-end; gap: 10px; padding: 14px 22px; border-top: 1px solid #e8ecf0; }
    .form-group { display: flex; flex-direction: column; gap: 5px; }
    .form-group label { font-size: 11px; font-weight: 700; color: #718096; text-transform: uppercase; }
    .form-group input, .form-group select, .form-group textarea { padding: 9px 12px; border: 1px solid #e8ecf0; border-radius: 7px; font-size: 13px; color: #1a2332; outline: none; font-family: sans-serif; }
    .form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color: #1a2332; }
    .form-group textarea { resize: vertical; }
    .form-error { font-size: 12px; color: #e53e3e; background: #fde8e8; padding: 8px 12px; border-radius: 6px; }
    .action-doc-name { font-size: 14px; font-weight: 700; color: #1a2332; padding: 10px; background: #f7f9fc; border-radius: 6px; }

    .btn-main { background: #1a2332; color: white; border: none; padding: 9px 16px; border-radius: 7px; font-size: 13px; font-weight: 600; cursor: pointer; }
    .btn-main:hover { background: #2d3748; }
    .btn-sec { background: #f7f9fc; color: #1a2332; border: 1px solid #e8ecf0; padding: 9px 16px; border-radius: 7px; font-size: 13px; font-weight: 600; cursor: pointer; }
    .btn-sec:hover { background: #edf2f7; }
    .btn-approve-lg { background: #38a169; color: white; border: none; padding: 9px 16px; border-radius: 7px; font-size: 13px; font-weight: 700; cursor: pointer; }
    .btn-approve-lg:hover { background: #2f855a; }
    .btn-reject-lg { background: #e53e3e; color: white; border: none; padding: 9px 16px; border-radius: 7px; font-size: 13px; font-weight: 700; cursor: pointer; }
    .btn-reject-lg:hover { background: #c53030; }

    .empty-state { text-align: center; color: #a0aec0; padding: 32px !important; font-size: 13px; }
    .toast { position: fixed; bottom: 24px; right: 24px; background: #1a2332; color: white; padding: 12px 20px; border-radius: 8px; font-size: 13px; font-weight: 600; box-shadow: 0 4px 16px rgba(0,0,0,0.15); z-index: 999; animation: fadeIn 0.2s ease; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class RepositoryComponent {
  activeTab = 'templates';
  signoffFilter = 'All';
  showRequestModal = false;
  showActionModal = false;
  toastVisible = false;
  toastMessage = '';
  selectedSignoff: SignoffRequest | null = null;
  pendingAction: 'Approved' | 'Rejected' = 'Approved';
  actionComment = '';
  requestError = '';

  newRequest = { documentName: '', projectId: '', projectName: '', assignedTo: '' };

  templates: Template[] = [
    {
      id: 'T01', name: 'Project Scope Sign-off', category: 'Governance', icon: '📋',
      description: 'Standard scope agreement template for stakeholder sign-off at gate review.',
      filename: 'scope-signoff-template.csv',
      content: 'Field,Value\nProject Name,\nProject ID,\nScope Statement,\nDeliverables,\nOut of Scope,\nPM Name,\nSponsor Name,\nPM Signature,\nSponsor Signature,\nDate,'
    },
    {
      id: 'T02', name: 'Project Charter', category: 'Initiation', icon: '📝',
      description: 'Formal authorization document to initiate a project and assign the PM.',
      filename: 'project-charter-template.csv',
      content: 'Field,Value\nProject Title,\nProject Purpose,\nObjectives,\nBudget Estimate,\nStart Date,\nEnd Date,\nProject Manager,\nSponsor,\nStakeholders,\nRisks,\nConstraints,\nAuthorized By,\nDate,'
    },
    {
      id: 'T03', name: 'Risk Register', category: 'Planning', icon: '⚠️',
      description: 'Track and rate project risks by likelihood, impact and mitigation strategy.',
      filename: 'risk-register-template.csv',
      content: 'Risk ID,Description,Category,Likelihood (1-5),Impact (1-5),Risk Score,Mitigation Strategy,Owner,Status\nR001,,Technical,,,,,,'
    },
    {
      id: 'T04', name: 'RACI Matrix', category: 'Planning', icon: '👥',
      description: 'Define Responsible, Accountable, Consulted and Informed roles per task.',
      filename: 'raci-matrix-template.csv',
      content: 'Task / Deliverable,PM,BA,HOD,IT Lead,Sponsor,Finance\nProject Kickoff,R,C,A,C,I,I\nScope Definition,R,R,A,C,C,I\nBudget Approval,C,I,C,I,A,R\nStatus Reporting,R,C,I,I,I,I'
    },
    {
      id: 'T05', name: 'Status Report', category: 'Execution', icon: '📊',
      description: 'Weekly/monthly project status report for stakeholder communication.',
      filename: 'status-report-template.csv',
      content: 'Field,Value\nReport Date,\nProject Name,\nReporting Period,\nOverall Status (RAG),\nProgress This Period,\nPlanned Next Period,\nBudget Spent,\nBudget Remaining,\nRisks / Issues,\nDecisions Required,\nPrepared By,'
    },
    {
      id: 'T06', name: 'Lessons Learned', category: 'Closure', icon: '🎓',
      description: 'Document key learnings at project closure for organisational knowledge.',
      filename: 'lessons-learned-template.csv',
      content: 'Category,What Went Well,What Could Be Improved,Recommendation\nPlanning,,,\nExecution,,,\nStakeholder Management,,,\nRisk Management,,,\nBudget Management,,,\nTeam Collaboration,,,'
    },
  ];

  signoffRequests: SignoffRequest[] = [
    {
      id: 'SIG-001', projectId: 'PRJ-102', projectName: 'Warehouse Expansion',
      documentName: 'PRJ-102 Scope Sign-off', requestedBy: 'James K.',
      assignedTo: 'HOD Finance', status: 'Pending', comments: '',
      requestedAt: new Date('2026-02-15')
    },
    {
      id: 'SIG-002', projectId: 'PRJ-101', projectName: 'ERP System Migration',
      documentName: 'Regional Budget Approval', requestedBy: 'Alice M.',
      assignedTo: 'Country Mgr (Kenya)', status: 'Approved', comments: 'Approved subject to Q2 review.',
      requestedAt: new Date('2026-02-10'), actedAt: new Date('2026-02-12')
    },
  ];

  constructor(public gov: GovernanceService) {}

  // --- Template Download ---
  downloadTemplate(t: Template) {
    const blob = new Blob([t.content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = t.filename;
    a.click();
    URL.revokeObjectURL(url);
    this.gov.auditLog.unshift({
      time: new Date(), action: 'UPLOAD',
      user: this.gov.currentUser.name,
      details: `Downloaded template "${t.name}"`
    });
    this.showToast(`✅ "${t.filename}" downloaded`);
  }

  // --- Sign-off Workflow ---
  getFilteredSignoffs(): SignoffRequest[] {
    if (this.signoffFilter === 'All') return this.signoffRequests;
    return this.signoffRequests.filter(s => s.status === this.signoffFilter);
  }

  onProjectSelect() {
    const p = this.gov.projects.find(pr => pr.id === this.newRequest.projectId);
    if (p) this.newRequest.projectName = p.name;
  }

  submitRequest() {
    this.requestError = '';
    if (!this.newRequest.documentName) { this.requestError = 'Document name is required'; return; }
    if (!this.newRequest.projectId) { this.requestError = 'Please select a project'; return; }
    if (!this.newRequest.assignedTo) { this.requestError = 'Please assign a signatory'; return; }

    const req: SignoffRequest = {
      id: `SIG-${String(this.signoffRequests.length + 1).padStart(3, '0')}`,
      projectId: this.newRequest.projectId,
      projectName: this.newRequest.projectName,
      documentName: this.newRequest.documentName,
      requestedBy: this.gov.currentUser.name,
      assignedTo: this.newRequest.assignedTo,
      status: 'Pending', comments: '',
      requestedAt: new Date()
    };
    this.signoffRequests.unshift(req);
    this.gov.auditLog.unshift({
      time: new Date(), action: 'CREATE', user: this.gov.currentUser.name,
      details: `Sign-off requested for "${req.documentName}" — assigned to ${req.assignedTo}`
    });
    this.newRequest = { documentName: '', projectId: '', projectName: '', assignedTo: '' };
    this.showRequestModal = false;
    this.showToast('✅ Sign-off request submitted');
  }

  openActionModal(s: SignoffRequest, action: 'Approved' | 'Rejected') {
    this.selectedSignoff = s;
    this.pendingAction = action;
    this.actionComment = '';
    this.showActionModal = true;
  }

  confirmAction() {
    if (!this.selectedSignoff) return;
    if (this.pendingAction === 'Rejected' && !this.actionComment.trim()) {
      alert('Please provide a reason for rejection.');
      return;
    }
    this.selectedSignoff.status = this.pendingAction;
    this.selectedSignoff.comments = this.actionComment;
    this.selectedSignoff.actedAt = new Date();
    this.gov.auditLog.unshift({
      time: new Date(), action: 'UPDATE', user: this.gov.currentUser.name,
      details: `Sign-off "${this.selectedSignoff.documentName}" ${this.pendingAction.toLowerCase()} — ${this.actionComment || 'No comments'}`
    });
    this.showActionModal = false;
    this.showToast(`${this.pendingAction === 'Approved' ? '✅ Approved' : '❌ Rejected'}: ${this.selectedSignoff.documentName}`);
  }

  // --- Stats ---
  getPendingCount()  { return this.signoffRequests.filter(s => s.status === 'Pending').length; }
  getApprovedCount() { return this.signoffRequests.filter(s => s.status === 'Approved').length; }
  getRejectedCount() { return this.signoffRequests.filter(s => s.status === 'Rejected').length; }
  getAttachedCount() { return this.gov.projects.filter(p => p.hasAttachment).length; }

  // --- Audit ---
  getAuditIcon(action: string): string {
    const map: Record<string, string> = { CREATE: '➕', UPDATE: '✏️', DELETE: '🗑️', UPLOAD: '📤', SYSTEM: '⚙️' };
    return map[action] || '📋';
  }

  viewDoc(url: string | undefined) {
    if (url) this.showToast(`📄 Opening: ${url}`);
  }

  showToast(msg: string) {
    this.toastMessage = msg;
    this.toastVisible = true;
    setTimeout(() => this.toastVisible = false, 3000);
  }
}
