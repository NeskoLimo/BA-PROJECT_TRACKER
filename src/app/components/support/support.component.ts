// src/app/components/support/support.component.ts
import { Component, OnInit, inject, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { CommonModule }   from '@angular/common';
import { FormsModule }    from '@angular/forms';
import { GovernanceService }                                      from '../../services/governance.service';
import { SupportService, SupportTicket, TicketCategory,
         TicketPriority, FaqItem, InboundConnector, InboundEvent } from '../../services/support.service';

@Component({
  selector:   'app-support',
  standalone: true,
  imports:    [CommonModule, FormsModule],
  template: `
<div class="sup">

  <!-- ══ HEADER ══════════════════════════════════════════════════════════════ -->
  <header class="sup-header">
    <div>
      <p class="eyebrow">Help & Governance Support</p>
      <h1>Support Centre</h1>
      <p class="sub">Raise tickets, search the knowledge base, chat with AI, or monitor connected systems.</p>
    </div>
    <div class="hdr-stats">
      <div class="hstat" *ngFor="let s of headerStats">
        <span class="hstat-val" [style.color]="s.color">{{ s.value }}</span>
        <span class="hstat-lbl">{{ s.label }}</span>
      </div>
    </div>
  </header>

  <!-- ══ TABS ════════════════════════════════════════════════════════════════ -->
  <nav class="tabs">
    <button class="tab" [class.active]="activeTab === 'tickets'"  (click)="activeTab = 'tickets'">
      🎫 My Tickets
      <span class="tab-badge" *ngIf="openCount > 0">{{ openCount }}</span>
    </button>
    <button class="tab" [class.active]="activeTab === 'kb'"       (click)="activeTab = 'kb'">📚 Knowledge Base</button>
    <button class="tab" [class.active]="activeTab === 'chat'"     (click)="activeTab = 'chat'; scrollChat()">💬 AI Assistant</button>
    <button class="tab" [class.active]="activeTab === 'systems'"  (click)="activeTab = 'systems'">
      🔌 Connected Systems
      <span class="tab-badge warn" *ngIf="degradedCount > 0">{{ degradedCount }}</span>
    </button>
    <button class="tab" [class.active]="activeTab === 'escalate'" (click)="activeTab = 'escalate'">📞 Escalate</button>
  </nav>

  <!-- ══ TICKETS TAB ══════════════════════════════════════════════════════════ -->
  <div *ngIf="activeTab === 'tickets'" class="tab-body">

    <div class="tk-toolbar">
      <div class="tk-filters">
        <button class="flt" [class.on]="ticketFilter === 'All'"         (click)="ticketFilter = 'All'">All</button>
        <button class="flt" [class.on]="ticketFilter === 'Open'"        (click)="ticketFilter = 'Open'">Open</button>
        <button class="flt" [class.on]="ticketFilter === 'In Progress'" (click)="ticketFilter = 'In Progress'">In Progress</button>
        <button class="flt" [class.on]="ticketFilter === 'Resolved'"    (click)="ticketFilter = 'Resolved'">Resolved</button>
      </div>
      <button class="btn-primary" (click)="showTicketModal = true">+ New Ticket</button>
    </div>

    <!-- Ticket list -->
    <div class="ticket-list">
      <div class="ticket-card" *ngFor="let t of filteredTickets()"
           [class.tc-critical]="t.priority === 'Critical'"
           [class.tc-auto]="!!t.sourceSystem">
        <div class="tc-left">
          <div class="tc-id">{{ t.id }}</div>
          <span class="tc-source" *ngIf="t.sourceSystem" title="Auto-raised by {{ t.sourceSystem }}">⚡ Auto</span>
        </div>
        <div class="tc-body">
          <div class="tc-title">{{ t.title }}</div>
          <div class="tc-meta">
            {{ t.category }} · Raised by {{ t.raisedBy }} · {{ t.raisedAt | date:'d MMM, HH:mm' }}
            <span *ngIf="t.sourceSystem" class="tc-system">via {{ t.sourceSystem }}</span>
          </div>
          <div class="tc-desc">{{ t.description }}</div>
          <div class="tc-comments" *ngIf="t.comments.length > 0">
            <span *ngFor="let c of t.comments">💬 {{ c }}</span>
          </div>
        </div>
        <div class="tc-right">
          <span class="prio-chip" [ngClass]="'prio-' + t.priority.toLowerCase()">{{ t.priority }}</span>
          <span class="status-chip" [ngClass]="'st-' + t.status.toLowerCase().replace(' ', '-')">{{ t.status }}</span>
          <button class="btn-resolve" *ngIf="t.status !== 'Resolved' && t.status !== 'Closed' && gov.isAdmin()"
                  (click)="resolve(t)">Mark Resolved</button>
        </div>
      </div>
      <div class="empty" *ngIf="filteredTickets().length === 0">No tickets match this filter.</div>
    </div>
  </div>

  <!-- ══ KNOWLEDGE BASE TAB ════════════════════════════════════════════════════ -->
  <div *ngIf="activeTab === 'kb'" class="tab-body">
    <div class="kb-search-wrap">
      <span class="kb-search-icon">🔍</span>
      <input class="kb-search" type="text" [(ngModel)]="faqSearch"
             placeholder="Search FAQs — e.g. 'upload', 'permissions', 'gantt'...">
    </div>

    <div class="kb-categories">
      <button class="cat-btn" [class.on]="faqCat === ''" (click)="faqCat = ''">All</button>
      <button class="cat-btn" *ngFor="let c of faqCategories"
              [class.on]="faqCat === c" (click)="faqCat = c">{{ c }}</button>
    </div>

    <div class="faq-list">
      <div class="faq-item" *ngFor="let f of filteredFaqs()"
           [class.open]="openFaq === f.id" (click)="toggleFaq(f.id)">
        <div class="faq-q">
          <span>{{ f.question }}</span>
          <span class="faq-chevron">{{ openFaq === f.id ? '▲' : '▼' }}</span>
        </div>
        <div class="faq-a" *ngIf="openFaq === f.id">
          {{ f.answer }}
          <div class="faq-footer">
            <span class="faq-cat-tag">{{ f.category }}</span>
            <div class="faq-helpful">
              <span>Was this helpful?</span>
              <button (click)="markHelpful(f, $event)">👍</button>
              <button (click)="$event.stopPropagation()">👎</button>
            </div>
          </div>
        </div>
      </div>
      <div class="empty" *ngIf="filteredFaqs().length === 0">
        No FAQs match "{{ faqSearch }}". <button class="link-btn" (click)="activeTab = 'tickets'; showTicketModal = true">Raise a ticket instead →</button>
      </div>
    </div>
  </div>

  <!-- ══ AI CHAT TAB ════════════════════════════════════════════════════════════ -->
  <div *ngIf="activeTab === 'chat'" class="tab-body chat-tab">
    <div class="chat-wrap">
      <div class="chat-messages" #chatBox>
        <div class="chat-msg" *ngFor="let m of support.chatHistory"
             [class.cm-user]="m.role === 'user'"
             [class.cm-ai]="m.role === 'assistant'">
          <div class="cm-avatar">{{ m.role === 'user' ? gov.userInitials() : '🤖' }}</div>
          <div class="cm-bubble">
            <div class="cm-content">{{ m.content }}</div>
            <div class="cm-time">{{ m.time | date:'HH:mm' }}</div>
          </div>
        </div>
        <div class="chat-typing" *ngIf="chatLoading">
          <div class="cm-avatar">🤖</div>
          <div class="cm-bubble"><span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span></div>
        </div>
      </div>

      <div class="chat-suggestions" *ngIf="support.chatHistory.length <= 1">
        <button class="suggest-btn" *ngFor="let s of chatSuggestions" (click)="sendSuggestion(s)">{{ s }}</button>
      </div>

      <div class="chat-input-row">
        <input class="chat-input" type="text" [(ngModel)]="chatInput"
               placeholder="Ask anything about the portal..."
               (keydown.enter)="sendChat()" [disabled]="chatLoading">
        <button class="btn-send" (click)="sendChat()" [disabled]="chatLoading || !chatInput.trim()">
          {{ chatLoading ? '…' : '↑' }}
        </button>
        <button class="btn-clear" (click)="support.clearChat()" title="Clear chat">🗑</button>
      </div>
    </div>

    <div class="chat-sidebar">
      <div class="cs-title">Quick actions</div>
      <button class="cs-btn" *ngFor="let q of quickActions" (click)="sendSuggestion(q)">{{ q }}</button>
      <div class="cs-divider"></div>
      <div class="cs-title">Powered by</div>
      <div class="cs-badge">Claude · Anthropic</div>
      <div class="cs-note">Context-aware of your portal data. Responses are AI-generated — escalate to a human for critical decisions.</div>
    </div>
  </div>

  <!-- ══ CONNECTED SYSTEMS TAB ═════════════════════════════════════════════════ -->
  <div *ngIf="activeTab === 'systems'" class="tab-body">

    <div class="sys-grid">
      <div class="sys-card" *ngFor="let c of support.connectors"
           [class.sys-degraded]="c.status === 'Degraded'"
           [class.sys-down]="c.status === 'Disconnected'">
        <div class="sys-hd">
          <div class="sys-info">
            <div class="sys-name">{{ c.name }}</div>
            <div class="sys-system">{{ c.system }}</div>
          </div>
          <span class="status-dot-lg"
                [style.background]="c.status === 'Connected' ? '#10b981' : c.status === 'Degraded' ? '#f59e0b' : '#ef4444'">
          </span>
        </div>
        <div class="sys-desc">{{ c.description }}</div>
        <div class="sys-meta-row">
          <span class="sys-type-chip">{{ c.type }}</span>
          <span class="sys-stat"><strong>{{ c.eventsToday }}</strong> events today</span>
          <span class="sys-stat err" *ngIf="c.errorRate > 0"><strong>{{ c.errorRate }}%</strong> error rate</span>
        </div>
        <div class="sys-sync">Last sync: {{ c.lastSync | date:'d MMM, HH:mm' }}</div>
        <div class="sys-endpoint">{{ c.endpoint }}</div>
        <div class="sys-actions">
          <button class="btn-sm" (click)="simulateSync(c)">🔄 Simulate Sync</button>
          <button class="btn-sm warn" *ngIf="c.status !== 'Connected'" (click)="raiseConnectorTicket(c)">🎫 Raise Ticket</button>
        </div>
      </div>
    </div>

    <!-- Event log -->
    <div class="panel event-log">
      <div class="panel-hd">
        <span class="panel-title">Recent Inbound Events</span>
        <span class="panel-sub">live event stream · last 20</span>
      </div>
      <table class="ev-table">
        <thead>
          <tr>
            <th>Time</th>
            <th>Connector</th>
            <th>Type</th>
            <th>Payload Preview</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let e of support.recentEvents">
            <td class="ev-time">{{ e.receivedAt | date:'HH:mm:ss' }}</td>
            <td class="ev-conn">{{ getConnectorName(e.connectorId) }}</td>
            <td><span class="ev-type-chip" [ngClass]="'evt-' + e.type.toLowerCase()">{{ e.type }}</span></td>
            <td class="ev-payload">{{ e.payload | slice:0:60 }}{{ e.payload.length > 60 ? '…' : '' }}</td>
            <td><span class="ev-status" [ngClass]="'evs-' + e.status.toLowerCase()">{{ e.status }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- ══ ESCALATE TAB ═══════════════════════════════════════════════════════════ -->
  <div *ngIf="activeTab === 'escalate'" class="tab-body">
    <div class="esc-grid">

      <div class="esc-card">
        <div class="esc-icon">👤</div>
        <div class="esc-title">HOD Direct Line</div>
        <div class="esc-desc">Send a direct message to the Head of Department for urgent governance decisions.</div>
        <button class="btn-primary" (click)="showToast('Message sent to HOD. Expected response within 2 hours.')">Send Message</button>
        <div class="esc-meta">Typical response: 2 hrs · Business hours only</div>
      </div>

      <div class="esc-card">
        <div class="esc-icon">🖥</div>
        <div class="esc-title">IT Support Desk</div>
        <div class="esc-desc">Technical issues, access problems, and system errors. Monitored 24/7.</div>
        <button class="btn-primary" (click)="showToast('IT Support ticket created. Reference: ITS-' + randomRef())">Open IT Ticket</button>
        <div class="esc-meta">SLA: 4 hrs · 24/7 monitoring</div>
      </div>

      <div class="esc-card">
        <div class="esc-icon">📧</div>
        <div class="esc-title">Email Escalation</div>
        <div class="esc-desc">Send a formal escalation email with full audit trail attached automatically.</div>
        <!-- Future: integrate SendGrid / Mailgun here -->
        <button class="btn-primary" (click)="showToast('Escalation email queued. Audit trail attached.')">Send Email</button>
        <div class="esc-meta">Future: SendGrid / Mailgun integration</div>
      </div>

      <div class="esc-card">
        <div class="esc-icon">📅</div>
        <div class="esc-title">Schedule a Call</div>
        <div class="esc-desc">Book a 30-minute review session with your assigned Business Analyst.</div>
        <!-- Future: Calendly / MS Bookings integration -->
        <button class="btn-primary" (click)="showToast('Booking link sent to your email.')">Book Session</button>
        <div class="esc-meta">Future: Calendly / MS Bookings</div>
      </div>

      <div class="esc-card">
        <div class="esc-icon">💬</div>
        <div class="esc-title">Microsoft Teams</div>
        <div class="esc-desc">Post directly to the Governance channel with context from your current session.</div>
        <!-- Future: MS Teams webhook integration -->
        <button class="btn-primary" (click)="showToast('Posted to Governance channel on Teams.')">Post to Teams</button>
        <div class="esc-meta">Future: MS Teams webhook</div>
      </div>

      <div class="esc-card esc-emergency">
        <div class="esc-icon">🚨</div>
        <div class="esc-title">Critical Escalation</div>
        <div class="esc-desc">System-wide issue or data breach. Notifies HOD, IT, and the system administrator simultaneously.</div>
        <button class="btn-danger" (click)="criticalEscalate()">Escalate Critically</button>
        <div class="esc-meta">All channels · Immediate</div>
      </div>

    </div>
  </div>

  <!-- ══ NEW TICKET MODAL ════════════════════════════════════════════════════════ -->
  <div class="overlay" *ngIf="showTicketModal" (click)="showTicketModal = false">
    <div class="modal" (click)="$event.stopPropagation()">
      <div class="modal-hd">
        <h2>Raise a Support Ticket</h2>
        <button class="modal-close" (click)="showTicketModal = false">✕</button>
      </div>
      <div class="modal-body">
        <div class="fg">
          <label>Title *</label>
          <input type="text" [(ngModel)]="newTicket.title" placeholder="Brief description of the issue">
        </div>
        <div class="fg-row">
          <div class="fg">
            <label>Category *</label>
            <select [(ngModel)]="newTicket.category" (change)="onCategoryChange()">
              <option *ngFor="let c of categories" [value]="c">{{ c }}</option>
            </select>
          </div>
          <div class="fg">
            <label>Priority *</label>
            <select [(ngModel)]="newTicket.priority">
              <option *ngFor="let p of priorities" [value]="p">{{ p }}</option>
            </select>
          </div>
        </div>
        <div class="fg">
          <label>Description *</label>
          <textarea [(ngModel)]="newTicket.description" rows="4"
                    placeholder="Describe the issue in detail — what you expected vs what happened..."></textarea>
        </div>
        <!-- Smart FAQ suggestions -->
        <div class="faq-suggestions" *ngIf="suggestedFaqs.length > 0">
          <div class="fs-title">💡 Related FAQs — check these before submitting:</div>
          <div class="fs-item" *ngFor="let f of suggestedFaqs" (click)="previewFaq(f)">
            {{ f.question }}
          </div>
        </div>
        <div class="form-error" *ngIf="ticketError">⚠️ {{ ticketError }}</div>
      </div>
      <div class="modal-ft">
        <button class="btn-sec" (click)="showTicketModal = false">Cancel</button>
        <button class="btn-primary" (click)="submitTicket()">Submit Ticket</button>
      </div>
    </div>
  </div>

  <!-- ══ TOAST ════════════════════════════════════════════════════════════════════ -->
  <div class="toast" *ngIf="toastMsg">{{ toastMsg }}</div>

</div>
  `,
  styles: [`
    /* ── Tokens ──────────────────────────────────────────────────────────── */
    :host {
      --navy:   #001E3C; --blue: #0057FF; --blue-lt: #dbeafe;
      --ink:    #0f172a; --ink-2: #1e293b; --muted: #64748b;
      --border: #e2e8f0; --bg: #f0f4f8; --surface: #ffffff;
      --green: #10b981; --red: #ef4444; --amber: #f59e0b; --sky: #0ea5e9;
      --r: 10px; --sh: 0 1px 3px rgba(0,0,0,.06), 0 4px 20px rgba(0,0,0,.06);
      --font-d: 'Georgia','Times New Roman',serif;
      --font-b: 'Trebuchet MS','Segoe UI',sans-serif;
      --font-m: 'Courier New',monospace;
      display: block; font-family: var(--font-b);
    }

    /* ── Page ────────────────────────────────────────────────────────────── */
    .sup { padding: 28px 32px; background: var(--bg); min-height: 100vh; display: flex; flex-direction: column; gap: 20px; }

    /* ── Header ──────────────────────────────────────────────────────────── */
    .sup-header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 16px; border-bottom: 1px solid var(--border); }
    .eyebrow    { font-size: 10px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: var(--blue); margin: 0 0 4px; }
    h1          { font-family: var(--font-d); font-size: 26px; font-weight: 700; color: var(--navy); margin: 0 0 4px; }
    .sub        { font-size: 13px; color: var(--muted); margin: 0; }
    .hdr-stats  { display: flex; gap: 24px; }
    .hstat      { display: flex; flex-direction: column; align-items: center; }
    .hstat-val  { font-family: var(--font-d); font-size: 28px; font-weight: 700; line-height: 1; }
    .hstat-lbl  { font-size: 10px; color: var(--muted); text-transform: uppercase; letter-spacing: .5px; font-weight: 700; margin-top: 3px; }

    /* ── Tabs ────────────────────────────────────────────────────────────── */
    .tabs       { display: flex; gap: 4px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--r); padding: 6px; width: fit-content; }
    .tab        { padding: 9px 18px; border: none; background: none; border-radius: 7px; font-size: 13px; font-weight: 600; color: var(--muted); cursor: pointer; display: flex; align-items: center; gap: 7px; transition: all .15s; }
    .tab.active { background: var(--navy); color: #fff; }
    .tab:hover:not(.active) { background: #f1f5f9; }
    .tab-badge  { background: var(--red); color: #fff; font-size: 10px; padding: 1px 6px; border-radius: 99px; font-weight: 800; }
    .tab-badge.warn { background: var(--amber); }

    /* ── Tab body ────────────────────────────────────────────────────────── */
    .tab-body { display: flex; flex-direction: column; gap: 16px; }

    /* ── Ticket list ─────────────────────────────────────────────────────── */
    .tk-toolbar  { display: flex; justify-content: space-between; align-items: center; }
    .tk-filters  { display: flex; gap: 6px; }
    .flt         { padding: 6px 14px; border: 1px solid var(--border); border-radius: 20px; background: var(--surface); font-size: 12px; font-weight: 600; color: var(--muted); cursor: pointer; }
    .flt.on      { background: var(--navy); color: #fff; border-color: var(--navy); }

    .ticket-list { display: flex; flex-direction: column; gap: 10px; }
    .ticket-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r); padding: 16px 18px; display: flex; gap: 14px; box-shadow: var(--sh); }
    .ticket-card.tc-critical { border-left: 4px solid var(--red); }
    .ticket-card.tc-auto     { border-left: 4px solid var(--amber); }
    .tc-left     { display: flex; flex-direction: column; align-items: center; gap: 5px; flex-shrink: 0; }
    .tc-id       { font-size: 10px; font-weight: 800; color: var(--muted); font-family: var(--font-m); }
    .tc-source   { font-size: 9px; font-weight: 800; color: var(--amber); background: #fffbeb; padding: 2px 5px; border-radius: 4px; }
    .tc-body     { flex: 1; }
    .tc-title    { font-size: 14px; font-weight: 700; color: var(--ink); margin-bottom: 4px; }
    .tc-meta     { font-size: 11px; color: var(--muted); margin-bottom: 6px; }
    .tc-system   { color: var(--amber); font-weight: 700; }
    .tc-desc     { font-size: 12px; color: var(--ink-2); line-height: 1.5; }
    .tc-comments { margin-top: 6px; display: flex; flex-direction: column; gap: 3px; }
    .tc-comments span { font-size: 11px; color: var(--muted); font-style: italic; }
    .tc-right    { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; flex-shrink: 0; }

    .prio-chip   { font-size: 9px; font-weight: 800; text-transform: uppercase; padding: 3px 8px; border-radius: 4px; }
    .prio-low      { background: #f1f5f9; color: #64748b; }
    .prio-medium   { background: #eff6ff; color: #3b82f6; }
    .prio-high     { background: #fef3c7; color: #92400e; }
    .prio-critical { background: #fef2f2; color: var(--red); }

    .status-chip  { font-size: 9px; font-weight: 800; text-transform: uppercase; padding: 3px 9px; border-radius: 20px; }
    .st-open        { background: #eff6ff; color: #1d4ed8; }
    .st-in-progress { background: #fef3c7; color: #92400e; }
    .st-resolved    { background: #f0fdf4; color: #15803d; }
    .st-closed      { background: #f1f5f9; color: #64748b; }

    .btn-resolve { font-size: 10px; font-weight: 700; color: var(--green); background: #f0fdf4; border: 1px solid #a7f3d0; padding: 4px 9px; border-radius: 5px; cursor: pointer; }
    .btn-resolve:hover { background: #dcfce7; }

    /* ── Knowledge Base ──────────────────────────────────────────────────── */
    .kb-search-wrap { position: relative; }
    .kb-search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); font-size: 14px; }
    .kb-search  { width: 100%; padding: 12px 14px 12px 42px; border: 1px solid var(--border); border-radius: var(--r); font-size: 14px; outline: none; box-sizing: border-box; font-family: var(--font-b); }
    .kb-search:focus { border-color: var(--blue); box-shadow: 0 0 0 3px rgba(0,87,255,.1); }
    .kb-categories { display: flex; gap: 6px; flex-wrap: wrap; }
    .cat-btn    { padding: 6px 13px; border: 1px solid var(--border); border-radius: 20px; background: var(--surface); font-size: 12px; font-weight: 600; color: var(--muted); cursor: pointer; }
    .cat-btn.on { background: var(--blue); color: #fff; border-color: var(--blue); }

    .faq-list   { display: flex; flex-direction: column; gap: 8px; }
    .faq-item   { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r); overflow: hidden; cursor: pointer; transition: border-color .15s; }
    .faq-item:hover { border-color: var(--blue); }
    .faq-item.open  { border-color: var(--blue); }
    .faq-q      { display: flex; justify-content: space-between; align-items: center; padding: 14px 18px; font-size: 14px; font-weight: 600; color: var(--ink); gap: 12px; }
    .faq-chevron { color: var(--muted); font-size: 10px; flex-shrink: 0; }
    .faq-a      { padding: 0 18px 16px; font-size: 13px; color: var(--ink-2); line-height: 1.7; border-top: 1px solid var(--border); }
    .faq-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 12px; padding-top: 10px; border-top: 1px solid #f1f5f9; }
    .faq-cat-tag { font-size: 10px; font-weight: 700; color: var(--blue); background: var(--blue-lt); padding: 2px 8px; border-radius: 4px; }
    .faq-helpful { display: flex; align-items: center; gap: 8px; font-size: 11px; color: var(--muted); }
    .faq-helpful button { background: none; border: 1px solid var(--border); border-radius: 4px; cursor: pointer; padding: 2px 6px; }
    .faq-helpful button:hover { background: #f8fafc; }

    /* ── Chat ────────────────────────────────────────────────────────────── */
    .chat-tab   { flex-direction: row !important; gap: 16px; height: 600px; }
    .chat-wrap  { flex: 1; display: flex; flex-direction: column; background: var(--surface); border: 1px solid var(--border); border-radius: var(--r); overflow: hidden; box-shadow: var(--sh); }
    .chat-messages { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 14px; }
    .chat-msg   { display: flex; gap: 10px; align-items: flex-end; }
    .cm-user    { flex-direction: row-reverse; }
    .cm-avatar  { width: 32px; height: 32px; border-radius: 10px; background: var(--navy); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800; flex-shrink: 0; }
    .cm-ai .cm-avatar { background: #1e293b; font-size: 16px; }
    .cm-bubble  { max-width: 70%; }
    .cm-content { padding: 10px 14px; border-radius: 12px; font-size: 13px; line-height: 1.6; }
    .cm-user .cm-content  { background: var(--blue); color: #fff; border-radius: 12px 12px 2px 12px; }
    .cm-ai   .cm-content  { background: #f1f5f9; color: var(--ink); border-radius: 12px 12px 12px 2px; }
    .cm-time  { font-size: 10px; color: var(--muted); margin-top: 4px; text-align: right; }
    .cm-user .cm-time { text-align: right; } .cm-ai .cm-time { text-align: left; }

    .chat-typing { display: flex; gap: 10px; align-items: flex-end; }
    .chat-typing .cm-bubble { background: #f1f5f9; padding: 12px 16px; border-radius: 12px 12px 12px 2px; display: flex; gap: 5px; }
    .typing-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--muted); animation: blink 1.2s infinite; }
    .typing-dot:nth-child(2) { animation-delay: .2s; }
    .typing-dot:nth-child(3) { animation-delay: .4s; }
    @keyframes blink { 0%,80%,100%{opacity:.2} 40%{opacity:1} }

    .chat-suggestions { padding: 0 16px 10px; display: flex; flex-wrap: wrap; gap: 6px; }
    .suggest-btn { padding: 6px 12px; background: var(--blue-lt); color: var(--blue); border: 1px solid #bfdbfe; border-radius: 20px; font-size: 12px; font-weight: 600; cursor: pointer; }
    .suggest-btn:hover { background: #bfdbfe; }

    .chat-input-row { display: flex; gap: 8px; padding: 14px 16px; border-top: 1px solid var(--border); }
    .chat-input  { flex: 1; padding: 10px 14px; border: 1px solid var(--border); border-radius: 8px; font-size: 13px; outline: none; font-family: var(--font-b); }
    .chat-input:focus { border-color: var(--blue); }
    .btn-send    { width: 38px; height: 38px; background: var(--blue); color: #fff; border: none; border-radius: 8px; font-size: 16px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; }
    .btn-send:disabled { background: var(--border); color: var(--muted); cursor: not-allowed; }
    .btn-clear   { width: 38px; height: 38px; background: #f8fafc; border: 1px solid var(--border); border-radius: 8px; cursor: pointer; font-size: 15px; display: flex; align-items: center; justify-content: center; }

    .chat-sidebar { width: 220px; flex-shrink: 0; display: flex; flex-direction: column; gap: 10px; }
    .cs-title    { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: .8px; color: var(--muted); }
    .cs-btn      { padding: 9px 12px; background: var(--surface); border: 1px solid var(--border); border-radius: 8px; text-align: left; font-size: 12px; color: var(--ink-2); cursor: pointer; font-family: var(--font-b); line-height: 1.4; }
    .cs-btn:hover { border-color: var(--blue); color: var(--blue); }
    .cs-divider  { border-top: 1px solid var(--border); margin: 4px 0; }
    .cs-badge    { display: inline-block; background: var(--navy); color: #fff; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 6px; }
    .cs-note     { font-size: 10px; color: var(--muted); line-height: 1.5; }

    /* ── Connected systems ────────────────────────────────────────────────── */
    .sys-grid   { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 14px; }
    .sys-card   { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r); padding: 18px; box-shadow: var(--sh); }
    .sys-card.sys-degraded { border-top: 3px solid var(--amber); }
    .sys-card.sys-down     { border-top: 3px solid var(--red); opacity: .85; }
    .sys-hd     { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
    .sys-name   { font-size: 14px; font-weight: 700; color: var(--ink); }
    .sys-system { font-size: 11px; color: var(--muted); margin-top: 2px; }
    .status-dot-lg { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; margin-top: 4px; }
    .sys-desc   { font-size: 12px; color: var(--muted); line-height: 1.5; margin-bottom: 10px; }
    .sys-meta-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 6px; }
    .sys-type-chip { font-size: 9px; font-weight: 800; text-transform: uppercase; padding: 2px 7px; border-radius: 4px; background: var(--blue-lt); color: var(--blue); }
    .sys-stat   { font-size: 11px; color: var(--muted); }
    .sys-stat.err { color: var(--red); }
    .sys-sync   { font-size: 10px; color: var(--muted); margin-bottom: 3px; }
    .sys-endpoint { font-size: 10px; color: var(--blue); font-family: var(--font-m); background: #f8fafc; padding: 3px 6px; border-radius: 4px; margin-bottom: 10px; word-break: break-all; }
    .sys-actions { display: flex; gap: 6px; flex-wrap: wrap; }

    /* ── Event log ───────────────────────────────────────────────────────── */
    .panel      { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r); padding: 20px 22px; box-shadow: var(--sh); }
    .panel-hd   { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 14px; }
    .panel-title { font-size: 12px; font-weight: 700; color: var(--ink); text-transform: uppercase; letter-spacing: .8px; }
    .panel-sub  { font-size: 11px; color: var(--muted); }
    .ev-table   { width: 100%; border-collapse: collapse; font-size: 12px; }
    .ev-table th { padding: 8px 10px; font-size: 9px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: .5px; border-bottom: 2px solid var(--border); text-align: left; }
    .ev-table td { padding: 9px 10px; border-bottom: 1px solid #f5f7fa; vertical-align: middle; }
    .ev-table tr:last-child td { border-bottom: none; }
    .ev-time    { font-family: var(--font-m); color: var(--muted); white-space: nowrap; }
    .ev-conn    { font-weight: 700; color: var(--ink-2); }
    .ev-payload { color: var(--muted); font-family: var(--font-m); max-width: 240px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .ev-type-chip { font-size: 9px; font-weight: 800; text-transform: uppercase; padding: 2px 7px; border-radius: 4px; }
    .evt-sync    { background: #eff6ff; color: #1d4ed8; }
    .evt-webhook { background: #f0fdf4; color: #15803d; }
    .evt-file_ingest { background: #fdf4ff; color: #7e22ce; }
    .evt-error   { background: #fef2f2; color: var(--red); }
    .ev-status  { font-size: 9px; font-weight: 800; text-transform: uppercase; padding: 2px 7px; border-radius: 4px; }
    .evs-processed { background: #f0fdf4; color: #15803d; }
    .evs-failed    { background: #fef2f2; color: var(--red); }
    .evs-pending   { background: #fef3c7; color: #92400e; }

    /* ── Escalate ─────────────────────────────────────────────────────────── */
    .esc-grid    { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; }
    .esc-card    { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r); padding: 22px; box-shadow: var(--sh); display: flex; flex-direction: column; gap: 10px; }
    .esc-card.esc-emergency { border: 2px solid var(--red); background: #fff8f8; }
    .esc-icon    { font-size: 28px; }
    .esc-title   { font-size: 15px; font-weight: 700; color: var(--ink); }
    .esc-desc    { font-size: 12px; color: var(--muted); line-height: 1.6; flex: 1; }
    .esc-meta    { font-size: 10px; color: var(--muted); font-style: italic; }

    /* ── Buttons ─────────────────────────────────────────────────────────── */
    .btn-primary { background: var(--navy); color: #fff; border: none; padding: 10px 18px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: var(--font-b); }
    .btn-primary:hover { background: #0a2a50; }
    .btn-danger  { background: var(--red); color: #fff; border: none; padding: 10px 18px; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer; font-family: var(--font-b); }
    .btn-danger:hover { background: #dc2626; }
    .btn-sec     { background: #f8fafc; color: var(--ink); border: 1px solid var(--border); padding: 10px 18px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; }
    .btn-sm      { font-size: 11px; font-weight: 600; padding: 5px 10px; border: 1px solid var(--border); border-radius: 6px; background: #f8fafc; cursor: pointer; }
    .btn-sm:hover { background: #f1f5f9; }
    .btn-sm.warn { color: var(--amber); border-color: var(--amber); }
    .link-btn    { background: none; border: none; color: var(--blue); font-size: 13px; cursor: pointer; font-weight: 600; text-decoration: underline; }

    /* ── Modal ────────────────────────────────────────────────────────────── */
    .overlay     { position: fixed; inset: 0; background: rgba(0,0,0,.4); z-index: 300; display: flex; align-items: center; justify-content: center; }
    .modal       { background: #fff; border-radius: 14px; width: 560px; max-width: 95vw; box-shadow: 0 20px 60px rgba(0,0,0,.2); }
    .modal-hd    { display: flex; justify-content: space-between; align-items: center; padding: 18px 22px; border-bottom: 1px solid var(--border); }
    .modal-hd h2 { margin: 0; font-size: 16px; font-family: var(--font-d); color: var(--ink); }
    .modal-close { background: none; border: none; font-size: 18px; cursor: pointer; color: var(--muted); }
    .modal-body  { padding: 20px 22px; display: flex; flex-direction: column; gap: 14px; }
    .modal-ft    { display: flex; justify-content: flex-end; gap: 10px; padding: 14px 22px; border-top: 1px solid var(--border); }
    .fg          { display: flex; flex-direction: column; gap: 5px; }
    .fg-row      { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .fg label    { font-size: 11px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: .5px; }
    .fg input, .fg select, .fg textarea { padding: 9px 12px; border: 1px solid var(--border); border-radius: 8px; font-size: 13px; color: var(--ink); outline: none; font-family: var(--font-b); }
    .fg input:focus, .fg select:focus, .fg textarea:focus { border-color: var(--blue); }
    .fg textarea { resize: vertical; }
    .faq-suggestions { background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 12px; }
    .fs-title    { font-size: 11px; font-weight: 700; color: #92400e; margin-bottom: 8px; }
    .fs-item     { font-size: 12px; color: #78350f; padding: 5px 8px; border-radius: 5px; cursor: pointer; }
    .fs-item:hover { background: #fef3c7; }
    .form-error  { font-size: 12px; color: var(--red); background: #fef2f2; padding: 8px 12px; border-radius: 6px; }

    /* ── Toast ────────────────────────────────────────────────────────────── */
    .toast       { position: fixed; bottom: 24px; right: 24px; background: var(--navy); color: #fff; padding: 12px 20px; border-radius: 10px; font-size: 13px; font-weight: 600; box-shadow: 0 4px 20px rgba(0,0,0,.2); z-index: 999; animation: slideUp .25s ease; max-width: 360px; }
    @keyframes slideUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }

    .empty       { text-align: center; padding: 40px; color: var(--muted); font-size: 13px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--r); }
  `]
})
export class SupportComponent implements OnInit, AfterViewChecked {
  @ViewChild('chatBox') chatBox!: ElementRef;

  protected readonly gov     = inject(GovernanceService);
  protected readonly support = inject(SupportService);

  activeTab     = 'tickets';
  ticketFilter  = 'All';
  faqSearch     = '';
  faqCat        = '';
  openFaq       = '';
  showTicketModal = false;
  ticketError   = '';
  chatInput     = '';
  chatLoading   = false;
  toastMsg      = '';
  private shouldScrollChat = false;

  readonly categories: TicketCategory[] = [
    'Governance', 'Uploads & Documents', 'Permissions & Access',
    'Reports & Analytics', 'Integrations', 'Technical Issue', 'Other'
  ];
  readonly priorities: TicketPriority[] = ['Low', 'Medium', 'High', 'Critical'];
  readonly faqCategories = [...new Set(this.support.faqs.map(f => f.category))];

  newTicket = { title: '', category: 'Technical Issue' as TicketCategory, priority: 'Medium' as TicketPriority, description: '' };
  suggestedFaqs: FaqItem[] = [];

  readonly chatSuggestions = [
    'How do I upload a scope document?',
    'What does phase-gate lock mean?',
    'How do I export the audit log?',
    'Who can approve sign-offs?',
  ];

  readonly quickActions = [
    'Explain my dashboard metrics',
    'How do I raise a sign-off request?',
    'What integrations are supported?',
    'How do I change my role?',
  ];

  get openCount():    number { return this.support.tickets.filter(t => t.status === 'Open' || t.status === 'In Progress').length; }
  get degradedCount():number { return this.support.connectors.filter(c => c.status !== 'Connected').length; }

  get headerStats() {
    const t = this.support.tickets;
    return [
      { value: t.length,                                            label: 'Total Tickets', color: '#001E3C'   },
      { value: t.filter(x => x.status === 'Open').length,          label: 'Open',           color: '#0057FF'   },
      { value: t.filter(x => x.status === 'Resolved').length,      label: 'Resolved',       color: '#10b981'   },
      { value: this.support.connectors.filter(c => c.status === 'Connected').length,
                                                                    label: 'Systems Live',   color: '#10b981'   },
    ];
  }

  ngOnInit() {}

  ngAfterViewChecked() {
    if (this.shouldScrollChat) { this.scrollChat(); this.shouldScrollChat = false; }
  }

  // ── Tickets ────────────────────────────────────────────────────────────────

  filteredTickets(): SupportTicket[] {
    const all = this.support.tickets;
    return this.ticketFilter === 'All' ? all : all.filter(t => t.status === this.ticketFilter);
  }

  onCategoryChange() {
    this.suggestedFaqs = this.support.faqs.filter(f => f.category === this.newTicket.category).slice(0, 3);
  }

  submitTicket() {
    this.ticketError = '';
    if (!this.newTicket.title.trim())       { this.ticketError = 'Title is required'; return; }
    if (!this.newTicket.description.trim()) { this.ticketError = 'Description is required'; return; }
    this.support.submitTicket({
      title:       this.newTicket.title,
      category:    this.newTicket.category,
      priority:    this.newTicket.priority,
      description: this.newTicket.description,
      raisedBy:    this.gov.currentUser().name,
    });
    this.newTicket = { title: '', category: 'Technical Issue', priority: 'Medium', description: '' };
    this.suggestedFaqs = [];
    this.showTicketModal = false;
    this.showToast('✅ Ticket submitted successfully');
  }

  resolve(t: SupportTicket) {
    this.support.updateStatus(t.id, 'Resolved');
    this.showToast(`✅ ${t.id} marked as Resolved`);
  }

  // ── FAQs ───────────────────────────────────────────────────────────────────

  filteredFaqs(): FaqItem[] {
    return this.support.faqs.filter(f => {
      const matchSearch = !this.faqSearch || f.question.toLowerCase().includes(this.faqSearch.toLowerCase()) || f.answer.toLowerCase().includes(this.faqSearch.toLowerCase());
      const matchCat    = !this.faqCat || f.category === this.faqCat;
      return matchSearch && matchCat;
    });
  }

  toggleFaq(id: string)        { this.openFaq = this.openFaq === id ? '' : id; }
  markHelpful(f: FaqItem, e: Event) { e.stopPropagation(); f.helpful = (f.helpful || 0) + 1; this.showToast('👍 Thanks for the feedback!'); }
  previewFaq(f: FaqItem) { this.showTicketModal = false; this.activeTab = 'kb'; this.faqSearch = f.question.slice(0, 30); this.openFaq = f.id; }

  // ── Chat ───────────────────────────────────────────────────────────────────

  async sendChat() {
    const msg = this.chatInput.trim();
    if (!msg || this.chatLoading) return;
    this.chatInput  = '';
    this.chatLoading = true;
    this.support.addMessage('user', msg);
    this.shouldScrollChat = true;

    try {
      const projects = this.gov.projects;
      const systemContext = `You are the built-in AI assistant for the BA Project Tracker — a governance portal for managing workstreams, budgets, and compliance across an African operations portfolio.

Current portal state:
- Logged in user: ${this.gov.currentUser().name} (${this.gov.currentUser().role})
- Total projects: ${projects.length}
- Critical projects: ${projects.filter(p => p.status === 'Critical').length}
- Active integrations: ${this.support.connectors.filter(c => c.status === 'Connected').length} connected, ${this.support.connectors.filter(c => c.status === 'Degraded').length} degraded
- Open support tickets: ${this.openCount}

Answer helpfully and concisely. If the question is about a specific portal feature, give step-by-step guidance. If it's a governance question, reference the phase-gate process. Keep responses under 120 words unless the question genuinely requires more detail.`;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model:      'claude-sonnet-4-20250514',
          max_tokens: 400,
          system:     systemContext,
          messages:   this.support.chatHistory
            .filter(m => m.role !== 'assistant' || m.id !== 'sys-0')
            .map(m => ({ role: m.role, content: m.content })),
        }),
      });

      const data  = await response.json();
      const reply = data?.content?.[0]?.text ?? 'I couldn\'t generate a response. Please try again or raise a ticket.';
      this.support.addMessage('assistant', reply);
    } catch {
      this.support.addMessage('assistant', 'Connection issue. Please check your network or raise a ticket for technical support.');
    } finally {
      this.chatLoading      = false;
      this.shouldScrollChat = true;
    }
  }

  sendSuggestion(s: string) { this.chatInput = s; this.sendChat(); }

  scrollChat() {
    try { this.chatBox?.nativeElement?.scrollTo({ top: 99999, behavior: 'smooth' }); } catch {}
  }

  // ── Systems ────────────────────────────────────────────────────────────────

  getConnectorName(id: string): string {
    return this.support.getConnectorById(id)?.name ?? id;
  }

  simulateSync(c: InboundConnector) {
    this.support.simulateInboundEvent(c.id, 'SYNC', `{"simulated":true,"connector":"${c.name}","ts":${Date.now()}}`);
    this.showToast(`🔄 Sync event fired for ${c.name}`);
  }

  raiseConnectorTicket(c: InboundConnector) {
    this.support.autoRaiseTicket(
      `${c.name} connection issue`,
      `Connector "${c.name}" (${c.system}) is ${c.status}. Last successful sync: ${c.lastSync.toISOString()}. Error rate: ${c.errorRate}%.`,
      c.system
    );
    this.activeTab = 'tickets';
    this.showToast(`🎫 Ticket raised for ${c.name}`);
  }

  // ── Escalate ───────────────────────────────────────────────────────────────

  criticalEscalate() {
    this.support.submitTicket({
      title:       'CRITICAL ESCALATION — System-wide issue',
      category:    'Technical Issue',
      priority:    'Critical',
      description: `Critical escalation raised by ${this.gov.currentUser().name} at ${new Date().toISOString()}. All channels notified.`,
      raisedBy:    this.gov.currentUser().name,
    });
    this.showToast('🚨 Critical escalation sent to HOD, IT, and system administrator.');
  }

  randomRef() { return Math.floor(Math.random() * 9000) + 1000; }

  // ── Helpers ────────────────────────────────────────────────────────────────

  showToast(msg: string) {
    this.toastMsg = msg;
    setTimeout(() => this.toastMsg = '', 3500);
  }
}
