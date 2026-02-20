// src/app/components/dashboard/dashboard.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  ...
  imports: [CommonModule, RouterLink],
  ...
})

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard">

      <!-- Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Dashboard</h1>
          <p class="page-subtitle">Overview of all projects and performance</p>
        </div>
        <div class="header-date">{{ today | date:'EEEE, MMMM d, y' }}</div>
      </div>

      <!-- Stat Cards -->
      <div class="stat-cards">
        <div class="stat-card">
          <div class="stat-icon" style="background:#e8f4fd;">📋</div>
          <div class="stat-info">
            <div class="stat-value">24</div>
            <div class="stat-label">Total Projects</div>
          </div>
          <div class="stat-change positive">+3 this month</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background:#e8fdf0;">🟢</div>
          <div class="stat-info">
            <div class="stat-value">11</div>
            <div class="stat-label">Active</div>
          </div>
          <div class="stat-change positive">+1 this week</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background:#fdf8e8;">🟡</div>
          <div class="stat-info">
            <div class="stat-value">6</div>
            <div class="stat-label">On Hold</div>
          </div>
          <div class="stat-change neutral">No change</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background:#edf0fd;">✅</div>
          <div class="stat-info">
            <div class="stat-value">7</div>
            <div class="stat-label">Completed</div>
          </div>
          <div class="stat-change positive">+2 this month</div>
        </div>
      </div>

      <!-- Middle Row: Chart + Deadlines -->
      <div class="middle-row">

        <!-- PM Success Rate Chart -->
        <div class="card chart-card">
          <div class="card-header">
            <h2 class="card-title">PM Success Rate</h2>
            <span class="card-subtitle">by Project Manager</span>
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

        <!-- Upcoming Deadlines -->
        <div class="card deadlines-card">
          <div class="card-header">
            <h2 class="card-title">Upcoming Deadlines</h2>
            <span class="card-subtitle">Next 30 days</span>
          </div>
          <div class="deadline-list">
            <div class="deadline-item" *ngFor="let d of upcomingDeadlines">
              <div class="deadline-dot" [style.background]="d.urgencyColor"></div>
              <div class="deadline-info">
                <div class="deadline-name">{{ d.project }}</div>
                <div class="deadline-meta">{{ d.pm }} · {{ d.date }}</div>
              </div>
              <div class="deadline-badge" [style.background]="d.urgencyBg" [style.color]="d.urgencyColor">
                {{ d.daysLeft }}d
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Projects -->
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">Recent Projects</h2>
          <a routerLink="/projects" class="card-link">View all →</a>
        </div>
        <table class="projects-table">
          <thead>
            <tr>
              <th>Project Name</th>
              <th>Type</th>
              <th>PM</th>
              <th>Status</th>
              <th>Progress</th>
              <th>Due Date</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of recentProjects">
              <td class="project-name">{{ p.name }}</td>
              <td><span class="type-badge">{{ p.type }}</span></td>
              <td>{{ p.pm }}</td>
              <td>
                <span class="status-badge" [ngClass]="p.status.toLowerCase().replace(' ', '-')">
                  {{ p.status }}
                </span>
              </td>
              <td>
                <div class="progress-bar">
                  <div class="progress-fill" [style.width.%]="p.progress"></div>
                </div>
                <span class="progress-label">{{ p.progress }}%</span>
              </td>
              <td class="due-date">{{ p.due }}</td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  `,
  styles: [`
    .dashboard {
      display: flex;
      flex-direction: column;
      gap: 24px;
      font-family: 'Georgia', serif;
      color: #1a2332;
    }

    /* Header */
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .page-title {
      font-size: 26px;
      font-weight: 700;
      margin: 0 0 4px;
      color: #1a2332;
    }
    .page-subtitle {
      font-size: 13px;
      color: #718096;
      margin: 0;
      font-family: sans-serif;
    }
    .header-date {
      font-size: 13px;
      color: #718096;
      font-family: sans-serif;
      padding-top: 6px;
    }

    /* Stat Cards */
    .stat-cards {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
    }
    .stat-card {
      background: #fff;
      border: 1px solid #e8ecf0;
      border-radius: 10px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }
    .stat-icon {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
    }
    .stat-value {
      font-size: 28px;
      font-weight: 700;
      color: #1a2332;
      line-height: 1;
    }
    .stat-label {
      font-size: 12px;
      color: #718096;
      font-family: sans-serif;
      margin-top: 2px;
    }
    .stat-change {
      font-size: 11px;
      font-family: sans-serif;
    }
    .stat-change.positive { color: #38a169; }
    .stat-change.neutral { color: #a0aec0; }

    /* Card */
    .card {
      background: #fff;
      border: 1px solid #e8ecf0;
      border-radius: 10px;
      padding: 24px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .card-title {
      font-size: 16px;
      font-weight: 700;
      margin: 0;
      color: #1a2332;
    }
    .card-subtitle {
      font-size: 12px;
      color: #a0aec0;
      font-family: sans-serif;
    }
    .card-link {
      font-size: 13px;
      color: #1a2332;
      text-decoration: none;
      font-family: sans-serif;
      font-weight: 600;
    }
    .card-link:hover { text-decoration: underline; }

    /* Middle Row */
    .middle-row {
      display: grid;
      grid-template-columns: 1.5fr 1fr;
      gap: 16px;
    }

    /* Bar Chart */
    .bar-chart {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .bar-row {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .bar-label {
      width: 90px;
      font-size: 13px;
      color: #4a5568;
      font-family: sans-serif;
      flex-shrink: 0;
    }
    .bar-track {
      flex: 1;
      height: 10px;
      background: #f0f4f8;
      border-radius: 99px;
      overflow: hidden;
    }
    .bar-fill {
      height: 100%;
      border-radius: 99px;
      transition: width 0.6s ease;
    }
    .bar-value {
      width: 36px;
      font-size: 13px;
      font-weight: 600;
      color: #1a2332;
      font-family: sans-serif;
      text-align: right;
    }

    /* Deadlines */
    .deadline-list {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .deadline-item {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .deadline-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .deadline-info { flex: 1; }
    .deadline-name {
      font-size: 13px;
      font-weight: 600;
      color: #1a2332;
      font-family: sans-serif;
    }
    .deadline-meta {
      font-size: 11px;
      color: #a0aec0;
      font-family: sans-serif;
      margin-top: 2px;
    }
    .deadline-badge {
      font-size: 11px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 99px;
      font-family: sans-serif;
    }

    /* Projects Table */
    .projects-table {
      width: 100%;
      border-collapse: collapse;
      font-family: sans-serif;
      font-size: 13px;
    }
    .projects-table th {
      text-align: left;
      padding: 10px 12px;
      font-size: 11px;
      font-weight: 700;
      color: #a0aec0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 1px solid #e8ecf0;
    }
    .projects-table td {
      padding: 12px 12px;
      border-bottom: 1px solid #f7f9fc;
      color: #2d3748;
      vertical-align: middle;
    }
    .projects-table tr:last-child td { border-bottom: none; }
    .projects-table tr:hover td { background: #f7f9fc; }
    .project-name { font-weight: 600; color: #1a2332 !important; }

    .type-badge {
      background: #edf2f7;
      color: #4a5568;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
    }

    .status-badge {
      padding: 3px 10px;
      border-radius: 99px;
      font-size: 11px;
      font-weight: 700;
    }
    .status-badge.active { background: #e8fdf0; color: #38a169; }
    .status-badge.on-hold { background: #fdf8e8; color: #d69e2e; }
    .status-badge.completed { background: #e8f4fd; color: #3182ce; }
    .status-badge.at-risk { background: #fde8e8; color: #e53e3e; }

    .progress-bar {
      width: 80px;
      height: 6px;
      background: #f0f4f8;
      border-radius: 99px;
      overflow: hidden;
      display: inline-block;
      vertical-align: middle;
      margin-right: 6px;
    }
    .progress-fill {
      height: 100%;
      background: #1a2332;
      border-radius: 99px;
    }
    .progress-label {
      font-size: 12px;
      color: #718096;
      vertical-align: middle;
    }
    .due-date { color: #718096 !important; }
  `]
})
export class DashboardComponent {
  today = new Date();

  pmSuccessRates = [
    { name: 'Alice M.', rate: 92, color: '#38a169' },
    { name: 'James K.', rate: 85, color: '#3182ce' },
    { name: 'Sarah T.', rate: 78, color: '#805ad5' },
    { name: 'David O.', rate: 71, color: '#d69e2e' },
    { name: 'Linda N.', rate: 65, color: '#e53e3e' },
  ];

  upcomingDeadlines = [
    { project: 'ERP Migration', pm: 'Alice M.', date: 'Feb 25', daysLeft: 5, urgencyColor: '#e53e3e', urgencyBg: '#fde8e8' },
    { project: 'CRM Integration', pm: 'James K.', date: 'Mar 1', daysLeft: 9, urgencyColor: '#d69e2e', urgencyBg: '#fdf8e8' },
    { project: 'HR Portal', pm: 'Sarah T.', date: 'Mar 8', daysLeft: 16, urgencyColor: '#d69e2e', urgencyBg: '#fdf8e8' },
    { project: 'Data Warehouse', pm: 'David O.', date: 'Mar 15', daysLeft: 23, urgencyColor: '#38a169', urgencyBg: '#e8fdf0' },
    { project: 'Mobile App v2', pm: 'Linda N.', date: 'Mar 20', daysLeft: 28, urgencyColor: '#38a169', urgencyBg: '#e8fdf0' },
  ];

  recentProjects = [
    { name: 'ERP System Migration', type: 'IT', pm: 'Alice M.', status: 'Active', progress: 72, due: 'Feb 25, 2026' },
    { name: 'Customer Portal Redesign', type: 'BA', pm: 'James K.', status: 'Active', progress: 45, due: 'Mar 10, 2026' },
    { name: 'HR Self-Service Portal', type: 'Mixed', pm: 'Sarah T.', status: 'On Hold', progress: 30, due: 'Mar 8, 2026' },
    { name: 'Supply Chain Analytics', type: 'BA', pm: 'David O.', status: 'At Risk', progress: 58, due: 'Feb 28, 2026' },
    { name: 'Mobile App v2 Launch', type: 'IT', pm: 'Linda N.', status: 'Active', progress: 89, due: 'Mar 20, 2026' },
    { name: 'Compliance Audit System', type: 'Mixed', pm: 'Alice M.', status: 'Completed', progress: 100, due: 'Feb 10, 2026' },
  ];
}
