using SmeAccounting.Domain.Interfaces;

namespace SmeAccounting.Infrastructure.EInvoice;

public sealed class MockEInvoiceService : IEInvoiceService
{
    public Task<SubmitInvoiceResult> SubmitInvoiceAsync(string invoiceXml, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(invoiceXml))
            return Task.FromResult(SubmitInvoiceResult.Fail("Empty invoice XML"));

        if (!invoiceXml.Contains("<Invoice", StringComparison.OrdinalIgnoreCase))
            return Task.FromResult(SubmitInvoiceResult.Fail("Invalid invoice XML format"));

        var invoiceId = Guid.NewGuid().ToString("N")[..12];
        var taxRef = $"TCT-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid():N}"[..30];

        return Task.FromResult(SubmitInvoiceResult.Success(invoiceId, taxRef));
    }
}
