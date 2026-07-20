using FluentAssertions;
using SmeAccounting.Web.Models;

namespace SmeAccounting.Domain.UnitTests.Enums;

public class CompanyEnumsTests
{
    [Fact]
    public void CompanyType_HasExpectedValues()
    {
        var values = Enum.GetValues<CompanyType>();
        values.Should().HaveCount(12);
        values.Should().Contain(CompanyType.CongTyTNHH1TV);
        values.Should().Contain(CompanyType.CongTyTNHH2TV);
        values.Should().Contain(CompanyType.CongTyCoPhan);
        values.Should().Contain(CompanyType.DoanhNghiepTuNhan);
        values.Should().Contain(CompanyType.CongTyHopDanh);
        values.Should().Contain(CompanyType.DoanhNghiepCoVonDauTuNN);
        values.Should().Contain(CompanyType.HopTacXa);
        values.Should().Contain(CompanyType.VanPhongLuatSu);
        values.Should().Contain(CompanyType.ChiNhanh);
        values.Should().Contain(CompanyType.VanPhongDaiDien);
        values.Should().Contain(CompanyType.HoKinhDoanh);
        values.Should().Contain(CompanyType.Other);
    }

    [Fact]
    public void CompanyType_IntValues_MatchSpec()
    {
        ((int)CompanyType.CongTyTNHH1TV).Should().Be(1);
        ((int)CompanyType.CongTyTNHH2TV).Should().Be(2);
        ((int)CompanyType.CongTyCoPhan).Should().Be(3);
        ((int)CompanyType.DoanhNghiepTuNhan).Should().Be(4);
        ((int)CompanyType.CongTyHopDanh).Should().Be(5);
        ((int)CompanyType.Other).Should().Be(99);
    }

    [Fact]
    public void CompanyType_CongTyTNHH1TV_HasExpectedDisplay()
    {
        CompanyType.CongTyTNHH1TV.ToString().Should().Be("CongTyTNHH1TV");
    }
}

public class CompanyStatusTests
{
    [Fact]
    public void CompanyStatus_HasExpectedValues()
    {
        var values = Enum.GetValues<CompanyStatus>();
        values.Should().HaveCount(6);
        values.Should().Contain(CompanyStatus.Active);
        values.Should().Contain(CompanyStatus.Suspended);
        values.Should().Contain(CompanyStatus.Dissolved);
        values.Should().Contain(CompanyStatus.Bankrupt);
        values.Should().Contain(CompanyStatus.Converting);
        values.Should().Contain(CompanyStatus.Merged);
    }

    [Fact]
    public void CompanyStatus_Active_IsDefault()
    {
        ((int)CompanyStatus.Active).Should().Be(1);
    }

    [Fact]
    public void CompanyStatus_Suspended_NotActive()
    {
        var status = CompanyStatus.Suspended;
        status.Should().NotBe(CompanyStatus.Active);
    }
}

public class AccountingRegimeTests
{
    [Fact]
    public void AccountingRegime_HasExpectedValues()
    {
        var values = Enum.GetValues<AccountingRegime>();
        values.Should().HaveCount(2);
        values.Should().Contain(AccountingRegime.TT99);
        values.Should().Contain(AccountingRegime.TT133);
    }

    [Fact]
    public void AccountingRegime_TT99_IsDefault()
    {
        ((int)AccountingRegime.TT99).Should().Be(1);
    }

}

public class TaxCalculationMethodTests
{
    [Fact]
    public void TaxCalculationMethod_HasExpectedValues()
    {
        var values = Enum.GetValues<TaxCalculationMethod>();
        values.Should().HaveCount(4);
        values.Should().Contain(TaxCalculationMethod.KhauTru);
        values.Should().Contain(TaxCalculationMethod.TrucTiep);
        values.Should().Contain(TaxCalculationMethod.TrucTiepTrenDoanhThu);
        values.Should().Contain(TaxCalculationMethod.HonHop);
    }
}

public class InventoryMethodTests
{
    [Fact]
    public void InventoryMethod_HasExpectedValues()
    {
        var values = Enum.GetValues<InventoryMethod>();
        values.Should().HaveCount(4);
        values.Should().Contain(InventoryMethod.FIFO);
        values.Should().Contain(InventoryMethod.BinhQuanGiaQuyen);
        values.Should().Contain(InventoryMethod.ThucTeDichDanh);
        values.Should().Contain(InventoryMethod.NhapTruocXuatSau);
    }
}

public class RoundingMethodTests
{
    [Fact]
    public void RoundingMethod_HasExpectedValues()
    {
        var values = Enum.GetValues<RoundingMethod>();
        values.Should().HaveCount(3);
        values.Should().Contain(RoundingMethod.RoundHalfUp);
        values.Should().Contain(RoundingMethod.RoundDown);
        values.Should().Contain(RoundingMethod.RoundUp);
    }
}

public class ExchangeRateSourceTests
{
    [Fact]
    public void ExchangeRateSource_HasExpectedValues()
    {
        var values = Enum.GetValues<ExchangeRateSource>();
        values.Should().HaveCount(3);
        values.Should().Contain(ExchangeRateSource.StateBank);
        values.Should().Contain(ExchangeRateSource.CommercialBank);
        values.Should().Contain(ExchangeRateSource.Interbank);
    }
}

public class CompanyLicenseTypeTests
{
    [Fact]
    public void CompanyLicenseType_HasExpectedValues()
    {
        var values = Enum.GetValues<CompanyLicenseType>();
        values.Should().HaveCount(5);
    }
}

public class DocumentTypeTests
{
    [Fact]
    public void DocumentType_HasExpectedValues()
    {
        var values = Enum.GetValues<DocumentType>();
        values.Should().HaveCount(5);
    }
}
