using FluentResults;
using MediatR;
using SmeAccounting.Domain.Interfaces;

namespace SmeAccounting.Application.Admin.Roles.Commands;

public sealed class UpdateRoleCommandHandler : IRequestHandler<UpdateRoleCommand, Result>
{
    private readonly IRoleRepository _roleRepo;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateRoleCommandHandler(IRoleRepository roleRepo, IUnitOfWork unitOfWork)
    {
        _roleRepo = roleRepo;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(UpdateRoleCommand command, CancellationToken ct)
    {
        var role = await _roleRepo.GetByIdAsync(command.Id, ct);
        if (role is null)
            return Result.Fail("Role not found");

        if (role.IsSystem)
            return Result.Fail("Cannot modify system role");

        role.UpdateInfo(command.Name, command.Description);
        _roleRepo.Update(role);
        await _unitOfWork.SaveChangesAsync(ct);
        return Result.Ok();
    }
}
