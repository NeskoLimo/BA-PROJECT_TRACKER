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
              <div class="legend-row"><span class="dot blue"></span> Assigned: {{ stats.assigned }}</div>
              <div class="legend-row"><span class="dot gray"></span> Unassigned: {{ stats.unassigned }}</div>
            </div>
          </div>
        </div>

        <div class="card analytics-card">
          <h3>PM Performance Insights</h3>
          <div class="pm-list">
            <div *ngFor="let pm of pms" class="pm-item">
              <div class="pm-labels"><span>{{ pm.name }}</span><strong>{{ pm.rate }}%</strong></div>
              <div class="bar-bg"><div class="bar-fill" [style.width.%]="pm.rate"></div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-analytics { padding: 2rem; background: #f8fafc; min-height: 100vh; font-family: sans-serif; }
    .story-banner { display: flex; align-items: center; gap: 1rem; padding: 1rem; border-radius: 12px; margin-bottom: 2rem; border-left: 6px solid; }
    .story-banner.healthy { background: #f0fdf4; border-color: #22c55e; }
    .story-banner.alert { background: #fffbeb; border-color: #f59e0b; }
    .analytics-grid { display: grid; grid-template-columns: 1fr 1.5fr; gap: 2rem; }
    .card { background: white; padding: 1.5rem; border-radius: 16px; border: 1px solid #e2e8f0; }
    .pie-chart { width: 150px; height: 150px; border-radius: 50%; border: 4px solid #fff; }
    .bar-bg { height: 8px; background: #f1f5f9; border-radius: 4px; overflow: hidden; margin-top: 5px; }
    .bar-fill { height: 100%; background: #3b82f6; transition: width 1s ease-out; }
    .pm-labels { display: flex; justify-content: space-between; font-size: 13px; }
    .pm-item { margin-bottom: 1rem; }
    .dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
    .dot.blue { background: #3b82f6; } .dot.gray { background: #e2e8f0; }
  `]
})
export class DashboardComponent implements OnInit {
  pms: MasterPM[] = [];
  stats: ProjectStats = { assigned: 0, unassigned: 0, total: 0 };
  storytellingTagline: string = '';
  storyIcon: string = '📊';

  constructor(public gov: GovernanceService) {}

  ngOnInit(): void {
    // Subscription ensures UI stays reactive
    this.gov.masterPMs$.subscribe(data => this.pms = data);
    this.gov.projectStats$.subscribe(data => {
      this.stats = data;
      this.updateStory();
    });
  }

  updateStory(): void {
    const ratio = this.stats.unassigned / this.stats.total;
    if (ratio > 0.25) {
      this.storytellingTagline = `Action Required: High unassigned volume (${this.stats.unassigned} projects).`;
      this.storyIcon = '⚠️';
    } else {
      this.storytellingTagline = `Portfolio optimized. ${this.stats.assigned} projects are currently active.`;
      this.storyIcon = '✅';
    }
  }

  getStoryClass() { return (this.stats.unassigned / this.stats.total) > 0.25 ? 'alert' : 'healthy'; }

  getPieChartStyle() {
    const percent = (this.stats.assigned / this.stats.total) * 100;
    return `conic-gradient(#3b82f6 0% ${percent}%, #e2e8f0 ${percent}% 100%)`;
  }
}
