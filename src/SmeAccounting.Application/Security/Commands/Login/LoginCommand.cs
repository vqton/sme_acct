using FluentResults;
using MediatR;
using SmeAccounting.Application.Security.Common;

namespace SmeAccounting.Application.Security.Commands.Login;

public record LoginCommand(
    string Username,
    string Password,
    string? DeviceInfo = null,
    string? IpAddress = null
) : IRequest<Result<TokenResponse>>;
