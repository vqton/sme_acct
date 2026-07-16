using FluentResults;
using MediatR;

namespace SmeAccounting.Application.Workflow.Commands;

public record RejectCommand(Guid EntityId, Guid RejectorId, string Reason) : IRequest<Result>;
