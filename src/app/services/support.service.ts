// src/app/services/support.service.ts
//
// DB-READY: Every method is marked with its future HTTP replacement.
// Swap BehaviorSubject bodies for this.http.post/get calls when backend is live.
// Inbound webhook events from external systems are typed and handled here too.

import { Injectable, signal } from '@angular/core';
import { BehaviorSubject }    from 'rxjs';

// ─── Models ────────────────────────────────────────────────────────────────────

export type TicketStatus   = 'Open' | 'In Progress' | 'Resolved' | 'Closed';
export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type TicketCategory =
  | 'Governance'
  | 'Uploads & Documents'
  | 'Permissions & Access'
  | 'Reports & Analytics'
  | 'Integrations'
  | 'Technical Issue'
  | 'Other';

export interface SupportTicket {
  id:          string;
  title:       string;
  category:    TicketCategory;
  priority:    TicketPriority;
  description: string;
  raisedBy:    string;
  raisedAt:    Date;
  status:      TicketStatus;
  resolvedAt?: Date;
  comments:    string[];
  sourceSystem?: string;   // populated when ticket is auto-raised by an inbound system
}

export interface FaqItem {
  id:       string;
  question: string;
  answer:   string;
  category: TicketCategory;
  helpful?: number;
}

export interface ChatMessage {
  id:      string;
  role:    'user' | 'assistant';
  content: string;
  time:    Date;
}

// Inbound integration models — external systems feeding this portal
export type ConnectorStatus = 'Connected' | 'Degraded' | 'Disconnected';
export type EventType       = 'SYNC' | 'WEBHOOK' | 'FILE_INGEST' | 'ERROR';

export interface InboundConnector {
  id:           string;
  name:         string;
  system:       string;       // e.g. "SAP ERP", "Procurement Portal"
  type:         'Webhook' | 'Poll' | 'File';
  status:       ConnectorStatus;
  lastSync:     Date;
  eventsToday:  number;
  errorRate:    number;       // percentage
  endpoint:     string;       // future: real webhook URL or API base
  description:  string;
}

export interface InboundEvent {
  id:          string;
  connectorId: string;
  type:        EventType;
  payload:     string;
  receivedAt:  Date;
  status:      'Processed' | 'Failed' | 'Pending';
}

