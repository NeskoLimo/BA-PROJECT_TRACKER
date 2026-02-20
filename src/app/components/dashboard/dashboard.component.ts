import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

// To fix TS7053 build error
interface PMCountMap {
  [key: string]: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <div class="dashboard-header">
        <h1 class="page-title">Portfolio Analytics Hub</h1>
        <p class="subtitle">Real-time governance and resource oversight</p>
      </div>
      
      <div class="stats-grid">
        <div class="card stat-card burn">
          <span class="label">Budget Burn Rate</span>
          <span class="value">KES 1.2M <small>/mo</small></span>
          <span class="trend down">▼ 4% from last month</span>
        </div>
        <div class="card stat-card compliance">
          <span class="label">Doc Compliance</span>
          <span class="value">88%</span>
          <span class="trend up">▲ 12% improvement</span>
        </div>
        <div class="card stat-card gap">
          <span class="label">Ownership Gap</span>
          <span class="value text-red">{{ unassignedCount }}</span>
          <span class="trend">Unassigned Projects</span>
        </div>
      </div>

      <div class="charts-row">
        <div class="card chart-card">
          <h3>PM Capacity Saturation</h3>
          <div class="bar-chart">
            <div *ngFor="let pm of pmWorkload" class="bar-row">
              <span class="pm-label">{{ pm.name }}</span>
              <div class="bar-outer">
                <div class="bar-inner" 
                     [style.width.%]="(pm.count / 5) * 100"
                     [class.overloaded]="pm.count >= 4"></div>
              </div>
              <span class="bar-count">{{ pm.count }}</span>
            </div>
          </div>
          <p class="chart-footer">⚠️ Red indicates overload (>4 projects)</p>
        </div>

        <div class="card chart-card">
          <h3>High-Risk Monitoring</h3>
          <table class="risk-table">
            <thead>
              <tr><th>Project</th><th>Burn</th><th>Risk</th></tr>
            </thead>
            <tbody>
              <tr *ngFor="let p of highRiskProjects">
                <td>{{ p.name }}</td>
                <td><div class="mini-bar"><div class="fill" [style.width.%]="(p.spent/p.budget)*100"></div></div></td>
                <td><span class="risk-tag" [ngClass]="p.risk.toLowerCase()">{{ p.risk }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container { padding: 30px; background: #f8fafc; min-height: 100vh; }
    .page-title { font-family: 'Georgia', serif; font-size: 28px; font-weight: 700; color: #0f172a; margin: 0; }
    .subtitle { color: #64748b; margin-bottom: 30px; }
    
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin-bottom: 30px; }
    .stat-card { padding: 24px; background: white; border: 1px solid #e2e8f0; border-radius: 12px; }
    .stat-card .label { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; }
    .stat-card .value { font-size: 32px; font-weight: 800; display: block; margin: 10px 0; color: #0f172a; }
    .trend { font-size: 12px; font-weight: 600; }
    .trend.up { color: #22c55e; }
    .trend.down { color: #ef4444; }

    .charts-row { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    .chart-card { background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; }
    
    .bar-row { display: flex; align-items: center; margin-bottom: 15px; gap: 12px; }
    .pm-label { width: 80px; font-size: 12px; font-weight: 600; color: #475569; }
    .bar-outer { flex-grow: 1; height: 12px; background: #f1f5f9; border-radius: 10px; overflow: hidden; }
    .bar-inner { height: 100%; background: #0f172a; transition: width 0.8s; }
    .bar-inner.overloaded { background: #ef4444; }
    
    .risk-table { width: 100%; border-collapse: collapse; }
    .risk-table td { padding: 12px 0; border-bottom: 1px solid #f8fafc; font-size: 13px; }
    .mini-bar { width: 50px; height: 6px; background: #f1f5f9; border-radius: 10px; overflow: hidden; }
    .mini-bar .fill { height: 100%; background: #0f172a; }
    .risk-tag { font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 4px; }
    .risk-tag.high { background: #fee2e2; color: #991b1b; }
  `]
})
export class DashboardComponent implements OnInit {
  unassignedCount = 0;
  pmWorkload: { name: string, count: number }[] = [];
  
  allProjects = [
    { name: 'ERP Sync', pm: 'Alice M.', budget: 500000, spent: 450000 },
    { name: 'Cloud Migration', pm: 'Alice M.', budget: 1200000, spent: 600000 },
    { name: 'Warehouse Ops', pm: 'Unassigned', budget: 300000, spent: 0 },
    { name: 'Audit Prep', pm: 'Unassigned', budget: 150000, spent: 50000 }
  ];

  highRiskProjects = [
    { name: 'Cloud Migration', budget: 1200000, spent: 1100000, risk: 'High' },
    { name: 'ERP Sync', budget: 500000, spent: 200000, risk: 'Low' }
  ];

  ngOnInit() {
    this.calculateMetrics();
  }

  calculateMetrics() {
    this.unassignedCount = this.allProjects.filter(p => p.pm === 'Unassigned').length;

    // Fixed indexing logic to prevent TS7053
    const counts: PMCountMap = {};
    this.allProjects.forEach(p => {
      if (p.pm !== 'Unassigned') {
        counts[p.pm] = (counts[p.pm] || 0) + 1;
      }
    });

    this.pmWorkload = Object.keys(counts).map(name => ({
      name,
      count: counts[name]
    })).sort((a, b) => b.count - a.count);
  }
}
