using FluentResults;
using MediatR;

namespace SmeAccounting.Application.Admin.Users.Commands;

public record AssignRoleCommand(Guid UserId, Guid RoleId) : IRequest<Result>;
