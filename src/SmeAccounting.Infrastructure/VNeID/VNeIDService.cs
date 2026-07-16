using System.Net.Http.Json;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using SmeAccounting.Domain.Interfaces;

namespace SmeAccounting.Infrastructure.VNeID;

public sealed class VNeIDService : IVNeIDService
{
    private readonly HttpClient _httpClient;
    private readonly VNeIDOptions _options;
    private readonly ILogger<VNeIDService> _logger;

    public VNeIDService(HttpClient httpClient, IOptions<VNeIDOptions> options, ILogger<VNeIDService> logger)
    {
        _httpClient = httpClient;
        _options = options.Value;
        _logger = logger;
    }

    public async Task<VNeIDIdentityResult> VerifyIdentityAsync(string vneidNumber, string fullName, DateOnly dateOfBirth, CancellationToken ct = default)
    {
        try
        {
            var request = new { vneidNumber, fullName, dateOfBirth = dateOfBirth.ToString("yyyy-MM-dd") };
            var response = await _httpClient.PostAsJsonAsync("/api/v1/verify", request, ct);
            response.EnsureSuccessStatusCode();

            var result = await response.Content.ReadFromJsonAsync<VNeIDApiResponse>(ct);
            if (result is null || !result.IsValid)
                return VNeIDIdentityResult.Fail(result?.ErrorMessage ?? "Verification failed");

            return VNeIDIdentityResult.Success(result.FullName!, result.NationalId!, DateOnly.Parse(result.DateOfBirth!));
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(ex, "VNeID API call failed for {VNeidNumber}", vneidNumber[..^4] + "****");
            return VNeIDIdentityResult.Fail("Identity verification service unavailable");
        }
    }

    private sealed class VNeIDApiResponse
    {
        public bool IsValid { get; init; }
        public string? FullName { get; init; }
        public string? NationalId { get; init; }
        public string? DateOfBirth { get; init; }
        public string? ErrorMessage { get; init; }
    }
}
