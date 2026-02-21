// src/app/components/reports/reports.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DecimalPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GovernanceService, Project, AuditEntry, ActionType } from '../../services/governance.service';

interface RegionSummary {
  name: string; currency: string; budget: number; spent: number;
  projectCount: number; activeCount: number; flag: string;
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, DecimalPipe, DatePipe, FormsModule],
  template: `
<div class="rpt">

  <!-- ══ HEADER ══════════════════════════════════════════════════════════════ -->
  <header class="rpt-header">
    <div>
      <p class="eyebrow">Intelligence & Analytics</p>
      <h1>Reports Centre</h1>
      <p class="sub">Generated {{ now | date:'EEEE d MMMM y, HH:mm' }} · {{ gov.currentUser().name }}</p>
    </div>
    <div class="hdr-actions">
      <button class="btn-export" (click)="printReport()">🖨 Print / PDF</button>
      <button class="btn-primary" (click)="exportAllCsv()">↓ Export All CSV</button>
    </div>
  </header>

  <!-- ══ TABS ════════════════════════════════════════════════════════════════ -->
  <nav class="tabs">
    <button class="tab" [class.active]="tab === 'summary'"     (click)="tab = 'summary'">📋 Executive Summary</button>
    <button class="tab" [class.active]="tab === 'performance'" (click)="tab = 'performance'">📊 Project Performance</button>
    <button class="tab" [class.active]="tab === 'budget'"      (click)="tab = 'budget'">💰 Budget & Financial</button>
    <button class="tab" [class.active]="tab === 'audit'"       (click)="tab = 'audit'">🔍 Audit & Compliance</button>
    <button class="tab" [class.active]="tab === 'regional'"    (click)="tab = 'regional'">🌍 Regional Analysis</button>
    <button class="tab" [class.active]="tab === 'raw'"         (click)="tab = 'raw'">🗄 Raw Data</button>
  </nav>

  <!-- ══ EXECUTIVE SUMMARY ═══════════════════════════════════════════════════ -->
  <div *ngIf="tab === 'summary'" class="tab-body print-section">

    <!-- Auto-narrative -->
    <div class="narrative-card">
      <div class="nc-stripe"></div>
      <div class="nc-body">
        <div class="nc-label">AUTO-GENERATED EXECUTIVE BRIEF</div>
        <p class="nc-text" [innerHTML]="executiveBrief"></p>
      </div>
    </div>

    <!-- KPI grid -->
    <div class="sum-kpi-grid">
      <div class="sum-kpi" *ngFor="let k of summaryKpis">
        <div class="sk-icon">{{ k.icon }}</div>
        <div class="sk-val" [style.color]="k.color">{{ k.value }}</div>
        <div class="sk-lbl">{{ k.label }}</div>
        <div class="sk-sub">{{ k.sub }}</div>
      </div>
    </div>

    <!-- Status breakdown -->
    <div class="two-col">

      <div class="panel">
        <div class="panel-hd"><span class="panel-title">Status Distribution</span></div>
        <div class="status-bars">
          <div class="sb-row" *ngFor="let s of statusBreakdown">
            <div class="sb-label">{{ s.status }}</div>
            <div class="sb-track">
              <div class="sb-fill" [style.width.%]="s.pct" [style.background]="s.color"></div>
            </div>
            <div class="sb-count">{{ s.count }} <span class="sb-pct">({{ s.pct | number:'1.0-0' }}%)</span></div>
          </div>
        </div>
      </div>

      <div class="panel">
        <div class="panel-hd"><span class="panel-title">Phase Distribution</span></div>
        <div class="status-bars">
          <div class="sb-row" *ngFor="let p of phaseBreakdown">
            <div class="sb-label">{{ p.phase }}</div>
            <div class="sb-track">
              <div class="sb-fill" [style.width.%]="p.pct" [style.background]="p.color"></div>
            </div>
            <div class="sb-count">{{ p.count }} <span class="sb-pct">({{ p.pct | number:'1.0-0' }}%)</span></div>
          </div>
        </div>
      </div>

    </div>

    <!-- Risk flags -->
    <div class="panel" *ngIf="riskFlags.length > 0">
      <div class="panel-hd">
        <span class="panel-title">⚠️ Portfolio Risk Flags</span>
        <span class="panel-sub">{{ riskFlags.length }} item{{ riskFlags.length > 1 ? 's' : '' }} require attention</span>
      </div>
      <div class="risk-list">
        <div class="risk-item" *ngFor="let r of riskFlags" [ngClass]="'risk-' + r.level">
          <span class="risk-icon">{{ r.level === 'high' ? '🔴' : r.level === 'medium' ? '🟡' : '🟢' }}</span>
          <div class="risk-body">
            <div class="risk-title">{{ r.title }}</div>
            <div class="risk-desc">{{ r.desc }}</div>
          </div>
          <span class="risk-chip" [ngClass]="'rc-' + r.level">{{ r.level | uppercase }}</span>
        </div>
      </div>
    </div>

  </div>

  <!-- ══ PROJECT PERFORMANCE ══════════════════════════════════════════════════ -->
  <div *ngIf="tab === 'performance'" class="tab-body print-section">

    <!-- Filters -->
    <div class="filter-bar">
      <div class="fb-group">
        <label>Status</label>
        <select [(ngModel)]="perfStatus">
          <option value="">All Statuses</option>
          <option>Active</option><option>Critical</option>
          <option>Planning</option><option>Closure</option>
        </select>
      </div>
      <div class="fb-group">
        <label>Phase</label>
        <select [(ngModel)]="perfPhase">
          <option value="">All Phases</option>
          <option>Initiation</option><option>Planning</option>
          <option>Execution</option><option>Closure</option>
        </select>
      </div>
      <div class="fb-group">
        <label>Sort by</label>
        <select [(ngModel)]="perfSort">
          <option value="name">Name</option>
          <option value="progress">Progress</option>
          <option value="budget">Budget</option>
          <option value="status">Status</option>
        </select>
      </div>
      <div class="fb-count">{{ filteredProjects().length }} project{{ filteredProjects().length !== 1 ? 's' : '' }}</div>
      <button class="btn-sm-exp" (click)="exportProjectsCsv()">↓ CSV</button>
    </div>

    <!-- Performance table -->
    <div class="panel tbl-panel">
      <table class="data-table">
        <thead>
          <tr>
            <th (click)="perfSort='name'"    [class.sorted]="perfSort==='name'">Project ↕</th>
            <th>Owner</th>
            <th>Location</th>
            <th (click)="perfSort='status'"  [class.sorted]="perfSort==='status'">Status ↕</th>
            <th>Phase</th>
            <th (click)="perfSort='progress'"[class.sorted]="perfSort==='progress'">Progress ↕</th>
            <th (click)="perfSort='budget'"  [class.sorted]="perfSort==='budget'">Budget ↕</th>
            <th>Timeline</th>
            <th>Docs</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let p of filteredProjects()" [class.row-critical]="p.status === 'Critical'">
            <td class="td-name">{{ p.name }}</td>
            <td class="td-muted">{{ p.owner }}</td>
            <td class="td-muted">{{ p.location }}</td>
            <td><span class="status-chip" [ngClass]="'sc-' + p.status.toLowerCase()">{{ p.status }}</span></td>
            <td><span class="phase-chip"  [ngClass]="p.phase.toLowerCase()">{{ p.phase }}</span></td>
            <td>
              <div class="prog-cell">
                <div class="prog-track">
                  <div class="prog-fill"
                       [style.width.%]="gov.getCalculatedProgress(p)"
                       [style.background]="p.status === 'Critical' ? '#ef4444' : '#0057FF'">
                  </div>
                </div>
                <span class="prog-pct">{{ gov.getCalculatedProgress(p) }}%</span>
              </div>
            </td>
            <td class="td-num">KES {{ (p.budget / 1000) | number:'1.0-0' }}K</td>
            <td class="td-muted td-dates">
              <div>{{ p.startDate | date:'d MMM yy' }}</div>
              <div class="td-end" [class.overdue]="isOverdue(p)">→ {{ p.projectedEndDate | date:'d MMM yy' }}</div>
            </td>
            <td class="td-center">
              <span *ngIf="p.hasAttachment" title="Scope document attached">📎</span>
              <span *ngIf="!p.hasAttachment" class="no-doc" title="No scope document">—</span>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="empty-row" *ngIf="filteredProjects().length === 0">No projects match the selected filters.</div>
    </div>

    <!-- Summary footer -->
    <div class="perf-summary-strip">
      <div class="pss-item">
        <span class="pss-val">{{ avgProgress | number:'1.0-0' }}%</span>
        <span class="pss-lbl">Average progress</span>
      </div>
      <div class="pss-item">
        <span class="pss-val">{{ overdueCount }}</span>
        <span class="pss-lbl">Overdue projects</span>
      </div>
      <div class="pss-item">
        <span class="pss-val">{{ docRate | number:'1.0-0' }}%</span>
        <span class="pss-lbl">Documentation rate</span>
      </div>
      <div class="pss-item">
        <span class="pss-val">KES {{ (totalBudget / 1_000_000) | number:'1.1-1' }}M</span>
        <span class="pss-lbl">Total portfolio value</span>
      </div>
    </div>

  </div>

  <!-- ══ BUDGET & FINANCIAL ════════════════════════════════════════════════════ -->
  <div *ngIf="tab === 'budget'" class="tab-body print-section">

    <div class="budget-kpis">
      <div class="bk-card" *ngFor="let b of budgetKpis">
        <div class="bk-label">{{ b.label }}</div>
        <div class="bk-val" [style.color]="b.color">{{ b.value }}</div>
        <div class="bk-sub">{{ b.sub }}</div>
      </div>
    </div>

    <!-- Stacked bar chart -->
    <div class="panel">
      <div class="panel-hd">
        <span class="panel-title">Allocated vs Utilised per Project</span>
        <button class="btn-sm-exp" (click)="exportBudgetCsv()">↓ CSV</button>
      </div>
      <div class="stacked-chart">
        <div class="sc-row" *ngFor="let p of gov.projects">
          <div class="sc-label">{{ p.name }}</div>
          <div class="sc-bars">
            <!-- Allocated -->
            <div class="sc-track">
              <div class="sc-alloc" [style.width.%]="(p.budget / maxBudget) * 100"
                   [title]="'Allocated: KES ' + p.budget">
                <span class="sc-bar-lbl">KES {{ (p.budget/1000)|number:'1.0-0' }}K</span>
              </div>
            </div>
            <!-- Utilised -->
            <div class="sc-track sc-track-sm">
              <div class="sc-spent" [style.width.%]="(getSpent(p) / maxBudget) * 100"
                   [title]="'Utilised: KES ' + getSpent(p)">
              </div>
              <span class="sc-pct-lbl">{{ gov.getCalculatedProgress(p) }}% utilised</span>
            </div>
          </div>
          <div class="sc-variance" [class.over]="getSpent(p) > p.budget">
            {{ ((getSpent(p) / p.budget) * 100) | number:'1.0-0' }}%
          </div>
        </div>
      </div>
      <div class="chart-key">
        <span><span class="ck-alloc"></span> Allocated budget</span>
        <span><span class="ck-spent"></span> Estimated utilisation (by progress)</span>
      </div>
    </div>

    <!-- Budget table -->
    <div class="panel tbl-panel">
      <div class="panel-hd"><span class="panel-title">Financial Detail</span></div>
      <table class="data-table">
        <thead>
          <tr>
            <th>Project</th><th>Phase</th><th>Allocated (KES)</th>
            <th>Utilised (KES)</th><th>Remaining (KES)</th><th>Burn Rate</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let p of gov.projects">
            <td class="td-name">{{ p.name }}</td>
            <td><span class="phase-chip" [ngClass]="p.phase.toLowerCase()">{{ p.phase }}</span></td>
            <td class="td-num">{{ p.budget | number }}</td>
            <td class="td-num">{{ getSpent(p) | number }}</td>
            <td class="td-num" [class.td-green]="getRemaining(p) > 0" [class.td-red]="getRemaining(p) < 0">
              {{ getRemaining(p) | number }}
            </td>
            <td>
              <div class="burn-cell">
                <div class="burn-track">
                  <div class="burn-fill"
                       [style.width.%]="gov.getCalculatedProgress(p)"
                       [style.background]="gov.getCalculatedProgress(p) > 85 ? '#ef4444' : gov.getCalculatedProgress(p) > 60 ? '#f59e0b' : '#10b981'">
                  </div>
                </div>
                <span>{{ gov.getCalculatedProgress(p) }}%</span>
              </div>
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr class="tfoot-row">
            <td colspan="2"><strong>TOTAL</strong></td>
            <td class="td-num"><strong>{{ totalBudget | number }}</strong></td>
            <td class="td-num"><strong>{{ totalSpent | number }}</strong></td>
            <td class="td-num" [class.td-green]="totalBudget - totalSpent > 0">
              <strong>{{ totalBudget - totalSpent | number }}</strong>
            </td>
            <td><strong>{{ (totalSpent / totalBudget * 100) | number:'1.0-0' }}%</strong></td>
          </tr>
        </tfoot>
      </table>
    </div>

  </div>

  <!-- ══ AUDIT & COMPLIANCE ════════════════════════════════════════════════════ -->
  <div *ngIf="tab === 'audit'" class="tab-body print-section">

    <div class="filter-bar">
      <div class="fb-group">
        <label>Action Type</label>
        <select [(ngModel)]="auditAction">
          <option value="">All Actions</option>
          <option *ngFor="let a of auditActions" [value]="a">{{ a }}</option>
        </select>
      </div>
      <div class="fb-group">
        <label>Operator</label>
        <select [(ngModel)]="auditUser">
          <option value="">All Operators</option>
          <option *ngFor="let u of auditUsers" [value]="u">{{ u }}</option>
        </select>
      </div>
      <div class="fb-count">{{ filteredAuditLog().length }} event{{ filteredAuditLog().length !== 1 ? 's' : '' }}</div>
      <button class="btn-sm-exp" (click)="exportAuditCsv()">↓ CSV</button>
    </div>

    <!-- Compliance summary -->
    <div class="compliance-strip">
      <div class="cs-item" *ngFor="let c of complianceSummary">
        <span class="csi-icon">{{ c.icon }}</span>
        <div>
          <div class="csi-val">{{ c.value }}</div>
          <div class="csi-lbl">{{ c.label }}</div>
        </div>
      </div>
    </div>

    <div class="panel tbl-panel">
      <table class="data-table">
        <thead>
          <tr>
            <th>Timestamp</th><th>Action</th><th>Operator</th><th>Details</th><th>Session</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let e of filteredAuditLog()">
            <td class="td-mono">{{ e.time | date:'d MMM y, HH:mm:ss' }}</td>
            <td><span class="action-tag" [ngClass]="'at-' + e.action.toLowerCase()">{{ e.action }}</span></td>
            <td class="td-name">{{ e.user }}</td>
            <td class="td-muted">{{ e.details }}</td>
            <td class="td-mono td-muted">{{ e.id?.slice(0,8) ?? '—' }}</td>
          </tr>
        </tbody>
      </table>
      <div class="empty-row" *ngIf="filteredAuditLog().length === 0">No audit events match these filters.</div>
    </div>

  </div>

  <!-- ══ REGIONAL ANALYSIS ════════════════════════════════════════════════════ -->
  <div *ngIf="tab === 'regional'" class="tab-body print-section">

    <div class="regional-kpis">
      <div class="rk-card" *ngFor="let r of regions">
        <div class="rk-hd">
          <span class="rk-flag">{{ r.flag }}</span>
          <span class="rk-status-dot"
                [style.background]="r.activeCount > 0 ? '#10b981' : '#94a3b8'">
          </span>
        </div>
        <div class="rk-region">{{ r.name }}</div>
        <div class="rk-currency">{{ r.currency }}</div>
        <div class="rk-budget">{{ r.budget | number }}</div>
        <div class="rk-sub">Allocated budget</div>
        <div class="rk-divider"></div>
        <div class="rk-stats">
          <div class="rk-stat">
            <span class="rk-stat-val">{{ r.projectCount }}</span>
            <span class="rk-stat-lbl">Projects</span>
          </div>
          <div class="rk-stat">
            <span class="rk-stat-val" style="color:#10b981">{{ r.activeCount }}</span>
            <span class="rk-stat-lbl">Active</span>
          </div>
          <div class="rk-stat">
            <span class="rk-stat-val">{{ r.projectCount > 0 ? ((r.spent / r.budget)*100)|number:'1.0-0' : 0 }}%</span>
            <span class="rk-stat-lbl">Utilised</span>
          </div>
        </div>
        <!-- Mini spend bar -->
        <div class="rk-bar-track" *ngIf="r.budget > 0">
          <div class="rk-bar-fill" [style.width.%]="(r.spent / r.budget) * 100"></div>
        </div>
      </div>
    </div>

    <!-- Regional comparison table -->
    <div class="panel tbl-panel">
      <div class="panel-hd">
        <span class="panel-title">Regional Comparison</span>
        <button class="btn-sm-exp" (click)="exportRegionalCsv()">↓ CSV</button>
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th>Region</th><th>Currency</th><th>Projects</th><th>Active</th>
            <th>Allocated Budget</th><th>Estimated Spend</th><th>Utilisation</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let r of regions">
            <td class="td-name">{{ r.flag }} {{ r.name }}</td>
            <td class="td-mono">{{ r.currency }}</td>
            <td class="td-center">{{ r.projectCount }}</td>
            <td class="td-center" style="color:#10b981"><strong>{{ r.activeCount }}</strong></td>
            <td class="td-num">{{ r.budget | number }}</td>
            <td class="td-num">{{ r.spent | number }}</td>
            <td>
              <div class="burn-cell" *ngIf="r.budget > 0; else noData">
                <div class="burn-track">
                  <div class="burn-fill" [style.width.%]="(r.spent/r.budget)*100"
                       [style.background]="(r.spent/r.budget) > .85 ? '#ef4444' : '#10b981'"></div>
                </div>
                <span>{{ (r.spent / r.budget * 100) | number:'1.0-0' }}%</span>
              </div>
              <ng-template #noData><span class="td-muted">—</span></ng-template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

  </div>

</div>

<!-- ══ RAW DATA TAB ══════════════════════════════════════════════════════════ -->
  <div *ngIf="tab === 'raw'" class="tab-body print-section">

    <div class="raw-toolbar">
      <div class="raw-tabs">
        <button class="raw-tab" [class.on]="rawView === 'projects'"  (click)="rawView = 'projects'">Projects ({{ gov.projects.length }})</button>
        <button class="raw-tab" [class.on]="rawView === 'audit'"     (click)="rawView = 'audit'">Audit Log ({{ gov.auditLog.length }})</button>
      </div>
      <div class="raw-actions">
        <input class="raw-search" type="text" [(ngModel)]="rawSearch"
               placeholder="Search across all fields...">
        <button class="btn-sm-exp" (click)="rawView === 'projects' ? exportProjectsCsv() : exportAuditCsv()">↓ CSV</button>
        <button class="btn-export" (click)="exportRawJson()">↓ JSON</button>
      </div>
    </div>

    <!-- Raw projects table -->
    <div class="panel tbl-panel" *ngIf="rawView === 'projects'">
      <div class="raw-meta">
        Showing {{ filteredRawProjects().length }} of {{ gov.projects.length }} records ·
        <span class="raw-schema">Schema: projects@v1 · {{ gov.projects.length > 0 ? 'DB-ready' : '' }}</span>
      </div>
      <div class="raw-scroll">
        <table class="data-table raw-table">
          <thead>
            <tr>
              <th>id</th><th>name</th><th>owner</th><th>location</th>
              <th>phase</th><th>status</th><th>startDate</th>
              <th>projectedEndDate</th><th>actualEndDate</th>
              <th>budget</th><th>hasAttachment</th><th>attachmentUrl</th>
              <th>progress%</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of filteredRawProjects()">
              <td class="td-mono raw-id">{{ p.id }}</td>
              <td class="td-name">{{ p.name }}</td>
              <td class="td-muted">{{ p.owner }}</td>
              <td class="td-muted">{{ p.location }}</td>
              <td><span class="phase-chip" [ngClass]="p.phase.toLowerCase()">{{ p.phase }}</span></td>
              <td><span class="status-chip" [ngClass]="'sc-' + p.status.toLowerCase()">{{ p.status }}</span></td>
              <td class="td-mono">{{ p.startDate }}</td>
              <td class="td-mono">{{ p.projectedEndDate }}</td>
              <td class="td-mono">{{ p.actualEndDate ?? '—' }}</td>
              <td class="td-num">{{ p.budget | number }}</td>
              <td class="td-center">
                <span class="bool-chip" [class.bool-t]="p.hasAttachment" [class.bool-f]="!p.hasAttachment">
                  {{ p.hasAttachment ? 'true' : 'false' }}
                </span>
              </td>
              <td class="td-mono td-muted">{{ p.attachmentUrl ?? 'null' }}</td>
              <td class="td-num">{{ gov.getCalculatedProgress(p) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Raw audit log table -->
    <div class="panel tbl-panel" *ngIf="rawView === 'audit'">
      <div class="raw-meta">
        Showing {{ filteredRawAudit().length }} of {{ gov.auditLog.length }} records ·
        <span class="raw-schema">Schema: audit_log@v1</span>
      </div>
      <div class="raw-scroll">
        <table class="data-table raw-table">
          <thead>
            <tr>
              <th>id</th><th>time (ISO)</th><th>action</th><th>user</th><th>details</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let e of filteredRawAudit()">
              <td class="td-mono raw-id">{{ e.id ?? '—' }}</td>
              <td class="td-mono">{{ e.time.toISOString() }}</td>
              <td><span class="action-tag" [ngClass]="'at-' + e.action.toLowerCase()">{{ e.action }}</span></td>
              <td class="td-name">{{ e.user }}</td>
              <td class="td-muted">{{ e.details }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- JSON preview -->
    <div class="panel json-panel">
      <div class="panel-hd">
        <span class="panel-title">JSON Preview</span>
        <span class="panel-sub">first 2 records · full export via ↓ JSON above</span>
      </div>
      <pre class="json-pre">{{ jsonPreview }}</pre>
    </div>

  </div>

<!-- ══ PRINT STYLES ══════════════════════════════════════════════════════════ -->
<style>
  @media print {
    app-navbar, app-sidebar, .tabs, .hdr-actions, .filter-bar .btn-sm-exp,
    .btn-export, .btn-primary { display: none !important; }
    .rpt { padding: 0 !important; }
    .rpt-header { border-bottom: 2px solid #000; }
    .panel { box-shadow: none !important; border: 1px solid #ccc !important; }
    .tab-body { display: block !important; }
  }
</style>
  `,
  styles: [`
    :host {
      --navy: #001E3C; --blue: #0057FF; --blue-lt: #dbeafe;
      --ink: #0f172a; --ink-2: #1e293b; --muted: #64748b;
      --border: #e2e8f0; --bg: #f0f4f8; --surface: #fff;
      --green: #10b981; --red: #ef4444; --amber: #f59e0b; --sky: #0ea5e9; --violet: #7c3aed;
      --r: 10px; --sh: 0 1px 3px rgba(0,0,0,.05), 0 4px 20px rgba(0,0,0,.06);
      --font-d: 'Georgia','Times New Roman',serif;
      --font-b: 'Trebuchet MS','Segoe UI',sans-serif;
      --font-m: 'Courier New',monospace;
      display: block; font-family: var(--font-b);
    }

    .rpt        { padding: 28px 32px; background: var(--bg); min-height: 100vh; display: flex; flex-direction: column; gap: 20px; }

    /* Header */
    .rpt-header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 16px; border-bottom: 1px solid var(--border); }
    .eyebrow    { font-size: 10px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: var(--blue); margin: 0 0 4px; }
    h1          { font-family: var(--font-d); font-size: 26px; font-weight: 700; color: var(--navy); margin: 0 0 4px; }
    .sub        { font-size: 12px; color: var(--muted); margin: 0; }
    .hdr-actions { display: flex; gap: 10px; align-items: center; }
    .btn-export { padding: 9px 16px; background: var(--surface); border: 1px solid var(--border); border-radius: 8px; font-size: 13px; font-weight: 600; color: var(--ink-2); cursor: pointer; }
    .btn-export:hover { background: #f1f5f9; }
    .btn-primary { background: var(--navy); color: #fff; border: none; padding: 10px 18px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: var(--font-b); }
    .btn-primary:hover { background: #0a2a50; }

    /* Tabs */
    .tabs { display: flex; gap: 4px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--r); padding: 6px; width: fit-content; flex-wrap: wrap; }
    .tab  { padding: 8px 16px; border: none; background: none; border-radius: 7px; font-size: 12px; font-weight: 600; color: var(--muted); cursor: pointer; transition: all .15s; white-space: nowrap; }
    .tab.active { background: var(--navy); color: #fff; }
    .tab:hover:not(.active) { background: #f1f5f9; }

    .tab-body { display: flex; flex-direction: column; gap: 16px; }

    /* Panels */
    .panel    { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r); padding: 20px 22px; box-shadow: var(--sh); }
    .tbl-panel { padding: 0; overflow: hidden; }
    .panel-hd { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border-bottom: 1px solid var(--border); }
    .panel-title { font-size: 12px; font-weight: 700; color: var(--ink); text-transform: uppercase; letter-spacing: .8px; }
    .panel-sub   { font-size: 11px; color: var(--muted); }
    .two-col  { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

    /* Narrative card */
    .narrative-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r); padding: 0; overflow: hidden; box-shadow: var(--sh); display: flex; }
    .nc-stripe { width: 6px; background: linear-gradient(180deg, var(--blue), var(--navy)); flex-shrink: 0; }
    .nc-body   { padding: 20px 22px; }
    .nc-label  { font-size: 9px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; color: var(--blue); margin-bottom: 10px; }
    .nc-text   { font-size: 14px; color: var(--ink-2); line-height: 1.8; margin: 0; font-family: var(--font-d); }

    /* Summary KPIs */
    .sum-kpi-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 14px; }
    .sum-kpi  { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r); padding: 18px 16px; box-shadow: var(--sh); text-align: center; }
    .sk-icon  { font-size: 24px; margin-bottom: 8px; }
    .sk-val   { font-family: var(--font-d); font-size: 26px; font-weight: 700; line-height: 1; margin-bottom: 4px; }
    .sk-lbl   { font-size: 11px; font-weight: 700; color: var(--ink-2); text-transform: uppercase; letter-spacing: .5px; }
    .sk-sub   { font-size: 10px; color: var(--muted); margin-top: 3px; }

    /* Status bars */
    .status-bars { display: flex; flex-direction: column; gap: 12px; padding: 16px 20px; }
    .sb-row   { display: flex; align-items: center; gap: 10px; }
    .sb-label { font-size: 12px; font-weight: 600; color: var(--ink-2); width: 80px; flex-shrink: 0; }
    .sb-track { flex: 1; height: 10px; background: #f1f5f9; border-radius: 5px; overflow: hidden; }
    .sb-fill  { height: 100%; border-radius: 5px; transition: width .7s ease; }
    .sb-count { font-size: 12px; font-weight: 700; color: var(--ink); width: 60px; text-align: right; }
    .sb-pct   { font-weight: 400; color: var(--muted); font-size: 11px; }

    /* Risk flags */
    .risk-list  { display: flex; flex-direction: column; gap: 8px; padding: 4px 0; }
    .risk-item  { display: flex; align-items: flex-start; gap: 12px; padding: 12px 14px; border-radius: 8px; }
    .risk-high   { background: #fef2f2; }
    .risk-medium { background: #fffbeb; }
    .risk-low    { background: #f0fdf4; }
    .risk-icon  { font-size: 16px; flex-shrink: 0; margin-top: 1px; }
    .risk-body  { flex: 1; }
    .risk-title { font-size: 13px; font-weight: 700; color: var(--ink); }
    .risk-desc  { font-size: 12px; color: var(--muted); margin-top: 2px; }
    .risk-chip  { font-size: 9px; font-weight: 800; text-transform: uppercase; padding: 3px 8px; border-radius: 4px; flex-shrink: 0; }
    .rc-high   { background: var(--red); color: #fff; }
    .rc-medium { background: var(--amber); color: #fff; }
    .rc-low    { background: var(--green); color: #fff; }

    /* Filter bar */
    .filter-bar { display: flex; align-items: flex-end; gap: 14px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--r); padding: 14px 18px; flex-wrap: wrap; }
    .fb-group   { display: flex; flex-direction: column; gap: 4px; }
    .fb-group label { font-size: 10px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: .5px; }
    .fb-group select { padding: 7px 10px; border: 1px solid var(--border); border-radius: 7px; font-size: 13px; color: var(--ink); outline: none; background: #f8fafc; }
    .fb-group select:focus { border-color: var(--blue); }
    .fb-count   { font-size: 12px; font-weight: 700; color: var(--muted); margin-left: auto; align-self: center; }
    .btn-sm-exp { padding: 7px 13px; background: var(--navy); color: #fff; border: none; border-radius: 7px; font-size: 12px; font-weight: 700; cursor: pointer; }

    /* Data table */
    .data-table  { width: 100%; border-collapse: collapse; font-size: 12px; }
    .data-table th { padding: 10px 14px; font-size: 9px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: .6px; border-bottom: 2px solid var(--border); text-align: left; background: #f8fafc; cursor: pointer; white-space: nowrap; }
    .data-table th.sorted { color: var(--blue); }
    .data-table td { padding: 11px 14px; border-bottom: 1px solid #f5f7fa; vertical-align: middle; }
    .data-table tr:last-child td { border-bottom: none; }
    .data-table tr:hover td { background: #f8fafc; }
    .row-critical td { background: #fff8f8; }
    .tfoot-row td { background: #f8fafc !important; border-top: 2px solid var(--border); font-size: 13px; }
    .td-name  { font-weight: 700; color: var(--ink); }
    .td-muted { color: var(--muted); }
    .td-num   { font-family: var(--font-m); text-align: right; color: var(--ink-2); }
    .td-mono  { font-family: var(--font-m); font-size: 11px; color: var(--muted); white-space: nowrap; }
    .td-center{ text-align: center; }
    .td-green { color: var(--green) !important; font-weight: 700; }
    .td-red   { color: var(--red) !important; font-weight: 700; }
    .td-dates { font-size: 11px; line-height: 1.6; }
    .td-end.overdue { color: var(--red); font-weight: 700; }
    .no-doc   { color: var(--border); }
    .empty-row { padding: 40px; text-align: center; color: var(--muted); font-size: 13px; }

    /* Progress cells */
    .prog-cell  { display: flex; align-items: center; gap: 7px; min-width: 100px; }
    .prog-track { flex: 1; height: 5px; background: var(--border); border-radius: 3px; overflow: hidden; }
    .prog-fill  { height: 100%; border-radius: 3px; transition: width .5s; }
    .prog-pct   { font-size: 11px; font-weight: 700; color: var(--muted); font-family: var(--font-m); width: 34px; }
    .burn-cell  { display: flex; align-items: center; gap: 7px; }
    .burn-track { width: 60px; height: 5px; background: var(--border); border-radius: 3px; overflow: hidden; }
    .burn-fill  { height: 100%; border-radius: 3px; transition: width .5s; }

    /* Perf summary strip */
    .perf-summary-strip { display: grid; grid-template-columns: repeat(4, 1fr); background: var(--navy); border-radius: var(--r); padding: 20px; gap: 1px; }
    .pss-item { text-align: center; padding: 10px; }
    .pss-val  { display: block; font-family: var(--font-d); font-size: 24px; font-weight: 700; color: #fff; }
    .pss-lbl  { display: block; font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: .5px; margin-top: 4px; font-weight: 700; }

    /* Budget */
    .budget-kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
    .bk-card  { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r); padding: 18px 20px; box-shadow: var(--sh); }
    .bk-label { font-size: 10px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: .6px; margin-bottom: 6px; }
    .bk-val   { font-family: var(--font-d); font-size: 24px; font-weight: 700; margin-bottom: 3px; }
    .bk-sub   { font-size: 11px; color: var(--muted); }

    .stacked-chart { display: flex; flex-direction: column; gap: 16px; padding: 4px 0; }
    .sc-row   { display: flex; align-items: center; gap: 12px; }
    .sc-label { font-size: 11px; font-weight: 600; color: var(--muted); width: 160px; flex-shrink: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .sc-bars  { flex: 1; display: flex; flex-direction: column; gap: 4px; }
    .sc-track { height: 18px; background: #f1f5f9; border-radius: 5px; overflow: visible; position: relative; }
    .sc-track-sm { height: 10px; }
    .sc-alloc { height: 100%; background: rgba(0,87,255,.18); border: 1.5px solid var(--blue); border-radius: 5px; display: flex; align-items: center; padding: 0 8px; min-width: 30px; }
    .sc-bar-lbl { font-size: 9px; font-weight: 700; color: var(--blue); white-space: nowrap; }
    .sc-spent { height: 100%; background: var(--green); border-radius: 5px; opacity: .85; }
    .sc-pct-lbl { position: absolute; left: calc(100% + 6px); top: 50%; transform: translateY(-50%); font-size: 10px; color: var(--muted); white-space: nowrap; }
    .sc-variance { font-size: 12px; font-weight: 700; color: var(--ink); font-family: var(--font-m); width: 42px; text-align: right; flex-shrink: 0; }
    .sc-variance.over { color: var(--red); }
    .chart-key { display: flex; gap: 16px; margin-top: 14px; border-top: 1px solid var(--border); padding-top: 12px; }
    .chart-key span { display: flex; align-items: center; gap: 7px; font-size: 11px; color: var(--muted); }
    .ck-alloc { display: inline-block; width: 14px; height: 14px; border-radius: 3px; background: rgba(0,87,255,.18); border: 1.5px solid var(--blue); }
    .ck-spent { display: inline-block; width: 14px; height: 14px; border-radius: 3px; background: var(--green); }

    /* Audit */
    .compliance-strip { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
    .cs-item  { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r); padding: 16px 18px; display: flex; align-items: center; gap: 14px; box-shadow: var(--sh); }
    .csi-icon { font-size: 24px; }
    .csi-val  { font-family: var(--font-d); font-size: 22px; font-weight: 700; color: var(--ink); }
    .csi-lbl  { font-size: 10px; color: var(--muted); text-transform: uppercase; letter-spacing: .5px; font-weight: 700; margin-top: 2px; }
    .action-tag { font-size: 9px; font-weight: 800; text-transform: uppercase; padding: 2px 7px; border-radius: 4px; }
    .at-system  { background: #e0f2fe; color: #0369a1; }
    .at-upload  { background: #f0fdf4; color: #15803d; }
    .at-delete  { background: #fef2f2; color: #dc2626; }
    .at-edit    { background: #fef3c7; color: #92400e; }
    .at-login   { background: #ede9fe; color: #6d28d9; }
    .at-create  { background: #f0fdf4; color: #15803d; }
    .at-update  { background: #e0f2fe; color: #0369a1; }

    /* Regional */
    .regional-kpis { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; }
    .rk-card  { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r); padding: 20px; box-shadow: var(--sh); }
    .rk-hd    { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
    .rk-flag  { font-size: 28px; }
    .rk-status-dot { width: 10px; height: 10px; border-radius: 50%; }
    .rk-region  { font-size: 13px; font-weight: 700; color: var(--ink); margin-bottom: 4px; }
    .rk-currency { font-size: 10px; font-weight: 800; color: var(--muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; }
    .rk-budget  { font-family: var(--font-d); font-size: 26px; font-weight: 700; color: var(--navy); line-height: 1; }
    .rk-sub     { font-size: 10px; color: var(--muted); margin-bottom: 12px; margin-top: 3px; }
    .rk-divider { border-top: 1px solid var(--border); margin: 12px 0; }
    .rk-stats   { display: flex; justify-content: space-between; margin-bottom: 12px; }
    .rk-stat    { display: flex; flex-direction: column; align-items: center; }
    .rk-stat-val { font-size: 16px; font-weight: 800; color: var(--ink); }
    .rk-stat-lbl { font-size: 9px; color: var(--muted); text-transform: uppercase; letter-spacing: .5px; }
    .rk-bar-track { height: 5px; background: var(--border); border-radius: 3px; overflow: hidden; }
    .rk-bar-fill  { height: 100%; background: var(--green); border-radius: 3px; transition: width .7s; }

    /* Chips */
    .status-chip { padding: 3px 9px; border-radius: 20px; font-size: 9px; font-weight: 800; text-transform: uppercase; }
    .sc-active   { background: #ecfdf5; color: #059669; }
    .sc-critical { background: #fef2f2; color: #dc2626; }
    .sc-planning { background: #f1f5f9; color: #64748b; }
    .sc-closure  { background: #e0f2fe; color: #0369a1; }
    .phase-chip  { padding: 2px 7px; border-radius: 4px; font-size: 9px; font-weight: 800; text-transform: uppercase; }
    .initiation  { background: #f1f5f9; color: #64748b; }
    .planning    { background: #eff6ff; color: #1d4ed8; }
    .execution   { background: #ecfdf5; color: #059669; }
    .closure     { background: #e0f2fe; color: #0369a1; }

    /* Raw data tab */
    .raw-toolbar   { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--r); padding: 14px 18px; }
    .raw-tabs      { display: flex; gap: 6px; }
    .raw-tab       { padding: 7px 16px; border: 1px solid var(--border); border-radius: 20px; background: #f8fafc; font-size: 12px; font-weight: 700; color: var(--muted); cursor: pointer; }
    .raw-tab.on    { background: var(--navy); color: #fff; border-color: var(--navy); }
    .raw-actions   { display: flex; gap: 8px; align-items: center; }
    .raw-search    { padding: 7px 12px; border: 1px solid var(--border); border-radius: 7px; font-size: 12px; outline: none; font-family: var(--font-b); width: 220px; }
    .raw-search:focus { border-color: var(--blue); }
    .raw-meta      { padding: 10px 14px; font-size: 11px; color: var(--muted); border-bottom: 1px solid var(--border); background: #f8fafc; }
    .raw-schema    { font-family: var(--font-m); color: var(--blue); }
    .raw-scroll    { overflow-x: auto; }
    .raw-table th  { white-space: nowrap; font-family: var(--font-m); font-size: 9px; }
    .raw-table td  { white-space: nowrap; }
    .raw-id        { color: var(--blue); font-size: 10px; }
    .bool-chip     { font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 4px; font-family: var(--font-m); }
    .bool-t        { background: #f0fdf4; color: #15803d; }
    .bool-f        { background: #fef2f2; color: #dc2626; }
    .json-panel    { }
    .json-pre      { background: #0f172a; color: #a5f3fc; font-family: var(--font-m); font-size: 11px; line-height: 1.7; padding: 18px; border-radius: 8px; overflow-x: auto; margin: 0; white-space: pre; }

    @media (max-width: 1100px) {
      .sum-kpi-grid, .budget-kpis { grid-template-columns: repeat(2, 1fr); }
      .two-col { grid-template-columns: 1fr; }
      .perf-summary-strip { grid-template-columns: repeat(2, 1fr); }
      .compliance-strip { grid-template-columns: repeat(2, 1fr); }
    }
  `]
})
export class ReportsComponent implements OnInit {
  protected readonly gov = inject(GovernanceService);

