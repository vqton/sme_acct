using FluentResults;
using MediatR;
using SmeAccounting.Domain.Interfaces;

namespace SmeAccounting.Application.Admin.Users.Commands;

public sealed class UpdateUserCommandHandler : IRequestHandler<UpdateUserCommand, Result>
{
    private readonly IUserRepository _userRepo;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateUserCommandHandler(IUserRepository userRepo, IUnitOfWork unitOfWork)
    {
        _userRepo = userRepo;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(UpdateUserCommand command, CancellationToken ct)
    {
        var user = await _userRepo.GetByIdAsync(command.Id, ct);
        if (user is null)
            return Result.Fail("User not found");

        user.UpdateProfile(command.FirstName, command.LastName, command.Email);

        if (command.IsActive && !user.IsActive)
            user.Enable();
        else if (!command.IsActive && user.IsActive)
            user.Disable();

        _userRepo.Update(user);
        await _unitOfWork.SaveChangesAsync(ct);
        return Result.Ok();
    }
}
