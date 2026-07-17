using FluentResults;
using MediatR;
using SmeAccounting.Application.Common.Interfaces;
using SmeAccounting.Domain.Interfaces;

namespace SmeAccounting.Application.Security.Commands.MfaVerifyEnroll;

public sealed class MfaVerifyEnrollCommandHandler : IRequestHandler<MfaVerifyEnrollCommand, Result>
{
    private readonly ICurrentUserService _currentUser;
    private readonly IUserRepository _userRepo;
    private readonly ITotpService _totpService;
    private readonly IUnitOfWork _unitOfWork;

    public MfaVerifyEnrollCommandHandler(
        ICurrentUserService currentUser,
        IUserRepository userRepo,
        ITotpService totpService,
        IUnitOfWork unitOfWork)
    {
        _currentUser = currentUser;
        _userRepo = userRepo;
        _totpService = totpService;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(MfaVerifyEnrollCommand command, CancellationToken ct)
    {
        var userIdStr = _currentUser.UserId;
        if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
            return Result.Fail("User not authenticated");

        var user = await _userRepo.GetByIdAsync(userId, ct);
        if (user == null || !user.IsActive)
            return Result.Fail("User not found");

        if (user.MfaEnabled)
            return Result.Fail("MFA is already enabled");

        if (!_totpService.ValidateCode(command.Secret, command.Code))
            return Result.Fail("Invalid code. Try again.");

        user.EnableMfa(command.Secret);
        _userRepo.Update(user);
        await _unitOfWork.SaveChangesAsync(ct);

        return Result.Ok();
    }
}
