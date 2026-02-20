import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Project {
  id: number;
  name: string;
  pm: string;
  type: string;
  status: string;
  priority: string;
  budget: number;
  spent: number;
  progress: number;
  dueDate: string;
}

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="projects-wrapper">
      <div class="page-header">
        <div class="mass-actions">
          <button class="btn-outline" (click)="downloadTemplate()">
            <span class="icon">📥</span> Download CSV Template
          </button>
          <label class="btn-outline upload-label">
            <span class="icon">📤</span> Bulk Upload Projects
            <input type="file" (change)="handleMassUpload($event)" accept=".csv" hidden>
          </label>
        </div>

        <div class="header-main">
          <div>
            <h1 class="page-title">Project Portfolio</h1>
            <p class="page-subtitle">Standardized tracking and mass audit controls</p>
          </div>
          <div class="header-actions">
            <div class="search-container">
              <span class="search-icon">🔍</span>
              <input type="text" [(ngModel)]="searchTerm" (ngModelChange)="applyFilters()" placeholder="Filter portfolio...">
            </div>
            <button class="btn-primary">+ Single Entry</button>
          </div>
        </div>
      </div>

      <div class="card shadow-sm">
        <div class="table-responsive">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Project Details</th>
                <th>Manager</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Budget Health</th>
                <th>Progress</th>
                <th class="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let p of pagedProjects">
                <td>
                  <div class="project-info">
                    <span class="p-name">{{ p?.name }}</span>
                    <span class="p-type">{{ p?.type }}</span>
                  </div>
                </td>
                <td>
                  <span [class.unassigned-text]="p?.pm === 'Unassigned'">
                    {{ p?.pm }}
                  </span>
                </td>
                <td><span class="status-badge" [ngClass]="getStatusClass(p?.status || '')">{{ p?.status }}</span></td>
                <td>
                  <span class="priority-tag" [ngClass]="p?.priority?.toLowerCase()">
                    ● {{ p?.priority }}
                  </span>
                </td>
                <td>
                  <div class="budget-cell" [class.over-budget]="(p?.spent || 0) > (p?.budget || 0)">
                    <span class="spent">{{ p?.spent | currency:'KES ':'symbol-narrow':'1.0-0' }}</span>
                    <span class="total">of {{ p?.budget | currency:'KES ':'symbol-narrow':'1.0-0' }}</span>
                  </div>
                </td>
                <td>
                  <div class="progress-box">
                    <div class="progress-bar"><div class="progress-fill" [style.width.%]="p?.progress"></div></div>
                    <span class="progress-text">{{ p?.progress }}%</span>
                  </div>
                </td>
                <td class="text-right"><button class="btn-icon">⋮</button></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="pagination-bar">
          <span class="page-info">Showing {{ (currentPage-1)*pageSize + 1 }} - {{ Math.min(currentPage*pageSize, filteredProjects.length) }} of {{ filteredProjects.length }}</span>
          <div class="page-controls">
            <button [disabled]="currentPage === 1" (click)="goToPage(currentPage - 1)">Prev</button>
            <button *ngFor="let p of pageNumbers" [class.active]="p === currentPage" (click)="goToPage(p)">{{ p }}</button>
            <button [disabled]="currentPage === totalPages" (click)="goToPage(currentPage + 1)">Next</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .projects-wrapper { padding: 30px; background: #f8fafc; min-height: 100vh; font-family: 'Inter', sans-serif; }
    .mass-actions { display: flex; gap: 12px; margin-bottom: 24px; border-bottom: 1px solid #e2e8f0; padding-bottom: 16px; }
    .btn-outline { background: white; border: 1px solid #cbd5e1; padding: 8px 16px; border-radius: 6px; font-size: 12px; font-weight: 600; color: #475569; cursor: pointer; display: flex; align-items: center; gap: 8px; }
    .btn-outline:hover { background: #f1f5f9; }
    
    .header-main { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 24px; }
    .page-title { font-family: 'Georgia', serif; font-size: 28px; font-weight: 700; color: #0f172a; margin: 0; }
    .page-subtitle { color: #64748b; font-size: 14px; }
    
    .search-container { position: relative; display: inline-block; }
    .search-icon { position: absolute; left: 12px; top: 10px; color: #94a3b8; }
    .search-container input { padding: 10px 12px 10px 35px; border-radius: 8px; border: 1px solid #e2e8f0; width: 250px; outline: none; }
    .btn-primary { background: #0f172a; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 600; }

    .card { background: white; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; }
    .custom-table { width: 100%; border-collapse: collapse; }
    .custom-table th { background: #f8fafc; padding: 16px; font-size: 11px; text-transform: uppercase; color: #64748b; border-bottom: 1px solid #e2e8f0; text-align: left; }
    .custom-table td { padding: 16px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }

    .unassigned-text { color: #ef4444; font-weight: 700; font-style: italic; }
    .priority-tag { font-size: 11px; font-weight: 700; }
    .priority-tag.critical { color: #ef4444; }
    .priority-tag.high { color: #f97316; }

    .budget-cell.over-budget .spent { color: #ef4444; font-weight: 700; }
    .progress-bar { width: 100px; height: 8px; background: #f1f5f9; border-radius: 10px; overflow: hidden; }
    .progress-fill { height: 100%; background: #0f172a; }
    
    .pagination-bar { padding: 16px; display: flex; justify-content: space-between; align-items: center; background: #fcfdfe; }
    .page-controls button { padding: 6px 12px; border: 1px solid #e2e8f0; background: white; border-radius: 6px; cursor: pointer; margin-left: 4px; }
    .page-controls button.active { background: #0f172a; color: white; }
    .text-right { text-align: right; }
  `]
})
export class ProjectsComponent implements OnInit {
  Math = Math;
  searchTerm = '';
  currentPage = 1;
  pageSize = 6;

  allProjects: Project[] = [
    { id: 1, name: 'ERP System Migration', pm: 'Alice M.', type: 'Infrastructure', status: 'Active', priority: 'Critical', budget: 850000, spent: 612000, progress: 72, dueDate: '2026-02-25' },
    { id: 2, name: 'Warehouse Expansion', pm: 'Unassigned', type: 'Operations', status: 'Planning', priority: 'High', budget: 1200000, spent: 0, progress: 0, dueDate: '2026-06-10' }
  ];

  filteredProjects: Project[] = [];

  ngOnInit() { this.applyFilters(); }

  applyFilters() {
    this.filteredProjects = this.allProjects.filter(p => 
      p.name.toLowerCase().includes(this.searchTerm.toLowerCase()) || 
      p.pm.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
    this.currentPage = 1;
  }

  downloadTemplate() {
    const headers = "Project Name,Manager,Type,Status,Priority,Budget,Spent,Progress,DueDate\n";
    const example = "New Audit Project,,IT,Planning,Medium,500000,0,0,2026-12-31";
    const blob = new Blob([headers + example], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'pmo_bulk_import.csv'; a.click();
  }

  handleMassUpload(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e: any) => this.parseCSV(e.target.result);
    reader.readAsText(file);
  }

  private parseCSV(csvText: string) {
    const lines = csvText.split('\n');
    const imports: Project[] = [];
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      const col = lines[i].split(',');
      imports.push({
        id: Date.now() + i,
        name: col[0],
        pm: col[1]?.trim() ? col[1] : 'Unassigned',
        type: col[2],
        status: col[3],
        priority: col[4],
        budget: Number(col[5]),
        spent: Number(col[6]),
        progress: Number(col[7]),
        dueDate: col[8]
      });
    }
    this.allProjects = [...imports, ...this.allProjects];
    this.applyFilters();
    alert(`Audit Complete: ${imports.length} projects added to portfolio.`);
  }

  get pagedProjects() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredProjects.slice(start, start + this.pageSize);
  }

  get totalPages() { return Math.ceil(this.filteredProjects.length / this.pageSize); }
  get pageNumbers() { return Array.from({ length: this.totalPages }, (_, i) => i + 1); }
  goToPage(page: number) { this.currentPage = page; }
  getStatusClass(s: string) { return s === 'Active' ? 'status-active' : 'status-planning'; }
}
