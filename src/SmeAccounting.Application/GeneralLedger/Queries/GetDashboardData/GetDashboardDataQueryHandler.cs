using FluentResults;
using MediatR;
using SmeAccounting.Application.Common.Interfaces;
using SmeAccounting.Domain.Interfaces;

namespace SmeAccounting.Application.GeneralLedger.Queries.GetDashboardData;

public sealed class GetDashboardDataQueryHandler : IRequestHandler<GetDashboardDataQuery, Result<DashboardDataDto>>
{
    private readonly IUserRepository _userRepo;
    private readonly IDashboardDataSource _dataSource;

    public GetDashboardDataQueryHandler(IUserRepository userRepo, IDashboardDataSource dataSource)
    {
        _userRepo = userRepo;
        _dataSource = dataSource;
    }

    public async Task<Result<DashboardDataDto>> Handle(GetDashboardDataQuery query, CancellationToken ct)
    {
        var user = await _userRepo.GetByIdAsync(query.UserId, ct);
        if (user is null)
            return Result.Fail("User not found");

        var data = await _dataSource.GetDashboardDataAsync(user.CompanyId, ct);
        return Result.Ok(data);
    }
}
