import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';

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
  successRate: number; // For PM success rate
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
  change?: string; // e.g., "+3 this month"
}

@Component({
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
    /* Base Layout & Cards */
    .dashboard-wrapper { padding: 25px; background: #f8fafc; font-family: 'Inter', sans-serif; overflow-x: hidden; }
    .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
    .kpi-card { 
      background: white; padding: 20px; border-radius: 12px; display: flex; 
      align-items: center; gap: 15px; border: 1px solid #e2e8f0; 
      transition: all 0.3s ease;
    }
    .shadow-hover:hover { transform: translateY(-5px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); border-color: #3b82f6; }
    .kpi-icon { width: 45px; height: 45px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px; }
    .kpi-icon.blue { background: #eff6ff; } .kpi-icon.green { background: #f0fdf4; }
    .kpi-icon.yellow { background: #fffbeb; } .kpi-icon.check { background: #f0fdfa; }
    .kpi-info { flex-grow: 1; }
    .count { display: block; font-size: 24px; font-weight: 800; color: #1e293b; }
    .label { font-size: 13px; color: #64748b; font-weight: 500; }
    .change-info { font-size: 11px; color: #22c55e; font-weight: 600; }

    .main-content-split { display: grid; grid-template-columns: 1.5fr 1fr; gap: 25px; }
    .card { background: white; border-radius: 12px; padding: 24px; border: 1px solid #e2e8f0; }
    .card-header { margin-bottom: 20px; }
    .card-header h3 { margin: 0; font-size: 18px; color: #1e293b; }
    .sub-text { font-size: 12px; color: #94a3b8; }

    /* PM Success Rate */
    .pm-row { margin-bottom: 18px; }
    .pm-meta { display: flex; justify-content: space-between; font-size: 14px; font-weight: 600; margin-bottom: 8px; color: #475569; }
    .progress-container { height: 8px; background: #f1f5f9; border-radius: 10px; }
    .progress-bar { height: 100%; border-radius: 10px; transition: width 1s ease-in-out; }

    /* Upcoming Deadlines */
    .deadline-item { display: flex; align-items: center; gap: 15px; padding: 12px 0; border-bottom: 1px solid #f1f5f9; }
    .deadline-marker { width: 8px; height: 8px; border-radius: 50%; }
    .deadline-info { flex-grow: 1; }
    .deadline-info strong { display: block; font-size: 14px; color: #1e293b; }
    .deadline-info span { font-size: 12px; color: #94a3b8; }
    .deadline-chip { padding: 4px 10px; border-radius: 20px; background: #f0fdf4; color: #166534; font-size: 11px; font-weight: 700; }
    .deadline-chip.urgent { background: #fef2f2; color: #991b1b; }
    
    /* Storytelling Bar & Mood Indicator */
    .storytelling-bar { 
      background: white; border-radius: 12px; padding: 18px 24px; margin-bottom: 25px;
      display: flex; align-items: center; gap: 15px; font-size: 16px; font-weight: 600;
      box-shadow: 0 4px 6px rgba(0,0,0,0.05);
      border-left: 8px solid; /* For mood color */
    }
    .storytelling-bar.positive { border-left-color: #22c55e; background-color: #f0fdf4; color: #166534; }
    .storytelling-bar.neutral { border-left-color: #3b82f6; background-color: #eff6ff; color: #1e40af; }
    .storytelling-bar.warning { border-left-color: #f59e0b; background-color: #fffbeb; color: #854d0e; }
    .storytelling-bar.critical { border-left-color: #ef4444; background-color: #fef2f2; color: #991b1b; }
    
    .mood-emoji { font-size: 24px; }
    .story-text { flex-grow: 1; }
  `]
})
export class DashboardComponent implements OnInit {
  // Sample Data (replace with actual service calls)
  projects: Project[] = [
    { name: 'ERP Migration', pm: 'Alice M.', status: 'Active', deadline: 'Feb 25', daysRemaining: 5, country: 'Kenya', currency: 'KES', budget: 850000, spent: 612000, successRate: 92 },
    { name: 'CRM Integration', pm: 'James K.', status: 'Active', deadline: 'Mar 1', daysRemaining: 9, country: 'Uganda', currency: 'UGX', budget: 500000, spent: 400000, successRate: 85 },
    { name: 'HR Portal', pm: 'Sarah T.', status: 'On Hold', deadline: 'Mar 8', daysRemaining: 16, country: 'USA', currency: 'USD', budget: 150000, spent: 50000, successRate: 78 },
    { name: 'Data Warehouse', pm: 'David O.', status: 'Completed', deadline: 'Mar 15', daysRemaining: 23, country: 'Kenya', currency: 'KES', budget: 700000, spent: 650000, successRate: 71 },
    { name: 'Mobile App v2', pm: 'Linda N.', status: 'Planning', deadline: 'Mar 20', daysRemaining: 28, country: 'Uganda', currency: 'UGX', budget: 200000, spent: 0, successRate: 65 },
    { name: 'Security Audit', pm: 'Unassigned', status: 'Planning', deadline: 'Apr 1', daysRemaining: 40, country: 'Kenya', currency: 'KES', budget: 100000, spent: 0, successRate: 0 } // Unassigned project
  ];

  kpis: KPI[] = []; // Initialized here

  pmPerformance: PMPerformance[] = [
    { name: 'Alice M.', rate:
