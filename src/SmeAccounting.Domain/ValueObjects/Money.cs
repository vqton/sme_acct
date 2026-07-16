namespace SmeAccounting.Domain.ValueObjects;

public record Money(decimal Amount, string CurrencyCode)
{
    public static Money Zero(string currencyCode = "USD") => new(0, currencyCode);

    public Money Add(Money other)
    {
        if (other is null)
            throw new ArgumentNullException(nameof(other));
        if (!string.Equals(CurrencyCode, other.CurrencyCode, StringComparison.Ordinal))
            throw new ArgumentException($"Currency mismatch: {CurrencyCode} vs {other.CurrencyCode}", nameof(other));
        return this with { Amount = Amount + other.Amount };
    }

    public Money Subtract(Money other)
    {
        if (other is null)
            throw new ArgumentNullException(nameof(other));
        if (!string.Equals(CurrencyCode, other.CurrencyCode, StringComparison.Ordinal))
            throw new ArgumentException($"Currency mismatch: {CurrencyCode} vs {other.CurrencyCode}", nameof(other));
        return this with { Amount = Amount - other.Amount };
    }

    public Money Negate() => this with { Amount = -Amount };
}
