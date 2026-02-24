import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GovernanceService, Project, AuditEntry } from '../../services/governance.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  protected gov = inject(GovernanceService);

  // --- UI & Analytics State ---
  public toastMsg = signal<string>('');
  public toastErr = signal<boolean>(false);
  public searchQuery = signal<string>('');
  
  // Mocking pending requests structure for the build fix
  public myPendingRequests = signal<{fieldLabel: string}[]>([]); 

  // --- Fixed: Computed Signals for Template Logic ---
  
  /**
   * Fixes NG5002: Moves array mapping out of the template.
   * This provides a clean string of fields under review.
   */
  public pendingFieldsText = computed(() => {
    const requests = this.myPendingRequests();
    return requests.length > 0 
      ? requests.map(r => r.fieldLabel).join(', ') 
      : 'No pending changes';
  });

  /**
   * Professional Portfolio Audit filtering.
   * Leveraged for C-suite reporting and variance diagnostics.
   */
  public filteredAudit = computed(() => {
    const log = this.gov.auditLogSig();
    const query = this.searchQuery().toLowerCase();
    if (!query) return log;
    return log.filter(e => 
      e.details.toLowerCase().includes(query) || 
      e.user.toLowerCase().includes(query) ||
      e.action.toLowerCase().includes(query)
    );
  });

  constructor() {}

  ngOnInit(): void {}

  // --- Service Actions ---

  public handleExport(): void {
    try {
      this.gov.exportAsCsv();
      this.showToast('Analytics Exported Successfully', false);
    } catch (err) {
      this.showToast('Export Failed', true);
    }
  }

  private showToast(msg: string, isErr: boolean): void {
    this.toastMsg.set(msg);
    this.toastErr.set(isErr);
    setTimeout(() => this.toastMsg.set(''), 3000);
  }
}
