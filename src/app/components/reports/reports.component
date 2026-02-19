import { Component, inject } from '@angular/core';
import { NgFor, NgClass, DecimalPipe, DatePipe } from '@angular/common';
import { ProjectService } from '../../services/project.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [NgFor, NgClass, DecimalPipe, DatePipe],
  template: `
    <div class="reports-page">

      <div class="page-header">
        <div>
          <p class="section-label">Analytics</p>
          <h1 class="page-title">Portfolio Reports</h1>
          <p class="dash-sub">Generated {{ now | date:'EEEE, d MMMM yyyy' }}</p>
        </div>
        <button class="btn btn-primary" (click)="printReport()">⬇ Export Report</button>
      </div>

      <!-- Summary Cards -->
      <div class="summary-row">
        <div class="summary-card card">
          <p class="s-label">Portfolio Size</p>
          <p class="s-value">{{ stats().total }}</p>
          <p class="s-sub">Total Projects</p>
        </div>
        <div class="summary-card card">
          <p class="s-label">Average Progress</p>
          <p class="s-value">{{ stats().avgProgress }}<small>%</small></p>
          <div class="progress-bar" style="margin-top:8px"><div class="progress-fill" [style.width.%]="stats().avgProgress"></div></div>
        </div>
        <div class="summary-card card">
          <p class="s-label">Total Budget</p>
          <p class="s-value">{{ totalBudget() | number }}</p>
          <p class="s-sub">KES across all projects</p>
        </div>
        <div class="summary-card card">
          <p class="s-label">Budget Spent</p>
          <p class="s-value">{{ totalSpent() | number }}</p>
          <p class="s-sub">{{ overallBurnRate() }}% burn rate</p>
        </div>
      </div>

      <!-- Status Breakdown -->
      <div class="reports-grid">
        <div class="card report-card">
          <div class="card-header" style="padding:20px;border-bottom:1px solid var(--border-subtle)">
            <h2 class="card-title">Status Breakdown</h2>
          </div>
          <div class="status-bars" style="padding:20px">
            @for (row of statusBreakdown(); track row.status) {
              <div class="status-row">
                <div class="status-row-label">
                  <span class="status-dot" [style.background]="row.color" [style.box-shadow]="'0 0 6px ' + row.color"></span>
                  <span>{{ row.status }}</span>
                </div>
                <div class="status-row-bar">
                  <div class="bar-bg">
                    <div class="bar-fill" [style.width.%]="row.pct" [style.background]="row.color + '80'"></div>
                  </div>
                </div>
                <div class="status-row-meta">
                  <span class="count">{{ row.count }}</span>
                  <span class="pct">{{ row.pct }}%</span>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Priority Matrix -->
        <div class="card report-card">
          <div class="card-header" style="padding:20px;border-bottom:1px solid var(--border-subtle)">
            <h2 class="card-title">Priority Distribution</h2>
          </div>
          <div class="priority-matrix" style="padding:20px">
            @for (row of priorityBreakdown(); track row.priority) {
              <div class="priority-row">
                <span class="priority-chip" [ngClass]="'priority-' + row.priority.toLowerCase()">{{ row.priority }}</span>
                <div class="bar-bg" style="flex:1">
                  <div class="bar-fill" [style.width.%]="row.pct" style="background:rgba(59,130,246,0.4)"></div>
                </div>
                <span class="pct-label">{{ row.count }} ({{ row.pct }}%)</span>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Full Project Report Table -->
      <div class="card" style="overflow:hidden; margin-top:0">
        <div class="card-header" style="padding:20px;border-bottom:1px solid var(--border-subtle)">
          <h2 class="card-title">Full Project Status Report</h2>
          <span style="font-family:var(--font-mono);font-size:11px;color:var(--text-muted);">{{ projects().length }} projects</span>
        </div>
        <div style="overflow-x:auto">
          <table class="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Project</th>
                <th>Status</th>
                <th>Phase</th>
                <th>Priority</th>
                <th>Progress</th>
                <th>Budget (KES)</th>
                <th>Spent (KES)</th>
                <th>Burn %</th>
                <th>Due Date</th>
                <th>Sponsor</th>
              </tr>
            </thead>
            <tbody>
              @for (p of projects(); track p.id; let i = $index) {
                <tr>
                  <td style="color:var(--text-muted);font-family:var(--font-mono);font-size:11px">{{ i + 1 }}</td>
                  <td><strong>{{ p.name }}</strong></td>
                  <td><span class="badge" [ngClass]="getBadgeClass(p.status)">{{ p.status }}</span></td>
                  <td>{{ p.phase }}</td>
                  <td><span class="priority-chip" [ngClass]="'priority-' + p.priority.toLowerCase()">{{ p.priority }}</span></td>
                  <td>
                    <div style="display:flex;align-items:center;gap:6px">
                      <div class="progress-bar" style="width:80px"><div class="progress-fill" [style.width.%]="p.progress"></div></div>
                      <span style="font-family:var(--font-mono);font-size:11px;color:var(--text-muted)">{{ p.progress }}%</span>
                    </div>
                  </td>
                  <td style="font-family:var(--font-mono);font-size:12px">{{ p.budget | number }}</td>
                  <td style="font-family:var(--font-mono);font-size:12px" [style.color]="p.budgetSpent > p.budget ? 'var(--red-400)' : ''">{{ p.budgetSpent | number }}</td>
                  <td style="font-family:var(--font-mono);font-size:12px" [style.color]="getBurnColor(p.budgetSpent, p.budget)">{{ getBurn(p.budgetSpent, p.budget) }}%</td>
                  <td style="font-family:var(--font-mono);font-size:11px">{{ p.dueDate | date:'dd MMM yy' }}</td>
                  <td style="font-size:12px;color:var(--text-muted)">{{ p.sponsor }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Risks Summary -->
      <div class="card" style="overflow:hidden;margin-top:0">
        <div class="card-header" style="padding:20px;border-bottom:1px solid var(--border-subtle)">
          <h2 class="card-title">Risk Register</h2>
          <span class="badge badge-at-risk">{{ totalRisks() }} risks logged</span>
        </div>
        <div style="overflow-x:auto">
          <table class="data-table">
            <thead>
              <tr><th>Project</th><th>Risk</th><th>Likelihood</th><th>Impact</th><th>Mitigation</th></tr>
            </thead>
            <tbody>
              @for (r of allRisks(); track r.id) {
                <tr>
                  <td><strong>{{ r.projectName }}</strong></td>
                  <td style="max-width:240px;white-space:normal">{{ r.description }}</td>
                  <td><span class="badge" [ngClass]="getRiskBadge(r.likelihood)">{{ r.likelihood }}</span></td>
                  <td><span class="badge" [ngClass]="getRiskBadge(r.impact)">{{ r.impact }}</span></td>
                  <td style="font-size:12px;color:var(--text-secondary);max-width:260px;white-space:normal">{{ r.mitigation }}</td>
                </tr>
              }
              @if (allRisks().length === 0) {
                <tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:32px">No risks logged across projects</td></tr>
              }
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .reports-page { max-width: 1200px; display: flex; flex-direction: column; gap: 24px; }
    .page-header { display: flex; align-items: flex-start; justify-content: space-between; }
    .page-title { font-size: clamp(24px, 3vw, 36px); font-weight: 800; letter-spacing: -0.02em; color: var(--text-primary); }
    .dash-sub { font-family: var(--font-mono); font-size: 12px; color: var(--text-muted); margin-top: 6px; }
    .summary-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
    @media (max-width: 900px) { .summary-row { grid-template-columns: repeat(2,1fr); } }
    .summary-card { padding: 22px; }
    .s-label { font-family: var(--font-mono); font-size: 10px; text-transform: uppercase; letter-spacing: 0.14em; color: var(--text-muted); margin-bottom: 8px; }
    .s-value { font-size: 34px; font-weight: 800; color: var(--text-primary); line-height: 1; }
    .s-value small { font-size: 20px; color: var(--text-secondary); }
    .s-sub { font-size: 12px; color: var(--text-muted); margin-top: 4px; }
    .reports-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    @media (max-width: 700px) { .reports-grid { grid-template-columns: 1fr; } }
    .report-card { overflow: hidden; }
    .card-title { font-size: 15px; font-weight: 700; color: var(--text-primary); }
    .card-header { display: flex; align-items: center; justify-content: space-between; }
    .status-row { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
    .status-row-label { display: flex; align-items: center; gap: 8px; width: 100px; font-size: 13px; color: var(--text-secondary); flex-shrink: 0; }
    .status-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .status-row-bar { flex: 1; }
    .bar-bg { height: 6px; background: rgba(59,130,246,0.08); border-radius: 3px; overflow: hidden; }
    .bar-fill { height: 100%; border-radius: 3px; transition: width 1s ease; }
    .status-row-meta { display: flex; gap: 8px; width: 60px; justify-content: flex-end; }
    .count { font-family: var(--font-mono); font-size: 12px; color: var(--text-primary); font-weight: 600; }
    .pct { font-family: var(--font-mono); font-size: 11px; color: var(--text-muted); }
    .priority-row { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
    .pct-label { font-family: var(--font-mono); font-size: 11px; color: var(--text-muted); width: 80px; text-align: right; }
    .priority-chip { font-family: var(--font-mono); font-size: 10px; padding: 2px 8px; border-radius: 3px; font-weight: 500; white-space: nowrap; flex-shrink: 0; width: 72px; text-align: center; }
    .priority-critical { background: rgba(248,113,113,0.15); color: var(--red-400); }
    .priority-high     { background: rgba(251,191,36,0.12);  color: var(--amber-400); }
    .priority-medium   { background: rgba(96,165,250,0.12);  color: var(--blue-300); }
    .priority-low      { background: rgba(74,222,128,0.10);  color: var(--green-400); }
  `]
})
export class ReportsComponent {
  private svc = inject(ProjectService);
  stats    = this.svc.stats;
  projects = this.svc.projects;
  now      = new Date();

