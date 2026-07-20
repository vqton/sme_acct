using System.Text.RegularExpressions;

namespace SmeAccounting.Web.Models;

public partial class Address : IEquatable<Address>
{
    public string Street { get; }
    public string ProvinceId { get; }
    public string DistrictId { get; }
    public string WardId { get; }

    private Address(string street, string provinceId, string districtId, string wardId)
    {
        Street = street;
        ProvinceId = provinceId;
        DistrictId = districtId;
        WardId = wardId;
    }

    public override string ToString() => $"{Street}, {WardId}, {DistrictId}, {ProvinceId}";

    public static Result<Address> Create(string street, string provinceId, string districtId, string wardId)
    {
        if (string.IsNullOrWhiteSpace(street) || street.Length > 500)
            return Result<Address>.Failure("Street address required, max 500 chars");

        if (string.IsNullOrWhiteSpace(provinceId))
            return Result<Address>.Failure("Province required");

        if (string.IsNullOrWhiteSpace(districtId))
            return Result<Address>.Failure("District required");

        if (string.IsNullOrWhiteSpace(wardId))
            return Result<Address>.Failure("Ward required");

        return Result<Address>.Success(new Address(street, provinceId, districtId, wardId));
    }

    public bool Equals(Address? other) =>
        other is not null && Street == other.Street && ProvinceId == other.ProvinceId
            && DistrictId == other.DistrictId && WardId == other.WardId;

    public override bool Equals(object? obj) => obj is Address other && Equals(other);
    public override int GetHashCode() => HashCode.Combine(Street, ProvinceId, DistrictId, WardId);
}
