import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GovernanceService } from '../../services/governance.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="settings-layout">
      <aside class="sidebar">
        <button (click)="tab='audit'" [class.active]="tab==='audit'">📜 Audit Trail</button>
        <button (click)="tab='profile'">👤 Profile</button>
      </aside>

      <main class="content">
        <section *ngIf="tab === 'audit'">
          <h2>System Audit Log</h2>
          <div class="log-container">
            <table class="audit-table">
              <thead>
                <tr><th>Timestamp</th><th>User</th><th>Action</th><th>Details</th></tr>
              </thead>
              <tbody>
                <tr *ngFor="let entry of gov.auditLog">
                  <td>{{ entry.timestamp | date:'short' }}</td>
                  <td><strong>{{ entry.user }}</strong></td>
                  <td><span class="badge">{{ entry.action }}</span></td>
                  <td>{{ entry.details }}</td>
                </tr>
              </tbody>
            </table>
            <p *ngIf="gov.auditLog.length === 0" class="empty">No logs recorded yet.</p>
          </div>
        </section>
      </main>
    </div>
  `,
  styles: [`
    .settings-layout { display: flex; gap: 20px; padding: 20px; }
    .sidebar { width: 200px; display: flex; flex-direction: column; gap: 10px; }
    .audit-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
    .audit-table th, .audit-table td { text-align: left; padding: 12px; border-bottom: 1px solid #eee; }
    .badge { background: #e2e8f0; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
  `]
})
export class SettingsComponent {
  tab = 'audit';
  // FIX: Using public gov: GovernanceService ensures the injection token is found
  constructor(public gov: GovernanceService) {} 
}
