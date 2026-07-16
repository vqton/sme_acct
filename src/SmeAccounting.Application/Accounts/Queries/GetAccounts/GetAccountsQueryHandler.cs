using FluentResults;
using MediatR;
using SmeAccounting.Domain.Interfaces;

namespace SmeAccounting.Application.Accounts.Queries.GetAccounts;

public sealed class GetAccountsQueryHandler : IRequestHandler<GetAccountsQuery, Result<List<AccountDto>>>
{
    private readonly IAccountRepository _repository;

    public GetAccountsQueryHandler(IAccountRepository repository) => _repository = repository;

    public async Task<Result<List<AccountDto>>> Handle(GetAccountsQuery query, CancellationToken ct)
    {
        var accounts = query.OnlyRoots == true
            ? await _repository.GetRootAccountsAsync(ct)
            : await _repository.GetAllAsync(ct);

        var dtos = accounts.Select(a => new AccountDto(
            a.Id, a.Code, a.Name, a.Type.ToString(), a.NormalBalance.ToString(), a.IsActive, a.ParentId
        )).ToList();

        return Result.Ok(dtos);
    }
}
