import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-wrapper">
      <div class="analytics-header">
        <h1>Portfolio Analytics Hub</h1>
        <span class="refresh-tag">Last System Sync: Just Now</span>
      </div>

      <div class="analytics-grid">
        <div class="card analytic-card">
          <div class="card-title">Budget Burn Rate</div>
          <div class="burn-value">KES 1.2M <small>/ month</small></div>
          <div class="burn-trend down">▼ 4% from last month</div>
        </div>

        <div class="card analytic-card">
          <div class="card-title">Doc Compliance</div>
          <div class="burn-value">88%</div>
          <div class="burn-trend up">▲ 12% improvements</div>
        </div>
      </div>

      <div class="card table-card">
        <h3>High-Risk Project Monitoring</h3>
        <table class="analytic-table">
          <thead>
            <tr>
              <th>Project</th>
              <th>Status</th>
              <th>Burn</th>
              <th>Last Modified</th>
              <th>Risk</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of highRiskProjects">
              <td><strong>{{ p.name }}</strong></td>
              <td><span class="status-pill">{{ p.status }}</span></td>
              <td>
                <div class="mini-burn-bar">
                  <div class="fill" [style.width.%]="(p.spent/p.budget)*100"></div>
                </div>
              </td>
              <td class="date-col">{{ p.lastModified | date:'mediumDate' }}</td>
              <td>
                <span class="risk-indicator" [class.high]="p.risk === 'High'">
                  {{ p.risk }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-wrapper { padding: 30px; background: #f8fafc; }
    .analytics-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 25px; }
    .card { background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; }
    .burn-value { font-size: 28px; font-weight: 800; color: #0f172a; margin: 10px 0; }
    .burn-trend { font-size: 12px; font-weight: 700; }
    .burn-trend.up { color: #22c55e; }
    .burn-trend.down { color: #ef4444; }
    
    .analytic-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
    .analytic-table th { text-align: left; font-size: 11px; color: #64748b; text-transform: uppercase; padding: 10px; border-bottom: 2px solid #f1f5f9; }
    .analytic-table td { padding: 12px 10px; border-bottom: 1px solid #f8fafc; font-size: 13px; }
    
    .mini-burn-bar { width: 60px; height: 6px; background: #f1f5f9; border-radius: 10px; }
    .mini-burn-bar .fill { height: 100%; background: #0f172a; border-radius: 10px; }
    
    .risk-indicator { font-weight: 700; font-size: 11px; padding: 2px 8px; border-radius: 4px; background: #f1f5f9; }
    .risk-indicator.high { background: #fee2e2; color: #991b1b; }
    .date-col { color: #64748b; font-family: monospace; }
  `]
})
export class DashboardComponent implements OnInit {
  // Explicit properties to prevent build errors
  highRiskProjects = [
    { name: 'Cloud Migration', status: 'Active', budget: 1200000, spent: 1100000, lastModified: '2026-02-18', risk: 'High' },
    { name: 'ERP Sync', status: 'Active', budget: 500000, spent: 200000, lastModified: '2026-02-20', risk: 'Low' },
    { name: 'Warehouse Ops', status: 'Stalled', budget: 300000, spent: 50000, lastModified: '2026-01-10', risk: 'Medium' }
  ];

  ngOnInit() {}
}
