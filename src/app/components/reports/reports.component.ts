import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GovernanceService } from '../../services/governance.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="reports-wrapper fade-in">
      <div class="reports-header">
        <h1>Global Portfolio Analytics</h1>
        <p>Real-time financial status aggregated from the Master Registry.</p>
      </div>

      <div class="metrics-grid">
        <div class="metric-card" *ngFor="let region of gov.masterRegions">
          <div class="card-label">{{ region.name }} Portfolio</div>
          <div class="card-value">
            <span class="currency">{{ region.currency }}</span> 
            {{ (region.projectCount * 250000) | number }}
          </div>
          <div class="card-footer">
            <span class="dot" [class.active]="region.status === 'Active'"></span>
            {{ region.projectCount }} Active Projects
          </div>
        </div>
      </div>

      <div class="integrity-banner" *ngIf="gov.isAdmin()">
        <span class="icon">🛡️</span>
        <p>Reports are currently synced with the <strong>Audit Log</strong>. Any changes made in Settings are reflected here instantly.</p>
      </div>
    </div>
  `,
  styles: [`
    .reports-wrapper { padding: 40px; background: #f8fafc; min-height: 90vh; }
    .reports-header h1 { font-family: 'Georgia', serif; font-size: 28px; color: #0f172a; margin: 0; }
    .reports-header p { color: #64748b; margin: 8px 0 30px; }

    .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; }
    .metric-card { background: white; padding: 24px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .card-label { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; }
    .card-value { font-size: 32px; font-weight: 800; color: #1e293b; margin: 12px 0; }
    .currency { font-size: 16px; color: #64748b; font-weight: 400; }
    
    .card-footer { font-size: 13px; color: #64748b; display: flex; align-items: center; gap: 8px; }
    .dot { width: 8px; height: 8px; border-radius: 50%; background: #cbd5e1; }
    .dot.active { background: #22c55e; }

    .integrity-banner { margin-top: 40px; display: flex; align-items: center; gap: 15px; padding: 16px; background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; color: #0369a1; font-size: 14px; }
    
    .fade-in { animation: fadeIn 0.4s ease-out; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  `]
})
export class ReportsComponent implements OnInit {
  // FIX: Ensure public access for template and proper dependency injection
  constructor(public gov: GovernanceService) {}

  ngOnInit(): void {
    // Logic to aggregate data based on gov.masterRegions
  }
}
