import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ReportSummary {
  metric: string;
  value: string | number;
  status: 'Good' | 'Warning' | 'Critical';
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="reports-wrapper">
      <div class="page-header">
        <div>
          <h1 class="page-title">Management Reporting</h1>
          <p class="page-subtitle">Governance summaries and audit-ready exports</p>
        </div>
        <button class="btn-export" (click)="exportToPDF()">
          <span class="icon">📄</span> Export Executive PDF
        </button>
      </div>

      <div class="summary-grid">
        <div class="card summary-card" *ngFor="let item of summaries">
          <div class="summary-meta">
            <span class="dot" [ngClass]="item.status.toLowerCase()"></span>
            <span class="status-label">{{ item.status }}</span>
          </div>
          <span class="summary-value">{{ item.value }}</span>
          <span class="summary-name">{{ item.metric }}</span>
        </div>
      </div>

      <div class="report-content">
        <div class="card insight-card">
          <div class="insight-header">
            <h3>Resource Capacity Analysis</h3>
            <span class="tag">Internal Load</span>
          </div>
          <p class="insight-text">
            Current portfolio shows <strong>{{ unassignedRate }}%</strong> of projects are unassigned. 
            Resource distribution indicates 1 PM is currently operating at <strong>Critical Capacity</strong> (>4 projects).
          </p>
          <div class="mini-bar-list">
            <div class="mini-bar-item" *ngFor="let pm of pmLoads">
              <span class="pm-name">{{ pm.name }}</span>
              <div class="progress-track">
                <div class="progress-fill" [style.width.%]="(pm.count / 5) * 100" [class.danger]="pm.count >= 4"></div>
              </div>
              <span class="pm-count">{{ pm.count }}/5</span>
            </div>
          </div>
        </div>

        <div class="card insight-card">
          <div class="insight-header">
            <h3>Workflow Bottleneck Report</h3>
            <span class="tag">Governance</span>
          </div>
          <p class="insight-text">
            There are currently <strong>8 documents</strong> pending signature in the Repository. 
            Average turnaround time for "Project Charters" has increased by 15% this month.
          </p>
          <table class="simple-table">
            <thead>
              <tr>
                <th>Signatory Role</th>
                <th>Pending Docs</th>
                <th>Avg. Days</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>COO / Executive</td><td>3</td><td>4.2 Days</td></tr>
              <tr><td>Finance / HOD</td><td>5</td><td>2.1 Days</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .reports-wrapper { padding: 30px; background: #f8fafc; min-height: 100vh; font-family: 'Inter', sans-serif; }
    .page-title { font-family: 'Georgia', serif; font-size: 28px; font-weight: 700; color: #0f172a; margin: 0; }
    .page-subtitle { color: #64748b; font-size: 14px; margin-top: 4px; }
    
    .btn-export { background: #0f172a; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 10px; }

    .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 30px 0; }
    .summary-card { background: white; border: 1px solid #e2e8f0; padding: 24px; border-radius: 12px; display: flex; flex-direction: column; }
    .summary-meta { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
    .dot { width: 8px; height: 8px; border-radius: 50%; }
    .dot.good { background: #22c55e; }
    .dot.warning { background: #f59e0b; }
    .dot.critical { background: #ef4444; }
    .status-label { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; }
    .summary-value { font-size: 32px; font-weight: 800; color: #0f172a; }
    .summary-name { font-size: 14px; color: #64748b; margin-top: 4px; }

    .report-content { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    .insight-card { background: white; border: 1px solid #e2e8f0; padding: 24px; border-radius: 12px; }
    .insight-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .insight-header h3 { font-family: 'Georgia', serif; font-size: 18px; color: #0f172a; margin: 0; }
    .tag { background: #f1f5f9; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; color: #475569; }
    .insight-text { font-size: 14px; color: #475569; line-height: 1.6; margin-bottom: 24px; }

    .mini-bar-list { display: flex; flex-direction: column; gap: 15px; }
    .mini-bar-item { display: grid; grid-template-columns: 100px 1fr 40px; align-items: center; gap: 15px; }
    .pm-name { font-size: 12px; font-weight: 600; color: #64748b; }
    .progress-track { height: 8px; background: #f1f5f9; border-radius: 10px; overflow: hidden; }
    .progress-fill { height: 100%; background: #0f172a; border-radius: 10px; }
    .progress-fill.danger { background: #ef4444; }
    .pm-count { font-size: 11px; font-weight: 700; color: #94a3b8; }

    .simple-table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .simple-table th { text-align: left; color: #94a3b8; font-weight: 600; padding-bottom: 10px; border-bottom: 1px solid #f1f5f9; }
    .simple-table td { padding: 12px 0; border-bottom: 1px solid #f8fafc; color: #475569; }
  `]
})
export class ReportsComponent {
  unassignedRate = 22;

  summaries: ReportSummary[] = [
    { metric: 'Portfolio Budget Health', value: 'KES 42.1M', status: 'Good' },
    { metric: 'Audit Compliance Score', value: '94%', status: 'Warning' },
    { metric: 'Pending Signatures', value: 8, status: 'Critical' }
  ];

  pmLoads = [
    { name: 'Alice M.', count: 5 },
    { name: 'James K.', count: 2 },
    { name: 'David O.', count: 1 }
  ];

  exportToPDF() {
    window.print(); // Quick browser-based PDF export
  }
}
