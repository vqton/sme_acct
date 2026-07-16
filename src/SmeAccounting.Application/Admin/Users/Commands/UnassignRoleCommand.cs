using FluentResults;
using MediatR;

namespace SmeAccounting.Application.Admin.Users.Commands;

public record UnassignRoleCommand(Guid UserId, Guid RoleId) : IRequest<Result>;
