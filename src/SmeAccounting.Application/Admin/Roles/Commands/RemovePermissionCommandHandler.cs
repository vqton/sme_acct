using FluentResults;
using MediatR;
using SmeAccounting.Domain.Interfaces;

namespace SmeAccounting.Application.Admin.Roles.Commands;

public sealed class RemovePermissionCommandHandler : IRequestHandler<RemovePermissionCommand, Result>
{
    private readonly IRoleRepository _roleRepo;
    private readonly IUnitOfWork _unitOfWork;

    public RemovePermissionCommandHandler(IRoleRepository roleRepo, IUnitOfWork unitOfWork)
    {
        _roleRepo = roleRepo;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(RemovePermissionCommand command, CancellationToken ct)
    {
        var role = await _roleRepo.GetByIdAsync(command.RoleId, ct);
        if (role is null)
            return Result.Fail("Role not found");

        var permission = role.Permissions.FirstOrDefault(p => p.Id == command.PermissionId);
        if (permission is null)
            return Result.Fail("Role does not have this permission");

        role.RemovePermission(permission);
        _roleRepo.Update(role);
        await _unitOfWork.SaveChangesAsync(ct);
        return Result.Ok();
    }
}
