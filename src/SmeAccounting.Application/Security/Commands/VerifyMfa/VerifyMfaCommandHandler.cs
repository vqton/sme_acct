using FluentResults;
using MediatR;
using SmeAccounting.Application.Security.Common;
using SmeAccounting.Domain.Interfaces;

namespace SmeAccounting.Application.Security.Commands.VerifyMfa;

public sealed class VerifyMfaCommandHandler : IRequestHandler<VerifyMfaCommand, Result<TokenResponse>>
{
    private readonly IUserRepository _userRepo;
    private readonly IRoleRepository _roleRepo;
    private readonly ITokenService _tokenService;
    private readonly ITotpService _totpService;
    private readonly IUnitOfWork _unitOfWork;

    public VerifyMfaCommandHandler(
        IUserRepository userRepo,
        IRoleRepository roleRepo,
        ITokenService tokenService,
        ITotpService totpService,
        IUnitOfWork unitOfWork)
    {
        _userRepo = userRepo;
        _roleRepo = roleRepo;
        _tokenService = tokenService;
        _totpService = totpService;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<TokenResponse>> Handle(VerifyMfaCommand command, CancellationToken ct)
    {
        var user = await _userRepo.GetByIdAsync(command.UserId, ct);
        if (user == null || !user.IsActive)
            return Result.Fail("User not found or inactive");

        if (!user.MfaEnabled || string.IsNullOrWhiteSpace(user.MfaSecret))
            return Result.Fail("MFA not enabled for this user");

        if (!_totpService.ValidateCode(user.MfaSecret, command.Code))
            return Result.Fail("Invalid MFA code");

        user.SetLastLogin();
        _userRepo.Update(user);

        var roleNames = user.Roles.Select(r => r.Name).ToList();
        var permissions = await _roleRepo.GetUserEffectivePermissionsAsync(user.Id, ct);
        var tokens = _tokenService.GenerateTokens(user.Id, user.Username, user.Email, roleNames, permissions.ToList());

        var refreshToken = new Domain.Security.RefreshToken(tokens.RefreshToken, Guid.NewGuid().ToString(), user.Id,
            tokens.RefreshTokenExpiresAt, command.DeviceInfo, command.IpAddress);
        _userRepo.AddRefreshToken(refreshToken);

        await _unitOfWork.SaveChangesAsync(ct);

        return Result.Ok(new TokenResponse(tokens.AccessToken, tokens.RefreshToken, tokens.ExpiresAt));
    }
}
