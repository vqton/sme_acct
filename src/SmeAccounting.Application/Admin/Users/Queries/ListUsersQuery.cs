using FluentResults;
using MediatR;

namespace SmeAccounting.Application.Admin.Users.Queries;

public record ListUsersQuery(Guid? CompanyId = null, string? Search = null, int Page = 1, int PageSize = 20) : IRequest<Result<PaginatedUsersResult>>;

public record PaginatedUsersResult(List<UserListItemDto> Items, int TotalCount, int Page, int PageSize);
public record UserListItemDto(Guid Id, string Username, string Email, string FullName, bool IsActive, List<string> Roles, DateTime? LastLogin, DateTime CreatedAt);
