namespace SmeAccounting.Domain.ValueObjects;

public record Money(decimal Amount, string CurrencyCode)
{
    public static Money Zero(string currencyCode = "USD") => new(0, currencyCode);

    public Money Add(Money other)
    {
        if (CurrencyCode != other.CurrencyCode)
            throw new InvalidOperationException($"Currency mismatch: {CurrencyCode} vs {other.CurrencyCode}");
        return this with { Amount = Amount + other.Amount };
    }

    public Money Subtract(Money other)
    {
        if (CurrencyCode != other.CurrencyCode)
            throw new InvalidOperationException($"Currency mismatch: {CurrencyCode} vs {other.CurrencyCode}");
        return this with { Amount = Amount - other.Amount };
    }

    public Money Negate() => this with { Amount = -Amount };
}
