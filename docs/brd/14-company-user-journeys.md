# User Journeys — Company Module

---

## UJ-01: New Company Setup — Chief Accountant (Kế toán trưởng)

**Persona:** Trần Thị Mai — Chief Accountant, 15 years experience

- **Role:** Kế toán trưởng at newly established LLC (Công ty TNHH 2TV)
- **Experience Level:** Expert — certified chief accountant, previously used MISA and Fast Accounting
- **Goals:**
  - Get accounting system operational within 2 days
  - Configure all settings correctly per TT 99/2025/TT-BTC from day one
  - Invite team members with appropriate permissions
  - Avoid setup mistakes that cause reconciliation issues later
- **Pain Points:**
  - Previous system (MISA) had rigid setup that couldn't be corrected mid-year
  - Had to re-enter data when company type was wrong in legacy system
  - No VSIC code lookup — had to manually type business lines
  - Couldn't add second legal rep; system only supported one

### Journey Map

```
Phase          Touchpoints                     Emotion     Mai's Actions               System Responses
──────         ───────────                     ───────     ─────────────               ───────────────
Discovery      Google search, referral         😰 Anxious  Researches cloud            Landing page shows
(Pre-Day 1)    from accountant network         (worried    accounting for SMEs,        features, pricing,
                                               about cost) compares 3 vendors          compliance badges

Registration   Admin → Companies → Create      😐 Neutral  Clicks "Create Company"     Empty form with 12 fields:
(Day 1 AM)                                                              Name, TaxCode, Address...

Step 1:        Company creation form           😤 Frustrated Enters company name        No CompanyType dropdown.
Identity                                                     "Công ty TNHH Sản Xuất      Single text field for name
                                                             & Thương Mại Mai Anh"       only — no separate
                                                             Enters TaxCode:              Vietnamese/English name.
                                                             0123456789                   No enterprise code field.
                                                             Skips fields (only 12       No charter capital input.
                                                             shown)

Step 2:        Company settings                😠 Angry     Sets fiscal year Jan-Dec     Settings form has 7 fields.
Settings                                        (can't find  Selects VND, 2 decimals     No AccountingRegime toggle
                                                accounting   TaxMethod = "Khấu trừ"       (TT99 vs TT133).
                                                regime)                                  No inventory method enum.
                                                                                         No rounding method.

Step 3:        Legal rep section               😡 Very     Enters "Trần Thị Mai"         Single text field
Legal Rep                                      frustrated   as legal rep                 LegalRepresentative.
                                                             Position: "Giám đốc"         Can't add co-founder as
                                                                                         second legal rep.
                                                                                         No VNeID field.

Step 4:        Save & continue                 🤔 Confused Clicks Save                  Company created with 12
Save                                                         fields. Missing: enterprise
                                                             code, company type, charter
                                                             capital, business lines,
                                                             bank accounts.

Day 1 PM:      Discovers limitations            😤 Frustrated Calls support: "Why no       Support confirms:
Realization                                              company type selection? My      "Company type feature not
                                                         accounting regime is locked     implemented. Workaround:
                                                         to wrong chart of accounts!"    manual notes in description."

Day 2:         Workaround                        😌 Relieved Support provides manual     Partial fix: added
Support                                                                                  CompanyType field as free
                                                                                         text, not enum validation.

Day 3:         Invite team                      😐 Neutral  Invites 3 accountants        Email sent with login.
                                                                                         No role-based permissions
                                                                                         per module.

Day 5:         Start GL operations              😊 Satisfied Begins posting first        GL module works with basic
                                                (despite    journal entries. Uses flat    company info. All future
                                                limitations) chart of accounts.          corrections will need
                                                                                         manual migration.
```

### Step-by-Step Narrative

1. **Registration Initiation:** Mai clicks "Create Company" from Admin panel. System shows an empty form with 12 basic fields (Name, TaxCode, Address, Phone, Email, Website, LegalRepresentative, RepPosition, LogoUrl).

2. **Identity Data Entry:** Mai enters company name "Công ty TNHH Sản Xuất & Thương Mại Mai Anh" and tax code "0123456789". System validates tax code format (10 digits) and uniqueness. Missing: enterprise code field (mã doanh nghiệp), company type selector, charter capital input, Vietnamese/English name split.

3. **Settings Configuration:** Mai navigates to Settings tab. System shows FiscalYearStartMonth, CurrencyCode (default VND), DecimalPlaces (default 2), InventoryMethod (free text), TaxMethod (free text), EnableMultiCurrency, EnableDepartmentManagement. Mai sets fiscal year to January, keeps VND, enters "Khấu trừ" for tax method. Missing: AccountingRegime toggle (TT99 vs TT133) — system defaults to undefined regime, causing downstream chart-of-accounts mismatch.

