import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GovernanceService, MasterPM, ProjectStats } from '../../services/governance.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mck-dashboard">
      <div class="mck-hero-banner">
        <div>
          <span class="eyebrow">Strategic Portfolio Summary</span>
          <h1>Operational Excellence Hub</h1>
        </div>
        <div class="hero-icon">📈</div>
      </div>

      <div class="mck-grid">
        <div class="mck-card">
          <h3 class="card-title">Workload Distribution</h3>
          <div class="pie-chart" [style.background]="getPieStyle()"></div>
          <div class="stats-footer">
            <span>Assigned: <strong>{{ stats.assigned }}</strong></span>
            <span>Unassigned: <strong>{{ stats.unassigned }}</strong></span>
          </div>
        </div>

        <div class="mck-card">
          <h3 class="card-title">PM Performance Registry</h3>
          <div *ngFor="let pm of pms" class="pm-row">
            <div class="pm-info">
              <span>{{ pm.name }}</span>
              <strong>{{ pm.rate }}%</strong>
            </div>
            <div class="progress-bar"><div class="fill" [style.width.%]="pm.rate"></div></div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .mck-dashboard { padding: 40px; background: #F5F7F9; min-height: 100vh; font-family: sans-serif; }
    .mck-hero-banner { background: #001E3C; color: #FFFFFF; padding: 45px; border-radius: 4px; display: flex; justify-content: space-between; align-items: center; border-bottom: 4px solid #007DFE; margin-bottom: 30px; }
    .eyebrow { font-size: 11px; text-transform: uppercase; color: #007DFE; font-weight: 700; }
    .mck-grid { display: grid; grid-template-columns: 1fr 1.5fr; gap: 30px; }
    .mck-card { background: #FFFFFF; padding: 30px; border-radius: 4px; border: 1px solid #E2E8F0; }
    .card-title { color: #001E3C; margin-bottom: 20px; font-size: 18px; border-bottom: 1px solid #F1F5F9; padding-bottom: 10px; }
    .pie-chart { width: 150px; height: 150px; border-radius: 50%; margin: 0 auto 20px; border: 4px solid #FFF; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
    .stats-footer { display: flex; justify-content: space-around; font-size: 14px; }
    .pm-row { margin-bottom: 20px; }
    .pm-info { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
    .progress-bar { height: 6px; background: #F1F5F9; border-radius: 3px; overflow: hidden; }
    .fill { height: 100%; background: #007DFE; transition: width 1s; }
  `]
})
export class DashboardComponent implements OnInit {
  pms: MasterPM[] = [];
  stats: ProjectStats = { assigned: 0, unassigned: 0, total: 0 };

  constructor(public gov: GovernanceService) {}

  ngOnInit() {
    this.gov.masterPMs$.subscribe((data: MasterPM[]) => this.pms = data);
    this.gov.projectStats$.subscribe((data: ProjectStats) => this.stats = data);
  }

  getPieStyle(): string {
    const p = (this.stats.assigned / this.stats.total) * 100;
    return `conic-gradient(#007DFE 0% ${p}%, #E2E8F0 ${p}% 100%)`;
  }
}
