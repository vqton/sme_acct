using FluentResults;
using MediatR;

namespace SmeAccounting.Application.Admin.Users.Commands;

public record DeleteUserCommand(Guid Id) : IRequest<Result>;
