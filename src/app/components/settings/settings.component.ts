import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GovernanceService } from '../../services/governance.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="mck-settings" *ngIf="gov.isAdmin()">
      <div class="mck-header">
        <span class="eyebrow">Governance Control</span>
        <h1>System Configuration</h1>
      </div>

      <div class="settings-grid">
        <div class="mck-card">
          <h3>PM Performance Tuning</h3>
          <div *ngFor="let pm of gov.masterPMs" class="edit-row">
            <div class="pm-info">
              <span class="name">{{ pm.name }}</span>
              <span class="dept">{{ pm.department }}</span>
            </div>
            <div class="controls">
              <input type="range" min="0" max="100" [(ngModel)]="pm.rate" (change)="gov.updatePMRate(pm.name, pm.rate)">
              <span class="val">{{ pm.rate }}%</span>
            </div>
          </div>
        </div>

        <div class="mck-card">
          <h3>Persistent Audit Trail</h3>
          <div class="log-container">
            <div *ngFor="let log of gov.auditLog" class="log-entry">
              <span class="time">{{ log.timestamp | date:'HH:mm:ss' }}</span>
              <span class="action">[{{ log.action }}]</span>
              <span class="details">{{ log.details }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .mck-settings { padding: 40px; background: #F5F7F9; min-height: 100vh; font-family: sans-serif; }
    .mck-header { background: #001E3C; color: #FFFFFF; padding: 40px; border-radius: 4px; margin-bottom: 30px; border-bottom: 4px solid #007DFE; }
    .eyebrow { font-size: 11px; text-transform: uppercase; color: #007DFE; font-weight: 700; letter-spacing: 1px; }
    .settings-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
    .mck-card { background: #FFFFFF; padding: 25px; border-radius: 4px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
    .mck-card h3 { color: #001E3C; font-size: 16px; margin-bottom: 20px; border-bottom: 1px solid #E2E8F0; padding-bottom: 10px; }
    .edit-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #F1F5F9; }
    .pm-info span { display: block; }
    .name { font-weight: 600; color: #001E3C; }
    .dept { font-size: 12px; color: #64748B; }
    .controls { display: flex; align-items: center; gap: 10px; }
    .val { font-weight: 700; color: #007DFE; min-width: 40px; }
    .log-container { height: 300px; overflow-y: auto; font-family: monospace; font-size: 12px; }
    .log-entry { padding: 8px; border-bottom: 1px solid #F1F5F9; color: #334155; }
    .time { color: #64748B; margin-right: 8px; }
    .action { font-weight: 700; color: #007DFE; margin-right: 8px; }
    input[type=range] { accent-color: #007DFE; }
  `]
})
export class SettingsComponent {
  constructor(public gov: GovernanceService) {}
}
