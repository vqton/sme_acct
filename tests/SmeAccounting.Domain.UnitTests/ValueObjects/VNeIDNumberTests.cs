using FluentAssertions;
using SmeAccounting.Web.Models;

namespace SmeAccounting.Domain.UnitTests.ValueObjects;

public class VNeIDNumberTests
{
    [Fact]
    public void Create_12Digits_ReturnsInstance()
    {
        var result = VNeIDNumber.Create("001234567890");
        result.IsSuccess.Should().BeTrue();
        result.Value.IsNewFormat.Should().BeTrue();
    }

    [Fact]
    public void Create_9Digits_ReturnsInstance()
    {
        var result = VNeIDNumber.Create("123456789");
        result.IsSuccess.Should().BeTrue();
        result.Value.IsNewFormat.Should().BeFalse();
    }

    [Theory]
    [InlineData("")]
    [InlineData(" ")]
    [InlineData(null)]
    [InlineData("abc")]
    [InlineData("12345678")]
    [InlineData("1234567")]
    [InlineData("12345678901")]
    [InlineData("1234567890123")]
    public void Create_InvalidFormat_ReturnsFailure(string? value)
    {
        var result = VNeIDNumber.Create(value!);
        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Contain("VNeID");
    }

    [Fact]
    public void Equals_SameValue_AreEqual()
    {
        var v1 = VNeIDNumber.Create("001234567890").Value;
        var v2 = VNeIDNumber.Create("001234567890").Value;
        v1.Should().Be(v2);
    }

    [Fact]
    public void ToString_ReturnsValue()
    {
        var v = VNeIDNumber.Create("001234567890").Value;
        v.ToString().Should().Be("001234567890");
    }
}
