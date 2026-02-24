// src/app/components/projects/projects.component.ts
import { Component, OnInit, HostListener, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GovernanceService, Project } from '../../services/governance.service';

type ModalMode = 'add' | 'edit' | 'confirm-edit' | 'confirm-delete' | null;

interface ProjectDraft {
  name: string; owner: string; location: string;
  phase: Project['phase']; status: Project['status'];
  startDate: string; projectedEndDate: string; actualEndDate: string;
  budget: number | null; scopeTag: string; attachmentUrl: string;
  hasAttachment: boolean; manualProgress: number | null;
}

const BLANK_DRAFT = (): ProjectDraft => ({
  name: '', owner: '', location: '',
  phase: 'Initiation', status: 'Planning',
  startDate: '', projectedEndDate: '', actualEndDate: '',
  budget: null, scopeTag: '', attachmentUrl: '',
  hasAttachment: false, manualProgress: null,
});

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  template: `
<!-- ══ PAGE SHELL ═══════════════════════════════════════════════════════════ -->
<div class="pg">

  <!-- Header -->
  <header class="pg-header">
    <div class="pg-header-left">
      <p class="eyebrow">GOVERNANCE REGISTRY · {{ gov.currentUser().role }}</p>
      <h1>Workstream Portfolio</h1>
      <p class="sub">Enforcing phase-gate compliance and time-based performance metrics.</p>
    </div>
    <div class="pg-header-right">
      <button class="btn-template" (click)="downloadTemplate()">↓ Template</button>
      <button class="btn-add" (click)="openAdd()">+ Add Project</button>
      <label class="btn-upload" for="csv-upload">↑ Upload CSV</label>
      <input id="csv-upload" type="file" accept=".csv,.xlsx" hidden (change)="onFileUpload($event)">
    </div>
  </header>

  <!-- Stats strip -->
  <div class="stats-strip">
    <div class="stat-pill" *ngFor="let s of statsStrip">
      <span class="sp-icon">{{ s.icon }}</span>
      <span class="sp-val" [style.color]="s.color">{{ s.value }}</span>
      <span class="sp-lbl">{{ s.label }}</span>
    </div>
  </div>

  <!-- Search & filters -->
  <div class="toolbar">
    <div class="search-wrap">
      <span class="search-icon">
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="7" stroke="#64748b" stroke-width="2"/>
          <path d="M20 20l-3-3" stroke="#64748b" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </span>
      <input class="search" type="text" [(ngModel)]="search"
             placeholder="Search by name, owner, or location..." (ngModelChange)="currentPage=1">
      <button class="search-clear" *ngIf="search" (click)="search='';currentPage=1">✕</button>
    </div>
    <div class="filter-chips">
      <button class="chip" *ngFor="let s of ['All','Active','Critical','Planning','Closure']"
              [class.chip-on]="statusFilter===s"
              (click)="statusFilter=s; currentPage=1">
        <span class="chip-dot" [style.background]="statusColour(s)"></span>{{ s }}
      </button>
    </div>
    <div class="toolbar-right">
      <span class="result-count">{{ filtered().length }} project{{ filtered().length !== 1 ? 's' : '' }}</span>
      <select class="sort-select" [(ngModel)]="sortKey" (ngModelChange)="currentPage=1">
        <option value="name">Sort: Name</option>
        <option value="progress">Sort: Progress</option>
        <option value="budget">Sort: Budget</option>
        <option value="end">Sort: End Date</option>
        <option value="status">Sort: Status</option>
      </select>
    </div>
  </div>

  <!-- ══ TABLE ════════════════════════════════════════════════════════════════ -->
  <div class="tbl-wrap">
    <table class="tbl">
      <thead>
        <tr>
          <th class="th-project">PROJECT</th>
          <th class="th-timelines">TIMELINES</th>
          <th class="th-progress">PROGRESS</th>
          <th class="th-scope">SCOPE</th>
          <th class="th-phase">PHASE</th>
          <th class="th-status">STATUS</th>
          <th class="th-budget">BUDGET</th>
          <th class="th-actions"></th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let p of paged(); trackBy: trackById"
            [class.row-critical]="p.status === 'Critical'"
            [class.row-closure]="p.status === 'Closure'">

          <!-- Project name + owner -->
          <td class="td-project">
            <div class="proj-name">{{ p.name }}</div>
            <div class="proj-meta">{{ p.owner }} · {{ p.location }}</div>
          </td>

          <!-- Timelines -->
          <td class="td-timelines">
            <div class="tl-row"><span class="tl-lbl">START</span><span class="tl-val">{{ p.startDate | date:'dd/MM/yy' }}</span></div>
            <div class="tl-row"><span class="tl-lbl">PROJ.</span><span class="tl-val">{{ p.projectedEndDate | date:'dd/MM/yy' }}</span></div>
            <div class="tl-row">
              <span class="tl-lbl">ACTUAL</span>
              <span class="tl-val" [class.tl-actual]="p.actualEndDate">
                {{ p.actualEndDate ? (p.actualEndDate | date:'dd/MM/yy') : 'DD/MM/YY' }}
              </span>
            </div>
          </td>

          <!-- Progress — time-based, fixed direction -->
          <td class="td-progress">
            <div class="prog-wrap">
              <div class="prog-track">
                <div class="prog-fill"
                     [style.width.%]="gov.getCalculatedProgress(p)"
                     [class.fill-critical]="p.status === 'Critical'"
                     [class.fill-done]="p.actualEndDate">
                </div>
              </div>
              <span class="prog-pct"
                    [class.pct-critical]="p.status === 'Critical'"
                    [class.pct-done]="p.actualEndDate">
                {{ gov.getCalculatedProgress(p) }}%
              </span>
            </div>
            <!-- Overdue badge -->
            <div class="overdue-badge" *ngIf="isOverdue(p)">OVERDUE</div>
            <!-- Days remaining -->
            <div class="days-remain" *ngIf="!p.actualEndDate && !isOverdue(p)">
              {{ daysUntil(p.projectedEndDate) }}d remaining
            </div>
          </td>

          <!-- Scope -->
          <td class="td-scope">
            <a *ngIf="p.hasAttachment && p.attachmentUrl" [href]="p.attachmentUrl"
               target="_blank" class="scope-link" [title]="p.attachmentUrl">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              {{ p.scopeTag || 'LINK' }}
              <button class="scope-remove" (click)="removeAttachment(p, $event)">✕</button>
            </a>
            <label *ngIf="!p.hasAttachment" class="scope-upload" [for]="'scope-' + p.id" title="Attach scope document">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14M5 12h14" stroke="#94a3b8" stroke-width="2" stroke-linecap="round"/>
              </svg>
              Attach
              <input [id]="'scope-' + p.id" type="file" hidden (change)="attachScope(p, $event)">
            </label>
          </td>

          <!-- Phase -->
          <td class="td-phase">
            <span class="phase-chip" [ngClass]="'ph-' + p.phase.toLowerCase()">{{ p.phase.toUpperCase() }}</span>
          </td>

          <!-- Status -->
          <td class="td-status">
            <div class="status-wrap">
              <span class="status-dot" [style.background]="statusColour(p.status)"></span>
              <span class="status-lbl" [style.color]="statusColour(p.status)">{{ p.status }}</span>
            </div>
          </td>

          <!-- Budget -->
          <td class="td-budget">KES {{ (p.budget / 1000) | number:'1.0-0' }}K</td>

          <!-- Actions -->
          <td class="td-actions">
            <button class="act-btn act-edit" (click)="openEdit(p)" title="Edit project">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
            <button class="act-btn act-delete" (click)="confirmDelete(p)" title="Delete project">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <polyline points="3 6 5 6 21 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </td>
        </tr>

        <!-- Empty state -->
        <tr *ngIf="filtered().length === 0">
          <td colspan="8" class="empty-state">
            <div class="es-icon">🔍</div>
            <div class="es-title">No projects found</div>
            <div class="es-sub">Try adjusting your search or filter</div>
            <button class="btn-add" style="margin-top:14px" (click)="openAdd()">+ Add First Project</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Pagination -->
  <div class="pagination" *ngIf="totalPages() > 1">
    <span class="pg-info">{{ pageRangeStr() }}</span>
    <div class="pg-controls">
      <button class="pg-btn" [disabled]="currentPage===1" (click)="currentPage=1">«</button>
      <button class="pg-btn" [disabled]="currentPage===1" (click)="currentPage=currentPage-1">‹</button>
      <button class="pg-btn pg-num" *ngFor="let n of pageNums()"
              [class.pg-on]="n===currentPage" (click)="currentPage=n">{{ n }}</button>
      <button class="pg-btn" [disabled]="currentPage===totalPages()" (click)="currentPage=currentPage+1">›</button>
      <button class="pg-btn" [disabled]="currentPage===totalPages()" (click)="currentPage=totalPages()">»</button>
    </div>
    <span class="pg-info">Page {{ currentPage }} of {{ totalPages() }}</span>
  </div>

</div>

<!-- ══ ADD / EDIT MODAL ══════════════════════════════════════════════════════ -->
<div class="overlay" *ngIf="modal === 'add' || modal === 'edit'" (click)="maybeClose($event)">
  <div class="modal" role="dialog" [attr.aria-label]="modal === 'add' ? 'Add project' : 'Edit project'">

    <header class="modal-header">
      <div class="mh-left">
        <div class="mh-icon" [class.mh-icon-edit]="modal==='edit'">
          {{ modal === 'add' ? '＋' : '✎' }}
        </div>
        <div>
          <div class="mh-title">{{ modal === 'add' ? 'New Project' : 'Edit Project' }}</div>
          <div class="mh-sub" *ngIf="modal === 'edit'">{{ editTarget?.id }}</div>
        </div>
      </div>
      <button class="modal-close" (click)="closeModal()">✕</button>
    </header>

    <div class="modal-body">

      <!-- Row 1 -->
      <div class="form-row">
        <div class="form-group form-group-wide">
          <label>Project Name <span class="req">*</span></label>
          <input [(ngModel)]="draft.name" placeholder="e.g. ERP System Migration" [class.input-err]="submitted && !draft.name">
          <span class="err-msg" *ngIf="submitted && !draft.name">Required</span>
        </div>
        <div class="form-group">
          <label>Budget (KES) <span class="req">*</span></label>
          <input type="number" [(ngModel)]="draft.budget" placeholder="e.g. 1200000" min="0" [class.input-err]="submitted && !draft.budget">
          <span class="err-msg" *ngIf="submitted && !draft.budget">Required</span>
        </div>
      </div>

      <!-- Row 2 -->
      <div class="form-row">
        <div class="form-group">
          <label>Owner <span class="req">*</span></label>
          <input [(ngModel)]="draft.owner" placeholder="e.g. Alice M." [class.input-err]="submitted && !draft.owner">
          <span class="err-msg" *ngIf="submitted && !draft.owner">Required</span>
        </div>
        <div class="form-group form-group-wide">
          <label>Location <span class="req">*</span></label>
          <input [(ngModel)]="draft.location" placeholder="e.g. Nairobi, Kenya" [class.input-err]="submitted && !draft.location">
          <span class="err-msg" *ngIf="submitted && !draft.location">Required</span>
        </div>
      </div>

      <!-- Row 3 -->
      <div class="form-row">
        <div class="form-group">
          <label>Start Date <span class="req">*</span></label>
          <input type="date" [(ngModel)]="draft.startDate" [class.input-err]="submitted && !draft.startDate">
          <span class="err-msg" *ngIf="submitted && !draft.startDate">Required</span>
        </div>
        <div class="form-group">
          <label>Projected End Date <span class="req">*</span></label>
          <input type="date" [(ngModel)]="draft.projectedEndDate" [class.input-err]="submitted && !draft.projectedEndDate">
          <span class="err-msg" *ngIf="submitted && !draft.projectedEndDate">Required</span>
        </div>
        <div class="form-group">
          <label>Actual End Date</label>
          <input type="date" [(ngModel)]="draft.actualEndDate">
          <span class="field-hint">Set when project closes</span>
        </div>
      </div>

      <!-- Row 4 -->
      <div class="form-row">
        <div class="form-group">
          <label>Phase <span class="req">*</span></label>
          <select [(ngModel)]="draft.phase">
            <option>Initiation</option>
            <option>Planning</option>
            <option>Execution</option>
            <option>Closure</option>
          </select>
        </div>
        <div class="form-group">
          <label>Status <span class="req">*</span></label>
          <select [(ngModel)]="draft.status">
            <option>Active</option>
            <option>Critical</option>
            <option>Planning</option>
            <option>Closure</option>
          </select>
        </div>
        <div class="form-group">
          <label>Manual Progress % <span class="field-hint-inline">(optional override)</span></label>
          <input type="number" [(ngModel)]="draft.manualProgress" placeholder="Leave blank for auto" min="0" max="100">
          <span class="field-hint">Leave blank to use time-based calculation</span>
        </div>
      </div>

      <!-- Row 5 — Scope -->
      <div class="form-row">
        <div class="form-group form-group-wide">
          <label>Scope Document URL</label>
          <input [(ngModel)]="draft.attachmentUrl" placeholder="https://..." (ngModelChange)="draft.hasAttachment = !!draft.attachmentUrl">
        </div>
        <div class="form-group">
          <label>Scope Tag</label>
          <input [(ngModel)]="draft.scopeTag" placeholder="e.g. erp-sc..." maxlength="12">
        </div>
      </div>

      <!-- Progress preview -->
      <div class="progress-preview" *ngIf="draft.startDate && draft.projectedEndDate">
        <span class="pp-label">Calculated Progress Preview</span>
        <div class="pp-track">
          <div class="pp-fill" [style.width.%]="previewProgress()"></div>
        </div>
        <span class="pp-pct">{{ previewProgress() }}%</span>
        <span class="pp-hint">based on today vs timeline span</span>
      </div>

    </div>

    <footer class="modal-footer">
      <button class="btn-cancel" (click)="closeModal()">Cancel</button>
      <button class="btn-save" *ngIf="modal==='add'" (click)="submitAdd()">
        Create Project
      </button>
      <button class="btn-save btn-save-edit" *ngIf="modal==='edit'" (click)="submitEditToConfirm()">
        Review Changes →
      </button>
    </footer>

  </div>
</div>

<!-- ══ EDIT CONFIRMATION DIALOG ══════════════════════════════════════════════ -->
<div class="overlay" *ngIf="modal === 'confirm-edit'" (click)="maybeClose($event)">
  <div class="modal modal-confirm" role="dialog" aria-label="Confirm changes">

    <header class="modal-header">
      <div class="mh-left">
        <div class="mh-icon mh-icon-warn">⚠</div>
        <div>
          <div class="mh-title">Confirm Changes</div>
          <div class="mh-sub">These changes will be recorded in the audit log</div>
        </div>
      </div>
      <button class="modal-close" (click)="modal='edit'">✕</button>
    </header>

    <div class="modal-body">
      <div class="diff-table">
        <div class="diff-header">
          <span>Field</span><span>Before</span><span>After</span>
        </div>
        <div class="diff-row" *ngFor="let d of changeDiff" [class.diff-changed]="d.changed">
          <span class="diff-field">{{ d.field }}</span>
          <span class="diff-old">{{ d.before }}</span>
          <span class="diff-new" [class.diff-new-changed]="d.changed">{{ d.after }}</span>
        </div>
        <div class="diff-empty" *ngIf="changeDiff.length === 0">No fields have changed.</div>
      </div>

      <div class="audit-note">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="#0057FF" stroke-width="2"/>
          <path d="M12 8v4M12 16h.01" stroke="#0057FF" stroke-width="2" stroke-linecap="round"/>
        </svg>
        This action will be logged as <strong>UPDATE</strong> by
        <strong>{{ gov.currentUser().name }}</strong> at {{ confirmTime | date:'HH:mm:ss, d MMM y' }}.
      </div>
    </div>

    <footer class="modal-footer">
      <button class="btn-cancel" (click)="modal='edit'">← Back to Edit</button>
      <button class="btn-save btn-save-confirm" (click)="confirmEdit()" [disabled]="changeDiff.length===0">
        ✓ Confirm & Save
      </button>
    </footer>

  </div>
</div>

<!-- ══ DELETE CONFIRMATION ═══════════════════════════════════════════════════ -->
<div class="overlay" *ngIf="modal === 'confirm-delete'" (click)="maybeClose($event)">
  <div class="modal modal-confirm modal-sm" role="dialog" aria-label="Confirm delete">

    <header class="modal-header">
      <div class="mh-left">
        <div class="mh-icon mh-icon-danger">✕</div>
        <div>
          <div class="mh-title">Delete Project</div>
          <div class="mh-sub">This action cannot be undone</div>
        </div>
      </div>
      <button class="modal-close" (click)="closeModal()">✕</button>
    </header>

    <div class="modal-body">
      <div class="del-confirm-body">
        <p>Are you sure you want to permanently delete:</p>
        <div class="del-project-name">{{ deleteTarget?.name }}</div>
        <p class="del-sub">{{ deleteTarget?.id }} · {{ deleteTarget?.owner }} · {{ deleteTarget?.location }}</p>
      </div>
      <div class="audit-note">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="#ef4444" stroke-width="2"/>
          <path d="M12 8v4M12 16h.01" stroke="#ef4444" stroke-width="2" stroke-linecap="round"/>
        </svg>
        This will be permanently recorded as <strong>DELETE</strong> in the audit log.
      </div>
    </div>

    <footer class="modal-footer">
      <button class="btn-cancel" (click)="closeModal()">Cancel</button>
      <button class="btn-danger" (click)="executeDelete()">Delete Project</button>
    </footer>

  </div>
</div>

<!-- Toast notification -->
<div class="toast" [class.toast-show]="toastMsg" [class.toast-err]="toastErr">
  {{ toastMsg }}
</div>
  `,
  styles: [`
    :host {
      --navy:   #001E3C;
      --blue:   #0057FF;
      --blue-lt:#dbeafe;
      --ink:    #0f172a;
      --ink2:   #1e293b;
      --muted:  #64748b;
      --border: #e2e8f0;
      --bg:     #f0f4f8;
      --surface:#ffffff;
      --green:  #10b981;
      --red:    #ef4444;
      --amber:  #f59e0b;
      --r:      10px;
      --sh:     0 1px 3px rgba(0,0,0,.05), 0 4px 20px rgba(0,0,0,.07);
      --font:   'Inter','Segoe UI',sans-serif;
      display: block;
      font-family: var(--font);
      background: var(--bg);
      min-height: 100vh;
    }

    /* ── Page shell ────────────────────────────────────────────── */
    .pg { padding: 28px 32px; display: flex; flex-direction: column; gap: 18px; max-width: 1600px; }

    .pg-header { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 14px; }
    .pg-header-left .eyebrow { font-size: 10px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: var(--blue); margin: 0 0 4px; }
    .pg-header-left h1 { font-size: 26px; font-weight: 800; color: var(--navy); margin: 0 0 4px; letter-spacing: -0.5px; }
    .pg-header-left .sub { font-size: 12px; color: var(--muted); margin: 0; }
    .pg-header-right { display: flex; gap: 10px; align-items: center; }

    .btn-template {
      padding: 9px 16px; background: var(--surface); border: 1px solid var(--border);
      border-radius: 8px; font-size: 12px; font-weight: 700; color: var(--ink2); cursor: pointer;
      font-family: var(--font); transition: background .15s, border-color .15s;
    }
    .btn-template:hover { background: var(--bg); border-color: #94a3b8; }

    .btn-add {
      padding: 10px 18px; background: var(--navy); color: #fff; border: none;
      border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer;
      font-family: var(--font); transition: background .15s, transform .1s;
      display: inline-flex; align-items: center; gap: 6px;
    }
    .btn-add:hover { background: #0a2a50; transform: translateY(-1px); }

    .btn-upload {
      padding: 10px 18px; background: #0057FF; color: #fff; border: none;
      border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer;
      font-family: var(--font); transition: background .15s, transform .1s;
      display: inline-flex; align-items: center; gap: 6px;
    }
    .btn-upload:hover { background: #003fcc; transform: translateY(-1px); }

    /* Stats strip */
    .stats-strip { display: flex; gap: 12px; flex-wrap: wrap; }
    .stat-pill { display: flex; align-items: center; gap: 8px; background: var(--surface); border: 1px solid var(--border); border-radius: 20px; padding: 8px 14px; box-shadow: var(--sh); }
    .sp-icon { font-size: 14px; }
    .sp-val  { font-size: 14px; font-weight: 800; color: var(--navy); }
    .sp-lbl  { font-size: 10px; color: var(--muted); text-transform: uppercase; letter-spacing: .5px; font-weight: 600; }

    /* Toolbar */
    .toolbar { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; background: var(--surface); border: 1px solid var(--border); border-radius: var(--r); padding: 12px 16px; }
    .search-wrap { position: relative; flex: 1; min-width: 220px; }
    .search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); pointer-events: none; display: flex; }
    .search { width: 100%; padding: 9px 32px 9px 34px; border: 1px solid var(--border); border-radius: 8px; font-size: 13px; color: var(--ink); background: var(--bg); font-family: var(--font); outline: none; transition: border-color .15s, box-shadow .15s; }
    .search:focus { border-color: var(--blue); box-shadow: 0 0 0 3px rgba(0,87,255,.1); background: var(--surface); }
    .search::placeholder { color: var(--muted); }
    .search-clear { position: absolute; right: 8px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: var(--muted); font-size: 12px; padding: 3px; line-height: 1; }
    .search-clear:hover { color: var(--ink); }

    .filter-chips { display: flex; gap: 6px; flex-wrap: wrap; }
    .chip { display: flex; align-items: center; gap: 5px; padding: 6px 12px; border: 1px solid var(--border); border-radius: 20px; background: none; font-size: 11px; font-weight: 700; color: var(--muted); cursor: pointer; font-family: var(--font); transition: all .15s; }
    .chip:hover { border-color: #94a3b8; color: var(--ink2); background: var(--bg); }
    .chip.chip-on { background: var(--navy); color: #fff; border-color: var(--navy); }
    .chip-dot { width: 7px; height: 7px; border-radius: 50%; background: #e2e8f0; flex-shrink: 0; }
    .chip.chip-on .chip-dot { background: rgba(255,255,255,.5); }

    .toolbar-right { display: flex; align-items: center; gap: 10px; margin-left: auto; }
    .result-count { font-size: 12px; color: var(--muted); font-weight: 600; white-space: nowrap; }
    .sort-select { padding: 7px 12px; border: 1px solid var(--border); border-radius: 7px; font-size: 12px; color: var(--ink2); background: var(--surface); font-family: var(--font); cursor: pointer; outline: none; }

    /* ── Table ─────────────────────────────────────────────────── */
    .tbl-wrap { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r); overflow: hidden; box-shadow: var(--sh); }
    .tbl { width: 100%; border-collapse: collapse; font-size: 12px; }
    .tbl thead tr { background: var(--bg); }
    .tbl th { padding: 10px 14px; font-size: 9px; font-weight: 800; color: var(--muted); letter-spacing: .8px; text-align: left; border-bottom: 2px solid var(--border); white-space: nowrap; }
    .tbl td { padding: 13px 14px; border-bottom: 1px solid var(--border); vertical-align: middle; }
    .tbl tbody tr:last-child td { border-bottom: none; }
    .tbl tbody tr:hover td { background: #f8faff; }
    .row-critical td { background: #fff8f8; }
    .row-critical:hover td { background: #fff0f0; }
    .row-closure td  { opacity: 0.75; }

    .td-project .proj-name { font-weight: 700; color: var(--ink); font-size: 13px; }
    .td-project .proj-meta { font-size: 11px; color: var(--muted); margin-top: 2px; }

    .td-timelines { font-size: 11px; }
    .tl-row { display: flex; gap: 6px; align-items: center; line-height: 1.8; }
    .tl-lbl { font-size: 9px; font-weight: 800; color: var(--muted); letter-spacing: .5px; width: 38px; flex-shrink: 0; }
    .tl-val { font-size: 11px; color: var(--ink2); font-family: 'Courier New', monospace; }
    .tl-actual { color: var(--green); font-weight: 700; }

    /* Progress — FIXED: higher % = longer bar = more time elapsed */
    .td-progress { min-width: 120px; }
    .prog-wrap { display: flex; align-items: center; gap: 8px; }
    .prog-track { flex: 1; height: 6px; background: #e2e8f0; border-radius: 3px; overflow: hidden; }
    .prog-fill  { height: 100%; border-radius: 3px; background: var(--blue); transition: width .6s ease; }
    .prog-fill.fill-critical { background: var(--red); }
    .prog-fill.fill-done     { background: var(--green); }
    .prog-pct   { font-size: 11px; font-weight: 800; color: var(--ink2); font-family: 'Courier New', monospace; width: 34px; flex-shrink: 0; }
    .prog-pct.pct-critical { color: var(--red); }
    .prog-pct.pct-done     { color: var(--green); }
    .overdue-badge { display: inline-flex; padding: 2px 7px; background: #fef2f2; color: var(--red); border-radius: 4px; font-size: 9px; font-weight: 800; letter-spacing: .5px; margin-top: 4px; }
    .days-remain { font-size: 10px; color: var(--muted); margin-top: 3px; }

    /* Scope */
    .scope-link {
      display: inline-flex; align-items: center; gap: 5px;
      color: var(--blue); font-size: 11px; font-weight: 700;
      text-decoration: none; position: relative;
      padding: 3px 7px; background: var(--blue-lt); border-radius: 5px;
    }
    .scope-link:hover { background: #bfdbfe; }
    .scope-remove { background: none; border: none; cursor: pointer; color: var(--muted); font-size: 10px; line-height: 1; padding: 0 0 0 3px; }
    .scope-remove:hover { color: var(--red); }
    .scope-upload { display: inline-flex; align-items: center; gap: 5px; color: var(--muted); font-size: 11px; cursor: pointer; padding: 3px 7px; border: 1px dashed var(--border); border-radius: 5px; transition: all .15s; }
    .scope-upload:hover { border-color: var(--blue); color: var(--blue); }

    /* Phase chip */
    .phase-chip { padding: 3px 8px; border-radius: 4px; font-size: 9px; font-weight: 800; letter-spacing: .4px; }
    .ph-initiation { background: #f1f5f9; color: #475569; }
    .ph-planning   { background: #eff6ff; color: #1d4ed8; }
    .ph-execution  { background: #ecfdf5; color: #059669; }
    .ph-closure    { background: #e0f2fe; color: #0369a1; }

    /* Status */
    .status-wrap { display: flex; align-items: center; gap: 7px; }
    .status-dot  { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .status-lbl  { font-size: 12px; font-weight: 700; }

    /* Budget */
    .td-budget { font-family: 'Courier New', monospace; font-size: 12px; font-weight: 700; color: var(--ink2); white-space: nowrap; }

    /* Actions */
    .td-actions { display: flex; gap: 6px; align-items: center; }
    .act-btn { width: 30px; height: 30px; border-radius: 7px; border: 1px solid var(--border); background: var(--surface); cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--muted); transition: all .15s; }
    .act-edit:hover   { background: #eff6ff; border-color: var(--blue); color: var(--blue); transform: translateY(-1px); }
    .act-delete:hover { background: #fef2f2; border-color: var(--red); color: var(--red); transform: translateY(-1px); }

    /* Empty state */
    .empty-state { text-align: center; padding: 60px 20px; }
    .es-icon  { font-size: 36px; margin-bottom: 10px; }
    .es-title { font-size: 16px; font-weight: 700; color: var(--ink2); margin-bottom: 4px; }
    .es-sub   { font-size: 13px; color: var(--muted); }

    /* Pagination */
    .pagination { display: flex; justify-content: space-between; align-items: center; background: var(--surface); border: 1px solid var(--border); border-radius: var(--r); padding: 12px 18px; flex-wrap: wrap; gap: 10px; }
    .pg-info    { font-size: 12px; color: var(--muted); font-weight: 600; }
    .pg-controls { display: flex; gap: 4px; }
    .pg-btn { min-width: 32px; height: 32px; border: 1px solid var(--border); border-radius: 6px; background: var(--surface); font-size: 13px; color: var(--ink2); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all .12s; font-family: var(--font); font-weight: 600; }
    .pg-btn:hover:not([disabled]) { background: var(--blue-lt); border-color: var(--blue); color: var(--blue); }
    .pg-btn[disabled] { opacity: .35; cursor: not-allowed; }
    .pg-btn.pg-on { background: var(--navy); color: #fff; border-color: var(--navy); }

    /* ── Overlay ────────────────────────────────────────────────── */
    .overlay { position: fixed; inset: 0; background: rgba(0,30,60,.55); backdrop-filter: blur(3px); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px; animation: overlay-in .2s ease; }
    @keyframes overlay-in { from { opacity: 0; } to { opacity: 1; } }

    /* ── Modal ─────────────────────────────────────────────────── */
    .modal { background: var(--surface); border-radius: 14px; width: 100%; max-width: 720px; max-height: 90vh; display: flex; flex-direction: column; box-shadow: 0 20px 60px rgba(0,0,0,.25), 0 2px 8px rgba(0,0,0,.15); animation: modal-in .22s cubic-bezier(.34,1.56,.64,1); overflow: hidden; }
    .modal-confirm { max-width: 560px; }
    .modal-sm { max-width: 440px; }
    @keyframes modal-in { from { opacity:0; transform: scale(.94) translateY(12px); } to { opacity:1; transform: none; } }

    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid var(--border); }
    .mh-left { display: flex; align-items: center; gap: 12px; }
    .mh-icon { width: 36px; height: 36px; border-radius: 9px; background: #eff6ff; color: var(--blue); display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 800; }
    .mh-icon-edit   { background: #fef3c7; color: #92400e; }
    .mh-icon-warn   { background: #fef3c7; color: #92400e; }
    .mh-icon-danger { background: #fef2f2; color: var(--red); }
    .mh-title { font-size: 16px; font-weight: 800; color: var(--ink); }
    .mh-sub   { font-size: 11px; color: var(--muted); margin-top: 1px; font-family: 'Courier New', monospace; }
    .modal-close { background: none; border: none; cursor: pointer; color: var(--muted); font-size: 16px; width: 32px; height: 32px; border-radius: 7px; display: flex; align-items: center; justify-content: center; transition: background .15s; }
    .modal-close:hover { background: var(--bg); color: var(--ink); }

    .modal-body { padding: 20px 24px; overflow-y: auto; display: flex; flex-direction: column; gap: 14px; }

    /* Form */
    .form-row { display: flex; gap: 14px; flex-wrap: wrap; }
    .form-group { display: flex; flex-direction: column; gap: 4px; flex: 1; min-width: 150px; }
    .form-group-wide { flex: 2; min-width: 220px; }
    .form-group label { font-size: 10px; font-weight: 800; color: var(--muted); text-transform: uppercase; letter-spacing: .5px; }
    .form-group input, .form-group select {
      padding: 9px 12px; border: 1px solid var(--border); border-radius: 8px;
      font-size: 13px; color: var(--ink); font-family: var(--font); outline: none;
      background: var(--bg); transition: border-color .15s, box-shadow .15s;
    }
    .form-group input:focus, .form-group select:focus { border-color: var(--blue); box-shadow: 0 0 0 3px rgba(0,87,255,.1); background: var(--surface); }
    .input-err { border-color: var(--red) !important; background: #fff8f8 !important; }
    .err-msg { font-size: 10px; color: var(--red); font-weight: 600; }
    .field-hint { font-size: 10px; color: var(--muted); }
    .field-hint-inline { font-size: 9px; color: var(--muted); font-weight: 400; text-transform: none; letter-spacing: 0; }
    .req { color: var(--red); }

    /* Progress preview */
    .progress-preview { display: flex; align-items: center; gap: 10px; background: var(--bg); border-radius: 8px; padding: 10px 14px; border: 1px solid var(--border); }
    .pp-label { font-size: 10px; font-weight: 700; color: var(--muted); white-space: nowrap; }
    .pp-track { flex: 1; height: 6px; background: var(--border); border-radius: 3px; overflow: hidden; }
    .pp-fill  { height: 100%; border-radius: 3px; background: var(--blue); transition: width .4s; }
    .pp-pct   { font-size: 12px; font-weight: 800; color: var(--blue); white-space: nowrap; font-family: 'Courier New', monospace; }
    .pp-hint  { font-size: 10px; color: var(--muted); white-space: nowrap; }

    /* Diff table */
    .diff-table { border: 1px solid var(--border); border-radius: 8px; overflow: hidden; font-size: 12px; }
    .diff-header { display: grid; grid-template-columns: 140px 1fr 1fr; gap: 0; background: var(--bg); padding: 8px 12px; font-size: 9px; font-weight: 800; color: var(--muted); letter-spacing: .6px; border-bottom: 1px solid var(--border); }
    .diff-row { display: grid; grid-template-columns: 140px 1fr 1fr; gap: 0; padding: 9px 12px; border-bottom: 1px solid var(--border); }
    .diff-row:last-child { border-bottom: none; }
    .diff-changed { background: #fffbeb; }
    .diff-field { font-weight: 700; color: var(--ink2); font-family: 'Courier New', monospace; font-size: 11px; }
    .diff-old { color: var(--muted); text-decoration: line-through; }
    .diff-new { color: var(--ink2); }
    .diff-new-changed { color: var(--green); font-weight: 700; }
    .diff-empty { padding: 20px; text-align: center; color: var(--muted); font-size: 13px; }

    /* Audit note */
    .audit-note { display: flex; align-items: flex-start; gap: 8px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 12px 14px; font-size: 12px; color: var(--ink2); margin-top: 4px; line-height: 1.5; }

    /* Delete confirm body */
    .del-confirm-body { text-align: center; padding: 10px 0 14px; }
    .del-confirm-body p { font-size: 13px; color: var(--muted); margin-bottom: 10px; }
    .del-project-name  { font-size: 18px; font-weight: 800; color: var(--ink); margin-bottom: 6px; }
    .del-sub { font-size: 11px; color: var(--muted); font-family: 'Courier New', monospace; }

    /* Modal footer */
    .modal-footer { display: flex; justify-content: flex-end; gap: 10px; padding: 16px 24px; border-top: 1px solid var(--border); background: var(--bg); }
    .btn-cancel { padding: 9px 18px; background: var(--surface); border: 1px solid var(--border); border-radius: 8px; font-size: 13px; font-weight: 700; color: var(--ink2); cursor: pointer; font-family: var(--font); transition: background .15s; }
    .btn-cancel:hover { background: var(--bg); }
    .btn-save { padding: 10px 22px; background: var(--navy); color: #fff; border: none; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer; font-family: var(--font); transition: background .15s; }
    .btn-save:hover { background: #0a2a50; }
    .btn-save:disabled { opacity: .45; cursor: not-allowed; }
    .btn-save-edit    { background: var(--blue); }
    .btn-save-edit:hover { background: #003fcc; }
    .btn-save-confirm { background: var(--green); }
    .btn-save-confirm:hover { background: #059669; }
    .btn-danger { padding: 10px 22px; background: var(--red); color: #fff; border: none; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer; font-family: var(--font); transition: background .15s; }
    .btn-danger:hover { background: #dc2626; }

    /* Toast */
    .toast { position: fixed; bottom: 28px; right: 28px; background: var(--navy); color: #fff; padding: 12px 20px; border-radius: 10px; font-size: 13px; font-weight: 600; z-index: 2000; box-shadow: 0 8px 24px rgba(0,0,0,.3); opacity: 0; transform: translateY(12px); transition: all .3s ease; pointer-events: none; }
    .toast.toast-show { opacity: 1; transform: translateY(0); }
    .toast.toast-err  { background: var(--red); }
  `]
})
export class ProjectsComponent implements OnInit {
  protected readonly gov = inject(GovernanceService);

