using FluentResults;
using MediatR;

namespace SmeAccounting.Application.Admin.Roles.Commands;

public record UpdateRoleCommand(Guid Id, string Name, string? Description) : IRequest<Result>;
