# Implementation Roadmap — SmeAccounting User Management

**Version:** 1.0  
**Date:** 2026-07-16  
**Status:** Draft — prioritised per regulatory risk, dependency chain, team skill  
**Sources:** `docs/brd/01-user-management-brd.md`, `docs/adr/*`, `docs/standards/05-test-strategy.md`

---

## 1. Strategy

### Value Delivery Order

```
Regulatory Risk ──→ Pre-requisite ──→ Team Skill Growth ──→ Customer Value
```

1. **Compliance-critical first**: TT 99/2025 (audit trail, data integrity) → NĐ 69/2024 (VNeID) → NĐ 254/2026 (e-invoice) → NĐ 23/2025 (digital signature). Regulatory fines increase with time.
2. **Prerequisites before features**: Audit trail interceptor before any data-modifying command. VNeID adapter pattern before real integration. Session management before multi-session.
3. **Skill ramp**: Start with patterns the team knows (EF Core interceptor, middleware). Then build adapter/integration skills with mocks. Finally replace mocks with real integrations.
4. **Tracer bullets**: Each sprint delivers a working, testable increment — never a half-finished module.

---

## 2. Dependency Graph

```
Sprint 1         Sprint 2         Sprint 3-4        Sprint 5-6
────────         ────────         ──────────        ──────────
AuditIntercept ──→ DataAlerts  ──→ ApprovalWorkflow
                     │
SessionTimeout ──→ IPWhitelist
                     │
PasswordPolicy ──→ (standalone)
                     │
VNｅID_Mock   ──────────────────→ VNｅID_Real ──→ Biometric
                     │
            eSigner_Adapter ──→ eInvoice_API ──→ TaxAuthority
                                                    │
                                        RegUpdateMech ←──┘
```

### Blocking Edges

| Task | Blocks | Reason |
|---|---|---|
| AuditInterceptor | DataAlerts, ApprovalWorkflow | Alerts and approvals need audit trail to detect anomalies |
| SessionTimeout | Multi-session enforcement | Need session lifecycle before enforcing limits |
| VNeID Mock | VNeID Real, Biometric | Mock provides test harness for real integration |
| eSigner Adapter | eInvoice API, TaxAuthority | Digital signature required for e-invoice and tax submission |
| VNeID Real | Biometric | Biometric builds on VNeID identity verification |

---

## 3. Phase Roadmap

### Phase 0: Foundation (Sprint 0 — DONE)

| Task | Status | Evidence |
|---|---|---|
| .editorconfig + Directory.Build.props | ✅ Fixed | `/.editorconfig`, `/Directory.Build.props` |
| Analyzer packages (Sonar/Meziantou/Roslynator) | ✅ Fixed | In `Directory.Build.props` |
| Architecture tests (NetArchTest) | ✅ Implemented | `tests/SmeAccounting.Architecture.Tests/` — 7 rules |
| Domain unit tests (Money, User, Account, JournalEntry) | ✅ Implemented | `tests/SmeAccounting.Domain.UnitTests/` — 52 tests |
| Coding standards documents | ✅ Delivered | `docs/standards/01-07-*.md` |
| BRD + ADR + Glossary | ✅ Delivered | `docs/brd/`, `docs/adr/`, `docs/domain/` |

---

### Phase 1: Regulatory Foundation (Sprint 1-2)

**Goal:** Achieve minimum regulatory compliance for PROD (audit trail, session control, configurable policy).  
**Skills:** Backend (.NET), EF Core, Security  
**Risk:** CRITICAL — regulatory non-compliance fines

#### T1: AuditSaveChangesInterceptor ⚡ HIGHEST PRIORITY

| Attribute | Detail |
|---|---|
| **Why** | TT 99/2025 Điều 28 — corrections must leave audit trail. PROD blocker. |
| **What** | EF Core `SaveChangesInterceptor` captures OldValues + NewValues on every entity change. Writes `AuditEntity` records. |
| **Files** | New: `Infrastructure/Persistence/Interceptors/AuditSaveChangesInterceptor.cs`  
| | New: `Infrastructure/DependencyInjection.cs` registration  
| | Test: `SmeAccounting.IntegrationTests/Audit/AuditSaveChangesInterceptorTests.cs` |
| **Skill** | Senior Backend — EF Core interceptors, change tracking |
| **Test** | Integration: real DB create → modify → verify audit record captures old/new values |
| **Dependency** | None |
| **Definition of Done** | Every `SaveChangesAsync` on `ApplicationDbContext` auto-creates `AuditEntity` rows. Integration test proves it. |

#### T2: Configurable Session Timeout

