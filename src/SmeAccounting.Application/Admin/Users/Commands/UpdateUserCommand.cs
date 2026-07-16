using FluentResults;
using MediatR;

namespace SmeAccounting.Application.Admin.Users.Commands;

public record UpdateUserCommand(Guid Id, string Email, string FirstName, string LastName, bool IsActive) : IRequest<Result>;
