using FluentResults;
using MediatR;
using SmeAccounting.Domain.Interfaces;

namespace SmeAccounting.Application.Admin.Roles.Commands;

public sealed class AssignPermissionCommandHandler : IRequestHandler<AssignPermissionCommand, Result>
{
    private readonly IRoleRepository _roleRepo;
    private readonly IPermissionRepository _permRepo;
    private readonly IUnitOfWork _unitOfWork;

    public AssignPermissionCommandHandler(IRoleRepository roleRepo, IPermissionRepository permRepo, IUnitOfWork unitOfWork)
    {
        _roleRepo = roleRepo;
        _permRepo = permRepo;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(AssignPermissionCommand command, CancellationToken ct)
    {
        var role = await _roleRepo.GetByIdAsync(command.RoleId, ct);
        if (role is null)
            return Result.Fail("Role not found");

        var permission = await _permRepo.GetByIdAsync(command.PermissionId, ct);
        if (permission is null)
            return Result.Fail("Permission not found");

        if (role.Permissions.Any(p => p.Id == command.PermissionId))
            return Result.Fail("Role already has this permission");

        role.AddPermission(permission);
        _roleRepo.Update(role);
        await _unitOfWork.SaveChangesAsync(ct);
        return Result.Ok();
    }
}
