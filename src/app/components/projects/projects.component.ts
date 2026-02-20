import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GovernanceService, Project } from '../../services/governance.service';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mck-container">
      <div class="mck-hero">
        <div class="hero-flex">
          <div>
            <span class="eyebrow">Portfolio Operations</span>
            <h1>Project Registry & Controls</h1>
          </div>
          <div class="hero-actions">
            <button class="btn-outline">↓ Download Upload Template</button>
            <button class="btn-primary">+ Mass Upload Projects</button>
          </div>
        </div>

        <div class="filter-strip">
          <input type="text" placeholder="Filter by Name/Lead..." class="search-input">
          <select class="filter-select">
            <option>All Phases</option>
            <option>Execution</option>
            <option>Planning</option>
          </select>
          <select class="filter-select">
            <option>All Statuses</option>
            <option>On Track</option>
            <option>Delayed</option>
          </select>
        </div>
      </div>

      <div class="mck-card table-wrapper">
        <table class="mck-table">
          <thead>
            <tr>
              <th>Workstream</th>
              <th>Timelines (Start / Proj. / Actual)</th>
              <th>Budget Utilization</th>
              <th>Sign-off Scope</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of gov.projects">
              <td>
                <strong>{{ p.name }}</strong><br>
                <small class="meta">{{ p.id }} | {{ p.owner }}</small>
              </td>
              <td class="date-cell">
                <div class="date-row"><span>S:</span> {{ p.startDate }}</div>
                <div class="date-row"><span>P:</span> {{ p.projectedEndDate }}</div>
                <div class="date-row"><span [class.active]="p.actualEndDate">A:</span> {{ p.actualEndDate || '---' }}</div>
              </td>
              <td>
                <div class="usage-container">
                  <div class="usage-text">{{ (p.spent / p.budget) * 100 | number:'1.0-0' }}%</div>
                  <div class="usage-track">
                    <div class="usage-fill" [style.width.%]="(p.spent / p.budget) * 100"></div>
                  </div>
                </div>
              </td>
              <td>
                <div class="attachment-box" [class.has-file]="p.hasAttachment">
                  <span class="paperclip">📎</span>
                  {{ p.hasAttachment ? 'Scope_Signed.pdf' : 'No Attachment' }}
                </div>
              </td>
              <td>
                <span class="status-pill" [ngClass]="p.status.toLowerCase().replace(' ', '-')">
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
    .mck-container { padding: 40px; background: #f5f7f9; min-height: 100vh; font-family: sans-serif; }
    .mck-hero { background: #001E3C; color: white; padding: 40px; border-radius: 4px; margin-bottom: 30px; border-bottom: 4px solid #007DFE; }
    .hero-flex { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; }
    .eyebrow { color: #007DFE; text-transform: uppercase; font-size: 11px; font-weight: 700; letter-spacing: 2px; }
    
    .hero-actions { display: flex; gap: 12px; }
    .btn-primary { background: #007DFE; color: white; border: none; padding: 10px 20px; border-radius: 4px; font-weight: 600; cursor: pointer; }
    .btn-outline { background: transparent; color: white; border: 1px solid rgba(255,255,255,0.3); padding: 10px 20px; border-radius: 4px; cursor: pointer; }

    /* Filters */
    .filter-strip { display: flex; gap: 15px; background: rgba(255,255,255,0.05); padding: 15px; border-radius: 4px; }
    .search-input { flex: 1; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: white; padding: 8px 12px; border-radius: 4px; }
    .filter-select { background: #001E3C; color: white; border: 1px solid rgba(255,255,255,0.2); padding: 8px 12px; border-radius: 4px; }

    .mck-card { background: white; border: 1px solid #e2e8f0; border-radius: 4px; overflow-x: auto; }
    .mck-table { width: 100%; border-collapse: collapse; min-width: 900px; }
    .mck-table th { text-align: left; padding: 15px 20px; background: #f8fafc; font-size: 11px; color: #64748b; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; }
    .mck-table td { padding: 15px 20px; border-bottom: 1px solid #f1f5f9; font-size: 13px; vertical-align: middle; }

    /* Date Cells */
    .date-cell { font-family: monospace; line-height: 1.4; }
    .date-row span { color: #94a3b8; font-weight: 700; margin-right: 5px; }
    .date-row span.active { color: #007DFE; }

    /* Attachment Box */
    .attachment-box { font-size: 11px; color: #94a3b8; border: 1px dashed #e2e8f0; padding: 6px; border-radius: 4px; display: inline-block; }
    .attachment-box.has-file { border-style: solid; color: #001E3C; background: #f8fafc; }
    .paperclip { margin-right: 4px; }

    /* Budget */
    .usage-track { width: 100px; height: 5px; background: #eee; border-radius: 3px; margin-top: 4px; }
    .usage-fill { height: 100%; background: #007DFE; }

    /* Status */
    .status-pill { padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; white-space: nowrap; }
    .on-track { background: #ecfdf5; color: #10b981; }
    .delayed { background: #fffbeb; color: #f59e0b; }
    .critical { background: #fef2f2; color: #ef4444; }
  `]
})
export class ProjectsComponent {
  constructor(public gov: GovernanceService) {}
}