  totalBudget()  { return this.projects().reduce((s, p) => s + p.budget, 0); }
  totalSpent()   { return this.projects().reduce((s, p) => s + p.budgetSpent, 0); }
  overallBurnRate() {
    const b = this.totalBudget();
    return b > 0 ? Math.round((this.totalSpent() / b) * 100) : 0;
  }
  totalRisks() { return this.projects().reduce((s, p) => s + p.risks.length, 0); }

  allRisks() {
    const result: any[] = [];
    this.projects().forEach(p => p.risks.forEach(r => result.push({ ...r, projectName: p.name })));
    return result;
  }

  statusBreakdown() {
    const colors: Record<string, string> = {
      'On Track': '#4ade80', 'At Risk': '#fbbf24', 'Delayed': '#f87171',
      'Completed': '#60a5fa', 'Planning': '#67e8f9'
    };
    const total = this.stats().total || 1;
    return ['On Track','At Risk','Delayed','Completed','Planning'].map(status => ({
      status,
      count: this.projects().filter(p => p.status === status).length,
      pct: Math.round((this.projects().filter(p => p.status === status).length / total) * 100),
      color: colors[status]
    }));
  }

  priorityBreakdown() {
    const total = this.stats().total || 1;
    return ['Critical','High','Medium','Low'].map(priority => ({
      priority,
      count: this.projects().filter(p => p.priority === priority).length,
      pct: Math.round((this.projects().filter(p => p.priority === priority).length / total) * 100)
    }));
  }

  getBurn(spent: number, budget: number) { return budget > 0 ? Math.round((spent / budget) * 100) : 0; }
  getBurnColor(spent: number, budget: number) {
    const r = this.getBurn(spent, budget);
    if (r > 100) return 'var(--red-400)';
    if (r > 85)  return 'var(--amber-400)';
    return '';
  }

  getBadgeClass(status: string): string {
    const map: Record<string, string> = {
      'On Track': 'badge badge-on-track', 'At Risk': 'badge badge-at-risk',
      'Delayed': 'badge badge-delayed', 'Completed': 'badge badge-completed', 'Planning': 'badge badge-planning'
    };
    return map[status] || 'badge';
  }

  getRiskBadge(level: string) {
    if (level === 'High')   return 'badge badge-delayed';
    if (level === 'Medium') return 'badge badge-at-risk';
    return 'badge badge-planning';
  }

  printReport() { window.print(); }
}

