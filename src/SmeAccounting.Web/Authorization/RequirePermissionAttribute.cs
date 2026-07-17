using Microsoft.AspNetCore.Authorization;
using SmeAccounting.Domain.Security;

namespace SmeAccounting.Web.Authorization;

public class RequirePermissionAttribute : AuthorizeAttribute
{
    public RequirePermissionAttribute(string featureCode, FeatureAction action)
    {
        Policy = $"{featureCode}:{action}";
    }
}

public class PermissionRequirement : IAuthorizationRequirement
{
    public string FeatureCode { get; }
    public FeatureAction Action { get; }

    public PermissionRequirement(string featureCode, FeatureAction action)
    {
        FeatureCode = featureCode;
        Action = action;
    }
}

public class PermissionAuthorizationHandler : AuthorizationHandler<PermissionRequirement>
{
    protected override Task HandleRequirementAsync(AuthorizationHandlerContext context, PermissionRequirement requirement)
    {
        var permissions = context.User.Claims
            .Where(c => c.Type == "permission")
            .Select(c => c.Value)
            .ToHashSet();

        var required = $"{requirement.FeatureCode}:{requirement.Action}";
        if (permissions.Contains(required))
            context.Succeed(requirement);

        return Task.CompletedTask;
    }
}

public class PermissionPolicyProvider : IAuthorizationPolicyProvider
{
    private readonly DefaultAuthorizationPolicyProvider _fallback;

    public PermissionPolicyProvider(DefaultAuthorizationPolicyProvider fallback)
    {
        _fallback = fallback;
    }

    public Task<AuthorizationPolicy?> GetPolicyAsync(string policyName)
    {
        if (policyName.Contains(':'))
        {
            var parts = policyName.Split(':');
            if (parts.Length == 2 && Enum.TryParse<FeatureAction>(parts[1], out var action))
            {
                var policy = new AuthorizationPolicyBuilder()
                    .AddRequirements(new PermissionRequirement(parts[0], action))
                    .Build();
                return Task.FromResult<AuthorizationPolicy?>(policy);
            }
        }
        return _fallback.GetPolicyAsync(policyName);
    }

    public Task<AuthorizationPolicy> GetDefaultPolicyAsync() => _fallback.GetDefaultPolicyAsync();
    public Task<AuthorizationPolicy?> GetFallbackPolicyAsync() => _fallback.GetFallbackPolicyAsync();
}
