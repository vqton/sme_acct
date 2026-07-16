using FluentResults;
using MediatR;

namespace SmeAccounting.Application.Admin.Users.Queries;

public record GetUserQuery(Guid Id) : IRequest<Result<UserDetailDto>>;

public record UserDetailDto(Guid Id, string Username, string Email, string FirstName, string LastName, string FullName,
    bool IsActive, bool MfaEnabled, Guid CompanyId, DateTime? LastLogin, DateTime CreatedAt,
    List<RoleAssignmentDto> Roles);

public record RoleAssignmentDto(Guid RoleId, string RoleName, string? RoleDescription);
