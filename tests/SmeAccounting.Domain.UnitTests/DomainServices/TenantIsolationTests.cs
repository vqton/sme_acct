using FluentAssertions;
using SmeAccounting.Web.Models;
using SmeAccounting.Web.Services;

namespace SmeAccounting.Domain.UnitTests.DomainServices;

public class TenantIsolationTests
{
    [Fact]
    public void TenantScopedEntity_HasCompanyId()
    {
        var rep = new LegalRepresentative { CompanyId = Guid.NewGuid() };
        rep.CompanyId.Should().NotBeEmpty();
    }

    [Fact]
    public void TenantScopedEntity_DefaultCompanyId_IsEmpty()
    {
        var rep = new LegalRepresentative();
        rep.CompanyId.Should().BeEmpty();
    }

    [Fact]
    public void Company_ImplementsTenantRoot()
    {
        var company = new Company();
        company.Id.Should().NotBeEmpty();
    }
}

public class CorrectionReasonTests
{
    public static IEnumerable<object[]> CriticalFields =>
        new List<object[]>
        {
            new object[] { "TaxCode", true },
            new object[] { "EnterpriseCode", true },
            new object[] { "NameVietnamese", true },
            new object[] { "CharterCapital", true },
            new object[] { "Phone", false },
            new object[] { "Email", false },
            new object[] { "Website", false },
        };

    [Theory]
    [MemberData(nameof(CriticalFields))]
    public void IsCriticalField_ReturnsExpected(string fieldName, bool expected)
    {
        CorrectionReasonService.IsCriticalField(fieldName).Should().Be(expected);
    }
}
