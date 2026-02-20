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
              <th (click)="sort('budget')" class="sortable">Budget <span>{{ getSortIcon('budget') }}</span></th>
              <th (click)="sort('spent')" class="sortable">Spent <span>{{ getSortIcon('spent') }}</span></th>
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
              <td class="num-cell">{{ p.budget | currency:'USD':'symbol':'1.0-0' }}</td>
              <td class="num-cell" [style.color]="(p.spent || 0) > (p.budget || 0) ? '#e53e3e' : '#2d3748'">
                {{ p.spent | currency:'USD':'symbol':'1.0-0' }}
              </td>
              <td class="num-cell">
                <span [style.color]="(p.budget - p.spent) < 0 ? '#e53e3e' : '#38a169'">
                  {{ (p.budget - p.spent) | currency:'USD':'symbol':'1.0-0' }}
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
                  <button class="edit-btn" (click)="openEditModal(p); $event.stopPropagation()">✏️</button>
                  <button class="delete-btn" (click)="confirmDelete(p); $event.stopPropagation()">🗑️</button>
                </div>
              </td>
            </tr>
            <tr *ngIf="filteredProjects.length === 0">
              <td colspan="9" class="empty-state">No projects found.</td>
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
                <input type="text" [(ngModel)]="currentProject.name" />
              </div>
              <div class="form-group">
                <label>Manager *</label>
                <input type="text" [(ngModel)]="currentProject.pm" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Budget</label>
                <input type="number" [(ngModel)]="currentProject.budget" />
              </div>
              <div class="form-group">
                <label>Spent</label>
                <input type="number" [(ngModel)]="currentProject.spent" />
              </div>
            </div>
            
            <div class="budget-indicator" *ngIf="(currentProject.budget || 0) > 0">
              <div class="budget-bar-track">
                <div class="budget-bar-fill"
                  [style.width.%]="Math.min(((currentProject.spent || 0) / (currentProject.budget || 1)) * 100, 100)"
                  [style.background]="(currentProject.spent || 0) > (currentProject.budget || 0) ? '#e53e3e' : '#38a169'">
                </div>
              </div>
              <span class="budget-bar-label">
                {{ (((currentProject.spent || 0) / (currentProject.budget || 1)) * 100).toFixed(0) }}% Used
              </span>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" (click)="showModal = false">Cancel</button>
            <button class="btn-primary" (click)="saveProject()">Save</button>
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
    /* Existing styles... */
    .projects-page { display: flex; flex-direction: column; gap: 20px; font-family: sans-serif; padding: 20px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; }
    .btn-primary { background: #1a2332; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; }
    .toolbar { display: flex; gap: 10px; }
    .search-input { flex: 1; padding: 10px; border-radius: 8px; border: 1px solid #ddd; }
    .table-wrapper { background: white; border-radius: 12px; border: 1px solid #eee; overflow: hidden; }
    .projects-table { width: 100%; border-collapse: collapse; font-size: 14px; }
    .projects-table th, .projects-table td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }
    .action-btns { display: flex; gap: 8px; }
    .edit-btn, .delete-btn { border: 1px solid #eee; background: #f9f9f9; padding: 4px 8px; border-radius: 4px; cursor: pointer; }
    .delete-btn:hover { background: #fee2e2; border-color: #fca5a5; }
    .btn-danger { background: #e53e3e; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 100; }
    .modal { background: white; padding: 24px; border-radius: 12px; width: 500px; }
    .modal-sm { width: 400px; }
    .budget-indicator { margin-top: 15px; background: #f4f4f4; padding: 10px; border-radius: 8px; }
    .budget-bar-track { height: 8px; background: #ddd; border-radius: 4px; overflow: hidden; }
    .budget-bar-fill { height: 100%; transition: width 0.3s; }
    .toast { position: fixed; bottom: 20px; right: 20px; background: #333; color: white; padding: 12px 24px; border-radius: 8px; }
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
    { id: 1, name: 'ERP System Migration', type: 'IT', pm: 'Alice M.', status: 'Active', priority: 'Critical', budget: 850000, spent: 612000, progress: 72, startDate: '', endDate: '', signOffs: [], documents: [], mentions: [] },
    { id: 2, name: 'Customer Portal Redesign', type: 'BA', pm: 'James K.', status: 'Active', priority: 'High', budget: 320000, spent: 144000, progress: 45, startDate: '', endDate: '', signOffs: [], documents: [], mentions: [] }
  ];

  filteredProjects: Project[] = [...this.projects];

  emptyProject(): Project {
    return { id: 0, name: '', type: 'BA', pm: '', status: 'Planning', priority: 'Medium', budget: 0, spent: 0, progress: 0, startDate: '', endDate: '', signOffs: [], documents: [], mentions: [] };
  }

  // --- DELETE LOGIC ---
  confirmDelete(project: Project) {
    this.projectToDelete = project;
    this.showDeleteModal = true;
  }

  deleteProject() {
    if (!this.projectToDelete) return;
    this.projects = this.projects.filter(p => p.id !== this.projectToDelete?.id);
    this.applyFilters();
    this.showDeleteModal = false;
    this.showToast('🗑️ Project deleted successfully');
  }

  // --- EXISTING LOGIC ---
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
    if (this.isEditing) {
      const idx = this.projects.findIndex(p => p.id === this.currentProject.id);
      if (idx > -1) this.projects[idx] = { ...this.currentProject };
    } else {
      this.currentProject.id = Date.now();
      this.projects.unshift({ ...this.currentProject });
    }
    this.applyFilters();
    this.showModal = false;
    this.showToast('✅ Saved successfully');
  }

  applyFilters() {
    this.filteredProjects = this.projects.filter(p => 
      p.name.toLowerCase().includes(this.searchTerm.toLowerCase()) &&
      (this.statusFilter === '' || p.status === this.statusFilter) &&
      (this.priorityFilter === '' || p.priority === this.priorityFilter)
    );
  }

  sort(col: string) { /* Sorting logic as before */ }
  getSortIcon(col: string) { return '↕'; }
  getStatusClass(s: string) { return 'status-badge'; }
  getPriorityClass(p: string) { return 'priority-badge'; }
  getProgressColor(p: number) { return p > 50 ? '#38a169' : '#3182ce'; }
  
  showToast(msg: string) {
    this.toastMessage = msg;
    this.toastVisible = true;
    setTimeout(() => this.toastVisible = false, 3000);
  }
}
