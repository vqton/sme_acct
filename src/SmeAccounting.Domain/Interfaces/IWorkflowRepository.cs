using SmeAccounting.Domain.Workflow;

namespace SmeAccounting.Domain.Interfaces;

public interface IWorkflowRepository
{
    Task<ApprovalWorkflow?> GetByEntityIdAsync(Guid entityId, CancellationToken ct = default);
    void Add(ApprovalWorkflow workflow);
    void Update(ApprovalWorkflow workflow);
}
