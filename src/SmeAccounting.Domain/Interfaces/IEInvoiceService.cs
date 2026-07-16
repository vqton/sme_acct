namespace SmeAccounting.Domain.Interfaces;

public class SubmitInvoiceResult
{
    public bool IsSuccess { get; init; }
    public string? InvoiceId { get; init; }
    public string? TaxAuthorityReference { get; init; }
    public string? ErrorMessage { get; init; }

    public static SubmitInvoiceResult Success(string invoiceId, string taxAuthorityReference) =>
        new() { IsSuccess = true, InvoiceId = invoiceId, TaxAuthorityReference = taxAuthorityReference };

    public static SubmitInvoiceResult Fail(string errorMessage) =>
        new() { IsSuccess = false, ErrorMessage = errorMessage };
}

public interface IEInvoiceService
{
    Task<SubmitInvoiceResult> SubmitInvoiceAsync(string invoiceXml, CancellationToken ct = default);
}
