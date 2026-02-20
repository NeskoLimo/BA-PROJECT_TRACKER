import { Component } from '@angular/core';
import { GovernanceService } from '../../services/governance.service';

@Component({
  selector: 'app-reports',
  template: `
    <div class="reports-page">
      <div class="report-header">
        <h2>Global Financial Summary</h2>
        <button *ngIf="gov.canAction('EXPORT_REPORTS')" class="btn-primary">💾 Export PDF</button>
      </div>

      <div class="summary-grid">
        <div class="stat-card" *ngFor="let region of reportData">
          <label>{{ region.name }}</label>
          <div class="value">{{ region.currency }} {{ region.totalSpent | number }}</div>
          <div class="sub">Total Allocated: {{ region.totalBudget | number }}</div>
        </div>
      </div>

      <div class="risk-report">
        <h3>Critical At-Risk Projects</h3>
        <p>Filtered by 90% budget burn rate threshold</p>
        </div>
    </div>
  `
})
export class ReportsComponent {
  constructor(public gov: GovernanceService) {}

  // Real-world logic would calculate this from the Projects list
  reportData = [
    { name: 'Kenya', currency: 'KES', totalSpent: 1712000, totalBudget: 2050000 },
    { name: 'Uganda', currency: 'UGX', totalSpent: 0, totalBudget: 1200000 }
  ];
}
