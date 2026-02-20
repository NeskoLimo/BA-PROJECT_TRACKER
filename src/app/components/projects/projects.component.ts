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
  lastModified: string;
}

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="projects-wrapper">
      <div class="page-header">
        <div class="mass-actions">
          <button class="btn-outline" (click)="downloadTemplate()">📥 Download CSV Template</button>
          <label class="btn-outline upload-label">
            📤 Bulk Upload Projects
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
              <input type="text" [(ngModel)]="searchTerm" (ngModelChange)="applyFilters()" placeholder="Filter portfolio...">
            </div>
            <button class="btn-primary">+ Single Entry</button>
          </div>
        </div>
      </div>

      <div class="card table-card shadow-sm">
        <div class="table-responsive">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Project Details</th>
                <th>Manager</th>
                <th>Status</th>
                <th>Budget Health</th>
                <th>Progress</th>
                <th>Last Sync</th>
                <th class="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let p of pagedProjects">
                <td>
                  <div class="project-info">
                    <span class="p-name">{{ p.name }}</span>
                    <span class="p-type">{{ p.type }}</span>
                  </div>
                </td>
                <td>
                  <span [class.unassigned-text]="p.pm === 'Unassigned'">{{ p.pm }}</span>
                </td>
                <td><span class="status-badge" [ngClass]="p.status.toLowerCase()">{{ p.status }}</span></td>
                <td>
                  <div class="budget-cell" [class.over-budget]="p.spent > p.budget">
                    <span class="spent">KES {{ p.spent | number }}</span>
                    <span class="total">of {{ p.budget | number }}</span>
                  </div>
                </td>
                <td>
                  <div class="progress-box">
                    <div class="progress-bar"><div class="progress-fill" [style.width.%]="p.progress"></div></div>
                    <span class="progress-text">{{ p.progress }}%</span>
                  </div>
                </td>
                <td class="sync-date">{{ p.lastModified | date:'shortDate' }}</td>
                <td class="text-right">
                   <button class="btn-icon" (click)="downloadPassport(p)">📄</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="pagination-bar">
          <span class="page-info">Showing {{ (currentPage-1)*pageSize + 1 }} - {{ Math.min(currentPage*pageSize, filteredProjects.length) }} of {{ filteredProjects.length }}</span>
          <div class="page-controls">
            <button [disabled]="currentPage === 1" (click)="currentPage = currentPage - 1">Prev</button>
            <button [disabled]="currentPage === totalPages" (click)="currentPage = currentPage + 1">Next</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .projects-wrapper { padding: 30px; background: #f8fafc; min-height: 100vh; }
    .mass-actions { display: flex; gap: 12px; margin-bottom: 24px; border-bottom: 1px solid #e2e8f0; padding-bottom: 16px; }
    .btn-outline { background: white; border: 1px solid #cbd5e1; padding: 8px 16px; border-radius: 6px; font-size: 12px; cursor: pointer; }
    .header-main { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 24px; }
    .page-title { font-family: 'Georgia', serif; font-size: 28px; font-weight: 700; color: #0f172a; margin: 0; }
    .search-container input { padding: 10px 12px; border-radius: 8px; border: 1px solid #e2e8f0; width: 250px; }
    .btn-primary { background: #0f172a; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; }
    
    /* Layout Fixes for image_e1d71c.png */
    .custom-table { width: 100%; border-collapse: collapse; }
    .custom-table td { padding: 20px 16px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
    .project-info { display: flex; flex-direction: column; gap: 4px; }
    .p-name { font-weight: 700; color: #0f172a; line-height: 1.2; }
    .p-type { font-size: 11px; color: #64748b; text-transform: uppercase; }
    .unassigned-text { color: #ef4444; font-weight: 700; font-style: italic; }
    .budget-cell { display: flex; flex-direction: column; line-height: 1.2; }
    .budget-cell.over-budget .spent { color: #ef4444; font-weight: 700; }
    .progress-bar { width: 80px; height: 8px; background: #f1f5f9; border-radius: 10px; overflow: hidden; }
    .progress-fill { height: 100%; background: #0f172a; }
    .sync-date { font-family: monospace; color: #64748b; font-size: 12px; }
    .pagination-bar { padding: 16px; display: flex; justify-content: space-between; align-items: center; }
  `]
})
export class ProjectsComponent implements OnInit {
  Math = Math;
  searchTerm: string = '';
  currentPage: number = 1;
  pageSize: number = 6;
  
  // Explicitly declared to fix TS2339
  allProjects: Project[] = [
    { id: 1, name: 'ERP System Migration', pm: 'Alice M.', type: 'Infrastructure', status: 'Active', priority: 'Critical', budget: 850000, spent: 612000, progress: 72, dueDate: '2026-02-25', lastModified: '2026-02-20' },
    { id: 2, name: 'Warehouse Expansion', pm: 'Unassigned', type: 'Operations', status: 'Planning', priority: 'High', budget: 1200000, spent: 0, progress: 0, dueDate: '2026-06-10', lastModified: '2026-01-15' }
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
  }

  get pagedProjects() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredProjects.slice(start, start + this.pageSize);
  }

  get totalPages() {
    return Math.ceil(this.filteredProjects.length / this.pageSize) || 1;
  }

  downloadTemplate() {
    const headers = "Name,PM,Type,Status,Priority,Budget,Spent,Progress,DueDate\n";
    const blob = new Blob([headers], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'template.csv'; a.click();
  }

  handleMassUpload(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const lines = (e.target.result as string).split('\n');
      const imports: Project[] = lines.slice(1).filter(l => l.trim()).map((l, i) => {
        const col = l.split(',');
        return {
          id: Date.now() + i,
          name: col[0],
          pm: col[1] || 'Unassigned',
          type: col[2],
          status: col[3],
          priority: col[4],
          budget: Number(col[5]) || 0,
          spent: Number(col[6]) || 0,
          progress: Number(col[7]) || 0,
          dueDate: col[8],
          lastModified: new Date().toISOString()
        };
      });
      this.allProjects = [...imports, ...this.allProjects];
      this.applyFilters();
    };
    reader.readAsText(file);
  }

  downloadPassport(project: Project) {
    const data = JSON.stringify(project, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${project.name}_Audit.json`; a.click();
  }
}
