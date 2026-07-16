using FluentResults;
using MediatR;

namespace SmeAccounting.Application.Admin.Roles.Commands;

public record CreateRoleCommand(string Name, string? Description, Guid CompanyId, List<Guid>? PermissionIds = null) : IRequest<Result<Guid>>;