4. **Legal Representative:** Mai enters her own name and position. System accepts single text field. Mai wants to add her co-founder as second legal rep (LLC 2TV requires it per Luật DN 2020 Điều 12-13). No "Add Legal Representative" button exists. No VNeID number field.

5. **Save and Proceed:** System creates company with partial data. Missing critical fields: company type (defaults to unknown), enterprise code (blank), charter capital (0), business lines (empty), bank accounts (empty), accounting regime (undefined).

6. **Support Call:** Mai contacts support. Told that company type feature is not implemented. Workaround: add note in description field. Accounting regime cannot be changed without database migration once entries exist.

7. **Team Invitation:** Mai uses User management to add 3 accountants. System sends invite emails. No role-per-module granularity — everyone gets blanket permissions.

8. **Go-Live:** Mai starts posting journal entries using default chart of accounts. All future corrections will require manual migration once proper company model is implemented.

### Pain Points & Opportunities

| Step | Pain Point | Severity | Opportunity |
|------|-----------|----------|-------------|
| Identity | No enterprise code field | **Critical** | Add mã doanh nghiệp field (10-digit, validated per NĐ 168/2025) |
| Identity | No company type selector | **Critical** | Add CompanyType enum dropdown (LLC1, LLC2, JSC, DNTN, etc.) |
| Identity | No charter capital field | **Critical** | Add charter capital + paid-in capital with contributor tracking |
| Identity | Single name field only | Medium | Split NameVietnamese, NameEnglish, AbbreviatedName |
| Settings | No AccountingRegime selection | **Critical** | Add TT99/TT133 toggle — drives chart of accounts and report templates |
| Settings | No inventory method enum | High | Replace free text with VAS 02 enum (FIFO, BQGQ, TDD, NX XS) |
| Settings | No rounding method | Medium | Add RoundingMethod enum for VND conversion |
| Settings | Decimal places default 2 (VND is integer) | High | Default to 0 per TT 99/2025 Điều 10 |
| Legal Rep | Single text field only | **Critical** | Add LegalRepresentative entity (1..N with typed fields) |
| Legal Rep | No VNeID field | **Critical** | Add VNeID number (12-digit) format validation |
| Legal Rep | No authorization scope | High | Add IsPrimary flag + AuthorizationScope per Điều 13 |
| Business Lines | Not collected at setup | Medium | Add BusinessLine entity with VSIC code hierarchy browser |
| Bank Accounts | Not collected at setup | High | Add CompanyBankAccount entity with tax payment flag |
| Team | No role-per-module permissions | Medium | Implement granular permission model per module |
| Onboarding | No step wizard | Medium | Build multi-step onboarding: Identity → LegalReps → Lines → Settings → Bank → Invite |

**Emotional Arc:** Anxious (pre-purchase) → Frustrated (missing fields) → Angry (settings gap) → Relieved (workaround) → Accepting (starts using despite gaps)

**NPS Impact:** Would not recommend to peers — too many missing fields. Would wait for full company module before onboarding a client.

---

## UJ-02: Company Info Update — Company Admin

**Persona:** Nguyễn Văn An — Company Admin at Công ty TNHH Thương Mại & Dịch Vụ Bình Minh

- **Role:** Office Manager / Admin — handles company registration, legal documents, user management
- **Experience Level:** Intermediate — 5 years as admin, familiar with business registration procedures
- **Goals:**
  - Update legal representative after founder steps down
  - Ensure regulatory compliance during transition
  - Maintain clean audit trail for tax authority inspection
- **Pain Points:**
  - Needs to change legal rep from Mr. Bình (retiring) to Ms. Hoa (new director)
  - Current system has single text field — no record of previous reps
  - No document upload for board resolution appointing new rep
  - No workflow — admin just types over old name, losing history

### Journey Map