  // ── State ──────────────────────────────────────────────────────
  search       = '';
  statusFilter = 'All';
  sortKey      = 'name';
  currentPage  = 1;
  readonly pageSize = 8;

  modal: ModalMode = null;
  draft: ProjectDraft = BLANK_DRAFT();
  submitted = false;

  editTarget:   Project | null = null;
  deleteTarget: Project | null = null;
  changeDiff:   { field: string; before: string; after: string; changed: boolean }[] = [];
  confirmTime = new Date();

  toastMsg = '';
  toastErr = false;
  private toastTimer: any;

  // ── Lifecycle ──────────────────────────────────────────────────
  ngOnInit() {
    // Initial audit entry
  }

  // ── Computed ───────────────────────────────────────────────────
  filtered(): Project[] {
    let list = [...this.gov.projects];

    if (this.search.trim()) {
      const q = this.search.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.owner.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q)
      );
    }

    if (this.statusFilter !== 'All') {
      list = list.filter(p => p.status === this.statusFilter);
    }

    list.sort((a, b) => {
      switch (this.sortKey) {
        case 'progress': return this.gov.getCalculatedProgress(b) - this.gov.getCalculatedProgress(a);
        case 'budget':   return b.budget - a.budget;
        case 'status':   return a.status.localeCompare(b.status);
        case 'end':      return new Date(a.projectedEndDate).getTime() - new Date(b.projectedEndDate).getTime();
        default:         return a.name.localeCompare(b.name);
      }
    });

    return list;
  }

  paged(): Project[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filtered().slice(start, start + this.pageSize);
  }

  totalPages(): number { return Math.max(1, Math.ceil(this.filtered().length / this.pageSize)); }
  pageNums():   number[] {
    const total = this.totalPages(), cur = this.currentPage;
    const pages: number[] = [];
    for (let i = Math.max(1, cur - 2); i <= Math.min(total, cur + 2); i++) pages.push(i);
    return pages;
  }
  pageRangeStr(): string {
    const start = Math.min((this.currentPage - 1) * this.pageSize + 1, this.filtered().length);
    const end   = Math.min(this.currentPage * this.pageSize, this.filtered().length);
    return `${start}–${end} of ${this.filtered().length}`;
  }

  trackById(_: number, p: Project): string { return p.id; }

  get statsStrip() {
    const ps = this.gov.projects;
    return [
      { icon: '📁', value: ps.length,                                         label: 'Total',   color: '#001E3C' },
      { icon: '✅', value: ps.filter(p => p.status === 'Active').length,       label: 'Active',  color: '#10b981' },
      { icon: '🚨', value: ps.filter(p => p.status === 'Critical').length,     label: 'Critical',color: '#ef4444' },
      { icon: '📋', value: ps.filter(p => p.status === 'Planning').length,     label: 'Planning',color: '#0057FF' },
      { icon: '🏁', value: ps.filter(p => p.status === 'Closure').length,      label: 'Closure', color: '#0ea5e9' },
      { icon: '📊', value: Math.round(ps.reduce((s,p) => s+this.gov.getCalculatedProgress(p),0) / (ps.length||1)) + '%', label: 'Avg Progress', color: '#7c3aed' },
    ];
  }

  // ── Helpers ────────────────────────────────────────────────────
  statusColour(status: string): string {
    return { Active: '#10b981', Critical: '#ef4444', Planning: '#0057FF', Closure: '#0ea5e9', All: '#94a3b8' }[status] ?? '#94a3b8';
  }

  isOverdue(p: Project): boolean {
    if (p.actualEndDate) return false;
    return new Date(p.projectedEndDate) < new Date() && p.status !== 'Closure';
  }

  daysUntil(dateStr: string): number {
    return Math.max(0, Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86_400_000));
  }

  previewProgress(): number {
    if (this.draft.manualProgress !== null && this.draft.manualProgress !== undefined) {
      return Math.max(0, Math.min(100, this.draft.manualProgress));
    }
    if (!this.draft.startDate || !this.draft.projectedEndDate) return 0;
    if (this.draft.actualEndDate) return 100;
    const start = new Date(this.draft.startDate).getTime();
    const end   = new Date(this.draft.projectedEndDate).getTime();
    const today = Date.now();
    if (end <= start) return 0;
    return Math.max(0, Math.min(99, Math.round(((today - start) / (end - start)) * 100)));
  }

  // ── Add ────────────────────────────────────────────────────────
  openAdd(): void {
    this.draft = BLANK_DRAFT();
    this.submitted = false;
    this.modal = 'add';
  }

  submitAdd(): void {
    this.submitted = true;
    if (!this.draft.name || !this.draft.owner || !this.draft.location ||
        !this.draft.startDate || !this.draft.projectedEndDate || !this.draft.budget) {
      this.toast('Please fill in all required fields', true);
      return;
    }
    this.gov.addProject({
      name: this.draft.name.trim(),
      owner: this.draft.owner.trim(),
      location: this.draft.location.trim(),
      phase: this.draft.phase,
      status: this.draft.status,
      startDate: this.draft.startDate,
      projectedEndDate: this.draft.projectedEndDate,
      actualEndDate: this.draft.actualEndDate || undefined,
      budget: Number(this.draft.budget),
      hasAttachment: this.draft.hasAttachment,
      attachmentUrl: this.draft.attachmentUrl || undefined,
      scopeTag: this.draft.scopeTag || undefined,
      manualProgress: this.draft.manualProgress !== null ? Number(this.draft.manualProgress) : undefined,
    });
    this.closeModal();
    this.toast(`Project "${this.draft.name}" created successfully`);
  }

  // ── Edit ───────────────────────────────────────────────────────
  openEdit(p: Project): void {
    this.editTarget = p;
    this.draft = {
      name: p.name, owner: p.owner, location: p.location,
      phase: p.phase, status: p.status,
      startDate: p.startDate, projectedEndDate: p.projectedEndDate,
      actualEndDate: p.actualEndDate ?? '',
      budget: p.budget,
      hasAttachment: p.hasAttachment,
      attachmentUrl: p.attachmentUrl ?? '',
      scopeTag: p.scopeTag ?? '',
      manualProgress: p.manualProgress ?? null,
    };
    this.submitted = false;
    this.modal = 'edit';
  }

  submitEditToConfirm(): void {
    this.submitted = true;
    if (!this.draft.name || !this.draft.owner || !this.draft.location ||
        !this.draft.startDate || !this.draft.projectedEndDate || !this.draft.budget) {
      this.toast('Please fill in all required fields', true);
      return;
    }

    // Build diff for confirmation dialog
    const p = this.editTarget!;
    const fields: { field: string; oldVal: string; newVal: string }[] = [
      { field: 'name',              oldVal: p.name,                 newVal: this.draft.name },
      { field: 'owner',             oldVal: p.owner,                newVal: this.draft.owner },
      { field: 'location',          oldVal: p.location,             newVal: this.draft.location },
      { field: 'phase',             oldVal: p.phase,                newVal: this.draft.phase },
      { field: 'status',            oldVal: p.status,               newVal: this.draft.status },
      { field: 'startDate',         oldVal: p.startDate,            newVal: this.draft.startDate },
      { field: 'projectedEndDate',  oldVal: p.projectedEndDate,     newVal: this.draft.projectedEndDate },
      { field: 'actualEndDate',     oldVal: p.actualEndDate ?? '—', newVal: this.draft.actualEndDate || '—' },
      { field: 'budget',            oldVal: String(p.budget),       newVal: String(this.draft.budget) },
      { field: 'manualProgress',    oldVal: String(p.manualProgress ?? 'auto'), newVal: String(this.draft.manualProgress ?? 'auto') },
      { field: 'attachmentUrl',     oldVal: p.attachmentUrl ?? '—', newVal: this.draft.attachmentUrl || '—' },
    ];

    this.changeDiff = fields.map(f => ({
      field: f.field, before: f.oldVal, after: f.newVal,
      changed: f.oldVal !== f.newVal,
    })).filter(d => d.changed || d.field === 'name'); // always show name for context

    this.confirmTime = new Date();
    this.modal = 'confirm-edit';
  }

  confirmEdit(): void {
    if (!this.editTarget) return;
    this.gov.updateProject(this.editTarget.id, {
      name: this.draft.name.trim(),
      owner: this.draft.owner.trim(),
      location: this.draft.location.trim(),
      phase: this.draft.phase,
      status: this.draft.status,
      startDate: this.draft.startDate,
      projectedEndDate: this.draft.projectedEndDate,
      actualEndDate: this.draft.actualEndDate || undefined,
      budget: Number(this.draft.budget),
      hasAttachment: this.draft.hasAttachment,
      attachmentUrl: this.draft.attachmentUrl || undefined,
      scopeTag: this.draft.scopeTag || undefined,
      manualProgress: this.draft.manualProgress !== null ? Number(this.draft.manualProgress) : undefined,
    });
    const name = this.draft.name;
    this.closeModal();
    this.toast(`Project "${name}" updated and logged`);
  }

  // ── Delete ─────────────────────────────────────────────────────
  confirmDelete(p: Project): void {
    this.deleteTarget = p;
    this.modal = 'confirm-delete';
  }

  executeDelete(): void {
    if (!this.deleteTarget) return;
    const name = this.deleteTarget.name;
    this.gov.deleteProject(this.deleteTarget.id);
    this.closeModal();
    this.toast(`Project "${name}" deleted`);
  }

  // ── Scope attachment ───────────────────────────────────────────
  attachScope(p: Project, event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    this.gov.updateProject(p.id, { hasAttachment: true, attachmentUrl: url, scopeTag: file.name.slice(0, 10) });
    this.toast(`Scope document attached to "${p.name}"`);
  }

  removeAttachment(p: Project, event: MouseEvent): void {
    event.preventDefault();
    this.gov.updateProject(p.id, { hasAttachment: false, attachmentUrl: undefined, scopeTag: undefined });
    this.toast(`Attachment removed from "${p.name}"`);
  }

  // ── Upload CSV ─────────────────────────────────────────────────
  onFileUpload(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const lines = (reader.result as string).split('\n').filter(l => l.trim());
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const projects: Project[] = lines.slice(1).map(line => {
          const vals = line.split(',').map(v => v.trim().replace(/"/g, ''));
          const obj: any = {};
          headers.forEach((h, i) => { obj[h] = vals[i] ?? ''; });
          return {
            id: obj.id || 'PRJ-' + Date.now(),
            name: obj.name || 'Unnamed', owner: obj.owner || '', location: obj.location || '',
            phase: obj.phase || 'Initiation', status: obj.status || 'Planning',
            startDate: obj.startDate || '', projectedEndDate: obj.projectedEndDate || '',
            actualEndDate: obj.actualEndDate || undefined,
            budget: Number(obj.budget) || 0,
            hasAttachment: obj.hasAttachment === 'true',
            attachmentUrl: obj.attachmentUrl || undefined,
          };
        });
        this.gov.uploadProjects(projects);
        this.toast(`${projects.length} project(s) imported from CSV`);
      } catch (e) {
        this.toast('CSV parsing error — check file format', true);
      }
      (event.target as HTMLInputElement).value = '';
    };
    reader.readAsText(file);
  }

  // ── Template download ──────────────────────────────────────────
  downloadTemplate(): void {
    const header = 'id,name,owner,location,phase,status,startDate,projectedEndDate,actualEndDate,budget,hasAttachment,attachmentUrl';
    const example = 'PRJ-001,My Project,Alice M.,Nairobi Kenya,Execution,Active,2025-01-01,2026-06-30,,1200000,false,';
    const blob = new Blob([header + '\n' + example], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = 'ba-project-template.csv'; a.click();
    this.gov.log('SYSTEM', 'CSV template downloaded');
  }

  // ── Modal helpers ──────────────────────────────────────────────
  closeModal(): void { this.modal = null; this.editTarget = null; this.deleteTarget = null; }
  maybeClose(e: MouseEvent): void { if ((e.target as Element).classList.contains('overlay')) this.closeModal(); }

  @HostListener('document:keydown.escape')
  onEscape(): void { if (this.modal) this.closeModal(); }

  // ── Toast ──────────────────────────────────────────────────────
  toast(msg: string, err = false): void {
    clearTimeout(this.toastTimer);
    this.toastMsg = msg; this.toastErr = err;
    this.toastTimer = setTimeout(() => { this.toastMsg = ''; this.toastErr = false; }, 3500);
  }
}
