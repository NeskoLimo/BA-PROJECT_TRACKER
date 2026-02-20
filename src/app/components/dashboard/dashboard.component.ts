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
          <span class="eyebrow">Executive Strategy Summary</span>
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
    /* Fixed Visibility: Midnight Navy and High Contrast White */
    .mck-dashboard { padding: 40px; background: #F5F7F9; min-height: 100vh; font-family: 'Helvetica Neue', Arial, sans-serif; }
    
    .mck-hero-banner { 
      background: #001E3C; 
      color: #FFFFFF; 
      padding: 45px; 
      border-radius: 4px; 
      margin-bottom: 30px; 
      border-bottom: 4px solid #007DFE; 
      display: flex; 
      justify-content: space-between; 
      align-items: center;
      box-shadow: 0 4px 20px rgba(0,30,60,0.15);
    }
    
    .eyebrow { font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #007DFE; font-weight: 700; }
    .mck-hero-banner h1 { margin: 12px 0 0; font-size: 30px; font-weight: 300; line-height: 1.2; }
    .banner-icon { font-size: 44px; opacity: 0.8; }

    .mck-grid { display: grid; grid-template-columns: 1fr 1.6fr; gap: 30px; }
    
    .mck-card { background: #FFFFFF; padding: 30px; border-radius: 4px; border: 1px solid #E2E8F0; box-shadow: 0 2px 10px rgba(0,0,0,0.03); }
    .card-title { color: #001E3C; font-size: 18px; font-weight: 600; margin-bottom: 25px; border-bottom: 1px solid #F1F5F9; padding-bottom: 12px; }

    /* Pie Chart Styling */
    .pie-container { display: flex; flex-direction: column; align-items: center; gap: 20px; }
    .pie-chart { width: 170px; height: 170px; border-radius: 50%; border: 6px solid #FFF; box-shadow: 0 8px 16px rgba(0,0,0,0.08); }
    
    .legend-row { display: flex; align-items: center; gap: 12px; margin-top: 10px; font-size: 14px; color: #475569; }
    .dot { width: 10px; height: 10px; border-radius: 2px; }
    .dot.assigned { background: #007DFE; }
    .dot.unassigned { background: #E2E8F0; }

    /* Progress Bar Styling */
    .pm-row { margin-bottom: 22px; }
    .pm-meta { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
    .pm-name { font-weight: 600; color: #001E3C; }
    .pm-rate { font-weight: 700; color: #007DFE; }
    
    .mck-progress-track { height: 6px; background: #F1F5F9; border-radius: 3px; overflow: hidden; }
    .mck-progress-fill { height: 100%; background: #007DFE; border-radius: 3px; transition: width 1s ease-in-out; }
  `]
})
export class DashboardComponent implements OnInit {
  pms: MasterPM[] = [];
  stats: ProjectStats = { assigned: 0, unassigned: 0, total: 0 };
  storytellingTagline: string = '';
  storyIcon: string = '📈';

  constructor(public gov: GovernanceService) {}

  ngOnInit(): void {
    // FIX: Explicitly type the data as MasterPM[] to resolve TS7006
    this.gov.masterPMs$.subscribe((data: MasterPM[]) => {
      this.pms = data;
    });

    // FIX: Explicitly type the data as ProjectStats to resolve TS7006
    this.gov.projectStats$.subscribe((data: ProjectStats) => {
      this.stats = data;
      this.updateNarrative();
    });
  }

  /**
   * Dynamic Storytelling Tagline Logic
   * Updates based on the current assigned/unassigned ratio.
   */
  updateNarrative(): void {
    const unassignedRatio = this.stats.unassigned / this.stats.total;
    
    if (unassignedRatio > 0.15) {
      this.storytellingTagline = `The portfolio requires reallocation: ${this.stats.unassigned} workstreams are currently unassigned.`;
      this.storyIcon = '🚀';
    } else {
      this.storytellingTagline = `Operational excellence achieved: ${this.stats.assigned} workstreams are actively governed.`;
      this.storyIcon = '💎';
    }
  }

  /**
   * Generates CSS Conic Gradient for the Pie Chart
   * Assigned = McKinsey Sky Blue (#007DFE)
   * Unassigned = Professional Grey (#E2E8F0)
   */
  getPieStyle(): string {
    const p = (this.stats.assigned / this.stats.total) * 100;
    return `conic-gradient(#007DFE 0% ${p}%, #E2E8F0 ${p}% 100%)`;
  }
}
