using System.Text;
using System.Xml.Linq;

namespace SmeAccounting.Infrastructure.EInvoice;

public sealed class InvoiceXmlBuilder
{
    public string BuildInvoice(string supplierTaxCode, string buyerTaxCode, decimal amount, string currency = "VND")
    {
        var doc = new XDocument(
            new XElement("Invoice",
                new XAttribute("xmlns", "http://invoice.gov.vn/nd254"),
                new XElement("Header",
                    new XElement("InvoiceNumber", Guid.NewGuid().ToString("N")[..10]),
                    new XElement("InvoiceDate", DateTime.UtcNow.ToString("yyyy-MM-dd")),
                    new XElement("Currency", currency),
                    new XElement("SupplierTaxCode", supplierTaxCode),
                    new XElement("BuyerTaxCode", buyerTaxCode)
                ),
                new XElement("LineItems",
                    new XElement("LineItem",
                        new XElement("Description", "Goods/Services"),
                        new XElement("Amount", amount.ToString("F2")),
                        new XElement("TaxAmount", (amount * 0.1m).ToString("F2")),
                        new XElement("TotalAmount", (amount * 1.1m).ToString("F2"))
                    )
                ),
                new XElement("Summary",
                    new XElement("TotalAmount", (amount * 1.1m).ToString("F2")),
                    new XElement("TotalTax", (amount * 0.1m).ToString("F2"))
                )
            )
        );

        return doc.Declaration is not null
            ? doc.Declaration.ToString() + Environment.NewLine + doc.ToString(SaveOptions.DisableFormatting)
            : doc.ToString(SaveOptions.DisableFormatting);
    }
}
