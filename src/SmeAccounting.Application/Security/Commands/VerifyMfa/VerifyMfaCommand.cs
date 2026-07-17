using FluentResults;
using MediatR;
using SmeAccounting.Application.Security.Common;

namespace SmeAccounting.Application.Security.Commands.VerifyMfa;

public record VerifyMfaCommand(Guid UserId, string Code, string? DeviceInfo = null, string? IpAddress = null) : IRequest<Result<TokenResponse>>;
