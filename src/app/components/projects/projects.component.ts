// src/app/components/projects/projects.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Project {
  id: number;
  name: string;
  type: string;
  pm: string;
  status: string;
  priority: string;
  budget: number;
  progress: number;
  startDate: string;
  endDate: string;
  signOffs: string[];
  documents: string[];
}

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="projects-page">

      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Projects</h1>
          <p class="page-subtitle">{{ filteredProjects.length }} of {{ projects.length }} projects</p>
        </div>
        <button class="btn-primary" (click)="showAddModal = true">+ Add Project</button>
      </div>

      <!-- Toolbar -->
      <div class="toolbar">
        <input
          class="search-input"
          type="text"
          placeholder="🔍  Search projects..."
          [(ngModel)]="searchTerm"
          (ngModelChange)="applyFilters()"
        />
        <select class="filter-select" [(ngModel)]="statusFilter" (ngModelChange)="applyFilters()">
          <option value="">All Statuses</option>
          <option value="Active">Active</option>
          <option value="On Hold">On Hold</option>
          <option value="At Risk">At Risk</option>
          <option value="Completed">Completed</option>
          <option value="Planning">Planning</option>
        </select>
        <select class="filter-select" [(ngModel)]="priorityFilter" (ngModelChange)="applyFilters()">
          <option value="">All Priorities</option>
          <option value="Critical">Critical</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
        <label class="upload-btn">
          📎 Upload Document
          <input type="file" hidden (change)="onFileUpload($event)" />
        </label>
      </div>

      <!-- Table -->
      <div class="table-wrapper">
        <table class="projects-table">
          <thead>
            <tr>
              <th (click)="sort('name')" class="sortable">
                Project Name <span class="sort-icon">{{ getSortIcon('name') }}</span>
              </th>
              <th (click)="sort('pm')" class="sortable">
                PM <span class="sort-icon">{{ getSortIcon('pm') }}</span>
              </th>
              <th (click)="sort('status')" class="sortable">
                Status <span class="sort-icon">{{ getSortIcon('status') }}</span>
              </th>
              <th (click)="sort('priority')" class="sortable">
                Priority <span class="sort-icon">{{ getSortIcon('priority') }}</span>
              </th>
              <th (click)="sort('budget')" class="sortable">
                Budget <span class="sort-icon">{{ getSortIcon('budget') }}</span>
              </th>
              <th (click)="sort('progress')" class="sortable">
                Progress <span class="sort-icon">{{ getSortIcon('progress') }}</span>
              </th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Sign-offs</th>
              <th>Docs</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of filteredProjects" (click)="selectProject(p)" [class.selected]="selectedProject?.id === p.id">
              <td class="project-name">{{ p.name }}</td>
              <td>{{ p.pm }}</td>
              <td>
                <span class="status-badge" [ngClass]="getStatusClass(p.status)">{{ p.status }}</span>
              </td>
              <td>
                <span class="priority-badge" [ngClass]="getPriorityClass(p.priority)">{{ p.priority }}</span>
              </td>
              <td class="budget">{{ p.budget | currency:'KES.':'symbol':'1.0-0' }}</td>
              <td>
                <div class="progress-wrap">
                  <div class="progress-bar">
                    <div class="progress-fill" [style.width.%]="p.progress" [style.background]="getProgressColor(p.progress)"></div>
                  </div>
                  <span class="progress-pct">{{ p.progress }}%</span>
                </div>
              </td>
              <td class="date">{{ p.startDate }}</td>
              <td class="date">{{ p.endDate }}</td>
              <td>
                <div class="signoffs">
                  <span class="signoff-chip approved" *ngFor="let s of p.signOffs">{{ s }}</span>
                  <span class="signoff-empty" *ngIf="p.signOffs.length === 0">—</span>
                </div>
              </td>
              <td>
                <span class="doc-count" *ngIf="p.documents.length > 0">📄 {{ p.documents.length }}</span>
                <span class="signoff-empty" *ngIf="p.documents.length === 0">—</span>
              </td>
            </tr>
            <tr *ngIf="filteredProjects.length === 0">
              <td colspan="10" class="empty-state">No projects found matching your filters.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Add Project Modal -->
      <div class="modal-overlay" *ngIf="showAddModal" (click)="showAddModal = false">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Add New Project</h2>
            <button class="modal-close" (click)="showAddModal = false">✕</button>
          </div>
          <div class="modal-body">
            <div class="form-row">
              <div class="form-group">
                <label>Project Name *</label>
                <input type="text" [(ngModel)]="newProject.name" placeholder="Enter project name" />
              </div>
              <div class="form-group">
                <label>Project Manager *</label>
                <input type="text" [(ngModel)]="newProject.pm" placeholder="PM name" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Type</label>
                <select [(ngModel)]="newProject.type">
                  <option value="BA">BA</option>
                  <option value="IT">IT</option>
                  <option value="Mixed">Mixed</option>
                </select>
              </div>
              <div class="form-group">
                <label>Status</label>
                <select [(ngModel)]="newProject.status">
                  <option value="Planning">Planning</option>
                  <option value="Active">Active</option>
                  <option value="On Hold">On Hold</option>
                  <option value="At Risk">At Risk</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div class="form-group">
                <label>Priority</label>
                <select [(ngModel)]="newProject.priority">
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Budget (KES)</label>
                <input type="number" [(ngModel)]="newProject.budget" placeholder="0" />
              </div>
              <div class="form-group">
                <label>Progress (%)</label>
                <input type="number" [(ngModel)]="newProject.progress" min="0" max="100" placeholder="0" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Start Date</label>
                <input type="date" [(ngModel)]="newProject.startDate" />
              </div>
              <div class="form-group">
                <label>End Date</label>
                <input type="date" [(ngModel)]="newProject.endDate" />
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" (click)="showAddModal = false">Cancel</button>
            <button class="btn-primary" (click)="addProject()">Add Project</button>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .projects-page {
      display: flex;
      flex-direction: column;
      gap: 20px;
      font-family: sans-serif;
      color: #1a2332;
    }

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
    .page-subtitle {
      font-size: 13px;
      color: #718096;
      margin: 0;
    }

    /* Buttons */
    .btn-primary {
      background: #1a2332;
      color: white;
      border: none;
      padding: 10px 18px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.15s;
    }
    .btn-primary:hover { background: #2d3748; }
    .btn-secondary {
      background: #f7f9fc;
      color: #1a2332;
      border: 1px solid #e8ecf0;
      padding: 10px 18px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
    }

    /* Toolbar */
    .toolbar {
      display: flex;
      gap: 12px;
      align-items: center;
      flex-wrap: wrap;
    }
    .search-input {
      flex: 1;
      min-width: 200px;
      padding: 9px 14px;
      border: 1px solid #e8ecf0;
      border-radius: 8px;
      font-size: 13px;
      color: #1a2332;
      outline: none;
      background: #fff;
    }
    .search-input:focus { border-color: #1a2332; }
    .filter-select {
      padding: 9px 14px;
      border: 1px solid #e8ecf0;
      border-radius: 8px;
      font-size: 13px;
      color: #1a2332;
      background: #fff;
      cursor: pointer;
      outline: none;
    }
    .upload-btn {
      padding: 9px 16px;
      border: 1px solid #e8ecf0;
      border-radius: 8px;
      font-size: 13px;
      color: #4a5568;
      background: #f7f9fc;
      cursor: pointer;
      font-weight: 600;
      white-space: nowrap;
    }
    .upload-btn:hover { background: #edf2f7; }

    /* Table */
    .table-wrapper {
      background: #fff;
      border: 1px solid #e8ecf0;
      border-radius: 10px;
      overflow-x: auto;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }
    .projects-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }
    .projects-table th {
      text-align: left;
      padding: 12px 14px;
      font-size: 11px;
      font-weight: 700;
      color: #a0aec0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 1px solid #e8ecf0;
      white-space: nowrap;
      background: #f7f9fc;
    }
    .projects-table th.sortable {
      cursor: pointer;
      user-select: none;
    }
    .projects-table th.sortable:hover { color: #1a2332; }
    .sort-icon { font-style: normal; margin-left: 4px; }
    .projects-table td {
      padding: 12px 14px;
      border-bottom: 1px solid #f7f9fc;
      color: #2d3748;
      vertical-align: middle;
    }
    .projects-table tr:last-child td { border-bottom: none; }
    .projects-table tbody tr { cursor: pointer; transition: background 0.1s; }
    .projects-table tbody tr:hover td { background: #f7f9fc; }
    .projects-table tbody tr.selected td { background: #edf2f7; }
    .project-name { font-weight: 600; color: #1a2332 !important; white-space: nowrap; }
    .date { color: #718096; white-space: nowrap; }
    .budget { font-weight: 600; white-space: nowrap; }

    /* Badges */
    .status-badge {
      padding: 3px 10px;
      border-radius: 99px;
      font-size: 11px;
      font-weight: 700;
      white-space: nowrap;
    }
    .status-active { background: #e8fdf0; color: #38a169; }
    .status-on-hold { background: #fdf8e8; color: #d69e2e; }
    .status-at-risk { background: #fde8e8; color: #e53e3e; }
    .status-completed { background: #e8f4fd; color: #3182ce; }
    .status-planning { background: #f3e8fd; color: #805ad5; }

    .priority-badge {
      padding: 3px 10px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 700;
      white-space: nowrap;
    }
    .priority-critical { background: #fde8e8; color: #e53e3e; }
    .priority-high { background: #fdf0e8; color: #dd6b20; }
    .priority-medium { background: #fdf8e8; color: #d69e2e; }
    .priority-low { background: #e8fdf0; color: #38a169; }

    /* Progress */
    .progress-wrap {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .progress-bar {
      width: 70px;
      height: 6px;
      background: #f0f4f8;
      border-radius: 99px;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      border-radius: 99px;
      transition: width 0.3s;
    }
    .progress-pct {
      font-size: 12px;
      color: #718096;
      width: 30px;
    }

    /* Sign-offs */
    .signoffs { display: flex; gap: 4px; flex-wrap: wrap; }
    .signoff-chip {
      padding: 2px 7px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 700;
      background: #e8fdf0;
      color: #38a169;
    }
    .signoff-empty { color: #cbd5e0; font-size: 13px; }
    .doc-count { font-size: 12px; color: #4a5568; }
    .empty-state {
      text-align: center;
      color: #a0aec0;
      padding: 40px !important;
      font-size: 14px;
    }

    /* Modal */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.35);
      z-index: 200;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .modal {
      background: #fff;
      border-radius: 12px;
      width: 580px;
      max-width: 95vw;
      box-shadow: 0 20px 60px rgba(0,0,0,0.15);
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      border-bottom: 1px solid #e8ecf0;
    }
    .modal-header h2 {
      margin: 0;
      font-size: 17px;
      font-family: 'Georgia', serif;
      color: #1a2332;
    }
    .modal-close {
      background: none;
      border: none;
      font-size: 16px;
      cursor: pointer;
      color: #a0aec0;
      padding: 4px;
    }
    .modal-body {
      padding: 20px 24px;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .form-row {
      display: flex;
      gap: 14px;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 5px;
      flex: 1;
    }
    .form-group label {
      font-size: 12px;
      font-weight: 700;
      color: #718096;
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }
    .form-group input, .form-group select {
      padding: 9px 12px;
      border: 1px solid #e8ecf0;
      border-radius: 7px;
      font-size: 13px;
      color: #1a2332;
      outline: none;
      background: #fff;
      width: 100%;
      box-sizing: border-box;
    }
    .form-group input:focus, .form-group select:focus { border-color: #1a2332; }
    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      padding: 16px 24px;
      border-top: 1px solid #e8ecf0;
    }
  `]
})
export class ProjectsComponent {
  searchTerm = '';
  statusFilter = '';
  priorityFilter = '';
  showAddModal = false;
  selectedProject: Project | null = null;
  sortColumn = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  newProject: Partial<Project> = {
    name: '', pm: '', type: 'BA', status: 'Planning',
    priority: 'Medium', budget: 0, progress: 0,
    startDate: '', endDate: '', signOffs: [], documents: []
  };

  projects: Project[] = [
    { id: 1, name: 'ERP System Migration', type: 'IT', pm: 'Alice M.', status: 'Active', priority: 'Critical', budget: 850000, progress: 72, startDate: 'Jan 10, 2026', endDate: 'Feb 25, 2026', signOffs: ['PMO', 'IT'], documents: ['scope.pdf', 'plan.docx'] },
    { id: 2, name: 'Customer Portal Redesign', type: 'BA', pm: 'James K.', status: 'Active', priority: 'High', budget: 320000, progress: 45, startDate: 'Dec 1, 2025', endDate: 'Mar 10, 2026', signOffs: ['BA'], documents: ['requirements.docx'] },
    { id: 3, name: 'HR Self-Service Portal', type: 'Mixed', pm: 'Sarah T.', status: 'On Hold', priority: 'Medium', budget: 210000, progress: 30, startDate: 'Nov 15, 2025', endDate: 'Mar 8, 2026', signOffs: [], documents: [] },
    { id: 4, name: 'Supply Chain Analytics', type: 'BA', pm: 'David O.', status: 'At Risk', priority: 'High', budget: 450000, progress: 58, startDate: 'Oct 5, 2025', endDate: 'Feb 28, 2026', signOffs: ['PMO'], documents: ['analysis.xlsx'] },
    { id: 5, name: 'Mobile App v2 Launch', type: 'IT', pm: 'Linda N.', status: 'Active', priority: 'High', budget: 380000, progress: 89, startDate: 'Sep 20, 2025', endDate: 'Mar 20, 2026', signOffs: ['IT', 'PMO', 'BA'], documents: ['spec.pdf'] },
    { id: 6, name: 'Compliance Audit System', type: 'Mixed', pm: 'Alice M.', status: 'Completed', priority: 'Critical', budget: 275000, progress: 100, startDate: 'Aug 1, 2025', endDate: 'Feb 10, 2026', signOffs: ['PMO', 'IT', 'BA'], documents: ['audit.pdf', 'report.docx'] },
    { id: 7, name: 'Data Warehouse Upgrade', type: 'IT', pm: 'James K.', status: 'Planning', priority: 'Medium', budget: 600000, progress: 10, startDate: 'Feb 15, 2026', endDate: 'Jun 30, 2026', signOffs: [], documents: [] },
    { id: 8, name: 'Finance Reporting Tool', type: 'BA', pm: 'Sarah T.', status: 'Active', priority: 'Low', budget: 95000, progress: 62, startDate: 'Jan 5, 2026', endDate: 'Apr 15, 2026', signOffs: ['BA'], documents: ['brief.docx'] },
  ];

  filteredProjects: Project[] = [...this.projects];

  applyFilters() {
    let result = [...this.projects];
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.pm.toLowerCase().includes(term) ||
        p.type.toLowerCase().includes(term)
      );
    }
    if (this.statusFilter) result = result.filter(p => p.status === this.statusFilter);
    if (this.priorityFilter) result = result.filter(p => p.priority === this.priorityFilter);
    if (this.sortColumn) result = this.applySorting(result);
    this.filteredProjects = result;
  }

  sort(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.applyFilters();
  }

  applySorting(data: Project[]): Project[] {
    return [...data].sort((a, b) => {
      const aVal = (a as any)[this.sortColumn];
      const bVal = (b as any)[this.sortColumn];
      if (typeof aVal === 'number') return this.sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      return this.sortDirection === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }

  getSortIcon(column: string): string {
    if (this.sortColumn !== column) return '↕';
    return this.sortDirection === 'asc' ? '↑' : '↓';
  }

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

  selectProject(project: Project) {
    this.selectedProject = this.selectedProject?.id === project.id ? null : project;
  }

  addProject() {
    if (!this.newProject.name || !this.newProject.pm) return;
    const project: Project = {
      id: this.projects.length + 1,
      name: this.newProject.name!,
      type: this.newProject.type || 'BA',
      pm: this.newProject.pm!,
      status: this.newProject.status || 'Planning',
      priority: this.newProject.priority || 'Medium',
      budget: this.newProject.budget || 0,
      progress: this.newProject.progress || 0,
      startDate: this.newProject.startDate || '—',
      endDate: this.newProject.endDate || '—',
      signOffs: [],
      documents: []
    };
    this.projects.unshift(project);
    this.applyFilters();
    this.showAddModal = false;
    this.newProject = { name: '', pm: '', type: 'BA', status: 'Planning', priority: 'Medium', budget: 0, progress: 0, startDate: '', endDate: '', signOffs: [], documents: [] };
  }

  onFileUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0 && this.selectedProject) {
      this.selectedProject.documents.push(input.files[0].name);
      alert(`"${input.files[0].name}" uploaded to ${this.selectedProject.name}`);
    } else if (!this.selectedProject) {
      alert('Please click a project row first to select it, then upload a document.');
    }
  }
}
