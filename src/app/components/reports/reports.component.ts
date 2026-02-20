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

      <div class="page-header">
        <div>
          <h1 class="page-title">Management Reports</h1>
          <p class="page-subtitle">Generated {{ today | date:'EEEE, MMMM d, y' }}</p>
        </div>
        <div class="header-actions">
          <button class="btn-secondary" (click)="exportCSV()">⬇ Export CSV</button>
          <button class="btn-primary" (click)="exportPDF()">📄 Export PDF</button>
        </div>
      </div>

      <div class="filter-bar">
        <button class="filter-toggle" [class.active]="showFilters" (click)="showFilters = !showFilters">
          <span class="icon">{{ showFilters ? '✕' : '🔍' }}</span> 
          Filters 
          <span class="filter-count" *ngIf="activeFilterCount > 0">{{ activeFilterCount }}</span>
        </button>
        <div class="search-wrapper">
          <input class="search-input" type="text" placeholder="Search projects or managers..." [(ngModel)]="searchTerm" (ngModelChange)="applyFilters()" />
        </div>
        <button class="btn-clear" *ngIf="activeFilterCount > 0" (click)="clearFilters()">✕ Clear All</button>
      </div>

      <div class="filter-panel" *ngIf="showFilters">
        <div class="filter-grid">
          <div class="filter-group">
            <label>Project Status</label>
            <select class="custom-select" [(ngModel)]="filterStatus" (ngModelChange)="applyFilters()">
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Planning">Planning</option>
              <option value="On Hold">On Hold</option>
              <option value="At Risk">At Risk</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <div class="filter-group">
            <label>Priority Level</label>
            <select class="custom-select" [(ngModel)]="filterPriority" (ngModelChange)="applyFilters()">
              <option value="">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
          <div class="filter-group">
            <label>Project Type</label>
            <select class="custom-select" [(ngModel)]="filterType" (ngModelChange)="applyFilters()">
              <option value="">All Types</option>
              <option value="IT">IT</option>
              <option value="BA">BA</option>
              <option value="Mixed">Mixed</option>
            </select>
          </div>
          <div class="filter-group">
            <label>Lead Manager</label>
            <select class="custom-select" [(ngModel)]="filterPM" (ngModelChange)="applyFilters()">
              <option value="">All Managers</option>
              <option value="Alice M.">Alice M.</option>
              <option value="James K.">James K.</option>
              <option value="Sarah T.">Sarah T.</option>
              <option value="David O.">David O.</option>
              <option value="Linda N.">Linda N.</option>
            </select>
          </div>
          <div class="filter-group">
            <label>Progress Range (%)</label>
            <div class="range-inputs">
              <input type="number" [(ngModel)]="filterMinProgress" (ngModelChange)="applyFilters()" placeholder="Min" />
              <input type="number" [(ngModel)]="filterMaxProgress" (ngModelChange)="applyFilters()" placeholder="Max" />
            </div>
          </div>
        </div>
      </div>

      <div class="stat-cards">
        <div class="stat-card">
          <div class="stat-icon blue">📋</div>
          <div class="stat-info">
            <div class="stat-value">{{ totalRecords }}</div>
            <div class="stat-label">Total Records</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon green">✅</div>
          <div class="stat-info">
            <div class="stat-value">{{ completedCount }}</div>
            <div class="stat-label">Completed</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon red">⚠️</div>
          <div class="stat-info">
            <div class="stat-value">{{ atRiskCount }}</div>
            <div class="stat-label">At Risk</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon gold">💰</div>
          <div class="stat-info">
            <div class="stat-value">{{ totalBudget | currency:'KES':'symbol-narrow':'1.0-0' }}</div>
            <div class="stat-label">Total Budget</div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h2 class="card-title">Project Status Detail</h2>
          <div class="table-meta">Showing {{ pageStart }}–{{ pageEnd }} of {{ totalRecords }}</div>
        </div>
        <div class="table-responsive">
          <table class="report-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Project Name</th>
                <th>PM</th>
                <th>Type</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Budget (KES)</th>
                <th>Spent (KES)</th>
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
                <td class="num-cell">{{ p.budget | currency:'KES':'symbol-narrow':'1.0-0' }}</td>
                <td class="num-cell" [style.color]="p.spent > p.budget ? '#e53e3e' : '#1e293b'">{{ p.spent | currency:'KES':'symbol-narrow':'1.0-0' }}</td>
                <td>
                  <div class="progress-wrap">
                    <div class="progress-bar-bg">
                      <div class="progress-fill" [style.width.%]="p.progress" [style.background]="getProgressColor(p.progress)"></div>
                    </div>
                    <span class="progress-pct">{{ p.progress }}%</span>
                  </div>
                </td>
                <td class="date-cell">{{ p.endDate }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="pagination">
          <div class="page-controls">
            <button class="page-btn" (click)="goToPage(1)" [disabled]="currentPage === 1">«</button>
            <button class="page-btn" (click)="goToPage(currentPage - 1)" [disabled]="currentPage === 1">‹</button>
            <button class="page-btn" *ngFor="let p of pageNumbers" [class.active]="p === currentPage" (click)="goToPage(p)">{{ p }}</button>
            <button class="page-btn" (click)="goToPage(currentPage + 1)" [disabled]="currentPage === totalPages">›</button>
          </div>
          <select class="page-size-select" [(ngModel)]="pageSize" (ngModelChange)="onPageSizeChange()">
            <option [value]="5">5 records</option>
            <option [value]="10">10 records</option>
            <option [value]="20">20 records</option>
          </select>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .reports-page { padding: 24px; color: #1e293b; background: #fcfcfd; }
    
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
    .page-title { font-size: 24px; font-weight: 800; color: #0f172a; margin: 0; }
    .page-subtitle { color: #64748b; font-size: 14px; margin: 4px 0 0; }

    /* RECTIFIED DROPDOWNS & FILTERS */
    .filter-bar { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
    
    .filter-toggle {
      display: flex; align-items: center; gap: 8px; padding: 10px 16px;
      border: 1px solid #e2e8f0; border-radius: 8px; background: white;
      color: #475569; font-weight: 600; font-size: 13px; cursor: pointer; transition: 0.2s;
    }
    .filter-toggle.active { background: #f1f5f9; border-color: #cbd5e1; }
    .filter-count { background: #3b82f6; color: white; border-radius: 99px; padding: 1px 6px; font-size: 10px; }

    .search-wrapper { flex: 1; position: relative; }
    .search-input { 
      width: 100%; padding: 10px 16px; border-radius: 8px; border: 1px solid #e2e8f0; 
      font-size: 14px; outline: none; transition: 0.2s;
    }
    .search-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }

    .filter-panel { 
      background: white; border: 1px solid #e2e8f0; border-radius: 12px; 
      padding: 20px; margin-bottom: 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); 
    }
    .filter-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; }

    .filter-group label { display: block; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 6px; }

    /* Custom Select Styling */
    .custom-select {
      width: 100%; padding: 10px 32px 10px 12px; border-radius: 8px; border: 1px solid #cbd5e1;
      background: #ffffff; color: #334155; font-size: 13px; appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
      background-repeat: no-repeat; background-position: right 10px center; background-size: 14px; cursor: pointer;
    }
    .custom-select:focus { border-color: #3b82f6; outline: none; }

    .range-inputs { display: flex; gap: 8px; }
    .range-inputs input { width: 50%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 13px; }

    /* STAT CARDS */
    .stat-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .stat-card { background: white; border: 1px solid #e2e8f0; padding: 20px; border-radius: 12px; display: flex; align-items: center; gap: 16px; }
    .stat-icon { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px; }
    .stat-icon.blue { background: #eff6ff; }
    .stat-icon.green { background: #f0fdf4; }
    .stat-icon.red { background: #fef2f2; }
    .stat-icon.gold { background: #fffbeb; }
    .stat-value { font-size: 20px; font-weight: 700; color: #0f172a; }
    .stat-label { font-size: 12px; color: #64748b; }

    /* TABLE STYLING */
    .card { background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; }
    .report-table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .report-table th { background: #f8fafc; padding: 12px; text-align: left; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; }
    .report-table td { padding: 14px 12px; border-bottom: 1px solid #f1f5f9; }
    .project-name { font-weight: 600; color: #0f172a; }
    
    .status-badge { padding: 4px 10px; border-radius: 99px; font-size: 11px; font-weight: 600; }
    .status-active { background: #dcfce7; color: #166534; }
    .status-completed { background: #dbeafe; color: #1e40af; }
    
    .progress-bar-bg { width: 80px; height: 6px; background: #e2e8f0; border-radius: 99px; overflow: hidden; }
    .progress-fill { height: 100%; transition: width 0.3s; }

    .pagination { display: flex; justify-content: space-between; align-items: center; margin-top: 20px; }
    .page-btn { padding: 6px 12px; border: 1px solid #e2e8f0; background: white; border-radius: 6px; cursor: pointer; }
    .page-btn.active { background: #0f172a; color: white; border-color: #0f172a; }
  `]
})
export class ReportsComponent {
  today = new Date();
  currentPage = 1;
  pageSize = 5;
  showFilters = false;
  searchTerm = '';
  filterStatus = '';
  filterPriority = '';
  filterType = '';
  filterPM = '';
  filterMinProgress: number | null = null;
  filterMaxProgress: number | null = null;

  allProjects: ProjectReport[] = [
    { id: 1, name: 'ERP System Migration', pm: 'Alice M.', status: 'Active', priority: 'Critical', type: 'IT', budget: 850000, spent: 612000, progress: 72, startDate: 'Jan 10, 2026', endDate: 'Feb 25, 2026' },
    { id: 2, name: 'Customer Portal Redesign', pm: 'James K.', status: 'Active', priority: 'High', type: 'BA', budget: 320000, spent: 144000, progress: 45, startDate: 'Dec 1, 2025', endDate: 'Mar 10, 2026' },
    // ... rest of your project data
  ];

  filteredProjects: ProjectReport[] = [...this.allProjects];

  // Logic Helpers
  get totalRecords() { return this.filteredProjects.length; }
  get pagedProjects() { return this.filteredProjects.slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize); }
  get totalPages() { return Math.ceil(this.totalRecords / this.pageSize); }
  get pageStart() { return (this.currentPage - 1) * this.pageSize + 1; }
  get pageEnd() { return Math.min(this.currentPage * this.pageSize, this.totalRecords); }
  get pageNumbers() { return Array.from({length: this.totalPages}, (_, i) => i + 1); }

  get activeFilterCount() {
    return [this.searchTerm, this.filterStatus, this.filterPriority, this.filterType, this.filterPM, this.filterMinProgress, this.filterMaxProgress]
      .filter(v => v !== '' && v !== null).length;
  }

  applyFilters() {
    this.filteredProjects = this.allProjects.filter(p => {
      const matchSearch = !this.searchTerm || p.name.toLowerCase().includes(this.searchTerm.toLowerCase()) || p.pm.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchStatus = !this.filterStatus || p.status === this.filterStatus;
      const matchPriority = !this.filterPriority || p.priority === this.filterPriority;
      const matchType = !this.filterType || p.type === this.filterType;
      const matchPM = !this.filterPM || p.pm === this.filterPM;
      const matchMin = this.filterMinProgress === null || p.progress >= this.filterMinProgress;
      const matchMax = this.filterMaxProgress === null || p.progress <= this.filterMaxProgress;
      return matchSearch && matchStatus && matchPriority && matchType && matchPM && matchMin && matchMax;
    });
    this.currentPage = 1;
  }

  clearFilters() {
    this.searchTerm = ''; this.filterStatus = ''; this.filterPriority = '';
    this.filterType = ''; this.filterPM = ''; this.filterMinProgress = null; this.filterMaxProgress = null;
    this.applyFilters();
  }

  goToPage(p: number) { this.currentPage = p; }
  onPageSizeChange() { this.currentPage = 1; }

  // Styling Helpers
  getStatusClass(s: string) { return s === 'Active' ? 'status-active' : s === 'Completed' ? 'status-completed' : ''; }
  getPriorityClass(p: string) { return 'priority-badge'; }
  getProgressColor(p: number) { return p > 70 ? '#166534' : '#2563eb'; }

  // Placeholder exports
  exportCSV() { console.log('Exporting CSV...'); }
  exportPDF() { console.log('Exporting PDF...'); }
}
