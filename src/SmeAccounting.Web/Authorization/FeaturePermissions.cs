namespace SmeAccounting.Web.Authorization;

[Flags]
public enum FeatureAction
{
    View = 1,
    Create = 2,
    Edit = 4,
    Delete = 8,
    Print = 16,
    Export = 32,
    Approve = 64,
}

public static class AppFeatures
{
    public const string GL_JOURNAL = "GL_JOURNAL";
    public const string GL_ACCOUNT = "GL_ACCOUNT";
    public const string AP_INVOICE = "AP_INVOICE";
    public const string AR_INVOICE = "AR_INVOICE";
    public const string CASH_BANK = "CASH_BANK";
    public const string FIXED_ASSET = "FIXED_ASSET";
    public const string TAX_DECLARE = "TAX_DECLARE";
    public const string REPORT_GL = "REPORT_GL";
    public const string REPORT_BS = "REPORT_BS";
    public const string REPORT_IS = "REPORT_IS";
    public const string ADMIN_USER = "ADMIN_USER";
    public const string ADMIN_ROLE = "ADMIN_ROLE";
    public const string ADMIN_AUDIT = "ADMIN_AUDIT";
    public const string WORKFLOW_APPR = "WORKFLOW_APPR";

    public static readonly Dictionary<string, string> DisplayNames = new()
    {
        [GL_JOURNAL] = "Journal Entry",
        [GL_ACCOUNT] = "Chart of Accounts",
        [AP_INVOICE] = "AP Invoice",
        [AR_INVOICE] = "AR Invoice",
        [CASH_BANK] = "Cash & Bank",
        [FIXED_ASSET] = "Fixed Assets",
        [TAX_DECLARE] = "Tax Declaration",
        [REPORT_GL] = "GL Reports",
        [REPORT_BS] = "Balance Sheet",
        [REPORT_IS] = "Income Statement",
        [ADMIN_USER] = "User Management",
        [ADMIN_ROLE] = "Role Management",
        [ADMIN_AUDIT] = "Audit Log",
        [WORKFLOW_APPR] = "Approval Workflow",
    };
}

public class RequirePermissionAttribute : Microsoft.AspNetCore.Authorization.AuthorizeAttribute
{
    public const string PolicyPrefix = "Permission:";

    public string FeatureCode { get; }
    public FeatureAction Action { get; }

    public RequirePermissionAttribute(string featureCode, FeatureAction action)
    {
        FeatureCode = featureCode;
        Action = action;
        Policy = $"{PolicyPrefix}{featureCode}:{action}";
    }
}

public class PermissionRequirement : Microsoft.AspNetCore.Authorization.IAuthorizationRequirement
{
    public string FeatureCode { get; }
    public FeatureAction Action { get; }

    public PermissionRequirement(string featureCode, FeatureAction action)
    {
        FeatureCode = featureCode;
        Action = action;
    }
}
