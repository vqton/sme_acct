# Workflows & Processes — User Management

---

## Workflow W-01: User Lifecycle

```mermaid
graph TD
    A[Company Registration] --> B[Default Admin Created]
    B --> C[Admin Creates Org Units]
    C --> D[Admin Creates Roles + Permissions]
    D --> E[Admin Creates Users]
    E --> F[User Receives Invite + Temp Password]
    F --> G{User First Login?}
    G -->|Yes| H[Force Password Change]
    H --> I[User Active]
    G -->|No| I
    I --> J{Periodic Review}
    J -->|Active| I
    J -->|Deactivated| K[User Disabled]
    J -->|Deleted| L[User Soft-Deleted]
    K --> M[Can Reactivate]
    L --> N[Archived after Retention]
```

## Workflow W-02: Login with Security Checks

```mermaid
graph TD
    A[Login Request] --> B{Username Exists?}
    B -->|No| C[Log InvalidCredential]
    C --> D[Return Generic Error]
    B -->|Yes| E{Account Active?}
    E -->|No| F[Log AccountInactive]
    F --> G[Return Account Inactive]
    E -->|Yes| H{Account Locked?}
    H -->|Yes| I[Log AccountLocked]
    I --> J[Return Locked Message]
    H -->|No| K{Password Valid?}
    K -->|No| L[Increment FailedAttempts]
    L --> M{Attempts >= Max?}
    M -->|Yes| N[Lock Account]
    M -->|No| O[Log InvalidCredential]
    O --> D
    K -->|Yes| P[Reset FailedAttempts]
    P --> Q[Set LastLogin]
    Q --> R[Generate JWT + Refresh Token]
    R --> S[Store Refresh Token]
    S --> T[Log Success]
    T --> U[Return Tokens]
```

## Workflow W-03: E-Tax Declaration Permission (Regulatory)

```mermaid
graph TD
    A[Legal Rep logs into VNeID] --> B[Select Organization Identity]
    B --> C[Add Member to Organization]
    C --> D[Member Confirms on VNeID]
    D --> E[Legal Rep Grants Tax Permissions]
    E --> F{Biometric Check Required?}
    F -->|Yes| G[VNeID Level-2 OK?]
    G -->|Yes| H[eTax Mobile Installed?]
    H -->|Yes| I[Info Matches Population DB?]
    I -->|Yes| J[Biometric Verification]
    J --> K[Permissions Granted]
    F -->|No| K
    G -->|No| L[Upgrade VNeID First]
    H -->|No| M[Install eTax Mobile]
    I -->|No| N[Update Info at Tax Authority]
```

## Workflow W-04: Data Correction with Audit Trail (Regulatory Requirement)

```mermaid
graph TD
    A[User Initiates Edit] --> B{Has Permission?}
    B -->|No| C[Reject - Unauthorized]
    B -->|Yes| D[Load Original Data]
    D --> E[User Makes Changes]
    E --> F[User Provides Correction Reason]
    F --> G[System Captures OldValues + NewValues]
    G --> H{Approval Required?}
    H -->|Yes| I[Submit to Chief Accountant]
    I --> J{Chief Approves?}
    J -->|Yes| K[Apply Correction]
    J -->|No| L[Reject Changes]
    H -->|No| K
    K --> M[Log Audit Trail]
    M --> N[Notify Stakeholders]
```

## Workflow W-05: User Session Lifecycle

```mermaid
graph TD
    A[User Login] --> B[JWT Access Token Issued]
    B --> C[Access Token: 15min lifetime]
    C --> D{Request within 15min?}
    D -->|Yes| E[Process Request]
    E --> D
    D -->|No| F[Access Token Expired]
    F --> G{Refresh Token Valid?}
    G -->|Yes| H[Issue New Token Pair]
    H --> D
    G -->|No| I[Session Expired]
    I --> J[User must Re-login]
    C --> K[Refresh Token: 7d lifetime]
    K --> L{User Logs Out?}
    L -->|Yes| M[Revoke Refresh Token]
    L -->|No| N[Token Auto-Expires after 7d]
    L --> O{Concurrent Session > Max?}
    O -->|Yes| P[Revoke Oldest Session]
```

## Workflow W-06: User Registration for Accounting Role

```
Step 1: Company admin identifies need for new user
Step 2: Admin determines user role (based on accounting org structure)
        - Kế toán trưởng (Chief Accountant)
        - Kế toán tổng hợp (General Accountant)
        - Kế toán thuế (Tax Accountant)
        - Kế toán công nợ (Payables/Receivables)
        - Kế toán kho (Inventory Accountant)
        - Kế toán tiền lương (Payroll Accountant)
        - Thủ quỹ (Cashier)
        - Kế toán viên (Staff Accountant)
Step 3: Admin assigns Organization Unit (Phòng Kế toán / chi nhánh)
Step 4: Admin assigns Feature Permissions based on role
        - View: Can view reports
        - Create: Can create journal entries, invoices
        - Edit: Can edit unposted entries
        - Delete: Can delete unapproved entries
        - Print: Can print books, reports
        - Export: Can export data
        - Approve: Can approve entries (Chief Accountant only)
Step 5: Account created, user notified
Step 6: User logs in, changes temp password
Step 7: User begins work with assigned permissions
```

## Process P-01: Regulatory Compliance Check

```
TRIGGER: Monthly / Quarterly / Annual

1. LOAD applicable regulations list
   - Luật Kế toán 88/2015/QH13 (as amended)
   - TT 99/2025/TT-BTC or TT 133/2016/TT-BTC (per company choice)
   - NĐ 254/2026/NĐ-CP (e-invoices)
   - Tax laws per current period

2. VERIFY user permissions matrix
   - All users have appropriate access for role
   - No unauthorized approvers
   - Chief Accountant has approve-only rights on critical records

3. VERIFY audit trail completeness
   - All corrections have trail
   - No silent deletions
   - All modifications traceable to user + timestamp + IP

4. VERIFY system logs
   - Login attempts (success + failure)
   - Permission changes
   - Configuration changes

5. GENERATE compliance report

6. FLAG violations to Chief Accountant + Legal Rep

OUTPUT: Compliance Report
```

## Process P-02: User Deactivation (Employee Departure)

```
TRIGGER: Employee resignation / termination

1. Admin receives departure notification
2. Admin disables user account (IsActive = false)
3. System invalidates all active refresh tokens
4. System logs deactivation with reason + timestamp
5. System reassignes pending approval tasks to delegate
6. Audit log records which admin performed deactivation
7. User data retained per retention policy (5 years per Luật Kế toán)

RULES:
- Cannot delete user with audit trail (must soft-delete)
- User's historical transactions must remain attributable
- Re-activation requires Chief Accountant approval
```
