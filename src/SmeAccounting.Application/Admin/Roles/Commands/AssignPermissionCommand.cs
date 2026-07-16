using FluentResults;
using MediatR;

namespace SmeAccounting.Application.Admin.Roles.Commands;

public record AssignPermissionCommand(Guid RoleId, Guid PermissionId) : IRequest<Result>;
