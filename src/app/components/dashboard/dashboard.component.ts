import { Component, OnInit } from '@angular/core'; // Fixes TS2304: OnInit
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { GovernanceService } from '../../services/governance.service';

// --- INTERFACES: Define here to fix TS2304 and TS2552 ---
interface Project {
  name: string;
  pm: string;
  status: 'Active' | 'On Hold' | 'Completed' | 'Planning';
  deadline: string;
  daysRemaining: number;
  country: string;
  currency: string;
  budget: number;
  spent: number;
  successRate: number;
}

interface PMPerformance {
  name: string;
  rate: number;
}

interface KPI {
  title: string;
  value: number;
  icon: string;
  color: 'blue' | 'green' | 'yellow' | 'check';
  change?: string;
}

@Component({ // Fixes TS-992007: Ensures class is decorated
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  animations: [
    trigger('staggerFade', [
      transition(':enter', [
        query('.kpi-card, .pm-row, .deadline-item', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger(100, [
            animate('500ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ]),
    trigger('growWidth', [
      transition(':enter', [
        style({ width: '0%' }),
        animate('1000ms 500ms ease-out', style({ width: '*' }))
      ])
    ]),
    trigger('taglineAppear', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('600ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ],
  template: `
    <div class="dashboard-wrapper">
      <div class="storytelling-bar" [ngClass]="getMood()" @taglineAppear>
        <span class="mood-emoji">{{ getMoodEmoji() }}</span>
        <span class="story-text">{{ storytellingTagline }}</span>
      </div>

      <div class="kpi-grid" @staggerFade>
        <div class="kpi-card shadow-hover" *ngFor="let k of kpis">
          <span class="kpi-icon" [ngClass]="k.color">{{ k.icon }}</span>
          <div class="kpi-info">
            <span class="count">{{ k.value }}</span>
            <span class="label">{{ k.title }}</span>
            <span *ngIf="k.change" class="change-info">{{ k.change }}</span>
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
                     [@growWidth]
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
    .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
    .kpi-card { background: white; padding: 20px; border-radius: 12px; display: flex; align-items: center; gap: 15px; border: 1px solid #e2e8f0; }
    .kpi-icon { width: 45px; height: 45px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
    .kpi-icon.blue { background: #eff6ff; } .kpi-icon.green { background: #f0fdf4; }
    .kpi-icon.yellow { background: #fffbeb; } .kpi-icon.check { background: #f0fdfa; }
    .count { display: block; font-size: 24px; font-weight: 800; }
    .main-content-split { display: grid; grid-template-columns: 1.5fr 1fr; gap: 25px; }
    .card { background: white; border-radius: 12px; padding: 24px; border: 1px solid #e2e8f0; }
    .progress-container { height: 8px; background: #f1f5f9; border-radius: 10px; overflow: hidden; }
    .progress-bar { height: 100%; transition: width 1s ease-in-out; }
    .deadline-item { display: flex; align-items: center; gap: 15px; padding: 12px 0; border-bottom: 1px solid #f1f5f9; }
    .deadline-marker { width: 8px; height: 8px; border-radius: 50%; }
    .storytelling-bar { padding: 18px 24px; margin-bottom: 25px; border-radius: 12px; border-left: 8px solid; display: flex; gap: 15px; align-items: center; }
    .storytelling-bar.positive { border-left-color: #22c55e; background: #f0fdf4; color: #166534; }
    .storytelling-bar.warning { border-left-color: #f59e0b; background: #fffbeb; color: #854d0e; }
  `]
})
export class DashboardComponent implements OnInit {
  projects: Project[] = [ // Fixes TS2304: Project
    { name: 'ERP Migration', pm: 'Alice M.', status: 'Active', deadline: 'Feb 25', daysRemaining: 5, country: 'Kenya', currency: 'KES', budget: 850000, spent: 612000, successRate: 92 },
    { name: 'CRM Integration', pm: 'James K.', status: 'Active', deadline: 'Mar 1', daysRemaining: 9, country: 'Uganda', currency: 'UGX', budget: 500000, spent: 400000, successRate: 85 },
    { name: 'HR Portal', pm: 'Sarah T.', status: 'On Hold', deadline: 'Mar 8', daysRemaining: 16, country: 'USA', currency: 'USD', budget: 150000, spent: 50000, successRate: 78 }
  ];

  kpis: KPI[] = []; // Fixes TS2304: KPI
  pmPerformance: PMPerformance[] = [ // Fixes TS2552: PMPerformance
    { name: 'Alice M.', rate: 92 },
    { name: 'James K.', rate: 85 },
    { name: 'Sarah T.', rate: 78 }
  ];

  storytellingTagline: string = '';

  constructor(public gov: GovernanceService) {}

  // FIXED: Explicit implementation to satisfy 'OnInit'
  ngOnInit(): void {
    this.calculateKPIs();
    this.storytellingTagline = "Portfolio status is stable. 82% of projects are on track.";
  }

  private calculateKPIs(): void {
    this.kpis = [
      { title: 'Active Projects', value: 2, icon: '🚀', color: 'blue', change: '+1 this week' },
      { title: 'Upcoming Deadlines', value: 1, icon: '⏰', color: 'yellow' },
      { title: 'Completed', value: 0, icon: '✅', color: 'check' }
    ];
  }

  getMood() { return 'positive'; }
  getMoodEmoji() { return '🌟'; }
  getBarColor(rate: number) { return rate > 80 ? '#22c55e' : '#3b82f6'; }
  getMarkerColor(days: number) { return days < 7 ? '#ef4444' : '#3b82f6'; }
}
