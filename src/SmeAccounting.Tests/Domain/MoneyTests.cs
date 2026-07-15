using SmeAccounting.Domain.ValueObjects;
using FluentAssertions;

namespace SmeAccounting.Tests.Domain;

public class MoneyTests
{
    [Fact]
    public void CreateMoney_SetsAmountAndCurrency()
    {
        var money = new Money(100m, "USD");
        money.Amount.Should().Be(100m);
        money.CurrencyCode.Should().Be("USD");
    }

    [Fact]
    public void Add_SameCurrency_ReturnsSum()
    {
        var a = new Money(100m, "USD");
        var b = new Money(50m, "USD");
        var result = a.Add(b);
        result.Amount.Should().Be(150m);
    }

    [Fact]
    public void Add_DifferentCurrency_Throws()
    {
        var a = new Money(100m, "USD");
        var b = new Money(50m, "EUR");
        var act = () => a.Add(b);
        act.Should().Throw<InvalidOperationException>().WithMessage("*Currency mismatch*");
    }

    [Fact]
    public void Subtract_SameCurrency_ReturnsDifference()
    {
        var a = new Money(100m, "USD");
        var b = new Money(30m, "USD");
        var result = a.Subtract(b);
        result.Amount.Should().Be(70m);
    }

    [Fact]
    public void Subtract_DifferentCurrency_Throws()
    {
        var a = new Money(100m, "USD");
        var b = new Money(30m, "EUR");
        var act = () => a.Subtract(b);
        act.Should().Throw<InvalidOperationException>().WithMessage("*Currency mismatch*");
    }

    [Fact]
    public void Negate_ReturnsNegative()
    {
        var money = new Money(100m, "USD");
        var result = money.Negate();
        result.Amount.Should().Be(-100m);
    }

    [Fact]
    public void Zero_ReturnsZeroInDefaultCurrency()
    {
        var zero = Money.Zero();
        zero.Amount.Should().Be(0);
        zero.CurrencyCode.Should().Be("USD");
    }
}
