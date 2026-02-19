import { Component, inject, signal } from '@angular/core';
import { NgFor, NgClass, NgIf, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjectService } from '../../services/project.service';
import { Project, ProjectStatus } from '../../models/project.model';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [NgFor, NgClass, NgIf, DatePipe, FormsModule],
  template: `
    <div class="projects-page">

      <!-- Header -->
      <div class="page-header">
        <div>
          <p class="section-label">Portfolio</p>
          <h1 class="page-title">Projects</h1>
        </div>
        <button class="btn btn-primary" (click)="openModal()">+ Add Project</button>
      </div>

      <!-- Filters -->
      <div class="filters card">
        <input type="text" placeholder="Search projects, owners, tags…" [(ngModel)]="searchTerm" (input)="applyFilter()" class="search-input" />
        <div class="filter-pills">
          <button class="pill" [class.active]="!filterStatus" (click)="setFilter(null)">All</button>
          @for (s of statuses; track s) {
            <button class="pill" [class.active]="filterStatus === s" (click)="setFilter(s)">{{ s }}</button>
          }
        </div>
      </div>

      <!-- Project Cards -->
      @if (filtered().length === 0) {
        <div class="empty-state card" style="padding:60px 20px;">
          <span class="empty-icon">◉</span>
          <p class="empty-title">No projects found</p>
          <p class="empty-sub">Try a different filter or add a new project</p>
        </div>
      }

      <div class="projects-grid">
        @for (project of filtered(); track project.id) {
          <div class="project-card card">
            <div class="pc-header">
              <span class="badge" [ngClass]="getBadgeClass(project.status)">{{ project.status }}</span>
              <span class="priority-chip" [ngClass]="'priority-' + project.priority.toLowerCase()">{{ project.priority }}</span>
              <div class="pc-actions">
                <button class="icon-btn" (click)="editProject(project)" title="Edit">✎</button>
                <button class="icon-btn danger" (click)="deleteProject(project.id)" title="Delete">✕</button>
              </div>
            </div>

            <h3 class="pc-name">{{ project.name }}</h3>
            <p class="pc-desc">{{ project.description }}</p>

            <div class="pc-meta">
              <span class="meta-item"><span class="meta-icon">◎</span> {{ project.phase }}</span>
              <span class="meta-item"><span class="meta-icon">◈</span> {{ project.owner }}</span>
              <span class="meta-item"><span class="meta-icon">⬡</span> {{ project.dueDate | date:'dd MMM yy' }}</span>
            </div>

            <div class="pc-progress">
              <div class="progress-label">
                <span>Progress</span>
                <span class="progress-pct">{{ project.progress }}%</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill" [style.width.%]="project.progress"
                  [style.background]="getProgressColor(project.status)"></div>
              </div>
            </div>

            <div class="pc-budget">
              <span class="budget-item">
                <span class="budget-label">Budget</span>
                <span>KES {{ project.budget | number }}</span>
              </span>
              <span class="budget-item">
                <span class="budget-label">Spent</span>
                <span [class.over-budget]="project.budgetSpent > project.budget">
                  KES {{ project.budgetSpent | number }}
                </span>
              </span>
              <span class="budget-item">
                <span class="budget-label">Burn</span>
                <span>{{ getBurnRate(project) }}%</span>
              </span>
            </div>

            @if (project.tags.length > 0) {
              <div class="pc-tags">
                @for (tag of project.tags; track tag) {
                  <span class="tag">{{ tag }}</span>
                }
              </div>
            }
          </div>
        }
      </div>
    </div>

    <!-- Modal -->
    @if (showModal()) {
      <div class="modal-overlay" (click)="closeModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2 class="modal-title">{{ editMode() ? 'Edit Project' : 'New Project' }}</h2>
            <button class="modal-close" (click)="closeModal()">×</button>
          </div>
          <div class="form-grid">
            <div><label>Project Name *</label><input [(ngModel)]="form.name" placeholder="e.g. CRM Migration" /></div>
            <div><label>Description</label><textarea [(ngModel)]="form.description" rows="2" placeholder="Brief overview…"></textarea></div>
            <div class="form-row">
              <div>
                <label>Status</label>
                <select [(ngModel)]="form.status">
                  @for (s of statuses; track s) { <option [value]="s">{{ s }}</option> }
                </select>
              </div>
              <div>
                <label>Priority</label>
                <select [(ngModel)]="form.priority">
                  <option>Critical</option><option>High</option><option>Medium</option><option>Low</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div>
                <label>Phase</label>
                <select [(ngModel)]="form.phase">
                  <option>Discovery</option><option>Analysis</option><option>Design</option>
                  <option>Development</option><option>Testing</option><option>Deployment</option><option>Closed</option>
                </select>
              </div>
              <div><label>Progress (%)</label><input type="number" min="0" max="100" [(ngModel)]="form.progress" /></div>
            </div>
            <div class="form-row">
              <div><label>Owner</label><input [(ngModel)]="form.owner" placeholder="Your name" /></div>
              <div><label>Sponsor</label><input [(ngModel)]="form.sponsor" placeholder="Sponsor name + title" /></div>
            </div>
            <div class="form-row">
              <div><label>Start Date</label><input type="date" [(ngModel)]="form.startDate" /></div>
              <div><label>Due Date</label><input type="date" [(ngModel)]="form.dueDate" /></div>
            </div>
            <div class="form-row">
              <div><label>Budget (KES)</label><input type="number" [(ngModel)]="form.budget" /></div>
              <div><label>Budget Spent (KES)</label><input type="number" [(ngModel)]="form.budgetSpent" /></div>
            </div>
            <div><label>Tags (comma-separated)</label><input [(ngModel)]="tagsInput" placeholder="CRM, Migration, SAP" /></div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-ghost" (click)="closeModal()">Cancel</button>
            <button class="btn btn-primary" (click)="saveProject()">{{ editMode() ? 'Save Changes' : 'Add Project' }}</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .projects-page { max-width: 1200px; }
    .page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; }
    .page-title { font-size: clamp(24px, 3vw, 36px); font-weight: 800; letter-spacing: -0.02em; color: var(--text-primary); }
    .filters { display: flex; align-items: center; gap: 16px; padding: 16px 20px; margin-bottom: 24px; flex-wrap: wrap; }
    .search-input { flex: 1; min-width: 200px; }
    .filter-pills { display: flex; gap: 6px; flex-wrap: wrap; }
    .pill { font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.08em; padding: 5px 12px; border-radius: 100px; background: transparent; border: 1px solid var(--border-subtle); color: var(--text-muted); cursor: pointer; transition: all var(--transition); }
    .pill:hover { border-color: var(--border-mid); color: var(--text-secondary); }
    .pill.active { background: rgba(37,99,235,0.15); border-color: var(--blue-400); color: var(--blue-300); }
    .projects-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 18px; }
    .project-card { padding: 24px; display: flex; flex-direction: column; gap: 14px; }
    .pc-header { display: flex; align-items: center; gap: 8px; }
    .pc-actions { margin-left: auto; display: flex; gap: 4px; }
    .icon-btn { background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 14px; padding: 4px 6px; border-radius: 4px; transition: all var(--transition); }
    .icon-btn:hover { background: rgba(59,130,246,0.1); color: var(--blue-300); }
    .icon-btn.danger:hover { background: rgba(248,113,113,0.12); color: var(--red-400); }
    .pc-name { font-size: 17px; font-weight: 700; color: var(--text-primary); line-height: 1.3; }
    .pc-desc { font-size: 13px; color: var(--text-muted); line-height: 1.65; }
    .pc-meta { display: flex; flex-wrap: wrap; gap: 12px; }
    .meta-item { font-family: var(--font-mono); font-size: 11px; color: var(--text-muted); display: flex; align-items: center; gap: 4px; }
    .meta-icon { color: var(--blue-400); font-size: 10px; }
    .pc-progress .progress-label { display: flex; justify-content: space-between; font-family: var(--font-mono); font-size: 10px; color: var(--text-muted); margin-bottom: 6px; }
    .progress-pct { color: var(--blue-300); }
    .pc-budget { display: flex; gap: 20px; padding: 12px 0; border-top: 1px solid var(--border-subtle); }
    .budget-item { display: flex; flex-direction: column; }
    .budget-label { font-family: var(--font-mono); font-size: 9px; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-muted); margin-bottom: 2px; }
    .budget-item span { font-size: 13px; color: var(--text-secondary); font-weight: 500; }
    .over-budget { color: var(--red-400) !important; }
    .pc-tags { display: flex; flex-wrap: wrap; gap: 6px; }
    .tag { font-family: var(--font-mono); font-size: 10px; padding: 2px 8px; border-radius: 3px; background: rgba(37,99,235,0.1); border: 1px solid var(--border-subtle); color: var(--blue-300); }
    .priority-chip { font-family: var(--font-mono); font-size: 10px; padding: 2px 8px; border-radius: 3px; font-weight: 500; }
    .priority-critical { background: rgba(248,113,113,0.15); color: var(--red-400); }
    .priority-high     { background: rgba(251,191,36,0.12);  color: var(--amber-400); }
    .priority-medium   { background: rgba(96,165,250,0.12);  color: var(--blue-300); }
    .priority-low      { background: rgba(74,222,128,0.10);  color: var(--green-400); }
  `]
})
export class ProjectsComponent {
  private svc     = inject(ProjectService);
  showModal       = signal(false);
  editMode        = signal(false);
  editId          = signal<string | null>(null);
  filterStatus    = signal<ProjectStatus | null>(null);
  searchTerm      = '';
  tagsInput       = '';

