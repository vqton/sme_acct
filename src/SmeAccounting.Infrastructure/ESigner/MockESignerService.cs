using System.Security.Cryptography;
using System.Text;
using SmeAccounting.Domain.Interfaces;

namespace SmeAccounting.Infrastructure.ESigner;

public sealed class MockESignerService : IDigitalSignatureService
{
    private readonly Dictionary<string, (byte[] data, string signer, DateTime signedAt)> _signatures = new();

    public Task<SignDocumentResult> SignAsync(byte[] documentData, Guid userId, CancellationToken ct = default)
    {
        var signatureId = Guid.NewGuid().ToString("N");
        var hash = SHA256.HashData(documentData);
        _signatures[signatureId] = (hash, $"User-{userId:N}", DateTime.UtcNow);
        return Task.FromResult(SignDocumentResult.Success(documentData, signatureId));
    }

    public Task<VerifySignatureResult> VerifyAsync(byte[] signedData, CancellationToken ct = default)
    {
        var hash = SHA256.HashData(signedData);
        var match = _signatures.FirstOrDefault(kv => kv.Value.data.SequenceEqual(hash));
        if (match.Value.data is null)
            return Task.FromResult(VerifySignatureResult.Invalid("Signature not found"));

        return Task.FromResult(VerifySignatureResult.Valid(match.Value.signer, match.Value.signedAt));
    }
}
