using FluentResults;
using MediatR;

namespace SmeAccounting.Application.Admin.Roles.Commands;

public record RemovePermissionCommand(Guid RoleId, Guid PermissionId) : IRequest<Result>;