// ─── Service ──────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class SupportService {

  // ── Tickets ───────────────────────────────────────────────────────────────

  private readonly _tickets = signal<SupportTicket[]>(this.seedTickets());

  get tickets(): SupportTicket[] { return this._tickets(); }

  // TODO: replace with this.http.post<SupportTicket>('/api/tickets', payload)
  submitTicket(payload: Omit<SupportTicket, 'id' | 'raisedAt' | 'status' | 'comments'>): SupportTicket {
    const ticket: SupportTicket = {
      ...payload,
      id:       `TKT-${String(this._tickets().length + 1).padStart(3, '0')}`,
      raisedAt: new Date(),
      status:   'Open',
      comments: [],
    };
    this._tickets.update(t => [ticket, ...t]);
    return ticket;
  }

  // TODO: replace with this.http.patch<SupportTicket>(`/api/tickets/${id}`, { status })
  updateStatus(id: string, status: TicketStatus): void {
    this._tickets.update(list =>
      list.map(t => t.id === id
        ? { ...t, status, resolvedAt: status === 'Resolved' ? new Date() : t.resolvedAt }
        : t
      )
    );
  }

  getByStatus(status: TicketStatus): SupportTicket[] {
    return this._tickets().filter(t => t.status === status);
  }

  // Called by IntegrationService when an inbound system auto-raises a ticket
  autoRaiseTicket(title: string, description: string, sourceSystem: string): void {
    this.submitTicket({
      title, description, sourceSystem,
      category:    'Integrations',
      priority:    'High',
      raisedBy:    sourceSystem,
    });
  }

  // ── FAQs ──────────────────────────────────────────────────────────────────

  // TODO: replace with this.http.get<FaqItem[]>('/api/faqs')
  readonly faqs: FaqItem[] = [
    { id: 'f01', category: 'Governance',
      question: 'What is phase-gate lock and how does it affect my project?',
      answer: 'Phase-gate lock prevents a project from advancing to the next phase until all required deliverables for the current phase are approved by the HOD. It is enforced automatically when enabled in Settings.' },
    { id: 'f02', category: 'Governance',
      question: 'Who can approve or reject sign-off requests?',
      answer: 'Sign-off requests can be acted on by users with HOD or Admin roles. Editors can submit requests but cannot approve them. Viewers have read-only access.' },
    { id: 'f03', category: 'Uploads & Documents',
      question: 'What file types are allowed for scope documents?',
      answer: 'The portal accepts PDF, DOC, and DOCX files only. Maximum file size is 25 MB per upload as configured in the active policy.' },
    { id: 'f04', category: 'Uploads & Documents',
      question: 'How do I link a scope document to a project?',
      answer: 'Navigate to the Projects page, find your project row, and click the 📎 Link button in the Scope column. Select your file and it will be validated and attached automatically.' },
    { id: 'f05', category: 'Permissions & Access',
      question: 'How do I request elevated access to the portal?',
      answer: 'Raise a support ticket under the Permissions & Access category. Your HOD will receive a notification and can approve the role change from the Settings panel.' },
    { id: 'f06', category: 'Reports & Analytics',
      question: 'Can I export the audit log?',
      answer: 'Yes. Navigate to Settings → Governance Audit Trail and click Export CSV. The file includes timestamps, action types, operators, and details for all recorded events.' },
    { id: 'f07', category: 'Integrations',
      question: 'How do external systems connect to this portal?',
      answer: 'The portal supports three integration patterns: Webhooks (real-time event push), Polling (scheduled data sync), and File Ingestion (structured file drop). Configure connectors from the Support → Connected Systems tab.' },
    { id: 'f08', category: 'Integrations',
      question: 'What happens when an inbound sync fails?',
      answer: 'A Critical ticket is automatically raised in the support queue and the connector status changes to Degraded. The event log in Connected Systems shows the failed payload for diagnosis.' },
    { id: 'f09', category: 'Technical Issue',
      question: 'Why is my progress bar stuck at 0%?',
      answer: 'Progress is calculated from your project start and projected end dates. If both dates are the same or the start date is in the future, progress will show 0%. Update your timeline dates in the Projects table.' },
    { id: 'f10', category: 'Other',
      question: 'How do I contact the system administrator?',
      answer: 'Use the Escalate tab in this Support module to send a direct message to the HOD or IT support team. For urgent issues, use the Critical priority when raising a ticket.' },
  ];

  // ── Chat ──────────────────────────────────────────────────────────────────

  private readonly _chatHistory = signal<ChatMessage[]>([{
    id:      'sys-0',
    role:    'assistant',
    content: 'Hi! I\'m your BA Project Tracker assistant. I can help you with governance processes, uploading documents, understanding your dashboard, or navigating the portal. What do you need?',
    time:    new Date(),
  }]);

  get chatHistory(): ChatMessage[] { return this._chatHistory(); }

  addMessage(role: 'user' | 'assistant', content: string): ChatMessage {
    const msg: ChatMessage = { id: crypto.randomUUID(), role, content, time: new Date() };
    this._chatHistory.update(h => [...h, msg]);
    return msg;
  }

  clearChat(): void {
    this._chatHistory.set([{
      id: crypto.randomUUID(), role: 'assistant', time: new Date(),
      content: 'Chat cleared. How can I help you?',
    }]);
  }

  // ── Integrations ──────────────────────────────────────────────────────────

  private readonly _connectors = signal<InboundConnector[]>(this.seedConnectors());
  private readonly _events     = signal<InboundEvent[]>(this.seedEvents());

  get connectors(): InboundConnector[]  { return this._connectors(); }
  get recentEvents(): InboundEvent[]    { return this._events().slice(0, 20); }

  // TODO: replace with this.http.get<InboundConnector[]>('/api/integrations/connectors')
  getConnectorById(id: string): InboundConnector | undefined {
    return this._connectors().find(c => c.id === id);
  }

  // TODO: replace with this.http.post('/api/integrations/connectors', config)
  registerConnector(config: Omit<InboundConnector, 'id' | 'lastSync' | 'eventsToday' | 'errorRate'>): void {
    const connector: InboundConnector = {
      ...config, id: crypto.randomUUID(),
      lastSync: new Date(), eventsToday: 0, errorRate: 0,
    };
    this._connectors.update(c => [...c, connector]);
  }

  // Simulates receiving an inbound webhook event — replace with real WS/SSE listener
  simulateInboundEvent(connectorId: string, type: EventType, payload: string): void {
    const connector = this.getConnectorById(connectorId);
    const event: InboundEvent = {
      id: crypto.randomUUID(), connectorId, type, payload,
      receivedAt: new Date(),
      status: Math.random() > 0.15 ? 'Processed' : 'Failed',
    };
    this._events.update(e => [event, ...e]);
    if (event.status === 'Failed' && connector) {
      this.autoRaiseTicket(
        `Inbound sync failed: ${connector.name}`,
        `Event type ${type} from ${connector.system} failed to process. Payload: ${payload.slice(0, 120)}...`,
        connector.system
      );
    }
  }

  // ── Seed data ─────────────────────────────────────────────────────────────

  private seedTickets(): SupportTicket[] {
    return [
      { id: 'TKT-001', title: 'Cannot upload scope document — file rejected',
        category: 'Uploads & Documents', priority: 'High', status: 'Open',
        raisedBy: 'James K.', raisedAt: new Date(Date.now() - 3_600_000),
        description: 'Tried uploading the warehouse scope PDF but the portal says file type not allowed. File is definitely a PDF.', comments: [] },
      { id: 'TKT-002', title: 'Request Editor access for Kwame M.',
        category: 'Permissions & Access', priority: 'Medium', status: 'In Progress',
        raisedBy: 'Dr. Amara Osei', raisedAt: new Date(Date.now() - 86_400_000),
        description: 'Kwame needs edit access to update workstream dates.', comments: ['HOD notified, reviewing.'] },
      { id: 'TKT-003', title: 'Procurement Portal sync not updating project status',
        category: 'Integrations', priority: 'Critical', status: 'Open',
        raisedBy: 'Procurement Portal', raisedAt: new Date(Date.now() - 1_800_000),
        description: 'Auto-raised: Inbound webhook from Procurement Portal failed 3 consecutive times.', comments: [],
        sourceSystem: 'Procurement Portal' },
      { id: 'TKT-004', title: 'Audit log export missing last 2 entries',
        category: 'Reports & Analytics', priority: 'Low', status: 'Resolved',
        raisedBy: 'Alice M.', raisedAt: new Date(Date.now() - 172_800_000),
        resolvedAt: new Date(Date.now() - 86_400_000),
        description: 'CSV export from Settings had fewer rows than shown on screen.', comments: ['Fixed in latest deploy — signal mutation now correctly reflected in export.'] },
    ];
  }

  private seedConnectors(): InboundConnector[] {
    return [
      { id: 'CON-01', name: 'Procurement Portal',  system: 'Procurement Portal',
        type: 'Webhook', status: 'Degraded',     lastSync: new Date(Date.now() - 3_600_000),
        eventsToday: 12, errorRate: 25,
        endpoint: '/api/webhooks/procurement',
        description: 'Receives supplier onboarding events and purchase order approvals.' },
      { id: 'CON-02', name: 'SAP ERP Sync',         system: 'SAP ERP',
        type: 'Poll',    status: 'Connected',     lastSync: new Date(Date.now() - 900_000),
        eventsToday: 48, errorRate: 0,
        endpoint: '/api/sync/sap',
        description: 'Polls SAP every 15 minutes for budget actuals and cost centre updates.' },
      { id: 'CON-03', name: 'HR Platform',           system: 'HR Platform',
        type: 'Webhook', status: 'Connected',     lastSync: new Date(Date.now() - 600_000),
        eventsToday: 3, errorRate: 0,
        endpoint: '/api/webhooks/hr',
        description: 'Receives staff assignment changes that affect PM allocations.' },
      { id: 'CON-04', name: 'Regional Budget Portal',system: 'Budget Portal',
        type: 'File',    status: 'Disconnected',  lastSync: new Date(Date.now() - 172_800_000),
        eventsToday: 0, errorRate: 0,
        endpoint: '/api/ingest/budget-files',
        description: 'Ingests quarterly budget files dropped to shared SFTP location.' },
    ];
  }

  private seedEvents(): InboundEvent[] {
    const base = Date.now();
    return [
      { id: 'E01', connectorId: 'CON-02', type: 'SYNC',         receivedAt: new Date(base -  120_000), status: 'Processed', payload: '{"budgetActual":850000,"costCentre":"CC-102"}' },
      { id: 'E02', connectorId: 'CON-01', type: 'WEBHOOK',      receivedAt: new Date(base -  300_000), status: 'Failed',    payload: '{"event":"supplier_onboarded","supplierId":"SUP-041"}' },
      { id: 'E03', connectorId: 'CON-03', type: 'WEBHOOK',      receivedAt: new Date(base -  600_000), status: 'Processed', payload: '{"event":"pm_reassigned","from":"Nadia T.","to":"Omar F."}' },
      { id: 'E04', connectorId: 'CON-02', type: 'SYNC',         receivedAt: new Date(base - 1_200_000),status: 'Processed', payload: '{"budgetActual":420000,"costCentre":"CC-103"}' },
      { id: 'E05', connectorId: 'CON-01', type: 'ERROR',        receivedAt: new Date(base - 1_800_000),status: 'Failed',    payload: '{"error":"timeout","retryCount":3}' },
      { id: 'E06', connectorId: 'CON-02', type: 'SYNC',         receivedAt: new Date(base - 3_600_000),status: 'Processed', payload: '{"budgetActual":1100000,"costCentre":"CC-101"}' },
    ];
  }
}
