import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GovernanceService } from '../../services/governance.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="reports-container fade-in">
      <div class="header">
        <h1>Global Financial Reports</h1>
        <p>Real-time data aggregation from the Master Registry.</p>
      </div>

      <div class="stats-grid">
        <div class="stat-card" *ngFor="let region of reportSummary">
          <label>{{ region.name }} Portfolio</label>
          <div class="value">{{ region.currency }} {{ region.totalBudget | number }}</div>
          <div class="status-indicator">Active Pipeline</div>
        </div>
      </div>

      <div class="audit-link-card" *ngIf="gov.isAdmin()">
        <p>As an <strong>Administrator</strong>, you can verify these figures against the <span class="link">Audit Trail</span>.</p>
      </div>
    </div>
  `,
  styles: [`
    .reports-container { padding: 40px; background: #f8fafc; min-height: 100vh; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; margin-top: 30px; }
    .stat-card { background: white; padding: 24px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
    .stat-card label { font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 700; }
    .stat-card .value { font-size: 28px; font-weight: 800; color: #0f172a; margin: 10px 0; }
    .audit-link-card { margin-top: 40px; padding: 15px; background: #eff6ff; border-radius: 8px; color: #1e40af; font-size: 14px; }
    .fade-in { animation: fadeIn 0.5s ease-in; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  `]
})
export class ReportsComponent {
  // Mock data representing aggregated logic from the Projects module
  reportSummary = [
    { name: 'Kenya', currency: 'KES', totalBudget: 5000000 },
    { name: 'Uganda', currency: 'UGX', totalBudget: 1200000 }
  ];

  // FIX: Explicitly typed constructor to prevent TS-992003 error
  constructor(public gov: GovernanceService) {} 
}
