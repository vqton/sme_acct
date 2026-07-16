using FluentResults;
using MediatR;
using SmeAccounting.Domain.GeneralLedger;
using SmeAccounting.Domain.Interfaces;

namespace SmeAccounting.Application.Accounts.Commands.CreateAccount;

public sealed class CreateAccountCommandHandler : IRequestHandler<CreateAccountCommand, Result<Guid>>
{
    private readonly IAccountRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateAccountCommandHandler(IAccountRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<Guid>> Handle(CreateAccountCommand command, CancellationToken ct)
    {
        var exists = await _repository.CodeExistsAsync(command.Code, ct);
        if (exists)
            return Result.Fail($"Account code '{command.Code}' already exists");

        var account = new Account(command.Code, command.Name, command.Type, command.Description, command.ParentId);
        _repository.Add(account);
        await _unitOfWork.SaveChangesAsync(ct);
        return Result.Ok(account.Id);
    }
}
