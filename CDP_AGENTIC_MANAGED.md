# Customer Data Platform — Agentic-Managed

## What It Means

An **agentic-managed CDP** is a Customer Data Platform where **AI agents** orchestrate customer data: ingestion, unification, segmentation, and activation. Instead of manual rules and dashboards only, agents:

- **Observe** — Pull and unify data from all sources into a single customer view  
- **Reason** — Segment, predict churn, identify upsell/win-back opportunities  
- **Act** — Trigger campaigns, sync to ad platforms, update CRM, personalize experiences  
- **Report** — Explain changes and recommend next steps  

Industry direction (Adobe, Salesforce, etc.): CDPs are evolving into **intelligent orchestration layers** that power AI agents across marketing, sales, and service.

---

## Current State — Success Chemistry

### Customer Data Sources (Silos)

| Source | Data | Used For |
|--------|------|----------|
| **Capsule CRM** | Contacts, opportunities, deals | Sales, follow-up |
| **GA4 + Enhanced Conversions** | Events, hashed email/phone/address | Attribution, audiences |
| **PayPal** | Checkout identity, address | Orders, Capsule sync |
| **Zoho / ZIA** | Chat, support, knowledge | Support, product Q&A |
| **Local DB (SQLite)** | Products, orders, subscriptions | Fleet Manager, backend |
| **Cart (localStorage)** | Cart items, session | Upsell, checkout |

### Agent System (Fleet Manager)

- **Fleet Manager** — Overseer: Observe → Reason → Delegate → Act → Report  
- **8 specialized agents** — Subscription, Upsell, Content, Ad, Retention, Trust, Pricing, Overseer  
- **Observe** today: “Collect data from all sources” — but no **single CDP layer**; each agent would hit different systems.

---

## Proposed Architecture — Agentic-Managed CDP

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        FLEET MANAGER (Orchestrator)                      │
│              Observe → Reason → Delegate → Act → Report                  │
└─────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     CDP LAYER (Agentic-Managed)                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │ Ingest      │  │ Unify       │  │ Segment     │  │ Activate    │    │
│  │ Capsule     │  │ Identity    │  │ Churn       │  │ GA4         │    │
│  │ GA4         │  │ Merge       │  │ LTV         │  │ Capsule     │    │
│  │ PayPal      │  │ Profiles    │  │ Upsell      │  │ Email       │    │
│  │ Zoho        │  │             │  │ Win-back    │  │ Ads         │    │
│  │ Local DB    │  │             │  │             │  │             │    │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
                                      │
         ┌────────────────────────────┼────────────────────────────┐
         ▼                            ▼                            ▼
   Capsule API              GA4 / GTM / EC                  Zoho / ZIA
   Local DB                 PayPal Webhooks                 Email / Ads
```

### Roles

1. **CDP layer**  
   - Single place for **unified customer profiles** (identity-merged, cross-source).  
   - **Segments** and **signals** (e.g. churn risk, upsell-ready, win-back) exposed via API.

2. **Fleet Manager**  
   - **Observe**: Calls CDP API for profiles, segments, and key metrics (instead of each agent talking to Capsule/GA4/Zoho separately).  
   - **Delegate**: Tells Retention Agent “win-back segment X”, Upsell Agent “cart + profile”, etc.  
   - **Act**: Agents act through CDP **activation** (e.g. “sync segment to GA4”, “update Capsule”, “trigger flow”).

3. **Managed**  
   - **Governance**: PII handling, hashing for ad platforms, consent.  
   - **Human-in-the-loop**: Critical actions (e.g. big pricing changes, new campaigns) require approval.  
   - **Audit**: Who (which agent) did what, when.

---

## Implementation Phases

### Phase 1 — CDP Core (Unify + Observe)

- [ ] **Ingest**  
  - Sync Capsule contacts → CDP.  
  - Ingest GA4 audiences / Enhanced Conversion events (via BigQuery or GA4 API if available).  
  - Consume PayPal webhooks (purchase, identity) → CDP.  
  - Optional: Zoho contact/support events.
- [ ] **Identity resolution**  
  - Match on email, then phone, then external IDs (PayPal, Capsule, etc.).  
  - Store unified **customer ID** and link all source IDs.
- [ ] **Unified profile API**  
  - `GET /cdp/profiles?segment=...`  
  - `GET /cdp/profiles/:id`  
  - Used by Fleet Manager in **Observe**.

### Phase 2 — Segments + Agent-Ready Signals

- [ ] **Segments**  
  - Definitions: e.g. `churn_risk`, `upsell_ready`, `winback`, `high_ltv`, `new_subscriber`.  
  - Stored in CDP; computed periodically or on events.
- [ ] **Agent-facing API**  
  - Fleet Manager (and each agent) queries segments and profiles via CDP.  
  - **Reason** step uses these instead of raw source-specific queries.

### Phase 3 — Activation + Managed Actions

- [ ] **Activation**  
  - Sync segments to GA4 (audiences).  
  - Update Capsule (tags, custom fields, lists).  
  - Optional: Meta/Google Ads audiences.
- [ ] **Agent actions**  
  - Retention Agent: “Create win-back flow for segment X” → CDP creates segment, triggers activation + email flow.  
  - Upsell Agent: “Recommendations for profile P” → CDP returns profile + rules; agent generates copy.
- [ ] **Governance**  
  - Configurable approval for sensitive actions.  
  - Logging of agent-initiated CDP actions.

### Phase 4 — Full Agentic Loop

- [ ] **Report**  
  - Fleet Manager reports “what agents did” and “what CDP segments/activations changed.”  
- [ ] **Feedback**  
  - Conversion and engagement data fed back into CDP (e.g. from GA4, PayPal) to refine segments and agent strategies.

---

## Tech Options

- **CDP storage**: PostgreSQL or existing SQLite Plus a small service layer; or a managed CDP (e.g. Segment, mParticle) if you prefer not to build.  
- **Identity resolution**: Dedicated lib (e.g. [Apache Griffin](https://griffin.apache.org/)–style) or custom matching rules.  
- **Fleet Manager**: Extend existing **Observe** to call CDP APIs; add **Act** hooks that go through CDP activation.

---

## Summary

| Concept | Meaning |
|--------|---------|
| **CDP** | Single, unified view of customer data across Capsule, GA4, PayPal, Zoho, local DB. |
| **Agentic** | Fleet Manager + 8 agents use CDP to Observe, Reason, Act, Report. |
| **Managed** | Governance, identity/PII handling, human-in-the-loop, and audit. |

Next step: implement **Phase 1** (ingest + identity + profile API), then wire Fleet Manager **Observe** to the CDP.
