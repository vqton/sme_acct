using SmeAccounting.Application.GeneralLedger.Queries.GetDashboardData;

namespace SmeAccounting.Application.Common.Interfaces;

public interface IDashboardDataSource
{
    Task<DashboardDataDto> GetDashboardDataAsync(Guid companyId, CancellationToken ct = default);
}
