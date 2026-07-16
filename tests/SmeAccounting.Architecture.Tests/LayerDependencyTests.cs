using System.Reflection;
using FluentAssertions;
using NetArchTest.Rules;
using SmeAccounting.Domain.Entities;
using SmeAccounting.Web.Controllers;

namespace SmeAccounting.Architecture.Tests;

public class LayerDependencyTests
{
    private static readonly Assembly DomainAssembly = typeof(BaseEntity).Assembly;
    private static readonly Assembly ApplicationAssembly = typeof(Application.DependencyInjection).Assembly;
    private static readonly Assembly WebAssembly = typeof(AuthController).Assembly;

    [Fact]
    public void Domain_ShouldNotReference_ApplicationOrInfrastructure()
    {
        var result = Types.InAssembly(DomainAssembly)
            .Should().NotHaveDependencyOnAny("SmeAccounting.Application", "SmeAccounting.Infrastructure")
            .GetResult();
        result.IsSuccessful.Should().BeTrue();
    }

    [Fact]
    public void Application_ShouldNotReference_Infrastructure()
    {
        var result = Types.InAssembly(ApplicationAssembly)
            .Should().NotHaveDependencyOn("SmeAccounting.Infrastructure")
            .GetResult();
        result.IsSuccessful.Should().BeTrue();
    }

    [Fact]
    public void Handlers_ShouldBeInternalAndSealed()
    {
        var result = Types.InAssembly(ApplicationAssembly)
            .That().HaveNameEndingWith("Handler")
            .Should().BeSealed()
            .GetResult();
        result.IsSuccessful.Should().BeTrue();
    }

    [Fact]
    public void Entities_ShouldNotHavePublicSetters()
    {
        var entityTypes = DomainAssembly.GetTypes()
            .Where(t => t.IsClass && !t.IsAbstract && t.IsSubclassOf(typeof(BaseEntity)));

        var failingTypes = entityTypes
            .Select(t => new
            {
                Type = t,
                PublicSetters = t.GetProperties(BindingFlags.Public | BindingFlags.Instance | BindingFlags.DeclaredOnly)
                    .Where(p => p.GetSetMethod()?.IsPublic == true)
                    .Select(p => p.Name)
                    .ToList()
            })
            .Where(x => x.PublicSetters.Count != 0)
            .ToList();

        failingTypes.Should().BeEmpty($"Entities should not have public setters. Found: {string.Join(", ", failingTypes.Select(x => $"{x.Type.Name}.{string.Join(",", x.PublicSetters)}"))}");
    }

    [Fact]
    public void Controllers_ShouldNotDirectlyDependOn_Infrastructure()
    {
        var result = Types.InAssembly(WebAssembly)
            .That().HaveNameEndingWith("Controller")
            .Should().NotHaveDependencyOn("SmeAccounting.Infrastructure")
            .GetResult();
        result.IsSuccessful.Should().BeTrue(result.ToString());
    }

    [Fact]
    public void Controllers_ShouldHavePostfix_Controller()
    {
        var result = Types.InAssembly(WebAssembly)
            .That().AreClasses()
            .And().HaveNameEndingWith("Controller")
            .Should().ResideInNamespace("SmeAccounting.Web.Controllers")
            .GetResult();
        result.IsSuccessful.Should().BeTrue(result.ToString());
    }

    [Fact]
    public void Domain_ShouldNotUse_MediatR()
    {
        var result = Types.InAssembly(DomainAssembly)
            .Should().NotHaveDependencyOn("MediatR")
            .GetResult();
        result.IsSuccessful.Should().BeTrue(result.ToString());
    }
}
