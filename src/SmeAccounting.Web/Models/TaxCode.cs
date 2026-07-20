using System.Text.RegularExpressions;

namespace SmeAccounting.Web.Models;

public partial class TaxCode : IEquatable<TaxCode>
{
    private static readonly Regex FormatRegex = TaxCodeRegex();

    public string Value { get; }

    private TaxCode(string value) => Value = value;

    public static Result<TaxCode> Create(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return Result<TaxCode>.Failure("Tax code format: must be 10 digits or 10-3 digits");

        if (!FormatRegex.IsMatch(value))
            return Result<TaxCode>.Failure("Tax code format: must match ^\\d{10}(-\\d{3})?$");

        var mainPart = value.Split('-')[0];
        if (!ValidateChecksum(mainPart))
            return Result<TaxCode>.Failure("Tax code checksum: 10th digit does not match checksum");

        return Result<TaxCode>.Success(new TaxCode(value));
    }

    public bool IsParentOf(TaxCode other)
    {
        var parts = other.Value.Split('-');
        return parts.Length == 2 && parts[0] == Value;
    }

    public static bool ValidateChecksum(string tenDigits)
    {
        if (tenDigits.Length != 10) return false;
        int[] weights = [31, 29, 23, 19, 17, 13, 11, 7, 5];
        int sum = 0;
        for (int i = 0; i < 9; i++)
            sum += (tenDigits[i] - '0') * weights[i];
        int checksum = (10 - sum % 10) % 10;
        return checksum == tenDigits[9] - '0';
    }

    public bool Equals(TaxCode? other) => other is not null && Value == other.Value;
    public override bool Equals(object? obj) => obj is TaxCode other && Equals(other);
    public override int GetHashCode() => Value.GetHashCode();
    public override string ToString() => Value;
    public static implicit operator string(TaxCode code) => code.Value;

    [GeneratedRegex(@"^\d{10}(-\d{3})?$")]
    private static partial Regex TaxCodeRegex();
}
