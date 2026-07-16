using FluentResults;
using MediatR;

namespace SmeAccounting.Application.Security.Commands.Logout;

public record LogoutCommand(string RefreshToken) : IRequest<Result>;
