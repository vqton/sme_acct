namespace SmeAccounting.Domain.Interfaces;

public class SubmitTaxDeclarationResult
{
    public bool IsSuccess { get; init; }
    public string? SubmissionId { get; init; }
    public string? ReceiptNumber { get; init; }
    public string? ErrorMessage { get; init; }

    public static SubmitTaxDeclarationResult Success(string submissionId, string receiptNumber) =>
        new() { IsSuccess = true, SubmissionId = submissionId, ReceiptNumber = receiptNumber };

    public static SubmitTaxDeclarationResult Fail(string errorMessage) =>
        new() { IsSuccess = false, ErrorMessage = errorMessage };
}

public interface ITaxService
{
    Task<SubmitTaxDeclarationResult> SubmitMonthlyDeclarationAsync(string taxCode, string declarationXml, CancellationToken ct = default);
}
