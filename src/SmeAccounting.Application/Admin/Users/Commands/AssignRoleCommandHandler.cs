using FluentResults;
using MediatR;
using SmeAccounting.Domain.Interfaces;

namespace SmeAccounting.Application.Admin.Users.Commands;

public sealed class AssignRoleCommandHandler : IRequestHandler<AssignRoleCommand, Result>
{
    private readonly IUserRepository _userRepo;
    private readonly IRoleRepository _roleRepo;
    private readonly IUnitOfWork _unitOfWork;

    public AssignRoleCommandHandler(IUserRepository userRepo, IRoleRepository roleRepo, IUnitOfWork unitOfWork)
    {
        _userRepo = userRepo;
        _roleRepo = roleRepo;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(AssignRoleCommand command, CancellationToken ct)
    {
        var user = await _userRepo.GetByIdAsync(command.UserId, ct);
        if (user is null)
            return Result.Fail("User not found");

        var role = await _roleRepo.GetByIdAsync(command.RoleId, ct);
        if (role is null)
            return Result.Fail("Role not found");

        if (user.Roles.Any(r => r.Id == command.RoleId))
            return Result.Fail("User already has this role");

        user.AddRole(role);
        _userRepo.Update(user);
        await _unitOfWork.SaveChangesAsync(ct);
        return Result.Ok();
    }
}
