using System.Text.RegularExpressions;

namespace SmeAccounting.Web.Models;

public partial class EnterpriseCode : IEquatable<EnterpriseCode>
{
    private static readonly Regex FormatRegex = EnterpriseCodeRegex();

    public string Value { get; }

    private EnterpriseCode(string value) => Value = value;

    public static Result<EnterpriseCode> Create(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return Result<EnterpriseCode>.Failure("Enterprise code format: must be 10 digits");

        if (!FormatRegex.IsMatch(value))
            return Result<EnterpriseCode>.Failure("Enterprise code format: must be exactly 10 digits (^\\d{10}$)");

        return Result<EnterpriseCode>.Success(new EnterpriseCode(value));
    }

    public bool Equals(EnterpriseCode? other) => other is not null && Value == other.Value;
    public override bool Equals(object? obj) => obj is EnterpriseCode other && Equals(other);
    public override int GetHashCode() => Value.GetHashCode();
    public override string ToString() => Value;
    public static implicit operator string(EnterpriseCode code) => code.Value;

    [GeneratedRegex(@"^\d{10}$")]
    private static partial Regex EnterpriseCodeRegex();
}