| Attribute | Detail |
|---|---|
| **Why** | NĐ 69/2024 requires session management. Current JWT has hardcoded 15min expiry. |
| **What** | `SessionSettings` per company + middleware validates token lifetime. Extend `RefreshToken` with device info + last activity. |
| **Files** | New: `Domain/Security/SessionSettings.cs`  
| | New: `Infrastructure/Persistence/Configurations/SessionSettingsConfiguration.cs`  
| | Modified: `Web/Middleware/SessionValidationMiddleware.cs` |
| **Skill** | Backend — JWT, middleware |
| **Test** | Integration: set short timeout → wait → verify 401 on stale token |
| **Dependency** | None |
| **Definition of Done** | Admin can configure session timeout per company. Expired sessions rejected. |

#### T3: Configurable Company PasswordPolicy

| Attribute | Detail |
|---|---|
| **Why** | `PasswordPolicy` is hardcoded. NĐ 69/2024 requires per-company password rules. |
| **What** | Move `PasswordPolicy` to DB entity per company. Admin UI to configure. |
| **Files** | New: `Domain/Entities/CompanyPasswordPolicy.cs`  
| | Modified: `Domain/Security/PasswordPolicy.cs` → load from DB  
| | New: `Infrastructure/Persistence/Configurations/CompanyPasswordPolicyConfiguration.cs` |
| **Skill** | Backend — EF Core, configuration |
| **Test** | Integration: create company with custom policy → verify enforcement |
| **Dependency** | None |
| **Definition of Done** | Each company has independent password policy. Tests prove isolation. |

#### T4: IP Whitelist / Geo-Restriction Middleware

| Attribute | Detail |
|---|---|
| **Why** | Login tracks IP but no restriction. Audit requirement. |
| **What** | Middleware checks request IP against company whitelist. Geo-blocking via MaxMind GeoLite2. |
| **Files** | New: `Web/Middleware/IpRestrictionMiddleware.cs`  
| | New: `Domain/Entities/IpWhitelistEntry.cs` |
| **Skill** | Backend — middleware, geolocation |
| **Test** | Integration: whitelisted IP passes → blocked IP gets 403 |
| **Dependency** | T2 (SessionTimeout) — session depends on knowing client IP |
| **Definition of Done** | Companies can whitelist IP ranges. Non-whitelisted IPs blocked at middleware. |

---

### Phase 2: External Integration Adapters (Sprint 3-4)

**Goal:** Build mock integration for all external systems. Enable parallel frontend development.  
**Skills:** Backend (.NET), API design, Adapter pattern  
**Risk:** HIGH — external API changes require adapter updates

#### T5: VNeID Mock Integration + Adapter Pattern

| Attribute | Detail |
|---|---|
| **Why** | NĐ 69/2024 mandates VNeID for tax e-transactions. Mock enables parallel dev. |
| **What** | Adapter interface `IVNeIDService` + mock implementation returning canned responses. Real implementation in Phase 3. |
| **Files** | New: `Domain/Interfaces/IVNeIDService.cs`  
| | New: `Infrastructure/VNeID/MockVNeIDService.cs`  
| | New: `Infrastructure/VNeID/VNeIDOptions.cs`  
| | ADR: `docs/adr/01-vneid-integration.md` defined |
| **Skill** | Backend — adapter pattern, HTTP client |
| **Test** | Contract: WireMock.NET verifies request/response shape. Integration: mock returns expected identity data. |
| **Dependency** | T1 (AuditInterceptor) — VNeID identity verification must be audited |
| **Definition of Done** | Login flow can verify identity via VNeID mock. Response schema matches real API spec. |

#### T6: Digital Signature Module (eSigner Adapter)

| Attribute | Detail |
|---|---|
| **Why** | NĐ 23/2025 requires digital signature on tax declarations. |
| **What** | Adapter interface `IDigitalSignatureService` + mock. Sign document, verify signature. |
| **Files** | New: `Domain/Interfaces/IDigitalSignatureService.cs`  
| | New: `Infrastructure/ESigner/MockESignerService.cs`  
| | ADR: `docs/adr/02-digital-signature-module.md` defined |
| **Skill** | Backend — PKI, HSM, REST API |
| **Test** | Contract: verify signature request/response. Integration: sign document → verify signature. |
| **Dependency** | T1 (AuditInterceptor) — signature operations must be audited |
| **Definition of Done** | Document can be signed and verified via mock adapter. |

#### T7: E-Invoice Connection API

