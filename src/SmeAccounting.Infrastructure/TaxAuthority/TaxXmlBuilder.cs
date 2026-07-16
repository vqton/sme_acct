using System.Xml.Linq;

namespace SmeAccounting.Infrastructure.TaxAuthority;

public sealed class TaxXmlBuilder
{
    public string BuildMonthlyDeclaration(string taxCode, int month, int year, decimal revenue, decimal taxAmount)
    {
        return new XDocument(
            new XElement("TaxDeclaration",
                new XAttribute("xmlns", "http://tax.gov.vn/etax"),
                new XElement("Header",
                    new XElement("TaxCode", taxCode),
                    new XElement("Period", $"{year:D4}-{month:D2}"),
                    new XElement("Type", "MONTHLY"),
                    new XElement("SubmittedDate", DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ"))
                ),
                new XElement("Financials",
                    new XElement("Revenue", revenue.ToString("F2")),
                    new XElement("TaxAmount", taxAmount.ToString("F2")),
                    new XElement("Penalty", "0.00"),
                    new XElement("TotalDue", (revenue + taxAmount).ToString("F2"))
                ),
                new XElement("Signature",
                    new XElement("SignedBy", taxCode),
                    new XElement("SignedAt", DateTime.UtcNow.ToString("O"))
                )
            )
        ).ToString(SaveOptions.DisableFormatting);
    }
}
