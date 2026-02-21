// src/app/components/dashboard/dashboard.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DecimalPipe }    from '@angular/common';
import { RouterLink }                   from '@angular/router';
import { GovernanceService, MasterPM, Project } from '../../services/governance.service';
import { Subscription } from 'rxjs';

// ─── DB-ready data contracts ──────────────────────────────────────────────────
// When you decouple from seed data, replace these with HTTP responses.
// Shape is intentionally identical to what a REST/GraphQL API would return.

interface KpiCard {
  icon:       string;
  value:      string;
  label:      string;
  color:      string;
  trend:      number;   // positive = up, negative = down, 0 = flat
  trendLabel: string;
}

interface PipelineStage {
  phase: string;
  count: number;
  pct:   number;
  color: string;
}

interface StoryInsight {
  type:    'warning' | 'success' | 'info';
  icon:    string;
  heading: string;
  body:    string;
}

@Component({
  selector:   'app-dashboard',
  standalone: true,
  imports:    [CommonModule, DecimalPipe, RouterLink],
  template: `
<div class="dash">

  <!-- ══ TOPBAR ═══════════════════════════════════════════════════════════ -->
  <header class="topbar">
    <div>
      <p class="eyebrow">Portfolio Command Centre</p>
      <h1>Operational Analytics</h1>
    </div>
    <div class="topbar-right">
      <span class="live-dot"></span>
      <span class="live-label">Live</span>
      <span class="timestamp">{{ now | date:'EEE d MMM y · HH:mm' }}</span>
      <div class="role-chip">{{ gov.currentUser().role }}</div>
    </div>
  </header>

  <!-- ══ KPI STRIP ═════════════════════════════════════════════════════════ -->
  <div class="kpi-strip">
    <div class="kpi-card" *ngFor="let k of kpis; let i = index"
         [style.animation-delay]="(i * 80) + 'ms'">
      <div class="kpi-accent" [style.background]="k.color"></div>
      <div class="kpi-top">
        <span class="kpi-icon">{{ k.icon }}</span>
        <span class="kpi-trend"
              [class.trend-up]="k.trend > 0"
              [class.trend-dn]="k.trend < 0">
          {{ k.trend > 0 ? '▲' : k.trend < 0 ? '▼' : '—' }}&nbsp;{{ k.trendLabel }}
        </span>
      </div>
      <div class="kpi-value" [style.color]="k.color">{{ k.value }}</div>
      <div class="kpi-label">{{ k.label }}</div>
    </div>
  </div>

  <!-- ══ ROW A: Donut · Budget bars · PM Velocity ══════════════════════════ -->
  <div class="row-3col">

    <!-- Status Donut -->
    <div class="panel">
      <div class="panel-hd">
        <span class="panel-title">Portfolio Status</span>
        <span class="panel-sub">by project count</span>
      </div>
      <div class="donut-wrap">
        <svg viewBox="0 0 140 140" class="donut-svg">
          <circle cx="70" cy="70" r="52" fill="none" stroke="#1e293b" stroke-width="24"/>
          <!-- Active -->
          <circle cx="70" cy="70" r="52" fill="none" stroke="#10b981" stroke-width="24"
            [attr.stroke-dasharray]="activeArc + ' ' + circumference"
            [attr.stroke-dashoffset]="circumference * 0.25"
            class="donut-arc"/>
          <!-- Critical -->
          <circle cx="70" cy="70" r="52" fill="none" stroke="#ef4444" stroke-width="24"
            [attr.stroke-dasharray]="criticalArc + ' ' + circumference"
            [attr.stroke-dashoffset]="circumference * 0.25 - activeArc"
            class="donut-arc"/>
          <!-- Planning -->
          <circle cx="70" cy="70" r="52" fill="none" stroke="#94a3b8" stroke-width="24"
            [attr.stroke-dasharray]="planningArc + ' ' + circumference"
            [attr.stroke-dashoffset]="circumference * 0.25 - activeArc - criticalArc"
            class="donut-arc"/>
          <!-- Closure -->
          <circle cx="70" cy="70" r="52" fill="none" stroke="#0ea5e9" stroke-width="24"
            [attr.stroke-dasharray]="closureArc + ' ' + circumference"
            [attr.stroke-dashoffset]="circumference * 0.25 - activeArc - criticalArc - planningArc"
            class="donut-arc"/>
          <text x="70" y="64" text-anchor="middle" class="donut-big">{{ gov.projects.length }}</text>
          <text x="70" y="78" text-anchor="middle" class="donut-sm">PROJECTS</text>
        </svg>
        <ul class="donut-legend">
          <li><span class="dl-dot" style="background:#10b981"></span>Active<strong>{{ getCount('Active') }}</strong></li>
          <li><span class="dl-dot" style="background:#ef4444"></span>Critical<strong>{{ getCount('Critical') }}</strong></li>
          <li><span class="dl-dot" style="background:#94a3b8"></span>Planning<strong>{{ getCount('Planning') }}</strong></li>
          <li><span class="dl-dot" style="background:#0ea5e9"></span>Closure<strong>{{ getCount('Closure') }}</strong></li>
        </ul>
      </div>
    </div>

    <!-- Budget vs Actual -->
    <div class="panel panel-grow">
      <div class="panel-hd">
        <span class="panel-title">Budget vs Utilisation</span>
        <span class="panel-sub">KES · thousands</span>
      </div>
      <div class="budget-chart">
        <div class="bc-row" *ngFor="let p of gov.projects">
          <div class="bc-label" [title]="p.name">{{ p.name | slice:0:20 }}{{ p.name.length > 20 ? '…' : '' }}</div>
          <div class="bc-tracks">
            <div class="bc-track">
              <div class="bc-allocated" [style.width.%]="(p.budget / maxBudget) * 100"></div>
            </div>
            <div class="bc-track bc-track-sm">
              <div class="bc-spent" [style.width.%]="(getSpent(p) / maxBudget) * 100"></div>
            </div>
          </div>
          <div class="bc-amt">{{ (p.budget / 1000) | number:'1.0-0' }}K</div>
        </div>
      </div>
      <div class="chart-legend">
        <span><span class="cl-swatch cl-alloc"></span>Allocated</span>
        <span><span class="cl-swatch cl-spent"></span>Utilised</span>
      </div>
    </div>

    <!-- PM Velocity -->
    <div class="panel">
      <div class="panel-hd">
        <span class="panel-title">PM Velocity</span>
        <span class="panel-sub">delivery rate</span>
      </div>
      <div class="vel-list">
        <div class="vel-row" *ngFor="let pm of pms">
          <div class="vel-hd">
            <div class="vel-av">{{ pm.name.charAt(0) }}</div>
            <div class="vel-meta">
              <div class="vel-name">{{ pm.name }}</div>
              <div class="vel-dept">{{ pm.department }} · {{ pm.activeProjects }} projects</div>
            </div>
            <div class="vel-pct"
                 [style.color]="pm.rate >= 90 ? '#10b981' : pm.rate >= 70 ? '#0057FF' : '#f59e0b'">
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

  <!-- ══ GANTT ══════════════════════════════════════════════════════════════ -->
  <div class="panel">
    <div class="panel-hd">
      <span class="panel-title">Project Timeline · Gantt View</span>
      <span class="panel-sub">{{ ganttStart | date:'MMM y' }} — {{ ganttEnd | date:'MMM y' }}</span>
    </div>

    <div class="gantt">
      <!-- month header row -->
      <div class="g-spacer"></div>
      <div class="g-months-wrap">
        <div class="g-months">
          <div class="g-month" *ngFor="let m of ganttMonths"
               [style.width.%]="100 / ganttMonths.length">
            {{ m | date:'MMM yy' }}
          </div>
        </div>
        <!-- grid lines + today -->
        <div class="g-grid-lines">
          <div class="g-gl" *ngFor="let m of ganttMonths"
               [style.width.%]="100 / ganttMonths.length"></div>
        </div>
        <div class="g-today" [style.left.%]="todayPct">
          <span class="g-today-label">TODAY</span>
        </div>
      </div>

      <!-- project rows -->
      <ng-container *ngFor="let p of gov.projects">
        <div class="g-row-label">
          <div class="g-proj-name">{{ p.name }}</div>
          <span class="g-phase-tag" [ngClass]="p.phase.toLowerCase()">{{ p.phase }}</span>
        </div>
        <div class="g-row-track">
          <div class="g-stripe"></div>
          <div class="g-bar"
               [style.left.%]="getGanttLeft(p)"
               [style.width.%]="getGanttWidth(p)"
               [ngClass]="'gb-' + p.status.toLowerCase()"
               [title]="p.name + ' · ' + p.startDate + ' → ' + p.projectedEndDate">
            <div class="g-bar-prog" [style.width.%]="gov.getCalculatedProgress(p)"></div>
            <span class="g-bar-pct">{{ gov.getCalculatedProgress(p) }}%</span>
          </div>
          <div class="g-actual" *ngIf="p.actualEndDate"
               [style.left.%]="getGanttActual(p)"
               [title]="'Actual end: ' + p.actualEndDate">
          </div>
        </div>
      </ng-container>
    </div>

    <div class="gantt-key">
      <span class="gk"><span class="gk-bar gb-active"></span>Active</span>
      <span class="gk"><span class="gk-bar gb-critical"></span>Critical</span>
      <span class="gk"><span class="gk-bar gb-planning"></span>Planning</span>
      <span class="gk"><span class="gk-bar gb-closure"></span>Closure</span>
      <span class="gk"><span class="gk-diamond"></span>Actual end</span>
      <span class="gk"><span class="gk-today-line"></span>Today</span>
    </div>
  </div>

  <!-- ══ ROW B: Storytelling · Pipeline · Table ════════════════════════════ -->
  <div class="row-3col">

    <!-- Storytelling widget -->
    <div class="panel story-panel">
      <div class="panel-hd">
        <span class="panel-title">Portfolio Insights</span>
        <span class="panel-sub">auto-generated</span>
      </div>
      <div class="story-list">
        <div class="story-card" *ngFor="let s of insights" [ngClass]="'sc-' + s.type">
          <div class="sc-icon">{{ s.icon }}</div>
          <div class="sc-body">
            <div class="sc-heading">{{ s.heading }}</div>
            <div class="sc-text">{{ s.body }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Phase pipeline -->
    <div class="panel">
      <div class="panel-hd">
        <span class="panel-title">Phase Pipeline</span>
        <span class="panel-sub">distribution</span>
      </div>
      <div class="funnel">
        <div class="fn-row" *ngFor="let s of pipelineStages">
          <div class="fn-label">{{ s.phase }}</div>
          <div class="fn-track">
            <div class="fn-fill" [style.width.%]="s.pct" [style.background]="s.color"></div>
          </div>
          <div class="fn-count">{{ s.count }}</div>
        </div>
      </div>
    </div>

    <!-- Registry table -->
    <div class="panel panel-grow">
      <div class="panel-hd">
        <span class="panel-title">Project Registry</span>
        <a routerLink="/projects" class="panel-link">View all →</a>
      </div>
      <table class="reg-table">
        <thead>
          <tr>
            <th>Project</th>
            <th>Phase</th>
            <th>Status</th>
            <th>Progress</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let p of gov.projects">
            <td>
              <div class="rt-name">{{ p.name }}</div>
              <div class="rt-owner">{{ p.owner }} · {{ p.location }}</div>
            </td>
            <td><span class="g-phase-tag" [ngClass]="p.phase.toLowerCase()">{{ p.phase }}</span></td>
            <td><span class="status-chip" [ngClass]="'sc-' + p.status.toLowerCase()">{{ p.status }}</span></td>
            <td>
              <div class="rt-prog">
                <div class="rt-track">
                  <div class="rt-fill"
                       [style.width.%]="gov.getCalculatedProgress(p)"
                       [style.background]="p.status === 'Critical' ? '#ef4444' : '#0057FF'">
                  </div>
                </div>
                <span class="rt-pct">{{ gov.getCalculatedProgress(p) }}%</span>
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
    /* ════ DESIGN TOKENS ═══════════════════════════════════════════════════ */
    :host {
      --navy:    #001E3C;
      --navy-2:  #0a2a50;
      --blue:    #0057FF;
      --blue-lt: #dbeafe;
      --ink:     #0f172a;
      --ink-2:   #1e293b;
      --muted:   #64748b;
      --border:  #e2e8f0;
      --bg:      #f0f4f8;
      --surface: #ffffff;
      --green:   #10b981;
      --red:     #ef4444;
      --amber:   #f59e0b;
      --sky:     #0ea5e9;
      --r:       10px;
      --sh:      0 1px 2px rgba(0,0,0,.04), 0 4px 20px rgba(0,0,0,.06);
      --font-d:  'Georgia', 'Times New Roman', serif;
      --font-b:  'Trebuchet MS', 'Segoe UI', sans-serif;
      --font-m:  'Courier New', monospace;
      display: block;
      font-family: var(--font-b);
    }

    /* ════ PAGE ═════════════════════════════════════════════════════════════ */
    .dash { padding: 28px 32px; background: var(--bg); min-height: 100vh; display: flex; flex-direction: column; gap: 20px; }

    /* ════ TOPBAR ═══════════════════════════════════════════════════════════ */
    .topbar       { display: flex; justify-content: space-between; align-items: flex-end; padding-bottom: 16px; border-bottom: 1px solid var(--border); }
    .eyebrow      { font-size: 10px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: var(--blue); margin: 0 0 4px; }
    h1            { font-family: var(--font-d); font-size: 26px; font-weight: 700; color: var(--navy); margin: 0; }
    .topbar-right { display: flex; align-items: center; gap: 10px; }
    .live-dot     { width: 8px; height: 8px; border-radius: 50%; background: var(--green); box-shadow: 0 0 0 3px rgba(16,185,129,.25); animation: pulse 2s infinite; }
    @keyframes pulse { 0%,100%{box-shadow:0 0 0 3px rgba(16,185,129,.25)} 50%{box-shadow:0 0 0 6px rgba(16,185,129,.1)} }
    .live-label   { font-size: 11px; font-weight: 700; color: var(--green); }
    .timestamp    { font-size: 11px; color: var(--muted); }
    .role-chip    { background: var(--navy); color: #fff; font-size: 10px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; padding: 4px 12px; border-radius: 20px; }

    /* ════ KPI STRIP ════════════════════════════════════════════════════════ */
    .kpi-strip   { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
    .kpi-card    { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r); padding: 20px; box-shadow: var(--sh); position: relative; overflow: hidden; animation: fadeUp .4s ease both; }
    @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:none; } }
    .kpi-accent  { position: absolute; top: 0; left: 0; right: 0; height: 3px; }
    .kpi-top     { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .kpi-icon    { font-size: 22px; }
    .kpi-trend   { font-size: 10px; font-weight: 700; color: var(--muted); background: #f8fafc; padding: 2px 7px; border-radius: 20px; }
    .trend-up    { color: var(--green) !important; background: #ecfdf5 !important; }
    .trend-dn    { color: var(--red)   !important; background: #fef2f2 !important; }
    .kpi-value   { font-family: var(--font-d); font-size: 28px; font-weight: 700; line-height: 1; margin-bottom: 4px; }
    .kpi-label   { font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: .6px; font-weight: 700; }

    /* ════ PANELS ═══════════════════════════════════════════════════════════ */
    .panel      { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r); padding: 22px 24px; box-shadow: var(--sh); }
    .panel-grow { flex: 1.8 !important; }
    .panel-hd   { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 18px; }
    .panel-title{ font-size: 12px; font-weight: 700; color: var(--ink); text-transform: uppercase; letter-spacing: .8px; }
    .panel-sub  { font-size: 11px; color: var(--muted); }
    .panel-link { font-size: 12px; color: var(--blue); text-decoration: none; font-weight: 700; }
    .panel-link:hover { text-decoration: underline; }

    /* ════ LAYOUT ROWS ══════════════════════════════════════════════════════ */
    .row-3col   { display: flex; gap: 18px; }
    .row-3col .panel { flex: 1; }

    /* ════ DONUT ════════════════════════════════════════════════════════════ */
    .donut-wrap  { display: flex; align-items: center; gap: 18px; }
    .donut-svg   { width: 140px; flex-shrink: 0; }
    .donut-arc   { transition: stroke-dasharray .7s ease, stroke-dashoffset .7s ease; }
    .donut-big   { font-family: var(--font-d); font-size: 24px; font-weight: 700; fill: var(--ink); }
    .donut-sm    { font-size: 7px; font-weight: 700; fill: var(--muted); letter-spacing: 1.5px; }
    .donut-legend{ list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 9px; }
    .donut-legend li { display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--ink-2); }
    .donut-legend li strong { margin-left: auto; padding-left: 10px; font-size: 14px; color: var(--ink); }
    .dl-dot      { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }

    /* ════ BUDGET CHART ═════════════════════════════════════════════════════ */
    .budget-chart { display: flex; flex-direction: column; gap: 14px; }
    .bc-row       { display: flex; align-items: center; gap: 10px; }
    .bc-label     { font-size: 11px; color: var(--muted); width: 130px; flex-shrink: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .bc-tracks    { flex: 1; display: flex; flex-direction: column; gap: 3px; }
    .bc-track     { height: 12px; background: #f1f5f9; border-radius: 4px; overflow: hidden; }
    .bc-track-sm  { height: 7px; }
    .bc-allocated { height: 100%; background: rgba(0,87,255,.2); border: 1.5px solid var(--blue); border-radius: 4px; transition: width .7s ease; }
    .bc-spent     { height: 100%; background: var(--green); border-radius: 4px; opacity: .9; transition: width .7s ease; }
    .bc-amt       { font-size: 11px; font-weight: 700; color: var(--ink); font-family: var(--font-m); width: 44px; text-align: right; flex-shrink: 0; }
    .chart-legend { display: flex; gap: 16px; margin-top: 12px; }
    .cl-swatch    { display: inline-block; width: 12px; height: 12px; border-radius: 3px; margin-right: 5px; vertical-align: middle; }
    .cl-alloc     { background: rgba(0,87,255,.2); border: 1.5px solid var(--blue); }
    .cl-spent     { background: var(--green); }
    .chart-legend span { font-size: 11px; color: var(--muted); display: flex; align-items: center; }

    /* ════ PM VELOCITY ══════════════════════════════════════════════════════ */
    .vel-list  { display: flex; flex-direction: column; gap: 16px; }
    .vel-hd    { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
    .vel-av    { width: 32px; height: 32px; border-radius: 9px; background: var(--navy); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 800; flex-shrink: 0; }
    .vel-meta  { flex: 1; }
    .vel-name  { font-size: 13px; font-weight: 700; color: var(--ink); }
    .vel-dept  { font-size: 10px; color: var(--muted); }
    .vel-pct   { font-size: 17px; font-weight: 800; font-family: var(--font-m); }
    .vel-track { height: 6px; background: var(--border); border-radius: 3px; overflow: hidden; }
    .vel-fill  { height: 100%; border-radius: 3px; transition: width .7s ease; }
    .vel-last  { font-size: 10px; color: var(--muted); margin-top: 4px; }

    /* ════ GANTT ════════════════════════════════════════════════════════════ */
    .gantt          { display: grid; grid-template-columns: 210px 1fr; }
    .g-spacer       { }
    .g-months-wrap  { position: relative; }
    .g-months       { display: flex; border-bottom: 1px solid var(--border); padding-bottom: 5px; margin-bottom: 3px; }
    .g-month        { font-size: 9px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: .4px; text-align: center; }
    .g-grid-lines   { position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; pointer-events: none; }
    .g-gl           { border-right: 1px dashed #e8edf2; }
    .g-today        { position: absolute; top: 0; bottom: 0; width: 2px; background: var(--red); opacity: .8; z-index: 3; pointer-events: none; }
    .g-today-label  { position: absolute; top: 0; left: 4px; font-size: 7px; font-weight: 800; color: var(--red); letter-spacing: .5px; white-space: nowrap; }

    .g-row-label    { display: flex; flex-direction: column; justify-content: center; gap: 3px; padding: 7px 12px 7px 0; border-bottom: 1px solid #f5f7fa; min-height: 46px; }
    .g-proj-name    { font-size: 12px; font-weight: 700; color: var(--ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .g-row-track    { position: relative; display: flex; align-items: center; border-bottom: 1px solid #f5f7fa; min-height: 46px; }
    .g-stripe       { position: absolute; inset: 6px 0; background: #f8fafc; border-radius: 4px; }

    .g-bar          { position: absolute; height: 24px; border-radius: 6px; overflow: hidden; display: flex; align-items: center; z-index: 2; min-width: 4px; cursor: default; }
    .gb-active      { background: rgba(16,185,129,.12);  border: 1.5px solid var(--green); }
    .gb-critical    { background: rgba(239,68,68,.12);   border: 1.5px solid var(--red);   }
    .gb-planning    { background: rgba(148,163,184,.12); border: 1.5px solid #94a3b8;      }
    .gb-closure     { background: rgba(14,165,233,.12);  border: 1.5px solid var(--sky);   }
    .g-bar-prog     { height: 100%; opacity: .3; border-radius: 5px; transition: width .7s ease; }
    .gb-active   .g-bar-prog { background: var(--green); }
    .gb-critical .g-bar-prog { background: var(--red);   }
    .gb-planning .g-bar-prog { background: #94a3b8;      }
    .gb-closure  .g-bar-prog { background: var(--sky);   }
    .g-bar-pct   { position: absolute; right: 5px; font-size: 9px; font-weight: 800; color: var(--ink-2); font-family: var(--font-m); }
    .g-actual    { position: absolute; width: 12px; height: 12px; background: var(--amber); transform: rotate(45deg); z-index: 4; top: 50%; margin-top: -6px; }

    .gantt-key   { display: flex; gap: 18px; margin-top: 12px; flex-wrap: wrap; }
    .gk          { display: flex; align-items: center; gap: 6px; font-size: 11px; color: var(--muted); }
    .gk-bar      { display: inline-block; width: 20px; height: 10px; border-radius: 3px; }
    .gk-diamond  { width: 9px; height: 9px; background: var(--amber); transform: rotate(45deg); display: inline-block; }
    .gk-today-line { width: 14px; height: 2px; background: var(--red); display: inline-block; }

    /* ════ PHASE TAGS ═══════════════════════════════════════════════════════ */
    .g-phase-tag { padding: 2px 7px; border-radius: 4px; font-size: 9px; font-weight: 800; text-transform: uppercase; white-space: nowrap; }
    .initiation  { background: #f1f5f9; color: #64748b; }
    .planning    { background: #eff6ff; color: #3b82f6; }
    .execution   { background: #ecfdf5; color: #059669; }
    .closure     { background: #e0f2fe; color: #0369a1; }

    /* ════ STORYTELLING ═════════════════════════════════════════════════════ */
    .story-panel { }
    .story-list  { display: flex; flex-direction: column; gap: 12px; }
    .story-card  { display: flex; gap: 12px; padding: 12px 14px; border-radius: 8px; border-left: 4px solid transparent; }
    .story-card.sc-warning { background: #fffbeb; border-color: var(--amber); }
    .story-card.sc-success { background: #f0fdf4; border-color: var(--green); }
    .story-card.sc-info    { background: #eff6ff; border-color: var(--blue);  }
    .sc-icon     { font-size: 18px; flex-shrink: 0; margin-top: 1px; }
    .sc-heading  { font-size: 12px; font-weight: 700; color: var(--ink); margin-bottom: 3px; }
    .sc-text     { font-size: 11px; color: var(--muted); line-height: 1.5; }

    /* ════ FUNNEL ═══════════════════════════════════════════════════════════ */
    .funnel    { display: flex; flex-direction: column; gap: 14px; }
    .fn-row    { display: flex; align-items: center; gap: 10px; }
    .fn-label  { font-size: 11px; font-weight: 700; color: var(--ink-2); width: 72px; flex-shrink: 0; }
    .fn-track  { flex: 1; height: 26px; background: #f8fafc; border-radius: 5px; overflow: hidden; }
    .fn-fill   { height: 100%; border-radius: 5px; transition: width .7s ease; opacity: .85; }
    .fn-count  { font-size: 13px; font-weight: 800; color: var(--ink); width: 20px; text-align: right; font-family: var(--font-m); }

    /* ════ REGISTRY TABLE ═══════════════════════════════════════════════════ */
    .reg-table  { width: 100%; border-collapse: collapse; font-size: 12px; }
    .reg-table th { padding: 8px 10px; font-size: 9px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: .6px; border-bottom: 2px solid var(--border); text-align: left; }
    .reg-table td { padding: 10px 10px; border-bottom: 1px solid #f5f7fa; vertical-align: middle; }
    .reg-table tr:last-child td { border-bottom: none; }
    .reg-table tr:hover td { background: #f8fafc; }
    .rt-name   { font-weight: 700; color: var(--ink); font-size: 12px; }
    .rt-owner  { font-size: 10px; color: var(--muted); margin-top: 1px; }
    .rt-prog   { display: flex; align-items: center; gap: 7px; }
    .rt-track  { flex: 1; height: 5px; background: var(--border); border-radius: 3px; overflow: hidden; min-width: 50px; }
    .rt-fill   { height: 100%; border-radius: 3px; transition: width .5s ease; }
    .rt-pct    { font-size: 10px; font-weight: 700; color: var(--muted); font-family: var(--font-m); width: 34px; }

    .status-chip      { padding: 3px 9px; border-radius: 20px; font-size: 9px; font-weight: 800; text-transform: uppercase; white-space: nowrap; }
    .sc-active   { background: #ecfdf5; color: #059669; }
    .sc-critical { background: #fef2f2; color: #dc2626; }
    .sc-planning { background: #f1f5f9; color: #64748b; }
    .sc-closure  { background: #e0f2fe; color: #0369a1; }

    /* ════ RESPONSIVE ═══════════════════════════════════════════════════════ */
    @media (max-width: 1200px) {
      .row-3col { flex-wrap: wrap; }
      .kpi-strip { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 768px) {
      .dash { padding: 16px; }
      .kpi-strip { grid-template-columns: 1fr; }
      .gantt { grid-template-columns: 140px 1fr; }
    }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  pms:      MasterPM[]  = [];
  kpis:     KpiCard[]   = [];
  insights: StoryInsight[] = [];
  pipelineStages: PipelineStage[] = [];

  now = new Date();
  private sub!: Subscription;

  // Gantt
  ganttStart!:   Date;
  ganttEnd!:     Date;
  ganttMonths:   Date[] = [];
  ganttRangeMs!: number;
  todayPct!:     number;

  // Donut
  readonly circumference = 2 * Math.PI * 52;
  activeArc   = 0;
  criticalArc = 0;
  planningArc = 0;
  closureArc  = 0;
  maxBudget   = 0;

  constructor(public gov: GovernanceService) {}

  ngOnInit() {
    this.sub = this.gov.masterPMs$.subscribe((data: MasterPM[]) => this.pms = data);
    this.maxBudget = Math.max(...this.gov.projects.map((p: Project) => p.budget));
    this.buildDonut();
    this.buildKpis();
    this.buildGantt();
    this.buildPipeline();
    this.buildInsights();
  }

  ngOnDestroy() { this.sub?.unsubscribe(); }

  getCount(status: string): number {
    return this.gov.projects.filter((p: Project) => p.status === status).length;
  }

  getSpent(p: Project): number {
    return Math.round(p.budget * (this.gov.getCalculatedProgress(p) / 100));
  }

  // ── Donut ────────────────────────────────────────────────────────────────

  buildDonut() {
    const total = this.gov.projects.length || 1;
    const arc   = (n: number) => (n / total) * this.circumference;
    this.activeArc   = arc(this.getCount('Active'));
    this.criticalArc = arc(this.getCount('Critical'));
    this.planningArc = arc(this.getCount('Planning'));
    this.closureArc  = arc(this.getCount('Closure'));
  }

  // ── KPIs ─────────────────────────────────────────────────────────────────

  buildKpis() {
    const ps  = this.gov.projects;
    const totalBudget  = ps.reduce((s: number, p: Project) => s + p.budget, 0);
    const avgProg      = Math.round(ps.reduce((s: number, p: Project) => s + this.gov.getCalculatedProgress(p), 0) / (ps.length || 1));
    const attached     = ps.filter((p: Project) => p.hasAttachment).length;
    this.kpis = [
      { icon: '📁', value: String(ps.length),
        label: 'Total Projects', color: '#001E3C', trend: 0, trendLabel: 'stable' },
      { icon: '💰', value: 'KES ' + (totalBudget / 1_000_000).toFixed(1) + 'M',
        label: 'Portfolio Value', color: '#0057FF', trend: 1, trendLabel: '+12% QoQ' },
      { icon: '📈', value: avgProg + '%',
        label: 'Avg Progress', color: '#10b981', trend: 1, trendLabel: '+8% MoM' },
      { icon: '🚨', value: String(this.getCount('Critical')),
        label: 'Critical Projects', color: '#ef4444',
        trend: this.getCount('Critical') > 0 ? -1 : 0,
        trendLabel: this.getCount('Critical') > 0 ? 'needs attn' : 'all clear' },
    ];
  }

  // ── Gantt ─────────────────────────────────────────────────────────────────

  buildGantt() {
    const ps    = this.gov.projects;
    const starts = ps.map((p: Project) => new Date(p.startDate).getTime());
    const ends   = ps.map((p: Project) => new Date(p.projectedEndDate).getTime());
    this.ganttStart = new Date(Math.min(...starts));
    this.ganttEnd   = new Date(Math.max(...ends));
    this.ganttStart.setMonth(this.ganttStart.getMonth() - 1);
    this.ganttEnd.setMonth(this.ganttEnd.getMonth() + 1);
    this.ganttRangeMs = this.ganttEnd.getTime() - this.ganttStart.getTime();

    this.ganttMonths = [];
    const cur = new Date(this.ganttStart.getFullYear(), this.ganttStart.getMonth(), 1);
    while (cur <= this.ganttEnd) {
      this.ganttMonths.push(new Date(cur));
      cur.setMonth(cur.getMonth() + 1);
    }

    this.todayPct = Math.min(100, Math.max(0,
      ((Date.now() - this.ganttStart.getTime()) / this.ganttRangeMs) * 100
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

  // ── Pipeline ──────────────────────────────────────────────────────────────

  buildPipeline() {
    const colors: Record<string, string> = {
      Initiation: '#94a3b8', Planning: '#0057FF', Execution: '#10b981', Closure: '#0ea5e9'
    };
    const total = this.gov.projects.length || 1;
    this.pipelineStages = ['Initiation', 'Planning', 'Execution', 'Closure'].map(ph => {
      const count = this.gov.projects.filter((p: Project) => p.phase === ph).length;
      return { phase: ph, count, pct: Math.max(6, (count / total) * 100), color: colors[ph] };
    });
  }

  // ── Storytelling insights (auto-generated from data) ──────────────────────

  buildInsights() {
    const ps       = this.gov.projects;
    const critical = this.getCount('Critical');
    const avgProg  = Math.round(ps.reduce((s: number, p: Project) => s + this.gov.getCalculatedProgress(p), 0) / (ps.length || 1));
    const attached = ps.filter((p: Project) => p.hasAttachment).length;
    const totalBudget = ps.reduce((s: number, p: Project) => s + p.budget, 0);
    const totalSpent  = ps.reduce((s: number, p: Project) => s + this.getSpent(p), 0);
    const burnRate    = Math.round((totalSpent / totalBudget) * 100);

    this.insights = [];

    if (critical > 0) {
      this.insights.push({
        type: 'warning', icon: '⚠️',
        heading: `${critical} project${critical > 1 ? 's' : ''} in critical status`,
        body: `Immediate intervention required. Review resource allocation and unblock dependencies.`
      });
    }

    if (avgProg >= 60) {
      this.insights.push({
        type: 'success', icon: '✅',
        heading: `Portfolio ${avgProg}% complete on average`,
        body: `Execution velocity is on track. Majority of workstreams are progressing within projected timelines.`
      });
    } else {
      this.insights.push({
        type: 'warning', icon: '🐢',
        heading: `Below-target average progress at ${avgProg}%`,
        body: `Consider reviewing phase-gate blockers and PM workload distribution to improve throughput.`
      });
    }

    this.insights.push({
      type: 'info', icon: '💳',
      heading: `${burnRate}% budget utilised across portfolio`,
      body: `KES ${(totalSpent / 1_000_000).toFixed(1)}M of ${(totalBudget / 1_000_000).toFixed(1)}M allocated. ${burnRate > 80 ? 'Approaching budget ceiling — review contingencies.' : 'Spend rate is healthy.'}`
    });

    if (attached < ps.length) {
      this.insights.push({
        type: 'info', icon: '📎',
        heading: `${ps.length - attached} project${ps.length - attached > 1 ? 's' : ''} missing scope documents`,
        body: `Unlinked projects may pose governance risk at phase-gate reviews. Upload scope files from the Projects page.`
      });
    }
  }
}
