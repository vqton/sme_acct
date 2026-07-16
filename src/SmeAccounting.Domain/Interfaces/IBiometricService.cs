namespace SmeAccounting.Domain.Interfaces;

public class BiometricEnrollResult
{
    public bool IsSuccess { get; init; }
    public string? BiometricId { get; init; }
    public string? ErrorMessage { get; init; }

    public static BiometricEnrollResult Success(string biometricId) =>
        new() { IsSuccess = true, BiometricId = biometricId };

    public static BiometricEnrollResult Fail(string errorMessage) =>
        new() { IsSuccess = false, ErrorMessage = errorMessage };
}

public class BiometricVerifyResult
{
    public bool IsMatch { get; init; }
    public float Confidence { get; init; }
    public string? ErrorMessage { get; init; }

    public static BiometricVerifyResult Match(float confidence) =>
        new() { IsMatch = true, Confidence = confidence };

    public static BiometricVerifyResult NoMatch(string? errorMessage = null) =>
        new() { IsMatch = false, Confidence = 0, ErrorMessage = errorMessage };
}

public interface IBiometricService
{
    Task<BiometricEnrollResult> EnrollAsync(Guid userId, byte[] biometricData, CancellationToken ct = default);
    Task<BiometricVerifyResult> VerifyAsync(Guid userId, byte[] biometricData, CancellationToken ct = default);
}
