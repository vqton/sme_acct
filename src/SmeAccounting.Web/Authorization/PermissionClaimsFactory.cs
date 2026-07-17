using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using SmeAccounting.Web.Models;

namespace SmeAccounting.Web.Authorization;

public class PermissionClaimsFactory : UserClaimsPrincipalFactory<ApplicationUser, IdentityRole>
{
    public PermissionClaimsFactory(
        UserManager<ApplicationUser> userManager,
        RoleManager<IdentityRole> roleManager,
        IOptions<IdentityOptions> options)
        : base(userManager, roleManager, options) { }

    protected override async Task<ClaimsIdentity> GenerateClaimsAsync(ApplicationUser user)
    {
        var identity = await base.GenerateClaimsAsync(user);

        var roles = await UserManager.GetRolesAsync(user);
        if (roles.Contains("Admin"))
        {
            foreach (var feature in AppFeatures.DisplayNames.Keys)
            {
                foreach (FeatureAction action in Enum.GetValues<FeatureAction>())
                {
                    identity.AddClaim(new Claim("permission", $"{feature}:{action}"));
                }
            }
        }

        return identity;
    }
}
