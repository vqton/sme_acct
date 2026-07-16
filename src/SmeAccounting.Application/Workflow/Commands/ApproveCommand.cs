using FluentResults;
using MediatR;

namespace SmeAccounting.Application.Workflow.Commands;

public record ApproveCommand(Guid EntityId, Guid ApproverId, string? Comment = null) : IRequest<Result>;
