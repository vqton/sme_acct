using FluentResults;
using MediatR;
using SmeAccounting.Domain.Interfaces;

namespace SmeAccounting.Application.Admin.Users.Commands;

public sealed class UnassignRoleCommandHandler : IRequestHandler<UnassignRoleCommand, Result>
{
    private readonly IUserRepository _userRepo;
    private readonly IRoleRepository _roleRepo;
    private readonly IUnitOfWork _unitOfWork;

    public UnassignRoleCommandHandler(IUserRepository userRepo, IRoleRepository roleRepo, IUnitOfWork unitOfWork)
    {
        _userRepo = userRepo;
        _roleRepo = roleRepo;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(UnassignRoleCommand command, CancellationToken ct)
    {
        var user = await _userRepo.GetByIdAsync(command.UserId, ct);
        if (user is null)
            return Result.Fail("User not found");

        var role = user.Roles.FirstOrDefault(r => r.Id == command.RoleId);
        if (role is null)
            return Result.Fail("User does not have this role");

        user.RemoveRole(role);
        _userRepo.Update(user);
        await _unitOfWork.SaveChangesAsync(ct);
        return Result.Ok();
    }
}
