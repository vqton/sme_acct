using FluentResults;
using MediatR;
using SmeAccounting.Domain.Enums;

namespace SmeAccounting.Application.Accounts.Commands.CreateAccount;

public record CreateAccountCommand(
    string Code,
    string Name,
    AccountType Type,
    string? Description = null,
    Guid? ParentId = null
) : IRequest<Result<Guid>>;
