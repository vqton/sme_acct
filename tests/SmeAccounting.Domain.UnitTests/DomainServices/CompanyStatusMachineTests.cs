using FluentAssertions;
using SmeAccounting.Web.Models;
using SmeAccounting.Web.Services;

namespace SmeAccounting.Domain.UnitTests.DomainServices;

public class CompanyStatusMachineTests
{
    [Theory]
    [InlineData(CompanyStatus.Active, CompanyStatus.Suspended, true)]
    [InlineData(CompanyStatus.Active, CompanyStatus.Dissolved, true)]
    [InlineData(CompanyStatus.Suspended, CompanyStatus.Active, true)]
    [InlineData(CompanyStatus.Suspended, CompanyStatus.Dissolved, true)]
    [InlineData(CompanyStatus.Active, CompanyStatus.Bankrupt, true)]
    [InlineData(CompanyStatus.Dissolved, CompanyStatus.Active, false)]
    [InlineData(CompanyStatus.Dissolved, CompanyStatus.Suspended, false)]
    [InlineData(CompanyStatus.Bankrupt, CompanyStatus.Active, false)]
    [InlineData(CompanyStatus.Active, CompanyStatus.Converting, true)]
    [InlineData(CompanyStatus.Converting, CompanyStatus.Active, true)]
    [InlineData(CompanyStatus.Converting, CompanyStatus.Dissolved, true)]
    public void CanTransition_StatePair_ReturnsExpected(CompanyStatus from, CompanyStatus to, bool expected)
    {
        CompanyStatusMachine.CanTransition(from, to).Should().Be(expected);
    }

    [Fact]
    public void CanTransition_SameState_ReturnsFalse()
    {
        CompanyStatusMachine.CanTransition(CompanyStatus.Active, CompanyStatus.Active).Should().BeFalse();
    }

    [Fact]
    public void CanTransition_InvalidTransition_ReturnsFalse()
    {
        CompanyStatusMachine.CanTransition(CompanyStatus.Dissolved, CompanyStatus.Active).Should().BeFalse();
    }

    [Fact]
    public void CanTransition_SuspendedToActive_IsPermitted()
    {
        CompanyStatusMachine.CanTransition(CompanyStatus.Suspended, CompanyStatus.Active).Should().BeTrue();
    }

    [Fact]
    public void CanTransition_ActiveToDissolved_IsPermitted()
    {
        CompanyStatusMachine.CanTransition(CompanyStatus.Active, CompanyStatus.Dissolved).Should().BeTrue();
    }

    [Fact]
    public void AllowedTransitions_FromActive_ReturnsAllTargets()
    {
        var allowed = CompanyStatusMachine.GetAllowedTransitions(CompanyStatus.Active);
        allowed.Should().Contain(new[] { CompanyStatus.Suspended, CompanyStatus.Dissolved, CompanyStatus.Bankrupt, CompanyStatus.Converting });
    }

    [Fact]
    public void AllowedTransitions_FromSuspended_ReturnsActiveAndDissolved()
    {
        var allowed = CompanyStatusMachine.GetAllowedTransitions(CompanyStatus.Suspended);
        allowed.Should().Contain(new[] { CompanyStatus.Active, CompanyStatus.Dissolved });
    }

    [Fact]
    public void AllowedTransitions_FromDissolved_ReturnsEmpty()
    {
        var allowed = CompanyStatusMachine.GetAllowedTransitions(CompanyStatus.Dissolved);
        allowed.Should().BeEmpty();
    }

    [Fact]
    public void AllowedTransitions_FromBankrupt_ReturnsEmpty()
    {
        var allowed = CompanyStatusMachine.GetAllowedTransitions(CompanyStatus.Bankrupt);
        allowed.Should().BeEmpty();
    }
}
