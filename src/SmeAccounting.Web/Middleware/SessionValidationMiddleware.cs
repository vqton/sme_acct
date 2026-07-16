using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using SmeAccounting.Application.Common.Interfaces;
using SmeAccounting.Infrastructure.Persistence;

namespace SmeAccounting.Web.Middleware;

public sealed class SessionValidationMiddleware
{
    private readonly RequestDelegate _next;

    public SessionValidationMiddleware(RequestDelegate next) => _next = next;

    public async Task InvokeAsync(HttpContext context, ApplicationDbContext dbContext, ICurrentUserService currentUser)
    {
        if (context.User.Identity?.IsAuthenticated == true)
        {
            var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim is not null && Guid.TryParse(userIdClaim, out var userId))
            {
                var user = await dbContext.Users
                    .Include(u => u.Roles)
                    .FirstOrDefaultAsync(u => u.Id == userId);

                if (user is not null)
                {
                    var settings = await dbContext.SessionSettings
                        .FirstOrDefaultAsync(s => s.CompanyId == user.CompanyId);

                    if (settings?.EnforceSessionTimeout == true)
                    {
                        var iatClaim = context.User.FindFirst("iat")?.Value;
                        if (long.TryParse(iatClaim, out var issuedAtUnix))
                        {
                            var issuedAt = DateTimeOffset.FromUnixTimeSeconds(issuedAtUnix).UtcDateTime;
                            if (DateTime.UtcNow - issuedAt > TimeSpan.FromMinutes(settings.AccessTokenExpiryMinutes))
                            {
                                context.Response.StatusCode = 401;
                                await context.Response.WriteAsJsonAsync(new { error = "Session expired" });
                                return;
                            }
                        }

                        var activeSessions = await dbContext.RefreshTokens
                            .CountAsync(rt => rt.UserId == userId && rt.IsActive);
                        if (activeSessions > settings.MaxConcurrentSessions)
                        {
                            context.Response.StatusCode = 401;
                            await context.Response.WriteAsJsonAsync(new { error = "Maximum concurrent sessions exceeded" });
                            return;
                        }
                    }
                }
            }
        }

        await _next(context);
    }
}
