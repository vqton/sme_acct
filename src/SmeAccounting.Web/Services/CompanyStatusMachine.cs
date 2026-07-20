using SmeAccounting.Web.Models;

namespace SmeAccounting.Web.Services;

public static class CompanyStatusMachine
{
    private static readonly Dictionary<CompanyStatus, HashSet<CompanyStatus>> Transitions = new()
    {
        [CompanyStatus.Active] = [CompanyStatus.Suspended, CompanyStatus.Dissolved, CompanyStatus.Bankrupt, CompanyStatus.Converting],
        [CompanyStatus.Suspended] = [CompanyStatus.Active, CompanyStatus.Dissolved],
        [CompanyStatus.Converting] = [CompanyStatus.Active, CompanyStatus.Dissolved],
        [CompanyStatus.Dissolved] = [],
        [CompanyStatus.Bankrupt] = [],
        [CompanyStatus.Merged] = [],
    };

    public static bool CanTransition(CompanyStatus from, CompanyStatus to)
    {
        if (from == to) return false;
        return Transitions.TryGetValue(from, out var allowed) && allowed.Contains(to);
    }

    public static IReadOnlySet<CompanyStatus> GetAllowedTransitions(CompanyStatus from)
    {
        return Transitions.TryGetValue(from, out var allowed) ? allowed : new HashSet<CompanyStatus>();
    }
}
