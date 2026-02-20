import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Project {
  name: string;
  pm: string;
  status: string;
  deadline: string;
  daysRemaining: number;
  country: string;
  currency: string;
  budget: number;
  spent: number;
  successRate: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-wrapper">
      <div class="kpi-grid">
        <div class="kpi-card">
          <span class="kpi-icon blue">📋</span>
          <div class="kpi-info">
            <span class="count">{{ projects.length }}</span>
            <span class="label">Total Projects</span>
          </div>
        </div>
        <div class="kpi-card">
          <span class="kpi-icon green">🟢</span>
          <div class="kpi-info">
            <span class="count">{{ getStatusCount('Active') }}</span>
            <span class="label">Active</span>
          </div>
        </div>
        <div class="kpi-card">
          <span class="kpi-icon yellow">🟡</span>
          <div class="kpi-info">
            <span class="count">{{ getStatusCount('On Hold') }}</span>
            <span class="label">On Hold</span>
          </div>
        </div>
        <div class="kpi-card">
          <span class="kpi-icon check">✅</span>
          <div class="kpi-info">
            <span class="count">{{ getStatusCount('Completed') }}</span>
            <span class="label">Completed</span>
          </div>
        </div>
      </div>

      <div class="main-content-split">
        <div class="card chart-card">
          <div class="card-header">
            <h3>PM Success Rate</h3>
            <span class="sub-text">by Project Manager</span>
          </div>
          <div class="success-list">
            <div *ngFor="let pm of pmPerformance" class="pm-row">
              <div class="pm-meta">
                <span>{{ pm.name }}</span>
                <span class="percent">{{ pm.rate }}%</span>
              </div>
              <div class="progress-container">
                <div class="progress-bar" 
                     [style.width.%]="pm.rate" 
                     [style.background-color]="getBarColor(pm.rate)">
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="card deadline-card">
          <div class="card-header">
            <h3>Upcoming Deadlines</h3>
            <span class="sub-text">Next 30 days</span>
          </div>
          <div class="deadline-list">
            <div *ngFor="let p of projects" class="deadline-item">
              <div class="deadline-marker" [style.background-color]="getMarkerColor(p.daysRemaining)"></div>
              <div class="deadline-info">
                <strong>{{ p.name }}</strong>
                <span>{{ p.pm }} • {{ p.deadline }} ({{ p.country }})</span>
              </div>
              <div class="deadline-chip" [class.urgent]="p.daysRemaining < 7">
                {{ p.daysRemaining }}d
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-wrapper { padding: 25px; background: #f8fafc; font-family: 'Inter', sans-serif; }
    .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px; }
    .kpi-card { background: white; padding: 20px; border-radius: 12px; display: flex; align-items: center; gap: 15px; border: 1px solid #e2e8f0; }
    .kpi-icon { width: 45px; height: 45px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px; }
    .kpi-icon.blue { background: #eff6ff; }
    .kpi-icon.green { background: #f0fdf4; }
    .kpi-icon.yellow { background: #fffbeb; }
    .kpi-icon.check { background: #f0fdfa; }
    .count { display: block; font-size: 24px; font-weight: 800; color: #1e293b; }
    .label { font-size: 13px; color: #64748b; font-weight: 500; }

    .main-content-split { display: grid; grid-template-columns: 1.5fr 1fr; gap: 25px; }
    .card { background: white; border-radius: 12px; padding: 24px; border: 1px solid #e2e8f0; }
    .card-header { margin-bottom: 20px; }
    .card-header h3 { margin: 0; font-size: 18px; color: #1e293b; }
    .sub-text { font-size: 12px; color: #94a3b8; }

    .pm-row { margin-bottom: 18px; }
    .pm-meta { display: flex; justify-content: space-between; font-size: 14px; font-weight: 600; margin-bottom: 8px; color: #475569; }
    .progress-container { height: 8px; background: #f1f5f9; border-radius: 10px; }
    .progress-bar { height: 100%; border-radius: 10px; transition: width 1s ease-in-out; }

    .deadline-item { display: flex; align-items: center; gap: 15px; padding: 12px 0; border-bottom: 1px solid #f1f5f9; }
    .deadline-marker { width: 8px; height: 8px; border-radius: 50%; }
    .deadline-info { flex-grow: 1; }
    .deadline-info strong { display: block; font-size: 14px; color: #1e293b; }
    .deadline-info span { font-size: 12px; color: #94a3b8; }
    .deadline-chip { padding: 4px 10px; border-radius: 20px; background: #f0fdf4; color: #166534; font-size: 11px; font-weight: 700; }
    .deadline-chip.urgent { background: #fef2f2; color: #991b1b; }
  `]
})
export class DashboardComponent implements OnInit {
  projects: Project[] = [
    { name: 'ERP Migration', pm: 'Alice M.', status: 'Active', deadline: 'Feb 25', daysRemaining: 5, country: 'Kenya', currency: 'KES', budget: 850000, spent: 612000, successRate: 92 },
    { name: 'CRM Integration', pm: 'James K.', status: 'Active', deadline: 'Mar 1', daysRemaining: 9, country: 'Uganda', currency: 'UGX', budget: 500000, spent: 400000, successRate: 85 },
    { name: 'HR Portal', pm: 'Sarah T.', status: 'On Hold', deadline: 'Mar 8', daysRemaining: 16, country: 'USA', currency: 'USD', budget: 150000, spent: 50000, successRate: 78 }
  ];

  // Strictly typed to fix TS7053
  pmPerformance = [
    { name: 'Alice M.', rate: 92 },
    { name: 'James K.', rate: 85 },
    { name: 'Sarah T.', rate: 78 },
    { name: 'David O.', rate: 71 },
    { name: 'Linda N.', rate: 65 }
  ];

  ngOnInit() {}

  getStatusCount(status: string): number {
    return this.projects.filter(p => p.status === status).length;
  }

  getBarColor(rate: number): string {
    if (rate >= 90) return '#22c55e';
    if (rate >= 80) return '#3b82f6';
    if (rate >= 70) return '#a855f7';
    return '#f59e0b';
  }

  getMarkerColor(days: number): string {
    return days < 7 ? '#ef4444' : (days < 14 ? '#f59e0b' : '#22c55e');
  }
}
