using SmeAccounting.Domain.Enums;

namespace SmeAccounting.Domain.Entities;

public class FiscalPeriod : BaseEntity
{
    public int PeriodNumber { get; private set; }
    public string Label { get; private set; } = string.Empty;
    public DateOnly StartDate { get; private set; }
    public DateOnly EndDate { get; private set; }
    public FiscalPeriodStatus Status { get; private set; }
    public Guid FiscalYearId { get; private set; }
    public FiscalYear FiscalYear { get; private set; } = null!;

    private FiscalPeriod() { }

    public FiscalPeriod(int periodNumber, string label, DateOnly start, DateOnly end, Guid fiscalYearId)
    {
        PeriodNumber = periodNumber;
        Label = label;
        StartDate = start;
        EndDate = end;
        FiscalYearId = fiscalYearId;
        Status = FiscalPeriodStatus.Open;
    }

    public void Open() { Status = FiscalPeriodStatus.Open; }
    public void Close() { Status = FiscalPeriodStatus.Closed; }
    public void Lock() { Status = FiscalPeriodStatus.Locked; }
}
