import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GovernanceService, Project } from '../../services/governance.service';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mck-container">
      <div class="header-section">
        <div class="title-group">
          <span class="eyebrow">Portfolio Inventory</span>
          <h1>Workstream Registry</h1>
          <p>Standardized tracking for audit and sign-off compliance.</p>
        </div>
        <div class="action-group">
          <button class="btn-secondary">↓ Download Mass Upload Template</button>
          <button class="btn-primary">↑ Mass Upload Projects</button>
        </div>
      </div>

      <div class="filter-strip">
        <div class="search-box">
          <span class="icon">🔍</span>
          <input type="text" placeholder="Filter by Name, Lead, or Location...">
        </div>
        <select class="filter-dropdown">
          <option>All Statuses</option>
          <option>Active</option>
          <option>Critical</option>
          <option>Planning</option>
        </select>
      </div>

      <div class="mck-card table-responsive">
        <table class="mck-table">
          <thead>
            <tr>
              <th>Project Details</th>
              <th>Registry Timelines</th>
              <th>Lead / Owner</th>
              <th>Financial Health</th>
              <th>Progress</th>
              <th>Scope Attachment</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of gov.projects">
              <td>
                <div class="p-name">{{ p.name }}</div>
                <div class="p-meta">{{ p.id }} | {{ p.category }}</div>
                <div class="p-loc">{{ p.location }}</div>
              </td>
              <td class="date-cell">
                <div class="date-row"><span>Start:</span> {{ p.startDate }}</div>
                <div class="date-row"><span>Proj:</span> {{ p.projectedEndDate }}</div>
                <div class="date-row"><span [class.actual]="p.actualEndDate">Actual:</span> {{ p.actualEndDate || '---' }}</div>
              </td>
              <td class="owner-cell">{{ p.owner }}</td>
              <td>
                <div class="budget-main">{{ p.currency }} {{ p.spent | number }}</div>
                <div class="budget-sub">of {{ p.budget | number }}</div>
              </td>
              <td>
                <div class="progress-container">
                  <div class="progress-track"><div class="progress-fill" [style.width.%]="p.progress"></div></div>
                  <span class="progress-text">{{ p.progress }}%</span>
                </div>
              </td>
              <td class="center">
                <div class="attach-chip" [class.signed]="p.hasAttachment">
                  {{ p.hasAttachment ? '📎 Signed' : '⚪ Missing' }}
                </div>
              </td>
              <td>
                <span class="status-pill" [ngClass]="p.status.toLowerCase()">
                  {{ p.status }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .mck-container { padding: 40px; background: #f5f7f9; min-height: 100vh; font-family: 'Inter', sans-serif; }
    .header-section { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; }
    .eyebrow { color: #007DFE; font-weight: 700; text-transform: uppercase; font-size: 11px; letter-spacing: 1.5px; }
    .title-group h1 { color: #001E3C; margin: 10px 0; font-size: 28px; }
    .title-group p { color: #64748b; font-size: 14px; }
    
    .action-group { display: flex; gap: 12px; }
    .btn-primary { background: #001E3C; color: white; border: none; padding: 10px 20px; border-radius: 4px; font-weight: 600; cursor: pointer; }
    .btn-secondary { background: white; color: #001E3C; border: 1px solid #e2e8f0; padding: 10px 20px; border-radius: 4px; font-weight: 600; cursor: pointer; }

    .filter-strip { display: flex; gap: 15px; margin-bottom: 25px; }
    .search-box { flex: 1; background: white; border: 1px solid #e2e8f0; border-radius: 4px; padding: 8px 15px; display: flex; align-items: center; gap: 10px; }
    .search-box input { border: none; outline: none; width: 100%; font-size: 14px; }
    .filter-dropdown { background: white; border: 1px solid #e2e8f0; padding: 8px 15px; border-radius: 4px; color: #64748b; }

    .mck-card { background: white; border: 1px solid #e2e8f0; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
    .mck-table { width: 100%; border-collapse: collapse; }
    .mck-table th { text-align: left; padding: 15px 20px; background: #f8fafc; font-size: 11px; color: #64748b; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; }
    .mck-table td { padding: 15px 20px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; font-size: 13px; }

    .p-name { font-weight: 700; color: #001E3C; }
    .p-meta { font-size: 11px; color: #94a3b8; margin: 2px 0; }
    .p-loc { font-size: 11px; color: #007DFE; font-weight: 600; }

    .date-cell { font-family: monospace; font-size: 11px; line-height: 1.5; }
    .date-row span { color: #94a3b8; width: 45px; display: inline-block; }
    .actual { color: #007DFE; font-weight: 700; }

    .budget-main { font-weight: 700; color: #001E3C; }
    .budget-sub { font-size: 11px; color: #94a3b8; }

    .progress-container { display: flex; align-items: center; gap: 10px; }
    .progress-track { flex: 1; height: 6px; background: #f1f5f9; border-radius: 3px; overflow: hidden; min-width: 60px; }
    .progress-fill { height: 100%; background: #001E3C; }
    .progress-text { font-size: 11px; font-weight: 700; color: #64748b; }

    .attach-chip { font-size: 11px; padding: 4px 8px; border-radius: 4px; background: #f8fafc; border: 1px dashed #e2e8f0; color: #94a3b8; }
    .attach-chip.signed { background: #f0f9ff; border: 1px solid #bae6fd; color: #0369a1; }

    .status-pill { padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; }
    .active { background: #ecfdf5; color: #10b981; }
    .critical { background: #fef2f2; color: #ef4444; }
    .planning { background: #f8fafc; color: #64748b; border: 1px solid #e2e8f0; }
    .center { text-align: center; }
  `]
})
export class ProjectsComponent {
  constructor(public gov: GovernanceService) {}
}
