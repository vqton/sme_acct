using FluentResults;
using MediatR;

namespace SmeAccounting.Application.Admin.Permissions.Queries;

public record ListPermissionsQuery : IRequest<Result<List<PermissionDto>>>;

public record PermissionDto(Guid Id, string Code, string Name, string Resource, string Action);
