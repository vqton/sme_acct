using FluentResults;
using MediatR;
using SmeAccounting.Application.Security.Common;
using SmeAccounting.Domain.Interfaces;

namespace SmeAccounting.Application.Security.Commands.RefreshToken;

public class RefreshTokenCommandHandler : IRequestHandler<RefreshTokenCommand, Result<TokenResponse>>
{
    private readonly IUserRepository _userRepo;
    private readonly IRoleRepository _roleRepo;
    private readonly ITokenService _tokenService;
    private readonly IUnitOfWork _unitOfWork;

    public RefreshTokenCommandHandler(
        IUserRepository userRepo,
        IRoleRepository roleRepo,
        ITokenService tokenService,
        IUnitOfWork unitOfWork)
    {
        _userRepo = userRepo;
        _roleRepo = roleRepo;
        _tokenService = tokenService;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<TokenResponse>> Handle(RefreshTokenCommand command, CancellationToken ct)
    {
        var stored = await _userRepo.GetRefreshTokenAsync(command.RefreshToken, ct);
        if (stored == null || !stored.IsActive)
            return Result.Fail("Invalid or expired refresh token");

        var userId = _tokenService.ValidateToken(command.AccessToken);
        if (userId == null || userId != stored.UserId)
            return Result.Fail("Invalid access token");

        var user = await _userRepo.GetByIdAsync(stored.UserId, ct);
        if (user == null || !user.IsActive)
            return Result.Fail("User not found or inactive");

        var roleNames = user.Roles.Select(r => r.Name).ToList();
        var permissions = await _roleRepo.GetUserEffectivePermissionsAsync(user.Id, ct);

        var tokens = _tokenService.GenerateTokens(user.Id, user.Username, user.Email, roleNames, permissions.ToList());

        stored.Revoke(tokens.RefreshToken);
        _userRepo.RevokeRefreshToken(stored);

        var newRefreshToken = new Domain.Security.RefreshToken(tokens.RefreshToken, Guid.NewGuid().ToString(), user.Id,
            tokens.ExpiresAt.AddDays(7), stored.DeviceInfo, stored.IpAddress);
        _userRepo.AddRefreshToken(newRefreshToken);

        await _unitOfWork.SaveChangesAsync(ct);

        return Result.Ok(new TokenResponse(tokens.AccessToken, tokens.RefreshToken, tokens.ExpiresAt));
    }
}
