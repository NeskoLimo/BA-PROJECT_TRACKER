import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GovernanceService, RepositoryDocument } from '../../services/governance.service';

@Component({
  selector: 'app-repository',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mck-container">
      <div class="mck-header">
        <span class="eyebrow">Document Control Center</span>
        <h1>Governance Repository</h1>
      </div>

      <div class="mck-card shadow">
        <div class="table-header">
          <h3>Sign-off & Download Monitor</h3>
          <button class="mck-btn-outline">Upload New Document</button>
        </div>
        
        <table class="mck-table">
          <thead>
            <tr>
              <th>Document Name</th>
              <th>Category</th>
              <th>Sign-off Status</th>
              <th>Owner</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let doc of gov.repositoryDocs">
              <td>
                <div class="doc-name">
                  <span class="icon">📄</span>
                  <strong>{{ doc.name }}</strong>
                </div>
              </td>
              <td><span class="cat-tag">{{ doc.category }}</span></td>
              <td>
                <span class="status-indicator" [ngClass]="doc.status.toLowerCase()">
                  {{ doc.status }}
                </span>
              </td>
              <td>{{ doc.owner }}</td>
              <td>
                <a [href]="doc.downloadUrl" class="download-link">Download ↓</a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .mck-container { padding: 40px; background: #F5F7F9; min-height: 100vh; font-family: sans-serif; }
    .mck-header { background: #001E3C; color: #FFFFFF; padding: 40px; border-radius: 4px; margin-bottom: 30px; border-bottom: 4px solid #007DFE; }
    .eyebrow { font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #007DFE; font-weight: 700; }
    
    .mck-card { background: #FFFFFF; border-radius: 4px; border: 1px solid #E2E8F0; overflow: hidden; }
    .table-header { padding: 20px 25px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #F1F5F9; }
    .table-header h3 { color: #001E3C; margin: 0; font-size: 18px; }
    
    .mck-table { width: 100%; border-collapse: collapse; }
    .mck-table th { background: #F8FAFC; padding: 15px 25px; text-align: left; font-size: 11px; text-transform: uppercase; color: #64748B; border-bottom: 1px solid #E2E8F0; }
    .mck-table td { padding: 15px 25px; border-bottom: 1px solid #F1F5F9; color: #001E3C; font-size: 14px; }

    .doc-name { display: flex; align-items: center; gap: 10px; }
    .cat-tag { background: #F1F5F9; padding: 2px 8px; border-radius: 4px; font-size: 12px; color: #475569; }
    
    .status-indicator { font-size: 11px; font-weight: 700; text-transform: uppercase; padding: 4px 10px; border-radius: 20px; }
    .status-indicator.approved { background: #ECFDF5; color: #10B981; }
    .status-indicator.pending { background: #FFFBEB; color: #F59E0B; }
    .status-indicator.finalized { background: #EFF6FF; color: #3B82F6; }

    .download-link { color: #007DFE; text-decoration: none; font-weight: 600; font-size: 13px; }
    .mck-btn-outline { border: 1px solid #007DFE; background: transparent; color: #007DFE; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-size: 13px; }
  `]
})
export class RepositoryComponent {
  constructor(public gov: GovernanceService) {}
}
