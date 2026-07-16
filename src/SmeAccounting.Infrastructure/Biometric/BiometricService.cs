using System.Security.Cryptography;
using SmeAccounting.Domain.Interfaces;

namespace SmeAccounting.Infrastructure.Biometric;

public sealed class BiometricService : IBiometricService
{
    private readonly Dictionary<Guid, (byte[] hash, DateTime enrolledAt)> _store = new();

    public Task<BiometricEnrollResult> EnrollAsync(Guid userId, byte[] biometricData, CancellationToken ct = default)
    {
        var hash = SHA256.HashData(biometricData);
        _store[userId] = (hash, DateTime.UtcNow);
        return Task.FromResult(BiometricEnrollResult.Success($"bio-{userId:N}"));
    }

    public Task<BiometricVerifyResult> VerifyAsync(Guid userId, byte[] biometricData, CancellationToken ct = default)
    {
        if (!_store.TryGetValue(userId, out var stored))
            return Task.FromResult(BiometricVerifyResult.NoMatch("User not enrolled"));

        var hash = SHA256.HashData(biometricData);
        var isMatch = stored.hash.SequenceEqual(hash);

        return Task.FromResult(isMatch
            ? BiometricVerifyResult.Match(0.99f)
            : BiometricVerifyResult.NoMatch());
    }
}
