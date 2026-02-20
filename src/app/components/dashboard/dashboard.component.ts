import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { GovernanceService, Project } from '../../services/governance.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  template: `
    <div class="mck-dashboard">
      <div class="metrics-grid">
        <div class="metric-card">
          <span class="label">Total Portfolio Value</span>
          <div class="value">KES {{ getTotalBudget() | number }}</div>
          <span class="trend pos">↑ 12% vs last quarter</span>
        </div>
        <div class="metric-card">
          <span class="label">Workstreams in Execution</span>
          <div class="value">{{ getActiveCount() }}</div>
          <span class="sub-label">of {{ gov.projects.length }} total projects</span>
        </div>
        <div class="metric-card warn">
          <span class="label">Governance Blockers</span>
          <div class="value">{{ getBlockedCount() }}</div>
          <span class="sub-label">Missing Scope Sign-off</span>
        </div>
        <div class="metric-card crit">
          <span class="label">Critical Risks</span>
          <div class="value">{{ getCriticalCount() }}</div>
          <span class="sub-label">Requiring HOD Intervention</span>
        </div>
      </div>

      <div class="main-content">
        <div class="mck-card perf-card">
          <h3>Workstream Velocity (Calculated Progress)</h3>
          <p class="subtitle">Real-time status based on Registry Timelines.</p>
          
          <div class="chart-container">
            <div *ngFor="let p of gov.projects" class="chart-row">
              <div class="p-info">
                <span class="name">{{ p.name }}</span>
                <span class="loc">{{ p.location }}</span>
              </div>
              <div class="bar-container">
                <div class="bar-track">
                  <div class="bar-fill" 
                       [style.width.%]="gov.getCalculatedProgress(p)"
                       [ngClass]="getHealthClass(p)"></div>
                </div>
                <span class="percent">{{ gov.getCalculatedProgress(p) }}%</span>
              </div>
            </div>
          </div>
        </div>

        <div class="side-panel">
          <div class="mck-card sm-card">
            <h3>Regional Footprint</h3>
            <div class="region-item" *ngFor="let r of gov.masterRegions">
              <span class="r-name">{{ r.name }}</span>
              <span class="r-count">{{ r.projectCount }} Projects</span>
            </div>
          </div>

          <div class="mck-card sm-card">
            <h3>Top Performing Leads</h3>
            <div class="pm-item" *ngFor="let pm of gov.masterPMs">
              <div class="pm-avatar">{{ pm.name[0] }}</div>
              <div class="pm-details">
                <span class="pm-name">{{ pm.name }}</span>
                <span class="pm-sub">{{ pm.activeProjects }} Active • {{ pm.department }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .mck-dashboard { padding: 30px; background: #f5f7f9; min-height: 100vh; font-family: 'Inter', sans-serif; }
    
    .metrics-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px; }
    .metric-card { background: white; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; }
    .metric-card .label { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; }
    .metric-card .value { font-size: 24px; font-weight: 800; color: #001E3C; margin: 8px 0; }
    .metric-card .sub-label { font-size: 11px; color: #94a3b8; }
    .metric-card.warn { border-left: 4px solid #f59e0b; }
    .metric-card.crit { border-left: 4px solid #ef4444; }

    .main-content { display: grid; grid-template-columns: 2fr 1fr; gap: 25px; }
    .mck-card { background: white; border-radius: 8px; border: 1px solid #e2e8f0; padding: 25px; }
    .subtitle { font-size: 13px; color: #64748b; margin-bottom: 20px; }

    .chart-row { margin-bottom: 18px; }
    .p-info { display: flex; justify-content: space-between; margin-bottom: 6px; }
    .p-info .name { font-weight: 700; font-size: 13px; color: #001E3C; }
    .p-info .loc { font-size: 11px; color: #007DFE; font-weight: 600; }

    .bar-container { display: flex; align-items: center; gap: 12px; }
    .bar-track { flex: 1; height: 8px; background: #f1f5f9; border-radius: 4px; overflow: hidden; }
    .bar-fill { height: 100%; transition: width 0.8s ease-in-out; }
    .percent { font-size: 12px; font-weight: 800; color: #475569; width: 40px; }

    .health-good { background: #10b981; }
    .health-warn { background: #f59e0b; }
    .health-crit { background: #ef4444; }

    .region-item, .pm-item { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #f1f5f9; }
    .pm-item { gap: 12px; justify-content: flex-start; }
    .pm-avatar { width: 32px; height: 32px; background: #001E3C; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; }
    .pm-name { display: block; font-weight: 700; font-size: 13px; }
    .pm-sub { font-size: 11px; color: #94a3b8; }
  `]
})
export class DashboardComponent {
  constructor(public gov: GovernanceService) {}

  getTotalBudget(): number {
    return this.gov.projects.reduce((acc, p) => acc + p.budget, 0);
  }

  getActiveCount(): number {
    return this.gov.projects.filter(p => p.phase === 'Execution').length;
  }

  getBlockedCount(): number {
    return this.gov.projects.filter(p => p.phase === 'Planning' && !p.hasAttachment).length;
  }

  getCriticalCount(): number {
    return this.gov.projects.filter(p => p.status === 'Critical').length;
  }

  getHealthClass(p: Project): string {
    const prog = this.gov.getCalculatedProgress(p);
    if (p.status === 'Critical') return 'health-crit';
    return prog < 40 ? 'health-warn' : 'health-good';
  }
}
