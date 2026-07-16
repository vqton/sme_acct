using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using SmeAccounting.Domain.Rules;
using SmeAccounting.Infrastructure.Persistence;

namespace SmeAccounting.Infrastructure.Rules;

public sealed class RegulatoryRuleEngine
{
    private readonly ApplicationDbContext _context;

    public RegulatoryRuleEngine(ApplicationDbContext context) => _context = context;

    public async Task<decimal> GetTaxRateAsync(string taxType, DateOnly asOf, CancellationToken ct = default)
    {
        var rule = await _context.Set<RegulatoryRule>()
            .Where(r => r.RuleCode == $"TAX_RATE_{taxType}" && r.IsActive
                && r.EffectiveFrom <= asOf && (r.EffectiveTo == null || r.EffectiveTo >= asOf))
            .OrderByDescending(r => r.EffectiveFrom)
            .FirstOrDefaultAsync(ct);

        if (rule is null) return 0.1m;

        var config = JsonSerializer.Deserialize<JsonElement>(rule.JsonConfig);
        return config.TryGetProperty("rate", out var rate) ? rate.GetDecimal() / 100m : 0.1m;
    }

    public async Task<decimal> GetThresholdAsync(string thresholdType, CancellationToken ct = default)
    {
        var rule = await _context.Set<RegulatoryRule>()
            .Where(r => r.RuleCode == $"THRESHOLD_{thresholdType}" && r.IsActive)
            .OrderByDescending(r => r.EffectiveFrom)
            .FirstOrDefaultAsync(ct);

        if (rule is null) return 0;

        var config = JsonSerializer.Deserialize<JsonElement>(rule.JsonConfig);
        return config.TryGetProperty("amount", out var amount) ? amount.GetDecimal() : 0;
    }
}
