import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { GovernanceService } from '../../services/governance.service';

interface Project {
  name: string; pm: string; status: string; deadline: string;
  daysRemaining: number; country: string; currency: string;
  budget: number; spent: number; successRate: number;
}

interface KPI {
  title: string; value: number; icon: string; color: string; change?: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  animations: [
    trigger('staggerFade', [
      transition(':enter', [
        query('.kpi-card, .pm-row', [
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
    ])
  ],
  template: `
    <div class="dashboard-wrapper">
      <div class="kpi-grid" @staggerFade>
        <div class="kpi-card" *ngFor="let k of kpis">
          <span class="kpi-icon" [ngClass]="k.color">{{ k.icon }}</span>
          <div class="kpi-info">
            <span class="count">{{ k.value }}</span>
            <span class="label">{{ k.title }}</span>
          </div>
        </div>
      </div>

      <div class="main-content-split">
        <div class="card chart-card">
          <h3>PM Success Rate (Live from Master Data)</h3>
          <div class="success-list">
            <div *ngFor="let pm of gov.masterPMs" class="pm-row">
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
      </div>
    </div>
  `,
  styles: [`
    .dashboard-wrapper { padding: 25px; background: #f8fafc; }
    .kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px; }
    .kpi-card { background: white; padding: 20px; border-radius: 12px; display: flex; gap: 15px; border: 1px solid #e2e8f0; }
    .count { display: block; font-size: 24px; font-weight: 800; }
    .progress-container { height: 8px; background: #f1f5f9; border-radius: 10px; overflow: hidden; margin-top: 5px; }
    .progress-bar { height: 100%; transition: width 0.5s ease-in-out; }
    .pm-row { margin-bottom: 20px; }
    .pm-meta { display: flex; justify-content: space-between; font-weight: 600; font-size: 14px; }
  `]
})
export class DashboardComponent implements OnInit {
  kpis: KPI[] = [];

  constructor(public gov: GovernanceService) {}

  ngOnInit(): void {
    this.kpis = [
      { title: 'Regional Hubs', value: this.gov.masterRegions.length, icon: '🌍', color: 'blue' },
      { title: 'Active PMs', value: this.gov.masterPMs.length, icon: '👥', color: 'green' }
    ];
  }

  getBarColor(rate: number) {
    return rate > 85 ? '#22c55e' : rate > 70 ? '#3b82f6' : '#f59e0b';
  }
}
