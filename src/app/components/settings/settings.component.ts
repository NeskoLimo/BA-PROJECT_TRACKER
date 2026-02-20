import { Component } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { GovernanceService, AuditEntry } from '../../services/governance.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, DatePipe],
  template: `
    <div class="mck-container">
      <div class="header">
        <span class="eyebrow">System Administration</span>
        <h1>Settings & Audit Governance</h1>
      </div>

      <div class="settings-grid">
        <div class="mck-card">
          <h3>User Permissions</h3>
          <div class="user-profile">
            <div class="avatar">HOD</div>
            <div class="profile-info">
              <span class="u-name">{{ gov.currentUser.name }}</span>
              <span class="u-role">Role: {{ gov.currentUser.role }}</span>
            </div>
          </div>
          <ul class="perm-list">
            <li [class.active]="gov.canEdit()">✅ Can Edit Workstreams</li>
            <li [class.active]="gov.canDelete()">✅ Can Delete Registry Entries</li>
            <li [class.active]="gov.isAdmin()">✅ Access to Mass Upload Tools</li>
          </ul>
        </div>

        <div class="mck-card">
          <h3>Active Policy Enforcement</h3>
          <div class="policy-item">
            <span class="p-label">Max File Size</span>
            <span class="p-value">{{ gov.MAX_FILE_SIZE_MB }}MB</span>
          </div>
          <div class="policy-item">
            <span class="p-label">Allowed Formats</span>
            <span class="p-value">PDF, DOC, DOCX</span>
          </div>
          <div class="policy-item">
            <span class="p-label">Phase-Gate Lock</span>
            <span class="p-value status-on">Enabled</span>
          </div>
        </div>
      </div>

      <div class="mck-card audit-section">
        <div class="section-header">
          <h3>Governance Audit Trail</h3>
          <button class="btn-export" (click)="exportLog()">Export CSV</button>
        </div>
        <div class="log-container">
          <table class="audit-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Action</th>
                <th>Operator</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let log of gov.auditLog">
                <td class="time-cell">{{ log.time | date:'HH:mm:ss' }}</td>
                <td><span class="action-tag" [ngClass]="log.action.toLowerCase()">{{ log.action }}</span></td>
                <td class="user-cell">{{ log.user }}</td>
                <td class="detail-cell">{{ log.details }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .mck-container { padding: 40px; background: #f5f7f9; min-height: 100vh; font-family: 'Inter', sans-serif; }
    .eyebrow { color: #007DFE; font-weight: 800; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; }
    
    .settings-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 25px; margin: 30px 0; }
    .mck-card { background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 25px; }
    
    .user-profile { display: flex; align-items: center; gap: 15px; padding-bottom: 20px; border-bottom: 1px solid #f1f5f9; }
    .avatar { width: 45px; height: 45px; background: #001E3C; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; }
    .u-name { display: block; font-weight: 700; color: #001E3C; }
    .u-role { font-size: 12px; color: #94a3b8; }

    .perm-list { list-style: none; padding: 0; margin-top: 15px; }
    .perm-list li { padding: 8px 0; font-size: 13px; color: #cbd5e1; }
    .perm-list li.active { color: #1e293b; font-weight: 600; }

    .policy-item { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
    .status-on { color: #10b981; font-weight: 800; }

    /* Audit Table Styles */
    .audit-section { margin-top: 20px; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .btn-export { background: #f8fafc; border: 1px solid #e2e8f0; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 600; }
    
    .audit-table { width: 100%; border-collapse: collapse; }
    .audit-table th { text-align: left; font-size: 11px; color: #94a3b8; text-transform: uppercase; padding-bottom: 15px; }
    .audit-table td { padding: 12px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
    
    .time-cell { font-family: monospace; color: #64748b; width: 100px; }
    .action-tag { padding: 3px 8px; border-radius: 4px; font-size: 10px; font-weight: 800; }
    .system { background: #e0f2fe; color: #0369a1; }
    .delete { background: #fef2f2; color: #ef4444; }
    .upload { background: #ecfdf5; color: #059669; }
  `]
})
export class SettingsComponent {
  constructor(public gov: GovernanceService) {}

  exportLog() {
    alert('Generating Audit CSV for HOD Review...');
  }
}
