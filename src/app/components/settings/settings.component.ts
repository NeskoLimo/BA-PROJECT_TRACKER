import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GovernanceService, MasterPM } from '../../services/governance.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="mck-container" *ngIf="gov.isAdmin()">
      <div class="mck-header">
        <span class="eyebrow">Governance & Control</span>
        <h1>Master Data Management</h1>
      </div>

      <div class="settings-layout">
        <div class="mck-card">
          <h3>PM Performance Registry</h3>
          <div *ngFor="let pm of gov.masterPMs" class="edit-row">
            <div class="pm-meta">
              <strong>{{ pm.name }}</strong>
              <span>{{ pm.department }}</span>
            </div>
            <div class="pm-input">
              <input type="range" min="0" max="100" [(ngModel)]="pm.rate" (change)="gov.updatePMRate(pm.name, pm.rate)">
              <span class="rate-label">{{ pm.rate }}%</span>
            </div>
          </div>
        </div>

        <div class="mck-card">
          <h3>System Audit Trail</h3>
          <div class="log-box">
            <div *ngFor="let log of gov.auditLog" class="log-line">
              <span class="log-time">{{ log.timestamp | date:'HH:mm:ss' }}</span>
              <span class="log-action">[{{ log.action }}]</span>
              <span class="log-detail">{{ log.details }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .mck-container { padding: 40px; background: #F5F7F9; min-height: 100vh; font-family: sans-serif; }
    .mck-header { background: #001E3C; color: #FFFFFF; padding: 40px; border-radius: 4px; margin-bottom: 30px; border-bottom: 4px solid #007DFE; }
    .eyebrow { font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #007DFE; font-weight: 700; }
    .mck-header h1 { margin: 10px 0 0; font-size: 28px; font-weight: 300; }
    .settings-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
    .mck-card { background: #FFFFFF; padding: 30px; border-radius: 4px; border: 1px solid #E2E8F0; }
    .mck-card h3 { color: #001E3C; font-size: 16px; margin-bottom: 20px; border-bottom: 1px solid #F1F5F9; padding-bottom: 10px; }
    .edit-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #F1F5F9; }
    .pm-meta strong { display: block; color: #001E3C; }
    .pm-meta span { font-size: 12px; color: #64748B; }
    .pm-input { display: flex; align-items: center; gap: 10px; }
    .rate-label { font-weight: 700; color: #007DFE; min-width: 40px; }
    .log-box { height: 250px; overflow-y: auto; font-family: monospace; font-size: 12px; background: #F8FAFC; padding: 10px; }
    .log-line { padding: 5px 0; border-bottom: 1px solid #E2E8F0; }
    .log-time { color: #64748B; margin-right: 8px; }
    .log-action { color: #007DFE; font-weight: 700; margin-right: 8px; }
    input[type=range] { accent-color: #007DFE; }
  `]
})
export class SettingsComponent {
  constructor(public gov: GovernanceService) {}
}
