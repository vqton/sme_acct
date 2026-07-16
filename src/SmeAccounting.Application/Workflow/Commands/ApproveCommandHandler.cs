using FluentResults;
using MediatR;
using SmeAccounting.Domain.Interfaces;
using SmeAccounting.Domain.Workflow;

namespace SmeAccounting.Application.Workflow.Commands;

public sealed class ApproveCommandHandler : IRequestHandler<ApproveCommand, Result>
{
    private readonly IWorkflowRepository _repo;
    private readonly IUnitOfWork _unitOfWork;

    public ApproveCommandHandler(IWorkflowRepository repo, IUnitOfWork unitOfWork)
    {
        _repo = repo;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(ApproveCommand command, CancellationToken ct)
    {
        var workflow = await _repo.GetByEntityIdAsync(command.EntityId, ct);
        if (workflow is null)
            return Result.Fail("Workflow not found");

        try
        {
            workflow.Approve(command.ApproverId, command.Comment);
            _repo.Update(workflow);
            await _unitOfWork.SaveChangesAsync(ct);
            return Result.Ok();
        }
        catch (InvalidOperationException ex)
        {
            return Result.Fail(ex.Message);
        }
    }
}