| Attribute | Detail |
|---|---|
| **Why** | NĐ 254/2026/NĐ-CP mandates e-invoice XML submission. Effective 01/07/2026. |
| **What** | E-invoice XML generation per NĐ 254 format. Adapter to e-invoice provider API. |
| **Files** | New: `Domain/Interfaces/IEInvoiceService.cs`  
| | New: `Infrastructure/EInvoice/MockEInvoiceService.cs`  
| | New: `Infrastructure/EInvoice/InvoiceXmlBuilder.cs` |
| **Skill** | Backend — XML/XSD, REST API |
| **Test** | Contract: XML validates against NĐ 254 XSD. Integration: submit → verify accepted. |
| **Dependency** | T6 (Digital Signature) — e-invoice must be signed |
| **Definition of Done** | Valid e-invoice XML generated and submitted via mock provider. XSD validation passes. |

#### T8: Data-Manipulation Alerts

| Attribute | Detail |
|---|---|
| **Why** | TT 99/2025 Điều 28 — software must detect and alert on data tampering. |
| **What** | Background job compares audit trail checksums. Alert on mismatch (direct DB modification). |
| **Files** | New: `Infrastructure/Audit/DataIntegrityChecker.cs`  
| | New: `Infrastructure/BackgroundJobs/DataIntegrityJob.cs` |
| **Skill** | Backend — background jobs, checksums |
| **Test** | Integration: modify DB directly → verify alert raised. |
| **Dependency** | T1 (AuditInterceptor) — provides the baseline audit trail to check against |
| **Definition of Done** | Scheduled job detects unauthorized DB modifications. Alert generated. |

---

### Phase 3: Business Logic (Sprint 5-6)

**Goal:** Approval workflow for critical accounting operations.  
**Skills:** Backend (.NET), Domain modeling, Workflow  
**Risk:** MEDIUM — workflow state machine complexity

#### T9: Approval Workflow

| Attribute | Detail |
|---|---|
| **Why** | Luật Kế toán requires dual approval for critical entries. |
| **What** | Workflow state machine: Draft → PendingApproval → Approved/Rejected. Role-based approval routing. |
| **Files** | New: `Domain/Workflow/ApprovalWorkflow.cs`  
| | New: `Application/Workflow/Commands/SubmitForApprovalCommand.cs`  
| | New: `Application/Workflow/Commands/ApproveCommand.cs` |
| **Skill** | Senior Backend — state machine, DDD |
| **Test** | Domain: state transitions, auth checks. Integration: full approve → reject → re-submit flow. |
| **Dependency** | T1 (AuditInterceptor), T8 (DataAlerts) |
| **Definition of Done** | Journal entry requires N approvals based on amount. Valid state transitions enforced. Audit trail captured. |

---

### Phase 4: Production Integration (Sprint 7-8)

**Goal:** Replace mocks with real integrations. Production-grade security.  
**Skills:** Backend (.NET), DevOps, Security  
**Risk:** HIGH — external API reliability, latency, circuit breakers

#### T10: Full VNeID / National Digital Identity Integration

| Attribute | Detail |
|---|---|
| **Why** | Replace mock with real VNeID API. Production auth. |
| **What** | Real `VNeIDService` calls VNeID API. Circuit breaker, retry, logging. |
| **Files** | New: `Infrastructure/VNeID/VNeIDService.cs`  
| | Config: `appsettings.json` VNeID endpoints + credentials |
| **Skill** | Backend — Polly, HttpClientFactory, security |
| **Test** | Contract: full request/response against VNeID sandbox. |
| **Dependency** | T5 (VNeID Mock) |
| **Definition of Done** | Real VNeID identity verification. Circuit breaker on API failure. |

#### T11: Biometric Verification

| Attribute | Detail |
|---|---|
| **Why** | Legal representatives require biometric verification per NĐ 69/2024. |
| **What** | Biometric SDK integration (fingerprint/facial). Store biometric hash, not image. |
| **Files** | New: `Domain/Interfaces/IBiometricService.cs`  
| | New: `Infrastructure/Biometric/BiometricService.cs` |
| **Skill** | Backend — biometric SDK, secure hash |
| **Test** | Integration: enroll → verify → reject non-match. |
| **Dependency** | T10 (VNeID Real) — biometric links to VNeID identity |
| **Definition of Done** | Legal rep can register biometric. Critical operations require biometric confirmation. |

#### T12: Tax Authority System Integration

| Attribute | Detail |
|---|---|
| **Why** | eTax, customs, social insurance data exchange. |
| **What** | Adapter per tax authority: eTax (monthly declaration), customs, social insurance. XML/TXML format. |
| **Files** | New: `Infrastructure/TaxAuthority/TaxService.cs`  
| | New: `Infrastructure/TaxAuthority/TaxXmlBuilder.cs` |
| **Skill** | Backend — XML, government API |
| **Test** | Contract: XML validates per tax authority schema. Integration: submit declaration → verify response. |
| **Dependency** | T6 (Digital Signature), T7 (E-Invoice) |
| **Definition of Done** | Monthly tax declaration submitted automatically. Submission receipts stored. |