```
Phase          Touchpoints                     Emotion     An's Actions                System Responses
──────         ───────────                     ───────     ─────────────               ───────────────

Awareness      Email from CEO                  😐 Neutral  CEO Bình announces          N/A
(Day -7)       ("I'm retiring July 31")                    retirement. An must
                                                            update company profile.

Preparation    Gathers legal documents          😰 Anxious  Finds board resolution,      N/A
(Day -3)                                                 new director's CCCD,
                                                         tax registration update.

Step 1:        Login → Company → Info tab       🤔 Puzzled  Clicks "Edit" on            Form shows LegalRep as
Login & Edit                                                        company info page.    single text field — no
                                                                                         history, no structure.

Step 2:        Overwrite legal rep name         😬 Uneasy    Deletes "Nguyễn Văn        Text field accepts new
Overwrite                                                       Bình", types              name. No confirmation
                                                               "Nguyễn Thị Hoa"          dialog. No mandatory
                                                                                         reason field. No audit
                                                                                         trail visible.

Step 3:        Wants to upload document         😤 Frustrated Looks for "Attach           No document upload
Upload                                                                  Document" button.  section exists.
                                                               Has board resolution PDF  No CompanyDocument entity.
                                                               on desktop — nowhere      Must email file to
                                                               to attach it.             support separately.

Step 4:        Search for change history        😡 Angry    Clicks "Audit Log" tab       Audit log shows only:
History                                                                                  "Company updated"
                                                               No before/after values.   Can't see old legal rep
                                                               No way to prove who       value. No reason code.
                                                               was previous rep.

Step 5:        Call support for guidance        😐 Neutral  Support advises:            Manual process — make
Support                                                                                  annotation in system
                                                               "Save change, send         notes, file document
                                                               document to support        externally.
                                                               email."

Step 6:        Save change                      😌 Relieved  Clicks "Save"               System updates field.
Save                                                                                     No electronic approval.
                                                               Change recorded but        No verification step for
                                                               lacks compliance.          new legal rep identity.
```

### Step-by-Step Narrative

1. **Login & Navigate:** An logs in, navigates to Admin → Company → Info tab. System displays current company information in an edit form. Legal representative field is a single text input showing "Nguyễn Văn Bình".

2. **Edit Legal Rep:** An deletes the old name and types "Nguyễn Thị Hoa". Changes position field to "Giám đốc". System accepts the change silently — no mandatory reason, no confirmation dialog, no OTP verification.

3. **Attempt Document Upload:** An looks for file attachment functionality to upload the board resolution PDF. No document upload section exists on the Info page. No CompanyDocument entity is implemented. An must save the change first, then email the PDF to support.

4. **Check Audit Trail:** An navigates to Audit Log tab expecting to see before/after values. System shows a generic "Company updated" entry with no field-level detail. Cannot prove that Mr. Bình was the legal representative before this change.

5. **Support Interaction:** An calls support. Support confirms manual process: save the change, send supporting documents to support email, and support will add a note to the database.

6. **Save and Comply:** An saves the change. System records UpdatedAt timestamp but no audit detail. No verification of new legal rep's identity (CCCD check, VNeID verification). No electronic approval from anyone.

### Pain Points & Opportunities

| Step | Pain Point | Severity | Opportunity |
|------|-----------|----------|-------------|
| Edit | Single text field — no structured legal rep data | **Critical** | Replace with LegalRepresentative entity (1..N, typed) |
| Edit | Change made without mandatory reason code | **Critical** | Require correction reason for legally significant fields per TT 99/2025 Điều 28 |
| Edit | No OTP/2FA verification for legal rep change | **Critical** | Implement dual verification: OTP to old rep + new rep confirmation per BR-SC-03 |
| Upload | No document upload for supporting evidence | High | Add CompanyDocument entity with file upload (PDF, max 10MB) |
| Upload | No OCR validation of uploaded documents | Medium | Run OCR on uploaded board resolution, extract new rep name, cross-check |
| History | Audit log lacks field-level before/after values | **Critical** | Implement field-level audit trail with OldValue, NewValue, ChangedBy, ChangedAt |
| History | No historical legal rep records preserved | High | Implement soft-delete + effective dating for legal reps (FromDate, ToDate) |
| Workflow | No electronic approval workflow | High | Add approval workflow: Admin requests → Chief Accountant approves → Director confirms |
| Notification | No notification to tax authority portal | Medium | Integrate with Cổng thông tin quốc gia about đăng ký doanh nghiệp for name/rep changes |
| Verification | New rep identity not verified | **Critical** | Validate CCCD number format, check against VNeID API (when available) |
| Verification | No digital certificate for new rep | Medium | Capture digital cert serial, provider, expiry for new legal rep |

**Emotional Arc:** Neutral (awareness) → Anxious (preparation) → Frustrated (no document upload) → Angry (no audit trail) → Relieved (workaround found)

**NPS Impact:** Negative. Legal rep changes are high-stakes — admin needs structured workflow, not text overwrite.

---

## UJ-03: Multi-Company Accountant — Freelance Accountant

**Persona:** Lê Thị Hương — Freelance Accountant (Kế toán dịch vụ)

