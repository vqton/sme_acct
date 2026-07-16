using System.Security.Claims;
using SmeAccounting.Application.Common.Interfaces;

namespace SmeAccounting.Web.Services;

public sealed class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public string? UserId => _httpContextAccessor.HttpContext?.User
        .FindFirst(ClaimTypes.NameIdentifier)?.Value;

    public string? IpAddress => _httpContextAccessor.HttpContext?.Connection
        .RemoteIpAddress?.ToString();
}
