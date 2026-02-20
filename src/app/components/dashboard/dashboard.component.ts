import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard-wrapper">
      <div class="page-header">
        <div>
          <h1 class="page-title">Dashboard Overview</h1>
          <p class="page-subtitle">Strategic performance and financial analytics</p>
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
            <div class="stat-value">KES {{ totalSpentFormatted }}M</div>
            <div class="stat-label">Total Spend</div>
          </div>
        </div>
      </div>

      <div class="middle-row">
        <div class="card">
          <div class="card-header">
            <h2 class="card-title">Status Distribution</h2>
            <span class="card-subtitle">Portfolio Mix</span>
          </div>
          <div class="analytics-content">
            <div class="pie-chart" [style.background]="pieChartGradient"></div>
            <div class="pie-legend">
              <div class="legend-item"><span class="dot active"></span> Active ({{ getCountByStatus('Active') }})</div>
              <div class="legend-item"><span class="dot completed"></span> Completed ({{ getCountByStatus('Completed') }})</div>
              <div class="legend-item"><span class="dot risk"></span> At Risk ({{ getCountByStatus('At Risk') }})</div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h2 class="card-title">Performance Index</h2>
            <span class="card-subtitle">Success Rate by PM</span>
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
          <a routerLink="/projects" class="card-link">View Detailed Reports →</a>
        </div>
        <div class="table-responsive">
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
                        [class.warning]="p.progress < 50 && p.progress > 25"
                        [class.danger]="p.progress <= 25">
                  </span>
                </td>
                <td>
                  <div class="progress-container">
                    <div class="progress-mini-bar">
                      <div class="progress-fill" [style.width.%]="p.progress"></div>
                    </div>
                    <span class="progress-text">{{ p.progress }}%</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Container & Typography */
    .dashboard-wrapper { 
      padding: 30px; 
      background: #f8fafc; 
      min-height: 100vh; 
      display: flex; 
      flex-direction: column; 
      gap: 24px;
    }
    .page-title { font-family: 'Georgia', serif; font-size: 28px; font-weight: 700; color: #0f172a; margin: 0; }
    .page-subtitle { font-family: sans-serif; font-size: 14px; color: #64748b; margin-top: 4px; }
    .header-date { font-family: sans-serif; font-size: 13px; color: #64748b; }

    /* Stat Cards - Solid backgrounds restored */
    .stat-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
    .stat-card { 
      background: #ffffff; 
      border: 1px solid #e2e8f0; 
      border-radius: 12px; 
      padding: 24px; 
      display: flex; 
      align-items: center; 
      gap: 16px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .stat-icon { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px; }
    .stat-icon.blue { background: #eff6ff; }
    .stat-icon.green { background: #f0fdf4; }
    .stat-icon.red { background: #fef2f2; }
    .stat-icon.gold { background: #fffbeb; }
    .stat-value { font-size: 24px; font-weight: 800; color: #0f172a; }
    .stat-label { font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.025em; }

    /* Layout Cards */
    .card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    .card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
    .card-title { font-family: 'Georgia', serif; font-size: 18px; font-weight: 700; color: #0f172a; margin: 0; }
    .card-subtitle { font-size: 12px; color: #94a3b8; display: block; }
    .card-link { font-size: 13px; font-weight: 600; color: #2563eb; text-decoration: none; }

    .middle-row { display: grid; grid-template-columns: 1fr 1.5fr; gap: 20px; }

    /* Pie Chart Components */
    .analytics-content { display: flex; align-items: center; gap: 24px; padding: 10px 0; }
    .pie-chart { width: 110px; height: 110px; border-radius: 50%; border: 4px solid #fff; box-shadow: 0 0 0 1px #e2e8f0; }
    .pie-legend { display: flex; flex-direction: column; gap: 10px; }
    .legend-item { font-size: 13px; color: #475569; display: flex; align-items: center; }
    .dot { width: 8px; height: 8px; border-radius: 50%; margin-right: 10px; }
    .dot.active { background: #22c55e; }
    .dot.completed { background: #3b82f6; }
    .dot.risk { background: #ef4444; }

    /* Bar Chart Components */
    .bar-chart { display: flex; flex-direction: column; gap: 14px; }
    .bar-row { display: flex; align-items: center; gap: 12px; }
    .bar-label { width: 80px; font-size: 12px; font-weight: 600; color: #475569; }
    .bar-track { flex: 1; height: 8px; background: #f1f5f9; border-radius: 10px; overflow: hidden; }
    .bar-fill { height: 100%; border-radius: 10px; transition: width 0.8s ease-out; }
    .bar-value { width: 35px; font-size: 12px; font-weight: 700; color: #0f172a; text-align: right; }

    /* Table Styles */
    .table-responsive { overflow-x: auto; }
    .projects-table { width: 100%; border-collapse: collapse; text-align: left; }
    .projects-table th { font-size: 11px; text-transform: uppercase; color: #94a3b8; padding: 12px 0; border-bottom: 1px solid #e2e8f0; letter-spacing: 0.05em; }
    .projects-table td { padding: 16px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; color: #334155; }
    .project-name { font-weight: 700; color: #0f172a; }

    /* Badges & Indicators */
    .status-badge { padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; }
    .status-active { background: #dcfce7; color: #15803d; }
    .status-at-risk { background: #fee2e2; color: #b91c1c; }
    .status-on-hold { background: #fef3c7; color: #92400e; }
    .status-completed { background: #eff6ff; color: #1e40af; }

    .health-indicator { width: 10px; height: 10px; border-radius: 50%; display: block; margin: 0 auto; }
    .healthy { background: #22c55e; box-shadow: 0 0 8px rgba(34, 197, 94, 0.4); }
    .warning { background: #eab308; }
    .danger { background: #ef4444; }

    .progress-container { display: flex; align-items: center; gap: 8px; }
    .progress-mini-bar { width: 60px; height: 6px; background: #f1f5f9; border-radius: 10px; overflow: hidden; }
    .progress-fill { height: 100%; background: #0f172a; }
    .progress-text { font-size: 11px; font-weight: 600; color: #64748b; }
  `]
})
export class DashboardComponent implements OnInit {
  today = new Date();
  totalSpentFormatted = '4.2'; // Example analytic

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
    { name: 'Sarah T.', rate: 78, color: '#a855f7' },
    { name: 'David O.', rate: 71, color: '#eab308' }
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
    if (total === 0) return;

    const active = (this.getCountByStatus('Active') / total) * 100;
    const completed = (this.getCountByStatus('Completed') / total) * 100;
    const risk = (this.getCountByStatus('At Risk') / total) * 100;
    const onHold = (this.getCountByStatus('On Hold') / total) * 100;

    // Conic gradient for the CSS pie chart
    this.pieChartGradient = `conic-gradient(
      #22c55e 0% ${active}%, 
      #3b82f6 ${active}% ${active + completed}%, 
      #ef4444 ${active + completed}% ${active + completed + risk}%,
      #eab308 ${active + completed + risk}% 100%
    )`;
  }

  getStatusClass(status: string): string {
    const statusMap: Record<string, string> = {
      'Active': 'status-active',
      'At Risk': 'status-at-risk',
      'On Hold': 'status-on-hold',
      'Completed': 'status-completed'
    };
    return statusMap[status] || '';
  }
}