  statuses: ProjectStatus[] = ['On Track','At Risk','Delayed','Completed','Planning'];

  form = this.blankForm();

  filtered() {
    return this.svc.filterBy(this.filterStatus() ?? undefined, this.searchTerm);
  }

  setFilter(s: ProjectStatus | null) { this.filterStatus.set(s); }
  applyFilter() { /* reactive via filtered() */ }

  openModal() {
    this.editMode.set(false);
    this.editId.set(null);
    this.form = this.blankForm();
    this.tagsInput = '';
    this.showModal.set(true);
  }

  editProject(p: Project) {
    this.editMode.set(true);
    this.editId.set(p.id);
    this.form = { ...p };
    this.tagsInput = p.tags.join(', ');
    this.showModal.set(true);
  }

  closeModal() { this.showModal.set(false); }

  saveProject() {
    if (!this.form.name.trim()) return;
    const tags = this.tagsInput.split(',').map(t => t.trim()).filter(Boolean);
    if (this.editMode() && this.editId()) {
      this.svc.update(this.editId()!, { ...this.form, tags });
    } else {
      this.svc.add({ ...this.form, tags });
    }
    this.closeModal();
  }

  deleteProject(id: string) {
    if (confirm('Delete this project? This cannot be undone.')) this.svc.delete(id);
  }

  getBurnRate(p: Project) {
    return p.budget > 0 ? Math.round((p.budgetSpent / p.budget) * 100) : 0;
  }

  getProgressColor(status: string) {
    if (status === 'Delayed')  return 'linear-gradient(90deg, #991b1b, var(--red-400))';
    if (status === 'At Risk')  return 'linear-gradient(90deg, #92400e, var(--amber-400))';
    if (status === 'Completed') return 'linear-gradient(90deg, #166534, var(--green-400))';
    return 'linear-gradient(90deg, var(--blue-600), var(--blue-400))';
  }

  getBadgeClass(status: string): string {
    const map: Record<string, string> = {
      'On Track': 'badge badge-on-track', 'At Risk':  'badge badge-at-risk',
      'Delayed':  'badge badge-delayed',  'Completed':'badge badge-completed', 'Planning': 'badge badge-planning'
    };
    return map[status] || 'badge';
  }

  private blankForm(): any {
    return {
      name: '', description: '', status: 'Planning' as ProjectStatus,
      priority: 'Medium', phase: 'Discovery', owner: '', sponsor: '',
      startDate: '', dueDate: '', progress: 0, budget: 0, budgetSpent: 0, tags: []
    };
  }
}
