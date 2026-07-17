using Microsoft.EntityFrameworkCore;
using SmeAccounting.Domain.Entities;
using SmeAccounting.Domain.Interfaces;
using SmeAccounting.Domain.Security;

namespace SmeAccounting.Infrastructure.Persistence;

public sealed class DbSeeder
{
    private readonly ApplicationDbContext _context;
    private readonly IPasswordHasher _passwordHasher;

    public DbSeeder(ApplicationDbContext context, IPasswordHasher passwordHasher)
    {
        _context = context;
        _passwordHasher = passwordHasher;
    }

    public async Task SeedAsync(CancellationToken ct = default)
    {
        if (await _context.Roles.AnyAsync(ct))
            return;

        var permissions = await SeedPermissionsAsync(ct);
        var features = await SeedFeaturesAsync(ct);
        var roles = SeedRoles(permissions);
        _context.Roles.AddRange(roles);
        await _context.SaveChangesAsync(ct);

        await SeedAdminUserAsync(roles, ct);
    }

    private async Task SeedAdminUserAsync(List<Role> roles, CancellationToken ct)
    {
        if (await _context.Users.AnyAsync(u => u.Username == "admin", ct))
            return;

        var adminRole = roles.FirstOrDefault(r => r.Name == "Admin");
        if (adminRole == null) return;

        var admin = new User("admin", "admin@smeaccounting.com", _passwordHasher.Hash("Admin@123456"), "System", "Admin", Guid.Empty);
        admin.AddRole(adminRole);
        _context.Users.Add(admin);
        await _context.SaveChangesAsync(ct);
    }

    private async Task<List<Permission>> SeedPermissionsAsync(CancellationToken ct)
    {
        var items = new List<Permission>
        {
            new("ACC_VIEW", "View Accounts", "Account", "View"),
            new("ACC_CREATE", "Create Accounts", "Account", "Create"),
            new("ACC_EDIT", "Edit Accounts", "Account", "Edit"),
            new("ACC_DELETE", "Delete Accounts", "Account", "Delete"),

            new("JE_VIEW", "View Journal Entries", "JournalEntry", "View"),
            new("JE_CREATE", "Create Journal Entries", "JournalEntry", "Create"),
            new("JE_EDIT", "Edit Journal Entries", "JournalEntry", "Edit"),
            new("JE_DELETE", "Delete Journal Entries", "JournalEntry", "Delete"),
            new("JE_APPROVE", "Approve Journal Entries", "JournalEntry", "Approve"),

            new("AR_VIEW", "View Receivables", "Receivable", "View"),
            new("AR_CREATE", "Create Receivables", "Receivable", "Create"),
            new("AR_EDIT", "Edit Receivables", "Receivable", "Edit"),

            new("AP_VIEW", "View Payables", "Payable", "View"),
            new("AP_CREATE", "Create Payables", "Payable", "Create"),
            new("AP_EDIT", "Edit Payables", "Payable", "Edit"),

            new("CASH_VIEW", "View Cash Transactions", "Cash", "View"),
            new("CASH_CREATE", "Create Cash Transactions", "Cash", "Create"),

            new("BANK_VIEW", "View Bank Transactions", "Bank", "View"),
            new("BANK_CREATE", "Create Bank Transactions", "Bank", "Create"),

            new("INV_VIEW", "View Inventory", "Inventory", "View"),
            new("INV_CREATE", "Create Inventory", "Inventory", "Create"),
            new("INV_EDIT", "Edit Inventory", "Inventory", "Edit"),

            new("TAX_VIEW", "View Tax", "Tax", "View"),
            new("TAX_DECLARE", "Declare Tax", "Tax", "Declare"),
            new("TAX_SUBMIT", "Submit Tax Declaration", "Tax", "Submit"),

            new("REPORT_VIEW", "View Reports", "Report", "View"),
            new("REPORT_EXPORT", "Export Reports", "Report", "Export"),
            new("REPORT_PRINT", "Print Reports", "Report", "Print"),

            new("USER_VIEW", "View Users", "User", "View"),
            new("USER_CREATE", "Create Users", "User", "Create"),
            new("USER_EDIT", "Edit Users", "User", "Edit"),
            new("USER_DELETE", "Delete Users", "User", "Delete"),

            new("ROLE_VIEW", "View Roles", "Role", "View"),
            new("ROLE_CREATE", "Create Roles", "Role", "Create"),
            new("ROLE_EDIT", "Edit Roles", "Role", "Edit"),
            new("ROLE_DELETE", "Delete Roles", "Role", "Delete"),

            new("AUDIT_VIEW", "View Audit Trail", "Audit", "View"),
            new("AUDIT_EXPORT", "Export Audit Trail", "Audit", "Export"),

            new("SETTING_VIEW", "View Settings", "Setting", "View"),
            new("SETTING_EDIT", "Edit Settings", "Setting", "Edit"),
        };

        var existingCodes = await _context.Permissions.Select(p => p.Code).ToListAsync(ct);
        var newItems = items.Where(p => !existingCodes.Contains(p.Code)).ToList();

        _context.Permissions.AddRange(newItems);
        await _context.SaveChangesAsync(ct);

        return await _context.Permissions.ToListAsync(ct);
    }

