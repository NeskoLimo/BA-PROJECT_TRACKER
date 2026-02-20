import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

// Champion Interface for PM Counts
interface PMCountMap {
  [key: string]: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <h1 class="page-title">Operational Oversight</h1>
      
      <div class="stats-grid">
        <div class="card stat-card border-red">
          <span class="label">Ownership Gap</span>
          <span class="value text-red">{{ unassignedCount }}</span>
          <span class="trend">Unassigned Projects</span>
        </div>
        <div class="card stat-card">
          <span class="label">Portfolio Budget</span>
          <span class="value">KES 4.2M</span>
          <span class="trend">Total Spent to Date</span>
        </div>
      </div>

      <div class="charts-row">
        <div class="card chart-card">
          <h3>Portfolio Assignment Status</h3>
          <div class="pie-layout">
            <div class="mock-pie" [style.background]="getPieGradient()"></div>
            <div class="legend">
              <div class="legend-item"><span class="dot assigned"></span> Assigned ({{ assignedCount }})</div>
              <div class="legend-item"><span class="dot unassigned"></span> Unassigned ({{ unassignedCount }})</div>
            </div>
          </div>
        </div>

        <div class="card chart-card">
          <h3>Resource Load Distribution</h3>
          <div class="bar-chart">
            <div *ngFor="let pm of pmWorkload" class="bar-row">
              <span class="pm-label">{{ pm.name }}</span>
              <div class="bar-outer">
                <div class="bar-inner" 
                     [style.width.%]="(pm.count / 5) * 100"
                     [class.overloaded]="pm.count >= 4"></div>
                <span class="bar-count">{{ pm.count }}</span>
              </div>
            </div>
          </div>
          <p class="chart-footer">⚠️ Red alert indicates overloaded PMs (>4 projects)</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container { padding: 30px; background: #f8fafc; min-height: 100vh; font-family: 'Inter', sans-serif; }
    .page-title { font-family: 'Georgia', serif; font-size: 28px; font-weight: 700; color: #0f172a; margin-bottom: 30px; }
    
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
    .stat-card { padding: 20px; background: white; border: 1px solid #e2e8f0; border-radius: 12px; }
    .border-red { border-left: 5px solid #ef4444; }
    .stat-card .label { font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
    .stat-card .value { font-size: 32px; font-weight: 800; color: #0f172a; display: block; margin: 8px 0; }
    .text-red { color: #ef4444; }
    .trend { font-size: 12px; color: #94a3b8; }

    .charts-row { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    .chart-card { background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; }
    .chart-card h3 { font-family: 'Georgia', serif; font-size: 18px; margin-bottom: 20px; color: #0f172a; }

    .pie-layout { display: flex; align-items: center; gap: 30px; }
    .mock-pie { width: 140px; height: 140px; border-radius: 50%; border: 4px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.05); transition: transform 0.3s; }
    .mock-pie:hover { transform: scale(1.05); }
    .legend-item { font-size: 13px; color: #475569; margin-bottom: 8px; display: flex; align-items: center; }
    .dot { width: 10px; height: 10px; border-radius: 50%; margin-right: 10px; }
    .dot.assigned { background: #0f172a; }
    .dot.unassigned { background: #ef4444; }

    .bar-row { display: flex; align-items: center; margin-bottom: 15px; gap: 12px; }
    .pm-label { width: 90px; font-size: 12px; font-weight: 600; color: #64748b; text-overflow: ellipsis; overflow: hidden; white-space: nowrap; }
    .bar-outer { flex-grow: 1; height: 24px; background: #f1f5f9; border-radius: 6px; position: relative; overflow: hidden; }
    .bar-inner { height: 100%; background: #0f172a; border-radius: 6px; transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1); }
    .bar-inner.overloaded { background: #ef4444; }
    .bar-count { position: absolute; right: 10px; top: 4px; font-size: 11px; font-weight: 800; color: #475569; }
    .chart-footer { font-size: 11px; color: #94a3b8; margin-top: 15px; font-style: italic; }
  `]
})
export class DashboardComponent implements OnInit {
  // Champion Mock Data
  allProjects = [
    { name: 'ERP Sync', pm: 'Alice M.' },
    { name: 'API Gateway', pm: 'Alice M.' },
    { name: 'Legacy Import', pm: 'Alice M.' },
    { name: 'Cloud Migration', pm: 'Alice M.' },
    { name: 'Security Audit', pm: 'Alice M.' }, // Overloaded
    { name: 'Mobile App', pm: 'James K.' },
    { name: 'Warehouse expansion', pm: 'Unassigned' },
    { name: 'Audit Preparation', pm: 'Unassigned' }
  ];

  assignedCount = 0;
  unassignedCount = 0;
  pmWorkload: { name: string, count: number }[] = [];

  ngOnInit() {
    this.calculateChampionMetrics();
  }

  calculateChampionMetrics() {
    this.assignedCount = this.allProjects.filter(p => p.pm !== 'Unassigned').length;
    this.unassignedCount = this.allProjects.filter(p => p.pm === 'Unassigned').length;

    // Fixed TS7053: Using a typed map for accumulation
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

  getPieGradient() {
    const total = this.allProjects.length;
    const assignedPer = (this.assignedCount / total) * 360;
    return `conic-gradient(#0f172a 0deg ${assignedPer}deg, #ef4444 ${assignedPer}deg 360deg)`;
  }
}
