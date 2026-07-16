using FluentResults;
using MediatR;

namespace SmeAccounting.Application.Workflow.Commands;

public record SubmitForApprovalCommand(Guid EntityId, string EntityType, int RequiredApprovals = 1, decimal? ThresholdAmount = null) : IRequest<Result>;
