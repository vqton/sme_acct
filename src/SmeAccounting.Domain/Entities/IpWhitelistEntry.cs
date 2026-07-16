using System.Net;

namespace SmeAccounting.Domain.Entities;

public class IpWhitelistEntry : BaseEntity
{
    public Guid CompanyId { get; private set; }
    public Company Company { get; private set; } = null!;
    public string IpAddressOrRange { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public bool IsActive { get; private set; } = true;

    private IpWhitelistEntry() { }

    public IpWhitelistEntry(Guid companyId, string ipAddressOrRange, string? description = null)
    {
        CompanyId = companyId;
        IpAddressOrRange = ipAddressOrRange;
        Description = description;
    }

    public bool Matches(string ipAddress)
    {
        if (!IPAddress.TryParse(ipAddress, out var addr))
            return false;

        if (IpAddressOrRange.Contains('/'))
        {
            var parts = IpAddressOrRange.Split('/');
            if (parts.Length == 2 && IPAddress.TryParse(parts[0], out var networkAddr)
                && int.TryParse(parts[1], out var prefix))
            {
                var networkBytes = networkAddr.GetAddressBytes();
                var addrBytes = addr.GetAddressBytes();
                if (networkBytes.Length != addrBytes.Length)
                    return false;
                var prefixBytes = prefix / 8;
                var remainingBits = prefix % 8;
                for (var i = 0; i < prefixBytes; i++)
                    if (networkBytes[i] != addrBytes[i])
                        return false;
                if (remainingBits > 0)
                {
                    var mask = (byte)(0xFF << (8 - remainingBits));
                    if ((networkBytes[prefixBytes] & mask) != (addrBytes[prefixBytes] & mask))
                        return false;
                }
                return true;
            }
        }

        return string.Equals(IpAddressOrRange, ipAddress, StringComparison.OrdinalIgnoreCase);
    }
}
