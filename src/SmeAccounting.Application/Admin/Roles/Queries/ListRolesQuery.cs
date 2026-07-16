using FluentResults;
using MediatR;

namespace SmeAccounting.Application.Admin.Roles.Queries;

public record ListRolesQuery(Guid? CompanyId = null) : IRequest<Result<List<RoleListItemDto>>>;

public record RoleListItemDto(Guid Id, string Name, string? Description, bool IsSystem, int UserCount);
