// src/app/components/dashboard/dashboard.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { GovernanceService, MasterPM, Project } from '../../services/governance.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, DecimalPipe, RouterLink],
  template: `
    <div class="dash">

      <!-- ── Top bar ─────────────────────────────────────────────────────── -->
      <header class="topbar">
        <div class="topbar-left">
          <span class="eyebrow">Portfolio Command</span>
          <h1>Operational Analytics</h1>
        </div>
        <div class="topbar-right">
          <div class="last-updated">Updated {{ now | date:'d MMM y, HH:mm' }}</div>
          <div class="role-pill">{{ gov.currentUser().role }}</div>
        </div>
      </header>

      <!-- ── KPI strip ───────────────────────────────────────────────────── -->
      <div class="kpi-strip">
        <div class="kpi" *ngFor="let k of kpis">
          <div class="kpi-icon">{{ k.icon }}</div>
          <div class="kpi-body">
            <div class="kpi-value" [style.color]="k.color">{{ k.value }}</div>
            <div class="kpi-label">{{ k.label }}</div>
          </div>
          <div class="kpi-trend" [class.up]="k.trend > 0" [class.down]="k.trend < 0">
            {{ k.trend > 0 ? '▲' : k.trend < 0 ? '▼' : '—' }} {{ k.trendLabel }}
          </div>
        </div>
      </div>

      <!-- ── Row 1: Status donut + Budget bar + Velocity ────────────────── -->
      <div class="row-3">

        <!-- Status donut -->
        <div class="panel">
          <div class="panel-header">
            <span class="panel-title">Portfolio Status</span>
            <span class="panel-sub">by project count</span>
          </div>
          <div class="donut-wrap">
            <svg viewBox="0 0 120 120" class="donut-svg">
              <circle cx="60" cy="60" r="48" fill="none" stroke="#1e293b" stroke-width="22"/>
              <circle cx="60" cy="60" r="48" fill="none"
                stroke="#10b981" stroke-width="22"
                stroke-dasharray="{{ activeArc }} {{ circumference }}"
                stroke-dashoffset="{{ circumference / 4 }}"
                class="donut-seg"/>
              <circle cx="60" cy="60" r="48" fill="none"
                stroke="#ef4444" stroke-width="22"
                stroke-dasharray="{{ criticalArc }} {{ circumference }}"
                stroke-dashoffset="{{ circumference / 4 - activeArc }}"
                class="donut-seg"/>
              <circle cx="60" cy="60" r="48" fill="none"
                stroke="#94a3b8" stroke-width="22"
                stroke-dasharray="{{ planningArc }} {{ circumference }}"
                stroke-dashoffset="{{ circumference / 4 - activeArc - criticalArc }}"
                class="donut-seg"/>
              <circle cx="60" cy="60" r="48" fill="none"
                stroke="#0ea5e9" stroke-width="22"
                stroke-dasharray="{{ closureArc }} {{ circumference }}"
                stroke-dashoffset="{{ circumference / 4 - activeArc - criticalArc - planningArc }}"
                class="donut-seg"/>
              <text x="60" y="55" text-anchor="middle" class="donut-num">{{ gov.projects.length }}</text>
              <text x="60" y="68" text-anchor="middle" class="donut-lbl">projects</text>
            </svg>
            <div class="donut-legend">
              <div class="leg-item"><span class="leg-dot" style="background:#10b981"></span> Active <strong>{{ getCount('Active') }}</strong></div>
              <div class="leg-item"><span class="leg-dot" style="background:#ef4444"></span> Critical <strong>{{ getCount('Critical') }}</strong></div>
              <div class="leg-item"><span class="leg-dot" style="background:#94a3b8"></span> Planning <strong>{{ getCount('Planning') }}</strong></div>
              <div class="leg-item"><span class="leg-dot" style="background:#0ea5e9"></span> Closure <strong>{{ getCount('Closure') }}</strong></div>
            </div>
          </div>
        </div>

        <!-- Budget vs Actual bar chart -->
        <div class="panel panel-wide">
          <div class="panel-header">
            <span class="panel-title">Budget Allocation</span>
            <span class="panel-sub">KES (thousands)</span>
          </div>
          <div class="bar-chart">
            <div class="bar-row" *ngFor="let p of gov.projects">
              <div class="bar-label" [title]="p.name">{{ p.name | slice:0:18 }}{{ p.name.length > 18 ? '…' : '' }}</div>
              <div class="bar-track">
                <div class="bar-fill budget"
                     [style.width.%]="(p.budget / maxBudget) * 100"
                     [title]="'Budget: KES ' + (p.budget | number)">
                </div>
                <div class="bar-fill actual"
                     [style.width.%]="(getSpent(p) / maxBudget) * 100"
                     [title]="'Spent: KES ' + (getSpent(p) | number)">
                </div>
              </div>
              <div class="bar-val">{{ (p.budget / 1000) | number:'1.0-0' }}K</div>
            </div>
          </div>
          <div class="bar-legend">
            <span class="leg-item"><span class="leg-dot" style="background:#0057FF44;border:2px solid #0057FF"></span> Allocated</span>
            <span class="leg-item"><span class="leg-dot" style="background:#10b981"></span> Utilised</span>
          </div>
        </div>

        <!-- PM Velocity -->
        <div class="panel">
          <div class="panel-header">
            <span class="panel-title">PM Velocity</span>
            <span class="panel-sub">delivery rate</span>
          </div>
          <div class="velocity-list">
            <div class="vel-row" *ngFor="let pm of pms">
              <div class="vel-head">
                <div class="vel-avatar">{{ pm.name.charAt(0) }}</div>
                <div class="vel-info">
                  <div class="vel-name">{{ pm.name }}</div>
                  <div class="vel-dept">{{ pm.department }}</div>
                </div>
                <div class="vel-rate" [style.color]="pm.rate >= 90 ? '#10b981' : pm.rate >= 70 ? '#0057FF' : '#f59e0b'">
                  {{ pm.rate }}%
                </div>
              </div>
              <div class="vel-track">
                <div class="vel-fill"
                     [style.width.%]="pm.rate"
                     [style.background]="pm.rate >= 90 ? '#10b981' : pm.rate >= 70 ? '#0057FF' : '#f59e0b'">
                </div>
              </div>
              <div class="vel-last">Last delivery: {{ pm.lastDelivery }}</div>
            </div>
          </div>
        </div>

      </div>

      <!-- ── Row 2: Gantt chart ──────────────────────────────────────────── -->
      <div class="panel">
        <div class="panel-header">
          <span class="panel-title">Project Timeline</span>
          <span class="panel-sub">Gantt view · {{ ganttStart | date:'MMM y' }} — {{ ganttEnd | date:'MMM y' }}</span>
        </div>
        <div class="gantt">
          <!-- Month headers -->
          <div class="gantt-labels-col"></div>
          <div class="gantt-grid-col">
            <div class="gantt-months">
              <div class="gantt-month" *ngFor="let m of ganttMonths" [style.width.%]="100 / ganttMonths.length">
                {{ m | date:'MMM yy' }}
              </div>
            </div>
            <!-- Month grid lines -->
            <div class="gantt-gridlines">
              <div class="gantt-gridline" *ngFor="let m of ganttMonths" [style.width.%]="100 / ganttMonths.length"></div>
            </div>
            <!-- Today line -->
            <div class="gantt-today" [style.left.%]="todayPct"></div>
          </div>

          <!-- Rows -->
          <ng-container *ngFor="let p of gov.projects">
            <div class="gantt-row-label">
              <div class="gantt-proj-name">{{ p.name }}</div>
              <span class="gantt-phase-tag" [ngClass]="p.phase.toLowerCase()">{{ p.phase }}</span>
            </div>
            <div class="gantt-row-track">
              <!-- Background stripe -->
              <div class="gantt-stripe"></div>
              <!-- Bar -->
              <div class="gantt-bar"
                   [style.left.%]="getGanttLeft(p)"
                   [style.width.%]="getGanttWidth(p)"
                   [ngClass]="p.status.toLowerCase()"
                   [title]="p.name + ': ' + p.startDate + ' → ' + p.projectedEndDate">
                <div class="gantt-bar-fill" [style.width.%]="gov.getCalculatedProgress(p)"></div>
                <span class="gantt-bar-pct">{{ gov.getCalculatedProgress(p) }}%</span>
              </div>
              <!-- Actual end marker -->
              <div class="gantt-actual-marker"
                   *ngIf="p.actualEndDate"
                   [style.left.%]="getGanttActual(p)"
                   title="Actual end: {{ p.actualEndDate }}">
              </div>
            </div>
          </ng-container>
        </div>
        <div class="gantt-footer">
          <span class="gf-item"><span class="gf-dot" style="background:#10b981"></span> Active</span>
          <span class="gf-item"><span class="gf-dot" style="background:#ef4444"></span> Critical</span>
          <span class="gf-item"><span class="gf-dot" style="background:#94a3b8"></span> Planning</span>
          <span class="gf-item"><span class="gf-dot" style="background:#0ea5e9"></span> Closure</span>
          <span class="gf-item"><span class="gf-diamond"></span> Actual end</span>
          <span class="gf-item gf-today"><span class="gf-line"></span> Today</span>
        </div>
      </div>

      <!-- ── Row 3: Phase pipeline + Recent projects ─────────────────────── -->
      <div class="row-2">

        <!-- Phase pipeline funnel -->
        <div class="panel">
          <div class="panel-header">
            <span class="panel-title">Phase Pipeline</span>
            <span class="panel-sub">project distribution</span>
          </div>
          <div class="funnel">
            <div class="funnel-stage" *ngFor="let s of pipelineStages">
              <div class="funnel-bar-wrap">
                <div class="funnel-bar" [style.width.%]="s.pct" [style.background]="s.color"></div>
              </div>
              <div class="funnel-meta">
                <span class="funnel-phase">{{ s.phase }}</span>
                <span class="funnel-count">{{ s.count }} project{{ s.count !== 1 ? 's' : '' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent projects table -->
        <div class="panel panel-wide">
          <div class="panel-header">
            <span class="panel-title">Project Registry</span>
            <a routerLink="/projects" class="panel-link">View all →</a>
          </div>
          <table class="proj-table">
            <thead>
              <tr>
                <th>Project</th>
                <th>Owner</th>
                <th>Phase</th>
                <th>Status</th>
                <th>Progress</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let p of gov.projects">
                <td class="pt-name">{{ p.name }}</td>
                <td class="pt-owner">{{ p.owner }}</td>
                <td><span class="phase-tag" [ngClass]="p.phase.toLowerCase()">{{ p.phase }}</span></td>
                <td><span class="status-tag" [ngClass]="p.status.toLowerCase()">{{ p.status }}</span></td>
                <td>
                  <div class="pt-prog-wrap">
                    <div class="pt-prog-track">
                      <div class="pt-prog-fill" [style.width.%]="gov.getCalculatedProgress(p)"
                           [style.background]="p.status === 'Critical' ? '#ef4444' : '#0057FF'"></div>
                    </div>
                    <span class="pt-pct">{{ gov.getCalculatedProgress(p) }}%</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>

    </div>
  `,
  styles: [`
    /* ── Tokens ──────────────────────────────────────────────────────────── */
    :host {
      --navy:      #001E3C;
      --navy-mid:  #0a2a50;
      --blue:      #0057FF;
      --blue-lt:   #e6eeff;
      --ink:       #0f172a;
      --ink-2:     #1e293b;
      --muted:     #64748b;
      --line:      #e2e8f0;
      --bg:        #f1f5f9;
      --white:     #ffffff;
      --green:     #10b981;
      --red:       #ef4444;
      --amber:     #f59e0b;
      --sky:       #0ea5e9;
      --font-head: 'Georgia', 'Times New Roman', serif;
      --font-body: 'Trebuchet MS', 'Segoe UI', sans-serif;
      --font-mono: 'Courier New', monospace;
      --radius:    10px;
      --shadow:    0 1px 3px rgba(0,0,0,.06), 0 4px 16px rgba(0,0,0,.06);
      display: block;
      font-family: var(--font-body);
    }

    /* ── Layout ──────────────────────────────────────────────────────────── */
    .dash { padding: 28px 32px; background: var(--bg); min-height: 100vh; display: flex; flex-direction: column; gap: 20px; }

    /* ── Topbar ──────────────────────────────────────────────────────────── */
    .topbar        { display: flex; justify-content: space-between; align-items: flex-end; padding-bottom: 4px; border-bottom: 1px solid var(--line); }
    .eyebrow       { display: block; font-size: 10px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: var(--blue); margin-bottom: 4px; }
    h1             { font-family: var(--font-head); font-size: 26px; color: var(--navy); margin: 0; font-weight: 700; }
    .topbar-right  { display: flex; align-items: center; gap: 12px; }
    .last-updated  { font-size: 11px; color: var(--muted); }
    .role-pill     { background: var(--navy); color: #fff; font-size: 10px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; padding: 4px 10px; border-radius: 20px; }

    /* ── KPI strip ───────────────────────────────────────────────────────── */
    .kpi-strip { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
    .kpi       { background: var(--white); border: 1px solid var(--line); border-radius: var(--radius); padding: 18px 20px; display: flex; align-items: center; gap: 14px; box-shadow: var(--shadow); position: relative; overflow: hidden; }
    .kpi::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: var(--blue); }
    .kpi-icon  { font-size: 28px; flex-shrink: 0; }
    .kpi-body  { flex: 1; }
    .kpi-value { font-family: var(--font-head); font-size: 30px; font-weight: 700; line-height: 1; }
    .kpi-label { font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: .5px; margin-top: 4px; font-weight: 700; }
    .kpi-trend { font-size: 11px; font-weight: 700; color: var(--muted); white-space: nowrap; text-align: right; }
    .kpi-trend.up   { color: var(--green); }
    .kpi-trend.down { color: var(--red);   }

    /* ── Panels ──────────────────────────────────────────────────────────── */
    .panel       { background: var(--white); border: 1px solid var(--line); border-radius: var(--radius); padding: 22px 24px; box-shadow: var(--shadow); }
    .panel-wide  { flex: 1.6; }
    .panel-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 18px; }
    .panel-title { font-size: 13px; font-weight: 700; color: var(--ink); text-transform: uppercase; letter-spacing: .8px; }
    .panel-sub   { font-size: 11px; color: var(--muted); }
    .panel-link  { font-size: 12px; color: var(--blue); text-decoration: none; font-weight: 700; }
    .panel-link:hover { text-decoration: underline; }

    .row-3 { display: flex; gap: 18px; }
    .row-3 .panel { flex: 1; }
    .row-2 { display: flex; gap: 18px; }
    .row-2 .panel { flex: 1; }

    /* ── Donut chart ─────────────────────────────────────────────────────── */
    .donut-wrap  { display: flex; align-items: center; gap: 20px; }
    .donut-svg   { width: 130px; flex-shrink: 0; }
    .donut-seg   { transition: stroke-dasharray .6s ease; }
    .donut-num   { font-family: var(--font-head); font-size: 20px; font-weight: 700; fill: var(--ink); }
    .donut-lbl   { font-size: 8px; fill: var(--muted); text-transform: uppercase; letter-spacing: 1px; }
    .donut-legend { display: flex; flex-direction: column; gap: 8px; }
    .leg-item    { display: flex; align-items: center; gap: 7px; font-size: 12px; color: var(--ink-2); }
    .leg-item strong { margin-left: auto; padding-left: 12px; font-weight: 800; color: var(--ink); }
    .leg-dot     { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }

    /* ── Bar chart ───────────────────────────────────────────────────────── */
    .bar-chart  { display: flex; flex-direction: column; gap: 12px; }
    .bar-row    { display: flex; align-items: center; gap: 10px; }
    .bar-label  { font-size: 11px; color: var(--muted); width: 120px; flex-shrink: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .bar-track  { flex: 1; position: relative; height: 20px; background: #f8fafc; border-radius: 4px; overflow: hidden; border: 1px solid var(--line); }
    .bar-fill   { position: absolute; top: 0; left: 0; height: 100%; border-radius: 4px; transition: width .6s ease; }
    .bar-fill.budget { background: rgba(0,87,255,.15); border: 2px solid var(--blue); }
    .bar-fill.actual { background: var(--green); opacity: .85; top: 25%; height: 50%; border-radius: 3px; }
    .bar-val    { font-size: 11px; font-weight: 700; color: var(--ink); width: 42px; text-align: right; flex-shrink: 0; font-family: var(--font-mono); }
    .bar-legend { display: flex; gap: 16px; margin-top: 12px; }

    /* ── Velocity ────────────────────────────────────────────────────────── */
    .velocity-list { display: flex; flex-direction: column; gap: 16px; }
    .vel-row       { }
    .vel-head      { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
    .vel-avatar    { width: 30px; height: 30px; border-radius: 8px; background: var(--navy); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800; flex-shrink: 0; }
    .vel-info      { flex: 1; }
    .vel-name      { font-size: 13px; font-weight: 700; color: var(--ink); }
    .vel-dept      { font-size: 10px; color: var(--muted); }
    .vel-rate      { font-size: 16px; font-weight: 800; font-family: var(--font-mono); }
    .vel-track     { height: 6px; background: var(--line); border-radius: 3px; overflow: hidden; }
    .vel-fill      { height: 100%; border-radius: 3px; transition: width .6s ease; }
    .vel-last      { font-size: 10px; color: var(--muted); margin-top: 4px; }

    /* ── Gantt ───────────────────────────────────────────────────────────── */
    .gantt             { display: grid; grid-template-columns: 200px 1fr; row-gap: 0; }
    .gantt-labels-col  { } /* spacer for month header row */
    .gantt-grid-col    { position: relative; }

    .gantt-months      { display: flex; border-bottom: 1px solid var(--line); padding-bottom: 6px; margin-bottom: 4px; }
    .gantt-month       { font-size: 9px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: .5px; text-align: center; }

    .gantt-gridlines   { position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; pointer-events: none; }
    .gantt-gridline    { border-right: 1px dashed #e2e8f0; }

    .gantt-today       { position: absolute; top: 0; bottom: 0; width: 2px; background: var(--red); opacity: .7; z-index: 3; pointer-events: none; }
    .gantt-today::before { content: 'TODAY'; position: absolute; top: 0; left: 4px; font-size: 8px; font-weight: 800; color: var(--red); letter-spacing: .5px; }

    .gantt-row-label   { display: flex; flex-direction: column; justify-content: center; gap: 3px; padding: 8px 12px 8px 0; border-bottom: 1px solid #f8fafc; min-height: 48px; }
    .gantt-proj-name   { font-size: 12px; font-weight: 700; color: var(--ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .gantt-phase-tag   { display: inline-block; font-size: 8px; font-weight: 800; text-transform: uppercase; padding: 1px 5px; border-radius: 3px; }

    .gantt-row-track   { position: relative; display: flex; align-items: center; border-bottom: 1px solid #f8fafc; min-height: 48px; }
    .gantt-stripe      { position: absolute; inset: 6px 0; background: #f8fafc; border-radius: 4px; }

    .gantt-bar         { position: absolute; height: 22px; border-radius: 5px; overflow: hidden; display: flex; align-items: center; z-index: 2; min-width: 4px; }
    .gantt-bar.active   { background: rgba(16,185,129,.15); border: 1.5px solid var(--green); }
    .gantt-bar.critical { background: rgba(239,68,68,.15);  border: 1.5px solid var(--red);   }
    .gantt-bar.planning { background: rgba(148,163,184,.15);border: 1.5px solid #94a3b8;      }
    .gantt-bar.closure  { background: rgba(14,165,233,.15); border: 1.5px solid var(--sky);   }
    .gantt-bar-fill    { height: 100%; opacity: .35; border-radius: 4px; background: currentColor; }
    .gantt-bar.active   .gantt-bar-fill { background: var(--green);  }
    .gantt-bar.critical .gantt-bar-fill { background: var(--red);    }
    .gantt-bar.planning .gantt-bar-fill { background: #94a3b8;       }
    .gantt-bar.closure  .gantt-bar-fill { background: var(--sky);    }
    .gantt-bar-pct     { position: absolute; right: 5px; font-size: 9px; font-weight: 800; color: var(--ink); font-family: var(--font-mono); }

    .gantt-actual-marker { position: absolute; width: 10px; height: 10px; background: var(--amber); transform: rotate(45deg); z-index: 4; top: 50%; margin-top: -5px; }

    .gantt-footer { display: flex; gap: 16px; margin-top: 10px; flex-wrap: wrap; }
    .gf-item     { display: flex; align-items: center; gap: 5px; font-size: 11px; color: var(--muted); }
    .gf-dot      { width: 10px; height: 10px; border-radius: 50%; }
    .gf-diamond  { width: 8px; height: 8px; background: var(--amber); transform: rotate(45deg); display: inline-block; }
    .gf-line     { width: 14px; height: 2px; background: var(--red); display: inline-block; }

    /* ── Phase funnel ────────────────────────────────────────────────────── */
    .funnel       { display: flex; flex-direction: column; gap: 12px; }
    .funnel-stage { display: flex; align-items: center; gap: 12px; }
    .funnel-bar-wrap { flex: 1; background: #f8fafc; border-radius: 4px; height: 28px; overflow: hidden; }
    .funnel-bar   { height: 100%; border-radius: 4px; transition: width .6s ease; min-width: 4px; opacity: .85; }
    .funnel-meta  { display: flex; flex-direction: column; width: 90px; }
    .funnel-phase { font-size: 11px; font-weight: 700; color: var(--ink); }
    .funnel-count { font-size: 10px; color: var(--muted); }

    /* ── Project table ───────────────────────────────────────────────────── */
    .proj-table  { width: 100%; border-collapse: collapse; font-size: 13px; }
    .proj-table th { padding: 8px 12px; font-size: 10px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: .5px; border-bottom: 2px solid var(--line); text-align: left; }
    .proj-table td { padding: 11px 12px; border-bottom: 1px solid #f8fafc; vertical-align: middle; }
    .proj-table tr:last-child td { border-bottom: none; }
    .proj-table tr:hover td { background: #f8fafc; }
    .pt-name   { font-weight: 700; color: var(--ink); }
    .pt-owner  { color: var(--muted); font-size: 12px; }

    .pt-prog-wrap  { display: flex; align-items: center; gap: 8px; }
    .pt-prog-track { flex: 1; height: 5px; background: var(--line); border-radius: 3px; overflow: hidden; min-width: 60px; }
    .pt-prog-fill  { height: 100%; border-radius: 3px; transition: width .5s ease; }
    .pt-pct        { font-size: 11px; font-weight: 700; color: var(--muted); font-family: var(--font-mono); width: 36px; }

    /* ── Phase / status tags ─────────────────────────────────────────────── */
    .phase-tag, .gantt-phase-tag { padding: 2px 7px; border-radius: 4px; font-size: 9px; font-weight: 800; text-transform: uppercase; white-space: nowrap; }
    .initiation  { background: #f1f5f9; color: #64748b; }
    .planning    { background: #f1f5f9; color: #475569; }
    .execution   { background: #e0f2fe; color: #0369a1; }
    .closure     { background: #f0fdf4; color: #166534; }
    .status-tag  { padding: 3px 9px; border-radius: 20px; font-size: 10px; font-weight: 700; white-space: nowrap; }
    .active      { background: #ecfdf5; color: #059669; }
    .critical    { background: #fef2f2; color: #dc2626; }

    @media (max-width: 1100px) {
      .row-3 { flex-wrap: wrap; }
      .row-2 { flex-wrap: wrap; }
      .kpi-strip { grid-template-columns: repeat(2, 1fr); }
    }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  pms: MasterPM[] = [];
  now = new Date();
  private sub!: Subscription;

  // Gantt config
  ganttStart!: Date;
  ganttEnd!: Date;
  ganttMonths: Date[] = [];
  ganttRangeMs!: number;
  todayPct!: number;
  circumference = 2 * Math.PI * 48;

  // Donut arcs
  activeArc   = 0;
  criticalArc = 0;
  planningArc = 0;
  closureArc  = 0;
  maxBudget   = 0;

  kpis: { icon: string; value: string | number; label: string; color: string; trend: number; trendLabel: string }[] = [];

  pipelineStages: { phase: string; count: number; pct: number; color: string }[] = [];

  constructor(public gov: GovernanceService) {}

  ngOnInit() {
    this.sub = this.gov.masterPMs$.subscribe((data: MasterPM[]) => this.pms = data);
    this.buildGantt();
    this.buildDonut();
    this.buildKpis();
    this.buildPipeline();
    this.maxBudget = Math.max(...this.gov.projects.map(p => p.budget));
  }

  ngOnDestroy() { this.sub.unsubscribe(); }

  getCount(status: string): number {
    return this.gov.projects.filter((p: Project) => p.status === status).length;
  }

  getSpent(p: Project): number {
    return Math.round(p.budget * (this.gov.getCalculatedProgress(p) / 100));
  }

  // ── Gantt helpers ──────────────────────────────────────────────────────────

  buildGantt() {
    const projects = this.gov.projects;
    const starts   = projects.map(p => new Date(p.startDate).getTime());
    const ends     = projects.map(p => new Date(p.projectedEndDate).getTime());
    this.ganttStart   = new Date(Math.min(...starts));
    this.ganttEnd     = new Date(Math.max(...ends));
    // pad by one month each side
    this.ganttStart.setMonth(this.ganttStart.getMonth() - 1);
    this.ganttEnd.setMonth(this.ganttEnd.getMonth() + 1);
    this.ganttRangeMs = this.ganttEnd.getTime() - this.ganttStart.getTime();

    // build month list
    this.ganttMonths = [];
    const cursor = new Date(this.ganttStart.getFullYear(), this.ganttStart.getMonth(), 1);
    while (cursor <= this.ganttEnd) {
      this.ganttMonths.push(new Date(cursor));
      cursor.setMonth(cursor.getMonth() + 1);
    }

    const now = Date.now();
    this.todayPct = Math.min(100, Math.max(0,
      ((now - this.ganttStart.getTime()) / this.ganttRangeMs) * 100
    ));
  }

  getGanttLeft(p: Project): number {
    return ((new Date(p.startDate).getTime() - this.ganttStart.getTime()) / this.ganttRangeMs) * 100;
  }

  getGanttWidth(p: Project): number {
    const s = new Date(p.startDate).getTime();
    const e = new Date(p.projectedEndDate).getTime();
    return Math.max(1, ((e - s) / this.ganttRangeMs) * 100);
  }

  getGanttActual(p: Project): number {
    if (!p.actualEndDate) return 0;
    return ((new Date(p.actualEndDate).getTime() - this.ganttStart.getTime()) / this.ganttRangeMs) * 100;
  }

  // ── Donut helpers ──────────────────────────────────────────────────────────

  buildDonut() {
    const total = this.gov.projects.length || 1;
    const arc   = (n: number) => (n / total) * this.circumference;
    this.activeArc   = arc(this.getCount('Active'));
    this.criticalArc = arc(this.getCount('Critical'));
    this.planningArc = arc(this.getCount('Planning'));
    this.closureArc  = arc(this.getCount('Closure'));
  }

  // ── KPIs ──────────────────────────────────────────────────────────────────

  buildKpis() {
    const projects  = this.gov.projects;
    const totalBudget = projects.reduce((s, p) => s + p.budget, 0);
    const avgProgress = Math.round(projects.reduce((s, p) => s + this.gov.getCalculatedProgress(p), 0) / (projects.length || 1));
    this.kpis = [
      { icon: '📁', value: projects.length,          label: 'Total Projects',    color: '#001E3C', trend: 0,  trendLabel: 'stable'     },
      { icon: '💰', value: 'KES ' + (totalBudget / 1_000_000).toFixed(1) + 'M', label: 'Portfolio Value', color: '#0057FF', trend: 1, trendLabel: '+12% QoQ' },
      { icon: '📈', value: avgProgress + '%',        label: 'Avg Progress',      color: '#10b981', trend: 1,  trendLabel: '+8% MoM'    },
      { icon: '🚨', value: this.getCount('Critical'),label: 'Critical Projects', color: '#ef4444', trend: -1, trendLabel: 'needs attn' },
    ];
  }

  // ── Pipeline funnel ────────────────────────────────────────────────────────

  buildPipeline() {
    const phases = ['Initiation', 'Planning', 'Execution', 'Closure'];
    const colors = ['#94a3b8', '#0057FF', '#10b981', '#0ea5e9'];
    const total  = this.gov.projects.length || 1;
    this.pipelineStages = phases.map((ph, i) => {
      const count = this.gov.projects.filter((p: Project) => p.phase === ph).length;
      return { phase: ph, count, pct: Math.max(8, (count / total) * 100), color: colors[i] };
    });
  }
}
