using FluentResults;
using MediatR;

namespace SmeAccounting.Application.Admin.Roles.Commands;

public record DeleteRoleCommand(Guid Id) : IRequest<Result>;
