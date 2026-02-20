// src/app/components/dashboard/dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { GovernanceService, MasterPM } from '../../services/governance.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="mck-container">

      <!-- Hero -->
      <div class="mck-hero">
        <span class="eyebrow">Portfolio Strategy</span>
        <h1>Operational Excellence Hub</h1>
        <p>Real-time governance across all active workstreams.</p>
      </div>

      <!-- Stat Cards -->
      <div class="stat-grid">
        <div class="stat-card">
          <div class="stat-label">Total Projects</div>
          <div class="stat-value">{{ gov.projects.length }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Active</div>
          <div class="stat-value blue">{{ getCount('Active') }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Critical</div>
          <div class="stat-value red">{{ getCount('Critical') }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Planning</div>
          <div class="stat-value grey">{{ getCount('Planning') }}</div>
        </div>
      </div>

      <!-- Main Grid -->
      <div class="mck-grid">

        <!-- Workload Distribution -->
        <div class="mck-card">
          <h3>Workload Distribution</h3>
          <div class="pie-placeholder"></div>
          <div class="legend">
            <span class="legend-dot blue"></span> Assigned: {{ gov.projects.length }}
            &nbsp;&nbsp;
            <span class="legend-dot grey"></span> Unassigned: 2
          </div>
        </div>

        <!-- PM Performance -->
        <div class="mck-card">
          <h3>Resource Performance Registry</h3>
          <div *ngFor="let pm of pms" class="pm-row">
            <div class="pm-meta">
              <div class="pm-name">{{ pm.name }}</div>
              <div class="pm-detail">{{ pm.department }} · {{ pm.activeProjects }} projects</div>
            </div>
            <div class="pm-rate-row">
              <div class="progress-track">
                <div class="fill" [style.width.%]="pm.rate"
                  [style.background]="pm.rate >= 90 ? '#10b981' : pm.rate >= 70 ? '#007DFE' : '#f59e0b'">
                </div>
              </div>
              <strong class="pm-rate">{{ pm.rate }}%</strong>
            </div>
            <div class="pm-last">Last delivery: {{ pm.lastDelivery }}</div>
          </div>
        </div>

      </div>

      <!-- Recent Projects -->
      <div class="mck-card full-width">
        <div class="card-header">
          <h3>Recent Projects</h3>
          <a routerLink="/projects" class="view-all">View all →</a>
        </div>
        <table class="mini-table">
          <thead>
            <tr>
              <th>Project</th>
              <th>Owner</th>
              <th>Location</th>
              <th>Phase</th>
              <th>Status</th>
              <th>Progress</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of gov.projects.slice(0, 5)">
              <td class="proj-name">{{ p.name }}</td>
              <td>{{ p.owner }}</td>
              <td>{{ p.location }}</td>
              <td><span class="gate-badge" [ngClass]="p.phase.toLowerCase()">{{ p.phase }}</span></td>
              <td><span class="status-badge" [ngClass]="p.status.toLowerCase()">{{ p.status }}</span></td>
              <td>
                <div class="mini-prog">
                  <div class="mini-fill" [style.width.%]="gov.getCalculatedProgress(p)"></div>
                </div>
                <span class="mini-pct">{{ gov.getCalculatedProgress(p) }}%</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  `,
  styles: [`
    .mck-container { padding: 30px; background: #f5f7f9; min-height: 100vh; font-family: 'Inter', sans-serif; display: flex; flex-direction: column; gap: 24px; }

    .mck-hero { background: #001E3C; color: white; padding: 36px 40px; border-radius: 6px; border-bottom: 4px solid #007DFE; }
    .eyebrow { color: #007DFE; font-weight: 800; text-transform: uppercase; font-size: 11px; letter-spacing: 1px; }
    .mck-hero h1 { font-size: 28px; font-weight: 700; margin: 8px 0 6px; font-family: 'Georgia', serif; }
    .mck-hero p { font-size: 13px; color: #94a3b8; margin: 0; }

    .stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
    .stat-card { background: white; border: 1px solid #e2e8f0; border-radius: 6px; padding: 20px 24px; }
    .stat-label { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
    .stat-value { font-size: 32px; font-weight: 700; color: #1a2332; font-family: 'Georgia', serif; }
    .stat-value.blue { color: #007DFE; }
    .stat-value.red { color: #ef4444; }
    .stat-value.grey { color: #94a3b8; }

    .mck-grid { display: grid; grid-template-columns: 1fr 1.5fr; gap: 24px; }
    .mck-card { background: white; padding: 24px; border: 1px solid #e2e8f0; border-radius: 6px; }
    .mck-card h3 { font-size: 14px; font-weight: 700; color: #1a2332; margin: 0 0 20px; text-transform: uppercase; letter-spacing: 0.5px; }

    .pie-placeholder { width: 120px; height: 120px; border-radius: 50%; background: conic-gradient(#007DFE 85%, #e2e8f0 0); margin: 16px auto; }
    .legend { display: flex; align-items: center; justify-content: center; font-size: 13px; color: #64748b; margin-top: 12px; }
    .legend-dot { display: inline-block; width: 10px; height: 10px; border-radius: 50%; margin-right: 5px; }
    .legend-dot.blue { background: #007DFE; }
    .legend-dot.grey { background: #e2e8f0; }

    .pm-row { margin-bottom: 18px; padding-bottom: 18px; border-bottom: 1px solid #f1f5f9; }
    .pm-row:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
    .pm-meta { margin-bottom: 8px; }
    .pm-name { font-size: 14px; font-weight: 700; color: #1a2332; }
    .pm-detail { font-size: 11px; color: #94a3b8; margin-top: 2px; }
    .pm-rate-row { display: flex; align-items: center; gap: 10px; }
    .progress-track { flex: 1; height: 6px; background: #f1f5f9; border-radius: 3px; overflow: hidden; }
    .fill { height: 100%; border-radius: 3px; transition: width 0.5s ease; }
    .pm-rate { font-size: 13px; color: #1a2332; white-space: nowrap; }
    .pm-last { font-size: 11px; color: #94a3b8; margin-top: 5px; }

    .full-width { margin-top: 0; }
    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .card-header h3 { margin: 0; font-size: 14px; font-weight: 700; color: #1a2332; text-transform: uppercase; letter-spacing: 0.5px; }
    .view-all { font-size: 13px; color: #007DFE; text-decoration: none; font-weight: 600; }
    .view-all:hover { text-decoration: underline; }

    .mini-table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .mini-table th { padding: 10px 14px; font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #f1f5f9; text-align: left; font-weight: 700; }
    .mini-table td { padding: 12px 14px; border-bottom: 1px solid #f1f5f9; color: #2d3748; vertical-align: middle; }
    .mini-table tr:last-child td { border-bottom: none; }
    .proj-name { font-weight: 600; color: #1a2332; }

    .gate-badge { padding: 3px 8px; border-radius: 4px; font-size: 10px; font-weight: 800; text-transform: uppercase; }
    .initiation { background: #f8f9fa; color: #6c757d; }
    .planning { background: #f1f5f9; color: #475569; }
    .execution { background: #e0f2fe; color: #0369a1; }
    .closure { background: #f0fdf4; color: #166534; }

    .status-badge { padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; }
    .active { background: #ecfdf5; color: #10b981; }
    .critical { background: #fef2f2; color: #ef4444; }

    .mini-prog { display: inline-block; width: 60px; height: 5px; background: #f1f5f9; border-radius: 3px; overflow: hidden; vertical-align: middle; margin-right: 6px; }
    .mini-fill { height: 100%; background: #007DFE; border-radius: 3px; }
    .mini-pct { font-size: 12px; color: #64748b; font-weight: 600; }
  `]
})
export class DashboardComponent implements OnInit {
  pms: MasterPM[] = [];

  constructor(public gov: GovernanceService) {}

  ngOnInit() {
    this.gov.masterPMs$.subscribe(data => this.pms = data);
  }

  getCount(status: string): number {
    return this.gov.projects.filter(p => p.status === status).length;
  }
}
