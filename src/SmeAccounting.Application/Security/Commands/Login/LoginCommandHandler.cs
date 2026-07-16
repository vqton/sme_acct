using FluentResults;
using MediatR;
using SmeAccounting.Application.Security.Common;
using SmeAccounting.Domain.Entities;
using SmeAccounting.Domain.Interfaces;
using SmeAccounting.Domain.Security;

namespace SmeAccounting.Application.Security.Commands.Login;

public sealed class LoginCommandHandler : IRequestHandler<LoginCommand, Result<TokenResponse>>
{
    private readonly IUserRepository _userRepo;
    private readonly IRoleRepository _roleRepo;
    private readonly ITokenService _tokenService;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICompanyPasswordPolicyRepository _policyRepo;

    public LoginCommandHandler(
        IUserRepository userRepo,
        IRoleRepository roleRepo,
        ITokenService tokenService,
        IPasswordHasher passwordHasher,
        IUnitOfWork unitOfWork,
        ICompanyPasswordPolicyRepository policyRepo)
    {
        _userRepo = userRepo;
        _roleRepo = roleRepo;
        _tokenService = tokenService;
        _passwordHasher = passwordHasher;
        _unitOfWork = unitOfWork;
        _policyRepo = policyRepo;
    }

    public async Task<Result<TokenResponse>> Handle(LoginCommand command, CancellationToken ct)
    {
        var user = await _userRepo.GetByUsernameAsync(command.Username, ct);
        if (user == null)
        {
            LogAttempt(command.Username, LoginResult.InvalidCredentials, command);
            return Result.Fail("Invalid username or password");
        }

        if (!user.IsActive)
        {
            LogAttempt(command.Username, LoginResult.AccountInactive, command, user.Id);
            return Result.Fail("Account is inactive");
        }

        if (user.IsLockedOut())
        {
            LogAttempt(command.Username, LoginResult.AccountLocked, command, user.Id);
            return Result.Fail("Account is locked. Try again later.");
        }

        var policy = await _policyRepo.GetByCompanyIdAsync(user.CompanyId, ct)
            ?? new CompanyPasswordPolicy(user.CompanyId);

        if (!_passwordHasher.Verify(command.Password, user.PasswordHash))
        {
            user.RecordFailedAttempt(policy.MaxLoginAttempts, policy.LockoutMinutes);
            _userRepo.Update(user);
            await _unitOfWork.SaveChangesAsync(ct);
            LogAttempt(command.Username, LoginResult.InvalidCredentials, command, user.Id);
            return Result.Fail("Invalid username or password");
        }

        user.SetLastLogin();
        _userRepo.Update(user);

        var roleNames = user.Roles.Select(r => r.Name).ToList();
        var permissions = await _roleRepo.GetUserEffectivePermissionsAsync(user.Id, ct);

        var tokens = _tokenService.GenerateTokens(user.Id, user.Username, user.Email, roleNames, permissions.ToList());

        var refreshToken = new Domain.Security.RefreshToken(tokens.RefreshToken, Guid.NewGuid().ToString(), user.Id,
            tokens.RefreshTokenExpiresAt, command.DeviceInfo, command.IpAddress);
        _userRepo.AddRefreshToken(refreshToken);

        await _unitOfWork.SaveChangesAsync(ct);
        LogAttempt(command.Username, LoginResult.Success, command, user.Id);

        return Result.Ok(new TokenResponse(tokens.AccessToken, tokens.RefreshToken, tokens.ExpiresAt));
    }

    private void LogAttempt(string username, LoginResult result, LoginCommand command, Guid? userId = null)
    {
        var attempt = new LoginAttempt(username, command.IpAddress ?? "unknown", result, userId, command.DeviceInfo,
            result == LoginResult.Success ? null : result.ToString());
        _userRepo.AddLoginAttempt(attempt);
    }
}