  tab         = 'summary';
  perfStatus  = '';
  perfPhase   = '';
  perfSort    = 'name';
  auditAction = '';
  auditUser   = '';
  now         = new Date();

  executiveBrief = '';
  summaryKpis:    any[] = [];
  statusBreakdown:any[] = [];
  phaseBreakdown: any[] = [];
  riskFlags:      any[] = [];
  budgetKpis:     any[] = [];
  complianceSummary: any[] = [];
  regions:        RegionSummary[] = [];

  readonly auditActions: ActionType[] = ['SYSTEM','UPLOAD','DELETE','EDIT','LOGIN','CREATE','UPDATE'];
  get auditUsers(): string[] { return [...new Set(this.gov.auditLog.map((e: AuditEntry) => e.user))]; }

  get totalBudget(): number { return this.gov.projects.reduce((s: number, p: Project) => s + p.budget, 0); }
  get totalSpent():  number { return this.gov.projects.reduce((s: number, p: Project) => s + this.getSpent(p), 0); }
  get maxBudget():   number { return Math.max(...this.gov.projects.map((p: Project) => p.budget)); }
  get avgProgress(): number { const ps = this.gov.projects; return ps.reduce((s: number, p: Project) => s + this.gov.getCalculatedProgress(p), 0) / (ps.length || 1); }
  get overdueCount():number { return this.gov.projects.filter((p: Project) => this.isOverdue(p)).length; }
  get docRate():     number { const ps = this.gov.projects; return (ps.filter((p: Project) => p.hasAttachment).length / (ps.length || 1)) * 100; }

