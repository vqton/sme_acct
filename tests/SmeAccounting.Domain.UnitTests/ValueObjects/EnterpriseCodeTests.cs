using FluentAssertions;
using SmeAccounting.Web.Models;

namespace SmeAccounting.Domain.UnitTests.ValueObjects;

public class EnterpriseCodeTests
{
    [Theory]
    [InlineData("1234567890")]
    [InlineData("0103456789")]
    [InlineData("9999999999")]
    public void Create_ValidCode_ReturnsInstance(string code)
    {
        var result = EnterpriseCode.Create(code);
        result.IsSuccess.Should().BeTrue();
        result.Value.Value.Should().Be(code);
    }

    [Theory]
    [InlineData("")]
    [InlineData(" ")]
    [InlineData(null)]
    [InlineData("abc")]
    [InlineData("123456789")]
    [InlineData("12345678901")]
    [InlineData("123456789a")]
    public void Create_InvalidFormat_ReturnsFailure(string? code)
    {
        var result = EnterpriseCode.Create(code!);
        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Contain("Enterprise");
    }

    [Fact]
    public void Equals_SameValue_AreEqual()
    {
        var c1 = EnterpriseCode.Create("1234567890").Value;
        var c2 = EnterpriseCode.Create("1234567890").Value;
        c1.Should().Be(c2);
    }

    [Fact]
    public void ToString_ReturnsValue()
    {
        var c = EnterpriseCode.Create("1234567890").Value;
        c.ToString().Should().Be("1234567890");
    }
}
