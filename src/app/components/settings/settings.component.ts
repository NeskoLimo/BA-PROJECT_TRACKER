import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GovernanceService, MasterRegion } from '../../services/governance.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="settings-container fade-in">
      <aside class="settings-sidebar">
        <div class="user-profile">
          <div class="avatar-circle">{{ gov.currentUser.name.substring(0,2) }}</div>
          <div class="user-details">
            <span class="u-name">{{ gov.currentUser.name }}</span>
            <span class="u-role">{{ gov.currentUser.role }}</span>
          </div>
        </div>

        <nav class="nav-menu">
          <button (click)="activeTab = 'profile'" [class.active]="activeTab === 'profile'">
            <span class="icon">👤</span> Personal Profile
          </button>
          <button (click)="activeTab = 'support'" [class.active]="activeTab === 'support'">
            <span class="icon">🛠️</span> Support Center
          </button>
          
          <ng-container *ngIf="gov.isAdmin()">
            <div class="nav-divider">GOVERNANCE</div>
            <button (click)="activeTab = 'governance'" [class.active]="activeTab === 'governance'" class="admin-link">
              <span class="icon">🛡️</span> Master Data
            </button>
            <button (click)="activeTab = 'audit'" [class.active]="activeTab === 'audit'" class="admin-link">
              <span class="icon">📜</span> Audit Trail
            </button>
          </ng-container>
        </nav>
      </aside>

      <main class="settings-content">
        
        <section *ngIf="activeTab === 'profile'" class="slide-up">
          <div class="content-header">
            <h2>Account Settings</h2>
            <p>Identity management and localization preferences.</p>
          </div>
          <div class="card shadow-sm">
            <div class="form-grid">
              <div class="field"><label>Username</label><input type="text" [value]="gov.currentUser.name" readonly></div>
              <div class="field"><label>Primary Role</label><input type="text" [value]="gov.currentUser.role" readonly></div>
            </div>
          </div>
        </section>

        <section *ngIf="activeTab === 'support'" class="slide-up">
          <div class="content-header">
            <h2>Support Center</h2>
            <p>Request data corrections or technical assistance from Administrators.</p>
          </div>
          
          <div class="support-split">
            <div class="card" *ngIf="!gov.isAdmin()">
              <h3>New Support Request</h3>
              <div class="field">
                <label>Issue Category</label>
                <select [(ngModel)]="ticketForm.category">
                  <option>Access Denied</option>
                  <option>Data Correction</option>
                  <option>Feature Request</option>
                </select>
              </div>
              <div class="field">
                <label>Description</label>
                <textarea [(ngModel)]="ticketForm.message" placeholder="Describe the registry change required..."></textarea>
              </div>
              <button class="btn-primary" (click)="submitSupport()">Submit Ticket</button>
            </div>

            <div class="admin-inbox" *ngIf="gov.isAdmin()">
              <h3>Pending Tickets ({{ gov.supportTickets.length }})</h3>
              <div class="ticket-item" *ngFor="let t of gov.supportTickets">
                <div class="t-top"><strong>{{ t.user }}</strong> <span class="badge">{{ t.category }}</span></div>
                <p>{{ t.message }}</p>
                <small>{{ t.timestamp | date:'shortTime' }}</small>
              </div>
            </div>
          </div>
        </section>

        <section *ngIf="activeTab === 'governance' && gov.isAdmin()" class="slide-up">
          <div class="content-header">
            <h2>Global Registry Governance</h2>
            <p>Manage high-level country and currency data with dependency protection.</p>
          </div>
          <div class="card no-padding overflow-hidden">
            <table class="gov-table">
              <thead>
                <tr><th>Code</th><th>Region</th><th>Currency</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                <tr *ngFor="let r of gov.masterRegions" [class.inactive-row]="r.status === 'Inactive'">
                  <td class="mono">{{ r.code }}</td>
                  <td><strong>{{ r.name }}</strong></td>
                  <td>{{ r.currency }}</td>
                  <td>
                    <span class="status-pill" [attr.data-status]="r.status">{{ r.status }}</span>
                  </td>
                  <td>
                    <div class="action-row">
                      <button class="btn-sm" (click)="toggleReg(r)">Toggle Status</button>
                      <button class="btn-sm danger" [disabled]="r.projectCount > 0" (click)="deleteReg(r.code)">Hard Delete</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section *ngIf="activeTab === 'audit' && gov.isAdmin()" class="slide-up">
          <div class="content-header">
            <h2>System Audit Trail</h2>
            <p>Immutable history of Administrator actions and registry changes.</p>
          </div>
          <div class="card no-padding overflow-hidden">
            <table class="audit-table">
              <thead>
                <tr><th>Timestamp</th><th>Admin</th><th>Action</th><th>Target Entity</th><th>Details</th></tr>
              </thead>
              <tbody>
                <tr *ngFor="let log of gov.auditLog">
                  <td class="time-col">
                    <span class="d">{{ log.timestamp | date:'dd MMM' }}</span>
                    <span class="t">{{ log.timestamp | date:'HH:mm:ss' }}</span>
                  </td>
                  <td><strong>{{ log.user }}</strong></td>
                  <td><span class="action-tag" [attr.data-a]="log.action">{{ log.action }}</span></td>
                  <td>{{ log.target }}</td>
                  <td class="details-col"><em>{{ log.details }}</em></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

      </main>
    </div>
  `,
  styles: [`
    .settings-container { display: flex; height: 92vh; background: #fcfcfd; font-family: 'Inter', sans-serif; }
    
    /* SIDEBAR STYLES */
    .settings-sidebar { width: 300px; background: #0f172a; color: white; padding: 24px; display: flex; flex-direction: column; }
    .user-profile { display: flex; align-items: center; gap: 15px; margin-bottom: 40px; }
    .avatar-circle { width: 44px; height: 44px; background: #3b82f6; border-radius: 50%; display: grid; place-items: center; font-weight: 700; }
    .u-name { display: block; font-weight: 600; font-size: 15px; }
    .u-role { font-size: 11px; color: #94a3b8; }

    .nav-menu { display: flex; flex-direction: column; gap: 6px; }
    .nav-menu button { border: none; background: none; color: #94a3b8; text-align: left; padding: 12px 16px; cursor: pointer; border-radius: 8px; font-size: 14px; display: flex; align-items: center; gap: 10px; transition: 0.2s; }
    .nav-menu button:hover { background: #1e293b; color: white; }
    .nav-menu button.active { background: #3b82f6; color: white; }
    .nav-divider { font-size: 10px; font-weight: 800; color: #475569; margin: 20px 0 10px 16px; letter-spacing: 1px; }
    .admin-link { color: #fca5a5 !important; }

    /* CONTENT STYLES */
    .settings-content { flex: 1; padding: 40px; overflow-y: auto; }
    .content-header h2 { font-family: 'Georgia', serif; font-size: 26px; color: #0f172a; margin: 0; }
    .content-header p { color: #64748b; font-size: 14px; margin: 8px 0 32px 0; }
    
    .card { background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; }
    .no-padding { padding: 0; }
    .overflow-hidden { overflow: hidden; }

    /* TABLES */
    .gov-table, .audit-table { width: 100%; border-collapse: collapse; }
    .gov-table th, .audit-table th { background: #f8fafc; text-align: left; padding: 14px 20px; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; }
    .gov-table td, .audit-table td { padding: 16px 20px; border-bottom: 1px solid #f1f5f9; font-size: 13px; }

    /* AUDIT SPECIFIC */
    .time-col { line-height: 1.2; width: 120px; }
    .time-col .d { display: block; font-weight: 700; }
    .time-col .t { font-size: 11px; color: #94a3b8; }
    .action-tag { padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: 800; }
    .action-tag[data-a="STATUS_CHANGE"] { background: #fef9c3; color: #854d0e; }
    .action-tag[data-a="DELETE"] { background: #fee2e2; color: #991b1b; }
    .details-col { color: #64748b; font-style: italic; }

    /* UTILS */
    .status-pill { padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 700; }
    .status-pill[data-status="Active"] { background: #dcfce7; color: #166534; }
    .status-pill[data-status="Inactive"] { background: #f1f5f9; color: #64748b; }
    .btn-sm { padding: 6px 12px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 12px; cursor: pointer; background: white; }
    .btn-sm.danger:hover { background: #fee2e2; border-color: #ef4444; color: #991b1b; }
    .btn-primary { background: #3b82f6; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; }

    .fade-in { animation: fadeIn 0.4s ease-out; }
    .slide-up { animation: slideUp 0.3s ease-out; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class SettingsComponent implements OnInit {
  activeTab = 'profile';
  ticketForm = { category: 'Access Denied', message: '' };

  constructor(public gov: GovernanceService) {} // Injection token properly typed

  ngOnInit() {}

  toggleReg(r: MasterRegion) {
    const success = this.gov.toggleStatus(r);
    if (!success) alert('Cannot deactivate: Region has active project dependencies.');
  }

  deleteReg(code: string) {
    if (confirm('PERMANENT ACTION: Purge this region from the Global Registry?')) {
      const success = this.gov.hardDeleteRegion(code);
      if (!success) alert('Deletion blocked by data integrity rules.');
    }
  }

  submitSupport() {
    if (this.ticketForm.message) {
      this.gov.submitTicket(this.ticketForm.category, this.ticketForm.message);
      this.ticketForm.message = '';
      alert('Ticket submitted to Administrator.');
    }
  }
}
