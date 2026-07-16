using FluentResults;
using MediatR;
using SmeAccounting.Domain.Interfaces;

namespace SmeAccounting.Application.Admin.Roles.Queries;

public sealed class ListRolesQueryHandler : IRequestHandler<ListRolesQuery, Result<List<RoleListItemDto>>>
{
    private readonly IRoleRepository _roleRepo;

    public ListRolesQueryHandler(IRoleRepository roleRepo) => _roleRepo = roleRepo;

    public async Task<Result<List<RoleListItemDto>>> Handle(ListRolesQuery query, CancellationToken ct)
    {
        var roles = await _roleRepo.GetAllAsync(ct);

        var filtered = query.CompanyId.HasValue
            ? roles.Where(r => r.CompanyId == query.CompanyId.Value)
            : roles;

        var dtos = filtered.Select(r => new RoleListItemDto(
            r.Id, r.Name, r.Description, r.IsSystem, r.Users.Count)).ToList();

        return Result.Ok(dtos);
    }
}
