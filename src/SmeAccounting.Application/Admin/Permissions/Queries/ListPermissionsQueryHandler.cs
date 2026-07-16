using FluentResults;
using MediatR;
using SmeAccounting.Domain.Interfaces;

namespace SmeAccounting.Application.Admin.Permissions.Queries;

public sealed class ListPermissionsQueryHandler : IRequestHandler<ListPermissionsQuery, Result<List<PermissionDto>>>
{
    private readonly IPermissionRepository _permRepo;

    public ListPermissionsQueryHandler(IPermissionRepository permRepo) => _permRepo = permRepo;

    public async Task<Result<List<PermissionDto>>> Handle(ListPermissionsQuery query, CancellationToken ct)
    {
        var permissions = await _permRepo.GetAllAsync(ct);

        var dtos = permissions.Select(p => new PermissionDto(
            p.Id, p.Code, p.Name, p.Resource, p.Action)).ToList();

        return Result.Ok(dtos);
    }
}
