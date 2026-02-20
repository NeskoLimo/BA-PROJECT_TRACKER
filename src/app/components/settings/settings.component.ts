import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GovernanceService } from '../../services/governance.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="settings-wrapper" *ngIf="gov.isAdmin()">
      <div class="header-section">
        <h1>🛡️ Master Data Management</h1>
        <p>Control the single source of truth for the BA Project Tracker.</p>
      </div>

      <div class="mdm-grid">
        <div class="mdm-card">
          <h3>PM Performance Registry</h3>
          <div *ngFor="let pm of gov.masterPMs" class="pm-edit-row">
            <span>{{ pm.name }}</span>
            <div class="slider-group">
              <input type="range" min="0" max="100" 
                     [(ngModel)]="pm.rate" 
                     (change)="gov.updatePMRate(pm.name, pm.rate)">
              <span class="rate-label">{{ pm.rate }}%</span>
            </div>
          </div>
        </div>

        <div class="mdm-card">
          <h3>Regional Master List</h3>
          <div class="registry-list">
            <div *ngFor="let r of gov.masterRegions" class="registry-item">
              <strong>{{ r.name }}</strong> <span>({{ r.currency }})</span>
            </div>
          </div>
        </div>
      </div>

      <div class="audit-card">
        <h3>System Audit Log</h3>
        <div class="log-container">
          <div *ngFor="let log of gov.auditLog" class="log-entry">
            <span class="log-time">{{ log.timestamp | date:'shortTime' }}</span>
            <span class="log-action">[{{ log.action }}]</span>
            <span class="log-details">{{ log.details }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .settings-wrapper { padding: 30px; font-family: sans-serif; background: #f4f7f9; min-height: 100vh; }
    .mdm-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px; }
    .mdm-card, .audit-card { background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
    .audit-card { margin-top: 20px; }
    .pm-edit-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #eee; }
    .slider-group { display: flex; align-items: center; gap: 10px; }
    .rate-label { font-weight: bold; min-width: 40px; }
    .log-entry { font-size: 13px; padding: 5px 0; color: #555; border-bottom: 1px solid #fafafa; }
    .log-action { font-weight: bold; color: #2563eb; margin: 0 10px; }
  `]
})
export class SettingsComponent {
  constructor(public gov: GovernanceService) {}
}
