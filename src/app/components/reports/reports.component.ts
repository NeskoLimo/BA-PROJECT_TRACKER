// src/app/components/reports/reports.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ProjectReport {
  id: number;
  name: string;
  pm: string;
  status: string;
  priority: string;
  budget: number;
  spent: number;
  progress: number;
  startDate: string;
  endDate: string;
  type: string;
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="reports-page">

      <!-- Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Reports</h1>
          <p class="page-subtitle">Generated {{ today | date:'EEEE, MMMM d, y' }}</p>
        </div>
        <div class="header-actions">
          <button class="btn-secondary" (click)="exportCSV()">⬇ Export CSV</button>
          <button class="btn-primary" (click)="exportPDF()">📄 Export PDF</button>
        </div>
      </div>

      <!-- Filter Bar -->
      <div class="filter-bar">
        <button class="filter-toggle" (click)="showFilters = !showFilters">
          🔽 Filters <span class="filter-count" *ngIf="activeFilterCount > 0">{{ activeFilterCount }}</span>
        </button>
        <input class="search-input" type="text" placeholder="🔍 Search projects..." [(ngModel)]="searchTerm" (ngModelChange)="applyFilters()" />
        <button class="btn-clear" *ngIf="activeFilterCount > 0" (click)="clearFilters()">✕ Clear Filters</button>
      </div>

      <!-- Filter Panel -->
      <div class="filter-panel" *ngIf="showFilters">
        <div class="filter-group">
          <label>Status</label>
          <select [(ngModel)]="filterStatus" (ngModelChange)="applyFilters()">
            <option value="">All</option>
            <option value="Active">Active</option>
            <option value="Planning">Planning</option>
            <option value="On Hold">On Hold</option>
            <option value="At Risk">At Risk</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Priority</label>
          <select [(ngModel)]="filterPriority" (ngModelChange)="applyFilters()">
            <option value="">All</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Type</label>
          <select [(ngModel)]="filterType" (ngModelChange)="applyFilters()">
            <option value="">All</option>
            <option value="IT">IT</option>
            <option value="BA">BA</option>
            <option value="Mixed">Mixed</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Project Manager</label>
          <select [(ngModel)]="filterPM" (ngModelChange)="applyFilters()">
            <option value="">All</option>
            <option value="Alice M.">Alice M.</option>
            <option value="James K.">James K.</option>
            <option value="Sarah T.">Sarah T.</option>
            <option value="David O.">David O.</option>
            <option value="Linda N.">Linda N.</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Min Progress (%)</label>
          <input type="number" [(ngModel)]="filterMinProgress" (ngModelChange)="applyFilters()" min="0" max="100" placeholder="0" />
        </div>
        <div class="filter-group">
          <label>Max Progress (%)</label>
          <input type="number" [(ngModel)]="filterMaxProgress" (ngModelChange)="applyFilters()" min="0" max="100" placeholder="100" />
        </div>
      </div>

      <!-- Summary Stat Cards -->
      <div class="stat-cards">
        <div class="stat-card">
          <div class="stat-icon" style="background:#e8f4fd;">📋</div>
          <div class="stat-info">
            <div class="stat-value">{{ totalRecords }}</div>
            <div class="stat-label">Total Records</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background:#e8fdf0;">✅</div>
          <div class="stat-info">
            <div class="stat-value">{{ completedCount }}</div>
            <div class="stat-label">Completed</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background:#fde8e8;">⚠️</div>
          <div class="stat-info">
            <div class="stat-value">{{ atRiskCount }}</div>
            <div class="stat-label">At Risk</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background:#fdf8e8;">💰</div>
          <div class="stat-info">
            <div class="stat-value">{{ totalBudget | currency:'USD':'symbol':'1.0-0' }}</div>
            <div class="stat-label">Total Budget</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background:#edf0fd;">📉</div>
          <div class="stat-info">
            <div class="stat-value">{{ totalSpent | currency:'USD':'symbol':'1.0-0' }}</div>
            <div class="stat-label">Total Spent</div>
          </div>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="charts-row">

        <!-- Project Status Summary -->
        <div class="card">
          <div class="card-header">
            <h2 class="card-title">Project Status Summary</h2>
          </div>
          <div class="status-chart">
            <div class="donut-wrap">
              <div class="donut-legend">
                <div class="legend-item" *ngFor="let s of statusSummary">
                  <div class="legend-dot" [style.background]="s.color"></div>
                  <span class="legend-label">{{ s.status }}</span>
                  <span class="legend-count">{{ s.count }}</span>
                  <span class="legend-pct">{{ s.pct }}%</span>
                </div>
              </div>
            </div>
            <div class="status-bars">
              <div class="status-bar-row" *ngFor="let s of statusSummary">
                <div class="status-bar-track">
                  <div class="status-bar-fill" [style.width.%]="s.pct" [style.background]="s.color"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Budget vs Actual -->
        <div class="card">
          <div class="card-header">
            <h2 class="card-title">Budget vs Actual Spend</h2>
          </div>
          <div class="budget-chart">
            <div class="budget-row" *ngFor="let p of budgetData">
              <div class="budget-name">{{ p.name }}</div>
              <div class="budget-bars">
                <div class="budget-bar-wrap">
                  <div class="budget-label-sm">Budget</div>
                  <div class="budget-track">
                    <div class="budget-fill budget-total" [style.width.%]="100"></div>
                  </div>
                  <span class="budget-amt">{{ p.budget | currency:'USD':'symbol':'1.0-0' }}</span>
                </div>
                <div class="budget-bar-wrap">
                  <div class="budget-label-sm">Spent</div>
                  <div class="budget-track">
                    <div class="budget-fill" [style.width.%]="(p.spent/p.budget)*100" [style.background]="p.spent > p.budget ? '#e53e3e' : '#3182ce'"></div>
                  </div>
                  <span class="budget-amt" [style.color]="p.spent > p.budget ? '#e53e3e' : '#2d3748'">{{ p.spent | currency:'USD':'symbol':'1.0-0' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- PM Performance -->
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">PM Performance Metrics</h2>
          <span class="card-subtitle">Based on project completion & budget adherence</span>
        </div>
        <table class="pm-table">
          <thead>
            <tr>
              <th>Project Manager</th>
              <th>Projects</th>
              <th>Completed</th>
              <th>On Time Rate</th>
              <th>Budget Adherence</th>
              <th>Avg Progress</th>
              <th>Performance</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let pm of pmMetrics">
              <td class="pm-name">{{ pm.name }}</td>
              <td>{{ pm.projects }}</td>
              <td>{{ pm.completed }}</td>
              <td>
                <div class="metric-bar-wrap">
                  <div class="metric-bar">
                    <div class="metric-fill" [style.width.%]="pm.onTime" style="background:#38a169"></div>
                  </div>
                  <span>{{ pm.onTime }}%</span>
                </div>
              </td>
              <td>
                <div class="metric-bar-wrap">
                  <div class="metric-bar">
                    <div class="metric-fill" [style.width.%]="pm.budgetAdherence" [style.background]="pm.budgetAdherence >= 80 ? '#38a169' : '#e53e3e'"></div>
                  </div>
                  <span>{{ pm.budgetAdherence }}%</span>
                </div>
              </td>
              <td>
                <div class="metric-bar-wrap">
                  <div class="metric-bar">
                    <div class="metric-fill" [style.width.%]="pm.avgProgress" style="background:#3182ce"></div>
                  </div>
                  <span>{{ pm.avgProgress }}%</span>
                </div>
              </td>
              <td>
                <span class="perf-badge" [ngClass]="getPerfClass(pm.score)">{{ pm.scoreLabel }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Timeline -->
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">Project Timeline</h2>
          <span class="card-subtitle">Gantt-style view — Feb to Jun 2026</span>
        </div>
        <div class="gantt">
          <div class="gantt-months">
            <div class="gantt-label-col"></div>
            <div class="gantt-month" *ngFor="let m of months">{{ m }}</div>
          </div>
          <div class="gantt-row" *ngFor="let p of ganttProjects">
            <div class="gantt-name">{{ p.name }}</div>
            <div class="gantt-track">
              <div class="gantt-bar"
                [style.marginLeft.%]="p.startPct"
                [style.width.%]="p.widthPct"
                [style.background]="p.color"
                [title]="p.name + ': ' + p.start + ' → ' + p.end">
                <span class="gantt-bar-label">{{ p.progress }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Full Report Table with Pagination -->
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">Full Project Status Report</h2>
          <div class="table-meta">
            Showing {{ pageStart }}–{{ pageEnd }} of {{ totalRecords }} records
          </div>
        </div>
        <table class="report-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Project Name</th>
              <th>PM</th>
              <th>Type</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Budget</th>
              <th>Spent</th>
              <th>Progress</th>
              <th>End Date</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of pagedProjects; let i = index">
              <td class="row-num">{{ pageStart + i }}</td>
              <td class="project-name">{{ p.name }}</td>
              <td>{{ p.pm }}</td>
              <td><span class="type-badge">{{ p.type }}</span></td>
              <td><span class="status-badge" [ngClass]="getStatusClass(p.status)">{{ p.status }}</span></td>
              <td><span class="priority-badge" [ngClass]="getPriorityClass(p.priority)">{{ p.priority }}</span></td>
              <td class="num-cell">{{ p.budget | currency:'USD':'symbol':'1.0-0' }}</td>
              <td class="num-cell" [style.color]="p.spent > p.budget ? '#e53e3e' : '#2d3748'">{{ p.spent | currency:'USD':'symbol':'1.0-0' }}</td>
              <td>
                <div class="progress-wrap">
                  <div class="progress-bar"><div class="progress-fill" [style.width.%]="p.progress" [style.background]="getProgressColor(p.progress)"></div></div>
                  <span class="progress-pct">{{ p.progress }}%</span>
                </div>
              </td>
              <td class="date-cell">{{ p.endDate }}</td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <div class="pagination">
          <span class="page-info">Page {{ currentPage }} of {{ totalPages }}</span>
          <div class="page-controls">
            <button class="page-btn" (click)="goToPage(1)" [disabled]="currentPage === 1">«</button>
            <button class="page-btn" (click)="goToPage(currentPage - 1)" [disabled]="currentPage === 1">‹</button>
            <button class="page-btn"
              *ngFor="let p of pageNumbers"
              [class.active]="p === currentPage"
              (click)="goToPage(p)">{{ p }}</button>
            <button class="page-btn" (click)="goToPage(currentPage + 1)" [disabled]="currentPage === totalPages">›</button>
            <button class="page-btn" (click)="goToPage(totalPages)" [disabled]="currentPage === totalPages">»</button>
          </div>
          <select class="page-size-select" [(ngModel)]="pageSize" (ngModelChange)="onPageSizeChange()">
            <option [value]="5">5 / page</option>
            <option [value]="10">10 / page</option>
            <option [value]="20">20 / page</option>
          </select>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .reports-page {
      display: flex;
      flex-direction: column;
      gap: 20px;
      font-family: sans-serif;
      color: #1a2332;
    }

    /* Filter Bar */
    .filter-bar {
      display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
    }
    .filter-toggle {
      display: flex; align-items: center; gap: 6px;
      padding: 9px 16px; border: 1px solid #e8ecf0; border-radius: 8px;
      background: #f7f9fc; font-size: 13px; font-weight: 600;
      color: #4a5568; cursor: pointer; white-space: nowrap;
    }
    .filter-toggle:hover { background: #edf2f7; }
    .filter-count {
      background: #1a2332; color: white; border-radius: 99px;
      font-size: 10px; padding: 1px 6px; font-weight: 700;
    }
    .search-input {
      flex: 1; min-width: 200px; padding: 9px 14px;
      border: 1px solid #e8ecf0; border-radius: 8px;
      font-size: 13px; color: #1a2332; outline: none; background: #fff;
    }
    .search-input:focus { border-color: #1a2332; }
    .btn-clear {
      padding: 9px 14px; border: 1px solid #fde8e8; border-radius: 8px;
      background: #fde8e8; color: #e53e3e; font-size: 13px;
      font-weight: 600; cursor: pointer; white-space: nowrap;
    }

    /* Filter Panel */
    .filter-panel {
      display: flex; flex-wrap: wrap; gap: 14px;
      background: #f7f9fc; border: 1px solid #e8ecf0;
      border-radius: 10px; padding: 16px 20px;
    }
    .filter-group {
      display: flex; flex-direction: column; gap: 5px; min-width: 150px; flex: 1;
    }
    .filter-group label {
      font-size: 11px; font-weight: 700; color: #718096;
      text-transform: uppercase; letter-spacing: 0.4px;
    }
    .filter-group select, .filter-group input {
      padding: 8px 10px; border: 1px solid #e8ecf0; border-radius: 7px;
      font-size: 13px; color: #1a2332; background: #fff; outline: none;
    }
    .filter-group select:focus, .filter-group input:focus { border-color: #1a2332; }

    /* Header */
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .page-title {
      font-size: 26px;
      font-weight: 700;
      margin: 0 0 4px;
      font-family: 'Georgia', serif;
      color: #1a2332;
    }
    .page-subtitle { font-size: 13px; color: #718096; margin: 0; }
    .header-actions { display: flex; gap: 10px; }

    .btn-primary {
      background: #1a2332; color: white; border: none;
      padding: 10px 18px; border-radius: 8px; font-size: 13px;
      font-weight: 600; cursor: pointer;
    }
    .btn-primary:hover { background: #2d3748; }
    .btn-secondary {
      background: #f7f9fc; color: #1a2332; border: 1px solid #e8ecf0;
      padding: 10px 18px; border-radius: 8px; font-size: 13px;
      font-weight: 600; cursor: pointer;
    }
    .btn-secondary:hover { background: #edf2f7; }

    /* Stat Cards */
    .stat-cards {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 14px;
    }
    .stat-card {
      background: #fff; border: 1px solid #e8ecf0; border-radius: 10px;
      padding: 18px; display: flex; flex-direction: column; gap: 10px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }
    .stat-icon { width: 38px; height: 38px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 17px; }
    .stat-value { font-size: 22px; font-weight: 700; color: #1a2332; line-height: 1; font-family: 'Georgia', serif; }
    .stat-label { font-size: 11px; color: #718096; margin-top: 2px; }

    /* Card */
    .card {
      background: #fff; border: 1px solid #e8ecf0; border-radius: 10px;
      padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }
    .card-header {
      display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;
    }
    .card-title { font-size: 16px; font-weight: 700; margin: 0; font-family: 'Georgia', serif; color: #1a2332; }
    .card-subtitle { font-size: 12px; color: #a0aec0; }
    .table-meta { font-size: 12px; color: #718096; }

    /* Charts Row */
    .charts-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

    /* Status Summary */
    .status-chart { display: flex; flex-direction: column; gap: 12px; }
    .donut-legend { display: flex; flex-direction: column; gap: 10px; }
    .legend-item { display: flex; align-items: center; gap: 10px; font-size: 13px; }
    .legend-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
    .legend-label { flex: 1; color: #4a5568; }
    .legend-count { font-weight: 700; color: #1a2332; width: 20px; }
    .legend-pct { color: #a0aec0; width: 36px; text-align: right; }
    .status-bars { display: flex; flex-direction: column; gap: 6px; margin-top: 4px; }
    .status-bar-track { height: 8px; background: #f0f4f8; border-radius: 99px; overflow: hidden; }
    .status-bar-fill { height: 100%; border-radius: 99px; transition: width 0.5s ease; }

    /* Budget Chart */
    .budget-chart { display: flex; flex-direction: column; gap: 16px; }
    .budget-row { display: flex; flex-direction: column; gap: 4px; }
    .budget-name { font-size: 12px; font-weight: 600; color: #1a2332; margin-bottom: 4px; }
    .budget-bars { display: flex; flex-direction: column; gap: 4px; }
    .budget-bar-wrap { display: flex; align-items: center; gap: 8px; }
    .budget-label-sm { font-size: 10px; color: #a0aec0; width: 36px; }
    .budget-track { flex: 1; height: 8px; background: #f0f4f8; border-radius: 99px; overflow: hidden; }
    .budget-fill { height: 100%; border-radius: 99px; transition: width 0.5s; }
    .budget-total { background: #e2e8f0; }
    .budget-amt { font-size: 11px; color: #2d3748; width: 80px; text-align: right; }

    /* PM Table */
    .pm-table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .pm-table th {
      text-align: left; padding: 10px 12px; font-size: 11px; font-weight: 700;
      color: #a0aec0; text-transform: uppercase; letter-spacing: 0.5px;
      border-bottom: 1px solid #e8ecf0; background: #f7f9fc;
    }
    .pm-table td { padding: 12px; border-bottom: 1px solid #f7f9fc; color: #2d3748; vertical-align: middle; }
    .pm-table tr:last-child td { border-bottom: none; }
    .pm-name { font-weight: 600; color: #1a2332 !important; }
    .metric-bar-wrap { display: flex; align-items: center; gap: 8px; font-size: 12px; color: #718096; }
    .metric-bar { width: 80px; height: 6px; background: #f0f4f8; border-radius: 99px; overflow: hidden; }
    .metric-fill { height: 100%; border-radius: 99px; }
    .perf-badge { padding: 3px 10px; border-radius: 99px; font-size: 11px; font-weight: 700; }
    .perf-excellent { background: #e8fdf0; color: #38a169; }
    .perf-good { background: #e8f4fd; color: #3182ce; }
    .perf-average { background: #fdf8e8; color: #d69e2e; }
    .perf-poor { background: #fde8e8; color: #e53e3e; }

    /* Gantt */
    .gantt { display: flex; flex-direction: column; gap: 10px; overflow-x: auto; }
    .gantt-months { display: flex; margin-bottom: 4px; }
    .gantt-label-col { width: 160px; flex-shrink: 0; }
    .gantt-month { flex: 1; font-size: 11px; font-weight: 700; color: #a0aec0; text-transform: uppercase; text-align: center; }
    .gantt-row { display: flex; align-items: center; }
    .gantt-name { width: 160px; flex-shrink: 0; font-size: 12px; font-weight: 600; color: #1a2332; padding-right: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .gantt-track { flex: 1; height: 24px; background: #f7f9fc; border-radius: 4px; position: relative; overflow: hidden; }
    .gantt-bar { position: absolute; height: 100%; border-radius: 4px; display: flex; align-items: center; padding: 0 8px; min-width: 30px; transition: all 0.3s; }
    .gantt-bar:hover { filter: brightness(1.1); }
    .gantt-bar-label { font-size: 10px; font-weight: 700; color: white; white-space: nowrap; }

    /* Report Table */
    .report-table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .report-table th {
      text-align: left; padding: 10px 12px; font-size: 11px; font-weight: 700;
      color: #a0aec0; text-transform: uppercase; letter-spacing: 0.5px;
      border-bottom: 1px solid #e8ecf0; background: #f7f9fc; white-space: nowrap;
    }
    .report-table td { padding: 11px 12px; border-bottom: 1px solid #f7f9fc; vertical-align: middle; }
    .report-table tr:last-child td { border-bottom: none; }
    .report-table tr:hover td { background: #f7f9fc; }
    .row-num { color: #cbd5e0; font-size: 12px; }
    .project-name { font-weight: 600; color: #1a2332; white-space: nowrap; }
    .num-cell { font-weight: 600; white-space: nowrap; }
    .date-cell { color: #718096; white-space: nowrap; }

    .type-badge { background: #edf2f7; color: #4a5568; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
    .status-badge { padding: 3px 10px; border-radius: 99px; font-size: 11px; font-weight: 700; white-space: nowrap; }
    .status-active { background: #e8fdf0; color: #38a169; }
    .status-on-hold { background: #fdf8e8; color: #d69e2e; }
    .status-at-risk { background: #fde8e8; color: #e53e3e; }
    .status-completed { background: #e8f4fd; color: #3182ce; }
    .status-planning { background: #f3e8fd; color: #805ad5; }
    .priority-badge { padding: 3px 10px; border-radius: 4px; font-size: 11px; font-weight: 700; white-space: nowrap; }
    .priority-critical { background: #fde8e8; color: #e53e3e; }
    .priority-high { background: #fdf0e8; color: #dd6b20; }
    .priority-medium { background: #fdf8e8; color: #d69e2e; }
    .priority-low { background: #e8fdf0; color: #38a169; }

    .progress-wrap { display: flex; align-items: center; gap: 6px; }
    .progress-bar { width: 60px; height: 6px; background: #f0f4f8; border-radius: 99px; overflow: hidden; }
    .progress-fill { height: 100%; border-radius: 99px; }
    .progress-pct { font-size: 11px; color: #718096; }

    /* Pagination */
    .pagination {
      display: flex; align-items: center; justify-content: space-between;
      margin-top: 16px; padding-top: 16px; border-top: 1px solid #e8ecf0;
    }
    .page-info { font-size: 13px; color: #718096; }
    .page-controls { display: flex; gap: 4px; }
    .page-btn {
      width: 32px; height: 32px; border: 1px solid #e8ecf0; background: #fff;
      border-radius: 6px; font-size: 13px; cursor: pointer; color: #4a5568;
      display: flex; align-items: center; justify-content: center;
    }
    .page-btn:hover:not(:disabled) { background: #f7f9fc; color: #1a2332; }
    .page-btn.active { background: #1a2332; color: white; border-color: #1a2332; }
    .page-btn:disabled { opacity: 0.35; cursor: not-allowed; }
    .page-size-select {
      padding: 6px 10px; border: 1px solid #e8ecf0; border-radius: 6px;
      font-size: 13px; color: #4a5568; background: #fff; cursor: pointer;
    }
  `]
})
export class ReportsComponent {
  today = new Date();
  currentPage = 1;
  pageSize = 5;

  allProjects: ProjectReport[] = [
    { id: 1, name: 'ERP System Migration', pm: 'Alice M.', status: 'Active', priority: 'Critical', type: 'IT', budget: 850000, spent: 612000, progress: 72, startDate: 'Jan 10, 2026', endDate: 'Feb 25, 2026' },
    { id: 2, name: 'Customer Portal Redesign', pm: 'James K.', status: 'Active', priority: 'High', type: 'BA', budget: 320000, spent: 144000, progress: 45, startDate: 'Dec 1, 2025', endDate: 'Mar 10, 2026' },
    { id: 3, name: 'HR Self-Service Portal', pm: 'Sarah T.', status: 'On Hold', priority: 'Medium', type: 'Mixed', budget: 210000, spent: 63000, progress: 30, startDate: 'Nov 15, 2025', endDate: 'Mar 8, 2026' },
    { id: 4, name: 'Supply Chain Analytics', pm: 'David O.', status: 'At Risk', priority: 'High', type: 'BA', budget: 450000, spent: 388000, progress: 58, startDate: 'Oct 5, 2025', endDate: 'Feb 28, 2026' },
    { id: 5, name: 'Mobile App v2 Launch', pm: 'Linda N.', status: 'Active', priority: 'High', type: 'IT', budget: 380000, spent: 338000, progress: 89, startDate: 'Sep 20, 2025', endDate: 'Mar 20, 2026' },
    { id: 6, name: 'Compliance Audit System', pm: 'Alice M.', status: 'Completed', priority: 'Critical', type: 'Mixed', budget: 275000, spent: 268000, progress: 100, startDate: 'Aug 1, 2025', endDate: 'Feb 10, 2026' },
    { id: 7, name: 'Data Warehouse Upgrade', pm: 'James K.', status: 'Planning', priority: 'Medium', type: 'IT', budget: 600000, spent: 60000, progress: 10, startDate: 'Feb 15, 2026', endDate: 'Jun 30, 2026' },
    { id: 8, name: 'Finance Reporting Tool', pm: 'Sarah T.', status: 'Active', priority: 'Low', type: 'BA', budget: 95000, spent: 59000, progress: 62, startDate: 'Jan 5, 2026', endDate: 'Apr 15, 2026' },
    { id: 9, name: 'Network Infrastructure', pm: 'David O.', status: 'Active', priority: 'Critical', type: 'IT', budget: 720000, spent: 290000, progress: 40, startDate: 'Jan 20, 2026', endDate: 'May 30, 2026' },
    { id: 10, name: 'CRM Integration', pm: 'Linda N.', status: 'Planning', priority: 'High', type: 'Mixed', budget: 410000, spent: 41000, progress: 10, startDate: 'Feb 1, 2026', endDate: 'Jun 15, 2026' },
    { id: 11, name: 'Business Intelligence Platform', pm: 'Alice M.', status: 'Active', priority: 'High', type: 'BA', budget: 530000, spent: 212000, progress: 40, startDate: 'Dec 10, 2025', endDate: 'Apr 30, 2026' },
    { id: 12, name: 'Cloud Migration Phase 2', pm: 'James K.', status: 'At Risk', priority: 'Critical', type: 'IT', budget: 980000, spent: 910000, progress: 65, startDate: 'Oct 1, 2025', endDate: 'Mar 31, 2026' },
  ];

  get completedCount() { return this.filteredProjects.filter(p => p.status === 'Completed').length; }
  get atRiskCount() { return this.filteredProjects.filter(p => p.status === 'At Risk').length; }
  get totalBudget() { return this.filteredProjects.reduce((s, p) => s + p.budget, 0); }
  get totalSpent() { return this.filteredProjects.reduce((s, p) => s + p.spent, 0); }
  get totalPages() { return Math.ceil(this.filteredProjects.length / this.pageSize); }
  get pageStart() { return (this.currentPage - 1) * this.pageSize + 1; }
  get pageEnd() { return Math.min(this.currentPage * this.pageSize, this.filteredProjects.length); }
  get pageNumbers() {
    const pages = [];
    for (let i = 1; i <= this.totalPages; i++) pages.push(i);
    return pages;
  }

  statusSummary = [
    { status: 'Active', count: 6, pct: 50, color: '#38a169' },
    { status: 'Planning', count: 2, pct: 17, color: '#805ad5' },
    { status: 'At Risk', count: 2, pct: 17, color: '#e53e3e' },
    { status: 'On Hold', count: 1, pct: 8, color: '#d69e2e' },
    { status: 'Completed', count: 1, pct: 8, color: '#3182ce' },
  ];

  budgetData = [
    { name: 'ERP Migration', budget: 850000, spent: 612000 },
    { name: 'Cloud Migration', budget: 980000, spent: 910000 },
    { name: 'Network Infra', budget: 720000, spent: 290000 },
    { name: 'Data Warehouse', budget: 600000, spent: 60000 },
    { name: 'BI Platform', budget: 530000, spent: 212000 },
  ];

  pmMetrics = [
    { name: 'Alice M.', projects: 3, completed: 1, onTime: 92, budgetAdherence: 88, avgProgress: 71, score: 90, scoreLabel: 'Excellent' },
    { name: 'James K.', projects: 3, completed: 0, onTime: 85, budgetAdherence: 72, avgProgress: 40, score: 75, scoreLabel: 'Good' },
    { name: 'Sarah T.', projects: 2, completed: 0, onTime: 78, budgetAdherence: 85, avgProgress: 46, score: 78, scoreLabel: 'Good' },
    { name: 'David O.', projects: 2, completed: 0, onTime: 65, budgetAdherence: 60, avgProgress: 49, score: 62, scoreLabel: 'Average' },
    { name: 'Linda N.', projects: 2, completed: 0, onTime: 70, budgetAdherence: 78, avgProgress: 50, score: 68, scoreLabel: 'Average' },
  ];

  months = ['Feb', 'Mar', 'Apr', 'May', 'Jun'];

  ganttProjects = [
    { name: 'ERP Migration', start: 'Jan', end: 'Feb', startPct: 0, widthPct: 20, progress: 72, color: '#e53e3e' },
    { name: 'Customer Portal', start: 'Dec', end: 'Mar', startPct: 0, widthPct: 40, progress: 45, color: '#3182ce' },
    { name: 'HR Portal', start: 'Nov', end: 'Mar', startPct: 0, widthPct: 40, progress: 30, color: '#d69e2e' },
    { name: 'Mobile App v2', start: 'Sep', end: 'Mar', startPct: 0, widthPct: 40, progress: 89, color: '#38a169' },
    { name: 'Data Warehouse', start: 'Feb', end: 'Jun', startPct: 0, widthPct: 100, progress: 10, color: '#805ad5' },
    { name: 'Finance Tool', start: 'Jan', end: 'Apr', startPct: 0, widthPct: 60, progress: 62, color: '#dd6b20' },
    { name: 'Network Infra', start: 'Jan', end: 'May', startPct: 0, widthPct: 80, progress: 40, color: '#2b6cb0' },
    { name: 'CRM Integration', start: 'Feb', end: 'Jun', startPct: 0, widthPct: 100, progress: 10, color: '#b7791f' },
  ];

  showFilters = false;
  searchTerm = '';
  filterStatus = '';
  filterPriority = '';
  filterType = '';
  filterPM = '';
  filterMinProgress: number | null = null;
  filterMaxProgress: number | null = null;
  filteredProjects: ProjectReport[] = [];

  get activeFilterCount() {
    return [this.searchTerm, this.filterStatus, this.filterPriority,
      this.filterType, this.filterPM, this.filterMinProgress, this.filterMaxProgress
    ].filter(v => v !== '' && v !== null).length;
  }

  ngOnInit() { this.filteredProjects = [...this.allProjects]; }

  applyFilters() {
    let result = [...this.allProjects];
    if (this.searchTerm) {
      const t = this.searchTerm.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(t) || p.pm.toLowerCase().includes(t));
    }
    if (this.filterStatus) result = result.filter(p => p.status === this.filterStatus);
    if (this.filterPriority) result = result.filter(p => p.priority === this.filterPriority);
    if (this.filterType) result = result.filter(p => p.type === this.filterType);
    if (this.filterPM) result = result.filter(p => p.pm === this.filterPM);
    if (this.filterMinProgress !== null) result = result.filter(p => p.progress >= this.filterMinProgress!);
    if (this.filterMaxProgress !== null) result = result.filter(p => p.progress <= this.filterMaxProgress!);
    this.filteredProjects = result;
    this.currentPage = 1;
  }

  clearFilters() {
    this.searchTerm = ''; this.filterStatus = ''; this.filterPriority = '';
    this.filterType = ''; this.filterPM = ''; this.filterMinProgress = null; this.filterMaxProgress = null;
    this.filteredProjects = [...this.allProjects];
    this.currentPage = 1;
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) this.currentPage = page;
  }

  onPageSizeChange() { this.currentPage = 1; }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      'Active': 'status-active', 'On Hold': 'status-on-hold',
      'At Risk': 'status-at-risk', 'Completed': 'status-completed', 'Planning': 'status-planning'
    };
    return map[status] || '';
  }

  getPriorityClass(priority: string): string {
    const map: Record<string, string> = {
      'Critical': 'priority-critical', 'High': 'priority-high',
      'Medium': 'priority-medium', 'Low': 'priority-low'
    };
    return map[priority] || '';
  }

  getProgressColor(progress: number): string {
    if (progress >= 80) return '#38a169';
    if (progress >= 50) return '#3182ce';
    if (progress >= 25) return '#d69e2e';
    return '#e53e3e';
  }

  getPerfClass(score: number): string {
    if (score >= 85) return 'perf-excellent';
    if (score >= 75) return 'perf-good';
    if (score >= 60) return 'perf-average';
    return 'perf-poor';
  }

  exportCSV() {
    const headers = ['ID', 'Project', 'PM', 'Type', 'Status', 'Priority', 'Budget', 'Spent', 'Progress', 'End Date'];
    const rows = this.allProjects.map(p =>
      [p.id, p.name, p.pm, p.type, p.status, p.priority, p.budget, p.spent, p.progress + '%', p.endDate].join(',')
    );
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'project-report.csv'; a.click();
    URL.revokeObjectURL(url);
  }

  exportPDF() {
    window.print();
  }
}
