using SmeAccounting.Domain.ValueObjects;

namespace SmeAccounting.Domain.UnitTests.ValueObjects;

public class MoneyTests
{
    [Fact]
    public void Add_SameCurrency_ReturnsSum()
    {
        var a = new Money(100, "VND");
        var b = new Money(50, "VND");
        a.Add(b).Should().Be(new Money(150, "VND"));
    }

    [Fact]
    public void Add_DifferentCurrency_ThrowsArgumentException()
    {
        var a = new Money(100, "VND");
        var b = new Money(50, "USD");
        var act = () => a.Add(b);
        act.Should().Throw<ArgumentException>();
    }

    [Fact]
    public void Add_Null_ThrowsArgumentNullException()
    {
        var a = new Money(100, "VND");
        var act = () => a.Add(null!);
        act.Should().Throw<ArgumentNullException>();
    }

    [Fact]
    public void Subtract_SameCurrency_ReturnsDifference()
    {
        var a = new Money(100, "VND");
        var b = new Money(30, "VND");
        a.Subtract(b).Should().Be(new Money(70, "VND"));
    }

    [Fact]
    public void Subtract_DifferentCurrency_ThrowsArgumentException()
    {
        var a = new Money(100, "VND");
        var b = new Money(50, "USD");
        var act = () => a.Subtract(b);
        act.Should().Throw<ArgumentException>();
    }

    [Fact]
    public void Subtract_Null_ThrowsArgumentNullException()
    {
        var a = new Money(100, "VND");
        var act = () => a.Subtract(null!);
        act.Should().Throw<ArgumentNullException>();
    }

    [Fact]
    public void Negate_ReturnsNegativeAmount()
    {
        var money = new Money(100, "VND");
        money.Negate().Should().Be(new Money(-100, "VND"));
    }

    [Fact]
    public void Zero_ReturnsZeroMoney()
    {
        Money.Zero("VND").Should().Be(new Money(0, "VND"));
    }

    [Fact]
    public void Zero_DefaultsTo_USD()
    {
        Money.Zero().Should().Be(new Money(0, "USD"));
    }

    [Fact]
    public void Equality_SameAmountAndCurrency_AreEqual()
    {
        var a = new Money(100, "VND");
        var b = new Money(100, "VND");
        a.Should().Be(b);
    }

    [Fact]
    public void Equality_DifferentCurrency_AreNotEqual()
    {
        var a = new Money(100, "VND");
        var b = new Money(100, "USD");
        a.Should().NotBe(b);
    }
}
