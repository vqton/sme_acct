using FluentResults;
using MediatR;

namespace SmeAccounting.Application.Security.Commands.ChangePassword;

public record ChangePasswordCommand(Guid UserId, string CurrentPassword, string NewPassword) : IRequest<Result>;
