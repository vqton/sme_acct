namespace SmeAccounting.Infrastructure.VNeID;

public sealed class VNeIDOptions
{
    public const string SectionName = "VNeID";
    public string BaseUrl { get; set; } = "https://api.vneid.gov.vn";
    public string ApiKey { get; set; } = string.Empty;
    public int TimeoutSeconds { get; set; } = 30;
}
