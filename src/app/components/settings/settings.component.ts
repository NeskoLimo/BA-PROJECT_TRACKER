import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GovernanceService } from '../../services/governance.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mck-container">
      <div class="mck-hero"><h1>Governance Control Panel</h1></div>
      <div class="mck-card">
        <h3>System Audit Trail</h3>
        <div *ngFor="let log of gov.auditLog" class="log-entry">
          <span class="time">{{log.time | date:'HH:mm:ss'}}</span>
          <span class="action">[{{log.action}}]</span>
          <span class="detail">{{log.details}}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`.log-entry { font-family: monospace; padding: 12px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
    .action { color: #007DFE; font-weight: 700; margin: 0 10px; } .time { color: #64748b; }`]
})
export class SettingsComponent {
  constructor(public gov: GovernanceService) {}
}
