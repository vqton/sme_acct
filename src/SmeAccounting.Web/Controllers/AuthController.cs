using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmeAccounting.Application.Security.Commands.ChangePassword;
using SmeAccounting.Application.Security.Commands.Login;
using SmeAccounting.Application.Security.Commands.Logout;
using SmeAccounting.Application.Security.Commands.RefreshToken;
using SmeAccounting.Application.Security.Common;
using SmeAccounting.Application.Security.Queries.GetCurrentUser;

namespace SmeAccounting.Web.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IMediator _mediator;

    public AuthController(IMediator mediator) => _mediator = mediator;

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString();
        var command = new LoginCommand(request.Username, request.Password, request.DeviceInfo, ip);
        var result = await _mediator.Send(command);

        if (result.IsFailed)
            return Unauthorized(new { error = result.Errors.First().Message });

        return Ok(result.Value);
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh([FromBody] RefreshTokenRequest request)
    {
        var command = new RefreshTokenCommand(request.AccessToken, request.RefreshToken);
        var result = await _mediator.Send(command);

        if (result.IsFailed)
            return Unauthorized(new { error = result.Errors.First().Message });

        return Ok(result.Value);
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
        var userId = Guid.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
        var result = await _mediator.Send(new GetCurrentUserQuery(userId));

        if (result.IsFailed)
            return NotFound(new { error = result.Errors.First().Message });

        return Ok(result.Value);
    }

    [Authorize]
    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        var userId = Guid.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
        var command = new ChangePasswordCommand(userId, request.CurrentPassword, request.NewPassword);
        var result = await _mediator.Send(command);

        if (result.IsFailed)
            return BadRequest(new { error = result.Errors.First().Message });

        return Ok();
    }
}

public record LogoutRequest(string RefreshToken);
