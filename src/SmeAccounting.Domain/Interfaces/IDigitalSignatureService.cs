namespace SmeAccounting.Domain.Interfaces;

public class SignDocumentResult
{
    public bool IsSuccess { get; init; }
    public byte[]? SignedData { get; init; }
    public string? SignatureId { get; init; }
    public string? ErrorMessage { get; init; }

    public static SignDocumentResult Success(byte[] signedData, string signatureId) =>
        new() { IsSuccess = true, SignedData = signedData, SignatureId = signatureId };

    public static SignDocumentResult Fail(string errorMessage) =>
        new() { IsSuccess = false, ErrorMessage = errorMessage };
}

public class VerifySignatureResult
{
    public bool IsValid { get; init; }
    public string? SignerName { get; init; }
    public DateTime? SignedAt { get; init; }
    public string? ErrorMessage { get; init; }

    public static VerifySignatureResult Valid(string signerName, DateTime signedAt) =>
        new() { IsValid = true, SignerName = signerName, SignedAt = signedAt };

    public static VerifySignatureResult Invalid(string errorMessage) =>
        new() { IsValid = false, ErrorMessage = errorMessage };
}

public interface IDigitalSignatureService
{
    Task<SignDocumentResult> SignAsync(byte[] documentData, Guid userId, CancellationToken ct = default);
    Task<VerifySignatureResult> VerifyAsync(byte[] signedData, CancellationToken ct = default);
}
