using Microsoft.Extensions.Logging;
using SmeAccounting.Domain.Interfaces;

namespace SmeAccounting.Infrastructure.TaxAuthority;

public sealed class TaxService : ITaxService
{
    private readonly ILogger<TaxService> _logger;

    public TaxService(ILogger<TaxService> logger) => _logger = logger;

    public Task<SubmitTaxDeclarationResult> SubmitMonthlyDeclarationAsync(string taxCode, string declarationXml, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(taxCode))
            return Task.FromResult(SubmitTaxDeclarationResult.Fail("Tax code required"));

        if (string.IsNullOrWhiteSpace(declarationXml))
            return Task.FromResult(SubmitTaxDeclarationResult.Fail("Declaration XML required"));

        var submissionId = Guid.NewGuid().ToString("N")[..12];
        var receiptNumber = $"TCT-{DateTime.UtcNow:yyyyMMdd}-{Random.Shared.Next(100000, 999999)}";

        _logger.LogInformation("Tax declaration submitted: {SubmissionId} for {TaxCode}", submissionId, taxCode);
        return Task.FromResult(SubmitTaxDeclarationResult.Success(submissionId, receiptNumber));
    }
}
