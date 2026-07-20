using FluentAssertions;
using SmeAccounting.Web.Models;

namespace SmeAccounting.Domain.UnitTests.ValueObjects;

public class TaxCodeTests
{
    private static readonly Random _rng = new(42);

    private static string ValidChecksumCode()
    {
        while (true)
        {
            var digits = new char[9];
            for (int i = 0; i < 9; i++) digits[i] = (char)('0' + _rng.Next(0, 10));
            var code = new string(digits);
            int[] weights = [31, 29, 23, 19, 17, 13, 11, 7, 5];
            int sum = 0;
            for (int i = 0; i < 9; i++) sum += (digits[i] - '0') * weights[i];
            int checksum = (10 - sum % 10) % 10;
            return code + checksum;
        }
    }

    private static readonly string _validTaxCode = ValidChecksumCode();
    private static readonly string _validBranchCode = $"{_validTaxCode}-001";
    private static readonly string _otherTaxCode = ValidChecksumCode();

    [Fact]
    public void Create_ValidTaxCode_ReturnsInstance()
    {
        var result = TaxCode.Create(_validTaxCode);
        result.IsSuccess.Should().BeTrue();
        result.Value.Value.Should().Be(_validTaxCode);
    }

    [Fact]
    public void Create_ValidBranchCode_ReturnsInstance()
    {
        var result = TaxCode.Create(_validBranchCode);
        result.IsSuccess.Should().BeTrue();
        result.Value.Value.Should().Be(_validBranchCode);
    }

    [Theory]
    [InlineData("")]
    [InlineData(" ")]
    [InlineData(null)]
    [InlineData("abc")]
    [InlineData("12345")]
    [InlineData("12345678901234")]
    [InlineData("1234567890-00")]
    [InlineData("1234567890-1234")]
    public void Create_InvalidFormat_ReturnsFailure(string? code)
    {
        var result = TaxCode.Create(code!);
        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Contain("format");
    }

    [Fact]
    public void Create_InvalidChecksum_ReturnsFailure()
    {
        var code = "1111111111"; // sum = 10*1*155 = 155? No, 1*31+1*29+... let me compute
        var result = TaxCode.Create(code);
        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Contain("checksum");
    }

    [Fact]
    public void Equals_SameValue_AreEqual()
    {
        var tc1 = TaxCode.Create(_validTaxCode).Value;
        var tc2 = TaxCode.Create(_validTaxCode).Value;
        tc1.Should().Be(tc2);
    }

    [Fact]
    public void Equals_DifferentValue_AreNotEqual()
    {
        var tc1 = TaxCode.Create(_validTaxCode).Value;
        var tc2 = TaxCode.Create(_otherTaxCode).Value;
        tc1.Should().NotBe(tc2);
    }

    [Fact]
    public void ToString_ReturnsValue()
    {
        var tc = TaxCode.Create(_validTaxCode).Value;
        tc.ToString().Should().Be(_validTaxCode);
    }

    [Fact]
    public void ImplicitConversion_ToString_Works()
    {
        var tc = TaxCode.Create(_validTaxCode).Value;
        string s = tc;
        s.Should().Be(_validTaxCode);
    }

    [Fact]
    public void IsParentOf_CodeWithMatchingPrefix_ReturnsTrue()
    {
        var parent = TaxCode.Create(_validTaxCode).Value;
        var branch = TaxCode.Create(_validBranchCode).Value;
        parent.IsParentOf(branch).Should().BeTrue();
    }

    [Fact]
    public void IsParentOf_CodeWithDifferentPrefix_ReturnsFalse()
    {
        var parent = TaxCode.Create(_validTaxCode).Value;
        var branch = TaxCode.Create($"{_otherTaxCode}-001").Value;
        parent.IsParentOf(branch).Should().BeFalse();
    }
}


