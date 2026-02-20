// src/app/components/projects/projects.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

interface Mention {
  user: string;
  message: string;
  timestamp: Date;
}

interface Project {
  id: number;
  name: string;
  type: string;
  pm: string;
  status: string;
  priority: string;
  budget: number;
  spent: number;
  progress: number;
  startDate: string;
  endDate: string;
  signOffs: string[];
  documents: string[];
  mentions: Mention[];
}

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="projects-page">

      <div class="page-header">
        <div>
          <h1 class="page-title">Projects</h1>
          <p class="page-subtitle">{{ filteredProjects.length }} of {{ projects.length }} projects</p>
        </div>
        <button class="btn-primary" (click)="openAddModal()">+ Add Project</button>
      </div>

      <div class="toolbar">
        <input class="search-input" type="text" placeholder="🔍 Search projects..."
          [(ngModel)]="searchTerm" (ngModelChange)="applyFilters()" />
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
      </div>

      <div class="table-wrapper">
        <table class="projects-table">
          <thead>
            <tr>
              <th (click)="sort('name')" class="sortable">Project Name <span>{{ getSortIcon('name') }}</span></th>
              <th (click)="sort('pm')" class="sortable">PM <span>{{ getSortIcon('pm') }}</span></th>
              <th (click)="sort('status')" class="sortable">Status <span>{{ getSortIcon('status') }}</span></th>
              <th (click)="sort('priority')" class="sortable">Priority <span>{{ getSortIcon('priority') }}</span></th>
              <th (click)="sort('budget')" class="sortable">Budget (KES) <span>{{ getSortIcon('budget') }}</span></th>
              <th (click)="sort('spent')" class="sortable">Spent (KES) <span>{{ getSortIcon('spent') }}</span></th>
              <th>Variance</th>
              <th (click)="sort('progress')" class="sortable">Progress <span>{{ getSortIcon('progress') }}</span></th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of filteredProjects" [class.selected]="selectedProject?.id === p.id" (click)="selectedProject = p">
              <td class="project-name">{{ p.name }}</td>
              <td>{{ p.pm }}</td>
              <td><span class="status-badge" [ngClass]="getStatusClass(p.status)">{{ p.status }}</span></td>
              <td><span class="priority-badge" [ngClass]="getPriorityClass(p.priority)">{{ p.priority }}</span></td>
              <td class="num-cell">{{ p.budget | currency:'KES':'symbol-narrow':'1.0-0' }}</td>
              <td class="num-cell" [style.color]="(p.spent || 0) > (p.budget || 0) ? '#e53e3e' : '#2d3748'">
                {{ p.spent | currency:'KES':'symbol-narrow':'1.0-0' }}
              </td>
              <td class="num-cell">
                <span [style.color]="(p.budget - p.spent) < 0 ? '#e53e3e' : '#38a169'">
                  {{ (p.budget - p.spent) | currency:'KES':'symbol-narrow':'1.0-0' }}
                </span>
              </td>
              <td>
                <div class="progress-wrap">
                  <div class="progress-bar">
                    <div class="progress-fill" [style.width.%]="p.progress" [style.background]="getProgressColor(p.progress)"></div>
                  </div>
                  <span class="progress-pct">{{ p.progress }}%</span>
                </div>
              </td>
              <td>
                <div class="action-btns">
                  <button class="edit-btn" title="Edit" (click)="openEditModal(p); $event.stopPropagation()">✏️</button>
                  <button class="delete-btn" title="Delete" (click)="confirmDelete(p); $event.stopPropagation()">🗑️</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="modal-overlay" *ngIf="showModal" (click)="showModal = false">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{ isEditing ? 'Edit Project' : 'Add New Project' }}</h2>
            <button class="modal-close" (click)="showModal = false">✕</button>
          </div>
          <div class="modal-body">
            <div class="form-row">
              <div class="form-group">
                <label>Project Name *</label>
                <input type="text" [(ngModel)]="currentProject.name" placeholder="Enter project name" />
              </div>
              <div class="form-group">
                <label>Project Manager *</label>
                <input type="text" [(ngModel)]="currentProject.pm" placeholder="PM name" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Budget (KES)</label>
                <input type="number" [(ngModel)]="currentProject.budget" placeholder="0" />
              </div>
              <div class="form-group">
                <label>Spent (KES)</label>
                <input type="number" [(ngModel)]="currentProject.spent" placeholder="0" />
              </div>
              <div class="form-group">
                <label>Progress (%)</label>
                <input type="number" [(ngModel)]="currentProject.progress" min="0" max="100" placeholder="0" />
              </div>
            </div>

            <div class="budget-indicator" *ngIf="(currentProject.budget || 0) > 0">
              <div class="budget-bar-track">
                <div class="budget-bar-fill"
                  [style.width.%]="Math.min(((currentProject.spent || 0) / (currentProject.budget || 1)) * 100, 100)"
                  [style.background]="(currentProject.spent || 0) > (currentProject.budget || 0) ? '#e53e3e' : '#38a169'">
                </div>
              </div>
              <span class="budget-bar-label"
                [style.color]="(currentProject.spent || 0) > (currentProject.budget || 0) ? '#e53e3e' : '#38a169'">
                {{ (((currentProject.spent || 0) / (currentProject.budget || 1)) * 100).toFixed(0) }}% of budget used
              </span>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" (click)="showModal = false">Cancel</button>
            <button class="btn-primary" (click)="saveProject()">
              {{ isEditing ? 'Save Changes' : 'Add Project' }}
            </button>
          </div>
        </div>
      </div>

      <div class="modal-overlay" *ngIf="showDeleteModal" (click)="showDeleteModal = false">
        <div class="modal modal-sm" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2 style="color: #e53e3e">⚠️ Delete Project</h2>
          </div>
          <div class="modal-body">
            <p>Are you sure you want to delete <strong>{{ projectToDelete?.name }}</strong>? This action cannot be undone.</p>
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" (click)="showDeleteModal = false">Cancel</button>
            <button class="btn-danger" (click)="deleteProject()">Delete Forever</button>
          </div>
        </div>
      </div>

      <div class="toast" *ngIf="toastVisible">{{ toastMessage }}</div>

    </div>
  `,
  styles: [`
    .projects-page { display: flex; flex-direction: column; gap: 20px; font-family: sans-serif; color: #1a2332; padding: 20px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; }
    .page-title { font-size: 26px; font-weight: 700; font-family: 'Georgia', serif; margin: 0; }
    .btn-primary { background: #1a2332; color: white; border: none; padding: 10px 18px; border-radius: 8px; font-weight: 600; cursor: pointer; }
    .btn-danger { background: #e53e3e; color: white; border: none; padding: 10px 18px; border-radius: 8px; font-weight: 600; cursor: pointer; }
    .toolbar { display: flex; gap: 12px; align-items: center; }
    .search-input { flex: 1; padding: 10px; border: 1px solid #e8ecf0; border-radius: 8px; }
    .table-wrapper { background: #fff; border: 1px solid #e8ecf0; border-radius: 10px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    .projects-table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .projects-table th { background: #f7f9fc; padding: 12px; text-align: left; color: #718096; font-size: 11px; text-transform: uppercase; border-bottom: 1px solid #e8ecf0; cursor: pointer; }
    .projects-table td { padding: 12px; border-bottom: 1px solid #f7f9fc; }
    .num-cell { font-weight: 600; }
    .action-btns { display: flex; gap: 5px; }
    .edit-btn, .delete-btn { border: 1px solid #e8ecf0; background: #fff; padding: 5px; border-radius: 4px; cursor: pointer; }
    .delete-btn:hover { background: #fff5f5; border-color: #feb2b2; }
    .status-badge { padding: 4px 10px; border-radius: 99px; font-size: 11px; font-weight: 700; }
    .status-active { background: #e8fdf0; color: #38a169; }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal { background: #fff; border-radius: 12px; width: 600px; max-width: 90vw; }
    .modal-sm { width: 400px; }
    .modal-header { padding: 20px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; }
    .modal-body { padding: 20px; display: flex; flex-direction: column; gap: 15px; }
    .form-row { display: flex; gap: 15px; }
    .form-group { flex: 1; display: flex; flex-direction: column; gap: 5px; }
    .form-group label { font-size: 11px; font-weight: 700; color: #718096; }
    .form-group input { padding: 10px; border: 1px solid #e8ecf0; border-radius: 6px; }
    .budget-indicator { background: #f7f9fc; padding: 12px; border-radius: 8px; }
    .budget-bar-track { height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden; margin-bottom: 5px; }
    .budget-bar-fill { height: 100%; transition: width 0.3s; }
    .toast { position: fixed; bottom: 20px; right: 20px; background: #1a2332; color: #fff; padding: 12px 24px; border-radius: 8px; z-index: 2000; }
  `]
})
export class ProjectsComponent {
  Math = Math;
  searchTerm = '';
  statusFilter = '';
  priorityFilter = '';
  showModal = false;
  showDeleteModal = false;
  isEditing = false;
  toastVisible = false;
  toastMessage = '';

  currentProject: Project = this.emptyProject();
  projectToDelete: Project | null = null;
  selectedProject: Project | null = null;

  projects: Project[] = [
    { id: 1, name: 'ERP System Migration', type: 'IT', pm: 'Alice M.', status: 'Active', priority: 'Critical', budget: 850000, spent: 612000, progress: 72, startDate: '2026-01-10', endDate: '2026-02-25', signOffs: [], documents: [], mentions: [] },
    { id: 2, name: 'Customer Portal Redesign', type: 'BA', pm: 'James K.', status: 'Active', priority: 'High', budget: 320000, spent: 144000, progress: 45, startDate: '2025-12-01', endDate: '2026-03-10', signOffs: [], documents: [], mentions: [] }
  ];

  filteredProjects: Project[] = [...this.projects];

  emptyProject(): Project {
    return { id: 0, name: '', type: 'BA', pm: '', status: 'Planning', priority: 'Medium', budget: 0, spent: 0, progress: 0, startDate: '', endDate: '', signOffs: [], documents: [], mentions: [] };
  }

  confirmDelete(project: Project) {
    this.projectToDelete = project;
    this.showDeleteModal = true;
  }

  deleteProject() {
    if (!this.projectToDelete) return;
    this.projects = this.projects.filter(p => p.id !== this.projectToDelete?.id);
    this.applyFilters();
    this.showDeleteModal = false;
    this.showToast('🗑️ Project removed');
  }

  openAddModal() {
    this.isEditing = false;
    this.currentProject = this.emptyProject();
    this.showModal = true;
  }

  openEditModal(project: Project) {
    this.isEditing = true;
    this.currentProject = { ...project };
    this.showModal = true;
  }

  saveProject() {
    if (!this.currentProject.name || !this.currentProject.pm) {
      this.showToast('⚠️ Name and PM are required');
      return;
    }
    if (this.isEditing) {
      const idx = this.projects.findIndex(p => p.id === this.currentProject.id);
      if (idx > -1) this.projects[idx] = { ...this.currentProject };
      this.showToast('✅ Project updated');
    } else {
      this.currentProject.id = Date.now();
      this.projects.unshift({ ...this.currentProject });
      this.showToast('✅ Project added');
    }
    this.applyFilters();
    this.showModal = false;
  }

  applyFilters() {
    this.filteredProjects = this.projects.filter(p => 
      p.name.toLowerCase().includes(this.searchTerm.toLowerCase()) &&
      (this.statusFilter === '' || p.status === this.statusFilter) &&
      (this.priorityFilter === '' || p.priority === this.priorityFilter)
    );
  }

  sort(column: string) { /* Sorting logic as before */ }
  getSortIcon(column: string) { return '↕'; }
  getStatusClass(status: string) { return status === 'Active' ? 'status-active' : ''; }
  getPriorityClass(priority: string) { return 'priority-badge'; }
  getProgressColor(progress: number) { return progress >= 70 ? '#38a169' : '#3182ce'; }

  showToast(message: string) {
    this.toastMessage = message;
    this.toastVisible = true;
    setTimeout(() => this.toastVisible = false, 3000);
  }
}
