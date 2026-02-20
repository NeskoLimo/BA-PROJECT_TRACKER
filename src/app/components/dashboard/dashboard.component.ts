import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard">
      <div class="page-header">
        <div>
          <h1 class="page-title">Project Portfolio Overview</h1>
          <p class="page-subtitle">Strategic performance and financial health</p>
        </div>
        <div class="header-date">{{ today | date:'EEEE, MMMM d, y' }}</div>
      </div>

      <div class="stat-cards">
        <div class="stat-card">
          <div class="stat-icon blue">📋</div>
          <div class="stat-info">
            <div class="stat-value">{{ recentProjects.length }}</div>
            <div class="stat-label">Total Projects</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon green">🟢</div>
          <div class="stat-info">
            <div class="stat-value">{{ getCountByStatus('Active') }}</div>
            <div class="stat-label">Active</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon red">⚠️</div>
          <div class="stat-info">
            <div class="stat-value">{{ getCountByStatus('At Risk') }}</div>
            <div class="stat-label">At Risk</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon gold">💰</div>
          <div class="stat-info">
            <div class="stat-value">KES {{ totalBudgetBurn | number:'1.0-0' }}M</div>
            <div class="stat-label">Total Spend</div>
          </div>
        </div>
      </div>

      <div class="middle-row">
        <div class="card analytics-card">
          <div class="card-header">
            <h2 class="card-title">Status Distribution</h2>
          </div>
          <div class="analytics-content">
            <div class="pie-chart" [style.background]="pieChartGradient"></div>
            <div class="pie-legend">
              <div class="legend-item"><span class="dot active"></span> Active</div>
              <div class="legend-item"><span class="dot completed"></span> Completed</div>
              <div class="legend-item"><span class="dot risk"></span> At Risk</div>
            </div>
          </div>
        </div>

        <div class="card chart-card">
          <div class="card-header">
            <h2 class="card-title">Performance Index</h2>
            <span class="card-subtitle">PM Success Rate</span>
          </div>
          <div class="bar-chart">
            <div class="bar-row" *ngFor="let pm of pmSuccessRates">
              <div class="bar-label">{{ pm.name }}</div>
              <div class="bar-track">
                <div class="bar-fill" [style.width.%]="pm.rate" [style.background]="pm.color"></div>
              </div>
              <div class="bar-value">{{ pm.rate }}%</div>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h2 class="card-title">Recent Portfolio Activity</h2>
          <a routerLink="/projects" class="card-link">Detailed View →</a>
        </div>
        <table class="projects-table">
          <thead>
            <tr>
              <th>Project Name</th>
              <th>Manager</th>
              <th>Status</th>
              <th>Health</th>
              <th>Progress</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of recentProjects">
              <td class="project-name">{{ p.name }}</td>
              <td>{{ p.pm }}</td>
              <td><span class="status-badge" [ngClass]="getStatusClass(p.status)">{{ p.status }}</span></td>
              <td>
                 <span class="health-indicator" 
                       [class.healthy]="p.progress >= 50" 
                       [class.warning]="p.progress < 50 && p.progress > 20"
                       [class.danger]="p.progress <= 20">
                 </span>
              </td>
              <td>
                <div class="progress-container">
                  <div class="progress-mini-bar">
                    <div class="progress-fill" [style.width.%]="p.progress"></div>
                  </div>
                  <span>{{ p.progress }}%</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .dashboard { display: flex; flex-direction: column; gap: 24px; font-family: 'Inter', sans-serif; padding: 20px; }
    .page-title { font-family: 'Georgia', serif; font-size: 28px; }
    
    .stat-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
    .stat-icon.blue { background: #e0f2fe; }
    .stat-icon.green { background: #dcfce7; }
    .stat-icon.red { background: #fee2e2; }
    .stat-icon.gold { background: #fef3c7; }

    .middle-row { display: grid; grid-template-columns: 1fr 1.5fr; gap: 20px; }
    
    /* Pie Chart Styling */
    .analytics-content { display: flex; align-items: center; gap: 30px; padding: 10px 0; }
    .pie-chart {
      width: 120px; height: 120px; border-radius: 50%;
      /* Background handled by TypeScript logic */
    }
    .pie-legend { display: flex; flex-direction: column; gap: 8px; font-size: 13px; }
    .dot { display: inline-block; width: 10px; height: 10px; border-radius: 50%; margin-right: 8px; }
    .dot.active { background: #22c55e; }
    .dot.completed { background: #3b82f6; }
    .dot.risk { background: #ef4444; }

    .health-indicator { width: 12px; height: 12px; border-radius: 50%; display: block; }
    .healthy { background: #22c55e; box-shadow: 0 0 8px #22c55e66; }
    .warning { background: #eab308; }
    .danger { background: #ef4444; }

    .progress-container { display: flex; align-items: center; gap: 10px; font-size: 12px; }
    .progress-mini-bar { flex: 1; height: 6px; background: #f1f5f9; border-radius: 10px; overflow: hidden; width: 60px;}
    .progress-fill { height: 100%; background: #0f172a; }

    /* Inherit your existing table and card styles here */
    .card { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; }
    .stat-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; display: flex; align-items: center; gap: 15px; }
    .stat-value { font-size: 24px; font-weight: 800; }
    .status-badge { padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; }
    .status-active { background: #dcfce7; color: #15803d; }
    .status-at-risk { background: #fee2e2; color: #b91c1c; }
    .bar-chart { display: flex; flex-direction: column; gap: 12px; }
    .bar-row { display: flex; align-items: center; gap: 10px; }
    .bar-track { flex: 1; height: 8px; background: #f1f5f9; border-radius: 10px; }
    .bar-label { width: 80px; font-size: 12px; }
    .projects-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
    .projects-table th { text-align: left; font-size: 11px; color: #64748b; padding-bottom: 10px; }
    .projects-table td { padding: 12px 0; border-top: 1px solid #f1f5f9; font-size: 13px; }
  `]
})
export class DashboardComponent implements OnInit {
  today = new Date();
  totalBudgetBurn = 4.2; // Derived analytic

  recentProjects = [
    { name: 'ERP System Migration', pm: 'Alice M.', status: 'Active', progress: 72 },
    { name: 'Customer Portal Redesign', pm: 'James K.', status: 'Active', progress: 45 },
    { name: 'HR Self-Service Portal', pm: 'Sarah T.', status: 'On Hold', progress: 30 },
    { name: 'Supply Chain Analytics', pm: 'David O.', status: 'At Risk', progress: 18 },
    { name: 'Mobile App v2 Launch', pm: 'Linda N.', status: 'Active', progress: 89 },
    { name: 'Compliance Audit System', pm: 'Alice M.', status: 'Completed', progress: 100 }
  ];

  pmSuccessRates = [
    { name: 'Alice M.', rate: 92, color: '#22c55e' },
    { name: 'James K.', rate: 85, color: '#3b82f6' },
    { name: 'Sarah T.', rate: 78, color: '#a855f7' }
  ];

  pieChartGradient = '';

  ngOnInit() {
    this.calculatePieChart();
  }

  getCountByStatus(status: string): number {
    return this.recentProjects.filter(p => p.status === status).length;
  }

  calculatePieChart() {
    const total = this.recentProjects.length;
    const active = (this.getCountByStatus('Active') / total) * 100;
    const completed = (this.getCountByStatus('Completed') / total) * 100;
    const risk = (this.getCountByStatus('At Risk') / total) * 100;

    // Creates a conic gradient for a CSS-only pie chart
    this.pieChartGradient = `conic-gradient(
      #22c55e 0% ${active}%, 
      #3b82f6 ${active}% ${active + completed}%, 
      #ef4444 ${active + completed}% 100%
    )`;
  }

  getStatusClass(status: string): string {
    return status === 'Active' ? 'status-active' : status === 'At Risk' ? 'status-at-risk' : '';
  }
}
