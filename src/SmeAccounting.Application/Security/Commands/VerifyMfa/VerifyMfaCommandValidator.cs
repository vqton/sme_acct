using FluentValidation;

namespace SmeAccounting.Application.Security.Commands.VerifyMfa;

public class VerifyMfaCommandValidator : AbstractValidator<VerifyMfaCommand>
{
    public VerifyMfaCommandValidator()
    {
        RuleFor(v => v.UserId).NotEmpty();
        RuleFor(v => v.Code).NotEmpty().Length(6, 8);
    }
}
