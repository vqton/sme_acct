namespace SmeAccounting.Domain.Interfaces;

public class VNeIDIdentityResult
{
    public bool IsSuccess { get; init; }
    public string? FullName { get; init; }
    public string? NationalId { get; init; }
    public DateOnly? DateOfBirth { get; init; }
    public string? ErrorMessage { get; init; }

    public static VNeIDIdentityResult Success(string fullName, string nationalId, DateOnly dateOfBirth) =>
        new() { IsSuccess = true, FullName = fullName, NationalId = nationalId, DateOfBirth = dateOfBirth };

    public static VNeIDIdentityResult Fail(string errorMessage) =>
        new() { IsSuccess = false, ErrorMessage = errorMessage };
}

public interface IVNeIDService
{
    Task<VNeIDIdentityResult> VerifyIdentityAsync(string vneidNumber, string fullName, DateOnly dateOfBirth, CancellationToken ct = default);
}