- **Role:** Outsourced accountant managing full books for 5 SMEs
- **Experience Level:** Expert — 12 years, certified chief accountant, serves clients across 3 provinces
- **Goals:**
  - Efficiently switch between client companies throughout the day
  - Maintain strict data separation — never mix Client A data into Client B
  - See overview dashboard of all clients' status (pending filings, deadlines)
  - Log time/effort per client for billing
- **Pain Points:**
  - Must log out and log in again to switch companies (no switcher)
  - No cross-company dashboard — opens each company one by one
  - Once logged into wrong company, posted entry to wrong client (costly error)
  - Can't compare reports across companies

### Journey Map

```
Phase          Touchpoints                     Emotion     Hương's Actions              System Responses
──────         ───────────                     ───────     ─────────────               ───────────────

Morning        Login → Company A               😐 Neutral  Opens browser, logs in      System loads Company A
Login                                           (routine)  with username/password.      dashboard. Shows
(7:30 AM)                                                               Company A data only.

Task 1:        GL module → Post entries        🙂 Productive Posts 5 purchase          Journal entries saved
Post entries                                   (efficient)  invoices for Company A.     under Company A context.
(8:00 AM)                                                               Unaware of company
                                                                        context — no visual
                                                                        indicator of active
                                                                        company.

Task 2:        Need to switch to B            😠 Frustrated  Looks for "Switch          No company switcher in
Switch to B                                    (interrupted) Company" button in header.   header. Must log out.
(9:30 AM)                                                   Finds nothing.
                                                            Opens new tab, logs out.
                                                            Types username/password
                                                            again to log into B.

Task 3:        Verify Client B deadline        😰 Anxious    Calendar reminder:          Logged into B now.
Deadline                                            Client B's VAT filing due in       Sees only Company B data.
(10:00 AM)                                                     2 days. Reviews B's       Cannot see if Company A
                                                            pending tax items.           has any urgent items
                                                                                         without switching back.

Task 4:        Switch back to A               😤 Frustrated  Logs out of B. Logs in     Each switch = 30s +
Switch back                                   (time wasted) back to A. 45 seconds       cognitive load. 5 clients
(11:00 AM)                                                  lost per switch. 5 clients  × 3 switches/day = 11 min
                                                            × 3 switches/day = 11 min    wasted daily.
                                                            wasted daily.

Task 5:        Cross-company review            😡 Angry     Opens Company A report.     No cross-company
Cross-check                                        Needs to compare revenue            comparison. Opens
(2:00 PM)                                                       between A and B.          browser tabs for each.
                                                            Alt+tabs between two         Manual comparison.
                                                            sessions.

Task 6:        End of day: batch overview     😞 Disappointed  Wants to see all 5        No dashboard. Must check
EOD Review                                                       clients' status at once. each company individually.
(5:00 PM)                                                     5 logins, 5 reviews.      No unified task list.
                                                              15 minutes instead of
                                                              possible 2 minutes.

Task 7:        Invoice clients                 😌 Relieved   Exports time log from       No time tracking or
Invoice                                          (manual)    spreadsheet. Manually        effort-per-client metrics
(Weekly)                                                      calculates hours per         in system.
                                                              client for billing.
```

### Step-by-Step Narrative

1. **Morning Login — Company A:** Hương opens browser, logs in with credentials. System sets company context implicitly (the first/dashboard company). No visual indicator shows which company she is working in — no company badge, no name in header.

2. **Post Entries for A:** Hương posts 5 purchase invoices in GL module. System journals entries under current company context without explicit confirmation. Risk of posting to wrong company is high — no "You are posting to Company A — confirm?" dialog.

3. **Switch to Client B:** Hương needs to work on Client B. No company switcher UI exists in header. She must:
   - Navigate to logout
   - Re-enter credentials (no SSO, no session persistence)
   - Wait for system to load Company B dashboard
   - Cognitive cost: 45 seconds + context shift

4. **Deadline Anxiety:** Calendar reminder fires for Client B's VAT filing. When logged into Client B, Hương cannot see if Client A has any urgent pending items. She must consciously maintain a mental checklist across clients.

5. **Back to Client A:** Same logout/login cycle again. With 5 clients and 3 switches per day, Hương loses approximately 11 minutes daily to authentication overhead.

6. **Cross-Company Comparison:** Hương needs to compare revenue trends between Client A and Client B. She opens two browser tabs with separate login sessions. System provides no multi-company report or comparison view. She manually aligns data side by side.

7. **End of Day Review:** Hương wants a consolidated view of all 5 clients: pending approvals, upcoming deadlines, uncategorized transactions. System offers no multi-company dashboard. She checks each client individually — 5 separate login cycles.

