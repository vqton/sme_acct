using Microsoft.Extensions.Options;
using SmeAccounting.Domain.Interfaces;

namespace SmeAccounting.Infrastructure.VNeID;

public sealed class MockVNeIDService : IVNeIDService
{
    private readonly VNeIDOptions _options;

    public MockVNeIDService(IOptions<VNeIDOptions> options) => _options = options.Value;

    public Task<VNeIDIdentityResult> VerifyIdentityAsync(string vneidNumber, string fullName, DateOnly dateOfBirth, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(vneidNumber) || string.IsNullOrWhiteSpace(fullName))
            return Task.FromResult(VNeIDIdentityResult.Fail("Invalid input"));

        if (vneidNumber.Length is < 9 or > 12)
            return Task.FromResult(VNeIDIdentityResult.Fail("Invalid VNeID number format"));

        return Task.FromResult(VNeIDIdentityResult.Success(fullName, vneidNumber, dateOfBirth));
    }
}