    private async Task<List<Feature>> SeedFeaturesAsync(CancellationToken ct)
    {
        var modules = new List<Feature>
        {
            new("HE_THONG", "System", "System", "System configuration"),
            new("DM_TAI_KHOAN", "Account Management", "Accounting", "Chart of accounts"),
            new("SO_KE_TOAN", "General Ledger", "Accounting", "General ledger and journal entries"),
            new("CONG_NO", "Receivables & Payables", "Accounting", "AR/AP management"),
            new("TIEN_MAT", "Cash Management", "Cash", "Cash transactions"),
            new("TIEN_GUI", "Bank Management", "Bank", "Bank transactions"),
            new("KHO", "Inventory", "Inventory", "Inventory management"),
            new("THUE", "Tax", "Tax", "Tax declaration and payment"),
            new("BAO_CAO", "Reports", "Report", "Financial reporting"),
            new("KIEM_TOAN", "Audit", "Audit", "Audit trail"),
        };

        var existingCodes = await _context.Features.Select(f => f.Code).ToListAsync(ct);
        var newModules = modules.Where(f => !existingCodes.Contains(f.Code)).ToList();

        _context.Features.AddRange(newModules);
        await _context.SaveChangesAsync(ct);

        return await _context.Features.ToListAsync(ct);
    }

    private List<Role> SeedRoles(List<Permission> permissions)
    {
        var p = permissions.ToDictionary(p => p.Code);

        var admin = new Role("Admin", Guid.Empty, "System administrator — full access", true);
        foreach (var perm in permissions) admin.AddPermission(perm);

        var keToanTruong = new Role("KeToanTruong", Guid.Empty, "Chief Accountant — full accounting + approval");
        foreach (var c in new[] {"ACC_VIEW","ACC_CREATE","ACC_EDIT","JE_VIEW","JE_CREATE","JE_EDIT","JE_APPROVE",
            "AR_VIEW","AR_CREATE","AR_EDIT","AP_VIEW","AP_CREATE","AP_EDIT",
            "CASH_VIEW","CASH_CREATE","BANK_VIEW","BANK_CREATE",
            "INV_VIEW","INV_CREATE","INV_EDIT",
            "TAX_VIEW","TAX_DECLARE","TAX_SUBMIT",
            "REPORT_VIEW","REPORT_EXPORT","REPORT_PRINT",
            "AUDIT_VIEW","AUDIT_EXPORT","SETTING_VIEW","SETTING_EDIT"})
        {
            if (p.TryGetValue(c, out var perm)) keToanTruong.AddPermission(perm);
        }

        var keToanTongHop = new Role("KeToanTongHop", Guid.Empty, "General Accountant — journal entries, general ledger");
        foreach (var c in new[] {"ACC_VIEW","JE_VIEW","JE_CREATE","JE_EDIT",
            "AR_VIEW","AP_VIEW","CASH_VIEW","BANK_VIEW",
            "TAX_VIEW","REPORT_VIEW","REPORT_EXPORT","REPORT_PRINT"})
        {
            if (p.TryGetValue(c, out var perm)) keToanTongHop.AddPermission(perm);
        }

        var keToanCongNo = new Role("KeToanCongNo", Guid.Empty, "AR/AP Accountant — receivables and payables");
        foreach (var c in new[] {"ACC_VIEW","JE_VIEW","JE_CREATE",
            "AR_VIEW","AR_CREATE","AR_EDIT","AP_VIEW","AP_CREATE","AP_EDIT","REPORT_VIEW"})
        {
            if (p.TryGetValue(c, out var perm)) keToanCongNo.AddPermission(perm);
        }

        var keToanKho = new Role("KeToanKho", Guid.Empty, "Inventory Accountant");
        foreach (var c in new[] {"INV_VIEW","INV_CREATE","INV_EDIT","JE_VIEW","JE_CREATE","REPORT_VIEW"})
        {
            if (p.TryGetValue(c, out var perm)) keToanKho.AddPermission(perm);
        }

        var keToanTienMat = new Role("KeToanTienMat", Guid.Empty, "Cash Accountant — cash and bank transactions");
        foreach (var c in new[] {"CASH_VIEW","CASH_CREATE","BANK_VIEW","BANK_CREATE","JE_VIEW","JE_CREATE","REPORT_VIEW"})
        {
            if (p.TryGetValue(c, out var perm)) keToanTienMat.AddPermission(perm);
        }

        var keToanThue = new Role("KeToanThue", Guid.Empty, "Tax Accountant — tax declaration and reporting");
        foreach (var c in new[] {"TAX_VIEW","TAX_DECLARE","TAX_SUBMIT","ACC_VIEW","JE_VIEW","REPORT_VIEW","REPORT_EXPORT"})
        {
            if (p.TryGetValue(c, out var perm)) keToanThue.AddPermission(perm);
        }

        var thuQuy = new Role("ThuQuy", Guid.Empty, "Cashier — record cash transactions only, no approval");
        foreach (var c in new[] {"CASH_VIEW","CASH_CREATE","BANK_VIEW"})
        {
            if (p.TryGetValue(c, out var perm)) thuQuy.AddPermission(perm);
        }

        var giamDoc = new Role("GiamDoc", Guid.Empty, "Director — read-only access to reports");
        foreach (var c in new[] {"REPORT_VIEW","REPORT_EXPORT","REPORT_PRINT",
            "ACC_VIEW","JE_VIEW","AR_VIEW","AP_VIEW","TAX_VIEW","AUDIT_VIEW"})
        {
            if (p.TryGetValue(c, out var perm)) giamDoc.AddPermission(perm);
        }

        var kiemToanNoiBo = new Role("KiemToanNoiBo", Guid.Empty, "Internal Auditor — read-only audit trail and reports");
        foreach (var c in new[] {"AUDIT_VIEW","AUDIT_EXPORT","REPORT_VIEW","REPORT_EXPORT","ACC_VIEW","JE_VIEW","SETTING_VIEW"})
        {
            if (p.TryGetValue(c, out var perm)) kiemToanNoiBo.AddPermission(perm);
        }

        return new() { admin, keToanTruong, keToanTongHop, keToanCongNo,
            keToanKho, keToanTienMat, keToanThue, thuQuy, giamDoc, kiemToanNoiBo };
    }
}