8. **Client Invoicing:** Hương tracks her time in an external spreadsheet. System has no time-per-client or effort-per-company tracking. She manually estimates hours for monthly billing.

### Pain Points & Opportunities

| Step | Pain Point | Severity | Opportunity |
|------|-----------|----------|-------------|
| Login | No company switcher — forced logout/login cycle | **Critical** | Implement company switcher dropdown in header (UC-13) |
| Login | No session persistence across switches | High | Support multi-tab sessions with company context per tab |
| Posting | No company context indicator in UI | High | Add company name badge, color coding, "Active: Company Name" banner |
| Posting | No confirmation dialog for company context | Medium | Add "Posting to [Company] — confirm?" for journal entries |
| Overview | No multi-company dashboard | High | Build cross-company dashboard: pending items, deadlines, alerts |
| Overview | No unified task list | Medium | Aggregate pending approvals/tasks across all user's companies |
| Reporting | Cannot compare reports across companies | Medium | Implement multi-company report: same period, same report, different companies |
| Reporting | No consolidated financial view | Low | Optional group consolidation (parent → subsidiaries) |
| Time | No effort-per-client tracking | Low | Add time logging per company context for freelance billing |
| Data Safety | Risk of posting to wrong company | **Critical** | Add explicit company confirmation on all transaction save operations |
| Data Safety | No data isolation validation | High | Introduce query-level CompanyId filter (tenant isolation interceptor) |

**Emotional Arc:** Neutral (routine) → Frustrated (switch friction) → Angry (cross-check pain) → Disappointed (siloed end-of-day) → Relieved (manual workaround)

**NPS Impact:** Very negative for freelance accountants — a critical segment. Company switcher is table-stakes for multi-tenant SaaS.

---

## UJ-04: Company Suspension — Legal Representative

**Persona:** John Smith — Foreign Legal Representative of Công ty TNHH Công Nghệ XYZ (JSC)

- **Role:** Legal representative / Director, foreign investor
- **Experience Level:** Low — first time operating a business in Vietnam, relies on chief accountant
- **Goals:**
  - Temporarily suspend company operations due to market conditions
  - Ensure compliance with tax and social insurance obligations
  - Avoid penalties for non-filing during suspension
  - Resume operations easily when market recovers
- **Pain Points:**
  - No suspension workflow in system
  - Can't find how to notify tax authority
  - Unaware of legal requirements (max 2-year suspension, notification process)
  - No pre-check of outstanding obligations before suspension

### Journey Map

```
Phase          Touchpoints                     Emotion     John's Actions               System Responses
──────         ───────────                     ───────     ─────────────               ───────────────

Decision       Board meeting decision          😐 Neutral  Board decides to suspend     N/A
(Day -30)                                   (business)   operations for 6 months.
                                                            John tasks accountant to
                                                            process.

Research       Google + lawyer consult         😰 Anxious  Reads NĐ 01/2021, calls      N/A
(Day -20)                                                 lawyer to confirm process.
                                                           Must:
                                                           1. Notify tax authority
                                                           2. Notify employees
                                                           3. Notify social insurance
                                                           4. Publish on national portal

Step 1:        Login → Company settings        🤔 Confused  Looks for "Suspend Company"  No suspension button or
Find Status                                                         button. Searches menu.   status management
(Day -15)                                                                                   anywhere. Sees only
                                                            Finds nothing in Settings,     "IsActive" checkbox in
                                                            Company Info, or Status tab.   database — not exposed
                                                                                           in UI.

Step 2:        Call support                    😤 Frustrated Calls support: "How do I      Support: "We don't have
Support                                                      suspend my company?"           a suspension feature.
(Day -15)                                                                                   We can manually set
                                                            Support: "Feature not           IsActive=false in DB."
                                                            available."

Step 3:        Manual tax notification          😠 Angry     Chief accountant drafts       No integration with tax
Manual                                                       letter to tax authority.       authority portal.
(Day -10)                                                   Must physically go to Cục      No pre-filled suspension
                                                            Thuế to submit notification.    form. No checklist of
                                                                                           outstanding obligations.

Step 4:        Employee notification            😐 Neutral  HR sends notices to 12        No employee notification
Employee                                                    employees per labor law.       workflow.
(Day -10)

Step 5:        Social insurance                 😐 Neutral  Accountant submits social      No social insurance
Social                                                      insurance suspension.           integration.
Insurance
(Day -7)

Step 6:        System status change             😌 Relieved  Database change made by       Company.IsActive = false.
Database                                                        support team after           UI still shows company
Update                                                         receiving written request.    but with no visual
(Day -5)                                                                                    status indicator.

Step 7:        Post-suspension operations       😞 Disappointed  John tries to view          System allows operations
Post-                                                                  reports. Some          despite suspension.
Suspension                                                          features still           No gating of financial
(Day 1)                                                             work, some don't.        operations per BR-CL-05.
                                                                                            No consistent behavior.
```