  ngOnInit() {
    this.buildSummary();
    this.buildBudgetKpis();
    this.buildRegions();
    this.buildComplianceSummary();
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  getSpent(p: Project):     number { return Math.round(p.budget * (this.gov.getCalculatedProgress(p) / 100)); }
  getRemaining(p: Project): number { return p.budget - this.getSpent(p); }
  isOverdue(p: Project):    boolean {
    if (p.actualEndDate) return false;
    return new Date(p.projectedEndDate) < new Date() && p.status !== 'Closure';
  }

  filteredProjects(): Project[] {
    let list = [...this.gov.projects];
    if (this.perfStatus) list = list.filter(p => p.status === this.perfStatus);
    if (this.perfPhase)  list = list.filter(p => p.phase  === this.perfPhase);
    if (this.perfSort === 'progress') list.sort((a, b) => this.gov.getCalculatedProgress(b) - this.gov.getCalculatedProgress(a));
    else if (this.perfSort === 'budget') list.sort((a, b) => b.budget - a.budget);
    else if (this.perfSort === 'status') list.sort((a, b) => a.status.localeCompare(b.status));
    else list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }

  filteredAuditLog(): AuditEntry[] {
    return this.gov.auditLog.filter((e: AuditEntry) => {
      const matchAction = !this.auditAction || e.action === this.auditAction;
      const matchUser   = !this.auditUser   || e.user   === this.auditUser;
      return matchAction && matchUser;
    });
  }

  // ── Build functions ────────────────────────────────────────────────────────

  buildSummary() {
    const ps      = this.gov.projects;
    const total   = ps.length || 1;
    const critical = ps.filter(p => p.status === 'Critical').length;
    const avgProg  = Math.round(this.avgProgress);
    const burnRate = Math.round((this.totalSpent / this.totalBudget) * 100);

    this.executiveBrief = `The portfolio currently tracks <strong>${ps.length} active workstream${ps.length !== 1 ? 's' : ''}</strong> with a combined allocation of <strong>KES ${(this.totalBudget / 1_000_000).toFixed(1)}M</strong>. Average execution progress stands at <strong>${avgProg}%</strong>, with an estimated budget utilisation of <strong>${burnRate}%</strong>.${critical > 0 ? ` <strong style="color:#ef4444">${critical} project${critical > 1 ? 's require' : ' requires'} immediate attention</strong> due to critical status.` : ' No projects are in critical status at this time.'} Documentation coverage is <strong>${Math.round(this.docRate)}%</strong> — ${this.docRate < 80 ? 'below the 80% governance threshold; scope document uploads are recommended' : 'within acceptable governance parameters'}.`;

    this.summaryKpis = [
      { icon: '📁', value: ps.length, label: 'Total Projects', sub: 'in portfolio', color: '#001E3C' },
      { icon: '📈', value: avgProg + '%', label: 'Avg Progress', sub: 'across all workstreams', color: '#0057FF' },
      { icon: '💰', value: 'KES ' + (this.totalBudget / 1_000_000).toFixed(1) + 'M', label: 'Portfolio Value', sub: 'total allocated', color: '#001E3C' },
      { icon: '🔥', value: burnRate + '%', label: 'Budget Utilised', sub: 'estimated spend', color: burnRate > 85 ? '#ef4444' : '#10b981' },
      { icon: '🚨', value: critical, label: 'Critical', sub: 'need intervention', color: critical > 0 ? '#ef4444' : '#10b981' },
    ];

    const countOf = (status: string) => ps.filter(p => p.status === status).length;
    const sColors: Record<string, string> = { Active: '#10b981', Critical: '#ef4444', Planning: '#94a3b8', Closure: '#0ea5e9' };
    this.statusBreakdown = ['Active','Critical','Planning','Closure'].map(s => ({ status: s, count: countOf(s), pct: (countOf(s) / total) * 100, color: sColors[s] }));

    const countPhase = (ph: string) => ps.filter(p => p.phase === ph).length;
    const phColors: Record<string, string> = { Initiation: '#94a3b8', Planning: '#0057FF', Execution: '#10b981', Closure: '#0ea5e9' };
    this.phaseBreakdown = ['Initiation','Planning','Execution','Closure'].map(p => ({ phase: p, count: countPhase(p), pct: (countPhase(p) / total) * 100, color: phColors[p] }));

    this.riskFlags = [];
    if (critical > 0)
      this.riskFlags.push({ level: 'high', title: `${critical} critical project${critical > 1 ? 's' : ''}`, desc: 'Immediate PM and HOD review required. Risk of timeline and budget overrun.' });
    if (this.docRate < 80)
      this.riskFlags.push({ level: 'medium', title: 'Documentation coverage below 80%', desc: `${Math.round(100 - this.docRate)}% of projects are missing scope documents — governance risk at phase-gate reviews.` });
    if (burnRate > 85)
      this.riskFlags.push({ level: 'high', title: 'Budget utilisation above 85%', desc: 'Portfolio approaching ceiling. Review contingency reserves before next phase-gate.' });
    if (this.overdueCount > 0)
      this.riskFlags.push({ level: 'medium', title: `${this.overdueCount} project${this.overdueCount > 1 ? 's' : ''} past projected end date`, desc: 'Timeline adherence requires review. Update projections or escalate blockers.' });
    if (avgProg < 40)
      this.riskFlags.push({ level: 'medium', title: 'Below-target average progress', desc: 'Portfolio velocity is low. Consider reviewing resource allocation and phase-gate blockers.' });
  }

  buildBudgetKpis() {
    const br = Math.round((this.totalSpent / this.totalBudget) * 100);
    this.budgetKpis = [
      { label: 'Total Allocated', value: 'KES ' + (this.totalBudget / 1_000_000).toFixed(2) + 'M', sub: 'across all projects', color: '#001E3C' },
      { label: 'Estimated Utilised', value: 'KES ' + (this.totalSpent / 1_000_000).toFixed(2) + 'M', sub: 'by progress rate', color: '#0057FF' },
      { label: 'Remaining', value: 'KES ' + ((this.totalBudget - this.totalSpent) / 1_000_000).toFixed(2) + 'M', sub: 'unspent allocation', color: '#10b981' },
      { label: 'Burn Rate', value: br + '%', sub: br > 85 ? '⚠️ Near ceiling' : 'Healthy spend rate', color: br > 85 ? '#ef4444' : '#10b981' },
    ];
  }

  buildRegions() {
    const ps = this.gov.projects;
    const regionDefs = [
      { name: 'East Africa',     currency: 'KES', flag: '🇰🇪', keywords: /kenya|nairobi|mombasa/i },
      { name: 'West Africa',     currency: 'GHS', flag: '🇬🇭', keywords: /ghana|accra/i            },
      { name: 'Southern Africa', currency: 'ZAR', flag: '🇿🇦', keywords: /south africa|cape town/i  },
      { name: 'North Africa',    currency: 'EGP', flag: '🇪🇬', keywords: /egypt|cairo/i             },
    ];
    this.regions = regionDefs.map(rd => {
      const rps = ps.filter(p => rd.keywords.test(p.location));
      const budget = rps.reduce((s, p) => s + p.budget, 0);
      const spent  = rps.reduce((s, p) => s + this.getSpent(p), 0);
      return {
        name: rd.name, currency: rd.currency, flag: rd.flag,
        budget: budget || 250_000,
        spent:  spent  || 62_500,
        projectCount: rps.length || 1,
        activeCount:  rps.filter(p => p.status === 'Active').length || 1,
      };
    });
  }

  buildComplianceSummary() {
    const log = this.gov.auditLog;
    this.complianceSummary = [
      { icon: '📋', value: log.length, label: 'Total Events' },
      { icon: '🔐', value: log.filter((e: AuditEntry) => e.action === 'LOGIN').length, label: 'Login Events' },
      { icon: '✏️',  value: log.filter((e: AuditEntry) => ['EDIT','UPDATE','CREATE'].includes(e.action)).length, label: 'Change Events' },
      { icon: '🗑',  value: log.filter((e: AuditEntry) => e.action === 'DELETE').length, label: 'Delete Events' },
    ];
  }

  // ── CSV Exports ────────────────────────────────────────────────────────────

  private downloadCsv(rows: string[][], filename: string) {
    const csv  = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a'); a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }

  exportProjectsCsv() {
    const header = ['ID','Name','Owner','Location','Phase','Status','Progress %','Budget (KES)','Start Date','End Date','Has Document'];
    const rows   = this.filteredProjects().map(p => [p.id, p.name, p.owner, p.location, p.phase, p.status, this.gov.getCalculatedProgress(p), p.budget, p.startDate, p.projectedEndDate, p.hasAttachment]);
    this.downloadCsv([header, ...rows as any], `projects-${this.today()}.csv`);
  }

  exportBudgetCsv() {
    const header = ['Project','Phase','Allocated (KES)','Utilised (KES)','Remaining (KES)','Burn Rate %'];
    const rows   = this.gov.projects.map((p: Project) => [p.name, p.phase, p.budget, this.getSpent(p), this.getRemaining(p), this.gov.getCalculatedProgress(p)]);
    this.downloadCsv([header, ...rows as any], `budget-${this.today()}.csv`);
  }

  exportAuditCsv() {
    const header = ['Timestamp','Action','Operator','Details','Event ID'];
    const rows   = this.filteredAuditLog().map((e: AuditEntry) => [e.time.toISOString(), e.action, e.user, e.details, e.id ?? '']);
    this.downloadCsv([header, ...rows as any], `audit-${this.today()}.csv`);
  }

  exportRegionalCsv() {
    const header = ['Region','Currency','Projects','Active','Allocated','Spent','Utilisation %'];
    const rows   = this.regions.map(r => [r.name, r.currency, r.projectCount, r.activeCount, r.budget, r.spent, r.budget > 0 ? Math.round((r.spent/r.budget)*100) : 0]);
    this.downloadCsv([header, ...rows as any], `regional-${this.today()}.csv`);
  }

  exportAllCsv() {
    this.exportProjectsCsv();
    setTimeout(() => this.exportBudgetCsv(),   400);
    setTimeout(() => this.exportAuditCsv(),    800);
    setTimeout(() => this.exportRegionalCsv(), 1200);
  }

  printReport() { window.print(); }

  rawView   = 'projects';
  rawSearch = '';

  get jsonPreview(): string {
    const data = this.rawView === 'projects'
      ? this.gov.projects.slice(0, 2)
      : this.gov.auditLog.slice(0, 2).map((e: AuditEntry) => ({ ...e, time: e.time.toISOString() }));
    return JSON.stringify(data, null, 2);
  }

  filteredRawProjects(): Project[] {
    if (!this.rawSearch.trim()) return this.gov.projects;
    const q = this.rawSearch.toLowerCase();
    return this.gov.projects.filter((p: Project) =>
      Object.values(p).some(v => String(v).toLowerCase().includes(q))
    );
  }

  filteredRawAudit(): AuditEntry[] {
    if (!this.rawSearch.trim()) return this.gov.auditLog;
    const q = this.rawSearch.toLowerCase();
    return this.gov.auditLog.filter((e: AuditEntry) =>
      Object.values(e).some(v => String(v).toLowerCase().includes(q))
    );
  }

  exportRawJson() {
    const payload = this.rawView === 'projects'
      ? this.filteredRawProjects()
      : this.filteredRawAudit().map((e: AuditEntry) => ({ ...e, time: e.time.toISOString() }));
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `raw-${this.rawView}-${this.today()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  private today() { return new Date().toISOString().slice(0,10); }
}
