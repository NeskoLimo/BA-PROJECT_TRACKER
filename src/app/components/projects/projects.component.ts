import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Project {
  id: number;
  name: string;
  pm: string;
  status: string;
  priority: string;
  budget: number;
  spent: number;
  progress: number;
  dueDate: string;
  type: string;
}

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="projects-wrapper">
      <div class="page-header">
        <div>
          <h1 class="page-title">Project Portfolio</h1>
          <p class="page-subtitle">Manage and track organization-wide initiatives</p>
        </div>
        <div class="header-actions">
          <div class="search-container">
            <span class="search-icon">🔍</span>
            <input type="text" [(ngModel)]="searchTerm" (ngModelChange)="applyFilters()" placeholder="Search projects or managers...">
          </div>
          <button class="btn-primary">+ Add Project</button>
        </div>
      </div>

      <div class="card">
        <div class="table-responsive">
          <table class="projects-table">
            <thead>
              <tr>
                <th>Project Name & Type</th>
                <th>Project Manager</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Financial Health (KES)</th>
                <th>Completion</th>
                <th class="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let p of pagedProjects">
                <td>
                  <div class="project-info">
                    <span class="p-name">{{ p?.name }}</span>
                    <span class="p-type">{{ p?.type }} · Due {{ p?.dueDate }}</span>
                  </div>
                </td>
                <td class="pm-cell">{{ p?.pm }}</td>
                <td>
                  <span class="status-badge" [ngClass]="getStatusClass(p?.status || '')">
                    {{ p?.status }}
                  </span>
                </td>
                <td>
                  <span class="priority-tag" [ngClass]="p?.priority?.toLowerCase()">
                    <span class="p-dot"></span> {{ p?.priority }}
                  </span>
                </td>
                <td>
                  <div class="budget-analytics" [class.over-budget]="(p?.spent || 0) > (p?.budget || 0)">
                    <div class="budget-values">
                      <span class="spent">{{ p?.spent | currency:'KES ':'symbol-narrow':'1.0-0' }}</span>
                      <span class="total">/ {{ p?.budget | currency:'KES ':'symbol-narrow':'1.0-0' }}</span>
                    </div>
                    <div class="budget-bar-bg">
                      <div class="budget-bar-fill" [style.width.%]="getBudgetPercentage(p)"></div>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="progress-container">
                    <div class="progress-mini-bar">
                      <div class="progress-fill" [style.width.%]="p?.progress"></div>
                    </div>
                    <span class="progress-label">{{ p?.progress }}%</span>
                  </div>
                </td>
                <td class="text-right">
                  <button class="btn-action">Edit</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="pagination-footer">
          <div class="pagination-info">
            Showing <b>{{ (currentPage-1)*pageSize + 1 }}</b> to 
            <b>{{ Math.min(currentPage*pageSize, filteredProjects.length) }}</b> of 
            <b>{{ filteredProjects.length }}</b> entries
          </div>
          <div class="pagination-controls">
            <button class="page-btn" [disabled]="currentPage === 1" (click)="goToPage(currentPage - 1)">Previous</button>
            <div class="page-numbers">
              <button *ngFor="let page of pageNumbers" 
                      class="page-btn-num" 
                      [class.active]="page === currentPage" 
                      (click)="goToPage(page)">
                {{ page }}
              </button>
            </div>
            <button class="page-btn" [disabled]="currentPage === totalPages" (click)="goToPage(currentPage + 1)">Next</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .projects-wrapper { padding: 30px; background: #f8fafc; min-height: 100vh; font-family: 'Inter', sans-serif; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 24px; }
    .page-title { font-family: 'Georgia', serif; font-size: 28px; font-weight: 700; color: #0f172a; margin: 0; }
    .page-subtitle { color: #64748b; font-size: 14px; margin-top: 4px; }

    .header-actions { display: flex; gap: 12px; }
    .search-container { position: relative; }
    .search-icon { position: absolute; left: 12px; top: 10px; font-size: 14px; color: #94a3b8; }
    .search-container input { padding: 10px 12px 10px 35px; border-radius: 8px; border: 1px solid #e2e8f0; width: 280px; outline: none; font-size: 13px; }
    .btn-primary { background: #0f172a; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 13px; }

    .card { background: white; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    .table-responsive { width: 100%; overflow-x: auto; }
    .projects-table { width: 100%; border-collapse: collapse; text-align: left; }
    .projects-table th { padding: 16px; font-size: 11px; text-transform: uppercase; color: #64748b; border-bottom: 1px solid #e2e8f0; letter-spacing: 0.05em; background: #fcfdfe; }
    .projects-table td { padding: 16px; border-bottom: 1px solid #f1f5f9; font-size: 13px; vertical-align: middle; }

    .project-info { display: flex; flex-direction: column; }
    .p-name { font-weight: 700; color: #0f172a; margin-bottom: 2px; }
    .p-type { font-size: 11px; color: #94a3b8; font-weight: 500; }
    .pm-cell { color: #475569; font-weight: 500; }

    /* Priority Tags */
    .priority-tag { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 600; background: #f1f5f9; color: #475569; }
    .p-dot { width: 6px; height: 6px; border-radius: 50%; }
    .priority-tag.critical { background: #fef2f2; color: #dc2626; }
    .priority-tag.critical .p-dot { background: #dc2626; }
    .priority-tag.high { background: #fff7ed; color: #ea580c; }
    .priority-tag.high .p-dot { background: #ea580c; }

    /* Budget Analytics */
    .budget-analytics { min-width: 140px; }
    .budget-values { display: flex; gap: 4px; margin-bottom: 6px; font-size: 12px; }
    .spent { font-weight: 700; color: #0f172a; }
    .total { color: #94a3b8; }
    .over-budget .spent { color: #ef4444; }
    .budget-bar-bg { width: 100%; height: 4px; background: #f1f5f9; border-radius: 2px; overflow: hidden; }
    .budget-bar-fill { height: 100%; background: #94a3b8; }
    .over-budget .budget-bar-fill { background: #ef4444; }

    /* Progress Mini */
    .progress-container { display: flex; align-items: center; gap: 10px; }
    .progress-mini-bar { width: 50px; height: 6px; background: #f1f5f9; border-radius: 10px; overflow: hidden; }
    .progress-fill { height: 100%; background: #0f172a; }
    .progress-label { font-size: 11px; font-weight: 700; color: #64748b; }

    /* Badges */
    .status-badge { padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; }
    .status-active { background: #dcfce7; color: #15803d; }
    .status-at-risk { background: #fee2e2; color: #b91c1c; }
    .status-on-hold { background: #fef3c7; color: #92400e; }

    /* Pagination Styling */
    .pagination-footer { padding: 16px 24px; display: flex; justify-content: space-between; align-items: center; background: #fcfdfe; }
    .pagination-info { font-size: 13px; color: #64748b; }
    .pagination-controls { display: flex; align-items: center; gap: 12px; }
    .page-numbers { display: flex; gap: 4px; }
    .page-btn { padding: 6px 12px; border: 1px solid #e2e8f0; background: white; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600; color: #475569; }
    .page-btn-num { width: 32px; height: 32px; border: 1px solid #e2e8f0; background: white; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600; color: #475569; }
    .page-btn-num.active { background: #0f172a; color: white; border-color: #0f172a; }
    .page-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    
    .btn-action { background: none; border: 1px solid #e2e8f0; padding: 4px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; }
    .btn-action:hover { background: #f8fafc; }
    .text-right { text-align: right; }
  `]
})
export class ProjectsComponent implements OnInit {
  Math = Math; // Necessary for template usage
  searchTerm = '';
  currentPage = 1;
  pageSize = 5;

  allProjects: Project[] = [
    { id: 1, name: 'ERP System Migration', type: 'Infrastructure', pm: 'Alice M.', status: 'Active', priority: 'Critical', budget: 850000, spent: 612000, progress: 72, dueDate: 'Feb 25, 2026' },
    { id: 2, name: 'Customer Portal Redesign', type: 'Design', pm: 'James K.', status: 'Active', priority: 'High', budget: 320000, spent: 350000, progress: 45, dueDate: 'Mar 10, 2026' },
    { id: 3, name: 'HR Self-Service Portal', type: 'Web App', pm: 'Sarah T.', status: 'On Hold', priority: 'Medium', budget: 210000, spent: 63000, progress: 30, dueDate: 'Mar 8, 2026' },
    { id: 4, name: 'Supply Chain Analytics', type: 'Big Data', pm: 'David O.', status: 'At Risk', priority: 'High', budget: 450000, spent: 480000, progress: 18, dueDate: 'Feb 28, 2026' },
    { id: 5, name: 'Mobile App v2 Launch', type: 'Mobile', pm: 'Linda N.', status: 'Active', priority: 'High', budget: 380000, spent: 338000, progress: 89, dueDate: 'Mar 20, 2026' },
    { id: 6, name: 'Compliance Audit', type: 'Finance', pm: 'Alice M.', status: 'Completed', priority: 'Medium', budget: 150000, spent: 145000, progress: 100, dueDate: 'Jan 15, 2026' },
    { id: 7, name: 'Warehouse Automation', type: 'Robotics', pm: 'David O.', status: 'Planning', priority: 'Critical', budget: 1200000, spent: 50000, progress: 5, dueDate: 'Jun 30, 2026' }
  ];

  filteredProjects: Project[] = [];

  ngOnInit() {
    this.applyFilters();
  }

  applyFilters() {
    this.filteredProjects = this.allProjects.filter(p => 
      p.name.toLowerCase().includes(this.searchTerm.toLowerCase()) || 
      p.pm.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
    this.currentPage = 1;
  }

  get pagedProjects() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredProjects.slice(start, start + this.pageSize);
  }

  get totalPages() {
    return Math.ceil(this.filteredProjects.length / this.pageSize);
  }

  get pageNumbers() {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  goToPage(page: number) {
    this.currentPage = page;
  }

  getBudgetPercentage(p: Project): number {
    return Math.min((p.spent / p.budget) * 100, 100);
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      'Active': 'status-active',
      'At Risk': 'status-at-risk',
      'On Hold': 'status-on-hold'
    };
    return map[status] || '';
  }
}
