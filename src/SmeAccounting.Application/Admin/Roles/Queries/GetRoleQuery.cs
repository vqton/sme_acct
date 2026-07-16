using FluentResults;
using MediatR;

namespace SmeAccounting.Application.Admin.Roles.Queries;

public record GetRoleQuery(Guid Id) : IRequest<Result<RoleDetailDto>>;

public record RoleDetailDto(Guid Id, string Name, string? Description, bool IsSystem, Guid CompanyId,
    List<PermissionAssignmentDto> Permissions);

public record PermissionAssignmentDto(Guid PermissionId, string Code, string Name, string Resource, string Action, bool IsAssigned);
