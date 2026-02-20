// src/app/components/projects/projects.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
  imports: [CommonModule, FormsModule],
  template: `
    <div class="projects-page">

      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Projects</h1>
          <p class="page-subtitle">{{ filteredProjects.length }} of {{ projects.length }} projects</p>
        </div>
        <button class="btn-primary" (click)="openAddModal()">+ Add Project</button>
      </div>

      <!-- Toolbar -->
      <div class="toolbar">
        <input class="search-input" type="text" placeholder="🔍  Search projects..."
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
              <th (click)="sort('name')" class="sortable">Project Name <span>{{ getSortIcon('name') }}</span></th>
              <th (click)="sort('pm')" class="sortable">PM <span>{{ getSortIcon('pm') }}</span></th>
              <th (click)="sort('status')" class="sortable">Status <span>{{ getSortIcon('status') }}</span></th>
              <th (click)="sort('priority')" class="sortable">Priority <span>{{ getSortIcon('priority') }}</span></th>
              <th (click)="sort('budget')" class="sortable">Budget <span>{{ getSortIcon('budget') }}</span></th>
              <th (click)="sort('spent')" class="sortable">Spent <span>{{ getSortIcon('spent') }}</span></th>
              <th>Variance</th>
              <th (click)="sort('progress')" class="sortable">Progress <span>{{ getSortIcon('progress') }}</span></th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Sign-offs</th>
              <th>Docs</th>
              <th>Mentions</th>
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
              <td class="num-cell" [style.color]="p.spent > p.budget ? '#e53e3e' : '#2d3748'">
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
              <td class="date">{{ p.startDate }}</td>
              <td class="date">{{ p.endDate }}</td>
              <td>
                <div class="signoffs">
                  <span class="signoff-chip" *ngFor="let s of p.signOffs">{{ s }}</span>
                  <span class="empty-val" *ngIf="p.signOffs.length === 0">—</span>
                </div>
              </td>
              <td>
                <span class="doc-count" *ngIf="p.documents.length > 0">📄 {{ p.documents.length }}</span>
                <span class="empty-val" *ngIf="p.documents.length === 0">—</span>
              </td>
              <td>
                <span class="mention-count" *ngIf="p.mentions.length > 0" (click)="openMentions(p); $event.stopPropagation()">
                  💬 {{ p.mentions.length }}
                </span>
                <span class="empty-val" *ngIf="p.mentions.length === 0">—</span>
              </td>
              <td>
                <button class="edit-btn" (click)="openEditModal(p); $event.stopPropagation()">✏️ Edit</button>
              </td>
            </tr>
            <tr *ngIf="filteredProjects.length === 0">
              <td colspan="14" class="empty-state">No projects found matching your filters.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Add/Edit Project Modal -->
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
                <label>Type</label>
                <select [(ngModel)]="currentProject.type">
                  <option value="BA">BA</option>
                  <option value="IT">IT</option>
                  <option value="Mixed">Mixed</option>
                </select>
              </div>
              <div class="form-group">
                <label>Status</label>
                <select [(ngModel)]="currentProject.status">
                  <option value="Planning">Planning</option>
                  <option value="Active">Active</option>
                  <option value="On Hold">On Hold</option>
                  <option value="At Risk">At Risk</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div class="form-group">
                <label>Priority</label>
                <select [(ngModel)]="currentProject.priority">
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Budget (USD)</label>
                <input type="number" [(ngModel)]="currentProject.budget" placeholder="0" />
              </div>
              <div class="form-group">
                <label>Spent (USD)</label>
                <input type="number" [(ngModel)]="currentProject.spent" placeholder="0" />
              </div>
              <div class="form-group">
                <label>Progress (%)</label>
                <input type="number" [(ngModel)]="currentProject.progress" min="0" max="100" placeholder="0" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Start Date</label>
                <input type="date" [(ngModel)]="currentProject.startDate" />
              </div>
              <div class="form-group">
                <label>End Date</label>
                <input type="date" [(ngModel)]="currentProject.endDate" />
              </div>
            </div>

            <!-- Budget Indicator -->
            <div class="budget-indicator" *ngIf="currentProject.budget > 0">
              <div class="budget-bar-track">
                <div class="budget-bar-fill"
                  [style.width.%]="Math.min((currentProject.spent / currentProject.budget) * 100, 100)"
                  [style.background]="currentProject.spent > currentProject.budget ? '#e53e3e' : '#38a169'">
                </div>
              </div>
              <span class="budget-bar-label"
                [style.color]="(currentProject.spent || 0) > (currentProject.budget || 1) ? '#e53e3e' : '#38a169'">
                {{ (((currentProject.spent || 0) / (currentProject.budget || 1)) * 100).toFixed(0) }}% of budget used
              </span>
            </div>

            <!-- Mentions Section -->
            <div class="mentions-section">
              <label class="mentions-label">💬 Mention a team member</label>
              <div class="mentions-input-row">
                <input type="text" class="mentions-input" [(ngModel)]="mentionInput"
                  placeholder="@username — add a note or mention..." (keydown.enter)="addMention()" />
                <button class="btn-mention" (click)="addMention()">Post</button>
              </div>
              <div class="mentions-list" *ngIf="isEditing && getProjectMentions().length > 0">
                <div class="mention-item" *ngFor="let m of getProjectMentions()">
                  <div class="mention-avatar">{{ m.user.charAt(0) }}</div>
                  <div class="mention-body">
                    <div class="mention-user">{{ m.user }}</div>
                    <div class="mention-message">{{ m.message }}</div>
                    <div class="mention-time">{{ m.timestamp | date:'MMM d, h:mm a' }}</div>
                  </div>
                </div>
              </div>
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

      <!-- Mentions Modal -->
      <div class="modal-overlay" *ngIf="showMentionsModal" (click)="showMentionsModal = false">
        <div class="modal modal-sm" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>💬 Mentions — {{ mentionsProject?.name }}</h2>
            <button class="modal-close" (click)="showMentionsModal = false">✕</button>
          </div>
          <div class="modal-body">
            <div class="mentions-list">
              <div class="mention-item" *ngFor="let m of mentionsProject?.mentions">
                <div class="mention-avatar">{{ m.user.charAt(0) }}</div>
                <div class="mention-body">
                  <div class="mention-user">{{ m.user }}</div>
                  <div class="mention-message">{{ m.message }}</div>
                  <div class="mention-time">{{ m.timestamp | date:'MMM d, h:mm a' }}</div>
                </div>
              </div>
              <div class="empty-state" *ngIf="mentionsProject?.mentions?.length === 0">No mentions yet.</div>
            </div>
            <div class="mentions-input-row" style="margin-top:16px">
              <input type="text" class="mentions-input" [(ngModel)]="mentionInput"
                placeholder="@username — add a note..." (keydown.enter)="addMentionToProject()" />
              <button class="btn-mention" (click)="addMentionToProject()">Post</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Toast -->
      <div class="toast" *ngIf="toastVisible">{{ toastMessage }}</div>

    </div>
  `,
  styles: [`
    .projects-page { display: flex; flex-direction: column; gap: 20px; font-family: sans-serif; color: #1a2332; }

    .page-header { display: flex; justify-content: space-between; align-items: flex-start; }
    .page-title { font-size: 26px; font-weight: 700; margin: 0 0 4px; font-family: 'Georgia', serif; color: #1a2332; }
    .page-subtitle { font-size: 13px; color: #718096; margin: 0; }

    .btn-primary { background: #1a2332; color: white; border: none; padding: 10px 18px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; }
    .btn-primary:hover { background: #2d3748; }
    .btn-secondary { background: #f7f9fc; color: #1a2332; border: 1px solid #e8ecf0; padding: 10px 18px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; }
    .btn-secondary:hover { background: #edf2f7; }

    .toolbar { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
    .search-input { flex: 1; min-width: 200px; padding: 9px 14px; border: 1px solid #e8ecf0; border-radius: 8px; font-size: 13px; outline: none; }
    .search-input:focus { border-color: #1a2332; }
    .filter-select { padding: 9px 14px; border: 1px solid #e8ecf0; border-radius: 8px; font-size: 13px; background: #fff; cursor: pointer; outline: none; }
    .upload-btn { padding: 9px 16px; border: 1px solid #e8ecf0; border-radius: 8px; font-size: 13px; color: #4a5568; background: #f7f9fc; cursor: pointer; font-weight: 600; }
    .upload-btn:hover { background: #edf2f7; }

    .table-wrapper { background: #fff; border: 1px solid #e8ecf0; border-radius: 10px; overflow-x: auto; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
    .projects-table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .projects-table th { text-align: left; padding: 12px 14px; font-size: 11px; font-weight: 700; color: #a0aec0; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #e8ecf0; background: #f7f9fc; white-space: nowrap; }
    .projects-table th.sortable { cursor: pointer; user-select: none; }
    .projects-table th.sortable:hover { color: #1a2332; }
    .projects-table td { padding: 12px 14px; border-bottom: 1px solid #f7f9fc; color: #2d3748; vertical-align: middle; }
    .projects-table tr:last-child td { border-bottom: none; }
    .projects-table tbody tr { cursor: pointer; transition: background 0.1s; }
    .projects-table tbody tr:hover td { background: #f7f9fc; }
    .projects-table tbody tr.selected td { background: #edf2f7; }
    .project-name { font-weight: 600; color: #1a2332 !important; white-space: nowrap; }
    .date { color: #718096; white-space: nowrap; }
    .num-cell { font-weight: 600; white-space: nowrap; }

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

    .progress-wrap { display: flex; align-items: center; gap: 8px; }
    .progress-bar { width: 70px; height: 6px; background: #f0f4f8; border-radius: 99px; overflow: hidden; }
    .progress-fill { height: 100%; border-radius: 99px; }
    .progress-pct { font-size: 12px; color: #718096; }

    .signoffs { display: flex; gap: 4px; flex-wrap: wrap; }
    .signoff-chip { padding: 2px 7px; border-radius: 4px; font-size: 10px; font-weight: 700; background: #e8fdf0; color: #38a169; }
    .empty-val { color: #cbd5e0; }
    .doc-count { font-size: 12px; color: #4a5568; }
    .mention-count { font-size: 12px; color: #3182ce; cursor: pointer; font-weight: 600; }
    .mention-count:hover { text-decoration: underline; }
    .edit-btn { padding: 5px 10px; border: 1px solid #e8ecf0; border-radius: 6px; background: #f7f9fc; font-size: 12px; cursor: pointer; color: #4a5568; white-space: nowrap; }
    .edit-btn:hover { background: #edf2f7; color: #1a2332; }
    .empty-state { text-align: center; color: #a0aec0; padding: 40px !important; font-size: 14px; }

    /* Modal */
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.35); z-index: 200; display: flex; align-items: center; justify-content: center; }
    .modal { background: #fff; border-radius: 12px; width: 620px; max-width: 95vw; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.15); }
    .modal-sm { width: 480px; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid #e8ecf0; position: sticky; top: 0; background: #fff; z-index: 1; }
    .modal-header h2 { margin: 0; font-size: 17px; font-family: 'Georgia', serif; color: #1a2332; }
    .modal-close { background: none; border: none; font-size: 16px; cursor: pointer; color: #a0aec0; }
    .modal-body { padding: 20px 24px; display: flex; flex-direction: column; gap: 14px; }
    .modal-footer { display: flex; justify-content: flex-end; gap: 10px; padding: 16px 24px; border-top: 1px solid #e8ecf0; position: sticky; bottom: 0; background: #fff; }

    .form-row { display: flex; gap: 14px; }
    .form-group { display: flex; flex-direction: column; gap: 5px; flex: 1; }
    .form-group label { font-size: 11px; font-weight: 700; color: #718096; text-transform: uppercase; letter-spacing: 0.4px; }
    .form-group input, .form-group select { padding: 9px 12px; border: 1px solid #e8ecf0; border-radius: 7px; font-size: 13px; color: #1a2332; outline: none; background: #fff; width: 100%; box-sizing: border-box; }
    .form-group input:focus, .form-group select:focus { border-color: #1a2332; }

    /* Budget Indicator */
    .budget-indicator { display: flex; flex-direction: column; gap: 6px; padding: 12px; background: #f7f9fc; border-radius: 8px; border: 1px solid #e8ecf0; }
    .budget-bar-track { height: 8px; background: #e2e8f0; border-radius: 99px; overflow: hidden; }
    .budget-bar-fill { height: 100%; border-radius: 99px; transition: width 0.3s; }
    .budget-bar-label { font-size: 12px; font-weight: 600; }

    /* Mentions */
    .mentions-section { display: flex; flex-direction: column; gap: 10px; border-top: 1px solid #e8ecf0; padding-top: 14px; }
    .mentions-label { font-size: 11px; font-weight: 700; color: #718096; text-transform: uppercase; letter-spacing: 0.4px; }
    .mentions-input-row { display: flex; gap: 8px; }
    .mentions-input { flex: 1; padding: 9px 12px; border: 1px solid #e8ecf0; border-radius: 7px; font-size: 13px; color: #1a2332; outline: none; }
    .mentions-input:focus { border-color: #1a2332; }
    .btn-mention { padding: 9px 16px; background: #1a2332; color: white; border: none; border-radius: 7px; font-size: 13px; font-weight: 600; cursor: pointer; white-space: nowrap; }
    .btn-mention:hover { background: #2d3748; }
    .mentions-list { display: flex; flex-direction: column; gap: 10px; max-height: 200px; overflow-y: auto; }
    .mention-item { display: flex; gap: 10px; align-items: flex-start; }
    .mention-avatar { width: 30px; height: 30px; border-radius: 50%; background: #1a2332; color: white; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0; }
    .mention-body { flex: 1; }
    .mention-user { font-size: 12px; font-weight: 700; color: #1a2332; }
    .mention-message { font-size: 13px; color: #4a5568; margin-top: 2px; }
    .mention-time { font-size: 11px; color: #a0aec0; margin-top: 3px; }

    /* Toast */
    .toast { position: fixed; bottom: 24px; right: 24px; background: #1a2332; color: white; padding: 12px 20px; border-radius: 8px; font-size: 13px; font-weight: 600; box-shadow: 0 4px 16px rgba(0,0,0,0.15); z-index: 999; animation: fadeIn 0.2s ease; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class ProjectsComponent {
  Math = Math;
  searchTerm = '';
  statusFilter = '';
  priorityFilter = '';
  showModal = false;
  showMentionsModal = false;
  isEditing = false;
  selectedProject: Project | null = null;
  mentionsProject: Project | null = null;
  mentionInput = '';
  sortColumn = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  toastVisible = false;
  toastMessage = '';

  currentProject: Partial<Project> = this.emptyProject();

  emptyProject(): Partial<Project> {
    return { name: '', pm: '', type: 'BA', status: 'Planning', priority: 'Medium', budget: 0, spent: 0, progress: 0, startDate: '', endDate: '', signOffs: [], documents: [], mentions: [] };
  }

  projects: Project[] = [
    { id: 1, name: 'ERP System Migration', type: 'IT', pm: 'Alice M.', status: 'Active', priority: 'Critical', budget: 850000, spent: 612000, progress: 72, startDate: 'Jan 10, 2026', endDate: 'Feb 25, 2026', signOffs: ['PMO', 'IT'], documents: ['scope.pdf', 'plan.docx'], mentions: [{ user: 'Alice M.', message: '@James K. please review the migration timeline', timestamp: new Date('2026-02-18') }] },
    { id: 2, name: 'Customer Portal Redesign', type: 'BA', pm: 'James K.', status: 'Active', priority: 'High', budget: 320000, spent: 144000, progress: 45, startDate: 'Dec 1, 2025', endDate: 'Mar 10, 2026', signOffs: ['BA'], documents: ['requirements.docx'], mentions: [] },
    { id: 3, name: 'HR Self-Service Portal', type: 'Mixed', pm: 'Sarah T.', status: 'On Hold', priority: 'Medium', budget: 210000, spent: 63000, progress: 30, startDate: 'Nov 15, 2025', endDate: 'Mar 8, 2026', signOffs: [], documents: [], mentions: [] },
    { id: 4, name: 'Supply Chain Analytics', type: 'BA', pm: 'David O.', status: 'At Risk', priority: 'High', budget: 450000, spent: 388000, progress: 58, startDate: 'Oct 5, 2025', endDate: 'Feb 28, 2026', signOffs: ['PMO'], documents: ['analysis.xlsx'], mentions: [{ user: 'David O.', message: '@Linda N. budget is exceeding forecast — need review', timestamp: new Date('2026-02-19') }] },
    { id: 5, name: 'Mobile App v2 Launch', type: 'IT', pm: 'Linda N.', status: 'Active', priority: 'High', budget: 380000, spent: 338000, progress: 89, startDate: 'Sep 20, 2025', endDate: 'Mar 20, 2026', signOffs: ['IT', 'PMO', 'BA'], documents: ['spec.pdf'], mentions: [] },
    { id: 6, name: 'Compliance Audit System', type: 'Mixed', pm: 'Alice M.', status: 'Completed', priority: 'Critical', budget: 275000, spent: 268000, progress: 100, startDate: 'Aug 1, 2025', endDate: 'Feb 10, 2026', signOffs: ['PMO', 'IT', 'BA'], documents: ['audit.pdf', 'report.docx'], mentions: [] },
    { id: 7, name: 'Data Warehouse Upgrade', type: 'IT', pm: 'James K.', status: 'Planning', priority: 'Medium', budget: 600000, spent: 60000, progress: 10, startDate: 'Feb 15, 2026', endDate: 'Jun 30, 2026', signOffs: [], documents: [], mentions: [] },
    { id: 8, name: 'Finance Reporting Tool', type: 'BA', pm: 'Sarah T.', status: 'Active', priority: 'Low', budget: 95000, spent: 59000, progress: 62, startDate: 'Jan 5, 2026', endDate: 'Apr 15, 2026', signOffs: ['BA'], documents: ['brief.docx'], mentions: [] },
  ];

  filteredProjects: Project[] = [...this.projects];

  openAddModal() {
    this.isEditing = false;
    this.currentProject = this.emptyProject();
    this.mentionInput = '';
    this.showModal = true;
  }

  openEditModal(project: Project) {
    this.isEditing = true;
    this.currentProject = { ...project, mentions: [...project.mentions] };
    this.mentionInput = '';
    this.showModal = true;
  }

  openMentions(project: Project) {
    this.mentionsProject = project;
    this.mentionInput = '';
    this.showMentionsModal = true;
  }

  getProjectMentions(): Mention[] {
    return (this.currentProject.mentions as Mention[]) || [];
  }

  addMention() {
    if (!this.mentionInput.trim()) return;
    const mention: Mention = { user: 'NeskoLimo', message: this.mentionInput, timestamp: new Date() };
    if (!this.currentProject.mentions) this.currentProject.mentions = [];
    (this.currentProject.mentions as Mention[]).push(mention);
    this.mentionInput = '';
  }

  addMentionToProject() {
    if (!this.mentionInput.trim() || !this.mentionsProject) return;
    const mention: Mention = { user: 'NeskoLimo', message: this.mentionInput, timestamp: new Date() };
    this.mentionsProject.mentions.push(mention);
    this.mentionInput = '';
    this.showToast('💬 Mention posted');
  }

  saveProject() {
    if (!this.currentProject.name || !this.currentProject.pm) {
      this.showToast('⚠️ Project name and PM are required');
      return;
    }
    if (this.isEditing) {
      const idx = this.projects.findIndex(p => p.id === (this.currentProject as Project).id);
      if (idx > -1) this.projects[idx] = { ...this.projects[idx], ...this.currentProject } as Project;
      this.showToast('✅ Project updated successfully');
    } else {
      const project: Project = {
        id: this.projects.length + 1,
        name: this.currentProject.name!,
        type: this.currentProject.type || 'BA',
        pm: this.currentProject.pm!,
        status: this.currentProject.status || 'Planning',
        priority: this.currentProject.priority || 'Medium',
        budget: this.currentProject.budget || 0,
        spent: this.currentProject.spent || 0,
        progress: this.currentProject.progress || 0,
        startDate: this.currentProject.startDate || '—',
        endDate: this.currentProject.endDate || '—',
        signOffs: [], documents: [],
        mentions: (this.currentProject.mentions as Mention[]) || []
      };
      this.projects.unshift(project);
      this.showToast('✅ Project added successfully');
    }
    this.applyFilters();
    this.showModal = false;
  }

  applyFilters() {
    let result = [...this.projects];
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(term) || p.pm.toLowerCase().includes(term) || p.type.toLowerCase().includes(term));
    }
    if (this.statusFilter) result = result.filter(p => p.status === this.statusFilter);
    if (this.priorityFilter) result = result.filter(p => p.priority === this.priorityFilter);
    if (this.sortColumn) result = this.applySorting(result);
    this.filteredProjects = result;
  }

  sort(column: string) {
    if (this.sortColumn === column) { this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc'; }
    else { this.sortColumn = column; this.sortDirection = 'asc'; }
    this.applyFilters();
  }

  applySorting(data: Project[]): Project[] {
    return [...data].sort((a, b) => {
      const aVal = (a as any)[this.sortColumn];
      const bVal = (b as any)[this.sortColumn];
      if (typeof aVal === 'number') return this.sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      return this.sortDirection === 'asc' ? String(aVal).localeCompare(String(bVal)) : String(bVal).localeCompare(String(aVal));
    });
  }

  getSortIcon(column: string): string {
    if (this.sortColumn !== column) return '↕';
    return this.sortDirection === 'asc' ? '↑' : '↓';
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = { 'Active': 'status-active', 'On Hold': 'status-on-hold', 'At Risk': 'status-at-risk', 'Completed': 'status-completed', 'Planning': 'status-planning' };
    return map[status] || '';
  }

  getPriorityClass(priority: string): string {
    const map: Record<string, string> = { 'Critical': 'priority-critical', 'High': 'priority-high', 'Medium': 'priority-medium', 'Low': 'priority-low' };
    return map[priority] || '';
  }

  getProgressColor(progress: number): string {
    if (progress >= 80) return '#38a169';
    if (progress >= 50) return '#3182ce';
    if (progress >= 25) return '#d69e2e';
    return '#e53e3e';
  }

  onFileUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0 && this.selectedProject) {
      this.selectedProject.documents.push(input.files[0].name);
      this.showToast(`📎 "${input.files[0].name}" uploaded`);
    } else if (!this.selectedProject) {
      this.showToast('⚠️ Click a project row first to select it');
    }
  }

  showToast(message: string) {
    this.toastMessage = message;
    this.toastVisible = true;
    setTimeout(() => this.toastVisible = false, 3000);
  }
}
