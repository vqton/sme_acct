using FluentResults;
using MediatR;
using SmeAccounting.Domain.Interfaces;

namespace SmeAccounting.Application.Admin.Users.Queries;

public sealed class ListUsersQueryHandler : IRequestHandler<ListUsersQuery, Result<PaginatedUsersResult>>
{
    private readonly IUserRepository _userRepo;

    public ListUsersQueryHandler(IUserRepository userRepo) => _userRepo = userRepo;

    public async Task<Result<PaginatedUsersResult>> Handle(ListUsersQuery query, CancellationToken ct)
    {
        var all = query.CompanyId.HasValue
            ? await _userRepo.GetByCompanyAsync(query.CompanyId.Value, ct)
            : await _userRepo.GetAllAsync(ct);

        var filtered = all.AsEnumerable();
        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var s = query.Search.ToLowerInvariant();
            filtered = filtered.Where(u =>
                u.Username.Contains(s, StringComparison.OrdinalIgnoreCase) ||
                u.Email.Contains(s, StringComparison.OrdinalIgnoreCase) ||
                u.FullName.Contains(s, StringComparison.OrdinalIgnoreCase));
        }

        var list = filtered.ToList();
        var total = list.Count;
        var items = list
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .Select(u => new UserListItemDto(
                u.Id, u.Username, u.Email, u.FullName,
                u.IsActive, u.Roles.Select(r => r.Name).ToList(),
                u.LastLogin, u.CreatedAt))
            .ToList();

        return Result.Ok(new PaginatedUsersResult(items, total, query.Page, query.PageSize));
    }
}
