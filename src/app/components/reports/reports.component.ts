import { Component, OnInit } from '@angular/core';
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
          <button class="btn-secondary">⬇ Export CSV</button>
          <button class="btn-primary">📄 Export PDF</button>
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
            <label>Month</label>
            <select class="custom-select" [(ngModel)]="filterMonth" (ngModelChange)="applyFilters()">
              <option value="">All Months</option>
              <option *ngFor="let m of months" [value]="m.value">{{ m.name }}</option>
            </select>
          </div>

          <div class="filter-group">
            <label>Year</label>
            <select class="custom-select" [(ngModel)]="filterYear" (ngModelChange)="applyFilters()">
              <option value="">All Years</option>
              <option *ngFor="let y of years" [value]="y">{{ y }}</option>
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
        <div class="table-responsive">
          <table class="report-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Project Name</th>
                <th>PM</th>
                <th>Start Date</th>
                <th>Status</th>
                <th>Budget (KES)</th>
                <th>Spent (KES)</th>
                <th>Progress</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let p of pagedProjects; let i = index">
                <td>{{ pageStart + i }}</td>
                <td class="project-name">{{ p?.name }}</td>
                <td>{{ p?.pm }}</td>
                <td>{{ p?.startDate }}</td>
                <td><span class="status-badge" [ngClass]="getStatusClass(p?.status || '')">{{ p?.status }}</span></td>
                <td>{{ p?.budget | currency:'KES':'symbol-narrow':'1.0-0' }}</td>
                <td [style.color]="(p?.spent || 0) > (p?.budget || 0) ? '#e53e3e' : '#1e293b'">
                  {{ p?.spent | currency:'KES':'symbol-narrow':'1.0-0' }}
                </td>
                <td>
                  <div class="progress-wrap">
                    <div class="progress-bar-bg">
                      <div class="progress-fill" [style.width.%]="p?.progress" [style.background]="getProgressColor(p?.progress || 0)"></div>
                    </div>
                    <span>{{ p?.progress }}%</span>
                  </div>
                </td>
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
            <option [value]="5">5 per page</option>
            <option [value]="10">10 per page</option>
          </select>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .reports-page { padding: 24px; font-family: 'Inter', sans-serif; background: #fcfcfd; color: #1e293b; }
    .page-header { display: flex; justify-content: space-between; margin-bottom: 24px; align-items: flex-start; }
    .page-title { font-size: 24px; font-weight: 800; color: #0f172a; margin: 0; letter-spacing: -0.025em; }
    .page-subtitle { color: #64748b; font-size: 14px; margin-top: 4px; }
    
    .filter-bar { display: flex; gap: 12px; margin-bottom: 16px; align-items: center; }
    .filter-toggle { padding: 10px 16px; border-radius: 8px; border: 1px solid #e2e8f0; background: white; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 8px; font-size: 14px; }
    .filter-toggle.active { border-color: #0f172a; background: #f8fafc; }
    .filter-count { background: #0f172a; color: white; padding: 2px 6px; border-radius: 6px; font-size: 10px; }
    .search-wrapper { flex: 1; position: relative; }
    .search-input { width: 100%; padding: 10px 16px; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 14px; transition: all 0.2s; }
    .search-input:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
    .btn-clear { background: none; border: none; color: #ef4444; font-weight: 600; cursor: pointer; font-size: 13px; }

    .filter-panel { background: white; border: 1px solid #e2e8f0; padding: 20px; border-radius: 12px; margin-bottom: 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .filter-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; }
    .filter-group label { display: block; font-size: 11px; font-weight: 700; color: #64748b; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.05em; }
    .custom-select { width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #cbd5e1; appearance: none; background: #fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E") no-repeat right 10px center / 14px; font-size: 13px; }
    .range-inputs { display: flex; gap: 8px; }
    .range-inputs input { width: 50%; padding: 10px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 13px; }

    .stat-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .stat-card { background: white; border: 1px solid #e2e8f0; padding: 20px; border-radius: 12px; display: flex; align-items: center; gap: 16px; }
    .stat-icon { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px; }
    .stat-icon.blue { background: #eff6ff; }
    .stat-icon.green { background: #f0fdf4; }
    .stat-icon.red { background: #fef2f2; }
    .stat-icon.gold { background: #fffbeb; }
    .stat-value { font-size: 20px; font-weight: 700; color: #0f172a; }
    .stat-label { font-size: 12px; color: #64748b; font-weight: 500; }

    .card { background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 0; overflow: hidden; }
    .table-responsive { width: 100%; overflow-x: auto; }
    .report-table { width: 100%; border-collapse: collapse; font-size: 13px; text-align: left; }
    .report-table th { background: #f8fafc; padding: 12px 16px; font-weight: 600; color: #64748b; border-bottom: 1px solid #e2e8f0; text-transform: uppercase; font-size: 11px; }
    .report-table td { padding: 14px 16px; border-bottom: 1px solid #f1f5f9; }
    .project-name { font-weight: 600; color: #0f172a; }
    
    .status-badge { padding: 4px 10px; border-radius: 99px; font-size: 11px; font-weight: 600; }
    .status-active { background: #dcfce7; color: #166534; }
    .status-completed { background: #dbeafe; color: #1e40af; }
    .progress-wrap { display: flex; align-items: center; gap: 8px; }
    .progress-bar-bg { width: 60px; height: 6px; background: #e2e8f0; border-radius: 99px; overflow: hidden; }
    .progress-fill { height: 100%; transition: width 0.3s ease; }

    .pagination { display: flex; justify-content: space-between; align-items: center; padding: 16px 24px; background: #f8fafc; border-top: 1px solid #e2e8f0; }
    .page-controls { display: flex; gap: 4px; }
    .page-btn { padding: 6px 12px; border: 1px solid #e2e8f0; background: white; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 500; }
    .page-btn.active { background: #0f172a; color: white; border-color: #0f172a; }
    .page-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .page-size-select { padding: 6px; border-radius: 6px; border: 1px solid #e2e8f0; font-size: 13px; }
    
    .btn-primary { background: #0f172a; color: white; border: none; padding: 10px 18px; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 14px; }
    .btn-secondary { background: white; border: 1px solid #e2e8f0; padding: 10px 18px; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 14px; }
  `]
})
export class ReportsComponent implements OnInit {
  today = new Date();
  currentPage = 1;
  pageSize = 5;
  showFilters = false;

  // Filter Models
  searchTerm = '';
  filterStatus = '';
  filterPriority = '';
  filterPM = '';
  filterMonth = '';
  filterYear = '';
  filterMinProgress: number | null = null;
  filterMaxProgress: number | null = null;

  // Static Data Lists
  months = [
    { name: 'January', value: 'Jan' }, { name: 'February', value: 'Feb' },
    { name: 'March', value: 'Mar' }, { name: 'April', value: 'Apr' },
    { name: 'May', value: 'May' }, { name: 'June', value: 'Jun' },
    { name: 'July', value: 'Jul' }, { name: 'August', value: 'Aug' },
    { name: 'September', value: 'Sep' }, { name: 'October', value: 'Oct' },
    { name: 'November', value: 'Nov' }, { name: 'December', value: 'Dec' }
  ];
  years = ['2024', '2025', '2026'];

  allProjects: ProjectReport[] = [
    { id: 1, name: 'ERP System Migration', pm: 'Alice M.', status: 'Active', priority: 'Critical', type: 'IT', budget: 850000, spent: 612000, progress: 72, startDate: 'Jan 10, 2026', endDate: 'Feb 25, 2026' },
    { id: 2, name: 'Customer Portal Redesign', pm: 'James K.', status: 'Active', priority: 'High', type: 'BA', budget: 320000, spent: 144000, progress: 45, startDate: 'Dec 1, 2025', endDate: 'Mar 10, 2026' },
    { id: 3, name: 'HR Self-Service Portal', pm: 'Sarah T.', status: 'On Hold', priority: 'Medium', type: 'Mixed', budget: 210000, spent: 63000, progress: 30, startDate: 'Nov 15, 2025', endDate: 'Mar 8, 2026' },
    { id: 4, name: 'Supply Chain Analytics', pm: 'David O.', status: 'At Risk', priority: 'High', type: 'BA', budget: 450000, spent: 388000, progress: 58, startDate: 'Oct 5, 2025', endDate: 'Feb 28, 2026' },
    { id: 5, name: 'Mobile App v2 Launch', pm: 'Linda N.', status: 'Active', priority: 'High', type: 'IT', budget: 380000, spent: 338000, progress: 89, startDate: 'Sep 20, 2025', endDate: 'Mar 20, 2026' },
    { id: 6, name: 'Compliance Audit System', pm: 'Alice M.', status: 'Completed', priority: 'Critical', type: 'Mixed', budget: 275000, spent: 268000, progress: 100, startDate: 'Aug 1, 2025', endDate: 'Feb 10, 2026' },
    { id: 7, name: 'Data Warehouse Upgrade', pm: 'James K.', status: 'Planning', priority: 'Medium', type: 'IT', budget: 600000, spent: 60000, progress: 10, startDate: 'Feb 15, 2026', endDate: 'Jun 30, 2026' }
  ];

  filteredProjects: ProjectReport[] = [];

  ngOnInit(): void {
    this.applyFilters();
  }

  // --- Strict Mode Getters ---
  get totalRecords(): number { return this.filteredProjects.length; }
  get pagedProjects(): ProjectReport[] { 
    return this.filteredProjects.slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize); 
  }
  get completedCount(): number { return this.filteredProjects.filter(p => p.status === 'Completed').length; }
  get atRiskCount(): number { return this.filteredProjects.filter(p => p.status === 'At Risk').length; }
  get totalBudget(): number { return this.filteredProjects.reduce((sum, p) => sum + (p.budget || 0), 0); }
  get totalPages(): number { return Math.ceil(this.totalRecords / this.pageSize); }
  get pageStart(): number { return (this.currentPage - 1) * this.pageSize + 1; }
  get pageNumbers(): number[] { return Array.from({length: this.totalPages}, (_, i) => i + 1); }

  get activeFilterCount(): number {
    return [this.searchTerm, this.filterStatus, this.filterPriority, this.filterPM, this.filterMonth, this.filterYear, this.filterMinProgress, this.filterMaxProgress]
      .filter(v => v !== '' && v !== null).length;
  }

  // --- Filter Logic ---
  applyFilters(): void {
    this.filteredProjects = this.allProjects.filter(p => {
      const matchSearch = !this.searchTerm || 
        p.name.toLowerCase().includes(this.searchTerm.toLowerCase()) || 
        p.pm.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchStatus = !this.filterStatus || p.status === this.filterStatus;
      const matchPriority = !this.filterPriority || p.priority === this.filterPriority;
      const matchPM = !this.filterPM || p.pm === this.filterPM;
      
      // Date logic: Check if "Jan 10, 2026" contains "Jan" and "2026"
      const matchMonth = !this.filterMonth || p.startDate.includes(this.filterMonth);
      const matchYear = !this.filterYear || p.startDate.includes(this.filterYear);

      const matchMin = this.filterMinProgress === null || p.progress >= (this.filterMinProgress || 0);
      const matchMax = this.filterMaxProgress === null || p.progress <= (this.filterMaxProgress || 100);

      return matchSearch && matchStatus && matchPriority && matchPM && matchMonth && matchYear && matchMin && matchMax;
    });
    this.currentPage = 1;
  }

  clearFilters(): void {
    this.searchTerm = ''; this.filterStatus = ''; this.filterPriority = '';
    this.filterPM = ''; this.filterMonth = ''; this.filterYear = '';
    this.filterMinProgress = null; this.filterMaxProgress = null;
    this.applyFilters();
  }

  // --- Helpers ---
  goToPage(p: number): void { this.currentPage = p; }
  onPageSizeChange(): void { this.currentPage = 1; }
  getStatusClass(s: string): string { 
    if (s === 'Active') return 'status-active';
    if (s === 'Completed') return 'status-completed';
    return ''; 
  }
  getProgressColor(p: number): string { 
    if (p >= 100) return '#1d4ed8'; // Completed Blue
    if (p > 70) return '#166534'; // High Progress Green
    if (p > 30) return '#2563eb'; // Mid Progress Blue
    return '#f59e0b'; // Low Progress Amber
  }
}
