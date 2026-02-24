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

  // --- UI State ---
  public toastMsg = signal<string>('');
  public toastErr = signal<boolean>(false);
  public searchQuery = signal<string>('');

  // --- Analytics & Mass Upload State ---
  // Signals to handle your mass upload templates and filters
  public myPendingRequests = signal<any[]>([]); 

  // --- Fixed: Computed signals to prevent NG5002 Parser Errors ---
  
  /**
   * Refined logic for line 144: Extracts labels for review
   * This removes the .map() and arrow function from the template.
   */
  public pendingFieldsText = computed(() => {
    const requests = this.myPendingRequests();
    if (!requests.length) return 'No pending updates';
    return requests.map(r => r.fieldLabel).join(', ');
  });

  /**
   * Filtered Audit Log for the table at line 572
   * Enables the search/filter criteria requested for analytics enrichment.
   */
  public filteredAudit = computed(() => {
    const log = this.gov.auditLogSig();
    const query = this.searchQuery().toLowerCase();
    if (!query) return log;
    return log.filter(e => 
      e.details.toLowerCase().includes(query) || 
      e.user.toLowerCase().includes(query)
    );
  });

  constructor() {}

  ngOnInit(): void {
    // Initial data load if needed
  }

  // --- Methods ---

  /**
   * Triggers the CSV Export for analytics.
   * Leverages the service implementation that includes Start/End dates.
   */
  public handleExport(): void {
    try {
      this.gov.exportAsCsv();
      this.showToast('Export successful', false);
    } catch (err) {
      this.showToast('Export failed', true);
    }
  }

  /**
   * Mass Upload Trigger
   */
  public onTemplateUpload(event: Event): void {
    const element = event.currentTarget as HTMLInputElement;
    let fileList: FileList | null = element.files;
    if (fileList) {
      this.showToast(`Processing ${fileList[0].name}...`, false);
      // Logic for parsing template and calling gov.uploadProjects()
    }
  }

  private showToast(msg: string, isErr: boolean): void {
    this.toastMsg.set(msg);
    this.toastErr.set(isErr);
    setTimeout(() => this.toastMsg.set(''), 3000);
  }
}
