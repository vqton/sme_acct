using FluentResults;
using MediatR;
using SmeAccounting.Application.Common.Interfaces;
using SmeAccounting.Domain.Interfaces;

namespace SmeAccounting.Application.Security.Commands.MfaEnroll;

public sealed class MfaEnrollCommandHandler : IRequestHandler<MfaEnrollCommand, Result<MfaEnrollResult>>
{
    private readonly ICurrentUserService _currentUser;
    private readonly IUserRepository _userRepo;
    private readonly ITotpService _totpService;

    public MfaEnrollCommandHandler(ICurrentUserService currentUser, IUserRepository userRepo, ITotpService totpService)
    {
        _currentUser = currentUser;
        _userRepo = userRepo;
        _totpService = totpService;
    }

    public async Task<Result<MfaEnrollResult>> Handle(MfaEnrollCommand command, CancellationToken ct)
    {
        var userIdStr = _currentUser.UserId;
        if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
            return Result.Fail("User not authenticated");

        var user = await _userRepo.GetByIdAsync(userId, ct);
        if (user == null || !user.IsActive)
            return Result.Fail("User not found");

        if (user.MfaEnabled)
            return Result.Fail("MFA is already enabled");

        var secret = _totpService.GenerateSecret();
        var qrUri = _totpService.GenerateQrCodeUri(secret, user.Email);

        return Result.Ok(new MfaEnrollResult(secret, qrUri));
    }
}
