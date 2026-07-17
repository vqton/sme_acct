using FluentResults;
using MediatR;
using SmeAccounting.Domain.Interfaces;

namespace SmeAccounting.Application.Security.Commands.ChangePassword;

public sealed class ChangePasswordCommandHandler : IRequestHandler<ChangePasswordCommand, Result>
{
    private readonly IUserRepository _userRepo;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IUnitOfWork _unitOfWork;

    public ChangePasswordCommandHandler(
        IUserRepository userRepo,
        IPasswordHasher passwordHasher,
        IUnitOfWork unitOfWork)
    {
        _userRepo = userRepo;
        _passwordHasher = passwordHasher;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(ChangePasswordCommand command, CancellationToken ct)
    {
        var user = await _userRepo.GetByIdAsync(command.UserId, ct);
        if (user == null)
            return Result.Fail("User not found");

        if (!_passwordHasher.Verify(command.CurrentPassword, user.PasswordHash))
            return Result.Fail("Current password is incorrect");

        if (user.IsPasswordReused(_passwordHasher.Hash(command.NewPassword)))
            return Result.Fail("Cannot reuse a recent password");

        user.SetPassword(_passwordHasher.Hash(command.NewPassword));
        _userRepo.Update(user);

        await _userRepo.RevokeAllUserRefreshTokensAsync(user.Id, ct);
        await _unitOfWork.SaveChangesAsync(ct);

        return Result.Ok();
    }
}