### Step-by-Step Narrative

1. **Decision & Research:** Board decides 6-month suspension. John researches requirements: notification to tax authority, employees, social insurance, business registration portal. The process involves 4 external agencies — all manual.

2. **Find Status Management:** John navigates through system looking for suspension functionality. No "Company Status" section exists. Only an `IsActive` checkbox in the database that support can toggle. No status lifecycle, no allowed transitions, no effective dating.

3. **Support Call:** Support confirms suspension feature doesn't exist. Workaround: database update by support team to set `IsActive = false`. No automated pre-checks, no compliance validation.

4. **Manual Tax Notification:** Chief accountant drafts paper notification to tax authority (Cục Thuế). No electronic integration — must physically submit. System cannot pre-fill the notification form from company data.

5. **Employee Notification:** HR sends labor notifications independently. System has no employee records (separate module) and no integration with suspension workflow.

6. **Social Insurance:** Accountant handles social insurance suspension manually through BHXH portal. No integration.

7. **Database Change:** Support team sets `IsActive = false` after receiving written authorization. No audit trail of who requested, who approved, when it took effect.

8. **Inconsistent Post-Suspension:** System inconsistently gates operations. Some modules still allow posting, others don't. No centralized status check per BR-CL-05. Reporting still works, but journal entries can still be created in some screens.

### Pain Points & Opportunities

| Step | Pain Point | Severity | Opportunity |
|------|-----------|----------|-------------|
| Status | No status lifecycle — only IsActive boolean | **Critical** | Implement CompanyStatus enum (Active/Suspended/Dissolved/Bankrupt) with state machine |
| Status | No suspension workflow UI | **Critical** | Build "Suspend Company" wizard: reason → effective date → expected resume → pre-checks |
| Pre-check | No automated check of outstanding obligations | **Critical** | Validate before suspension: unfiled tax returns, unpaid invoices, pending approvals |
| Pre-check | No pending transaction check | High | Block suspension if unposted journal entries exist in current period |
| Tax | No integration with tax authority notification | High | Generate pre-filled suspension notification form, track submission status |
| Tax | No tax deadline recalculation | Medium | When suspended, suppress tax filing deadlines during suspension period |
| Employees | No employee notification workflow | Medium | Add mass employee notification (template + bulk email) triggered by suspension |
| Social Insurance | No social insurance integration | Low | Generate BHXH suspension forms |
| Portal | No national portal publication workflow | Medium | Generate Cổng thông tin quốc gia publication, track 7-day publication requirement |
| Post-suspension | No gating of financial operations | **Critical** | Implement status-based gating: suspended → read-only for GL, AP, AR; allow tax only |
| Post-suspension | No suspension duration tracking | High | Enforce 2-year max suspension per BR-CL-02, auto-alert before expiry |
| Resume | No resume workflow | High | Build "Resume Company" wizard: check re-registration required (>1yr), unblock operations |
| Resume | No re-registration verification | Medium | Require proof of re-registration if suspension exceeded 1 year |
| Audit | No suspension audit trail | High | Record suspension request, reason, effective date, authorized by, resumed date |

