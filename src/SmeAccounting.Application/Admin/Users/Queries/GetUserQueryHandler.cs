using FluentResults;
using MediatR;
using SmeAccounting.Domain.Interfaces;

namespace SmeAccounting.Application.Admin.Users.Queries;

public sealed class GetUserQueryHandler : IRequestHandler<GetUserQuery, Result<UserDetailDto>>
{
    private readonly IUserRepository _userRepo;

    public GetUserQueryHandler(IUserRepository userRepo) => _userRepo = userRepo;

    public async Task<Result<UserDetailDto>> Handle(GetUserQuery query, CancellationToken ct)
    {
        var user = await _userRepo.GetByIdAsync(query.Id, ct);
        if (user is null)
            return Result.Fail("User not found");

        var dto = new UserDetailDto(
            user.Id, user.Username, user.Email, user.FirstName, user.LastName, user.FullName,
            user.IsActive, user.MfaEnabled, user.CompanyId, user.LastLogin, user.CreatedAt,
            user.Roles.Select(r => new RoleAssignmentDto(r.Id, r.Name, r.Description)).ToList());

        return Result.Ok(dto);
    }
}
