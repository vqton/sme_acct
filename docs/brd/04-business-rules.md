# Business Rules — User Management Module

---

## BR-01: Account Security

| Rule ID | Rule | Source |
|---|---|---|
| BR-01.1 | Password min 8 chars, max 128 chars | PasswordPolicy |
| BR-01.2 | Password must have uppercase, lowercase, digit, special char | PasswordPolicy |
| BR-01.3 | Cannot reuse last 10 passwords | User.SetPassword |
| BR-01.4 | Account locks after 5 failed attempts (15min) | PasswordPolicy |
| BR-01.5 | JWT access token expires in 15min | JwtTokenService |
| BR-01.6 | Refresh token expires in 7d | JwtTokenService |
| BR-01.7 | Max 3 concurrent active sessions | PasswordPolicy (not enforced) |
| BR-01.8 | Sensitive operations require re-authentication | Not implemented |

## BR-02: Role & Permission

| Rule ID | Rule | Source |
|---|---|---|
| BR-02.1 | Each user has >= 1 role | Domain model |
| BR-02.2 | Roles are company-scoped (CompanyId) | Role entity |
| BR-02.3 | System roles (IsSystem=true) cannot be deleted | Not enforced |
| BR-02.4 | Role hierarchy: parent role inherits child permissions | Role.ParentRoleId |
| BR-02.5 | Feature permissions: View, Create, Edit, Delete, Print, Export, Approve | FeatureAction/FeatureAccess |
| BR-02.6 | Permission denied unless explicitly granted (default deny) | FeaturePermission.IsAllowed |
| BR-02.7 | Chief Accountant must have Approve permission | Regulatory (TT 99/2025, TT 133) |

## BR-03: Regulatory Compliance

| Rule ID | Rule | Source |
|---|---|---|
| BR-03.1 | All data modifications must have audit trail | TT 99/2025/TT-BTC Điều 28 |
| BR-03.2 | Data corrections must preserve original values + timestamp | TT 99/2025/TT-BTC Điều 28 |
| BR-03.3 | System must alert/warn on data manipulation attempts | TT 99/2025/TT-BTC Điều 28 |
| BR-03.4 | Accounting data retention: min 5 years | Luật Kế toán 88/2015 Điều 41 |
| BR-03.5 | Tax documents retention: min 10 years | Luật Quản lý thuế |
| BR-03.6 | E-invoice data must connect to tax authority | NĐ 254/2026/NĐ-CP |
| BR-03.7 | Digital signature required for e-tax filing | TT 19/2021/TT-BTC, NĐ 23/2025/NĐ-CP |
| BR-03.8 | VNeID required for tax e-transactions from 01/07/2025 | NĐ 69/2024/NĐ-CP |
| BR-03.9 | Biometric verification for legal reps on e-invoice registration | Công văn 3078/CT-NVT (05/2026) |

## BR-04: Multi-Tenancy

| Rule ID | Rule | Source |
|---|---|---|
| BR-04.1 | Users belong to one company (CompanyId) | User entity |
| BR-04.2 | Users can only access data within their company | Architectural |
| BR-04.3 | Organization units are company-scoped | OrganizationUnit entity |
| BR-04.4 | Roles are company-scoped | Role entity |
| BR-04.5 | Data isolation enforced at query level (WHERE CompanyId = X) | Not fully implemented |

## BR-05: User State Machine

```
[Pending] --> [Active] --> [Disabled]
    |            |              |
    |            +--> [Locked]  |
    |            |     |        |
    |            |     +--> [Active] (unlock)
    |            |
    +--> [Deleted] (soft-delete, preserves history)

States:
- Pending: Created, not activated (no login)
- Active: Can login, perform operations
- Locked: Failed login >= max attempts. Auto-unlock after lockout period
- Disabled: Admin disabled. Manual re-enable required
- Deleted: Soft-deleted. Cannot login. Data preserved for audit
```

## BR-06: Approval Workflow Rules (Future)

| Rule ID | Rule | Source |
|---|---|---|
| BR-06.1 | Journal entry post requires Chief Accountant approval | Accounting best practice |
| BR-06.2 | Account creation/modification requires Admin approval | Internal control |
| BR-06.3 | User with Create permission cannot Approve same record | Segregation of duties |
| BR-06.4 | Fiscal year close requires dual approval | Internal control |
| BR-06.5 | Correction of posted entries requires Chief Accountant approval | TT 99/2025/TT-BTC |
