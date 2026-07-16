using FluentResults;
using MediatR;
using SmeAccounting.Domain.Entities;
using SmeAccounting.Domain.Interfaces;

namespace SmeAccounting.Application.Admin.Roles.Commands;

public sealed class CreateRoleCommandHandler : IRequestHandler<CreateRoleCommand, Result<Guid>>
{
    private readonly IRoleRepository _roleRepo;
    private readonly IPermissionRepository _permRepo;
    private readonly IUnitOfWork _unitOfWork;

    public CreateRoleCommandHandler(IRoleRepository roleRepo, IPermissionRepository permRepo, IUnitOfWork unitOfWork)
    {
        _roleRepo = roleRepo;
        _permRepo = permRepo;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<Guid>> Handle(CreateRoleCommand command, CancellationToken ct)
    {
        var existing = await _roleRepo.GetByNameAsync(command.Name, ct);
        if (existing is not null)
            return Result.Fail("Role name already exists");

        var role = new Role(command.Name, command.CompanyId, command.Description);

        if (command.PermissionIds?.Count > 0)
        {
            var allPermissions = await _permRepo.GetAllAsync(ct);
            var selected = allPermissions.Where(p => command.PermissionIds.Contains(p.Id)).ToList();
            foreach (var perm in selected)
                role.AddPermission(perm);
        }

        _roleRepo.Add(role);
        await _unitOfWork.SaveChangesAsync(ct);
        return Result.Ok(role.Id);
    }
}
