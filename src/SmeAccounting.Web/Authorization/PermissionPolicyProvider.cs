using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Options;

namespace SmeAccounting.Web.Authorization;

public class PermissionPolicyProvider : IAuthorizationPolicyProvider
{
    private readonly AuthorizationOptions _fallback;

    public PermissionPolicyProvider(IOptions<AuthorizationOptions> options)
    {
        _fallback = options.Value;
    }

    public Task<AuthorizationPolicy?> GetPolicyAsync(string policyName)
    {
        if (!policyName.StartsWith(RequirePermissionAttribute.PolicyPrefix, StringComparison.OrdinalIgnoreCase))
            return Task.FromResult<AuthorizationPolicy?>(null);

        var parts = policyName[RequirePermissionAttribute.PolicyPrefix.Length..].Split(':');
        if (parts.Length != 2)
            return Task.FromResult<AuthorizationPolicy?>(null);

        if (!Enum.TryParse<FeatureAction>(parts[1], out var action))
            return Task.FromResult<AuthorizationPolicy?>(null);

        var policy = new AuthorizationPolicyBuilder()
            .AddRequirements(new PermissionRequirement(parts[0], action))
            .Build();

        return Task.FromResult<AuthorizationPolicy?>(policy);
    }

    public Task<AuthorizationPolicy> GetDefaultPolicyAsync() =>
        Task.FromResult(_fallback.DefaultPolicy);

    public Task<AuthorizationPolicy?> GetFallbackPolicyAsync() =>
        Task.FromResult(_fallback.FallbackPolicy);
}
