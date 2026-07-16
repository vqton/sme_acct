using FluentResults;
using MediatR;

namespace SmeAccounting.Application.Admin.Users.Commands;

public record CreateUserCommand(string Username, string Email, string Password, string FirstName, string LastName, Guid CompanyId, List<Guid>? RoleIds = null) : IRequest<Result<Guid>>;
