import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GovernanceService, MasterPM } from '../../services/governance.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mck-container">
      <div class="mck-hero">
        <span class="eyebrow">Portfolio Strategy</span>
        <h1>Operational Excellence Hub</h1>
      </div>
      <div class="mck-grid">
        <div class="mck-card">
          <h3>Workload Distribution</h3>
          <div class="pie-placeholder"></div>
          <div class="legend"><span>Assigned: 14</span><span>Unassigned: 2</span></div>
        </div>
        <div class="mck-card">
          <h3>Resource Performance Registry</h3>
          <div *ngFor="let pm of pms" class="pm-row">
            <div class="pm-meta"><span>{{pm.name}}</span><strong>{{pm.rate}}%</strong></div>
            <div class="progress-track"><div class="fill" [style.width.%]="pm.rate"></div></div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`.mck-container { padding: 30px; background: #f5f7f9; min-height: 100vh; }
    .mck-hero { background: #001E3C; color: white; padding: 40px; border-radius: 4px; margin-bottom: 25px; border-bottom: 4px solid #007DFE; }
    .eyebrow { color: #007DFE; font-weight: 700; text-transform: uppercase; font-size: 11px; }
    .mck-grid { display: grid; grid-template-columns: 1fr 1.5fr; gap: 25px; }
    .mck-card { background: white; padding: 25px; border: 1px solid #e2e8f0; border-radius: 4px; }
    .pie-placeholder { width: 120px; height: 120px; border-radius: 50%; background: conic-gradient(#007DFE 85%, #e2e8f0 0); margin: 20px auto; }
    .pm-row { margin-bottom: 15px; }
    .progress-track { height: 6px; background: #f1f5f9; border-radius: 3px; }
    .fill { height: 100%; background: #007DFE; }`]
})
export class DashboardComponent implements OnInit {
  pms: MasterPM[] = [];
  constructor(public gov: GovernanceService) {}
  ngOnInit() { this.gov.masterPMs$.subscribe(data => this.pms = data); }
}
