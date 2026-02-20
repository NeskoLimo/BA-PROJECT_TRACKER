import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Project {
  id: number;
  name: string;
  pm: string;
  status: string;
  budget: number;
  spent: number;
  progress: number;
  dept: string;
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="reports-container">
      <div class="report-header">
        <h1 class="page-title">Portfolio Audit & Data Explorer</h1>
        <div class="header-stats">
          <div class="mini-gauge" [style.background]="getGaugeGradient()">
            <div class="gauge-inner"><span>92%</span></div>
          </div>
          <p>Portfolio Compliance Score</p>
        </div>
      </div>

      <div class="card data-explorer">
        <div class="explorer-header">
          <h3>Raw Project Data</h3>
          <div class="filter-bar">
            <select [(ngModel)]="filterDept" (change)="applyFilters()">
              <option value="All">All Departments</option>
              <option value="IT">IT Infrastructure</option>
              <option value="Ops">Operations</option>
              <option value="Fin">Finance</option>
            </select>
            <select [(ngModel)]="filterStatus" (change)="applyFilters()">
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Planning">Planning</option>
              <option value="Unassigned">Unassigned (Alert)</option>
            </select>
            <button class="btn-download" (click)="exportToCSV()">💾 Export CSV</button>
          </div>
        </div>

        <div class="table-container">
          <table class="raw-table">
            <thead>
              <tr>
                <th>Project ID</th>
                <th>Project Name</th>
                <th>Manager</th>
                <th>Dept.</th>
                <th>Budget (KES)</th>
                <th>Variance</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let p of pagedProjects">
                <td>#{{ p.id }}</td>
                <td><strong>{{ p.name }}</strong></td>
                <td>
                  <span [class.red-text]="p.pm === 'Unassigned'">{{ p.pm }}</span>
                </td>
                <td>{{ p.dept }}</td>
                <td>{{ p.budget | number }}</td>
                <td [class.text-red]="p.spent > p.budget">
                  {{ (p.budget - p.spent) | number }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="pagination-controls">
          <button [disabled]="currentPage === 1" (click)="currentPage = currentPage - 1">Previous</button>
          <span class="page-info">Page {{ currentPage }} of {{ totalPages }}</span>
          <button [disabled]="currentPage === totalPages" (click)="currentPage = currentPage + 1">Next</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .reports-container { padding: 30px; background: #f8fafc; min-height: 100vh; font-family: 'Inter', sans-serif; }
    .page-title { font-family: 'Georgia', serif; font-size: 24px; color: #0f172a; }
    
    .report-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; border-bottom: 1px solid #e2e8f0; padding-bottom: 20px; }
    .header-stats { display: flex; align-items: center; gap: 15px; }
    
    /* Small Gauge */
    .mini-gauge { width: 60px; height: 30px; border-top-left-radius: 40px; border-top-right-radius: 40px; position: relative; }
    .gauge-inner { position: absolute; bottom: 0; left: 10px; width: 40px; height: 20px; background: #f8fafc; border-top-left-radius: 30px; border-top-right-radius: 30px; display: flex; justify-content: center; align-items: flex-end; font-size: 10px; font-weight: 800; }

    /* Explorer */
    .data-explorer { background: white; border-radius: 12px; border: 1px solid #e2e8f0; padding: 0; overflow: hidden; }
    .explorer-header { padding: 20px; display: flex; justify-content: space-between; align-items: center; background: #fcfdfe; border-bottom: 1px solid #f1f5f9; }
    .filter-bar { display: flex; gap: 10px; }
    .filter-bar select { padding: 8px; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 13px; }
    
    .raw-table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .raw-table th { text-align: left; padding: 15px; background: #f8fafc; color: #64748b; text-transform: uppercase; font-size: 11px; }
    .raw-table td { padding: 15px; border-bottom: 1px solid #f1f5f9; color: #334155; }
    
    .red-text { color: #ef4444; font-weight: 700; }
    .text-red { color: #ef4444; }

    .pagination-controls { padding: 15px; display: flex; justify-content: center; align-items: center; gap: 20px; background: #fcfdfe; }
    .pagination-controls button { padding: 6px 15px; border-radius: 6px; border: 1px solid #cbd5e1; background: white; cursor: pointer; }
    .pagination-controls button:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-download { background: #0f172a; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; }
  `]
})
export class ReportsComponent implements OnInit {
  // 1. Explicit Property Initialization (Fixes TS2339)
  filterDept: string = 'All';
  filterStatus: string = 'All';
  currentPage: number = 1;
  pageSize: number = 5;
  
  allProjects: Project[] = [
    { id: 101, name: 'ERP Sync', pm: 'Alice M.', status: 'Active', budget: 500000, spent: 450000, progress: 90, dept: 'IT' },
    { id: 102, name: 'Cloud Migration', pm: 'Alice M.', status: 'Active', budget: 1200000, spent: 1300000, progress: 60, dept: 'IT' },
    { id: 103, name: 'Warehouse Ops', pm: 'Unassigned', status: 'Planning', budget: 300000, spent: 0, progress: 0, dept: 'Ops' },
    { id: 104, name: 'Audit Prep', pm: 'James K.', status: 'Active', budget: 150000, spent: 50000, progress: 30, dept: 'Fin' },
    { id: 105, name: 'Security Patch', pm: 'Alice M.', status: 'Active', budget: 200000, spent: 180000, progress: 85, dept: 'IT' },
    { id: 106, name: 'Legacy Backup', pm: 'Unassigned', status: 'Planning', budget: 100000, spent: 0, progress: 0, dept: 'IT' }
  ];

  filteredProjects: Project[] = [];

  ngOnInit() {
    this.applyFilters();
  }

  // 2. Filter Logic (Ensures separation from Dashboard)
  applyFilters() {
    this.filteredProjects = this.allProjects.filter(p => {
      const matchDept = this.filterDept === 'All' || p.dept === this.filterDept;
      const matchStatus = this.filterStatus === 'All' || 
                         (this.filterStatus === 'Unassigned' ? p.pm === 'Unassigned' : p.status === this.filterStatus);
      return matchDept && matchStatus;
    });
    this.currentPage = 1;
  }

  // 3. Pagination Logic
  get pagedProjects() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredProjects.slice(start, start + this.pageSize);
  }

  get totalPages() {
    return Math.ceil(this.filteredProjects.length / this.pageSize) || 1;
  }

  getGaugeGradient() {
    const deg = (92 / 100) * 180;
    return `conic-gradient(from 270deg, #22c55e 0deg, #0f172a ${deg}deg, #e2e8f0 ${deg}deg 180deg)`;
  }

  exportToCSV() {
    const headers = "ID,Project,PM,Dept,Budget,Spent\n";
    const rows = this.filteredProjects.map(p => `${p.id},${p.name},${p.pm},${p.dept},${p.budget},${p.spent}`).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'audit_data_export.csv'; a.click();
  }
}
