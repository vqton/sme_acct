using SmeAccounting.Domain.Entities;

namespace SmeAccounting.Domain.Workflow;

public enum ApprovalRole
{
    Approver = 1,
    Reviewer = 2,
    FinalApprover = 3
}

public class ApprovalWorkflow : BaseEntity
{
    public Guid EntityId { get; private set; }
    public string EntityType { get; private set; } = string.Empty;
    public ApprovalStatus Status { get; private set; }
    public Guid SubmittedBy { get; private set; }
    public int RequiredApprovals { get; private set; }
    public decimal? ThresholdAmount { get; private set; }

    private readonly List<ApprovalStep> _steps = new();
    public IReadOnlyCollection<ApprovalStep> Steps => _steps.AsReadOnly();

    private ApprovalWorkflow() { }

    public ApprovalWorkflow(Guid entityId, string entityType, Guid submittedBy, int requiredApprovals = 1, decimal? thresholdAmount = null)
    {
        EntityId = entityId;
        EntityType = entityType;
        SubmittedBy = submittedBy;
        Status = ApprovalStatus.Draft;
        RequiredApprovals = requiredApprovals;
        ThresholdAmount = thresholdAmount;
    }

    public void Submit()
    {
        if (Status != ApprovalStatus.Draft)
            throw new InvalidOperationException($"Cannot submit in {Status} state");

        Status = ApprovalStatus.PendingApproval;
    }

    public void Approve(Guid approverId, string? comment = null)
    {
        if (Status != ApprovalStatus.PendingApproval)
            throw new InvalidOperationException($"Cannot approve in {Status} state");

        _steps.Add(new ApprovalStep(approverId, true, comment));

        var approvedCount = _steps.Count(s => s.IsApproved);
        if (approvedCount >= RequiredApprovals)
            Status = ApprovalStatus.Approved;
    }

    public void Reject(Guid approverId, string reason)
    {
        if (Status != ApprovalStatus.PendingApproval)
            throw new InvalidOperationException($"Cannot reject in {Status} state");

        if (string.IsNullOrWhiteSpace(reason))
            throw new ArgumentException("Rejection requires a reason");

        _steps.Add(new ApprovalStep(approverId, false, reason));
        Status = ApprovalStatus.Rejected;
    }

    public bool CanTransitionTo(ApprovalStatus target) => (Status, target) switch
    {
        (ApprovalStatus.Draft, ApprovalStatus.PendingApproval) => true,
        (ApprovalStatus.PendingApproval, ApprovalStatus.Approved) => true,
        (ApprovalStatus.PendingApproval, ApprovalStatus.Rejected) => true,
        _ => false
    };
}

public class ApprovalStep : BaseEntity
{
    public Guid ApproverId { get; private set; }
    public bool IsApproved { get; private set; }
    public string? Comment { get; private set; }
    public DateTime ActionedAt { get; private set; }

    private ApprovalStep() { }

    public ApprovalStep(Guid approverId, bool isApproved, string? comment)
    {
        ApproverId = approverId;
        IsApproved = isApproved;
        Comment = comment;
        ActionedAt = DateTime.UtcNow;
    }
}
