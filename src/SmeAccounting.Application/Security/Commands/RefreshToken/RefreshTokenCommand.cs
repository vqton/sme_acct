using FluentResults;
using MediatR;
using SmeAccounting.Application.Security.Common;

namespace SmeAccounting.Application.Security.Commands.RefreshToken;

public record RefreshTokenCommand(string AccessToken, string RefreshToken) : IRequest<Result<TokenResponse>>;
