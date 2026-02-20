import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GovernanceService, MasterPM, ProjectStats } from '../../services/governance.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-analytics">
      
      <div class="story-banner" [ngClass]="getStoryClass()">
        <div class="story-icon">{{ storyIcon }}</div>
        <div class="story-content">
          <h4>Executive Summary</h4>
          <p>{{ storytellingTagline }}</p>
        </div>
      </div>

      <div class="analytics-grid">
        <div class="card analytics-card">
          <h3>Workload Distribution</h3>
          <div class="pie-wrapper">
            <div class="pie-chart" [style.background]="getPieChartStyle()"></div>
            <div class="legend">
              <div class="legend-row">
                <span class="dot blue"></span> 
                <span>Assigned: <strong>{{ stats.assigned }}</strong></span>
              </div>
              <div class="legend-row">
                <span class="dot gray"></span> 
                <span>Unassigned: <strong>{{ stats.unassigned }}</strong></span>
              </div>
            </div>
          </div>
        </div>

        <div class="card analytics-card">
          <h3>PM Performance Insights</h3>
          <div class="pm-list">
            <div *ngFor="let pm of pms" class="pm-item">
              <div class="pm-labels">
                <span>{{ pm.name }} ({{ pm.department }})</span>
                <strong>{{ pm.rate }}%</strong>
              </div>
              <div class="bar-bg">
                <div class="bar-fill" [style.width.%]="pm.rate"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-analytics { padding: 2rem; background: #f8fafc; min-height: 100vh; font-family: 'Inter', sans-serif; }
    
    .story-banner { display: flex; align-items: center; gap: 1.5rem; padding: 1.5rem; border-radius: 12px; margin-bottom: 2rem; border-left: 6px solid; }
    .story-banner.healthy { background: #f0fdf4; border-color: #22c55e; color: #166534; }
    .story-banner.alert { background: #fffbeb; border-color: #f59e0b; color: #854d0e; }
    .story-icon { font-size: 2rem; }
    .story-content h4 { margin: 0; font-size: 0.75rem; text-transform: uppercase; color: #64748b; }
    .story-content p { margin: 0.25rem 0 0; font-size: 1.1rem; font-weight: 600; }

    .analytics-grid { display: grid; grid-template-columns: 1fr 1.5fr; gap: 2rem; }
    .card { background: white; padding: 1.5rem; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
    
    .pie-wrapper { display: flex; flex-direction: column; align-items: center; gap: 1.5rem; margin-top: 1rem; }
    .pie-chart { width: 160px; height: 160px; border-radius: 50%; border: 5px solid #fff; box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1); }
    
    .legend { width: 100%; }
    .legend-row { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem; font-size: 0.9rem; }
    .dot { width: 10px; height: 10px; border-radius: 50%; }
    .dot.blue { background: #3b82f6; }
    .dot.gray { background: #e2e8f0; }

    .pm-item { margin-bottom: 1.25rem; }
    .pm-labels { display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 0.4rem; color: #1e293b; }
    .bar-bg { height: 8px; background: #f1f5f9; border-radius: 4px; overflow: hidden; }
    .bar-fill { height: 100%; background: #3b82f6; transition: width 1s ease-out; }
  `]
})
export class DashboardComponent implements OnInit {
  pms: MasterPM[] = [];
  stats: ProjectStats = { assigned: 0, unassigned: 0, total: 0 };
  storytellingTagline: string = '';
  storyIcon: string = '📊';

  constructor(public gov: GovernanceService) {}

  // Resolves TS2420: Correctly implements OnInit
  ngOnInit(): void {
    this.gov.masterPMs$.subscribe(data => this.pms = data);
    
    this.gov.projectStats$.subscribe(data => {
      this.stats = data;
      this.updateStory();
    });
  }

  updateStory(): void {
    const ratio = this.stats.unassigned / this.stats.total;
    if (ratio > 0.25) {
      this.storytellingTagline = `Action Required: ${this.stats.unassigned} projects are currently unassigned. This exceeds the 25% safety threshold.`;
      this.storyIcon = '⚠️';
    } else {
      this.storytellingTagline = `Operational Excellence: ${this.stats.assigned} projects are fully active. Resource utilization is optimized.`;
      this.storyIcon = '✅';
    }
  }

  getStoryClass() {
    return (this.stats.unassigned / this.stats.total) > 0.25 ? 'alert' : 'healthy';
  }

  // Generates the Pie Chart look without external libraries
  getPieChartStyle() {
    const percent = (this.stats.assigned / this.stats.total) * 100;
    return `conic-gradient(#3b82f6 0% ${percent}%, #e2e8f0 ${percent}% 100%)`;
  }
}
