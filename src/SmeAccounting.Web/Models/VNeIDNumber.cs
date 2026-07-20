using System.Text.RegularExpressions;

namespace SmeAccounting.Web.Models;

public partial class VNeIDNumber : IEquatable<VNeIDNumber>
{
    private static readonly Regex Cccd12Regex = Cccd12Pattern();
    private static readonly Regex Cmnd9Regex = Cmnd9Pattern();

    public string Value { get; }
    public bool IsNewFormat => Value.Length == 12;

    private VNeIDNumber(string value) => Value = value;

    public static Result<VNeIDNumber> Create(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return Result<VNeIDNumber>.Failure("VNeID/CCCD number required");

        if (Cccd12Regex.IsMatch(value))
            return Result<VNeIDNumber>.Success(new VNeIDNumber(value));

        if (Cmnd9Regex.IsMatch(value))
            return Result<VNeIDNumber>.Success(new VNeIDNumber(value));

        return Result<VNeIDNumber>.Failure("VNeID number must be 12 digits (CCCD) or 9 digits (CMND)");
    }

    public bool Equals(VNeIDNumber? other) => other is not null && Value == other.Value;
    public override bool Equals(object? obj) => obj is VNeIDNumber other && Equals(other);
    public override int GetHashCode() => Value.GetHashCode();
    public override string ToString() => Value;
    public static implicit operator string(VNeIDNumber number) => number.Value;

    [GeneratedRegex(@"^\d{12}$")]
    private static partial Regex Cccd12Pattern();

    [GeneratedRegex(@"^\d{9}$")]
    private static partial Regex Cmnd9Pattern();
}
