using FluentValidation;

namespace SmeAccounting.Application.Accounts.Commands.CreateAccount;

public class CreateAccountCommandValidator : AbstractValidator<CreateAccountCommand>
{
    public CreateAccountCommandValidator()
    {
        RuleFor(v => v.Code).NotEmpty().MaximumLength(50);
        RuleFor(v => v.Name).NotEmpty().MaximumLength(200);
        RuleFor(v => v.Type).IsInEnum();
    }
}
