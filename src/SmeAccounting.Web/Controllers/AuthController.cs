using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmeAccounting.Application.Security.Commands.ChangePassword;
using SmeAccounting.Application.Security.Commands.Login;
using SmeAccounting.Application.Security.Commands.Logout;
using SmeAccounting.Application.Security.Commands.RefreshToken;
using SmeAccounting.Application.Security.Common;
using SmeAccounting.Application.Security.Queries.GetCurrentUser;
using SmeAccounting.Domain.Interfaces;

namespace SmeAccounting.Web.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ITokenService _tokenService;
    private readonly IUserRepository _userRepo;
    private readonly IRoleRepository _roleRepo;
    private readonly IAntiforgery _antiforgery;

    public AuthController(IMediator mediator, ITokenService tokenService, IUserRepository userRepo, IRoleRepository roleRepo, IAntiforgery antiforgery)
    {
        _mediator = mediator;
        _tokenService = tokenService;
        _userRepo = userRepo;
        _roleRepo = roleRepo;
        _antiforgery = antiforgery;
    }

    private Guid? userIdFromToken(string accessToken)
    {
        try
        {
            return _tokenService.ValidateToken(accessToken);
        }
        catch
        {
            return null;
        }
    }

    [HttpPost("login-cookie")]
    [IgnoreAntiforgeryToken]
    public async Task<IActionResult> LoginCookie()
    {
        if (!await _antiforgery.IsRequestValidAsync(HttpContext))
            return Redirect("/login?error=invalid");

        var username = Request.Form["username"].FirstOrDefault();
        var password = Request.Form["password"].FirstOrDefault();

        if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(password))
            return Redirect("/login?error=invalid");

        var ip = HttpContext.Connection.RemoteIpAddress?.ToString();
        var result = await _mediator.Send(new LoginCommand(username, password, "Blazor Server", ip));

        if (result.IsFailed)
        {
            var err = result.Errors.First().Message;
            var code = err.Contains("locked", StringComparison.OrdinalIgnoreCase) ? "locked" : "invalid";
            return Redirect($"/login?error={code}");
        }

        var resp = result.Value;
        var userId = userIdFromToken(resp.AccessToken);
        if (userId is null)
            return Redirect("/login?error=invalid");

        var user = await _userRepo.GetByIdAsync(userId.Value);
        if (user is null)
            return Redirect("/login?error=invalid");

        var roleNames = user.Roles.Select(r => r.Name).ToList();
        var permissions = await _roleRepo.GetUserEffectivePermissionsAsync(user.Id);

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Name, user.Username),
            new(ClaimTypes.Email, user.Email ?? ""),
            new("iat", DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString()),
        };

        foreach (var role in roleNames)
            claims.Add(new(ClaimTypes.Role, role));
        foreach (var perm in permissions)
            claims.Add(new("permission", perm));

        var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
        var principal = new ClaimsPrincipal(identity);

        await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, principal,
            new AuthenticationProperties { IsPersistent = true });

        return Redirect("/");
    }

    [HttpPost("logout-cookie")]
    [IgnoreAntiforgeryToken]
    public async Task<IActionResult> LogoutCookie()
    {
        if (!await _antiforgery.IsRequestValidAsync(HttpContext))
            return Redirect("/login");

        await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        return Redirect("/login");
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString();
        var command = new LoginCommand(request.Username, request.Password, request.DeviceInfo, ip);
        var result = await _mediator.Send(command);

        if (result.IsFailed)
            return Unauthorized(new { error = result.Errors.First().Message });

        var tokenResponse = result.Value;
        return Ok(new { accessToken = tokenResponse.AccessToken, refreshToken = tokenResponse.RefreshToken, expiresAt = tokenResponse.ExpiresAt });
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh([FromBody] RefreshTokenRequest request)
    {
        var command = new RefreshTokenCommand(request.AccessToken, request.RefreshToken);
        var result = await _mediator.Send(command);

        if (result.IsFailed)
            return Unauthorized(new { error = result.Errors.First().Message });

        return Ok(new { accessToken = result.Value.AccessToken, refreshToken = result.Value.RefreshToken, expiresAt = result.Value.ExpiresAt });
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout([FromBody] LogoutRequest request)
    {
        await _mediator.Send(new LogoutCommand(request.RefreshToken));
        return Ok();
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> Me()
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
        if (userIdClaim is null)
            return Unauthorized(new { error = "Invalid token: missing user identifier" });
        var userId = Guid.Parse(userIdClaim.Value);
        var result = await _mediator.Send(new GetCurrentUserQuery(userId));

        if (result.IsFailed)
            return NotFound(new { error = result.Errors.First().Message });

        return Ok(result.Value);
    }

    [Authorize]
    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
        if (userIdClaim is null)
            return Unauthorized(new { error = "Invalid token: missing user identifier" });
        var userId = Guid.Parse(userIdClaim.Value);
        var command = new ChangePasswordCommand(userId, request.CurrentPassword, request.NewPassword);
        var result = await _mediator.Send(command);

        if (result.IsFailed)
            return BadRequest(new { error = result.Errors.First().Message });

        return Ok();
    }
}

public record LogoutRequest(string RefreshToken);
