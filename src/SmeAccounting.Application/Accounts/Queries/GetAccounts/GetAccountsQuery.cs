using FluentResults;
using MediatR;

namespace SmeAccounting.Application.Accounts.Queries.GetAccounts;

public record GetAccountsQuery(bool? OnlyRoots = null) : IRequest<Result<List<AccountDto>>>;

public record AccountDto(Guid Id, string Code, string Name, string Type, string NormalBalance, bool IsActive, Guid? ParentId);
