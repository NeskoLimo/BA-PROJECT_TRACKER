import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="reports-container">
      <div class="report-header">
        <div>
          <h1 class="page-title">Executive Governance Report</h1>
          <p class="subtitle">Real-time Audit Compliance & Resource Health</p>
        </div>
        <button class="btn-secondary" (click)="window.print()">📥 Export PDF</button>
      </div>

      <div class="main-insight-row">
        <div class="card gauge-card">
          <h3>Portfolio Health Gauge</h3>
          <div class="gauge-wrapper">
            <div class="gauge-body" [style.background]="getGaugeGradient()">
              <div class="gauge-cover">
                <span class="gauge-value">{{ complianceScore }}%</span>
                <span class="gauge-label">Compliance</span>
              </div>
            </div>
          </div>
          <div class="gauge-footer">
            <span [class.text-green]="complianceScore >= 85">Above Benchmark (85%)</span>
          </div>
        </div>

        <div class="card breakdown-card">
          <h3>Audit Dimensions</h3>
          <div class="factor-list">
            <div class="factor-item" *ngFor="let factor of complianceFactors">
              <div class="factor-info">
                <span>{{ factor.category }}</span>
                <span class="factor-score">{{ factor.score }}%</span>
              </div>
              <div class="factor-bar">
                <div class="factor-fill" [style.width.%]="factor.score" [ngClass]="factor.status.toLowerCase()"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="detailed-analysis">
        <div class="card insight-card">
          <h3>PM Load Distribution</h3>
          <p class="analysis-text">
            <strong>Resource Risk:</strong> High load detected for 1 lead.
          </p>
          <div class="mini-bar" *ngFor="let load of resourceLoads">
            <div class="bar-info">
              <span>{{ load.name }}</span>
              <span>{{ load.count }} / 4</span>
            </div>
            <div class="bar-bg">
              <div class="bar-fill" [style.width.%]="(load.count / 4) * 100" [class.danger]="load.count > 4"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .reports-container { padding: 30px; background: #f8fafc; min-height: 100vh; font-family: 'Inter', sans-serif; }
    .page-title { font-family: 'Georgia', serif; font-size: 28px; color: #0f172a; margin: 0; }
    .subtitle { color: #64748b; margin: 5px 0 30px; }

    .main-insight-row { display: grid; grid-template-columns: 1fr 1.5fr; gap: 24px; margin-bottom: 24px; }
    .card { background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; }
    
    /* Gauge Styles */
    .gauge-wrapper { display: flex; justify-content: center; padding: 20px 0; }
    .gauge-body { 
      width: 200px; height: 100px; 
      border-top-left-radius: 110px; border-top-right-radius: 110px;
      position: relative; overflow: hidden;
      display: flex; align-items: flex-end; justify-content: center;
    }
    .gauge-cover {
      width: 160px; height: 80px;
      background: white; border-top-left-radius: 90px; border-top-right-radius: 90px;
      display: flex; flex-direction: column; align-items: center; justify-content: flex-end;
      padding-bottom: 10px;
    }
    .gauge-value { font-size: 32px; font-weight: 800; color: #0f172a; }
    .gauge-label { font-size: 11px; text-transform: uppercase; color: #94a3b8; font-weight: 700; }
    .gauge-footer { text-align: center; margin-top: 15px; font-size: 12px; font-weight: 600; }

    /* List Styles */
    .factor-item { margin-bottom: 18px; }
    .factor-info { display: flex; justify-content: space-between; font-size: 13px; font-weight: 600; margin-bottom: 6px; }
    .factor-bar { height: 6px; background: #f1f5f9; border-radius: 10px; }
    .factor-fill { height: 100%; border-radius: 10px; background: #0f172a; }
    .factor-fill.pass { background: #22c55e; }
    .factor-fill.warning { background: #f59e0b; }

    .text-green { color: #22c55e; }
    .mini-bar { margin-bottom: 12px; }
    .bar-bg { height: 8px; background: #f1f5f9; border-radius: 10px; }
    .bar-fill.danger { background: #ef4444; }
  `]
})
export class ReportsComponent implements OnInit {
  window = window;
  complianceScore: number = 92; // Champion Benchmark

  complianceFactors = [
    { category: 'Data Integrity', score: 98, status: 'Pass' },
    { category: 'Resource Balancing', score: 74, status: 'Warning' },
    { category: 'Signature Timelines', score: 89, status: 'Pass' }
  ];

  resourceLoads = [
    { name: 'Alice M.', count: 5 },
    { name: 'James K.', count: 2 }
  ];

  ngOnInit() {}

  getGaugeGradient() {
    const deg = (this.complianceScore / 100) * 180;
    // Creates a speedometer visual: Green to Blue to Grey
    return `conic-gradient(from 270deg, #22c55e 0deg, #0f172a ${deg}deg, #e2e8f0 ${deg}deg 180deg)`;
  }
}
