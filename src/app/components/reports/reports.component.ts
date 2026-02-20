import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ComplianceFactor {
  category: string;
  score: number;
  status: 'Pass' | 'Action Required' | 'Critical';
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="reports-container">
      <div class="report-header">
        <div>
          <h1 class="page-title">Executive Governance Report</h1>
          <p class="subtitle">Portfolio Performance & Audit Compliance</p>
        </div>
        <div class="header-actions">
          <button class="btn-secondary" (click)="window.print()">📥 Download PDF Report</button>
        </div>
      </div>

      <div class="score-grid">
        <div class="card score-card main-score">
          <span class="label">Compliance Score</span>
          <div class="big-value">92%</div>
          <div class="progress-track"><div class="progress-fill" style="width: 92%"></div></div>
          <span class="foot">Global Audit Standard: 85%</span>
        </div>
        
        <div class="card score-card" *ngFor="let factor of complianceFactors">
          <span class="label">{{ factor.category }}</span>
          <div class="score-row">
            <span class="value">{{ factor.score }}%</span>
            <span class="badge" [ngClass]="factor.status.toLowerCase().replace(' ', '-')">
              {{ factor.status }}
            </span>
          </div>
        </div>
      </div>

      <div class="detailed-analysis">
        <div class="card insight-card">
          <h3>Workload Governance</h3>
          <p class="analysis-text">
            <strong>Critical Alert:</strong> 1 PM (Alice M.) is currently managing 5 projects, exceeding the 
            recommended champion threshold of 4. This increases delivery risk by 25%.
          </p>
          <div class="mini-bar" *ngFor="let load of resourceLoads">
            <div class="bar-info">
              <span>{{ load.name }}</span>
              <span>{{ load.count }} / 4 Projects</span>
            </div>
            <div class="bar-bg">
              <div class="bar-fill" [style.width.%]="(load.count / 4) * 100" [class.danger]="load.count > 4"></div>
            </div>
          </div>
        </div>

        <div class="card insight-card">
          <h3>Financial Variance Analysis</h3>
          <p class="analysis-text">
            Total Portfolio Burn Rate is currently <strong>KES 184,000 / week</strong>. 
            Estimated budget depletion for unassigned projects is scheduled for Q3 2026.
          </p>
          <table class="report-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Planned</th>
                <th>Actual</th>
                <th>Variance</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Infrastructure</td>
                <td>KES 2.5M</td>
                <td>KES 2.1M</td>
                <td class="text-green">+16%</td>
              </tr>
              <tr>
                <td>Ops / Migration</td>
                <td>KES 1.7M</td>
                <td>KES 1.9M</td>
                <td class="text-red">-11.7%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .reports-container { padding: 30px; background: #f8fafc; min-height: 100vh; font-family: 'Inter', sans-serif; }
    .page-title { font-family: 'Georgia', serif; font-size: 28px; font-weight: 700; color: #0f172a; }
    .subtitle { color: #64748b; margin-bottom: 30px; }
    
    .score-grid { display: grid; grid-template-columns: 1.5fr 1fr 1fr; gap: 20px; margin-bottom: 30px; }
    .score-card { padding: 24px; background: white; border: 1px solid #e2e8f0; border-radius: 12px; }
    .main-score { background: #0f172a; color: white; border: none; }
    .main-score .label { color: #94a3b8; }
    .big-value { font-size: 48px; font-weight: 800; margin: 10px 0; }
    
    .score-row { display: flex; justify-content: space-between; align-items: center; margin-top: 15px; }
    .score-row .value { font-size: 24px; font-weight: 700; color: #0f172a; }
    
    .badge { padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; }
    .badge.pass { background: #dcfce7; color: #166534; }
    .badge.action-required { background: #fef9c3; color: #854d0e; }
    .badge.critical { background: #fee2e2; color: #991b1b; }

    .detailed-analysis { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    .insight-card { background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; }
    .analysis-text { font-size: 14px; color: #475569; line-height: 1.6; margin: 15px 0 25px; }
    
    .mini-bar { margin-bottom: 15px; }
    .bar-info { display: flex; justify-content: space-between; font-size: 12px; font-weight: 600; margin-bottom: 6px; }
    .bar-bg { height: 8px; background: #f1f5f9; border-radius: 10px; overflow: hidden; }
    .bar-fill { height: 100%; background: #0f172a; transition: width 0.5s; }
    .bar-fill.danger { background: #ef4444; }

    .report-table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .report-table th { text-align: left; padding-bottom: 12px; border-bottom: 1px solid #e2e8f0; color: #94a3b8; }
    .report-table td { padding: 12px 0; border-bottom: 1px solid #f8fafc; }
    .text-red { color: #ef4444; font-weight: 700; }
    .text-green { color: #22c55e; font-weight: 700; }

    @media print { .header-actions { display: none; } }
  `]
})
export class ReportsComponent implements OnInit {
  window = window;

  complianceFactors: ComplianceFactor[] = [
    { category: 'Data Integrity', score: 98, status: 'Pass' },
    { category: 'Resource Allocation', score: 74, status: 'Action Required' }
  ];

  resourceLoads = [
    { name: 'Alice M.', count: 5 },
    { name: 'James K.', count: 2 },
    { name: 'Sarah T.', count: 1 }
  ];

  ngOnInit() {}
}
