using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using SmeAccounting.Infrastructure.Persistence;

namespace SmeAccounting.Web.Middleware;

public sealed class IpRestrictionMiddleware
{
    private readonly RequestDelegate _next;

    public IpRestrictionMiddleware(RequestDelegate next) => _next = next;

    public async Task InvokeAsync(HttpContext context, ApplicationDbContext dbContext)
    {
        if (context.User.Identity?.IsAuthenticated == true)
        {
            var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim is not null && Guid.TryParse(userIdClaim, out var userId))
            {
                var user = await dbContext.Users.FirstOrDefaultAsync(u => u.Id == userId);
                if (user is not null)
                {
                    var whitelistEntries = await dbContext.IpWhitelistEntries
                        .Where(w => w.CompanyId == user.CompanyId && w.IsActive)
                        .ToListAsync();

                    if (whitelistEntries.Count != 0)
                    {
                        var remoteIp = context.Connection.RemoteIpAddress?.ToString();
                        if (remoteIp is null || !whitelistEntries.Any(w => w.Matches(remoteIp)))
                        {
                            context.Response.StatusCode = 403;
                            await context.Response.WriteAsJsonAsync(new { error = "Access restricted by IP policy" });
                            return;
                        }
                    }
                }
            }
        }

        await _next(context);
    }
}
