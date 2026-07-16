using FluentResults;
using MediatR;
using SmeAccounting.Domain.Interfaces;

namespace SmeAccounting.Application.Security.Commands.Logout;

public class LogoutCommandHandler : IRequestHandler<LogoutCommand, Result>
{
    private readonly IUserRepository _userRepo;
    private readonly IUnitOfWork _unitOfWork;

    public LogoutCommandHandler(IUserRepository userRepo, IUnitOfWork unitOfWork)
    {
        _userRepo = userRepo;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(LogoutCommand command, CancellationToken ct)
    {
        var stored = await _userRepo.GetRefreshTokenAsync(command.RefreshToken, ct);
        if (stored != null && stored.IsActive)
        {
            stored.Revoke();
            _userRepo.RevokeRefreshToken(stored);
            await _unitOfWork.SaveChangesAsync(ct);
        }
        return Result.Ok();
    }
}
