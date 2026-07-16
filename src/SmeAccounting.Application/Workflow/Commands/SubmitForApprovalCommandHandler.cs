using FluentResults;
using MediatR;
using SmeAccounting.Domain.Interfaces;
using SmeAccounting.Domain.Workflow;

namespace SmeAccounting.Application.Workflow.Commands;

public sealed class SubmitForApprovalCommandHandler : IRequestHandler<SubmitForApprovalCommand, Result>
{
    private readonly IWorkflowRepository _repo;
    private readonly IUnitOfWork _unitOfWork;

    public SubmitForApprovalCommandHandler(IWorkflowRepository repo, IUnitOfWork unitOfWork)
    {
        _repo = repo;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(SubmitForApprovalCommand command, CancellationToken ct)
    {
        var existing = await _repo.GetByEntityIdAsync(command.EntityId, ct);
        if (existing is not null)
            return Result.Fail("Workflow already exists for this entity");

        var workflow = new ApprovalWorkflow(command.EntityId, command.EntityType, Guid.Empty,
            command.RequiredApprovals, command.ThresholdAmount);
        workflow.Submit();

        _repo.Add(workflow);
        await _unitOfWork.SaveChangesAsync(ct);

        return Result.Ok();
    }
}
