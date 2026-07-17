using Microsoft.AspNetCore.Authorization;

namespace SmeAccounting.Web.Authorization;

public class PermissionAuthorizationHandler : AuthorizationHandler<PermissionRequirement>
{
    private readonly ILogger<PermissionAuthorizationHandler> _logger;

    public PermissionAuthorizationHandler(ILogger<PermissionAuthorizationHandler> logger)
    {
        _logger = logger;
    }

    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        PermissionRequirement requirement)
    {
        var required = $"{requirement.FeatureCode}:{requirement.Action}";

        if (context.User.HasClaim("permission", required))
        {
            context.Succeed(requirement);
            return Task.CompletedTask;
        }

        _logger.LogWarning(
            "Access denied: user {User} missing permission {Permission}",
            context.User.Identity?.Name,
            required);

        return Task.CompletedTask;
    }
}
