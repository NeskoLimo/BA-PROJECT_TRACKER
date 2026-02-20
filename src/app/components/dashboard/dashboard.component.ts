import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GovernanceService, MasterPM, ProjectStats } from '../../services/governance.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mckinsey-dashboard">
      
      <div class="story-banner" [ngClass]="getStoryClass()">
        <div class="story-content">
          <span class="eyebrow">Executive Strategy Summary</span>
          <h1>{{ storytellingTagline }}</h1>
        </div>
        <div class="story-icon">{{ storyIcon }}</div>
      </div>

      <div class="analytics-grid">
        <div class="mck-card">
          <h3>Project Allocation</h3>
          <div class="pie-layout">
            <div class="pie-chart" [style.background]="getPieStyle()"></div>
            <div class="legend">
              <div class="legend-item"><span class="dot assigned"></span> Assigned ({{ stats.assigned }})</div>
              <div class="legend-item"><span class="dot unassigned"></span> Unassigned ({{ stats.unassigned }})</div>
            </div>
          </div>
        </div>

        <div class="mck-card">
          <h3>PM Performance Registry</h3>
          <div class="pm-performance-list">
            <div *ngFor="let pm of gov.masterPMs" class="pm-row">
              <div class="pm-info">
                <span class="pm-name">{{ pm.name }}</span>
                <span class="pm-rate">{{ pm.rate }}%</span>
              </div>
              <div class="mck-progress-bg">
                <div class="mck-progress-fill" [style.width.%]="pm.rate"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* McKinsey Aesthetic Styling */
    .mckinsey-dashboard { padding: 40px; background: #F5F7F9; min-height: 100vh; font-family: 'Helvetica Neue', Arial, sans-serif; }
    
    .story-banner { 
      background: #001E3C; 
      color: #FFFFFF; 
      padding: 40px; 
      border-radius: 4px; 
      margin-bottom: 30px; 
      display: flex; 
      justify-content: space-between; 
      align-items: center;
      border-bottom: 4px solid #007DFE;
    }
    .eyebrow { font-size: 12px; text-transform: uppercase; letter-spacing: 2px; color: #007DFE; font-weight: 700; }
    .story-banner h1 { margin: 10px 0 0; font-size: 28px; font-weight: 300; line-height: 1.2; }
    .story-icon { font-size: 40px; opacity: 0.8; }

    .analytics-grid { display: grid; grid-template-columns: 1fr 1.5fr; gap: 30px; }
    
    .mck-card { 
      background: #FFFFFF; 
      padding: 30px; 
      border-radius: 4px; 
      box-shadow: 0 2px 15px rgba(0,0,0,0.05); 
      border-top: 1px solid #E2E8F0;
    }
    .mck-card h3 { color: #001E3C; font-size: 18px; margin-bottom: 25px; border-bottom: 1px solid #E2E8F0; padding-bottom: 10px; }

    /* Pie Chart */
    .pie-layout { display: flex; flex-direction: column; align-items: center; gap: 20px; }
    .pie-chart { width: 160px; height: 160px; border-radius: 50%; border: 4px solid #fff; }
    .legend-item { display: flex; align-items: center; gap: 10px; font-size: 14px; color: #001E3C; margin-top: 5px; }
    .dot { width: 10px; height: 10px; border-radius: 2px; }
    .dot.assigned { background: #007DFE; }
    .dot.unassigned { background: #E2E8F0; }

    /* Progress Bars */
    .pm-row { margin-bottom: 20px; }
    .pm-info { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; font-weight: 500; color: #001E3C; }
    .mck-progress-bg { height: 6px; background: #E2E8F0; border-radius: 3px; overflow: hidden; }
    .mck-progress-fill { height: 100%; background: #007DFE; transition: width 1s ease-out; }
  `]
})
export class DashboardComponent implements OnInit {
  stats: ProjectStats = { assigned: 0, unassigned: 0, total: 0 };
  storytellingTagline: string = '';
  storyIcon: string = '📈';

  constructor(public gov: GovernanceService) {}

  ngOnInit(): void {
    this.gov.projectStats$.subscribe(data => {
      this.stats = data;
      this.updateStory();
    });
  }

  updateStory(): void {
    const ratio = this.stats.unassigned / this.stats.total;
    if (ratio > 0.15) {
      this.storytellingTagline = `The portfolio requires active redistribution of ${this.stats.unassigned} unassigned workstreams to maintain efficiency.`;
      this.storyIcon = '🚀';
    } else {
      this.storytellingTagline = `Strategic alignment is optimized with ${this.stats.assigned} workstreams currently operating under governance.`;
      this.storyIcon = '💎';
    }
  }

  getStoryClass() { return 'healthy'; }
  getPieStyle() {
    const p = (this.stats.assigned / this.stats.total) * 100;
    return `conic-gradient(#007DFE 0% ${p}%, #E2E8F0 ${p}% 100%)`;
  }
}
