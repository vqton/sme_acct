using SmeAccounting.Domain.Enums;

namespace SmeAccounting.Domain.Entities;

public class FiscalYear : BaseEntity
{
    public int Year { get; private set; }
    public DateOnly StartDate { get; private set; }
    public DateOnly EndDate { get; private set; }
    public FiscalPeriodStatus Status { get; private set; }
    public Guid CompanyId { get; private set; }
    public Company Company { get; private set; } = null!;

    public ICollection<FiscalPeriod> Periods { get; private set; } = new List<FiscalPeriod>();

    private FiscalYear() { }

    public FiscalYear(int year, DateOnly start, DateOnly end, Guid companyId)
    {
        Year = year;
        StartDate = start;
        EndDate = end;
        CompanyId = companyId;
        Status = FiscalPeriodStatus.Open;
    }

    public void Open() { Status = FiscalPeriodStatus.Open; }
    public void Close() { Status = FiscalPeriodStatus.Closed; }
    public void Lock() { Status = FiscalPeriodStatus.Locked; }
}
