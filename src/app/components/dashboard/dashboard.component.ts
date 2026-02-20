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
        <div class="banner-text">
          <span class="eyebrow">Portfolio Performance Strategy</span>
          <h1>{{ storytellingTagline }}</h1>
        </div>
        <div class="banner-icon">{{ storyIcon }}</div>
      </div>

      <div class="mck-grid">
        <div class="mck-card">
          <h3 class="card-title">Workload Distribution</h3>
          <div class="pie-container">
            <div class="pie-chart" [style.background]="getPieStyle()"></div>
            <div class="legend">
              <div class="legend-row">
                <span class="dot assigned"></span> 
                <span>Assigned: <strong>{{ stats.assigned }}</strong></span>
              </div>
              <div class="legend-row">
                <span class="dot unassigned"></span> 
                <span>Unassigned: <strong>{{ stats.unassigned }}</strong></span>
              </div>
            </div>
          </div>
        </div>

        <div class="mck-card">
          <h3 class="card-title">Resource Performance Registry</h3>
          <div class="pm-performance-list">
            <div *ngFor="let pm of pms" class="pm-row">
              <div class="pm-meta">
                <span class="pm-name">{{ pm.name }}</span>
                <span class="pm-rate">{{ pm.rate }}%</span>
              </div>
              <div class="mck-progress-track">
                <div class="mck-progress-fill" [style.width.%]="pm.rate"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .mck-dashboard { padding: 40px; background: #F5F7F9; min-height: 100vh; font-family: 'Helvetica Neue', Arial, sans-serif; }
    .mck-hero-banner { background: #001E3C; color: #FFFFFF; padding: 45px; border-radius: 4px; margin-bottom: 30px; border-bottom: 4px solid #007DFE; display: flex; justify-content: space-between; align-items: center; }
    .eyebrow { font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #007DFE; font-weight: 700; }
    .mck-hero-banner h1 { margin: 12px 0 0; font-size: 28px; font-weight: 300; line-height: 1.2; }
    .banner-icon { font-size: 40px; opacity: 0.8; }
    .mck-grid { display: grid; grid-template-columns: 1fr 1.6fr; gap: 30px; }
    .mck-card { background: #FFFFFF; padding: 30px; border-radius: 4px; border: 1px solid #E2E8F0; }
    .card-title { color: #001E3C; font-size: 18px; font-weight: 600; margin-bottom: 25px; border-bottom: 1px solid #F1F5F9; padding-bottom: 12px; }
    .pie-container { display: flex; flex-direction: column; align-items: center; gap: 20px; }
    .pie-chart { width: 160px; height: 160px; border-radius: 50%; border: 4px solid #FFF; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .legend-row { display: flex; align-items: center; gap: 12px; margin-top: 10px; font-size: 14px; color: #475569; }
    .dot { width: 10px; height: 10px; border-radius: 2px; }
    .dot.assigned { background: #007DFE; }
    .dot.unassigned { background: #E2E8F0; }
    .pm-row { margin-bottom: 22px; }
    .pm-meta { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
    .pm-name { font-weight: 600; color: #001E3C; }
    .pm-rate { font-weight: 700; color: #007DFE; }
    .mck-progress-track { height: 6px; background: #F1F5F9; border-radius: 3px; overflow: hidden; }
    .mck-progress-fill { height: 100%; background: #007DFE; transition: width 1s ease-in-out; }
  `]
})
export class DashboardComponent implements OnInit {
  pms: MasterPM[] = [];
  stats: ProjectStats = { assigned: 0, unassigned: 0, total: 0 };
  storytellingTagline: string = 'Initializing Portfolio Metrics...';
  storyIcon: string = '⏳';

  constructor(public gov: GovernanceService) {}

  ngOnInit(): void {
    // 1. Subscribe to PM Data
    this.gov.masterPMs$.subscribe((data: MasterPM[]) => {
      this.pms = data;
    });

    // 2. Subscribe to Stats Data
    this.gov.projectStats$.subscribe((data: ProjectStats) => {
      this.stats = data;
      this.updateNarrative();
    });
  }

  updateNarrative(): void {
    const ratio = this.stats.unassigned / this.stats.total;
    this.storytellingTagline = ratio > 0.15 
      ? `Operational Focus: ${this.stats.unassigned} workstreams currently require resource allocation.`
      : `High Strategic Alignment: Portfolio is operating at peak governed capacity.`;
    this.storyIcon = ratio > 0.15 ? '🚀' : '💎';
  }

  getPieStyle(): string {
    // Prevents division by zero if stats haven't loaded yet
    if (this.stats.total === 0) return '#E2E8F0';
    const p = (this.stats.assigned / this.stats.total) * 100;
    return `conic-gradient(#007DFE 0% ${p}%, #E2E8F0 ${p}% 100%)`;
  }
}
