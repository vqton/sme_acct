using Microsoft.EntityFrameworkCore;
using SmeAccounting.Domain.Interfaces;
using SmeAccounting.Domain.Workflow;

namespace SmeAccounting.Infrastructure.Persistence.Repositories;

public sealed class WorkflowRepository : IWorkflowRepository
{
    private readonly ApplicationDbContext _context;

    public WorkflowRepository(ApplicationDbContext context) => _context = context;

    public async Task<ApprovalWorkflow?> GetByEntityIdAsync(Guid entityId, CancellationToken ct = default) =>
        await _context.Set<ApprovalWorkflow>().Include(w => w.Steps).FirstOrDefaultAsync(w => w.EntityId == entityId, ct);

    public void Add(ApprovalWorkflow workflow) => _context.Set<ApprovalWorkflow>().Add(workflow);
    public void Update(ApprovalWorkflow workflow) => _context.Set<ApprovalWorkflow>().Update(workflow);
}
