import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GovernanceService, RepositoryDocument } from '../../services/governance.service';

@Component({
  selector: 'app-repository',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mck-container">
      <div class="header">
        <div class="title-group">
          <span class="eyebrow">Project Audit Trail</span>
          <h1>Document & Signature Hub</h1>
          <p>Centralized repository for standard templates and executed project sign-offs.</p>
        </div>
      </div>

      <div class="repo-grid">
        <div class="repo-section">
          <div class="section-header">
            <h3>Standard Templates</h3>
            <span class="count">{{ getTemplateCount() }} files</span>
          </div>
          <div class="doc-list">
            <div *ngFor="let doc of getTemplates()" class="doc-item">
              <div class="doc-icon">📄</div>
              <div class="doc-info">
                <span class="doc-name">{{ doc.name }}</span>
                <span class="doc-meta">{{ doc.category }} • Updated 2026</span>
              </div>
              <a [href]="doc.downloadUrl" class="btn-download">Get Template</a>
            </div>
          </div>
        </div>

        <div class="repo-section">
          <div class="section-header">
            <h3>Signature Workflow</h3>
            <span class="count">{{ getPendingCount() }} Pending</span>
          </div>
          <div class="sig-table-container">
            <table class="sig-table">
              <thead>
                <tr>
                  <th>Document</th>
                  <th>Current Signatory</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let p of getPendingDocs()">
                  <td>
                    <span class="p-name">{{ p.name }}</span>
                  </td>
                  <td>
                    <div class="signatory">
                      <div class="avatar">{{ p.nextSignatory?.[0] }}</div>
                      <span>{{ p.nextSignatory }}</span>
                    </div>
                  </td>
                  <td>
                    <span class="sig-badge" [ngClass]="p.status.toLowerCase()">
                      {{ p.status }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="mck-card signoff-section">
        <h3>Executed Sign-offs (Registry Sync)</h3>
        <div class="signoff-grid">
          <div *ngFor="let proj of gov.projects" class="signoff-card" [hidden]="!proj.hasAttachment">
            <div class="status-dot"></div>
            <div class="signoff-info">
              <span class="proj-id">{{ proj.id }}</span>
              <span class="proj-title">{{ proj.name }}</span>
              <span class="file-link">🔗 {{ proj.attachmentUrl }}</span>
            </div>
            <button class="btn-view" (click)="viewDoc(proj.attachmentUrl)">Audit File</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .mck-container { padding: 40px; background: #f5f7f9; min-height: 100vh; font-family: 'Inter', sans-serif; }
    .eyebrow { color: #007DFE; font-weight: 800; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; }
    .header { margin-bottom: 30px; }
    
    .repo-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; }
    .repo-section { background: white; border-radius: 8px; border: 1px solid #e2e8f0; padding: 25px; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .section-header h3 { color: #001E3C; margin: 0; }
    .count { background: #f1f5f9; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }

    /* Template Items */
    .doc-item { display: flex; align-items: center; padding: 15px; border: 1px solid #f1f5f9; border-radius: 6px; margin-bottom: 12px; transition: 0.2s; }
    .doc-item:hover { border-color: #007DFE; background: #f0f9ff; }
    .doc-icon { font-size: 24px; margin-right: 15px; }
    .doc-info { flex: 1; }
    .doc-name { display: block; font-weight: 700; color: #001E3C; font-size: 14px; }
    .doc-meta { font-size: 11px; color: #94a3b8; }
    .btn-download { color: #007DFE; text-decoration: none; font-size: 12px; font-weight: 700; border: 1px solid #007DFE; padding: 6px 12px; border-radius: 4px; }

    /* Signature Hub */
    .sig-table { width: 100%; border-collapse: collapse; }
    .sig-table th { text-align: left; font-size: 11px; color: #94a3b8; padding-bottom: 10px; border-bottom: 1px solid #f1f5f9; }
    .sig-table td { padding: 12px 0; border-bottom: 1px solid #f1f5f9; }
    .signatory { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; }
    .avatar { width: 24px; height: 24px; background: #007DFE; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; }
    .sig-badge { font-size: 10px; padding: 4px 8px; border-radius: 4px; font-weight: 800; text-transform: uppercase; }
    .pending { background: #fef3c7; color: #92400e; }

    /* Sign-off Section */
    .mck-card { background: white; border-radius: 8px; border: 1px solid #e2e8f0; padding: 25px; }
    .signoff-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 15px; margin-top: 20px; }
    .signoff-card { display: flex; align-items: center; padding: 15px; background: #f8fafc; border-radius: 6px; gap: 15px; }
    .status-dot { width: 10px; height: 10px; background: #10b981; border-radius: 50%; }
    .signoff-info { flex: 1; display: flex; flex-direction: column; }
    .proj-id { font-size: 10px; font-weight: 800; color: #94a3b8; }
    .proj-title { font-size: 13px; font-weight: 700; color: #001E3C; margin: 2px 0; }
    .file-link { font-size: 11px; color: #007DFE; }
    .btn-view { background: white; border: 1px solid #e2e8f0; padding: 6px 10px; border-radius: 4px; font-size: 11px; cursor: pointer; }
  `]
})
export class RepositoryComponent {
  constructor(public gov: GovernanceService) {}

  getTemplates() {
    return this.gov.repositoryDocs.filter(d => d.isTemplate);
  }

  getTemplateCount() {
    return this.getTemplates().length;
  }

  getPendingDocs() {
    // Simulated docs awaiting HOD/Sponsor signature
    return [
      { name: 'PRJ-102 Scope Sign-off', nextSignatory: 'HOD Finance', status: 'Pending' },
      { name: 'Regional Budget Approval', nextSignatory: 'Country Mgr (Kenya)', status: 'Pending' }
    ];
  }

  getPendingCount() {
    return this.getPendingDocs().length;
  }

  viewDoc(url: string | undefined) {
    if (url) alert('Opening audit file: ' + url);
  }
}
