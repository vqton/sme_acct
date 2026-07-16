using FluentResults;
using MediatR;
using SmeAccounting.Domain.Interfaces;

namespace SmeAccounting.Application.Admin.Roles.Queries;

public sealed class GetRoleQueryHandler : IRequestHandler<GetRoleQuery, Result<RoleDetailDto>>
{
    private readonly IRoleRepository _roleRepo;

    public GetRoleQueryHandler(IRoleRepository roleRepo) => _roleRepo = roleRepo;

    public async Task<Result<RoleDetailDto>> Handle(GetRoleQuery query, CancellationToken ct)
    {
        var role = await _roleRepo.GetByIdAsync(query.Id, ct);
        if (role is null)
            return Result.Fail("Role not found");

        var dto = new RoleDetailDto(
            role.Id, role.Name, role.Description, role.IsSystem, role.CompanyId,
            role.Permissions.Select(p => new PermissionAssignmentDto(
                p.Id, p.Code, p.Name, p.Resource, p.Action, true)).ToList());

        return Result.Ok(dto);
    }
}