#### T13: Regulatory Update Mechanism

| Attribute | Detail |
|---|---|
| **Why** | Vietnamese regulations change frequently. System must adapt without code deploy. |
| **What** | Config-driven rule engine. Tax rates, thresholds, form templates in DB. Admin UI to update. |
| **Files** | New: `Domain/Rules/RegulatoryRule.cs`  
| | New: `Infrastructure/Rules/RegulatoryRuleEngine.cs` |
| **Skill** | Backend — rules engine, configuration |
| **Test** | Integration: change tax rate in DB → verify new rate used in calculation. |
| **Dependency** | T12 (Tax Integration) — provides the context for rules |
| **Definition of Done** | Tax rates, report templates, and validation rules configurable without code change. |

---

## 4. Skills Allocation Matrix

| Task | Primary Skill | Secondary Skill | Team |
|---|---|---|---|
| T1 Auditing | EF Core Interceptors | — | Dev 1 (Senior) |
| T2 Session | JWT, Middleware | Security | Dev 2 |
| T3 PasswordPolicy | EF Core, Configuration | Admin UI | Dev 2 |
| T4 IP Whitelist | Middleware, GeoIP | DevOps | Dev 2 |
| T5 VNeID Mock | Adapter Pattern | REST API | Dev 1 |
| T6 eSigner | PKI, HSM | REST API | Dev 1 (Senior) |
| T7 E-Invoice | XML/XSD | REST API | Dev 3 |
| T8 DataAlerts | Background Jobs | — | Dev 2 |
| T9 Approval | State Machine, DDD | CQRS | Dev 1 (Senior) |
| T10 VNeID Real | Polly, HttpClient | Security | Dev 1 |
| T11 Biometric | SDK Integration | Security | Dev 1 + Security |
| T12 Tax API | XML, Government API | — | Dev 3 |
| T13 Rules Engine | Rules Engine | Admin UI | Dev 2 |

---

## 5. Risk Management

| Risk | Phase | Mitigation |
|---|---|---|
| External API changes (VNeID, eTax) | P2, P4 | Adapter pattern with mocks. Version pinning. Contract tests in CI. |
| Regulatory deadline (NĐ 254 01/07/2026) | P2 | T7 must complete by 30/06/2026. Penalty for non-compliance. |
| Biometric SDK vendor lock-in | P4 | Interface with multiple SDK support. SPDX/SBOM tracking. |
| Team lacks PKI experience | P2 | T6 assigned to Senior. Training budget. External PKI consultant. |
| Scope creep (13 tasks in 8 sprints) | All | Each task has strict Definition of Done. Defer non-blocking features to Phase 5. |

---

## 6. Acceptance Gates per Phase

### Phase 1 → Phase 2 Gate
- [ ] Audit trail verified in integration test (all entity types)
- [ ] Session timeout enforcement passing
- [ ] Company PasswordPolicy isolated and testable
- [ ] IP whitelist working
- [ ] Code coverage ≥ 75%
- [ ] 0 critical architecture violations

### Phase 2 → Phase 3 Gate
- [ ] VNeID adapter contract test passing against mock
- [ ] Digital signature sign/verify cycle proven
- [ ] E-invoice XML validates against NĐ 254 XSD
- [ ] Data integrity alert detects DB tampering
- [ ] All mocks swappable via DI registration

### Phase 3 → Phase 4 Gate
- [ ] Approval workflow covers all required accounting operations
- [ ] Workflow state machine tested for all transitions
- [ ] Dual-control enforced for critical entries

### Phase 4 → PROD Gate
- [ ] Real VNeID integration tested against sandbox
- [ ] Biometric enroll/verify cycle tested
- [ ] Tax authority submission receipt verified
- [ ] Regulatory rule update propagates without deploy
- [ ] Penetration test passed
- [ ] Compliance audit passed
- [ ] Load test within SLA

---

## 7. Delivery Schedule Summary

| Phase | Sprints | Tasks | Team | Target Date |
|---|---|---|---|---|
| 0 — Foundation | 0 | Standards, tests, config | All | Done |
| 1 — Regulatory | 1-2 | T1, T2, T3, T4 | Dev 1 + 2 | Sprint 2 |
| 2 — Adapters | 3-4 | T5, T6, T7, T8 | Dev 1 + 3 | Sprint 4 |
| 3 — Workflow | 5-6 | T9 | Dev 1 | Sprint 6 |
| 4 — Production | 7-8 | T10, T11, T12, T13 | All | Sprint 8 |
