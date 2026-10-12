# ROADMAP — Meu Dentinho

Date: [2026-05-14]

## Overview
- Granularity: Coarse (3 phases)
- Mode: mvp

## Summary
- Phases: 3 | Requirements mapped: 9 | All v1 requirements covered ✓

| # | Phase | Goal | Requirements | Success Criteria |
|---|-------|------|--------------|------------------|
| 1 | Core Auth & Profiles | Get users signed up and able to register dependents | AUTH-01, AUTH-02, PROF-01 | 1) User can signup/login 2) User can add a child 3) Session persists |
| 2 | Event Recording & Content | Allow recording dental events, view timeline, and read articles | TEETH-01, HIST-01, CONTENT-01, ADMIN-01 | 1) User records event per tooth 2) Timeline shows events 3) Admin can add article |
| 3 | Predictions & Alerts | Provide deterministic predictions and alerts for out-of-range events | PRED-01, ALRT-01 | 1) Predictions shown for registered children 2) Alerts triggered for defined out-of-range conditions |

## Phase Details

### Phase 1: Core Auth & Profiles
**Goal:** Enable account creation/login and child management so users can start tracking.
**Mode:** mvp
**Requirements:** AUTH-01, AUTH-02, PROF-01
**Success Criteria:**
1. New user can sign up with email/password and log in.
2. Logged-in user can add/edit/remove a child profile.
3. User session persists between app restarts.

### Phase 2: Event Recording & Content
**Goal:** Allow users to record dental events per tooth and consult educational content; provide admin content management.
**Mode:** mvp
**Requirements:** TEETH-01, HIST-01, CONTENT-01, ADMIN-01
**Success Criteria:**
1. User records an event associated with a tooth and date.
2. Timeline shows chronological events per child.
3. Admin UI allows creating and editing articles in-app.

### Phase 3: Predictions & Alerts
**Goal:** Deliver simple deterministic predictions and trigger alerts when events fall outside expected ranges.
**Mode:** mvp
**Requirements:** PRED-01, ALRT-01
**Success Criteria:**
1. App presents expected next-event window for key teeth based on recorded history.
2. Alerts are raised for events outside thresholds and include guidance to seek professional evaluation.

## Risks & Mitigations
- Risk: Prematurely building ML features — Mitigation: start with deterministic rules, collect data for v2.
- Risk: Data privacy concerns — Mitigation: limit stored PII and document retention policies early.

---
*Roadmap generated: 2026-05-14*
