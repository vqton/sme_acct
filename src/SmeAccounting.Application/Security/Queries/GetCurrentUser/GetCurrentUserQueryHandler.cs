using FluentResults;
using MediatR;
using SmeAccounting.Application.Security.Common;
using SmeAccounting.Domain.Interfaces;

namespace SmeAccounting.Application.Security.Queries.GetCurrentUser;

public class GetCurrentUserQueryHandler : IRequestHandler<GetCurrentUserQuery, Result<UserDto>>
{
    private readonly IUserRepository _userRepo;
    private readonly IRoleRepository _roleRepo;

    public GetCurrentUserQueryHandler(IUserRepository userRepo, IRoleRepository roleRepo)
    {
        _userRepo = userRepo;
        _roleRepo = roleRepo;
    }

    public async Task<Result<UserDto>> Handle(GetCurrentUserQuery query, CancellationToken ct)
    {
        var user = await _userRepo.GetByIdAsync(query.UserId, ct);
        if (user == null)
            return Result.Fail("User not found");

        var permissions = await _roleRepo.GetUserEffectivePermissionsAsync(user.Id, ct);
        var dto = new UserDto(
            user.Id, user.Username, user.Email, user.FirstName, user.LastName,
            user.IsActive, user.Roles.Select(r => r.Name).ToList(), permissions
        );
        return Result.Ok(dto);
    }
}
