using FluentResults;
using MediatR;
using SmeAccounting.Domain.Interfaces;

namespace SmeAccounting.Application.Admin.Roles.Commands;

public sealed class DeleteRoleCommandHandler : IRequestHandler<DeleteRoleCommand, Result>
{
    private readonly IRoleRepository _roleRepo;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteRoleCommandHandler(IRoleRepository roleRepo, IUnitOfWork unitOfWork)
    {
        _roleRepo = roleRepo;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(DeleteRoleCommand command, CancellationToken ct)
    {
        var role = await _roleRepo.GetByIdAsync(command.Id, ct);
        if (role is null)
            return Result.Fail("Role not found");

        if (role.IsSystem)
            return Result.Fail("Cannot delete system role");

        _roleRepo.Remove(role);
        await _unitOfWork.SaveChangesAsync(ct);
        return Result.Ok();
    }
}