**Emotional Arc:** Neutral (decision) → Anxious (research) → Confused (can't find) → Frustrated (no feature) → Relieved (workaround) → Disappointed (inconsistent behavior)

**NPS Impact:** Negative. Suspension is a regulatory requirement — system must support it natively. Manual database changes are unacceptable for compliance-sensitive operations.

---

## UJ-05: VNeID Registration — System Admin

**Persona:** Phạm Hoàng — System Admin at SmeAccounting (platform provider)

- **Role:** System Administrator managing compliance across 200+ client companies
- **Experience Level:** Expert — 8 years as platform admin, deep understanding of regulatory requirements
- **Goals:**
  - Ensure all client companies comply with NĐ 69/2024/NĐ-CP before July 2025 deadline
  - Guide legal representatives through VNeID registration process
  - Enable e-tax filing for clients (blocked without VNeID)
  - Track registration status across all client companies
- **Pain Points:**
  - VNeID feature doesn't exist yet — must track manually in spreadsheet
  - No way to verify which legal reps have VNeID Level-2
  - Tax filing is blocked from July 2025 — urgent pressure from clients
  - No API integration with VNeID — all verification is manual

### Journey Map

```
Phase          Touchpoints                     Emotion     Phạm's Actions               System Responses
──────         ───────────                     ───────     ─────────────               ───────────────

Awareness      Government announcement         😰 Anxious  Reads NĐ 69/2024/NĐ-CP:       N/A
(Jan 2025)                                              "From 01/07/2025, all tax
                                                         e-transactions require
                                                         VNeID organization account."

Inventory      Client companies review          😬 Worried  Exports list of 200+         No VNeID tracking fields
(Feb 2025)                                                 client companies. Checks      in Company model. Must
                                                            which have VNeID.             build spreadsheet
                                                            0/200 have VNeID.             manually.

Scoping       Meetings with BA + Dev            😐 Neutral  Discusses feature            Feature request logged.
(Mar 2025)                                              requirements. VNeID           Estimated: 4 weeks dev.
                                                            registration workflow
                                                            assigned to Phase 3.

Step 1:        Dev completes VNeID fields       😐 Neutral  Reviews implementation:      Company model extended:
Development                                             Company.VNeIDOrganizationId,    VNeIDOrganizationId,
(Apr 2025)                                              VNeIDStatus (enum),            VNeIDStatus,
                                                        VNeIDRegistrationDate,         VNeIDRegistrationDate,
                                                        LastVNeIDSyncAt.               LastVNeIDSyncAt.
                                                                                        Status tracking works.

Step 2:        Test with friendly client       😐 Neutral  Picks Client A (tech-         System displays QR code
Test                                                      savvy, willing to test).      and instructions.
(May 2025)                                              Legal rep opens VNeID app.
                                                        Scans QR code.
                                                         System completes:
                                                        VNeIDStatus = Registered

Step 3:        Roll out to all clients          😩 Overwhelmed  Sends email to 200        No batch import. No
Rollout                                                              clients: "Register     tracking dashboard.
(Jun 2025)                                                          VNeID now." Must       Cannot see which clients
                                                                    track responses in      have completed, which
                                                                    spreadsheet.            haven't.

Step 4:        Client support calls             😤 Frustrated  Clients call confused:      System provides no
Support                                                             "What is VNeID?"      self-service guide.
(Jun 2025)                                                          "How to get Level-2?"  No in-app onboarding.
                                                                    "QR code expired!"     No retry mechanism.

Step 5:        Deadline crunch                  😰 Anxious  July 1 approaching:           System auto-blocks tax
Deadline                                                    80/200 clients still         filing for unregistered
(1 Jul 2025)                                               unregistered. Tax filing      companies. No grace
                                                           blocked for these.            period. Support flooded.
                                                            Support tickets spike.

Step 6:        Post-deadline triage             😌 Resolved   Prioritizes remaining        Background sync updates
Triage                                                        clients. Phased rollout.    VNeID status daily.
(Jul 2025)                                                      Work with tax authority    Manual verification
                                                                 for extension letters.     option for API failures.
```

### Step-by-Step Narrative

1. **Regulatory Awareness:** Phạm learns about NĐ 69/2024/NĐ-CP requiring VNeID organization accounts for all tax e-transactions from July 1, 2025. No feature exists in the system. Zero of 200 clients have VNeID.

2. **Manual Inventory:** Phạm exports client list to spreadsheet, manually tracks VNeID readiness. System has no VNeID fields on Company entity — no VNeIDOrganizationId, no VNeIDStatus, no registration date.

3. **Development Phase:** BA and dev team implement VNeID tracking fields: Company gets VNeIDOrganizationId (string), VNeIDStatus (enum: NotRegistered/Registered/Verified/Revoked), VNeIDRegistrationDate, LastVNeIDSyncAt. UI shows status badge on company dashboard. No API integration yet — status must be entered manually.

4. **Client Pilot:** Friendly client tests the QR-code-based registration flow. Legal rep scans QR with VNeID app, system receives callback, VNeIDStatus changes to Registered. Flow works but has rough edges: QR expires in 5 minutes, no retry mechanism, callback sometimes times out.

5. **Mass Rollout:** Phạm emails all 200 clients with instructions. System has no batch operation or in-app notification. Response rate is low — only 30 clients complete in the first week. No tracking dashboard — Phạm manually updates spreadsheet.

6. **Support Surge:** Clients call confused. Many don't have VNeID Level-2 personally. Some get stuck at QR code step. System provides no guided in-app wizard, no retry mechanism, no way to upload proof of manual VNeID registration (for clients who registered outside the system).

7. **Deadline Day:** July 1 arrives. System blocks tax filing for all companies with VNeIDStatus ≠ Verified. 80 clients cannot file VAT. Support tickets spike. Phạm must coordinate with tax authority for extension letters.

8. **Post-Deadline Recovery:** Phạm triages remaining clients, prioritizing those with imminent tax deadlines. System's daily sync background job updates VNeID status for clients who completed registration. Manual override option for verified edge cases.

### Pain Points & Opportunities

| Step | Pain Point | Severity | Opportunity |
|------|-----------|----------|-------------|
| Tracking | No VNeID fields on Company entity | **Critical** | Add VNeIDOrganizationId, VNeIDStatus enum, registration dates to Company |
| Tracking | No registration status dashboard | **Critical** | Build VNeID compliance dashboard: show all clients, status, days-to-deadline |
| Tracking | No bulk status operations | High | Add batch import: upload CSV of VNeID IDs → mark registered |
| Registration | No VNeID API integration | **Critical** | Implement VNeID API adapter (adapter pattern per ADR-0001) |
| Registration | QR code expires in 5 min, no retry | High | Add QR refresh button, extend timeout, retry with exponential backoff |
| Registration | No callback recovery on timeout | Medium | Implement polling fallback: poll VNeID API every 30s for 5 min |
| Registration | No alternative flow (manual) | High | Allow manual VNeID status entry for companies registered externally |
| Registration | No legal rep VNeID Level-2 check | **Critical** | Verify legal rep's personal VNeID Level-2 before org registration |
| Registration | Must open phone app — desktop only users stuck | Medium | Support SMS-based verification alternative |
| Onboarding | No in-app registration guide | High | Build step-by-step wizard with screenshots for legal rep |
| Onboarding | No email/SMS notification to legal rep | Medium | Trigger notification to legal rep: "Register your company VNeID" |
| Compliance | No grace period for tax filing | **Critical** | Implement configurable grace period + tax authority extension letter upload |
| Compliance | Tax filing blocked for unregistered | **Critical** | Gate tax module on VNeIDStatus = Verified |
| Compliance | No pre-deadline alerts | High | Send automated reminders: 90/60/30/7 days before deadline |
| Sync | No daily VNeID sync background job | High | Implement scheduled job: sync VNeID status, update local records |
| Sync | No status change webhook | Medium | Register webhook with VNeID for real-time status change notifications |
| Support | No self-service help content | Medium | Build in-app help articles: "What is VNeID?" / "How to register" |
| Reporting | Cannot prove compliance to auditor | Medium | Generate VNeID compliance report: all clients, status, dates |

**Emotional Arc:** Anxious (awareness) → Worried (inventory) → Neutral (development) → Overwhelmed (rollout) → Frustrated (support surge) → Anxious (deadline) → Resolved (post-deadline recovery)

**NPS Impact:** Highly negative during rollout — clients blocked from tax filing is a critical business interruption. Must be implemented well before regulatory deadline.

---

## Summary: Cross-Journey Improvement Opportunities

| Opportunity | Journeys | Priority | Effort |
|------------|----------|----------|--------|
| Company data model expansion (60+ fields, 10+ entities) | UJ-01, UJ-02 | P0 | 4 weeks |
| CompanyType enum + validation | UJ-01 | P0 | 3 days |
| LegalRepresentative entity (1..N, typed, VNeID, digital cert) | UJ-01, UJ-02 | P0 | 3 weeks |
| Company status lifecycle state machine | UJ-04 | P0 | 1 week |
| Status-based gating of financial operations | UJ-04 | P0 | 1 week |
| Audit trail with field-level before/after values | UJ-02 | P0 | 1 week |
| Mandatory correction reason for critical field changes | UJ-02 | P0 | 1 week |
| Company switcher in header | UJ-03 | P1 | 5 days |
| Multi-company dashboard | UJ-03 | P1 | 2 weeks |
| VNeID tracking fields + status | UJ-05 | P0 | 2 weeks |
| VNeID API integration | UJ-05 | P0 | 4 weeks |
| Company suspension workflow | UJ-04 | P1 | 2 weeks |
| Document upload (CompanyDocument entity) | UJ-02 | P1 | 1 week |
| Tenant isolation interceptor (query-level CompanyId filter) | UJ-03 | P0 | 1 week |
| Onboarding wizard (multi-step setup) | UJ-01 | P2 | 2 weeks |
| Cross-company reporting | UJ-03 | P2 | 3 weeks |
| Business line VSIC code browser | UJ-01 | P2 | 1 week |
| Pre-suspension obligation checks | UJ-04 | P1 | 1 week |
| VNeID compliance dashboard + alerts | UJ-05 | P1 | 1 week |
| Tax authority integration for status changes | UJ-04, UJ-02 | P2 | 3 weeks |
